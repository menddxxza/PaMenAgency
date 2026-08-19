export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          plan: 'free' | 'pro';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_subscription_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          id: string;
          email: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      usage_counters: {
        Row: {
          user_id: string;
          period_start: string;
          searches_count: number;
        };
        Insert: Partial<Database['public']['Tables']['usage_counters']['Row']> & {
          user_id: string;
          period_start: string;
        };
        Update: Partial<Database['public']['Tables']['usage_counters']['Row']>;
        Relationships: [];
      };
      searches: {
        Row: {
          id: string;
          user_id: string;
          niche: string;
          country: string | null;
          city: string | null;
          postal_code: string | null;
          radius_km: number | null;
          filters: Json;
          results_count: number;
          no_website_count: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['searches']['Row']> & {
          user_id: string;
          niche: string;
        };
        Update: Partial<Database['public']['Tables']['searches']['Row']>;
        Relationships: [];
      };
      search_results: {
        Row: {
          id: string;
          search_id: string;
          user_id: string;
          place_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          lat: number | null;
          lng: number | null;
          rating: number | null;
          reviews_count: number;
          category: string | null;
          opening_hours: Json | null;
          maps_url: string | null;
          website: string | null;
          social_links: Json;
          website_status: 'no_website' | 'social_only' | 'broken' | 'outdated' | 'active';
          opportunity: 'alta' | 'media' | 'baja';
          opportunity_score: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['search_results']['Row']> & {
          search_id: string;
          user_id: string;
          place_id: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['search_results']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_usage_and_check_limit: {
        Args: { p_user_id: string; p_limit: number | null };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
