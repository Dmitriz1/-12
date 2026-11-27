import type { SortOrder, Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Button } from '../ui/Button';
import { ButtonLink } from '../ui/ButtonLink';
import { SortableHeader } from '../ui/SortableHeader';
import { Table, type Column } from '../ui/Table';
import shared from '../../styles/shared.module.css';

interface Props {
  transactions: Transaction[];
  onDelete: (id: number) => void;
  sortBy?: string;
  sortOrder?: SortOrder;
  onSort?: (field: string) => void;
  deletingId?: number | null;
}

export function TransactionList({
  transactions,
  onDelete,
  sortBy = '',
  sortOrder = 'asc',
  onSort,
  deletingId = null,
}: Props) {
  if (transactions.length === 0) {
    return (
      <p className={shared.emptyState}>Нет транзакций за выбранный период</p>
    );
  }

  const header = (label: string, field: string) =>
    onSort ? (
      <SortableHeader
        label={label}
        field={field}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
      />
    ) : (
      label
    );

  const columns: Column<Transaction>[] = [
    { key: 'title', title: header('Название', 'title') },
    { key: 'category', title: header('Категория', 'category') },
    {
      key: 'type',
      title: 'Тип',
      render: (value) => {
        const type = value as Transaction['type'];
        return (
          <span
            className={`${shared.badge} ${
              type === 'income' ? shared.badgeIncome : shared.badgeExpense
            }`}
          >
            {type === 'income' ? 'Доход' : 'Расход'}
          </span>
        );
      },
    },
    {
      key: 'amount',
      title: header('Сумма', 'amount'),
      cellClassName: (row) =>
        row.type === 'income' ? shared.amountIncome : shared.amountExpense,
      render: (value, row) => (
        <>
          {row.type === 'income' ? '+' : '-'}
          {formatCurrency(value as number)}
        </>
      ),
    },
    {
      key: 'created_at',
      title: header('Дата', 'created_at'),
      render: (value) => formatDate(String(value)),
    },
    {
      key: 'id',
      title: '',
      render: (_value, row) => (
        <div className={shared.rowActions}>
          <ButtonLink
            to={`/transactions/${row.id}/edit`}
            variant="secondary"
            aria-label={`Редактировать ${row.title}`}
          >
            Редактировать
          </ButtonLink>
          <Button
            variant="danger"
            onClick={() => onDelete(row.id)}
            disabled={deletingId === row.id}
            aria-label={`Удалить ${row.title}`}
          >
            {deletingId === row.id ? 'Удаление...' : '✕'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={transactions}
      ariaLabel="Список транзакций"
      rowKey={(tx) => tx.id}
      rowTestId={(tx) => `tx-row-${tx.id}`}
    />
  );
}

