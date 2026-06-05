import { memo } from 'react';
import type { Transaction } from '../types';
import { calculateBalance, formatCurrency } from '../utils/format';

export const BalanceSummary = memo(function BalanceSummary({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const { income, expense, total } = calculateBalance(transactions);

  return (
    <div className="balance" data-testid="balance-summary">
      <div className="balance__card balance__card--income">
        <span className="balance__label">Доходы</span>
        <span className="balance__value">{formatCurrency(income)}</span>
      </div>
      <div className="balance__card balance__card--expense">
        <span className="balance__label">Расходы</span>
        <span className="balance__value">{formatCurrency(expense)}</span>
      </div>
      <div className="balance__card balance__card--total">
        <span className="balance__label">Баланс</span>
        <span
          className={`balance__value ${total < 0 ? 'balance__value--negative' : ''}`}
          data-testid="balance-total"
        >
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
});