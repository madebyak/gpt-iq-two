import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { formatDistance } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Define conversation interface (matching the Sidebar component's needs)
export interface Conversation {
  id: string;
  title: string;
  last_message_preview?: string;
  updated_at: string;
  created_at: string;
  is_archived: boolean;
  message_count: number;
  is_pinned: boolean;
}

interface UseConversationsOptions {
  locale: string;
}

export function useConversations({ locale }: UseConversationsOptions) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isRtl = locale === 'ar';
  const dateLocale = isRtl ? ar : enUS;
  
  // Fetch conversations data
  const fetchConversations = useCallback(async () => {
    // Only fetch if we have a user with an ID
    if (!user || !user.id) {
      console.log("Skipping fetchConversations: No user or user ID");
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/conversations');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch conversations: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Format date for display with memoized locale
  const formatDate = useCallback((dateString: string) => {
    try {
      return formatDistance(
        new Date(dateString),
        new Date(),
        { addSuffix: true, locale: dateLocale }
      );
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }, [dateLocale]);
  
  // Fetch conversations when user changes
  useEffect(() => {
    // Only fetch if we have a user with an ID
    if (user && user.id) {
      console.log("User detected, fetching conversations...");
      fetchConversations();
    } else {
      // Clear conversations if user logs out or isn't fully loaded
      console.log("No user or user ID, clearing conversations.");
      setConversations([]);
    }
  }, [user, fetchConversations]);

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    formatDate
  };
}
