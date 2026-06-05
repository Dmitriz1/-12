import { describe, it, expect } from 'vitest';
import { calculateBalance, formatDate } from '../utils/format';

describe('calculateBalance', () => {
  it('считает доходы, расходы и баланс', () => {
    const result = calculateBalance([
      { type: 'income', amount: 1000 },
      { type: 'income', amount: 500 },
      { type: 'expense', amount: 300 },
    ]);
    expect(result.income).toBe(1500);
    expect(result.expense).toBe(300);
    expect(result.total).toBe(1200);
  });

  it('возвращает нули для пустого списка', () => {
    const result = calculateBalance([]);
    expect(result).toEqual({ income: 0, expense: 0, total: 0 });
  });

  it('баланс может быть отрицательным', () => {
    const result = calculateBalance([{ type: 'expense', amount: 100 }]);
    expect(result.total).toBe(-100);
  });
});

describe('formatDate', () => {
  it('форматирует ISO-дату в ДД.ММ.ГГГГ', () => {
    expect(formatDate('2026-05-15T12:00:00')).toBe('15.05.2026');
  });

  it('возвращает исходную строку для невалидной даты', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});