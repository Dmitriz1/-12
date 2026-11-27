import { useEffect, useState, type FormEvent } from 'react';
import { transactionsApi } from '../../api/transactions';
import { useTransactions } from '../../hooks/useTransactions';
import { useNotification } from '../../components/Notification/NotificationContext';
import { TransactionList } from '../../components/transactions/TransactionList';
import { BalanceSummary } from '../../components/transactions/BalanceSummary';
import { Button } from '../../components/ui/Button';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import inputStyles from '../../components/ui/Input.module.css';
import shared from '../../styles/shared.module.css';
import { handleApiError } from '../../utils/apiErrorHandler';
import type { SortOrder, TransactionFilters, TransactionType } from '../../types';
import styles from './Transactions.module.css';


const PER_PAGE = 10;
const MIN_SEARCH_LENGTH = 2; // ограничение backend (search: min_length=2)

interface DraftFilters {
  search: string;
  category: string;
  type: '' | TransactionType;
}

const EMPTY_FILTERS: DraftFilters = { search: '', category: '', type: '' };

export function Transactions() {
  const showNotification = useNotification();

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<NonNullable<TransactionFilters['sort_by']>>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [draft, setDraft] = useState<DraftFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<DraftFilters>(EMPTY_FILTERS);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filters: TransactionFilters = {
    page,
    per_page: PER_PAGE,
    sort_by: sortBy,
    sort_order: sortOrder,
    search: applied.search || undefined,
    category: applied.category || undefined,
    type: applied.type || undefined,
  };

  const { transactions, meta, loading, error, reload } = useTransactions(filters);

  // Если удалили последнюю запись на странице — возвращаемся на предыдущую
  useEffect(() => {
    if (!loading && meta && meta.items.length === 0 && page > 1) {
      setPage(Math.max(1, meta.total_pages));
    }
  }, [loading, meta, page]);

  function handleSort(field: string) {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field as typeof sortBy);
      setSortOrder('asc');
    }
    setPage(1);
  }

  function applyFilters(e: FormEvent) {
    e.preventDefault();
    const search = draft.search.trim();
    if (search && search.length < MIN_SEARCH_LENGTH) {
      showNotification(`Поиск: минимум ${MIN_SEARCH_LENGTH} символа`, 'error');
      return;
    }
    setApplied({ ...draft, search, category: draft.category.trim() });
    setPage(1);
  }

  function resetFilters() {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Удалить транзакцию?')) return;
    try {
      setDeletingId(id);
      await transactionsApi.delete(id);
      showNotification('Транзакция удалена', 'success');
      reload();
    } catch (err) {
      showNotification(handleApiError(err), 'error');
    } finally {
      setDeletingId(null);
    }
  }

  const hasFilters = Boolean(applied.search || applied.category || applied.type);

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1>Транзакции</h1>
        <ButtonLink to="/transactions/new">Добавить транзакцию</ButtonLink>
      </div>

      <BalanceSummary transactions={transactions} />
      <p className={shared.hint}>Баланс рассчитан по транзакциям на текущей странице.</p>

      <section className={styles.panel}>
        <form className={shared.toolbar} onSubmit={applyFilters} aria-label="Фильтры">
          <div className={shared.toolbarGrow}>
            <label htmlFor="filter-search" className={inputStyles.label}>
              Поиск
            </label>
            <input
              id="filter-search"
              className={inputStyles.input}
              placeholder="Название или категория..."
              value={draft.search}
              onChange={(e) => setDraft({ ...draft, search: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="filter-category" className={inputStyles.label}>
              Категория
            </label>
            <input
              id="filter-category"
              className={inputStyles.input}
              placeholder="Все категории"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="filter-type" className={inputStyles.label}>
              Тип
            </label>
            <select
              id="filter-type"
              className={inputStyles.input}
              value={draft.type}
              onChange={(e) =>
                setDraft({ ...draft, type: e.target.value as DraftFilters['type'] })
              }
            >
              <option value="">Все</option>
              <option value="income">Доход</option>
              <option value="expense">Расход</option>
            </select>
          </div>
          <Button type="submit">Применить фильтры</Button>
          <Button type="button" variant="ghost" onClick={resetFilters}>
            Сбросить
          </Button>
        </form>

        {loading && <Spinner />}

        {error && (
          <div role="alert" className={shared.errorBox}>
            <span>{error}</span>
            <Button variant="secondary" onClick={reload}>
              Повторить
            </Button>
          </div>
        )}

        {!loading && !error && transactions.length === 0 && (
          <p className={shared.emptyState}>
            {hasFilters
              ? 'Ничего не найдено. Измените условия поиска.'
              : 'Транзакций пока нет. Добавьте первую!'}
          </p>
        )}

        {!error && transactions.length > 0 && (
          <TransactionList
            transactions={transactions}
            onDelete={handleDelete}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            deletingId={deletingId}
          />
        )}

        {meta && !error && (
          <Pagination
            page={meta.page}
            totalPages={meta.total_pages}
            total={meta.total}
            disabled={loading}
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}
