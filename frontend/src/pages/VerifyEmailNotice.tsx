import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const VerifyEmailNotice: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification link to:
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {user?.email || 'your email address'}
          </p>
          <p className="mt-4 text-sm text-gray-600">
            Please click the link in the email to verify your account and complete your registration.
          </p>
          <div className="mt-6 space-y-2">
            <p className="text-xs text-gray-500">
              Didn't receive an email? Check your spam folder or contact support.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Back to sign in
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Try different email
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 