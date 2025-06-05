// Parent Profile Management Components
export { ParentProfileForm } from './components/ParentProfileForm';
export { ParentProfilePage } from './pages/ParentProfilePage';

// Types
export type {
  ParentProfile,
  ParentProfileFormData,
  ParentProfileResponse,
  CreateParentProfileRequest,
  UpdateParentProfileRequest,
  EmergencyContact,
} from './types';

export {
  CommunicationPreference,
  COMMUNICATION_PREFERENCE_OPTIONS,
  TIMEZONE_OPTIONS,
} from './types';

// Validation utilities
export {
  parentProfileSchema,
  calculateProfileCompleteness,
  isValidPhoneNumber,
  isValidEmail,
} from './utils/validation';

export type { ParentProfileFormData as ParentProfileValidationData } from './utils/validation'; 