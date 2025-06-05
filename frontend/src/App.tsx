// import React from 'react'; // Not needed in React 17+ with jsx-runtime
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyEmailNotice } from './pages/VerifyEmailNotice';
import { VerifyEmail } from './pages/VerifyEmail';
import { DashboardRedirect } from './components/DashboardRedirect';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TutorProfilePage } from './components/features/tutor-profile/pages/TutorProfilePage';
import { StudentProfilePage } from './components/features/student-profile/pages/StudentProfilePage';
import { ParentProfilePage } from './components/features/parent-profile/pages/ParentProfilePage';
import { StudentProfileDemo } from './pages/StudentProfileDemo';
import { ComponentTest } from './pages/ComponentTest';
import { StudentProfileTest } from './pages/StudentProfileTest';
import { TutorSearchPage } from './pages/TutorSearchPage';
import { BookingPage } from './pages/BookingPage';
import { BookingDemo } from './pages/BookingDemo';
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
          <Route path="/demo/booking" element={<BookingDemo />} />
          <Route path="/test/components" element={<ComponentTest />} />
          <Route path="/test/student-profile" element={<StudentProfileTest />} />
          
          {/* Public search route */}
          <Route path="/find-a-tutor" element={<TutorSearchPage />} />
          
          {/* Booking routes */}
          <Route path="/book/:tutorId" element={<BookingPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tutor-profile" 
            element={
              <ProtectedRoute>
                <TutorProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student-profile" 
            element={
              <ProtectedRoute>
                <StudentProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/parent-profile" 
            element={
              <ProtectedRoute>
                <ParentProfilePage />
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
