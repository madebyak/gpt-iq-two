"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { useRouter, usePathname } from "@/i18n/navigation";
import { LanguagePreference, ThemePreference } from "../types/database.types";

// Cache keys
const PROFILE_CACHE_KEY = 'gpt-iq-profile-cache';
const USER_ID_CACHE_KEY = 'gpt-iq-user-id';

// Define types for our context
type ProfileData = {
  firstName: string | null;
  lastName: string | null;
  email: string;
  photoUrl: string | null;
  preferredLanguage: LanguagePreference;
  preferredTheme: ThemePreference;
  chatSettings?: {
    autoSendMessages: boolean;
    enableSpeech: boolean;
    enableSuggestions: boolean;
  };
  privacySettings?: {
    saveConversationHistory: boolean;
    allowUsageData: boolean;
    allowErrorReporting: boolean;
  };
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: ProfileData | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<{ error: any | null }>;
  deleteAccount: () => Promise<void>;
  getProfileImageUrl: (photoUrl: string | null) => string;
  error: any | null;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // Try to load cached profile data for faster rendering
  const getCachedProfile = useCallback(() => {
    try {
      const cachedProfile = localStorage.getItem(PROFILE_CACHE_KEY);
      if (cachedProfile) {
        return JSON.parse(cachedProfile) as ProfileData;
      }
    } catch (error) {
      console.error('Error reading cached profile:', error);
    }
    return null;
  }, []);

  // Save profile to cache
  const cacheProfile = useCallback((profileData: ProfileData) => {
    try {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profileData));
    } catch (error) {
      console.error('Error caching profile:', error);
    }
  }, []);

  // Clear profile cache
  const clearProfileCache = useCallback(() => {
    try {
      localStorage.removeItem(PROFILE_CACHE_KEY);
      localStorage.removeItem(USER_ID_CACHE_KEY);
    } catch (error) {
      console.error('Error clearing profile cache:', error);
    }
  }, []);

  // Fetch profile data for the user - wrapped in useCallback to avoid recreating on every render
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      // Save userId to cache for potential quick loading on next visit
      localStorage.setItem(USER_ID_CACHE_KEY, userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, photo_url, preferred_language, preferred_theme, chat_settings, privacy_settings')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (data) {
        const profileData = {
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          photoUrl: data.photo_url,
          preferredLanguage: data.preferred_language as LanguagePreference,
          preferredTheme: data.preferred_theme as ThemePreference,
          chatSettings: data.chat_settings ? {
            autoSendMessages: data.chat_settings.auto_send_messages ?? true,
            enableSpeech: data.chat_settings.enable_speech ?? false,
            enableSuggestions: data.chat_settings.enable_suggestions ?? true,
          } : undefined,
          privacySettings: data.privacy_settings ? {
            saveConversationHistory: data.privacy_settings.save_conversation_history ?? true,
            allowUsageData: data.privacy_settings.allow_usage_data ?? true,
            allowErrorReporting: data.privacy_settings.allow_error_reporting ?? true,
          } : undefined,
        };
        
        setProfile(profileData);
        cacheProfile(profileData);
        return profileData;
      }
      
      return null;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  }, [supabase, cacheProfile]);

  // Update user profile data
  const updateProfile = async (data: Partial<ProfileData>) => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      const updates: any = {};

      // Map our frontend keys to database column names
      if (data.firstName !== undefined) updates.first_name = data.firstName;
      if (data.lastName !== undefined) updates.last_name = data.lastName;
      if (data.photoUrl !== undefined) updates.photo_url = data.photoUrl;
      if (data.preferredLanguage !== undefined) updates.preferred_language = data.preferredLanguage;
      if (data.preferredTheme !== undefined) updates.preferred_theme = data.preferredTheme;
      
      // Handle nested objects
      if (data.chatSettings !== undefined) {
        updates.chat_settings = {
          auto_send_messages: data.chatSettings.autoSendMessages,
          enable_speech: data.chatSettings.enableSpeech,
          enable_suggestions: data.chatSettings.enableSuggestions,
        };
      }
      
      if (data.privacySettings !== undefined) {
        updates.privacy_settings = {
          save_conversation_history: data.privacySettings.saveConversationHistory,
          allow_usage_data: data.privacySettings.allowUsageData,
          allow_error_reporting: data.privacySettings.allowErrorReporting,
        };
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error };
      }

      // Update the local state
      setProfile(profile => profile ? { ...profile, ...data } : null);

      // Update the cache
      if (profile) {
        cacheProfile({ ...profile, ...data });
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error };
    }
  };

  // Delete user account
  const deleteAccount = async () => {
    try {
      if (!user) return;
      
      // First, delete user data from any related tables (e.g., conversations)
      const { error: dataError } = await supabase
        .from('conversations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', user.id);
        
      if (dataError) {
        console.error('Error removing user data:', dataError);
      }
      
      // Delete the user's account
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) {
        console.error('Error deleting account:', error);
        throw error;
      }
      
      // Clear local state and cache
      setUser(null);
      setSession(null);
      setProfile(null);
      clearProfileCache();
      
      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Error in deleteAccount:', error);
      throw error;
    }
  };

  // Helper function to get profile image url with default fallback
  const getProfileImageUrl = (photoUrl: string | null): string => {
    return photoUrl || '/profile-default.jpg';
  };

  // Initialize the auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          // Check if we have a user photo from OAuth
          if (session.user.app_metadata?.provider === 'google' && 
              !session.user.user_metadata?.avatar_url && 
              session.user.user_metadata?.picture) {
            
            // Update user profile with Google profile picture
            const { data, error } = await supabase
              .from('profiles')
              .update({ 
                photo_url: session.user.user_metadata.picture,
                updated_at: new Date().toISOString()
              })
              .eq('id', session.user.id);
              
            if (error) {
              console.error('Error updating profile with Google photo:', error);
            }
          }
          
          // Try to load cached profile first for fast rendering
          const cachedProfile = getCachedProfile();
          if (cachedProfile) {
            setProfile(cachedProfile);
            // Then update in background
            fetchProfile(session.user.id).catch(console.error);
          } else {
            await fetchProfile(session.user.id);
          }
        } else {
          setProfile(null);
          clearProfileCache();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      console.log(`[Auth Context] onAuthStateChange event: ${event}`);
      setSession(session);
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        const cachedProfile = getCachedProfile();
        if (cachedProfile) {
          setProfile(cachedProfile);
        }
      } else {
        setProfile(null);
        clearProfileCache();
      }
      
      setIsLoading(false);

      if (currentUser) {
        setTimeout(() => {
            console.log(`[Auth Context] Triggering profile fetch for user ${currentUser.id}`);
            fetchProfile(currentUser.id).catch(err => {
                console.error("[Auth Context] Background profile fetch failed:", err);
            });
        }, 0);
      }
    });

    // Clean up the subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile, getCachedProfile, clearProfileCache]);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && pathname.includes('/auth/login')) {
        // Get the returnUrl or go to home page
        const params = new URLSearchParams(window.location.search);
        const returnUrl = params.get('returnUrl') || '/';
        router.push(returnUrl);
      }

      return { error };
    } catch (error) {
      console.error('Error signing in with email:', error);
      return { error };
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      console.log('[DEBUG] Starting signup process with email:', email);
      
      // First create the user with Supabase Auth
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          data: { first_name: firstName, last_name: lastName }
        },
      });
      
      console.log('[DEBUG] Auth signup result:', {
        user: result.data?.user ? 'Created' : 'Not created',
        error: result.error ? result.error.message : 'None'
      });
      
      // If user creation succeeded, manually create a profile entry
      if (result.data?.user && !result.error) {
        try {
          console.log('[DEBUG] Creating profile for user:', result.data.user.id);
          
          // Create a profile record with exact schema match to your existing database
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              first_name: firstName || null,
              last_name: lastName || null,
              email: email,
              photo_url: null,
              preferred_language: 'en',
              preferred_theme: 'system',
              is_active: true,
              last_login: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_deleted: false,
              token_usage: 0,
              deleted_at: null,
              chat_settings: null,
              privacy_settings: null
            });
          
          if (profileError) {
            console.error('[DEBUG] Error creating profile:', profileError.message, profileError);
          } else {
            console.log('[DEBUG] Profile created successfully');
          }
        } catch (profileErr) {
          console.error('[DEBUG] Exception creating profile:', profileErr);
        }
      }
      
      if (result.error) {
        console.error('[DEBUG] Auth error details:', {
          name: result.error.name,
          status: (result.error as any).status,
          message: result.error.message,
          details: (result.error as any).details,
          hint: (result.error as any).hint
        });
      }
      
      return { error: result.error };
    } catch (err) {
      console.error('[DEBUG] Exception in signUpWithEmail:', err);
      return { error: err as any };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      clearProfileCache();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Refresh the session
  const refreshSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Define the value object to be provided to consumers
  const value = {
    user,
    session,
    profile,
    isLoading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshSession,
    updateProfile,
    deleteAccount,
    getProfileImageUrl,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export the hook for consuming the context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
