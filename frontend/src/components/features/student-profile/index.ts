// Legacy exports for backward compatibility
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

export { StudentProfileForm } from './components/StudentProfileForm';
export { studentProfileApi } from './services/studentProfileApi';

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

// Enhanced UK/IB exports
export type {
  UKYearGroup,
  IBProgramme,
  UKSchoolType,
  QualificationLevel,
  EnhancedStudentProfile,
  SubjectInterest,
  EnhancedStudentProfileFormData
} from './types/ukIbTypes';

export {
  UK_YEAR_GROUP_OPTIONS,
  IB_PROGRAMME_OPTIONS,
  UK_SCHOOL_TYPE_OPTIONS,
  UK_EXAM_BOARDS,
  getSubjectsForAcademicLevel,
  getQualificationLevelsForYear
} from './types/ukIbTypes';

export {
  enhancedStudentProfileSchema,
  subjectInterestSchema,
  validateAcademicLevel,
  getTargetGradeOptions,
  validateAcademicProgression
} from './utils/ukIbValidation';

export type { SubjectInterestFormData } from './utils/ukIbValidation';

export { UKIBStudentProfileForm } from './components/UKIBStudentProfileForm';
export { 
  EnhancedStudentProfileService,
  enhancedStudentProfileKeys 
} from './services/enhancedStudentProfileService';
export { StudentProfilePage } from './pages/StudentProfilePage'; 