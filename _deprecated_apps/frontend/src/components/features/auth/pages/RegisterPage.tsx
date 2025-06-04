import AuthLayout from '../components/AuthLayout';
import RegistrationForm from '../components/RegistrationForm';

const RegisterPage = () => {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join TutEasy and start your learning journey"
    >
      <RegistrationForm />
    </AuthLayout>
  );
};

export default RegisterPage; 