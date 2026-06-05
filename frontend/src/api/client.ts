import axios, { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({ baseURL });

const TOKEN_KEY = 'finance_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// Подставляем токен в каждый запрос
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Единая обработка сетевых ошибок
export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const detail = error.response.data?.detail;
      if (typeof detail === 'string') return detail;
      return `Ошибка сервера: ${error.response.status}`;
    }
    return 'Сервер недоступен. Проверьте подключение.';
  }
  return 'Неизвестная ошибка';
}