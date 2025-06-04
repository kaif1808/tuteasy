// Export main components
export { StudentProfileForm } from './components/StudentProfileForm';
export { StudentProfilePage } from './pages/StudentProfilePage';

// Export hooks
export {
  useStudentProfile,
  useCreateStudentProfile,
  useUpdateStudentProfile,
  useDeleteStudentProfile,
  useGetStudentProfile,
  useChildrenProfiles,
  useLinkParent,
  useUnlinkParent,
  useUpsertStudentProfile,
  studentProfileKeys,
} from './hooks/useStudentProfile';

// Export API service
export { studentProfileApi } from './services/studentProfileApi';

// Export types
export type {
  StudentProfile,
  StudentProfileFormData,
  StudentProfileResponse,
  LearningStyle,
  User,
  ApiError,
  FormErrors,
  ProfileSectionProps,
} from './types'; 