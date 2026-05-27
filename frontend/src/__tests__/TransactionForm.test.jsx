import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TransactionForm from '../components/TransactionForm'

describe('TransactionForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('renders all form fields', () => {
    render(
      <TransactionForm onSubmit={mockOnSubmit} isLoading={false} error={null} />
    )

    expect(screen.getByLabelText(/описание/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/сумма/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/тип/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/категория/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/дата/i)).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    render(
      <TransactionForm onSubmit={mockOnSubmit} isLoading={false} error={null} />
    )

    fireEvent.change(screen.getByLabelText(/описание/i), {
      target: { value: 'Grocery shopping' },
    })
    fireEvent.change(screen.getByLabelText(/сумма/i), {
      target: { value: '50.25' },
    })

    fireEvent.click(screen.getByRole('button', { name: /сохранить транзакцию/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
      const call = mockOnSubmit.mock.calls[0][0]
      expect(call.description).toBe('Grocery shopping')
      expect(call.amount).toBe(50.25)
    })
  })

  it('displays error message', () => {
    const errorMsg = 'Failed to save transaction'
    render(
      <TransactionForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        error={errorMsg}
      />
    )

    expect(screen.getByText(errorMsg)).toBeInTheDocument()
  })

  it('disables form during submission', () => {
    render(
      <TransactionForm onSubmit={mockOnSubmit} isLoading={true} error={null} />
    )

    expect(screen.getByLabelText(/описание/i)).toBeDisabled()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
