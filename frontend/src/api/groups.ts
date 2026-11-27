import { api } from './client';
import type {
  Group,
  GroupCreate,
  GroupFilters,
  GroupListResponse,
  GroupUpdate,
} from '../types';

export const groupsApi = {
  getAll: async (filters: GroupFilters = {}, signal?: AbortSignal) => {
    const response = await api.get<GroupListResponse>('/groups/', {
      params: filters,
      signal,
    });
    return response.data;
  },

  getById: async (id: number, signal?: AbortSignal) => {
    const response = await api.get<Group>(`/groups/${id}`, { signal });
    return response.data;
  },

  create: async (data: GroupCreate) => {
    const response = await api.post<Group>('/groups/', data);
    return response.data;
  },

  update: async (id: number, data: GroupUpdate) => {
    const response = await api.patch<Group>(`/groups/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/groups/${id}`);
  },
};
