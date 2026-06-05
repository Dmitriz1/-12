import { useCallback, useEffect, useState } from 'react';
import { transactionsApi } from '../api/transactions';
import { extractErrorMessage } from '../api/client';
import type { Transaction, TransactionCreate, TransactionFilters } from '../types';

export function useTransactions(filters: TransactionFilters = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await transactionsApi.list(JSON.parse(filtersKey));
      setTransactions(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (payload: TransactionCreate) => {
      await transactionsApi.create(payload);
      await load();
    },
    [load],
  );

  const remove = useCallback(
    async (id: number) => {
      await transactionsApi.remove(id);
      await load();
    },
    [load],
  );

  return { transactions, loading, error, reload: load, create, remove };
}