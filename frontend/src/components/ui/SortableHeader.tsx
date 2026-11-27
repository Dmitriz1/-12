import type { SortOrder } from '../../types';
import styles from './SortableHeader.module.css';

interface Props {
  label: string;
  field: string;
  sortBy: string;
  sortOrder: SortOrder;
  onSort: (field: string) => void;
}

export function SortableHeader({ label, field, sortBy, sortOrder, onSort }: Props) {
  const active = sortBy === field;
  return (
    <button
      type="button"
      className={styles.sortable}
      onClick={() => onSort(field)}
      aria-label={`Сортировать по: ${label}`}
    >
      {label}
      {active && (
        <span aria-hidden="true" className={styles.arrow}>
          {sortOrder === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  );
}
