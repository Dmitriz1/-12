import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NotificationProvider } from '../components/Notification/NotificationContext';
import { Transactions } from '../pages/Transactions';
import { TransactionFormPage } from '../pages/Transactions/TransactionFormPage';
import { transactionsApi } from '../api/transactions';
import type { Transaction, TransactionListResponse } from '../types';

vi.mock('../api/transactions', () => ({
  transactionsApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const api = vi.mocked(transactionsApi);

const tx = (id: number, over: Partial<Transaction> = {}): Transaction => ({
  id,
  title: `Операция ${id}`,
  type: 'expense',
  category: 'Еда',
  amount: 100 * id,
  created_at: '2026-01-15T10:00:00',
  ...over,
});

const list = (items: Transaction[], page = 1, total_pages = 1): TransactionListResponse => ({
  items,
  total: items.length,
  page,
  per_page: 10,
  total_pages,
});

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <NotificationProvider>
        <Routes>
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/new" element={<TransactionFormPage />} />
          <Route path="/transactions/:id/edit" element={<TransactionFormPage />} />
        </Routes>
      </NotificationProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Transactions (список)', () => {
  it('загружает данные с пагинацией и сортировкой по умолчанию', async () => {
    api.getAll.mockResolvedValue(list([tx(1), tx(2)]));
    renderApp('/transactions');

    expect(await screen.findByText('Операция 1')).toBeInTheDocument();
    expect(api.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, per_page: 10, sort_by: 'created_at', sort_order: 'desc' }),
      expect.anything(),
    );
  });

  it('пагинация и сортировка по сумме', async () => {
    api.getAll.mockImplementation(async (f) => list([tx(f?.page ?? 1)], f?.page ?? 1, 2));
    renderApp('/transactions');
    await screen.findByText(/Страница 1 из 2/);

    fireEvent.click(screen.getByRole('button', { name: 'Вперёд' }));
    await screen.findByText(/Страница 2 из 2/);

    fireEvent.click(screen.getByRole('button', { name: /Сортировать по: Сумма/ }));
    await waitFor(() =>
      expect(api.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort_by: 'amount', sort_order: 'asc', page: 1 }),
        expect.anything(),
      ),
    );
  });

  it('фильтры: поиск/категория/тип отправляются на сервер', async () => {
    api.getAll.mockResolvedValue(list([tx(1)]));
    renderApp('/transactions');
    await screen.findByText('Операция 1');

    fireEvent.change(screen.getByLabelText('Поиск'), { target: { value: 'кафе' } });
    fireEvent.change(screen.getByLabelText('Категория'), { target: { value: 'Еда' } });
    fireEvent.change(screen.getByLabelText('Тип'), { target: { value: 'income' } });
    fireEvent.click(screen.getByRole('button', { name: 'Применить фильтры' }));

    await waitFor(() =>
      expect(api.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'кафе', category: 'Еда', type: 'income' }),
        expect.anything(),
      ),
    );
  });

  it('слишком короткий поиск не отправляется на сервер', async () => {
    api.getAll.mockResolvedValue(list([tx(1)]));
    renderApp('/transactions');
    await screen.findByText('Операция 1');

    fireEvent.change(screen.getByLabelText('Поиск'), { target: { value: 'к' } });
    fireEvent.click(screen.getByRole('button', { name: 'Применить фильтры' }));

    expect(await screen.findByText(/минимум 2 символа/)).toBeInTheDocument();
    expect(api.getAll).toHaveBeenCalledTimes(1);
  });

  it('пустое состояние и состояние ошибки', async () => {
    api.getAll.mockResolvedValueOnce(list([]));
    renderApp('/transactions');
    expect(await screen.findByText(/Транзакций пока нет/)).toBeInTheDocument();
  });

  it('ошибка загрузки показывает сообщение и кнопку повтора', async () => {
    api.getAll.mockRejectedValue(new Error('Внутренняя ошибка сервера'));
    renderApp('/transactions');
    expect(await screen.findByRole('alert')).toHaveTextContent('Внутренняя ошибка сервера');
    expect(screen.getByRole('button', { name: 'Повторить' })).toBeInTheDocument();
  });

  it('удаление с подтверждением и уведомлением', async () => {
    api.getAll.mockResolvedValue(list([tx(1)]));
    api.delete.mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderApp('/transactions');
    await screen.findByText('Операция 1');

    fireEvent.click(screen.getByRole('button', { name: 'Удалить Операция 1' }));
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith(1));
    expect(await screen.findByText('Транзакция удалена')).toBeInTheDocument();
  });

  it('есть ссылки на создание и редактирование', async () => {
    api.getAll.mockResolvedValue(list([tx(3)]));
    renderApp('/transactions');
    await screen.findByText('Операция 3');

    expect(screen.getByRole('link', { name: 'Добавить транзакцию' })).toHaveAttribute('href', '/transactions/new');
    expect(screen.getByRole('link', { name: 'Редактировать Операция 3' })).toHaveAttribute(
      'href',
      '/transactions/3/edit',
    );
  });
});

describe('TransactionFormPage', () => {
  it('создание: отправляет данные, показывает toast и возвращает к списку', async () => {
    api.create.mockResolvedValue(tx(10));
    api.getAll.mockResolvedValue(list([]));
    renderApp('/transactions/new');

    fireEvent.change(screen.getByLabelText('Название'), { target: { value: 'Кофе' } });
    fireEvent.change(screen.getByLabelText('Сумма'), { target: { value: '250' } });
    fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));

    await waitFor(() =>
      expect(api.create).toHaveBeenCalledWith({
        title: 'Кофе',
        type: 'expense',
        category: 'Еда',
        amount: 250,
      }),
    );
    expect(await screen.findByRole('heading', { name: 'Транзакции' })).toBeInTheDocument();
    expect(screen.getByText('Транзакция создана')).toBeInTheDocument();
  });

  it('редактирование: подставляет значения и вызывает update', async () => {
    api.getById.mockResolvedValue(tx(4, { title: 'Такси', category: 'Транспорт', amount: 800 }));
    api.update.mockResolvedValue(tx(4));
    api.getAll.mockResolvedValue(list([]));
    renderApp('/transactions/4/edit');

    const title = await screen.findByLabelText('Название');
    expect(title).toHaveValue('Такси');
    expect(screen.getByLabelText('Сумма')).toHaveValue(800);
    expect(screen.getByLabelText('Категория')).toHaveValue('Транспорт');

    fireEvent.change(screen.getByLabelText('Сумма'), { target: { value: '900' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() =>
      expect(api.update).toHaveBeenCalledWith(4, {
        title: 'Такси',
        type: 'expense',
        category: 'Транспорт',
        amount: 900,
      }),
    );
    expect(await screen.findByText('Транзакция обновлена')).toBeInTheDocument();
  });

  it('клиентская валидация не пускает запрос', async () => {
    renderApp('/transactions/new');
    fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
    expect(await screen.findByText('Введите название')).toBeInTheDocument();
    expect(api.create).not.toHaveBeenCalled();
  });

  it('ошибка API отображается в форме и toast', async () => {
    api.create.mockRejectedValue(new Error('Внутренняя ошибка сервера'));
    renderApp('/transactions/new');

    fireEvent.change(screen.getByLabelText('Название'), { target: { value: 'Кофе' } });
    fireEvent.change(screen.getByLabelText('Сумма'), { target: { value: '250' } });
    fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));

    await waitFor(() =>
      expect(screen.getAllByText('Внутренняя ошибка сервера').length).toBe(2),
    );
  });

  it('ошибка загрузки транзакции при редактировании', async () => {
    api.getById.mockRejectedValue(new Error('Ресурс не найден'));
    renderApp('/transactions/99/edit');
    expect(await screen.findByRole('alert')).toHaveTextContent('Ресурс не найден');
  });
});
