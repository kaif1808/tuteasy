import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your TutEasy account"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage; 