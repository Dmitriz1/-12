import { useEffect, useState, type FormEvent } from 'react';
import { groupsApi } from '../../api/groups';
import { useGroups } from '../../hooks/useGroups';
import { useNotification } from '../../components/Notification/NotificationContext';
import { Button } from '../../components/ui/Button';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { Pagination } from '../../components/ui/Pagination';
import { SortableHeader } from '../../components/ui/SortableHeader';
import { Spinner } from '../../components/ui/Spinner';
import { Table, type Column } from '../../components/ui/Table';
import inputStyles from '../../components/ui/Input.module.css';
import shared from '../../styles/shared.module.css';
import { handleApiError } from '../../utils/apiErrorHandler';
import type { Group, GroupFilters, SortOrder } from '../../types';
import styles from './Groups.module.css';

const PER_PAGE = 10;

export function GroupsList() {
  const showNotification = useNotification();

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<NonNullable<GroupFilters['sort_by']>>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { groups, meta, loading, error, reload } = useGroups({
    page,
    per_page: PER_PAGE,
    sort_by: sortBy,
    sort_order: sortOrder,
    search: search || undefined,
  });

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
    setSearch(searchDraft.trim());
    setPage(1);
  }

  function resetFilters() {
    setSearchDraft('');
    setSearch('');
    setPage(1);
  }

  async function handleDelete(group: Group) {
    if (!window.confirm(`Удалить группу «${group.name}»?`)) return;
    try {
      setDeletingId(group.id);
      await groupsApi.delete(group.id);
      showNotification('Группа удалена', 'success');
      reload();
    } catch (err) {
      showNotification(handleApiError(err), 'error');
    } finally {
      setDeletingId(null);
    }
  }

  const header = (label: string, field: string) => (
    <SortableHeader
      label={label}
      field={field}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={handleSort}
    />
  );

  const columns: Column<Group>[] = [
    { key: 'id', id: 'id', title: header('ID', 'id') },
    { key: 'name', title: header('Название', 'name') },
    {
      key: 'id',
      id: 'actions',
      title: 'Действия',
      render: (_id, row) => (
        <div className={styles.actions}>
          <ButtonLink
            to={`/groups/${row.id}/edit`}
            variant="secondary"
            aria-label={`Редактировать ${row.name}`}
          >
            Редактировать
          </ButtonLink>
          <Button
            variant="danger"
            onClick={() => handleDelete(row)}
            disabled={deletingId === row.id}
            aria-label={`Удалить ${row.name}`}
          >
            {deletingId === row.id ? 'Удаление...' : 'Удалить'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1>Группы</h1>
        <ButtonLink to="/groups/new">Добавить группу</ButtonLink>
      </div>

      <section className={styles.panel}>
        <form className={shared.toolbar} onSubmit={applyFilters} aria-label="Фильтры">
          <div className={shared.toolbarGrow}>
            <label htmlFor="group-search" className={inputStyles.label}>
              Поиск
            </label>
            <input
              id="group-search"
              className={inputStyles.input}
              placeholder="Поиск по названию..."
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
            />
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

        {!loading && !error && groups.length === 0 && (
          <p className={shared.emptyState}>
            {search ? 'Ничего не найдено.' : 'Групп пока нет. Создайте первую!'}
          </p>
        )}

        {!error && groups.length > 0 && (
          <Table
            columns={columns}
            data={groups}
            ariaLabel="Список групп"
            rowKey={(g) => g.id}
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
