import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterForm from '../components/RegisterForm'

describe('RegisterForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('renders register form with all required fields', () => {
    render(
      <RegisterForm onSubmit={mockOnSubmit} isLoading={false} error={null} />
    )

    expect(screen.getByLabelText(/пользователь/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^пароль/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/повторите пароль/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /регистрация/i })).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    render(
      <RegisterForm onSubmit={mockOnSubmit} isLoading={false} error={null} />
    )

    fireEvent.change(screen.getByLabelText(/пользователь/i), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByLabelText(/^пароль/i), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText(/повторите пароль/i), {
      target: { value: 'password456' },
    })

    fireEvent.click(screen.getByRole('button', { name: /регистрация/i }))

    await waitFor(() => {
      expect(screen.getByText(/пароли не совпадают/i)).toBeInTheDocument()
    })
  })

  it('shows error when password is too short', async () => {
    render(
      <RegisterForm onSubmit={mockOnSubmit} isLoading={false} error={null} />
    )

    fireEvent.change(screen.getByLabelText(/пользователь/i), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByLabelText(/^пароль/i), {
      target: { value: 'short' },
    })
    fireEvent.change(screen.getByLabelText(/повторите пароль/i), {
      target: { value: 'short' },
    })

    fireEvent.click(screen.getByRole('button', { name: /регистрация/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/пароль должна быть не менее 6 символов/i)
      ).toBeInTheDocument()
    })
  })

  it('calls onSubmit with valid form data', async () => {
    render(
      <RegisterForm onSubmit={mockOnSubmit} isLoading={false} error={null} />
    )

    fireEvent.change(screen.getByLabelText(/пользователь/i), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByLabelText(/^пароль/i), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText(/повторите пароль/i), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /регистрация/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('testuser', 'password123')
    })
  })
})
