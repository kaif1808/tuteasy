// Tutor Profile Types - Based on Prisma schema and PRD requirements

export enum TeachingPreference {
  ONLINE = 'ONLINE',
  IN_PERSON = 'IN_PERSON',
  BOTH = 'BOTH',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum ProficiencyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum QualificationType {
  DEGREE = 'DEGREE',
  TEACHING_CERTIFICATION = 'TEACHING_CERTIFICATION',
  DBS_CHECK = 'DBS_CHECK',
  PROFESSIONAL_CERTIFICATION = 'PROFESSIONAL_CERTIFICATION',
  OTHER = 'OTHER',
}

// Core Tutor Profile Interface
export interface TutorProfile {
  id: string;
  userId: string;
  bio?: string;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  profileImageUrl?: string;
  profileImageKey?: string;
  videoIntroUrl?: string;
  videoIntroKey?: string;
  teachingPreference: TeachingPreference;
  ageGroupSpecialization: string[];
  languageProficiencies: string[];
  verificationStatus: VerificationStatus;
  isActive: boolean;
  profileCompleteness: number;
  createdAt: string;
  updatedAt: string;
  subjects: TutorSubject[];
  qualifications: TutorQualification[];
}

// Tutor Subject Interface
export interface TutorSubject {
  id: string;
  tutorId: string;
  subjectName: string;
  proficiencyLevel: ProficiencyLevel;
  yearsExperience: number;
  hourlyRate?: number;
  createdAt: string;
  updatedAt: string;
}

// Tutor Qualification Interface
export interface TutorQualification {
  id: string;
  tutorId: string;
  qualificationType: QualificationType;
  institution?: string;
  qualificationName: string;
  documentUrl?: string;
  documentKey?: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  issueDate?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Form Data Types for React Hook Form
export interface TutorProfileFormData {
  bio: string;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  teachingPreference: TeachingPreference;
  ageGroupSpecialization: string[];
  languageProficiencies: string[];
}

export interface TutorSubjectFormData {
  subjectName: string;
  proficiencyLevel: ProficiencyLevel;
  yearsExperience: number;
  hourlyRate?: number;
}

export interface TutorQualificationFormData {
  qualificationType: QualificationType;
  institution: string;
  qualificationName: string;
  issueDate: string;
  expiryDate: string;
  document?: File;
}

// API Response Types
export interface TutorProfileResponse {
  success: boolean;
  data: TutorProfile;
  message?: string;
}

export interface TutorSubjectResponse {
  success: boolean;
  data: TutorSubject;
  message?: string;
}

export interface TutorQualificationResponse {
  success: boolean;
  data: TutorQualification;
  message?: string;
}

// Profile Image Upload Types
export interface ProfileImageUploadResponse {
  success: boolean;
  data: {
    profileImageUrl: string;
    profileImageKey: string;
  };
  message?: string;
}

// Age Group Options
export const AGE_GROUP_OPTIONS = [
  'Early Years (3-5)',
  'Primary (5-11)',
  'Secondary (11-16)',
  'Sixth Form (16-18)',
  'University (18+)',
  'Adult Learning (25+)',
] as const;

// Language Options (Common languages)
export const LANGUAGE_OPTIONS = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Dutch',
  'Russian',
  'Chinese (Mandarin)',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Urdu',
  'Bengali',
  'Polish',
  'Turkish',
  'Other',
] as const;

// Subject Categories (Common tutoring subjects)
export const SUBJECT_OPTIONS = [
  // Mathematics
  'Mathematics',
  'Statistics',
  'Calculus',
  'Algebra',
  'Geometry',
  
  // Sciences
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Environmental Science',
  
  // Languages
  'English Language',
  'English Literature',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Chinese',
  'Japanese',
  
  // Humanities
  'History',
  'Geography',
  'Philosophy',
  'Psychology',
  'Sociology',
  'Politics',
  'Economics',
  
  // Arts
  'Art & Design',
  'Music',
  'Drama',
  'Photography',
  
  // Business & Finance
  'Business Studies',
  'Accounting',
  'Finance',
  'Marketing',
  'Management',
  
  // Technology
  'Programming',
  'Web Development',
  'Data Science',
  'Cybersecurity',
  
  // Other
  'Special Educational Needs',
  'Study Skills',
  'Exam Preparation',
  'Other',
] as const; 