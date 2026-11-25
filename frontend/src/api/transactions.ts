import { api } from './client';
import type {
  Transaction,
  TransactionCreate,
  TransactionFilters,
  TransactionListResponse,
} from '../types';

export const transactionsApi = {
  list: (filters: TransactionFilters = {}) =>
    api.get<TransactionListResponse>('/transactions/', { params: filters }),

  create: (data: TransactionCreate) =>
    api.post<Transaction>('/transactions/', data),

  update: (id: number, data: Partial<TransactionCreate>) =>
    api.patch<Transaction>(`/transactions/${id}`, data),

  remove: (id: number) => api.delete(`/transactions/${id}`),
};
