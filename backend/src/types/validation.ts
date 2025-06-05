import { z } from 'zod';

// Create string enums to match Prisma enums
export const ProficiencyLevel = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE', 
  ADVANCED: 'ADVANCED',
  EXPERT: 'EXPERT'
} as const;

export const QualificationType = {
  DEGREE: 'DEGREE',
  TEACHING_CERTIFICATION: 'TEACHING_CERTIFICATION',
  DBS_CHECK: 'DBS_CHECK',
  PROFESSIONAL_CERTIFICATION: 'PROFESSIONAL_CERTIFICATION',
  OTHER: 'OTHER'
} as const;

export const TeachingPreference = {
  ONLINE: 'ONLINE',
  IN_PERSON: 'IN_PERSON',
  BOTH: 'BOTH'
} as const;

// UK/IB Educational System Enums
export const UKYearGroup = {
  NURSERY: 'NURSERY',
  RECEPTION: 'RECEPTION',
  YEAR_1: 'YEAR_1',
  YEAR_2: 'YEAR_2',
  YEAR_3: 'YEAR_3',
  YEAR_4: 'YEAR_4',
  YEAR_5: 'YEAR_5',
  YEAR_6: 'YEAR_6',
  YEAR_7: 'YEAR_7',
  YEAR_8: 'YEAR_8',
  YEAR_9: 'YEAR_9',
  YEAR_10: 'YEAR_10',
  YEAR_11: 'YEAR_11',
  YEAR_12: 'YEAR_12',
  YEAR_13: 'YEAR_13',
} as const;

export const UKKeyStage = {
  EARLY_YEARS: 'EARLY_YEARS',
  KS1: 'KS1',
  KS2: 'KS2',
  KS3: 'KS3',
  KS4: 'KS4',
  KS5: 'KS5',
} as const;

export const IBProgramme = {
  PYP: 'PYP',
  MYP: 'MYP',
  DP: 'DP',
  CP: 'CP',
} as const;

export const SchoolType = {
  STATE_COMPREHENSIVE: 'STATE_COMPREHENSIVE',
  STATE_GRAMMAR: 'STATE_GRAMMAR',
  ACADEMY: 'ACADEMY',
  FREE_SCHOOL: 'FREE_SCHOOL',
  INDEPENDENT_SCHOOL: 'INDEPENDENT_SCHOOL',
  SIXTH_FORM_COLLEGE: 'SIXTH_FORM_COLLEGE',
  FE_COLLEGE: 'FE_COLLEGE',
  INTERNATIONAL_SCHOOL: 'INTERNATIONAL_SCHOOL',
  SPECIAL_SCHOOL: 'SPECIAL_SCHOOL',
  PUPIL_REFERRAL_UNIT: 'PUPIL_REFERRAL_UNIT',
  HOME_EDUCATED: 'HOME_EDUCATED',
  OTHER: 'OTHER',
} as const;

export const QualificationLevel = {
  EARLY_YEARS: 'EARLY_YEARS',
  PRIMARY: 'PRIMARY',
  KS1: 'KS1',
  KS2: 'KS2',
  KS3: 'KS3',
  GCSE: 'GCSE',
  IGCSE: 'IGCSE',
  A_LEVEL: 'A_LEVEL',
  AS_LEVEL: 'AS_LEVEL',
  BTEC_LEVEL_1: 'BTEC_LEVEL_1',
  BTEC_LEVEL_2: 'BTEC_LEVEL_2',
  BTEC_LEVEL_3: 'BTEC_LEVEL_3',
  IB_PYP: 'IB_PYP',
  IB_MYP: 'IB_MYP',
  IB_DP_SL: 'IB_DP_SL',
  IB_DP_HL: 'IB_DP_HL',
  IB_CP: 'IB_CP',
  UNDERGRADUATE: 'UNDERGRADUATE',
  POSTGRADUATE: 'POSTGRADUATE',
  ADULT_EDUCATION: 'ADULT_EDUCATION',
  OTHER: 'OTHER',
} as const;

// Subject Interest Schema for UK/IB Student Profiles
export const subjectInterestSchema = z.object({
  subjectName: z.string()
    .min(1, 'Subject name is required')
    .max(100, 'Subject name must be less than 100 characters'),
  qualificationLevel: z.enum([
    'EARLY_YEARS', 'PRIMARY', 'KS1', 'KS2', 'KS3', 'GCSE', 'IGCSE',
    'A_LEVEL', 'AS_LEVEL', 'BTEC_LEVEL_1', 'BTEC_LEVEL_2', 'BTEC_LEVEL_3',
    'IB_PYP', 'IB_MYP', 'IB_DP_SL', 'IB_DP_HL', 'IB_CP',
    'UNDERGRADUATE', 'POSTGRADUATE', 'ADULT_EDUCATION', 'OTHER'
  ] as const),
  examBoard: z.string()
    .max(50, 'Exam board name must be less than 50 characters')
    .optional(),
  isCore: z.boolean().default(false),
  targetGrade: z.string()
    .max(10, 'Target grade must be less than 10 characters')
    .optional(),
});

// Profile update schema
export const updateTutorProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  hourlyRateMin: z.number().min(0).max(999999.99).optional(),
  hourlyRateMax: z.number().min(0).max(999999.99).optional(),
  teachingPreference: z.enum(['ONLINE', 'IN_PERSON', 'BOTH']).optional(),
  ageGroupSpecialization: z.array(z.string()).optional(),
  languageProficiencies: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.hourlyRateMin !== undefined && data.hourlyRateMax !== undefined) {
      return data.hourlyRateMin <= data.hourlyRateMax;
    }
    return true;
  },
  {
    message: "Minimum hourly rate must be less than or equal to maximum hourly rate",
    path: ["hourlyRateMin"],
  }
);

// Subject schemas
export const createSubjectSchema = z.object({
  subjectName: z.string().min(1).max(100),
  proficiencyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  yearsExperience: z.number().int().min(0).max(50),
  hourlyRate: z.number().min(0).max(999999.99).optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

// Qualification schemas
export const createQualificationSchema = z.object({
  qualificationType: z.enum(['DEGREE', 'TEACHING_CERTIFICATION', 'DBS_CHECK', 'PROFESSIONAL_CERTIFICATION', 'OTHER']),
  institution: z.string().max(255).optional(),
  qualificationName: z.string().min(1).max(255),
  issueDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
}).refine(
  (data) => {
    if (data.issueDate && data.expiryDate) {
      return new Date(data.issueDate) < new Date(data.expiryDate);
    }
    return true;
  },
  {
    message: "Issue date must be before expiry date",
    path: ["issueDate"],
  }
);

export const updateQualificationSchema = z.object({
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  verificationNotes: z.string().max(500).optional(),
});

// Student Profile validation schemas
export const LearningStyle = {
  VISUAL: 'VISUAL',
  AUDITORY: 'AUDITORY',
  KINESTHETIC: 'KINESTHETIC',
  READING_WRITING: 'READING_WRITING',
  MULTIMODAL: 'MULTIMODAL'
} as const;

// Enhanced Student Profile Schema for UK/IB System
export const enhancedStudentProfileSchema = z.object({
  // Academic Level - either UK Year Group or IB Programme (but not both)
  ukYearGroup: z.enum([
    'NURSERY', 'RECEPTION', 'YEAR_1', 'YEAR_2', 'YEAR_3', 'YEAR_4', 'YEAR_5', 'YEAR_6',
    'YEAR_7', 'YEAR_8', 'YEAR_9', 'YEAR_10', 'YEAR_11', 'YEAR_12', 'YEAR_13'
  ] as const).optional(),
  ukKeyStage: z.enum(['EARLY_YEARS', 'KS1', 'KS2', 'KS3', 'KS4', 'KS5'] as const).optional(),
  
  // IB Programme Information
  ibProgramme: z.enum(['PYP', 'MYP', 'DP', 'CP'] as const).optional(),
  ibYear: z.number()
    .int()
    .min(1, 'IB year must be at least 1')
    .max(6, 'IB year cannot exceed 6')
    .optional(),
  
  // Legacy fields for backward compatibility
  gradeLevel: z.string().max(50).optional(),
  academicLevelDisplay: z.string().max(100).optional(),
  
  // School Information
  schoolName: z.string().max(200).optional(),
  schoolType: z.enum([
    'STATE_COMPREHENSIVE', 'STATE_GRAMMAR', 'ACADEMY', 'FREE_SCHOOL',
    'INDEPENDENT_SCHOOL', 'SIXTH_FORM_COLLEGE', 'FE_COLLEGE', 'INTERNATIONAL_SCHOOL',
    'SPECIAL_SCHOOL', 'PUPIL_REFERRAL_UNIT', 'HOME_EDUCATED', 'OTHER'
  ] as const).optional(),
  
  // Subject Interests - Enhanced structure
  subjectInterests: z.array(subjectInterestSchema).default([]),
  
  // Learning Information
  learningGoals: z.string().max(1000).optional(),
  specialNeeds: z.string().max(1000).optional(),
  preferredLearningStyle: z.enum(['VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING_WRITING', 'MULTIMODAL']).optional(),
  
  // Other
  timezone: z.string().max(50).default('Europe/London'),
  parentId: z.string().uuid().optional(),
}).refine(
  (data) => {
    // Either UK Year Group or IB Programme should be selected, but not both
    const hasUKYear = !!data.ukYearGroup;
    const hasIBProgramme = !!data.ibProgramme;
    
    // Allow neither (for legacy profiles) or one of them, but not both
    return !(hasUKYear && hasIBProgramme);
  },
  {
    message: 'Please select either a UK Year Group or IB Programme, but not both',
    path: ['ukYearGroup'],
  }
).refine(
  (data) => {
    // If IB Programme is selected, year of study should be provided and within valid range
    if (data.ibProgramme && !data.ibYear) {
      return false;
    }
    
    // Validate year of study based on programme
    if (data.ibProgramme && data.ibYear) {
      switch (data.ibProgramme) {
        case 'PYP':
          return data.ibYear >= 1 && data.ibYear <= 6;
        case 'MYP':
          return data.ibYear >= 1 && data.ibYear <= 5;
        case 'DP':
        case 'CP':
          return data.ibYear >= 1 && data.ibYear <= 2;
        default:
          return true;
      }
    }
    
    return true;
  },
  {
    message: 'Please provide a valid year of study for the selected IB programme',
    path: ['ibYear'],
  }
).refine(
  (data) => {
    // Validate UK Key Stage is correctly derived from UK Year Group
    if (data.ukYearGroup && data.ukKeyStage) {
      const yearToKeyStageMap: Record<string, string> = {
        'NURSERY': 'EARLY_YEARS',
        'RECEPTION': 'EARLY_YEARS',
        'YEAR_1': 'KS1',
        'YEAR_2': 'KS1',
        'YEAR_3': 'KS2',
        'YEAR_4': 'KS2',
        'YEAR_5': 'KS2',
        'YEAR_6': 'KS2',
        'YEAR_7': 'KS3',
        'YEAR_8': 'KS3',
        'YEAR_9': 'KS3',
        'YEAR_10': 'KS4',
        'YEAR_11': 'KS4',
        'YEAR_12': 'KS5',
        'YEAR_13': 'KS5',
      };
      
      return yearToKeyStageMap[data.ukYearGroup] === data.ukKeyStage;
    }
    
    return true;
  },
  {
    message: 'UK Key Stage must match the selected UK Year Group',
    path: ['ukKeyStage'],
  }
);

// Legacy schemas for backward compatibility
export const updateStudentProfileSchema = z.object({
  gradeLevel: z.string().max(50).optional(),
  schoolName: z.string().max(200).optional(),
  subjectsOfInterest: z.array(z.string().max(100)).optional(),
  learningGoals: z.string().max(1000).optional(),
  specialNeeds: z.string().max(1000).optional(),
  preferredLearningStyle: z.enum(['VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING_WRITING', 'MULTIMODAL']).optional(),
  timezone: z.string().max(50).optional(),
  parentId: z.string().uuid().optional(),
});

export const createStudentProfileSchema = z.object({
  gradeLevel: z.string().max(50).optional(),
  schoolName: z.string().max(200).optional(),
  subjectsOfInterest: z.array(z.string().max(100)).default([]),
  learningGoals: z.string().max(1000).optional(),
  specialNeeds: z.string().max(1000).optional(),
  preferredLearningStyle: z.enum(['VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING_WRITING', 'MULTIMODAL']).optional(),
  timezone: z.string().max(50).default('UTC'),
  parentId: z.string().uuid().optional(),
});

// New enhanced schemas for UK/IB support
export const createEnhancedStudentProfileSchema = enhancedStudentProfileSchema;

// For update schema, we need to make all fields optional while preserving refinements
export const updateEnhancedStudentProfileSchema = z.object({
  // Academic Level - either UK Year Group or IB Programme (but not both)
  ukYearGroup: z.enum([
    'NURSERY', 'RECEPTION', 'YEAR_1', 'YEAR_2', 'YEAR_3', 'YEAR_4', 'YEAR_5', 'YEAR_6',
    'YEAR_7', 'YEAR_8', 'YEAR_9', 'YEAR_10', 'YEAR_11', 'YEAR_12', 'YEAR_13'
  ] as const).optional(),
  ukKeyStage: z.enum(['EARLY_YEARS', 'KS1', 'KS2', 'KS3', 'KS4', 'KS5'] as const).optional(),
  
  // IB Programme Information
  ibProgramme: z.enum(['PYP', 'MYP', 'DP', 'CP'] as const).optional(),
  ibYear: z.number()
    .int()
    .min(1, 'IB year must be at least 1')
    .max(6, 'IB year cannot exceed 6')
    .optional(),
  
  // Legacy fields for backward compatibility
  gradeLevel: z.string().max(50).optional(),
  academicLevelDisplay: z.string().max(100).optional(),
  
  // School Information
  schoolName: z.string().max(200).optional(),
  schoolType: z.enum([
    'STATE_COMPREHENSIVE', 'STATE_GRAMMAR', 'ACADEMY', 'FREE_SCHOOL',
    'INDEPENDENT_SCHOOL', 'SIXTH_FORM_COLLEGE', 'FE_COLLEGE', 'INTERNATIONAL_SCHOOL',
    'SPECIAL_SCHOOL', 'PUPIL_REFERRAL_UNIT', 'HOME_EDUCATED', 'OTHER'
  ] as const).optional(),
  
  // Subject Interests - Enhanced structure
  subjectInterests: z.array(subjectInterestSchema).optional(),
  
  // Learning Information
  learningGoals: z.string().max(1000).optional(),
  specialNeeds: z.string().max(1000).optional(),
  preferredLearningStyle: z.enum(['VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING_WRITING', 'MULTIMODAL']).optional(),
  
  // Other
  timezone: z.string().max(50).optional(),
  parentId: z.string().uuid().optional(),
}).refine(
  (data) => {
    // Either UK Year Group or IB Programme should be selected, but not both
    const hasUKYear = !!data.ukYearGroup;
    const hasIBProgramme = !!data.ibProgramme;
    
    // Allow neither (for legacy profiles) or one of them, but not both
    return !(hasUKYear && hasIBProgramme);
  },
  {
    message: 'Please select either a UK Year Group or IB Programme, but not both',
    path: ['ukYearGroup'],
  }
).refine(
  (data) => {
    // If IB Programme is selected, year of study should be provided and within valid range
    if (data.ibProgramme && !data.ibYear) {
      return false;
    }
    
    // Validate year of study based on programme
    if (data.ibProgramme && data.ibYear) {
      switch (data.ibProgramme) {
        case 'PYP':
          return data.ibYear >= 1 && data.ibYear <= 6;
        case 'MYP':
          return data.ibYear >= 1 && data.ibYear <= 5;
        case 'DP':
        case 'CP':
          return data.ibYear >= 1 && data.ibYear <= 2;
        default:
          return true;
      }
    }
    
    return true;
  },
  {
    message: 'Please provide a valid year of study for the selected IB programme',
    path: ['ibYear'],
  }
).refine(
  (data) => {
    // Validate UK Key Stage is correctly derived from UK Year Group
    if (data.ukYearGroup && data.ukKeyStage) {
      const yearToKeyStageMap: Record<string, string> = {
        'NURSERY': 'EARLY_YEARS',
        'RECEPTION': 'EARLY_YEARS',
        'YEAR_1': 'KS1',
        'YEAR_2': 'KS1',
        'YEAR_3': 'KS2',
        'YEAR_4': 'KS2',
        'YEAR_5': 'KS2',
        'YEAR_6': 'KS2',
        'YEAR_7': 'KS3',
        'YEAR_8': 'KS3',
        'YEAR_9': 'KS3',
        'YEAR_10': 'KS4',
        'YEAR_11': 'KS4',
        'YEAR_12': 'KS5',
        'YEAR_13': 'KS5',
      };
      
      return yearToKeyStageMap[data.ukYearGroup] === data.ukKeyStage;
    }
    
    return true;
  },
  {
    message: 'UK Key Stage must match the selected UK Year Group',
    path: ['ukKeyStage'],
  }
); 