import { useState, type FormEvent } from 'react';
import type { TransactionCreate, TransactionType } from '../types';
import { validateTransaction } from '../utils/validation';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const CATEGORIES = ['Еда', 'Транспорт', 'Развлечения', 'Счета', 'Шопинг', 'Работа', 'Другое'];

interface Props {
  onSubmit: (data: TransactionCreate) => Promise<void>;
}

export function TransactionForm({ onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const payload: TransactionCreate = {
      title: title.trim(),
      type,
      category,
      amount: parseFloat(amount),
    };

    const { valid, errors: validationErrors } = validateTransaction(payload);
    if (!valid) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      await onSubmit(payload);
      setTitle('');
      setAmount('');
      setType('expense');
      setCategory(CATEGORIES[0]);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Ошибка при сохранении');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="tx-form" onSubmit={handleSubmit} aria-label="Форма транзакции">
      <Input
        id="tx-title"
        label="Название"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="Например: Кафе"
      />

      <div className="field">
        <label htmlFor="tx-type">Тип</label>
        <select
          id="tx-type"
          className="input"
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
        >
          <option value="expense">Расход</option>
          <option value="income">Доход</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="tx-category">Категория</label>
        <select
          id="tx-category"
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.category && (
          <span role="alert" className="field__error">
            {errors.category}
          </span>
        )}
      </div>

      <Input
        id="tx-amount"
        label="Сумма"
        type="number"
        step="0.01"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
        placeholder="0.00"
      />

      {serverError && (
        <p role="alert" className="form__server-error">
          {serverError}
        </p>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Сохранение...' : 'Добавить'}
      </Button>
    </form>
  );
}