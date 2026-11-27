import { api } from './client';
import type {
  User,
  UserCreate,
  UserFilters,
  UserListResponse,
  UserUpdate,
} from '../types';

export const usersApi = {
  list: (filters: UserFilters = {}) =>
    api.get<UserListResponse>('/users/', { params: filters }),

  getById: (id: number) => api.get<User>(`/users/${id}`),

  create: (data: UserCreate) => api.post<User>('/users/', data),

  update: (id: number, data: UserUpdate) =>
    api.patch<User>(`/users/${id}`, data),

  replace: (id: number, data: UserCreate) =>
    api.put<User>(`/users/${id}`, data),

  remove: (id: number) => api.delete(`/users/${id}`),
};
