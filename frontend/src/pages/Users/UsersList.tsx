import { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { Button } from '../../components/ui/Button';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { Spinner } from '../../components/ui/Spinner';
import { Table, type Column } from '../../components/ui/Table';
import inputStyles from '../../components/ui/Input.module.css';
import shared from '../../styles/shared.module.css';
import type { User, UserFilters } from '../../types';
import styles from './Users.module.css';

const PER_PAGE_OPTIONS = [5, 10, 20];

export function UsersList() {
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    per_page: 5,
    sort_by: 'id',
    sort_order: 'asc',
  });
  const { users, total, totalPages, loading, error, remove } = useUsers(filters);

  const page = filters.page ?? 1;
  const perPage = filters.per_page ?? 5;
  const sortBy = filters.sort_by ?? 'id';
  const sortOrder = filters.sort_order ?? 'asc';

  const handleSearch = (value: string) => {
    setFilters((f) => ({ ...f, page: 1, search: value || undefined }));
  };

  const handleSort = (field: 'id' | 'username') => {
    setFilters((f) => ({
      ...f,
      page: 1,
      sort_by: field,
      sort_order: sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleDelete = (user: User) => {
    if (!window.confirm(`Удалить пользователя «${user.username}»?`)) {
      return;
    }
    remove(user.id).catch(() => alert('Не удалось удалить пользователя'));
  };

  const sortButton = (field: 'id' | 'username', label: string) => (
    <button
      type="button"
      className={styles.sortButton}
      onClick={() => handleSort(field)}
      aria-label={`Сортировать по ${label}`}
    >
      {label}
      {sortBy === field ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
    </button>
  );

  const columns: Column<User>[] = [
    { key: 'id', title: sortButton('id', 'ID') },
    { key: 'username', title: sortButton('username', 'Имя пользователя') },
    {
      key: 'id',
      title: '',
      render: (_value, row) => (
        <div className={styles.rowActions}>
          <ButtonLink
            to={`/users/${row.id}/edit`}
            variant="secondary"
            aria-label={`Редактировать ${row.username}`}
          >
            ✎
          </ButtonLink>
          <Button
            variant="danger"
            onClick={() => handleDelete(row)}
            aria-label={`Удалить ${row.username}`}
          >
            ✕
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Пользователи</h1>
        <ButtonLink to="/users/new">Добавить пользователя</ButtonLink>
      </div>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <input
            className={`${inputStyles.input} ${styles.searchInput}`}
            placeholder="Поиск по имени или id"
            aria-label="Поиск пользователей"
            value={filters.search ?? ''}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <label className={styles.perPage}>
            На странице:
            <select
              className={inputStyles.input}
              aria-label="Записей на странице"
              value={perPage}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  page: 1,
                  per_page: Number(e.target.value),
                }))
              }
            >
              {PER_PAGE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading && <Spinner />}
        {error && (
          <p role="alert" className={shared.serverError}>
            {error}
          </p>
        )}

        {!loading && !error && users.length === 0 && (
          <p className={shared.emptyState}>Пользователи не найдены</p>
        )}

        {!loading && !error && users.length > 0 && (
          <Table
            columns={columns}
            data={users}
            ariaLabel="Список пользователей"
            rowKey={(user) => user.id}
            rowTestId={(user) => `user-row-${user.id}`}
          />
        )}

        <div className={styles.pagination}>
          <span>
            Всего: {total}. Страница {totalPages === 0 ? 0 : page} из {totalPages}
          </span>
          <div className={styles.paginationButtons}>
            <Button
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: page - 1 }))}
            >
              Назад
            </Button>
            <Button
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: page + 1 }))}
            >
              Вперёд
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
