export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          country: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      personality_types: {
        Row: {
          id: string
          code: string
          name_ar: string
          name_en: string
          description_ar: string
          description_en: string
          strengths: string[]
          weaknesses: string[]
          compatibility: Record<string, number>
          book_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name_ar: string
          name_en: string
          description_ar: string
          description_en: string
          strengths: string[]
          weaknesses: string[]
          compatibility?: Record<string, number>
          book_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name_ar?: string
          name_en?: string
          description_ar?: string
          description_en?: string
          strengths?: string[]
          weaknesses?: string[]
          compatibility?: Record<string, number>
          book_id?: string | null
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          question_ar: string
          question_en: string
          description_ar: string | null
          description_en: string | null
          answers: Array<{
            id: string
            text_ar: string
            text_en: string
            type_scores: Record<string, number>
          }>
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          question_ar: string
          question_en: string
          description_ar?: string | null
          description_en?: string | null
          answers: Array<{
            id: string
            text_ar: string
            text_en: string
            type_scores: Record<string, number>
          }>
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          question_ar?: string
          question_en?: string
          description_ar?: string | null
          description_en?: string | null
          answers?: Array<{
            id: string
            text_ar: string
            text_en: string
            type_scores: Record<string, number>
          }>
          order?: number
          created_at?: string
        }
      }
      test_results: {
        Row: {
          id: string
          user_id: string
          personality_type_id: string
          scores: Record<string, number>
          summary_ar: string
          summary_en: string
          is_premium: boolean
          has_paid: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          personality_type_id: string
          scores: Record<string, number>
          summary_ar: string
          summary_en: string
          is_premium?: boolean
          has_paid?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          personality_type_id?: string
          scores?: Record<string, number>
          summary_ar?: string
          summary_en?: string
          is_premium?: boolean
          has_paid?: boolean
          created_at?: string
        }
      }
      books: {
        Row: {
          id: string
          title_ar: string
          title_en: string
          author: string
          description_ar: string
          description_en: string
          file_url: string
          file_size: number
          pages: number
          created_at: string
        }
        Insert: {
          id?: string
          title_ar: string
          title_en: string
          author: string
          description_ar: string
          description_en: string
          file_url: string
          file_size: number
          pages: number
          created_at?: string
        }
        Update: {
          id?: string
          title_ar?: string
          title_en?: string
          author?: string
          description_ar?: string
          description_en?: string
          file_url?: string
          file_size?: number
          pages?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          stripe_session_id: string
          test_result_id: string
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_session_id: string
          test_result_id: string
          amount: number
          currency: string
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_session_id?: string
          test_result_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string
        }
      }
      ai_prompts: {
        Row: {
          id: string
          name: string
          prompt_text: string
          personality_type_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          prompt_text: string
          personality_type_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          prompt_text?: string
          personality_type_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      otp_codes: {
        Row: {
          id: string
          phone: string
          code: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          phone: string
          code: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          phone?: string
          code?: string
          expires_at?: string
          created_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          event_name: string
          user_id: string | null
          properties: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          event_name: string
          user_id?: string | null
          properties?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          event_name?: string
          user_id?: string | null
          properties?: Record<string, unknown>
          created_at?: string
        }
      }
    }
    Views: Record<string, unknown>
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
  }
}
