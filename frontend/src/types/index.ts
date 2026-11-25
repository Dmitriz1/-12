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

export interface TransactionListResponse {
  items: Transaction[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
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
  page?: number;
  per_page?: number;
  sort_by?: 'id' | 'title' | 'category' | 'amount' | 'created_at';
  sort_order?: 'asc' | 'desc';
  category?: string;
  dt_from?: string;
  dt_to?: string;
  type?: TransactionType;
  search?: string;
  min_amount?: number;
  max_amount?: number;
}
