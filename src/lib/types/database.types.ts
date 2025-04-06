export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Define the enum types to match our database
export type LanguagePreference = 'ar' | 'en'
export type ThemePreference = 'light' | 'dark' | 'system'
export type MessageRole = 'user' | 'assistant' | 'system'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          email: string
          photo_url: string | null
          preferred_language: LanguagePreference
          preferred_theme: ThemePreference
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
          is_deleted: boolean | null
          token_usage: number | null
          deleted_at: string | null
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          email: string
          photo_url?: string | null
          preferred_language?: LanguagePreference
          preferred_theme?: ThemePreference
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
          is_deleted?: boolean | null
          token_usage?: number | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string
          photo_url?: string | null
          preferred_language?: LanguagePreference
          preferred_theme?: ThemePreference
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
          is_deleted?: boolean | null
          token_usage?: number | null
          deleted_at?: string | null
        }
      },
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          last_message_preview: string | null
          last_message_timestamp: string | null
          message_count: number
          is_pinned: boolean
          is_archived: boolean
          model: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          last_message_preview?: string | null
          last_message_timestamp?: string | null
          message_count?: number
          is_pinned?: boolean
          is_archived?: boolean
          model?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          last_message_preview?: string | null
          last_message_timestamp?: string | null
          message_count?: number
          is_pinned?: boolean
          is_archived?: boolean
          model?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      },
      messages: {
        Row: {
          id: string
          conversation_id: string
          topic: string
          role: MessageRole
          content: string
          extension: string
          payload: Json | null
          tokens: number | null
          metadata: Json | null
          event: string | null
          created_at: string
          private: boolean | null
          updated_at: string
          inserted_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          topic: string
          role: MessageRole
          content: string
          extension: string
          payload?: Json | null
          tokens?: number | null
          metadata?: Json | null
          event?: string | null
          created_at?: string
          private?: boolean | null
          updated_at?: string
          inserted_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          topic?: string
          role?: MessageRole
          content?: string
          extension?: string
          payload?: Json | null
          tokens?: number | null
          metadata?: Json | null
          event?: string | null
          created_at?: string
          private?: boolean | null
          updated_at?: string
          inserted_at?: string
        }
      },
      user_settings: {
        Row: {
          user_id: string
          chat_settings: Json
          ui_settings: Json
          api_usage: Json
          updated_at: string
        }
        Insert: {
          user_id: string
          chat_settings?: Json
          ui_settings?: Json
          api_usage?: Json
          updated_at?: string
        }
        Update: {
          user_id?: string
          chat_settings?: Json
          ui_settings?: Json
          api_usage?: Json
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      language_preference: LanguagePreference
      theme_preference: ThemePreference
    }
  }
}
