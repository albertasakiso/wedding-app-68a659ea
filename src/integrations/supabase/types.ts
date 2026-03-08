export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      events: {
        Row: {
          created_at: string
          description: string | null
          event_time: string
          id: string
          location: string | null
          order_index: number | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_time: string
          id?: string
          location?: string | null
          order_index?: number | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_time?: string
          id?: string
          location?: string | null
          order_index?: number | null
          title?: string
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          uploaded_by: string | null
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          uploaded_by?: string | null
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          uploaded_by?: string | null
          url?: string
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          attending: boolean | null
          created_at: string
          dietary_restrictions: string | null
          email: string | null
          guest_name: string
          id: string
          meal_preference: string | null
          message: string | null
          plus_one_name: string | null
        }
        Insert: {
          attending?: boolean | null
          created_at?: string
          dietary_restrictions?: string | null
          email?: string | null
          guest_name: string
          id?: string
          meal_preference?: string | null
          message?: string | null
          plus_one_name?: string | null
        }
        Update: {
          attending?: boolean | null
          created_at?: string
          dietary_restrictions?: string | null
          email?: string | null
          guest_name?: string
          id?: string
          meal_preference?: string | null
          message?: string | null
          plus_one_name?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          couple_names: string
          created_at: string
          hero_image_url: string | null
          id: string
          tagline: string | null
          wedding_date: string
        }
        Insert: {
          couple_names?: string
          created_at?: string
          hero_image_url?: string | null
          id?: string
          tagline?: string | null
          wedding_date?: string
        }
        Update: {
          couple_names?: string
          created_at?: string
          hero_image_url?: string | null
          id?: string
          tagline?: string | null
          wedding_date?: string
        }
        Relationships: []
      }
      venue_info: {
        Row: {
          address: string | null
          created_at: string
          hotels: Json | null
          id: string
          latitude: number | null
          longitude: number | null
          map_url: string | null
          name: string
          parking_info: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          hotels?: Json | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          map_url?: string | null
          name: string
          parking_info?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          hotels?: Json | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          map_url?: string | null
          name?: string
          parking_info?: string | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
