import { useCallback, useEffect, useState } from 'react';
import { handleApiError, isRequestCancelled } from '../utils/apiErrorHandler';
import type { PaginatedResponse } from '../types';

type Fetcher<T, P> = (params: P, signal: AbortSignal) => Promise<PaginatedResponse<T>>;

export function usePaginatedList<T, P extends object>(fetcher: Fetcher<T, P>, params: P) {
  const [data, setData] = useState<PaginatedResponse<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetcher(JSON.parse(paramsKey) as P, controller.signal)
      .then((result) => setData(result))
      .catch((err) => {
        if (isRequestCancelled(err)) return;
        setError(handleApiError(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [paramsKey, reloadToken]);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  return { data, loading, error, reload };
}
