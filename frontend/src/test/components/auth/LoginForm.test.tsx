import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Login } from '../../../pages/Login';
import { useAuthStore } from '../../../stores/authStore';

// Mock the auth store
vi.mock('../../../stores/authStore');

const mockUseAuthStore = vi.mocked(useAuthStore);

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('LoginForm', () => {
  const mockLogin = vi.fn();
  const mockSetLoading = vi.fn();
  const mockSetError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      accessToken: null,
      refreshToken: null,
      setAuth: vi.fn(),
      setLoading: mockSetLoading,
      setError: mockSetError,
      updateTokens: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('should render login form with all required fields', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/remember me/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('should validate password requirement', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid credentials', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'SecurePass123!');
    await user.click(submitButton);

    await waitFor(() => {
      // The form should submit successfully with MSW mock
      expect(mockSetLoading).toHaveBeenCalledWith(true);
    });
  });

  it('should handle login errors gracefully', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Use invalid credentials that will trigger MSW error response
    await user.type(emailInput, 'invalid@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    // Initially password should be hidden
    expect(passwordInput.type).toBe('password');

    await user.click(toggleButton);

    // After clicking, password should be visible
    expect(passwordInput.type).toBe('text');

    await user.click(toggleButton);

    // After clicking again, password should be hidden
    expect(passwordInput.type).toBe('password');
  });

  it('should handle remember me checkbox', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });

    expect(rememberMeCheckbox).not.toBeChecked();

    await user.click(rememberMeCheckbox);

    expect(rememberMeCheckbox).toBeChecked();
  });

  it('should show loading state during login', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      accessToken: null,
      refreshToken: null,
      setAuth: vi.fn(),
      setLoading: mockSetLoading,
      setError: mockSetError,
      updateTokens: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /signing in/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });

  it('should display error messages from store', () => {
    const errorMessage = 'Login failed. Please try again.';
    
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: errorMessage,
      accessToken: null,
      refreshToken: null,
      setAuth: vi.fn(),
      setLoading: mockSetLoading,
      setError: mockSetError,
      updateTokens: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should navigate to forgot password page', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const forgotPasswordLink = screen.getByText(/forgot password/i);
    
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');
  });

  it('should navigate to registration page', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const signUpLink = screen.getByText(/sign up/i);
    
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink.closest('a')).toHaveAttribute('href', '/register');
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Tab through form elements
    await user.tab();
    expect(emailInput).toHaveFocus();

    await user.tab();
    expect(passwordInput).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('checkbox', { name: /remember me/i })).toHaveFocus();

    await user.tab();
    expect(submitButton).toHaveFocus();
  });

  it('should submit form on Enter key press', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'SecurePass123!');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith(true);
    });
  });

  it('should clear error when user starts typing', async () => {
    const user = userEvent.setup();
    
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Previous error',
      accessToken: null,
      refreshToken: null,
      setAuth: vi.fn(),
      setLoading: mockSetLoading,
      setError: mockSetError,
      updateTokens: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    
    expect(screen.getByText('Previous error')).toBeInTheDocument();

    await user.type(emailInput, 'a');

    expect(mockSetError).toHaveBeenCalledWith(null);
  });

  it('should have proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const form = screen.getByRole('form');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autocomplete', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    expect(form).toHaveAttribute('novalidate');
  });
});
