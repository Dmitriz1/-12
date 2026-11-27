import { Button } from './Button';
import styles from './Pagination.module.css';

interface Props {
  page: number;
  totalPages: number;
  total?: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, disabled, onPageChange }: Props) {
  const pages = Math.max(totalPages, 1);
  return (
    <nav className={styles.pagination} aria-label="Пагинация">
      <Button
        variant="secondary"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={disabled || page <= 1}
      >
        Назад
      </Button>
      <span>
        Страница {page} из {pages}
        {total !== undefined && ` (всего: ${total})`}
      </span>
      <Button
        variant="secondary"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= pages}
      >
        Вперёд
      </Button>
    </nav>
  );
}
