// Enums to match backend
export enum LearningStyle {
  VISUAL = 'VISUAL',
  AUDITORY = 'AUDITORY', 
  KINESTHETIC = 'KINESTHETIC',
  READING_WRITING = 'READING_WRITING',
  MULTIMODAL = 'MULTIMODAL'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  TUTOR = 'TUTOR',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT'
}

// Base User interface
export interface User {
  id: string;
  email: string;
  role: UserRole;
}

// Student Profile interface
export interface StudentProfile {
  id: string;
  userId: string;
  parentId?: string;
  gradeLevel?: string;
  schoolName?: string;
  subjectsOfInterest: string[];
  learningGoals?: string;
  specialNeeds?: string;
  preferredLearningStyle?: LearningStyle;
  timezone: string;
  profileCompleteness: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  parent?: User;
}

// Form data types
export interface StudentProfileFormData {
  gradeLevel?: string;
  schoolName?: string;
  subjectsOfInterest: string[];
  learningGoals?: string;
  specialNeeds?: string;
  preferredLearningStyle?: LearningStyle;
  timezone?: string;
  parentId?: string;
}

// API Response types
export interface StudentProfileResponse {
  id: string;
  userId: string;
  parentId?: string;
  gradeLevel?: string;
  schoolName?: string;
  subjectsOfInterest: string[];
  learningGoals?: string;
  specialNeeds?: string;
  preferredLearningStyle?: LearningStyle;
  timezone: string;
  profileCompleteness: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  parent?: User;
}

// Error types
export interface ApiError {
  error: string;
  details?: Array<{
    message: string;
    path: string[];
  }>;
}

// Common UI component props
export interface ProfileSectionProps {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

// Form validation error type
export interface FormErrors {
  gradeLevel?: string;
  schoolName?: string;
  subjectsOfInterest?: string;
  learningGoals?: string;
  specialNeeds?: string;
  preferredLearningStyle?: string;
  timezone?: string;
  parentId?: string;
}

// Common subjects for autocomplete/selection
export const COMMON_SUBJECTS = [
  'Mathematics',
  'English',
  'Science',
  'History',
  'Geography',
  'Physics',
  'Chemistry',
  'Biology',
  'French',
  'Spanish',
  'Computer Science',
  'Art',
  'Music',
  'Physical Education',
  'Drama',
  'Business Studies',
  'Economics',
  'Psychology',
  'Philosophy',
  'Literature'
] as const;

// Grade level options
export const GRADE_LEVELS = [
  'Kindergarten',
  '1st Grade',
  '2nd Grade', 
  '3rd Grade',
  '4th Grade',
  '5th Grade',
  '6th Grade',
  '7th Grade',
  '8th Grade',
  '9th Grade',
  '10th Grade',
  '11th Grade',
  '12th Grade',
  'College Freshman',
  'College Sophomore',
  'College Junior',
  'College Senior',
  'Graduate Student',
  'Adult Learner'
] as const;

// Learning style descriptions for UI
export const LEARNING_STYLE_DESCRIPTIONS = {
  [LearningStyle.VISUAL]: 'Learn best through visual aids, diagrams, and images',
  [LearningStyle.AUDITORY]: 'Learn best through listening and verbal instruction',
  [LearningStyle.KINESTHETIC]: 'Learn best through hands-on activities and movement',
  [LearningStyle.READING_WRITING]: 'Learn best through reading and writing exercises',
  [LearningStyle.MULTIMODAL]: 'Learn effectively through multiple learning styles'
} as const; 