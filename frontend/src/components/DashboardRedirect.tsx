import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '../stores/authStore';
import { TutorDashboard } from '../pages/TutorDashboard';
import { StudentDashboard } from '../pages/StudentDashboard';
import { ParentDashboard } from '../pages/ParentDashboard';
import { Button } from './ui/Button';

// A simple Admin dashboard placeholder
const AdminDashboard = () => (
  <div className="min-h-screen bg-gray-50">
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TutEasy - Admin</h1>
          </div>
          <Button variant="outline" onClick={() => useAuthStore.getState().logout()}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600 mt-2">
          Welcome, Admin. Your management tools will be available here soon.
        </p>
      </div>
    </main>
  </div>
);

export const DashboardRedirect: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    // This case should ideally be handled by ProtectedRoute, but as a fallback:
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case UserRole.TUTOR:
      return <TutorDashboard />;
    case UserRole.STUDENT:
      return <StudentDashboard />;
    case UserRole.PARENT:
      return <ParentDashboard />;
    case UserRole.ADMIN:
      return <AdminDashboard />;
    default:
      // Fallback for an unknown role, redirect to login
      return <Navigate to="/login" replace />;
  }
}; 