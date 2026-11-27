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

export type TransactionUpdate = Partial<TransactionCreate>;

export type SortOrder = 'asc' | 'desc';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export type TransactionListResponse = PaginatedResponse<Transaction>;

export interface ApiError {
  detail: string;
  error_code: string;
  fields?: string[] | null;
}

export interface Group {
  id: number;
  name: string;
  owner_id: number;
}

export interface GroupCreate {
  name: string;
}

export type GroupUpdate = Partial<GroupCreate>;

export type GroupListResponse = PaginatedResponse<Group>;

export interface GroupFilters {
  page?: number;
  per_page?: number;
  sort_by?: 'id' | 'name' | 'owner_id';
  sort_order?: SortOrder;
  search?: string;
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
  sort_order?: SortOrder;
  category?: string;
  dt_from?: string;
  dt_to?: string;
  type?: TransactionType;
  search?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface User {
  id: number;
  username: string;
}

export interface UserCreate {
  username: string;
  password: string;
}

export interface UserUpdate {
  username?: string;
  password?: string;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface UserFilters {
  page?: number;
  per_page?: number;
  sort_by?: 'id' | 'username';
  sort_order?: 'asc' | 'desc';
  search?: string;
}
