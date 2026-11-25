import { useEffect, useState } from 'react';
import { analyticsApi } from '../api/analytics';
import { extractErrorMessage } from '../api/client';
import type { CategoryAnalytics, TimelineAnalytics } from '../types';

export function useAnalytics() {
  const [byCategory, setByCategory] = useState<CategoryAnalytics | null>(null);
  const [timeline, setTimeline] = useState<TimelineAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [cat, tl] = await Promise.all([
          analyticsApi.byCategory(),
          analyticsApi.timeline({ granularity: 'day' }),
        ]);
        if (!cancelled) {
          setByCategory(cat.data);
          setTimeline(tl.data);
        }
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { byCategory, timeline, loading, error };
}