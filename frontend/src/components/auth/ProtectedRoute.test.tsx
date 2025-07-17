import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'
import { useAuthStore } from '@/stores/authStore'

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

// Mock react-router-dom Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate-to">{to}</div>,
    useLocation: () => ({ pathname: '/test' }),
  }
})

const MockedUseAuthStore = vi.mocked(useAuthStore)

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render children when user is authenticated', () => {
    MockedUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com', role: 'STUDENT' },
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
    })

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('should redirect to login when user is not authenticated', () => {
    MockedUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
    })

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByTestId('navigate-to')).toHaveTextContent('/login')
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('should enforce role-based access when allowedRoles is specified', () => {
    MockedUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com', role: 'STUDENT' },
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
    })

    renderWithRouter(
      <ProtectedRoute allowedRoles={['TUTOR', 'ADMIN']}>
        <TestComponent />
      </ProtectedRoute>
    )

    // Should redirect to unauthorized page
    expect(screen.getByTestId('navigate-to')).toHaveTextContent('/unauthorized')
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('should allow access when user has an allowed role', () => {
    MockedUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com', role: 'TUTOR' },
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
    })

    renderWithRouter(
      <ProtectedRoute allowedRoles={['TUTOR', 'ADMIN']}>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })
})
