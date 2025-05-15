"use client";

import { useState, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';

export function useConversationNavigation() {
  const router = useRouter();
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null);
  
  // Navigate to a specific conversation
  const navigateToConversation = useCallback((id: string) => {
    // Set loading state before navigation
    setLoadingConversationId(id);
    
    // Use router.prefetch to prepare the page before navigation
    router.prefetch(`/chat/${id}`);
    
    // Use a small timeout to ensure the UI updates before navigation
    setTimeout(() => {
      router.push(`/chat/${id}`);
      
      // Reset loading after a delay to ensure user sees feedback
      setTimeout(() => {
        setLoadingConversationId(null);
      }, 1000);
    }, 50);
  }, [router]);

  // Start a new chat
  const handleNewChat = useCallback(() => {
    router.prefetch('/chat');
    setTimeout(() => {
      router.push('/chat');
    }, 50);
  }, [router]);

  return {
    loadingConversationId,
    navigateToConversation,
    handleNewChat
  };
}
