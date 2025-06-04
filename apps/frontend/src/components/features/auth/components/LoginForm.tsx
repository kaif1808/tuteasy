import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import { useAuth } from '../../../../stores/authStore';
import type { LoginFormData } from '../../../../utils/validation';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get success message from navigation state (e.g., from registration)
  const successMessage = location.state?.message;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data);
      
      // Redirect to dashboard or intended page
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      // Error is handled by the store
      console.error('Login error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center space-x-2 p-3 bg-success-50 border border-success-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
          <p className="text-sm text-success-700">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-error-50 border border-error-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-error-500 flex-shrink-0" />
          <p className="text-sm text-error-700">{error}</p>
        </div>
      )}

      {/* Email Field */}
      <Input
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Please enter a valid email address',
          },
        })}
        label="Email Address"
        type="email"
        required
        autoComplete="email"
        error={errors.email?.message}
      />

      {/* Password Field */}
      <div className="relative">
        <Input
          {...register('password', {
            required: 'Password is required',
          })}
          label="Password"
          type={showPassword ? 'text' : 'password'}
          required
          autoComplete="current-password"
          error={errors.password?.message}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Remember Me and Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            {...register('rememberMe')}
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <Link
            to="/forgot-password"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Forgot your password?
          </Link>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        loading={isLoading || isSubmitting}
        className="w-full"
        size="lg"
      >
        Sign In
      </Button>

      {/* Registration Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Create one here
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm; 