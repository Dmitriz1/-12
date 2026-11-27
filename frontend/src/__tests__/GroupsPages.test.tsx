import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NotificationProvider } from '../components/Notification/NotificationContext';
import { GroupsList, GroupForm } from '../pages/Groups';
import { groupsApi } from '../api/groups';
import type { Group, GroupListResponse } from '../types';

vi.mock('../api/groups', () => ({
  groupsApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const api = vi.mocked(groupsApi);

const makeGroups = (n: number, start = 1): Group[] =>
  Array.from({ length: n }, (_, i) => ({ id: start + i, name: `Группа ${start + i}`, owner_id: 1 }));

const response = (items: Group[], page = 1, total_pages = 1, total = items.length): GroupListResponse => ({
  items,
  total,
  page,
  per_page: 10,
  total_pages,
});

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <NotificationProvider>
        <Routes>
          <Route path="/groups" element={<GroupsList />} />
          <Route path="/groups/new" element={<GroupForm />} />
          <Route path="/groups/:id/edit" element={<GroupForm />} />
        </Routes>
      </NotificationProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('GroupsList', () => {
  it('показывает индикатор загрузки, затем таблицу', async () => {
    api.getAll.mockResolvedValue(response(makeGroups(2)));
    renderApp('/groups');

    expect(screen.getByRole('status', { name: 'Загрузка' })).toBeInTheDocument();
    expect(await screen.findByText('Группа 1')).toBeInTheDocument();
    expect(screen.getByText('Группа 2')).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'Загрузка' })).not.toBeInTheDocument();
  });

  it('пустое состояние', async () => {
    api.getAll.mockResolvedValue(response([]));
    renderApp('/groups');
    expect(await screen.findByText(/Групп пока нет/)).toBeInTheDocument();
  });

  it('ошибка загрузки + повтор', async () => {
    api.getAll.mockRejectedValueOnce(new Error('Нет соединения с сервером'));
    api.getAll.mockResolvedValueOnce(response(makeGroups(1)));
    renderApp('/groups');

    expect(await screen.findByRole('alert')).toHaveTextContent('Нет соединения с сервером');
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(await screen.findByText('Группа 1')).toBeInTheDocument();
  });

  it('пагинация: Вперёд/Назад запрашивают нужную страницу', async () => {
    api.getAll.mockImplementation(async (filters) =>
      response(makeGroups(10, ((filters?.page ?? 1) - 1) * 10 + 1), filters?.page ?? 1, 3, 25),
    );
    renderApp('/groups');

    expect(await screen.findByText(/Страница 1 из 3/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Назад' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Вперёд' }));
    expect(await screen.findByText(/Страница 2 из 3/)).toBeInTheDocument();
    expect(api.getAll).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, per_page: 10 }), expect.anything());

    fireEvent.click(screen.getByRole('button', { name: 'Назад' }));
    expect(await screen.findByText(/Страница 1 из 3/)).toBeInTheDocument();
  });

  it('сортировка по клику на заголовок меняет направление', async () => {
    api.getAll.mockResolvedValue(response(makeGroups(2)));
    renderApp('/groups');
    await screen.findByText('Группа 1');

    fireEvent.click(screen.getByRole('button', { name: /Сортировать по: Название/ }));
    await waitFor(() =>
      expect(api.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort_by: 'name', sort_order: 'asc' }),
        expect.anything(),
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: /Сортировать по: Название/ }));
    await waitFor(() =>
      expect(api.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort_by: 'name', sort_order: 'desc' }),
        expect.anything(),
      ),
    );
    expect(screen.getByRole('button', { name: /Сортировать по: Название/ })).toHaveTextContent('↓');
  });

  it('поиск применяется по кнопке и сбрасывает страницу', async () => {
    api.getAll.mockResolvedValue(response(makeGroups(2)));
    renderApp('/groups');
    await screen.findByText('Группа 1');

    fireEvent.change(screen.getByLabelText('Поиск'), { target: { value: ' сем ' } });
    expect(api.getAll).toHaveBeenCalledTimes(1); // пока не нажали "Применить"
    fireEvent.click(screen.getByRole('button', { name: 'Применить фильтры' }));

    await waitFor(() =>
      expect(api.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'сем', page: 1 }),
        expect.anything(),
      ),
    );
  });

  it('удаление: подтверждение, вызов API, уведомление и перезагрузка', async () => {
    api.getAll.mockResolvedValue(response(makeGroups(2)));
    api.delete.mockResolvedValue(undefined);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderApp('/groups');
    await screen.findByText('Группа 1');

    fireEvent.click(screen.getByRole('button', { name: 'Удалить Группа 1' }));

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith(1));
    expect(confirmSpy).toHaveBeenCalled();
    expect(await screen.findByText('Группа удалена')).toBeInTheDocument();
    await waitFor(() => expect(api.getAll).toHaveBeenCalledTimes(2));
  });

  it('удаление отменено в confirm — запрос не отправляется', async () => {
    api.getAll.mockResolvedValue(response(makeGroups(1)));
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderApp('/groups');
    await screen.findByText('Группа 1');

    fireEvent.click(screen.getByRole('button', { name: 'Удалить Группа 1' }));
    expect(api.delete).not.toHaveBeenCalled();
  });

  it('ошибка удаления показывает уведомление об ошибке', async () => {
    api.getAll.mockResolvedValue(response(makeGroups(1)));
    api.delete.mockRejectedValue(new Error('Ресурс не найден'));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderApp('/groups');
    await screen.findByText('Группа 1');

    fireEvent.click(screen.getByRole('button', { name: 'Удалить Группа 1' }));
    expect(await screen.findByText('Ресурс не найден')).toBeInTheDocument();
  });
});

describe('GroupForm', () => {
  it('режим создания: валидация и отправка', async () => {
    api.create.mockResolvedValue({ id: 5, name: 'Семья', owner_id: 1 });
    api.getAll.mockResolvedValue(response([]));
    renderApp('/groups/new');

    expect(screen.getByRole('heading', { name: 'Создать группу' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Создать' }));
    expect(await screen.findByText('Введите название группы')).toBeInTheDocument();
    expect(api.create).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Название'), { target: { value: 'ab' } });
    fireEvent.click(screen.getByRole('button', { name: 'Создать' }));
    expect(await screen.findByText('Минимум 3 символа')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Название'), { target: { value: ' Семья ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Создать' }));

    await waitFor(() => expect(api.create).toHaveBeenCalledWith({ name: 'Семья' }));
    expect(await screen.findByRole('heading', { name: 'Группы' })).toBeInTheDocument();
    expect(screen.getByText('Группа создана')).toBeInTheDocument();
  });

  it('режим редактирования: загружает данные и вызывает update', async () => {
    api.getById.mockResolvedValue({ id: 7, name: 'Друзья', owner_id: 1 });
    api.update.mockResolvedValue({ id: 7, name: 'Друзья 2', owner_id: 1 });
    api.getAll.mockResolvedValue(response([]));
    renderApp('/groups/7/edit');

    expect(screen.getByRole('heading', { name: 'Редактировать группу' })).toBeInTheDocument();
    const input = await screen.findByLabelText('Название');
    expect(input).toHaveValue('Друзья');
    expect(api.getById).toHaveBeenCalledWith(7, expect.anything());

    fireEvent.change(input, { target: { value: 'Друзья 2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => expect(api.update).toHaveBeenCalledWith(7, { name: 'Друзья 2' }));
    expect(await screen.findByText('Группа обновлена')).toBeInTheDocument();
  });

  it('ошибка загрузки группы при редактировании', async () => {
    api.getById.mockRejectedValue(new Error('Group with id 9 not found'));
    renderApp('/groups/9/edit');
    expect(await screen.findByRole('alert')).toHaveTextContent('Group with id 9 not found');
    expect(screen.queryByLabelText('Название')).not.toBeInTheDocument();
  });

  it('ошибка сервера при сохранении отображается в форме и в toast', async () => {
    api.create.mockRejectedValue(new Error('Конфликт данных'));
    renderApp('/groups/new');

    fireEvent.change(screen.getByLabelText('Название'), { target: { value: 'Семья' } });
    fireEvent.click(screen.getByRole('button', { name: 'Создать' }));

    await waitFor(() => expect(screen.getAllByText('Конфликт данных').length).toBe(2));
    expect(screen.getByRole('button', { name: 'Создать' })).not.toBeDisabled();
  });
});
