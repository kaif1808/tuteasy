import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { registerSchema } from '../../../../utils/validation';
import { useAuth } from '../../../../stores/authStore';
import { UserRole } from '../../../../types/auth';
import type { RegisterFormData } from '../../../../utils/validation';

const RegistrationForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: UserRole.STUDENT,
      agreeToTerms: false,
    },
  });

  const password = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      const result = await registerUser(data);
      setRegistrationSuccess(true);
      
      // Redirect to login after 3 seconds or immediately if user clicks
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please check your email to verify your account before logging in.' 
          }
        });
      }, 3000);
    } catch (error) {
      // Error is handled by the store
      console.error('Registration error:', error);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-success-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Registration Successful!
        </h3>
        <p className="text-gray-600">
          Please check your email to verify your account before logging in.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to login page...
        </p>
        <Button
          onClick={() => navigate('/login')}
          className="w-full"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-error-50 border border-error-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-error-500 flex-shrink-0" />
          <p className="text-sm text-error-700">{error}</p>
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          {...register('firstName')}
          label="First Name"
          type="text"
          required
          error={errors.firstName?.message}
        />
        
        <Input
          {...register('lastName')}
          label="Last Name"
          type="text"
          required
          error={errors.lastName?.message}
        />
      </div>

      {/* Email */}
      <Input
        {...register('email')}
        label="Email Address"
        type="email"
        required
        error={errors.email?.message}
        helperText="We'll send a verification email to this address"
      />

      {/* Role Selection */}
      <div className="form-group">
        <label className="form-label">
          I am a <span className="text-error-600 ml-1">*</span>
        </label>
        <div className="mt-2 space-y-2">
          {Object.values(UserRole).map((role) => (
            <label key={role} className="flex items-center">
              <input
                {...register('role')}
                type="radio"
                value={role}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">
                {role === UserRole.PARENT ? 'Parent/Guardian' : role}
              </span>
            </label>
          ))}
        </div>
        {errors.role && (
          <p className="form-error">{errors.role.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="relative">
        <Input
          {...register('password')}
          label="Password"
          type={showPassword ? 'text' : 'password'}
          required
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

      {/* Password Strength Indicator */}
      {password && <PasswordStrengthIndicator password={password} />}

      {/* Confirm Password */}
      <div className="relative">
        <Input
          {...register('confirmPassword')}
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          required
          error={errors.confirmPassword?.message}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center"
        >
          {showConfirmPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start">
        <input
          {...register('agreeToTerms')}
          type="checkbox"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5"
        />
        <div className="ml-3">
          <label className="text-sm text-gray-700">
            I agree to the{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-500">
              Terms and Conditions
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </Link>
            <span className="text-error-600 ml-1">*</span>
          </label>
          {errors.agreeToTerms && (
            <p className="form-error mt-1">{errors.agreeToTerms.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        loading={isLoading || isSubmitting}
        className="w-full"
        size="lg"
      >
        Create Account
      </Button>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegistrationForm; 