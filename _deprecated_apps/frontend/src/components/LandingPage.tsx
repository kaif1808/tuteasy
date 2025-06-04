import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Calendar, CreditCard, MessageCircle, BarChart3 } from 'lucide-react';

function LandingPage() {
  const [count, setCount] = useState(0);

  const features = [
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: "User Management",
      description: "Comprehensive profiles for tutors, students, and parents"
    },
    {
      icon: <Calendar className="w-8 h-8 text-primary-600" />,
      title: "Smart Scheduling",
      description: "Advanced calendar system with Zoom integration"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-primary-600" />,
      title: "Session Management",
      description: "Track progress, notes, and learning outcomes"
    },
    {
      icon: <CreditCard className="w-8 h-8 text-primary-600" />,
      title: "Secure Payments",
      description: "Stripe integration for seamless transactions"
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-primary-600" />,
      title: "Communication",
      description: "In-app messaging and notifications"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary-600" />,
      title: "Analytics",
      description: "Insights for tutors and educational outcomes"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">TutEasy</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-500 hover:text-gray-900">Features</a>
              <a href="#status" className="text-gray-500 hover:text-gray-900">Status</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">About</a>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-secondary">Sign In</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Modern Tutoring
            <span className="text-primary-600"> CRM Platform</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your tutoring business with our comprehensive CRM platform. 
            Manage students, schedule sessions, process payments, and grow your business.
          </p>
          
          <div className="flex justify-center space-x-4 mb-12">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Free Trial
            </Link>
            <button 
              className="btn btn-secondary btn-lg"
              onClick={() => setCount((count) => count + 1)}
            >
              Watch Demo ({count})
            </button>
          </div>

          <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
            <span>✅ No setup fees</span>
            <span>✅ 14-day free trial</span>
            <span>✅ Cancel anytime</span>
          </div>
        </div>

        {/* Demo Counter */}
        <div className="text-center mt-8">
          <div className="card card-padding inline-block">
            <h3 className="text-lg font-semibold mb-2">Interactive Demo</h3>
            <p className="text-gray-600 mb-4">Click count: {count}</p>
            <span className="badge badge-primary">React + TypeScript</span>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need to run your tutoring business
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card card-padding text-center hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Status Section */}
        <div id="status" className="mt-20 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Development Status
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Completed</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Project structure setup</li>
                <li>• Frontend with React + TypeScript</li>
                <li>• Backend with Express + TypeScript</li>
                <li>• Database schema with Prisma</li>
                <li>• Tailwind CSS configuration</li>
                <li>• Security middleware setup</li>
                <li>• 🆕 User authentication system</li>
                <li>• 🆕 Registration and login components</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚧 Next Steps</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Setup PostgreSQL database</li>
                <li>• Email verification integration</li>
                <li>• Build tutor/student profiles</li>
                <li>• Add session scheduling</li>
                <li>• Integrate Zoom API</li>
                <li>• Implement payment processing</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 TutEasy. Built with React, TypeScript, and Tailwind CSS.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage; 