import { api } from './client';
import type {
  Transaction,
  TransactionCreate,
  TransactionFilters,
  TransactionListResponse,
  TransactionUpdate,
} from '../types';

export const transactionsApi = {
  getAll: async (filters: TransactionFilters = {}, signal?: AbortSignal) => {
    const response = await api.get<TransactionListResponse>('/transactions/', {
      params: filters,
      signal,
    });
    return response.data;
  },

  getById: async (id: number, signal?: AbortSignal) => {
    const response = await api.get<Transaction>(`/transactions/${id}`, { signal });
    return response.data;
  },

  create: async (data: TransactionCreate) => {
    const response = await api.post<Transaction>('/transactions/', data);
    return response.data;
  },

  update: async (id: number, data: TransactionUpdate) => {
    const response = await api.patch<Transaction>(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/transactions/${id}`);
  },
};
