import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AxiosError, type AxiosResponse } from 'axios';
import { UsersList } from '../pages/Users/UsersList';
import { UserForm } from '../pages/Users/UserForm';

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  replace: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('../api/users', () => ({ usersApi: mocks }));

const page = (items: { id: number; username: string }[]) => ({
  data: {
    items,
    total: items.length,
    page: 1,
    per_page: 5,
    total_pages: 1,
  },
});

const renderList = () =>
  render(
    <MemoryRouter initialEntries={['/users']}>
      <Routes>
        <Route path="/users" element={<UsersList />} />
        <Route path="/users/new" element={<UserForm />} />
        <Route path="/users/:id/edit" element={<UserForm />} />
      </Routes>
    </MemoryRouter>,
  );

const renderForm = (path = '/users/new') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/users" element={<h1>Список</h1>} />
        <Route path="/users/new" element={<UserForm />} />
        <Route path="/users/:id/edit" element={<UserForm />} />
      </Routes>
    </MemoryRouter>,
  );

describe('UsersList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.list.mockResolvedValue(page([
      { id: 1, username: 'alice' },
      { id: 2, username: 'bob' },
    ]));
  });

  it('рендерит пользователей из API', async () => {
    renderList();
    expect(await screen.findByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(mocks.list).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, per_page: 5 }),
    );
  });

  it('передаёт поисковый запрос в API', async () => {
    renderList();
    await screen.findByText('alice');

    fireEvent.change(screen.getByLabelText('Поиск пользователей'), {
      target: { value: 'ali' },
    });

    await waitFor(() => {
      expect(mocks.list).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'ali', page: 1 }),
      );
    });
  });

  it('сортирует по имени по клику на заголовок', async () => {
    renderList();
    await screen.findByText('alice');

    fireEvent.click(screen.getByLabelText('Сортировать по Имя пользователя'));

    await waitFor(() => {
      expect(mocks.list).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort_by: 'username', sort_order: 'asc' }),
      );
    });
  });

  it('удаляет пользователя после подтверждения', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mocks.remove.mockResolvedValue({ data: null });
    renderList();
    await screen.findByText('alice');

    fireEvent.click(screen.getByLabelText('Удалить bob'));

    await waitFor(() => {
      expect(mocks.remove).toHaveBeenCalledWith(2);
    });
  });

  it('показывает пустое состояние', async () => {
    mocks.list.mockResolvedValue(page([]));
    renderList();
    expect(await screen.findByText('Пользователи не найдены')).toBeInTheDocument();
  });
});

describe('UserForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('создаёт пользователя и возвращает к списку', async () => {
    mocks.create.mockResolvedValue({ data: { id: 3, username: 'carol' } });
    renderForm();

    fireEvent.change(screen.getByLabelText('Имя пользователя'), {
      target: { value: 'carol' },
    });
    fireEvent.change(screen.getByLabelText('Пароль'), {
      target: { value: 'secret1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => {
      expect(mocks.create).toHaveBeenCalledWith({
        username: 'carol',
        password: 'secret1',
      });
    });
    expect(await screen.findByText('Список')).toBeInTheDocument();
  });

  it('показывает ошибки валидации и не шлёт запрос', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('Имя пользователя'), {
      target: { value: 'ab' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(await screen.findByText('Минимум 3 символа')).toBeInTheDocument();
    expect(screen.getByText('Введите пароль')).toBeInTheDocument();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('загружает пользователя и отправляет только имя при редактировании', async () => {
    mocks.getById.mockResolvedValue({
      data: { id: 2, username: 'bob' },
    });
    mocks.update.mockResolvedValue({ data: { id: 2, username: 'bobby' } });
    renderForm('/users/2/edit');

    const input = await screen.findByDisplayValue('bob');
    fireEvent.change(input, { target: { value: 'bobby' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => {
      expect(mocks.update).toHaveBeenCalledWith(2, { username: 'bobby' });
    });
  });

  it('показывает ошибку сервера при конфликте имён', async () => {
    mocks.create.mockRejectedValue(
      new AxiosError('Conflict', 'ERR_BAD_RESPONSE', undefined, undefined, {
        data: { detail: 'User already exists', error_code: 'CONFLICT' },
        status: 409,
        statusText: 'Conflict',
        headers: {},
        config: {},
      } as AxiosResponse),
    );
    renderForm();

    fireEvent.change(screen.getByLabelText('Имя пользователя'), {
      target: { value: 'alice' },
    });
    fireEvent.change(screen.getByLabelText('Пароль'), {
      target: { value: 'secret1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'User already exists',
    );
  });
});
