import { describe, it, expect } from 'vitest';
import { validateCredentials, validateTransaction } from '../utils/validation';

describe('validateCredentials', () => {
  it('возвращает ошибки для пустых полей', () => {
    const result = validateCredentials('', '');
    expect(result.valid).toBe(false);
    expect(result.errors.username).toBeDefined();
    expect(result.errors.password).toBeDefined();
  });

  it('требует минимум 3 символа для имени', () => {
    const result = validateCredentials('ab', 'pass');
    expect(result.valid).toBe(false);
    expect(result.errors.username).toBe('Минимум 3 символа');
  });

  it('требует минимум 4 символа для пароля', () => {
    const result = validateCredentials('alice', '123');
    expect(result.valid).toBe(false);
    expect(result.errors.password).toBe('Минимум 4 символа');
  });

  it('проходит при валидных данных', () => {
    const result = validateCredentials('alice', 'secret');
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });
});

describe('validateTransaction', () => {
  const base = { title: 'Кафе', type: 'expense' as const, category: 'Еда', amount: 500 };

  it('проходит при валидных данных', () => {
    expect(validateTransaction(base).valid).toBe(true);
  });

  it('отклоняет отрицательную сумму', () => {
    const result = validateTransaction({ ...base, amount: -10 });
    expect(result.valid).toBe(false);
    expect(result.errors.amount).toBe('Сумма должна быть больше нуля');
  });

  it('отклоняет нулевую сумму', () => {
    const result = validateTransaction({ ...base, amount: 0 });
    expect(result.valid).toBe(false);
  });

  it('требует название', () => {
    const result = validateTransaction({ ...base, title: '   ' });
    expect(result.valid).toBe(false);
    expect(result.errors.title).toBeDefined();
  });

  it('отклоняет неверный тип', () => {
    // @ts-expect-error намеренно неверный тип
    const result = validateTransaction({ ...base, type: 'transfer' });
    expect(result.valid).toBe(false);
    expect(result.errors.type).toBeDefined();
  });
});