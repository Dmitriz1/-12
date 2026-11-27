import { groupsApi } from '../api/groups';
import type { Group, GroupFilters } from '../types';
import { usePaginatedList } from './usePaginatedList';

export function useGroups(filters: GroupFilters = {}) {
  const { data, loading, error, reload } = usePaginatedList<Group, GroupFilters>(
    groupsApi.getAll,
    filters,
  );

  return {
    groups: data?.items ?? [],
    meta: data,
    loading,
    error,
    reload,
  };
}
