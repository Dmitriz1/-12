import type { ReactNode } from 'react';
import styles from './Table.module.css';

export interface Column<T> {
  key: keyof T;
  title: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
  cellClassName?: (row: T) => string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  ariaLabel?: string;
  className?: string;
  rowKey?: (row: T, index: number) => string | number;
  rowTestId?: (row: T, index: number) => string;
}

export function Table<T>({
  columns,
  data,
  ariaLabel,
  className = '',
  rowKey,
  rowTestId,
}: TableProps<T>) {
  return (
    <table className={`${styles.table} ${className}`.trim()} aria-label={ariaLabel}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)}>{col.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr
            key={rowKey ? rowKey(row, index) : index}
            data-testid={rowTestId?.(row, index)}
          >
            {columns.map((col) => (
              <td key={String(col.key)} className={col.cellClassName?.(row)}>
                {col.render
                  ? col.render(row[col.key], row)
                  : (row[col.key] as unknown as ReactNode)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
