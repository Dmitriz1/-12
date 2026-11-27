import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { NotificationProvider, useNotification } from '../components/Notification/NotificationContext';

function Demo() {
  const show = useNotification();
  return (
    <>
      <button onClick={() => show('Сохранено', 'success')}>ok</button>
      <button onClick={() => show('Ошибка!', 'error')}>fail</button>
    </>
  );
}

describe('NotificationContext', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('показывает уведомление и скрывает его через 3 секунды', () => {
    vi.useFakeTimers();
    render(
      <NotificationProvider>
        <Demo />
      </NotificationProvider>,
    );

    fireEvent.click(screen.getByText('ok'));
    expect(screen.getByRole('status')).toHaveTextContent('Сохранено');

    act(() => {
      vi.advanceTimersByTime(3100);
    });
    expect(screen.queryByText('Сохранено')).not.toBeInTheDocument();
  });

  it('ошибки отображаются с role=alert и закрываются по клику', () => {
    render(
      <NotificationProvider>
        <Demo />
      </NotificationProvider>,
    );
    fireEvent.click(screen.getByText('fail'));
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Ошибка!');
    fireEvent.click(alert);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('хук вне провайдера бросает ошибку', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Demo />)).toThrow(/NotificationProvider/);
    spy.mockRestore();
  });
});
