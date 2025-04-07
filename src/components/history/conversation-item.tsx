"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatDistanceToNow } from "date-fns";
import { arSA, enUS } from "date-fns/locale";
import { 
  MoreVertical, 
  Pin, 
  PinOff, 
  Archive, 
  ArchiveRestore, 
  Trash2,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  last_message_preview: string | null;
  last_message_timestamp: string | null;
  message_count: number;
  is_pinned: boolean;
  is_archived: boolean;
  model: string;
  created_at: string;
  updated_at: string;
}

interface ConversationItemProps {
  conversation: Conversation;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
  locale: string;
}

export function ConversationItem({
  conversation,
  onTogglePin,
  onToggleArchive,
  onDelete,
  locale
}: ConversationItemProps) {
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const t = useTranslations("History");
  const isRtl = locale === "ar";
  
  const localeObj = locale === "ar" ? arSA : enUS;
  
  // Format the timestamp
  const formattedTime = conversation.last_message_timestamp
    ? formatDistanceToNow(new Date(conversation.last_message_timestamp), { 
        addSuffix: true,
        locale: localeObj 
      })
    : formatDistanceToNow(new Date(conversation.created_at), { 
        addSuffix: true,
        locale: localeObj 
      });

  return (
    <div className={cn(
      "border rounded-lg p-4 transition-colors hover:bg-accent/30",
      conversation.is_pinned && "border-primary/50 bg-primary/5"
    )}>
      <div className={cn(
        "flex items-start justify-between gap-4",
        isRtl && "flex-row-reverse"
      )}>
        <Link 
          href={`/chat/${conversation.id}`}
          className="flex-1 min-w-0 space-y-1"
        >
          <div className={cn(
            "flex items-center gap-2",
            isRtl && "flex-row-reverse justify-end"
          )}>
            <h3 className="font-medium text-base truncate">{conversation.title}</h3>
            {conversation.is_pinned && (
              <Pin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-1">
            {conversation.last_message_preview || t("noMessagePreview")}
          </p>
          
          <div className={cn(
            "flex items-center text-xs text-muted-foreground mt-2 gap-3",
            isRtl && "flex-row-reverse"
          )}>
            <span>{formattedTime}</span>
            <span className={cn(
              "flex items-center gap-1",
              isRtl && "flex-row-reverse"
            )}>
              <MessageCircle className="h-3 w-3" />
              {conversation.message_count}
            </span>
            <span>{conversation.model}</span>
          </div>
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 flex-shrink-0"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">{t("actions")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRtl ? "start" : "end"}>
            <DropdownMenuItem 
              onClick={onTogglePin}
              className={cn(
                "flex items-center cursor-pointer",
                isRtl && "flex-row-reverse justify-end"
              )}
            >
              {conversation.is_pinned ? (
                <>
                  <PinOff className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
                  {t("unpinConversation")}
                </>
              ) : (
                <>
                  <Pin className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
                  {t("pinConversation")}
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={onToggleArchive}
              className={cn(
                "flex items-center cursor-pointer",
                isRtl && "flex-row-reverse justify-end"
              )}
            >
              {conversation.is_archived ? (
                <>
                  <ArchiveRestore className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
                  {t("unarchiveConversation")}
                </>
              ) : (
                <>
                  <Archive className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
                  {t("archiveConversation")}
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {isDeleteConfirming ? (
              <>
                <DropdownMenuItem
                  className={cn(
                    "flex items-center cursor-pointer text-destructive font-medium",
                    isRtl && "flex-row-reverse justify-end"
                  )}
                  onClick={onDelete}
                >
                  <Trash2 className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
                  {t("confirmDelete")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    "flex items-center cursor-pointer",
                    isRtl && "flex-row-reverse justify-end"
                  )}
                  onClick={() => setIsDeleteConfirming(false)}
                >
                  {t("cancel")}
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                className={cn(
                  "flex items-center cursor-pointer text-destructive",
                  isRtl && "flex-row-reverse justify-end"
                )}
                onClick={() => setIsDeleteConfirming(true)}
              >
                <Trash2 className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
                {t("deleteConversation")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
