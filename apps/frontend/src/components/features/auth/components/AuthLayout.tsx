import { BookOpen } from 'lucide-react';
import Card from '../../../ui/Card';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-primary-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">TutEasy</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {title}
        </h2>
        
        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-600">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          {children}
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          © 2024 TutEasy. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout; 