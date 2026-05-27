import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import GroupList from '../components/GroupList'

describe('GroupList', () => {
  it('renders empty state when no groups', () => {
    render(
      <GroupList groups={[]} onDelete={() => {}} onEdit={() => {}} />
    )

    expect(
      screen.getByText(/группы не найдены/i)
    ).toBeInTheDocument()
  })

  it('renders group cards with data', () => {
    const groups = [
      {
        id: 1,
        name: 'Apartment Rent',
        description: 'Shared apartment expenses',
        members_count: 3,
      },
      {
        id: 2,
        name: 'Vacation Fund',
        description: 'Saving for summer trip',
        members_count: 4,
      },
    ]

    render(
      <GroupList groups={groups} onDelete={() => {}} onEdit={() => {}} />
    )

    expect(screen.getByText('Apartment Rent')).toBeInTheDocument()
    expect(screen.getByText('Vacation Fund')).toBeInTheDocument()
    expect(screen.getByText(/Shared apartment expenses/i)).toBeInTheDocument()
  })

  it('renders action buttons for each group', () => {
    const groups = [
      {
        id: 1,
        name: 'Test Group',
        description: 'Test',
        members_count: 1,
      },
    ]

    render(
      <GroupList groups={groups} onDelete={() => {}} onEdit={() => {}} />
    )

    const editButtons = screen.getAllByRole('button', { name: /редактировать/i })
    const deleteButtons = screen.getAllByRole('button', { name: /удалить/i })

    expect(editButtons.length).toBeGreaterThan(0)
    expect(deleteButtons.length).toBeGreaterThan(0)
  })
})
