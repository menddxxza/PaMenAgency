export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
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
      organizations: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          plan: 'starter' | 'pro' | 'business' | 'performance';
          success_fee_pct: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['organizations']['Row']> & {
          name: string;
          created_by: string;
        };
        Update: Partial<Database['public']['Tables']['organizations']['Row']>;
        Relationships: [];
      };
      memberships: {
        Row: {
          organization_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['memberships']['Row']> & {
          organization_id: string;
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['memberships']['Row']>;
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          sector: string;
          location: string | null;
          website: string | null;
          employees_range: string | null;
          main_problem: string | null;
          acquisition_channels: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['businesses']['Row']> & {
          organization_id: string;
          name: string;
          sector: string;
        };
        Update: Partial<Database['public']['Tables']['businesses']['Row']>;
        Relationships: [];
      };
      business_metrics: {
        Row: {
          id: string;
          business_id: string;
          organization_id: string;
          avg_ticket: number | null;
          current_customers: number | null;
          monthly_revenue: number | null;
          monthly_leads: number | null;
          conversion_rate: number | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['business_metrics']['Row']> & {
          business_id: string;
          organization_id: string;
        };
        Update: Partial<Database['public']['Tables']['business_metrics']['Row']>;
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          organization_id: string;
          business_id: string;
          goal_type: 'new_customers' | 'revenue' | 'leads' | 'reactivation';
          target_value: number;
          timeframe_days: number;
          raw_input: string | null;
          status: 'active' | 'achieved' | 'archived';
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['goals']['Row']> & {
          organization_id: string;
          business_id: string;
          goal_type: 'new_customers' | 'revenue' | 'leads' | 'reactivation';
          target_value: number;
        };
        Update: Partial<Database['public']['Tables']['goals']['Row']>;
        Relationships: [];
      };
      opportunities: {
        Row: {
          id: string;
          organization_id: string;
          business_id: string;
          goal_id: string | null;
          category:
            | 'unfollowed_leads'
            | 'reactivation'
            | 'prospecting'
            | 'automation'
            | 'conversion_optimization';
          name: string;
          description: string;
          assumption: string;
          potential_min: number;
          potential_max: number;
          difficulty: 'baja' | 'media' | 'alta';
          estimated_days: number;
          probability: 'baja' | 'media' | 'alta';
          estimated_cost: number;
          roi_multiple: number;
          priority: number;
          status: 'suggested' | 'activated' | 'dismissed';
          activated_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['opportunities']['Row']> & {
          organization_id: string;
          business_id: string;
          category:
            | 'unfollowed_leads'
            | 'reactivation'
            | 'prospecting'
            | 'automation'
            | 'conversion_optimization';
          name: string;
          description: string;
          potential_min: number;
          potential_max: number;
          difficulty: 'baja' | 'media' | 'alta';
          estimated_days: number;
          probability: 'baja' | 'media' | 'alta';
          roi_multiple: number;
        };
        Update: Partial<Database['public']['Tables']['opportunities']['Row']>;
        Relationships: [];
      };
      agents: {
        Row: {
          id: string;
          organization_id: string;
          business_id: string;
          opportunity_id: string | null;
          key:
            | 'lead_hunter'
            | 'lead_qualifier'
            | 'sales_assistant'
            | 'follow_up'
            | 'reactivation'
            | 'revenue_analyst';
          name: string;
          status: 'idle' | 'active' | 'paused' | 'error';
          requires_approval: boolean;
          is_marketplace_listed: boolean;
          owner_organization_id: string | null;
          cost_to_date: number;
          activated_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['agents']['Row']> & {
          organization_id: string;
          business_id: string;
          key:
            | 'lead_hunter'
            | 'lead_qualifier'
            | 'sales_assistant'
            | 'follow_up'
            | 'reactivation'
            | 'revenue_analyst';
          name: string;
        };
        Update: Partial<Database['public']['Tables']['agents']['Row']>;
        Relationships: [];
      };
      agent_tasks: {
        Row: {
          id: string;
          organization_id: string;
          agent_id: string;
          title: string;
          status: 'pending' | 'running' | 'done' | 'failed';
          result_summary: string | null;
          is_simulated: boolean;
          scheduled_for: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['agent_tasks']['Row']> & {
          organization_id: string;
          agent_id: string;
          title: string;
        };
        Update: Partial<Database['public']['Tables']['agent_tasks']['Row']>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          organization_id: string;
          business_id: string;
          agent_id: string | null;
          name: string;
          source: string | null;
          status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
          estimated_value: number | null;
          is_simulated: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['leads']['Row']> & {
          organization_id: string;
          business_id: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['leads']['Row']>;
        Relationships: [];
      };
      campaigns: {
        Row: {
          id: string;
          organization_id: string;
          business_id: string;
          agent_id: string | null;
          name: string;
          status: 'draft' | 'active' | 'paused' | 'completed';
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['campaigns']['Row']> & {
          organization_id: string;
          business_id: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['campaigns']['Row']>;
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          organization_id: string;
          lead_id: string;
          channel: 'whatsapp' | 'email' | 'phone' | 'other';
          last_message: string | null;
          is_simulated: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['conversations']['Row']> & {
          organization_id: string;
          lead_id: string;
        };
        Update: Partial<Database['public']['Tables']['conversations']['Row']>;
        Relationships: [];
      };
      actions: {
        Row: {
          id: string;
          organization_id: string;
          business_id: string;
          opportunity_id: string | null;
          title: string;
          description: string | null;
          status: 'recommended' | 'activated' | 'dismissed';
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['actions']['Row']> & {
          organization_id: string;
          business_id: string;
          title: string;
        };
        Update: Partial<Database['public']['Tables']['actions']['Row']>;
        Relationships: [];
      };
      revenue_events: {
        Row: {
          id: string;
          organization_id: string;
          business_id: string;
          opportunity_id: string | null;
          agent_id: string | null;
          lead_id: string | null;
          kind: 'potential' | 'attributed' | 'confirmed';
          amount: number;
          is_simulated: boolean;
          occurred_at: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['revenue_events']['Row']> & {
          organization_id: string;
          business_id: string;
          kind: 'potential' | 'attributed' | 'confirmed';
          amount: number;
        };
        Update: Partial<Database['public']['Tables']['revenue_events']['Row']>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          organization_id: string;
          plan: 'starter' | 'pro' | 'business' | 'performance';
          status: 'active' | 'past_due' | 'canceled' | 'trialing';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          success_fee_pct: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['subscriptions']['Row']> & {
          organization_id: string;
          plan: 'starter' | 'pro' | 'business' | 'performance';
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>;
        Relationships: [];
      };
      usage_counters: {
        Row: {
          organization_id: string;
          period_start: string;
          agent_tasks_count: number;
          leads_count: number;
        };
        Insert: Partial<Database['public']['Tables']['usage_counters']['Row']> & {
          organization_id: string;
          period_start: string;
        };
        Update: Partial<Database['public']['Tables']['usage_counters']['Row']>;
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          organization_id: string | null;
          user_id: string | null;
          event: string;
          metadata: Json;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['audit_log']['Row']> & {
          event: string;
        };
        Update: Partial<Database['public']['Tables']['audit_log']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
