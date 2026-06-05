import { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';
import { BalanceSummary } from '../components/BalanceSummary';
import { Spinner } from '../components/ui/Spinner';
import type { TransactionFilters } from '../types';

export function Transactions() {
  const [filters, setFilters] = useState<TransactionFilters>({ limit: 100, offset: 0 });
  const { transactions, loading, error, create, remove } = useTransactions(filters);

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить транзакцию?')) {
      remove(id).catch(() => alert('Не удалось удалить'));
    }
  };

  return (
    <div className="page">
      <h1>Транзакции</h1>

      <BalanceSummary transactions={transactions} />

      <div className="tx-layout">
        <section className="tx-layout__form">
          <h2>Новая транзакция</h2>
          <TransactionForm onSubmit={create} />
        </section>

        <section className="tx-layout__list">
          <div className="filters">
            <label htmlFor="filter-category">Категория:</label>
            <input
              id="filter-category"
              className="input"
              placeholder="Все категории"
              onChange={(e) =>
                setFilters((f) => ({ ...f, category: e.target.value || undefined }))
              }
            />
          </div>

          {loading && <Spinner />}
          {error && (
            <p role="alert" className="form__server-error">
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