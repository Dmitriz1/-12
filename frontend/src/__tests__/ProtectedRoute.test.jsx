import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import { AuthProvider } from '../context/AuthContext'

vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext')
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      isAuthenticated: true,
      token: 'test-token',
    })),
  }
})

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
