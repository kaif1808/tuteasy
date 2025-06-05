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

// UK/IB Qualification Level enum aligned with our enhanced Prisma schema
export enum QualificationLevel {
  EARLY_YEARS = 'EARLY_YEARS',
  PRIMARY = 'PRIMARY',
  KS1 = 'KS1',
  KS2 = 'KS2',
  KS3 = 'KS3',
  GCSE = 'GCSE',
  IGCSE = 'IGCSE',
  A_LEVEL = 'A_LEVEL',
  AS_LEVEL = 'AS_LEVEL',
  BTEC_LEVEL_1 = 'BTEC_LEVEL_1',
  BTEC_LEVEL_2 = 'BTEC_LEVEL_2',
  BTEC_LEVEL_3 = 'BTEC_LEVEL_3',
  IB_PYP = 'IB_PYP',
  IB_MYP = 'IB_MYP',
  IB_DP_SL = 'IB_DP_SL',     // Standard Level
  IB_DP_HL = 'IB_DP_HL',     // Higher Level
  IB_CP = 'IB_CP',
  UNDERGRADUATE = 'UNDERGRADUATE',
  POSTGRADUATE = 'POSTGRADUATE',
  ADULT_EDUCATION = 'ADULT_EDUCATION',
  OTHER = 'OTHER',
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

// Enhanced Tutor Subject Interface with UK/IB support
export interface TutorSubject {
  id: string;
  tutorId: string;
  subjectName: string;
  qualificationLevel: QualificationLevel;  // NEW: UK/IB qualification level
  proficiencyLevel: ProficiencyLevel;      // Teaching confidence level  
  yearsExperience: number;
  hourlyRate?: number;
  examBoards?: string[];                   // NEW: UK exam boards (AQA, Edexcel, OCR)
  ibSubjectGroup?: string;                 // NEW: IB subject group
  ibLanguage?: string;                     // NEW: For IB language subjects
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
  qualificationLevel: QualificationLevel;  // NEW: UK/IB qualification level
  proficiencyLevel: ProficiencyLevel;      // Teaching confidence level
  yearsExperience: number;
  hourlyRate?: number;
  examBoards?: string[];                   // NEW: UK exam boards
  ibSubjectGroup?: string;                 // NEW: IB subject group 
  ibLanguage?: string;                     // NEW: For IB language subjects
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

// UK/IB Qualification Level Options with descriptions
export const QUALIFICATION_LEVEL_OPTIONS = [
  { value: 'EARLY_YEARS', label: 'Early Years (Ages 3-5)', description: 'Nursery and Reception' },
  { value: 'PRIMARY', label: 'Primary (Ages 5-11)', description: 'General primary education' },
  { value: 'KS1', label: 'Key Stage 1 (Ages 5-7)', description: 'Years 1-2, foundation subjects' },
  { value: 'KS2', label: 'Key Stage 2 (Ages 7-11)', description: 'Years 3-6, core skills' },
  { value: 'KS3', label: 'Key Stage 3 (Ages 11-14)', description: 'Years 7-9, broad curriculum' },
  { value: 'GCSE', label: 'GCSE (Ages 14-16)', description: 'Key Stage 4, Years 10-11' },
  { value: 'IGCSE', label: 'IGCSE (Ages 14-16)', description: 'International GCSE' },
  { value: 'A_LEVEL', label: 'A-Level (Ages 16-18)', description: 'Advanced Level, Years 12-13' },
  { value: 'AS_LEVEL', label: 'AS-Level (Age 16)', description: 'Advanced Subsidiary Level, Year 12' },
  { value: 'BTEC_LEVEL_1', label: 'BTEC Level 1', description: 'Vocational qualification' },
  { value: 'BTEC_LEVEL_2', label: 'BTEC Level 2', description: 'GCSE equivalent vocational' },
  { value: 'BTEC_LEVEL_3', label: 'BTEC Level 3', description: 'A-Level equivalent vocational' },
  { value: 'IB_PYP', label: 'IB PYP (Ages 3-12)', description: 'Primary Years Programme' },
  { value: 'IB_MYP', label: 'IB MYP (Ages 11-16)', description: 'Middle Years Programme' },
  { value: 'IB_DP_SL', label: 'IB DP Standard Level (Ages 16-19)', description: 'Diploma Programme SL' },
  { value: 'IB_DP_HL', label: 'IB DP Higher Level (Ages 16-19)', description: 'Diploma Programme HL' },
  { value: 'IB_CP', label: 'IB CP (Ages 16-19)', description: 'Career-related Programme' },
  { value: 'UNDERGRADUATE', label: 'Undergraduate', description: 'University degree level' },
  { value: 'POSTGRADUATE', label: 'Postgraduate', description: 'Masters/PhD level' },
  { value: 'ADULT_EDUCATION', label: 'Adult Education', description: 'Continuing education' },
  { value: 'OTHER', label: 'Other', description: 'Custom qualification level' },
] as const;

// UK Exam Board Options
export const UK_EXAM_BOARDS = [
  'AQA',
  'Edexcel',
  'OCR', 
  'WJEC',
  'CCEA',
  'SQA',
  'Cambridge International',
  'IB Organisation',
  'Other',
] as const;

// IB Subject Group Options
export const IB_SUBJECT_GROUPS = [
  'Group 1: Studies in Language and Literature',
  'Group 2: Language Acquisition', 
  'Group 3: Individuals and Societies',
  'Group 4: Sciences',
  'Group 5: Mathematics',
  'Group 6: The Arts',
  'Core: Extended Essay',
  'Core: Theory of Knowledge',
  'Core: Creativity, Activity, Service',
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