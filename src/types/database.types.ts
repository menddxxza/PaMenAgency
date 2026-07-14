// Tipado manual del esquema de supabase/migrations/0001_init.sql.
// Reemplazar por el output real de:
//   supabase gen types typescript --project-id <ref> > src/types/database.types.ts
// en cuanto el proyecto de Supabase esté enlazado.

export type BusinessRole = 'owner' | 'staff' | 'agency'
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed'
export type AppointmentSource = 'bot' | 'manual'
export type ConversationStatus = 'open' | 'closed'
export type MessageSender = 'client' | 'bot' | 'staff'
export type BotTone = 'cercano' | 'profesional' | 'directo' | 'divertido'
export type PlanTier = 'starter' | 'pro' | 'agencia'
export type SubscriptionStatus = 'incomplete' | 'trialing' | 'active' | 'past_due' | 'canceled'

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          name: string
          slug: string
          whatsapp_number: string | null
          timezone: string
          opening_hours: Record<string, unknown>
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['businesses']['Row']> & { name: string; slug: string }
        Update: Partial<Database['public']['Tables']['businesses']['Row']>
      }
      business_users: {
        Row: {
          id: string
          business_id: string
          user_id: string
          role: BusinessRole
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['business_users']['Row']> & {
          business_id: string
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['business_users']['Row']>
      }
      services: {
        Row: {
          id: string
          business_id: string
          name: string
          price_cents: number
          duration_min: number
          active: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['services']['Row']> & {
          business_id: string
          name: string
          price_cents: number
        }
        Update: Partial<Database['public']['Tables']['services']['Row']>
      }
      clients: {
        Row: {
          id: string
          business_id: string
          name: string | null
          phone: string
          notes: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['clients']['Row']> & { business_id: string; phone: string }
        Update: Partial<Database['public']['Tables']['clients']['Row']>
      }
      appointments: {
        Row: {
          id: string
          business_id: string
          client_id: string | null
          service_id: string | null
          starts_at: string
          status: AppointmentStatus
          source: AppointmentSource
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['appointments']['Row']> & {
          business_id: string
          starts_at: string
        }
        Update: Partial<Database['public']['Tables']['appointments']['Row']>
      }
      conversations: {
        Row: {
          id: string
          business_id: string
          client_id: string
          status: ConversationStatus
          last_message_at: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['conversations']['Row']> & {
          business_id: string
          client_id: string
        }
        Update: Partial<Database['public']['Tables']['conversations']['Row']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender: MessageSender
          content: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['messages']['Row']> & {
          conversation_id: string
          sender: MessageSender
          content: string
        }
        Update: Partial<Database['public']['Tables']['messages']['Row']>
      }
      bot_config: {
        Row: {
          business_id: string
          tone: BotTone
          greeting_message: string
          knowledge_base: Record<string, unknown>
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['bot_config']['Row']> & { business_id: string }
        Update: Partial<Database['public']['Tables']['bot_config']['Row']>
      }
      subscriptions: {
        Row: {
          business_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: PlanTier
          status: SubscriptionStatus
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['subscriptions']['Row']> & { business_id: string }
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>
      }
    }
    Functions: {
      create_business: {
        Args: { p_name: string; p_slug: string; p_whatsapp_number?: string | null }
        Returns: string
      }
      handle_inbound_message: {
        Args: {
          p_business_id: string
          p_phone: string
          p_content: string
          p_client_name?: string | null
          p_sender?: MessageSender
        }
        Returns: string
      }
    }
  }
}
