import type { Database } from '@/types/database.types';

export type Tables = Database['public']['Tables'];
export type Row<T extends keyof Tables> = Tables[T]['Row'];

export type Organization = Row<'organizations'>;
export type Business = Row<'businesses'>;
export type BusinessMetric = Row<'business_metrics'>;
export type Goal = Row<'goals'>;
export type Opportunity = Row<'opportunities'>;
export type Agent = Row<'agents'>;
export type AgentTask = Row<'agent_tasks'>;
export type Lead = Row<'leads'>;
export type Action = Row<'actions'>;
export type RevenueEvent = Row<'revenue_events'>;
export type Subscription = Row<'subscriptions'>;

export type OpportunityCategory = Opportunity['category'];
export type AgentKey = Agent['key'];
export type GoalType = Goal['goal_type'];

export interface BusinessInput {
  name: string;
  sector: string;
  location: string;
  website: string;
  employeesRange: string;
  avgTicket: number;
  currentCustomers: number;
  monthlyRevenue: number;
  monthlyLeads: number;
  conversionRate: number;
  acquisitionChannels: string[];
  mainProblem: string;
}

export interface GoalInput {
  goalType: GoalType;
  targetValue: number;
  timeframeDays: number;
  rawInput: string;
}
