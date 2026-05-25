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
          id: string
          display_name: string
          bio: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          bio?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          bio?: string
          avatar_url?: string | null
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string
          category: string
          author_name: string
          author_avatar: string
          cover_image: string
          read_time: string
          likes_count: number
          comments_count: number
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt: string
          category: string
          author_name: string
          author_avatar?: string
          cover_image?: string
          read_time: string
          likes_count?: number
          comments_count?: number
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string
          category?: string
          author_name?: string
          author_avatar?: string
          cover_image?: string
          read_time?: string
          likes_count?: number
          comments_count?: number
          user_id?: string | null
        }
      }
    }
  }
}

export type PostRow = Database["public"]["Tables"]["posts"]["Row"]
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]
