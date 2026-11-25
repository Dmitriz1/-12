import { useState } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { TransactionForm } from '../../components/transactions/TransactionForm';
import { TransactionList } from '../../components/transactions/TransactionList';
import { BalanceSummary } from '../../components/transactions/BalanceSummary';
import { Spinner } from '../../components/ui/Spinner';
import inputStyles from '../../components/ui/Input.module.css';
import shared from '../../styles/shared.module.css';
import type { TransactionFilters } from '../../types';
import styles from './Transactions.module.css';

export function Transactions() {
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    per_page: 100,
  });
  const { transactions, loading, error, create, remove } =
    useTransactions(filters);

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить транзакцию?')) {
      remove(id).catch(() => alert('Не удалось удалить'));
    }
  };

  return (
    <div>
      <h1 className={styles.title}>Транзакции</h1>

      <BalanceSummary transactions={transactions} />

      <div className={styles.layout}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Новая транзакция</h2>
          <TransactionForm onSubmit={create} />
        </section>

        <section className={styles.panel}>
          <div className={styles.filters}>
            <label htmlFor="filter-category">Категория:</label>
            <input
              id="filter-category"
              className={`${inputStyles.input} ${styles.filterInput}`}
              placeholder="Все категории"
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  page: 1,
                  category: e.target.value || undefined,
                }))
              }
            />
          </div>

          {loading && <Spinner />}
          {error && (
            <p role="alert" className={shared.serverError}>
              {error}
            </p>
          )}
          {!loading && !error && (
            <TransactionList transactions={transactions} onDelete={handleDelete} />
          )}
        </section>
      </div>
    </div>
  );
}
