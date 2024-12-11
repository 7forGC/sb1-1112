export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          uid: string
          email: string
          display_name: string
          photo_url: string | null
          settings: Json
          created_at: string
          last_login: string
          status: string
          bio: string | null
          contacts: string[]
          blocked_users: string[]
          email_verified: boolean
          api_key: string | null
        }
        Insert: {
          uid: string
          email: string
          display_name: string
          photo_url?: string | null
          settings?: Json
          created_at?: string
          last_login?: string
          status?: string
          bio?: string | null
          contacts?: string[]
          blocked_users?: string[]
          email_verified?: boolean
          api_key?: string | null
        }
        Update: {
          uid?: string
          email?: string
          display_name?: string
          photo_url?: string | null
          settings?: Json
          created_at?: string
          last_login?: string
          status?: string
          bio?: string | null
          contacts?: string[]
          blocked_users?: string[]
          email_verified?: boolean
          api_key?: string | null
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          device_info: Json
          created_at: string
          last_active: string
          terminated_at: string | null
          active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          device_info: Json
          created_at?: string
          last_active?: string
          terminated_at?: string | null
          active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          device_info?: Json
          created_at?: string
          last_active?: string
          terminated_at?: string | null
          active?: boolean
        }
      }
      two_factor: {
        Row: {
          user_id: string
          secret: string
          enabled: boolean
          created_at: string
          updated_at: string
          backup_codes: string[]
        }
        Insert: {
          user_id: string
          secret: string
          enabled?: boolean
          created_at?: string
          updated_at?: string
          backup_codes?: string[]
        }
        Update: {
          user_id?: string
          secret?: string
          enabled?: boolean
          created_at?: string
          updated_at?: string
          backup_codes?: string[]
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          language: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          translations: Json
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          language: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          translations?: Json
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          language?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          translations?: Json
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          avatar_url: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          avatar_url?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          avatar_url?: string | null
          created_by?: string
          created_at?: string
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
      [_ in never]: never
    }
  }
}