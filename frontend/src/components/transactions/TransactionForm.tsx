import { useState, type FormEvent } from 'react';
import type { TransactionCreate, TransactionType } from '../../types';
import { FormSubmitError } from '../../utils/apiErrorHandler';
import { validateTransaction } from '../../utils/validation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import inputStyles from '../ui/Input.module.css';
import shared from '../../styles/shared.module.css';

const CATEGORIES = ['Еда', 'Транспорт', 'Развлечения', 'Счета', 'Шопинг', 'Работа', 'Другое'];

interface Props {
  onSubmit: (data: TransactionCreate) => Promise<void>;
  initialValues?: TransactionCreate;
  submitLabel?: string;
  resetOnSuccess?: boolean;
}

export function TransactionForm({
  onSubmit,
  initialValues,
  submitLabel = 'Добавить',
  resetOnSuccess = true,
}: Props) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [type, setType] = useState<TransactionType>(initialValues?.type ?? 'expense');
  const [category, setCategory] = useState(initialValues?.category ?? CATEGORIES[0]);
  const [amount, setAmount] = useState(
    initialValues ? String(initialValues.amount) : '',
  );
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
      if (resetOnSuccess) {
        setTitle('');
        setAmount('');
        setType('expense');
        setCategory(CATEGORIES[0]);
      }
    } catch (err) {
      if (err instanceof FormSubmitError) {
        setErrors(err.fieldErrors);
      }
      setServerError(err instanceof Error ? err.message : 'Ошибка при сохранении');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Форма транзакции">
      <Input
        id="tx-title"
        label="Название"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="Например: Кафе"
      />

      <div className={inputStyles.field}>
        <label htmlFor="tx-type" className={inputStyles.label}>
          Тип
        </label>
        <select
          id="tx-type"
          className={inputStyles.input}
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
        >
          <option value="expense">Расход</option>
          <option value="income">Доход</option>
        </select>
      </div>

      <div className={inputStyles.field}>
        <label htmlFor="tx-category" className={inputStyles.label}>
          Категория
        </label>
        <select
          id="tx-category"
          className={inputStyles.input}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {(CATEGORIES.includes(category) ? CATEGORIES : [category, ...CATEGORIES]).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.category && (
          <span role="alert" className={inputStyles.errorMessage}>
            {errors.category}
          </span>
        )}
      </div>

      <Input
        id="tx-amount"
        label="Сумма"
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
        placeholder="0.00"
      />

      {serverError && (
        <p role="alert" className={shared.serverError}>
          {serverError}
        </p>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Сохранение...' : submitLabel}
      </Button>
    </form>
  );
}
