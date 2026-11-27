import { useCallback, useEffect, useState } from 'react';
import { usersApi } from '../api/users';
import { extractErrorMessage } from '../api/client';
import type { User, UserCreate, UserFilters, UserUpdate } from '../types';

export function useUsers(filters: UserFilters = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await usersApi.list(JSON.parse(filtersKey));
      setUsers(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
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
    async (payload: UserCreate) => {
      await usersApi.create(payload);
      await load();
    },
    [load],
  );

  const update = useCallback(
    async (id: number, payload: UserUpdate) => {
      await usersApi.update(id, payload);
      await load();
    },
    [load],
  );

  const remove = useCallback(
    async (id: number) => {
      await usersApi.remove(id);
      await load();
    },
    [load],
  );

  return { users, total, totalPages, loading, error, reload: load, create, update, remove };
}
