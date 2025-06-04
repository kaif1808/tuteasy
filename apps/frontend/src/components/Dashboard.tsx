import { LogOut, User } from 'lucide-react';
import { useAuth } from '../stores/authStore';
import Button from './ui/Button';
import Card from './ui/Card';

const Dashboard = () => {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Welcome, {user.firstName}!
              </h1>
            </div>
            <Button
              onClick={handleLogout}
              loading={isLoading}
              variant="secondary"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Card */}
          <Card>
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome to TutEasy!
                </h2>
                <p className="text-gray-600 mt-2">
                  You're successfully logged in to your {user.role} account.
                </p>
              </div>
            </div>
          </Card>

          {/* User Info Card */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <p className="mt-1 text-sm text-gray-900 capitalize">
                  {user.role}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Verified
                </label>
                <p className="mt-1 text-sm">
                  {user.emailVerified ? (
                    <span className="badge badge-success">Verified</span>
                  ) : (
                    <span className="badge badge-warning">Pending</span>
                  )}
                </p>
              </div>
            </div>

            {!user.emailVerified && (
              <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-lg">
                <p className="text-sm text-warning-700">
                  Please check your email and verify your account to access all features.
                </p>
              </div>
            )}
          </Card>

          {/* Next Steps Card */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Next Steps
            </h3>
            <div className="space-y-3">
              <p className="text-gray-600">
                This is your dashboard! Here's what you can do next:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Complete your profile setup</li>
                <li>• Browse available tutors</li>
                <li>• Schedule your first session</li>
                <li>• Set up payment methods</li>
              </ul>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 