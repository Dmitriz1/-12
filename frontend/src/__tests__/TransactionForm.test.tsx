import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionForm } from '../components/TransactionForm';

describe('TransactionForm', () => {
  it('показывает ошибки валидации при пустой отправке', async () => {
    const onSubmit = vi.fn();
    render(<TransactionForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /Добавить/i }));

    await waitFor(() => {
      expect(screen.getByText('Введите название')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('вызывает onSubmit с корректными данными', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TransactionForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Название'), {
      target: { value: 'Кафе' },
    });
    fireEvent.change(screen.getByLabelText('Сумма'), {
      target: { value: '500' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Добавить/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Кафе',
        type: 'expense',
        category: 'Еда',
        amount: 500,
      });
    });
  });

  it('не отправляет форму с отрицательной суммой', async () => {
    const onSubmit = vi.fn();
    render(<TransactionForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Название'), {
      target: { value: 'Тест' },
    });
    fireEvent.change(screen.getByLabelText('Сумма'), {
      target: { value: '-100' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Добавить/i }));

    await waitFor(() => {
      expect(screen.getByText('Сумма должна быть больше нуля')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});