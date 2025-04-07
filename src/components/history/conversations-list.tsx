"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { MessageSquare, Pin, Archive, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useAuth } from "@/lib/auth/auth-context";

interface ConversationsListProps {
  filterType: 'all' | 'pinned' | 'archived';
  searchQuery: string;
  selectedDate?: Date;
  locale: string;
}

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  is_archived: boolean;
  message_count: number;
};

export function ConversationsList({ 
  filterType, 
  searchQuery,
  selectedDate,
  locale 
}: ConversationsListProps) {
  const { user } = useAuth();
  const t = useTranslations("History");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const isRtl = locale === "ar";
  const dateLocale = locale === "ar" ? ar : enUS;
  const supabase = createClient();

  useEffect(() => {
    async function fetchConversations() {
      if (!user?.id) return;
      
      setLoading(true);
      
      try {
        // Start building the query
        let query = supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id);
        
        // Apply filters based on filterType
        if (filterType === 'pinned') {
          query = query.eq('is_pinned', true);
        } else if (filterType === 'archived') {
          query = query.eq('is_archived', true);
        } else if (filterType === 'all') {
          // For 'all', we exclude archived items
          query = query.eq('is_archived', false);
        }
        
        // Apply search filter if provided
        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }
        
        // Apply date filter if selected
        if (selectedDate) {
          const startOfDay = new Date(selectedDate);
          startOfDay.setHours(0, 0, 0, 0);
          
          const endOfDay = new Date(selectedDate);
          endOfDay.setHours(23, 59, 59, 999);
          
          query = query
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString());
        }
        
        // Order by pinned first, then by updated_at
        const { data, error } = await query
          .order('is_pinned', { ascending: false })
          .order('updated_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching conversations:', error);
          return;
        }
        
        setConversations(data || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchConversations();
  }, [user, filterType, searchQuery, selectedDate, supabase]);

  const handlePinToggle = async (id: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ is_pinned: !currentPinned })
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === id ? { ...conv, is_pinned: !currentPinned } : conv
        )
      );
    } catch (error) {
      console.error('Error toggling pin status:', error);
    }
  };

  const handleArchiveToggle = async (id: string, currentArchived: boolean) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ is_archived: !currentArchived })
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      // Update local state or remove from list if filter doesn't match anymore
      if (filterType === 'archived' && !currentArchived) {
        // If unarchiving from the archived tab, keep it visible
        setConversations(prev => 
          prev.map(conv => 
            conv.id === id ? { ...conv, is_archived: !currentArchived } : conv
          )
        );
      } else if (filterType === 'all' && currentArchived === false) {
        // If archiving from the all tab, remove it
        setConversations(prev => prev.filter(conv => conv.id !== id));
      } else {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === id ? { ...conv, is_archived: !currentArchived } : conv
          )
        );
      }
    } catch (error) {
      console.error('Error toggling archive status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("deleteConfirmation"))) return;
    
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      // Remove from local state
      setConversations(prev => prev.filter(conv => conv.id !== id));
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="border border-border">
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="pb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card className="border border-border bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{t("noConversationsTitle")}</h3>
          <p className="text-muted-foreground mt-1 mb-6 max-w-md">
            {searchQuery || selectedDate 
              ? t("noMatchingConversations") 
              : filterType === 'pinned' 
                ? t("noPinnedConversations") 
                : filterType === 'archived' 
                  ? t("noArchivedConversations") 
                  : t("noConversationsDescription")}
          </p>
          <Button asChild>
            <Link href={`/${locale}/chat`} className={cn(
              "flex items-center gap-2",
              isRtl && "flex-row-reverse"
            )}>
              <MessageSquare className="h-4 w-4" />
              {t("startNewChat")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => {
        const formattedDate = format(
          new Date(conversation.updated_at), 
          'PPP', 
          { locale: dateLocale }
        );
        
        return (
          <Card 
            key={conversation.id} 
            className={cn(
              "border border-border transition-all hover:shadow-sm",
              conversation.is_pinned && "bg-primary/5 border-primary/20"
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className={cn(
                  "text-lg font-medium line-clamp-1",
                  isRtl && "text-right"
                )}>
                  {conversation.title || t("untitledConversation")}
                </CardTitle>
                {conversation.is_pinned && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {t("pinned")}
                  </Badge>
                )}
              </div>
              <CardDescription className={isRtl ? "text-right" : ""}>
                {formattedDate} • {t("messageCount", { count: conversation.message_count })}
              </CardDescription>
            </CardHeader>
            <CardFooter className={cn(
              "flex justify-between pt-4 pb-2",
              isRtl && "flex-row-reverse"
            )}>
              <div className="flex gap-2">
                <Button 
                  variant={conversation.is_pinned ? "secondary" : "ghost"} 
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handlePinToggle(conversation.id, conversation.is_pinned)}
                  title={conversation.is_pinned ? t("unpinConversation") : t("pinConversation")}
                >
                  <Pin className={cn(
                    "h-4 w-4", 
                    conversation.is_pinned && "fill-primary"
                  )} />
                  <span className="sr-only">
                    {conversation.is_pinned ? t("unpinConversation") : t("pinConversation")}
                  </span>
                </Button>
                <Button 
                  variant={conversation.is_archived ? "secondary" : "ghost"} 
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handleArchiveToggle(conversation.id, conversation.is_archived)}
                  title={conversation.is_archived ? t("unarchiveConversation") : t("archiveConversation")}
                >
                  <Archive className="h-4 w-4" />
                  <span className="sr-only">
                    {conversation.is_archived ? t("unarchiveConversation") : t("archiveConversation")}
                  </span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-9 w-9 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  onClick={() => handleDelete(conversation.id)}
                  title={t("deleteConversation")}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">{t("deleteConversation")}</span>
                </Button>
              </div>
              <Button asChild variant="outline">
                <Link 
                  href={`/${locale}/chat/${conversation.id}`}
                  className={cn(
                    "flex items-center gap-2",
                    isRtl && "flex-row-reverse"
                  )}
                >
                  <ExternalLink className="h-4 w-4" />
                  {t("openConversation")}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
