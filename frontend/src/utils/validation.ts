import type { TransactionCreate } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateCredentials(username: string, password: string): ValidationResult {
  const errors: Record<string, string> = {};
  if (!username.trim()) {
    errors.username = 'Введите имя пользователя';
  } else if (username.trim().length < 3) {
    errors.username = 'Минимум 3 символа';
  }
  if (!password) {
    errors.password = 'Введите пароль';
  } else if (password.length < 6) {
    errors.password = 'Минимум 6 символов';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateTransaction(
  data: Partial<TransactionCreate>,
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.title || !data.title.trim()) {
    errors.title = 'Введите название';
  } else if (data.title.trim().length < 3) {
    errors.title = 'Минимум 3 символа';
  }
  if (!data.category || !data.category.trim()) {
    errors.category = 'Выберите категорию';
  } else if (data.category.trim().length < 3) {
    errors.category = 'Минимум 3 символа';
  }
  if (data.type !== 'income' && data.type !== 'expense') {
    errors.type = 'Неверный тип';
  }
  if (data.amount === undefined || Number.isNaN(data.amount)) {
    errors.amount = 'Введите сумму';
  } else if (data.amount <= 0) {
    errors.amount = 'Сумма должна быть больше нуля';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}