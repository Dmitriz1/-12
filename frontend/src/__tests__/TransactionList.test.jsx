import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TransactionList from '../components/TransactionList'

describe('TransactionList', () => {
  it('renders empty state when no transactions', () => {
    render(
      <TransactionList
        transactions={[]}
        onDelete={() => {}}
        onEdit={() => {}}
      />
    )

    expect(screen.getByText(/транзакции не найдены/i)).toBeInTheDocument()
  })

  it('renders table with transactions', () => {
    const transactions = [
      {
        id: 1,
        date: '2024-01-15',
        category: 'food',
        description: 'Lunch',
        amount: 15.5,
        type: 'expense',
      },
      {
        id: 2,
        date: '2024-01-14',
        category: 'salary',
        description: 'Monthly salary',
        amount: 3000,
        type: 'income',
      },
    ]

    render(
      <TransactionList
        transactions={transactions}
        onDelete={() => {}}
        onEdit={() => {}}
      />
    )

    expect(screen.getByText('Lunch')).toBeInTheDocument()
    expect(screen.getByText('Monthly salary')).toBeInTheDocument()
    expect(screen.getByText(/15.50/)).toBeInTheDocument()
    expect(screen.getByText(/3000.00/)).toBeInTheDocument()
  })

  it('displays correct styling for income and expense', () => {
    const transactions = [
      {
        id: 1,
        date: '2024-01-15',
        category: 'food',
        description: 'Expense',
        amount: 20,
        type: 'expense',
      },
      {
        id: 2,
        date: '2024-01-14',
        category: 'salary',
        description: 'Income',
        amount: 1000,
        type: 'income',
      },
    ]

    const { container } = render(
      <TransactionList
        transactions={transactions}
        onDelete={() => {}}
        onEdit={() => {}}
      />
    )

    const rows = container.querySelectorAll('tbody tr')
    expect(rows[0]).toHaveClass('expense')
    expect(rows[1]).toHaveClass('income')
  })
})
