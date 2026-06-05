import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../pages/Login';
import { AuthContext } from '../context/AuthContext';

const renderWithAuth = (login = vi.fn()) => {
  const value = {
    token: null,
    isAuthenticated: false,
    login,
    register: vi.fn(),
    logout: vi.fn(),
  };
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={value}>
        <Login />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
};

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('рендерит форму входа', () => {
    renderWithAuth();
    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument();
    expect(screen.getByLabelText('Имя пользователя')).toBeInTheDocument();
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
  });

  it('показывает ошибки валидации', async () => {
    const login = vi.fn();
    renderWithAuth(login);

    fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

    await waitFor(() => {
      expect(screen.getByText('Введите имя пользователя')).toBeInTheDocument();
    });
    expect(login).not.toHaveBeenCalled();
  });

  it('вызывает login при валидных данных', async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    renderWithAuth(login);

    fireEvent.change(screen.getByLabelText('Имя пользователя'), {
      target: { value: 'alice' },
    });
    fireEvent.change(screen.getByLabelText('Пароль'), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('alice', 'secret');
    });
  });

  it('показывает серверную ошибку', async () => {
    const login = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    renderWithAuth(login);

    fireEvent.change(screen.getByLabelText('Имя пользователя'), {
      target: { value: 'alice' },
    });
    fireEvent.change(screen.getByLabelText('Пароль'), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});