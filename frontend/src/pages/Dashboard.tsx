import React from 'react';
import { useAuthStore, UserRole } from '../stores/authStore';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const getDashboardContent = () => {
    switch (user?.role) {
      case UserRole.TUTOR:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tutor Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">Profile Setup</h3>
                  <p className="text-sm text-blue-700 mt-1">Complete your tutor profile</p>
                  <Button size="sm" className="mt-2">
                    Setup Profile
                  </Button>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900">Sessions</h3>
                  <p className="text-sm text-green-700 mt-1">Manage your tutoring sessions</p>
                  <Button size="sm" variant="secondary" className="mt-2">
                    View Sessions
                  </Button>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900">Earnings</h3>
                  <p className="text-sm text-purple-700 mt-1">Track your earnings</p>
                  <Button size="sm" variant="secondary" className="mt-2">
                    View Earnings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case UserRole.STUDENT:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">Find Tutors</h3>
                  <p className="text-sm text-blue-700 mt-1">Browse and book tutoring sessions</p>
                  <Button size="sm" className="mt-2">
                    Browse Tutors
                  </Button>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900">My Sessions</h3>
                  <p className="text-sm text-green-700 mt-1">View upcoming and past sessions</p>
                  <Button size="sm" variant="secondary" className="mt-2">
                    View Sessions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case UserRole.PARENT:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Parent Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">Child's Progress</h3>
                  <p className="text-sm text-blue-700 mt-1">Monitor your child's learning</p>
                  <Button size="sm" className="mt-2">
                    View Progress
                  </Button>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900">Sessions</h3>
                  <p className="text-sm text-green-700 mt-1">Manage tutoring sessions</p>
                  <Button size="sm" variant="secondary" className="mt-2">
                    View Sessions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case UserRole.ADMIN:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">User Management</h3>
                  <p className="text-sm text-blue-700 mt-1">Manage tutors and students</p>
                  <Button size="sm" className="mt-2">
                    Manage Users
                  </Button>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900">Platform Analytics</h3>
                  <p className="text-sm text-green-700 mt-1">View platform statistics</p>
                  <Button size="sm" variant="secondary" className="mt-2">
                    View Analytics
                  </Button>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900">Settings</h3>
                  <p className="text-sm text-purple-700 mt-1">Platform configuration</p>
                  <Button size="sm" variant="secondary" className="mt-2">
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900">Welcome to TutEasy</h2>
            <p className="text-gray-600 mt-2">Please complete your profile setup to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TutEasy</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user?.email}</span>
                {!user?.isEmailVerified && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Email not verified
                  </span>
                )}
              </div>
              <Button variant="outline" onClick={logout}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {!user?.isEmailVerified && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Email verification required
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Please check your email and click the verification link to activate your account.
                </p>
              </div>
            </div>
          </div>
        )}

        {getDashboardContent()}
      </main>
    </div>
  );
}; 