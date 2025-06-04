// import React from 'react'; // Not needed in React 17+ with jsx-runtime
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyEmailNotice } from './pages/VerifyEmailNotice';
import { VerifyEmail } from './pages/VerifyEmail';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
// TODO: Re-enable TutorProfilePage once TypeScript errors in its dependencies are resolved
// import { TutorProfilePage } from './components/features/tutor-profile/pages/TutorProfilePage';
import { StudentProfilePage } from './components/features/student-profile/pages/StudentProfilePage';
import { StudentProfileDemo } from './pages/StudentProfileDemo';
import { ComponentTest } from './pages/ComponentTest';
import { StudentProfileTest } from './pages/StudentProfileTest';
import { useAuthStore } from './stores/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
          />
          <Route 
            path="/forgot-password" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} 
          />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email-notice" element={<VerifyEmailNotice />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Demo routes */}
          <Route path="/demo/student-profile" element={<StudentProfileDemo />} />
          <Route path="/test/components" element={<ComponentTest />} />
          <Route path="/test/student-profile" element={<StudentProfileTest />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          {/* TODO: Re-enable TutorProfilePage route once TypeScript errors in its dependencies are resolved
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <TutorProfilePage />
              </ProtectedRoute>
            } 
          />
          */}
          <Route 
            path="/student-profile" 
            element={
              <ProtectedRoute>
                <StudentProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirects */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
