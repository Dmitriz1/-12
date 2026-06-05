import { api } from './client';
import type { AuthResponse } from '../types';

export const authApi = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { username, password }),

  register: (username: string, password: string) =>
    api.post<{ id: number }>('/auth/register', { username, password }),

  changePassword: (old_password: string, new_password: string) =>
    api.post('/auth/change-password', { old_password, new_password }),

  refresh: (token: string) => api.post<AuthResponse>('/auth/refresh', { token }),
};