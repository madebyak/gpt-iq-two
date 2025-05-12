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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConversationsListProps {
  filterType: 'all' | 'pinned' | 'archived';
  searchQuery: string;
  selectedDate?: Date;
  startDate?: Date;
  endDate?: Date;
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
  startDate,
  endDate,
  locale 
}: ConversationsListProps) {
  console.log('[DEBUG ConversationsList] Received props - startDate:', startDate);
  const { user } = useAuth();
  const t = useTranslations("History");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const isRtl = locale === "ar";
  const dateLocale = locale === "ar" ? ar : enUS;
  const supabase = createClient();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

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
        
        // Apply date range filter if provided
        if (startDate) {
          // const queryStart = new Date(startDate); // Old logic - to be removed
          // queryStart.setHours(0, 0, 0, 0); // Old logic - to be removed
          
          // const queryEnd = endDate ? new Date(endDate) : new Date(startDate); // Old logic - to be removed
          // queryEnd.setHours(23, 59, 59, 999); // Old logic - to be removed

          // --- Calculate start/end based on UTC components --- 
          const startYear = startDate.getFullYear();
          const startMonth = startDate.getMonth(); // 0-indexed
          const startDay = startDate.getDate();

          const utcStart = new Date(Date.UTC(startYear, startMonth, startDay, 0, 0, 0, 0));

          // Use end date if provided, otherwise use end of start date
          const endReferenceDate = endDate || startDate;
          const endYear = endReferenceDate.getFullYear();
          const endMonth = endReferenceDate.getMonth();
          const endDay = endReferenceDate.getDate();
          const utcEnd = new Date(Date.UTC(endYear, endMonth, endDay, 23, 59, 59, 999));
          // --- End UTC calculation --- 
          
          // --- Add console logs for debugging --- // add-line
          console.log('[DEBUG] Date Filter - UTC Start:', utcStart.toISOString()); // add-line
          console.log('[DEBUG] Date Filter - UTC End:', utcEnd.toISOString()); // add-line
          // --- End console logs --- // add-line

          query = query
            // .gte('created_at', queryStart.toISOString()) // Old logic - to be removed
            // .lte('created_at', queryEnd.toISOString()); // Old logic - to be removed
            .gte('created_at', utcStart.toISOString())
            .lte('created_at', utcEnd.toISOString());
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
  }, [user, filterType, searchQuery, startDate, endDate, supabase]);

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

  const executeDelete = async () => {
    if (!conversationToDelete) return;
    
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationToDelete)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setConversations(prev => prev.filter(conv => conv.id !== conversationToDelete));
    } catch (error) {
      console.error(`Error deleting conversation ${conversationToDelete}:`, error);
    } finally {
      setIsConfirmOpen(false);
      setConversationToDelete(null);
    }
  };

  const promptDeleteConfirmation = (id: string) => {
    setConversationToDelete(id);
    setIsConfirmOpen(true);
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
            {searchQuery || startDate 
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
          new Date(conversation.created_at),
          'd MMMM yyyy',
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
              <CardDescription className={cn(
                "flex items-center gap-x-1.5 text-xs text-muted-foreground",
                isRtl ? "flex-row-reverse justify-end" : "justify-start"
              )}>
                {isRtl ? (
                  <>
                    <span>{t("messageCount", { count: conversation.message_count })}</span>
                    <span>•</span>
                    <span>{formattedDate}</span>
                  </>
                ) : (
                  <>
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span>{t("messageCount", { count: conversation.message_count })}</span>
                  </>
                )}
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
                  onClick={() => promptDeleteConfirmation(conversation.id)}
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
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent dir={isRtl ? "rtl" : "ltr"}>
          <AlertDialogHeader>
            <AlertDialogTitle className={isRtl ? "text-right" : "text-left"}>
              {t("confirmDeleteTitle", { defaultValue: "Delete Conversation?" })}
            </AlertDialogTitle>
            <AlertDialogDescription className={isRtl ? "text-right" : "text-left"}>
              {t("confirmDeleteDescription", { defaultValue: "This action cannot be undone. This will permanently delete the conversation and all its messages." })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isRtl ? "flex-row-reverse" : ""}>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              {t("confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
