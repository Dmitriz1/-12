import type { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Button } from '../ui/Button';
import { Table, type Column } from '../ui/Table';
import shared from '../../styles/shared.module.css';

interface Props {
  transactions: Transaction[];
  onDelete: (id: number) => void;
}

export function TransactionList({ transactions, onDelete }: Props) {
  if (transactions.length === 0) {
    return (
      <p className={shared.emptyState}>Нет транзакций за выбранный период</p>
    );
  }

  const columns: Column<Transaction>[] = [
    { key: 'title', title: 'Название' },
    { key: 'category', title: 'Категория' },
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
      title: 'Сумма',
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
      title: 'Дата',
      render: (value) => formatDate(String(value)),
    },
    {
      key: 'id',
      title: '',
      render: (_value, row) => (
        <Button
          variant="danger"
          onClick={() => onDelete(row.id)}
          aria-label={`Удалить ${row.title}`}
        >
          ✕
        </Button>
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
