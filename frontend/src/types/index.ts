export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  title: string;
  type: TransactionType;
  category: string;
  amount: number;
  created_at: string;
}

export interface TransactionCreate {
  title: string;
  type: TransactionType;
  category: string;
  amount: number;
}

export interface AuthResponse {
  token: string;
}

export interface CategoryAnalytics {
  labels: string[];
  values: number[];
}

export interface TimelineAnalytics {
  labels: string[];
  expense: number[];
  income: number[];
}

export interface AiRecommendations {
  recommendations: string;
}

export interface TransactionFilters {
  category?: string;
  dt_from?: string;
  dt_to?: string;
  limit?: number;
  offset?: number;
}