import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BalanceSummary } from '../components/BalanceSummary';
import type { Transaction } from '../types';

const txs: Transaction[] = [
  {
    id: 1,
    title: 'Зарплата',
    type: 'income',
    category: 'Работа',
    amount: 80000,
    created_at: '2026-05-01T09:00:00',
  },
  {
    id: 2,
    title: 'Кафе',
    type: 'expense',
    category: 'Еда',
    amount: 30000,
    created_at: '2026-05-02T12:00:00',
  },
];

describe('BalanceSummary', () => {
  it('отображает блок баланса', () => {
    render(<BalanceSummary transactions={txs} />);
    expect(screen.getByTestId('balance-summary')).toBeInTheDocument();
  });

  it('рассчитывает положительный баланс', () => {
    render(<BalanceSummary transactions={txs} />);
    const total = screen.getByTestId('balance-total');
    // 80000 - 30000 = 50000
    expect(total.textContent).toMatch(/50\s?000/);
  });

  it('помечает отрицательный баланс модификатором', () => {
    const negative: Transaction[] = [
      { ...txs[1], amount: 100000 },
    ];
    render(<BalanceSummary transactions={negative} />);
    const total = screen.getByTestId('balance-total');
    expect(total.className).toContain('balance__value--negative');
  });
});