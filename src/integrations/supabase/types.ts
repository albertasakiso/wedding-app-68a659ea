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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_table: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_table: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_table?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      ap2_mandates: {
        Row: {
          agent_id: string
          agent_public_jwk: Json
          created_at: string
          expires_at: string
          id: string
          is_revoked: boolean
          mandate_token: string
          signature_alg: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          agent_public_jwk: Json
          created_at?: string
          expires_at: string
          id?: string
          is_revoked?: boolean
          mandate_token: string
          signature_alg?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          agent_public_jwk?: Json
          created_at?: string
          expires_at?: string
          id?: string
          is_revoked?: boolean
          mandate_token?: string
          signature_alg?: string
          updated_at?: string
        }
        Relationships: []
      }
      ap2_nonce_log: {
        Row: {
          created_at: string
          id: string
          mandate_id: string
          nonce: string
        }
        Insert: {
          created_at?: string
          id?: string
          mandate_id: string
          nonce: string
        }
        Update: {
          created_at?: string
          id?: string
          mandate_id?: string
          nonce?: string
        }
        Relationships: [
          {
            foreignKeyName: "ap2_nonce_log_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "ap2_mandates"
            referencedColumns: ["id"]
          },
        ]
      }
      api_key_usage: {
        Row: {
          api_key_id: string
          created_at: string
          endpoint: string
          id: string
          ip: string | null
          method: string
        }
        Insert: {
          api_key_id: string
          created_at?: string
          endpoint: string
          id?: string
          ip?: string | null
          method: string
        }
        Update: {
          api_key_id?: string
          created_at?: string
          endpoint?: string
          id?: string
          ip?: string | null
          method?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_key_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: Json | null
          rate_limit_per_minute: number
          request_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: Json | null
          rate_limit_per_minute?: number
          request_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json | null
          rate_limit_per_minute?: number
          request_count?: number | null
        }
        Relationships: []
      }
      card_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          layout_config: Json
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          layout_config: Json
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          layout_config?: Json
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      carousel_slides: {
        Row: {
          button_text: string | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          link_url: string | null
          sort_order: number | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          button_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          link_url?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          button_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_url?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          material_id: string
          price: number | null
          quantity: number
          updated_at: string
          user_id: string
          yards: number
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          price?: number | null
          quantity?: number
          updated_at?: string
          user_id: string
          yards?: number
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          price?: number | null
          quantity?: number
          updated_at?: string
          user_id?: string
          yards?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          name: string
          parent_id: string | null
          sku_prefix: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          name: string
          parent_id?: string | null
          sku_prefix?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          name?: string
          parent_id?: string | null
          sku_prefix?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          priority: string
          resolved_at: string | null
          response_sent: boolean | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          priority?: string
          resolved_at?: string | null
          response_sent?: boolean | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          priority?: string
          resolved_at?: string | null
          response_sent?: boolean | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_responses: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          message_id: string
          response_text: string
          response_type: string
          sent_via_email: boolean | null
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          message_id: string
          response_text: string
          response_type?: string
          sent_via_email?: boolean | null
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          message_id?: string
          response_text?: string
          response_type?: string
          sent_via_email?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_responses_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "contact_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_settings: {
        Row: {
          admin_email: string
          auto_response_enabled: boolean | null
          auto_response_template: string | null
          created_at: string
          id: string
          notification_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          admin_email: string
          auto_response_enabled?: boolean | null
          auto_response_template?: string | null
          created_at?: string
          id?: string
          notification_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          admin_email?: string
          auto_response_enabled?: boolean | null
          auto_response_template?: string | null
          created_at?: string
          id?: string
          notification_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      data_backups: {
        Row: {
          backup_data: Json
          backup_name: string
          backup_size: number | null
          backup_version: number
          checksum: string | null
          content_type: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          row_counts: Json | null
          storage_bucket: string | null
          storage_path: string | null
          tables_included: string[] | null
        }
        Insert: {
          backup_data?: Json
          backup_name: string
          backup_size?: number | null
          backup_version?: number
          checksum?: string | null
          content_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          row_counts?: Json | null
          storage_bucket?: string | null
          storage_path?: string | null
          tables_included?: string[] | null
        }
        Update: {
          backup_data?: Json
          backup_name?: string
          backup_size?: number | null
          backup_version?: number
          checksum?: string | null
          content_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          row_counts?: Json | null
          storage_bucket?: string | null
          storage_path?: string | null
          tables_included?: string[] | null
        }
        Relationships: []
      }
      delivery_settings: {
        Row: {
          bolt_api_key: string | null
          created_at: string
          default_provider: string | null
          id: string
          is_active: boolean | null
          mapbox_public_token: string | null
          provider: string
          tracking_refresh_interval: number | null
          uber_api_key: string | null
          uber_client_id: string | null
          updated_at: string
        }
        Insert: {
          bolt_api_key?: string | null
          created_at?: string
          default_provider?: string | null
          id?: string
          is_active?: boolean | null
          mapbox_public_token?: string | null
          provider?: string
          tracking_refresh_interval?: number | null
          uber_api_key?: string | null
          uber_client_id?: string | null
          updated_at?: string
        }
        Update: {
          bolt_api_key?: string | null
          created_at?: string
          default_provider?: string | null
          id?: string
          is_active?: boolean | null
          mapbox_public_token?: string | null
          provider?: string
          tracking_refresh_interval?: number | null
          uber_api_key?: string | null
          uber_client_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      delivery_tracking: {
        Row: {
          actual_arrival: string | null
          created_at: string
          current_latitude: number | null
          current_longitude: number | null
          delivery_latitude: number | null
          delivery_longitude: number | null
          distance_remaining: number | null
          driver_name: string | null
          driver_phone: string | null
          driver_photo_url: string | null
          estimated_arrival: string | null
          external_tracking_id: string | null
          id: string
          last_location_update: string | null
          order_id: string
          pickup_latitude: number | null
          pickup_longitude: number | null
          provider: string
          status_history: Json | null
          tracking_status: string | null
          updated_at: string
          vehicle_number: string | null
          vehicle_type: string | null
        }
        Insert: {
          actual_arrival?: string | null
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          distance_remaining?: number | null
          driver_name?: string | null
          driver_phone?: string | null
          driver_photo_url?: string | null
          estimated_arrival?: string | null
          external_tracking_id?: string | null
          id?: string
          last_location_update?: string | null
          order_id: string
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          provider?: string
          status_history?: Json | null
          tracking_status?: string | null
          updated_at?: string
          vehicle_number?: string | null
          vehicle_type?: string | null
        }
        Update: {
          actual_arrival?: string | null
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          distance_remaining?: number | null
          driver_name?: string | null
          driver_phone?: string | null
          driver_photo_url?: string | null
          estimated_arrival?: string | null
          external_tracking_id?: string | null
          id?: string
          last_location_update?: string | null
          order_id?: string
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          provider?: string
          status_history?: Json | null
          tracking_status?: string | null
          updated_at?: string
          vehicle_number?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_zones: {
        Row: {
          base_fee: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          base_fee?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          base_fee?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          applies_to_categories: string[] | null
          code: string
          created_at: string
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          max_uses: number | null
          min_order_amount: number | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applies_to_categories?: string[] | null
          code: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_uses?: number | null
          min_order_amount?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applies_to_categories?: string[] | null
          code?: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_uses?: number | null
          min_order_amount?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          attempts: number
          created_at: string
          html: string | null
          id: string
          last_attempt_at: string | null
          last_error: string | null
          max_attempts: number
          provider: string
          reply_to: string | null
          scheduled_at: string | null
          status: string
          subject: string
          text: string | null
          to_email: string
          type: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          html?: string | null
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          max_attempts?: number
          provider?: string
          reply_to?: string | null
          scheduled_at?: string | null
          status?: string
          subject: string
          text?: string | null
          to_email: string
          type: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          html?: string | null
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          max_attempts?: number
          provider?: string
          reply_to?: string | null
          scheduled_at?: string | null
          status?: string
          subject?: string
          text?: string | null
          to_email?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          admin_notification_email: string
          api_key_name: string
          contact_auto_response_enabled: boolean | null
          contact_auto_response_template: string | null
          contact_notification_enabled: boolean | null
          created_at: string
          from_email: string
          from_name: string
          id: string
          is_active: boolean | null
          order_confirmation_enabled: boolean | null
          order_confirmation_template: string | null
          provider: string
          reply_to_email: string | null
          smtp_from_email: string | null
          smtp_host: string | null
          smtp_password_name: string | null
          smtp_port: number | null
          smtp_secure: boolean | null
          smtp_username: string | null
          updated_at: string
        }
        Insert: {
          admin_notification_email: string
          api_key_name?: string
          contact_auto_response_enabled?: boolean | null
          contact_auto_response_template?: string | null
          contact_notification_enabled?: boolean | null
          created_at?: string
          from_email: string
          from_name: string
          id?: string
          is_active?: boolean | null
          order_confirmation_enabled?: boolean | null
          order_confirmation_template?: string | null
          provider?: string
          reply_to_email?: string | null
          smtp_from_email?: string | null
          smtp_host?: string | null
          smtp_password_name?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean | null
          smtp_username?: string | null
          updated_at?: string
        }
        Update: {
          admin_notification_email?: string
          api_key_name?: string
          contact_auto_response_enabled?: boolean | null
          contact_auto_response_template?: string | null
          contact_notification_enabled?: boolean | null
          created_at?: string
          from_email?: string
          from_name?: string
          id?: string
          is_active?: boolean | null
          order_confirmation_enabled?: boolean | null
          order_confirmation_template?: string | null
          provider?: string
          reply_to_email?: string | null
          smtp_from_email?: string | null
          smtp_host?: string | null
          smtp_password_name?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean | null
          smtp_username?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          material_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          created_at: string
          id: string
          last_restocked: string | null
          low_stock_threshold: number | null
          material_id: string
          quantity_yards: number
          restock_notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_restocked?: string | null
          low_stock_threshold?: number | null
          material_id: string
          quantity_yards?: number
          restock_notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_restocked?: string | null
          low_stock_threshold?: number | null
          material_id?: string
          quantity_yards?: number
          restock_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: true
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          admin_notes: string | null
          cover_letter: string | null
          created_at: string
          cv_url: string | null
          email: string
          full_name: string
          id: string
          job_post_id: string
          phone: string | null
          portfolio_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          cover_letter?: string | null
          created_at?: string
          cv_url?: string | null
          email: string
          full_name: string
          id?: string
          job_post_id: string
          phone?: string | null
          portfolio_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          cover_letter?: string | null
          created_at?: string
          cv_url?: string | null
          email?: string
          full_name?: string
          id?: string
          job_post_id?: string
          phone?: string | null
          portfolio_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_post_id_fkey"
            columns: ["job_post_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      job_posts: {
        Row: {
          closes_at: string | null
          created_at: string
          department: string | null
          description: string
          employment_type: string | null
          id: string
          is_active: boolean
          location: string | null
          posted_at: string
          requirements: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          closes_at?: string | null
          created_at?: string
          department?: string | null
          description: string
          employment_type?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          posted_at?: string
          requirements?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          closes_at?: string | null
          created_at?: string
          department?: string | null
          description?: string
          employment_type?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          posted_at?: string
          requirements?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      material_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          material_id: string
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          material_id: string
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          material_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "material_images_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      material_specs: {
        Row: {
          created_at: string
          id: string
          material_id: string
          specs: Json
          template_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          specs?: Json
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          specs?: Json
          template_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          category: string
          category_id: string | null
          colors: string[] | null
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          likes: number | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          name: string
          price: number
          rating: number | null
          sku: string | null
          subcategory_id: string | null
          updated_at: string
        }
        Insert: {
          category: string
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          likes?: number | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          name: string
          price: number
          rating?: number | null
          sku?: string | null
          subcategory_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          likes?: number | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          name?: string
          price?: number
          rating?: number | null
          sku?: string | null
          subcategory_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          source: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          id: string
          new_status: string | null
          notes: string | null
          old_status: string | null
          order_id: string
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          id?: string
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          order_id: string
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          id?: string
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_actions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          material_id: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
          yards: number
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          order_id: string
          quantity?: number
          total_price: number
          unit_price: number
          yards?: number
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          yards?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          delivery_address: string
          delivery_city: string
          delivery_fee: number
          delivery_partner: string | null
          delivery_zone: string
          discount_amount: number | null
          discount_code: string | null
          estimated_delivery: string | null
          id: string
          invoice_generated_at: string | null
          invoice_number: string | null
          notes: string | null
          order_number: string
          order_status: Database["public"]["Enums"]["order_status"] | null
          order_total: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference: string | null
          refund_amount: number | null
          refund_reason: string | null
          refund_status: string | null
          refunded_at: string | null
          subtotal: number
          tax_amount: number
          tax_breakdown: Json | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          delivery_address: string
          delivery_city: string
          delivery_fee?: number
          delivery_partner?: string | null
          delivery_zone: string
          discount_amount?: number | null
          discount_code?: string | null
          estimated_delivery?: string | null
          id?: string
          invoice_generated_at?: string | null
          invoice_number?: string | null
          notes?: string | null
          order_number: string
          order_status?: Database["public"]["Enums"]["order_status"] | null
          order_total?: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refund_status?: string | null
          refunded_at?: string | null
          subtotal?: number
          tax_amount?: number
          tax_breakdown?: Json | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          delivery_address?: string
          delivery_city?: string
          delivery_fee?: number
          delivery_partner?: string | null
          delivery_zone?: string
          discount_amount?: number | null
          discount_code?: string | null
          estimated_delivery?: string | null
          id?: string
          invoice_generated_at?: string | null
          invoice_number?: string | null
          notes?: string | null
          order_number?: string
          order_status?: Database["public"]["Enums"]["order_status"] | null
          order_total?: number
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refund_status?: string | null
          refunded_at?: string | null
          subtotal?: number
          tax_amount?: number
          tax_breakdown?: Json | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_configs: {
        Row: {
          api_key: string | null
          config_data: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          provider: string
          public_key: string | null
          secret_key: string | null
          updated_at: string | null
        }
        Insert: {
          api_key?: string | null
          config_data?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider: string
          public_key?: string | null
          secret_key?: string | null
          updated_at?: string | null
        }
        Update: {
          api_key?: string | null
          config_data?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          public_key?: string | null
          secret_key?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          category: string | null
          created_at: string
          discount_percentage: number
          end_date: string | null
          id: string
          is_active: boolean | null
          material_id: string | null
          min_yards: number
          start_date: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          discount_percentage?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          material_id?: string | null
          min_yards?: number
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          discount_percentage?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          material_id?: string | null
          min_yards?: number
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      product_likes: {
        Row: {
          created_at: string | null
          id: string
          material_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          material_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          material_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_likes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          created_at: string | null
          helpful_count: number
          id: string
          is_approved: boolean | null
          material_id: string
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          helpful_count?: number
          id?: string
          is_approved?: boolean | null
          material_id: string
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          helpful_count?: number
          id?: string
          is_approved?: boolean | null
          material_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          is_active: boolean
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      review_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "product_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_settings: {
        Row: {
          canonical_url: string | null
          created_at: string
          id: string
          is_active: boolean | null
          meta_description: string | null
          meta_keywords: string[] | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          og_type: string | null
          page_path: string
          page_title: string
          robots: string | null
          structured_data: Json | null
          twitter_card: string | null
          twitter_description: string | null
          twitter_image: string | null
          twitter_title: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          page_path: string
          page_title: string
          robots?: string | null
          structured_data?: Json | null
          twitter_card?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          page_path?: string
          page_title?: string
          robots?: string | null
          structured_data?: Json | null
          twitter_card?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          business_hours: Json | null
          carousel_interval_ms: number
          carousel_max_slides: number
          contact_address: string | null
          contact_email: string
          contact_phone: string | null
          created_at: string
          currency_symbol: string | null
          id: string
          invoice_bank_details: Json | null
          invoice_billing_email: string | null
          invoice_billing_hours: string | null
          invoice_billing_phone: string | null
          invoice_business_name: string | null
          invoice_footer: string | null
          invoice_registration_number: string | null
          invoice_terms: string | null
          invoice_tin: string | null
          is_active: boolean | null
          locations: Json | null
          maintenance_eta: string | null
          maintenance_message: string | null
          maintenance_mode: boolean
          maintenance_title: string | null
          maintenance_updated_at: string
          payment_support_email: string | null
          payment_support_phone: string | null
          privacy_email: string | null
          quick_contacts: Json | null
          site_description: string | null
          site_favicon: string | null
          site_logo: string | null
          site_logo_url: string | null
          site_name: string
          site_title: string
          social_media: Json | null
          support_email: string | null
          tax_rate: number | null
          updated_at: string
          wholesale_email: string | null
        }
        Insert: {
          business_hours?: Json | null
          carousel_interval_ms?: number
          carousel_max_slides?: number
          contact_address?: string | null
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          currency_symbol?: string | null
          id?: string
          invoice_bank_details?: Json | null
          invoice_billing_email?: string | null
          invoice_billing_hours?: string | null
          invoice_billing_phone?: string | null
          invoice_business_name?: string | null
          invoice_footer?: string | null
          invoice_registration_number?: string | null
          invoice_terms?: string | null
          invoice_tin?: string | null
          is_active?: boolean | null
          locations?: Json | null
          maintenance_eta?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean
          maintenance_title?: string | null
          maintenance_updated_at?: string
          payment_support_email?: string | null
          payment_support_phone?: string | null
          privacy_email?: string | null
          quick_contacts?: Json | null
          site_description?: string | null
          site_favicon?: string | null
          site_logo?: string | null
          site_logo_url?: string | null
          site_name?: string
          site_title?: string
          social_media?: Json | null
          support_email?: string | null
          tax_rate?: number | null
          updated_at?: string
          wholesale_email?: string | null
        }
        Update: {
          business_hours?: Json | null
          carousel_interval_ms?: number
          carousel_max_slides?: number
          contact_address?: string | null
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          currency_symbol?: string | null
          id?: string
          invoice_bank_details?: Json | null
          invoice_billing_email?: string | null
          invoice_billing_hours?: string | null
          invoice_billing_phone?: string | null
          invoice_business_name?: string | null
          invoice_footer?: string | null
          invoice_registration_number?: string | null
          invoice_terms?: string | null
          invoice_tin?: string | null
          is_active?: boolean | null
          locations?: Json | null
          maintenance_eta?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean
          maintenance_title?: string | null
          maintenance_updated_at?: string
          payment_support_email?: string | null
          payment_support_phone?: string | null
          privacy_email?: string | null
          quick_contacts?: Json | null
          site_description?: string | null
          site_favicon?: string | null
          site_logo?: string | null
          site_logo_url?: string | null
          site_name?: string
          site_title?: string
          social_media?: Json | null
          support_email?: string | null
          tax_rate?: number | null
          updated_at?: string
          wholesale_email?: string | null
        }
        Relationships: []
      }
      spec_template_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          template_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          template_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spec_template_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spec_template_categories_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "spec_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      spec_templates: {
        Row: {
          created_at: string
          description: string | null
          fields: Json
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string
          department: string | null
          employee_id: string | null
          hire_date: string | null
          id: string
          is_active: boolean | null
          position: string | null
          salary: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          employee_id?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          position?: string | null
          salary?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          employee_id?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          position?: string | null
          salary?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
          session_id: string
          target_resource_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          session_id: string
          target_resource_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          session_id?: string
          target_resource_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tax_rates: {
        Row: {
          api_endpoint: string | null
          api_key_name: string | null
          applies_to: string | null
          code: string
          created_at: string | null
          description: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          is_active: boolean | null
          is_compound: boolean | null
          name: string
          rate: number
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_key_name?: string | null
          applies_to?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          is_compound?: boolean | null
          name: string
          rate?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_key_name?: string | null
          applies_to?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          is_compound?: boolean | null
          name?: string
          rate?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ucp_business_profile: {
        Row: {
          business_name: string
          capabilities: Json
          country_code: string
          created_at: string
          default_currency: string
          id: string
          is_active: boolean
          legal_name: string | null
          payment_handlers: Json
          support_email: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          business_name: string
          capabilities?: Json
          country_code?: string
          created_at?: string
          default_currency?: string
          id?: string
          is_active?: boolean
          legal_name?: string | null
          payment_handlers?: Json
          support_email?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          business_name?: string
          capabilities?: Json
          country_code?: string
          created_at?: string
          default_currency?: string
          id?: string
          is_active?: boolean
          legal_name?: string | null
          payment_handlers?: Json
          support_email?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      ucp_session_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          idempotency_key: string | null
          payload: Json
          session_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          idempotency_key?: string | null
          payload?: Json
          session_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          idempotency_key?: string | null
          payload?: Json
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ucp_session_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ucp_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ucp_sessions: {
        Row: {
          archived_at: string | null
          cart_items: Json
          completed_at: string | null
          created_at: string
          discount_code: string | null
          expires_at: string | null
          fulfillment_option: string | null
          id: string
          idempotency_keys: Json
          metadata: Json
          pricing_snapshot: Json
          session_uuid: string
          status: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          cart_items?: Json
          completed_at?: string | null
          created_at?: string
          discount_code?: string | null
          expires_at?: string | null
          fulfillment_option?: string | null
          id?: string
          idempotency_keys?: Json
          metadata?: Json
          pricing_snapshot?: Json
          session_uuid: string
          status?: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          cart_items?: Json
          completed_at?: string | null
          created_at?: string
          discount_code?: string | null
          expires_at?: string | null
          fulfillment_option?: string | null
          id?: string
          idempotency_keys?: Json
          metadata?: Json
          pricing_snapshot?: Json
          session_uuid?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ucp_signing_keys: {
        Row: {
          alg: string
          created_at: string
          id: string
          is_active: boolean
          kid: string
          public_jwk: Json
          purpose: string
          updated_at: string
        }
        Insert: {
          alg?: string
          created_at?: string
          id?: string
          is_active?: boolean
          kid: string
          public_jwk: Json
          purpose?: string
          updated_at?: string
        }
        Update: {
          alg?: string
          created_at?: string
          id?: string
          is_active?: boolean
          kid?: string
          public_jwk?: Json
          purpose?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string | null
          created_at: string
          full_name: string
          id: string
          is_default: boolean | null
          label: string | null
          phone: string | null
          postal_code: string | null
          region: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country?: string | null
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      web_push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          subscription: Json
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          subscription: Json
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          subscription?: Json
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string | null
          events: string[]
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          secret: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          events: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          secret?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          secret?: string | null
          url?: string
        }
        Relationships: []
      }
      yard_presets: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          label: string
          sort_order: number | null
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          label: string
          sort_order?: number | null
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          label?: string
          sort_order?: number | null
          value?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      audit_redact: {
        Args: { row_data: Json; table_name: string }
        Returns: Json
      }
      create_paystack_payment: { Args: never; Returns: undefined }
      customer_request_refund: {
        Args: { p_order_id: string; p_reason: string }
        Returns: undefined
      }
      generate_invoice_number: { Args: never; Returns: string }
      generate_order_number: { Args: never; Returns: string }
      generate_sku: {
        Args: { category_prefix: string; material_name: string }
        Returns: string
      }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              required_role: Database["public"]["Enums"]["user_role"]
              user_id: string
            }
            Returns: boolean
          }
      is_admin_or_higher: { Args: { user_id: string }; Returns: boolean }
      rpc_detect_anomalies: {
        Args: {
          event_name: string
          lookback_minutes?: number
          z_threshold?: number
        }
        Returns: {
          bucket_start: string
          event_count: number
          is_anomaly: boolean
          mean_count: number
          stddev_count: number
          z_score: number
        }[]
      }
      rpc_get_event_pulse: {
        Args: { event_name?: string; lookback_minutes?: number }
        Returns: {
          bucket_start: string
          event_count: number
        }[]
      }
      rpc_get_funnel_metrics: {
        Args: { end_ts: string; start_ts: string; steps: Json }
        Returns: {
          sessions: number
          step: string
        }[]
      }
      rpc_get_referrer_sources: {
        Args: { end_ts: string; event_name: string; start_ts: string }
        Returns: {
          events: number
          referrer: string
        }[]
      }
      rpc_get_retention_cohorts: {
        Args: { end_date: string; start_date: string }
        Returns: {
          active_date: string
          cohort_date: string
          sessions: number
        }[]
      }
      rpc_get_views_vs_conversions: {
        Args: {
          conversion_event: string
          end_ts: string
          start_ts: string
          view_event: string
        }
        Returns: {
          conversions: number
          target_resource_id: string
          views: number
        }[]
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "staff" | "customer"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_method:
        | "credit_card"
        | "mobile_money"
        | "bank_transfer"
        | "cash_on_delivery"
      user_role: "super_admin" | "admin" | "staff" | "customer"
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
    Enums: {
      app_role: ["super_admin", "admin", "staff", "customer"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_method: [
        "credit_card",
        "mobile_money",
        "bank_transfer",
        "cash_on_delivery",
      ],
      user_role: ["super_admin", "admin", "staff", "customer"],
    },
  },
} as const
