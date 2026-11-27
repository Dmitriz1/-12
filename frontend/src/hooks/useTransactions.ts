import { transactionsApi } from '../api/transactions';
import type { Transaction, TransactionFilters } from '../types';
import { usePaginatedList } from './usePaginatedList';

export function useTransactions(filters: TransactionFilters = {}) {
  const { data, loading, error, reload } = usePaginatedList<
    Transaction,
    TransactionFilters
  >(transactionsApi.getAll, filters);

  return {
    transactions: data?.items ?? [],
    meta: data,
    loading,
    error,
    reload,
  };
}
