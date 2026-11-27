import { memo } from 'react';
import type { Transaction } from '../../types';
import { calculateBalance, formatCurrency } from '../../utils/format';
import styles from './BalanceSummary.module.css';

export const BalanceSummary = memo(function BalanceSummary({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const { income, expense, total } = calculateBalance(transactions);

  return (
    <div className={styles.balance} data-testid="balance-summary">
      <div
        className={`${styles['balance__card']} ${styles['balance__card--income']}`}
      >
        <span className={styles['balance__label']}>Доходы</span>
        <span className={styles['balance__value']}>{formatCurrency(income)}</span>
      </div>
      <div
        className={`${styles['balance__card']} ${styles['balance__card--expense']}`}
      >
        <span className={styles['balance__label']}>Расходы</span>
        <span className={styles['balance__value']}>{formatCurrency(expense)}</span>
      </div>
      <div
        className={`${styles['balance__card']} ${styles['balance__card--total']}`}
      >
        <span className={styles['balance__label']}>Баланс</span>
        <span
          className={`${styles['balance__value']} ${
            total < 0 ? styles['balance__value--negative'] : ''
          }`}
          data-testid="balance-total"
        >
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
});
