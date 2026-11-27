import { AxiosError } from 'axios';
import type { ApiError } from '../types';

export function handleApiError(error: unknown): string {
  if (!(error instanceof AxiosError)) {
    return error instanceof Error && error.message
      ? error.message
      : 'Произошла неизвестная ошибка';
  }

  const err = error as AxiosError<Partial<ApiError>>;

  if (err.response) {
    const { status, data } = err.response;
    const detail = typeof data?.detail === 'string' ? data.detail : undefined;

    switch (status) {
      case 400:
        if (data?.error_code === 'VALIDATION_ERROR' && data.fields?.length) {
          return `Проверьте поля: ${data.fields.join(', ')}`;
        }
        return detail || 'Неверные данные';
      case 401:
        return detail || 'Необходима авторизация';
      case 403:
        return 'Доступ запрещён';
      case 404:
        return detail || 'Ресурс не найден';
      case 409:
        return detail || 'Конфликт данных';
      case 422:
        return 'Ошибка валидации данных';
      case 500:
        return 'Внутренняя ошибка сервера';
      default:
        return detail || 'Произошла ошибка';
    }
  }

  if (err.request) {
    return 'Нет соединения с сервером';
  }
  return 'Ошибка при выполнении запроса';
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof AxiosError)) return {};
  const fields = (error.response?.data as Partial<ApiError> | undefined)?.fields;
  if (!Array.isArray(fields)) return {};
  return Object.fromEntries(
    fields.filter(Boolean).map((f) => [f, 'Некорректное значение']),
  );
}

export function isRequestCancelled(error: unknown): boolean {
  return error instanceof AxiosError && error.code === AxiosError.ERR_CANCELED;
}

export class FormSubmitError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'FormSubmitError';
    this.fieldErrors = fieldErrors;
  }
}

export function toFormSubmitError(error: unknown): FormSubmitError {
  return new FormSubmitError(handleApiError(error), getFieldErrors(error));
}
