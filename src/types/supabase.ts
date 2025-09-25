export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          user_id: string
          subject: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          color: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      topics: {
        Row: {
          id: string
          user_id: string
          title: string
          subject: string
          color: string
          description: string | null
          tags: string[]
          created_at: string
          scheduled_reviews: string[]
          completed: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          subject: string
          color: string
          description?: string | null
          tags?: string[]
          created_at?: string
          scheduled_reviews?: string[]
          completed?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          subject?: string
          color?: string
          description?: string | null
          tags?: string[]
          created_at?: string
          scheduled_reviews?: string[]
          completed?: boolean
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          topic_id: string
          user_id: string
          review_number: number
          date: string
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          user_id: string
          review_number: number
          date?: string
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          user_id?: string
          review_number?: number
          date?: string
          completed?: boolean
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          user_id: string
          last_used_subject: string | null
          recent_subjects: string[]
          common_tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          last_used_subject?: string | null
          recent_subjects?: string[]
          common_tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          last_used_subject?: string | null
          recent_subjects?: string[]
          common_tags?: string[]
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