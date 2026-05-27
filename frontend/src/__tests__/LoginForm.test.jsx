import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginForm from '../components/LoginForm'

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('renders login form with email and password fields', () => {
    render(
      <LoginForm onSubmit={mockOnSubmit} isLoading={false} error={null} />
    )

    expect(screen.getByLabelText(/пользователь/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument()
  })

  it('calls onSubmit with form data when submitted', async () => {
    render(
      <LoginForm onSubmit={mockOnSubmit} isLoading={false} error={null} />
    )

    fireEvent.change(screen.getByLabelText(/пользователь/i), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByLabelText(/пароль/i), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('testuser', 'password123')
    })
  })

  it('displays error message when provided', () => {
    const errorMsg = 'Invalid credentials'
    render(
      <LoginForm onSubmit={mockOnSubmit} isLoading={false} error={errorMsg} />
    )

    expect(screen.getByText(errorMsg)).toBeInTheDocument()
  })

  it('disables form during loading', () => {
    render(
      <LoginForm onSubmit={mockOnSubmit} isLoading={true} error={null} />
    )

    expect(screen.getByLabelText(/пользователь/i)).toBeDisabled()
    expect(screen.getByLabelText(/пароль/i)).toBeDisabled()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
