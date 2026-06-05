import type { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { Button } from './ui/Button';

interface Props {
  transactions: Transaction[];
  onDelete: (id: number) => void;
}

export function TransactionList({ transactions, onDelete }: Props) {
  if (transactions.length === 0) {
    return <p className="empty-state">Нет транзакций за выбранный период</p>;
  }

  return (
    <table className="tx-table" aria-label="Список транзакций">
      <thead>
        <tr>
          <th>Название</th>
          <th>Категория</th>
          <th>Тип</th>
          <th>Сумма</th>
          <th>Дата</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx) => (
          <tr key={tx.id} data-testid={`tx-row-${tx.id}`}>
            <td>{tx.title}</td>
            <td>{tx.category}</td>
            <td>
              <span className={`badge badge--${tx.type}`}>
                {tx.type === 'income' ? 'Доход' : 'Расход'}
              </span>
            </td>
            <td className={tx.type === 'income' ? 'amount--income' : 'amount--expense'}>
              {tx.type === 'income' ? '+' : '-'}
              {formatCurrency(tx.amount)}
            </td>
            <td>{formatDate(tx.created_at)}</td>
            <td>
              <Button
                variant="danger"
                onClick={() => onDelete(tx.id)}
                aria-label={`Удалить ${tx.title}`}
              >
                ✕
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}