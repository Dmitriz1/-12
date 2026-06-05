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
  } else if (password.length < 4) {
    errors.password = 'Минимум 4 символа';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateTransaction(
  data: Partial<TransactionCreate>,
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.title || !data.title.trim()) {
    errors.title = 'Введите название';
  }
  if (!data.category || !data.category.trim()) {
    errors.category = 'Выберите категорию';
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