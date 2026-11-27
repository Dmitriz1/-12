import { describe, it, expect } from 'vitest';
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import {
  getFieldErrors,
  handleApiError,
  isRequestCancelled,
} from '../utils/apiErrorHandler';

function httpError(status: number, data: unknown): AxiosError {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError('fail', 'ERR_BAD_REQUEST', config, {}, response);
}

describe('handleApiError', () => {
  it('400: возвращает detail', () => {
    expect(handleApiError(httpError(400, { detail: 'Invalid sort field', error_code: 'BAD_REQUEST' }))).toBe(
      'Invalid sort field',
    );
  });

  it('400 VALIDATION_ERROR: перечисляет поля', () => {
    const err = httpError(400, {
      detail: 'validation error',
      error_code: 'VALIDATION_ERROR',
      fields: ['title', 'amount'],
    });
    expect(handleApiError(err)).toBe('Проверьте поля: title, amount');
  });

  it('401 без detail', () => {
    expect(handleApiError(httpError(401, {}))).toBe('Необходима авторизация');
  });

  it('401 с detail (неверный пароль) показывает сообщение сервера', () => {
    expect(handleApiError(httpError(401, { detail: 'Неверный пароль' }))).toBe('Неверный пароль');
  });

  it('403/404/409/422/500', () => {
    expect(handleApiError(httpError(403, {}))).toBe('Доступ запрещён');
    expect(handleApiError(httpError(404, {}))).toBe('Ресурс не найден');
    expect(handleApiError(httpError(404, { detail: 'Group with id 5 not found' }))).toBe(
      'Group with id 5 not found',
    );
    expect(handleApiError(httpError(409, {}))).toBe('Конфликт данных');
    expect(handleApiError(httpError(422, {}))).toBe('Ошибка валидации данных');
    expect(handleApiError(httpError(500, {}))).toBe('Внутренняя ошибка сервера');
  });

  it('нет ответа сервера', () => {
    const err = new AxiosError('Network Error', 'ERR_NETWORK', undefined, {});
    expect(handleApiError(err)).toBe('Нет соединения с сервером');
  });

  it('не-axios ошибка', () => {
    expect(handleApiError(new Error('boom'))).toBe('boom');
    expect(handleApiError('x')).toBe('Произошла неизвестная ошибка');
  });
});

describe('getFieldErrors / isRequestCancelled', () => {
  it('собирает ошибки по полям', () => {
    const err = httpError(400, { detail: 'validation error', error_code: 'VALIDATION_ERROR', fields: ['name'] });
    expect(getFieldErrors(err)).toEqual({ name: 'Некорректное значение' });
    expect(getFieldErrors(new Error('x'))).toEqual({});
  });

  it('определяет отмену запроса', () => {
    expect(isRequestCancelled(new AxiosError('c', AxiosError.ERR_CANCELED))).toBe(true);
    expect(isRequestCancelled(new Error('c'))).toBe(false);
  });
});
