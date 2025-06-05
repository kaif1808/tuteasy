import { z } from 'zod';
import { 
  UKYearGroup, 
  IBProgramme, 
  UKSchoolType, 
  QualificationLevel,
  type SubjectInterest 
} from '../types/ukIbTypes';

// Enhanced student profile validation schema for UK/IB system
export const enhancedStudentProfileSchema = z.object({
  // Academic Level - either UK Year Group or IB Programme (but not both)
  ukYearGroup: z.nativeEnum(UKYearGroup).optional(),
  ibProgramme: z.nativeEnum(IBProgramme).optional(),
  ibYearOfStudy: z.number()
    .int()
    .min(1, 'Year of study must be at least 1')
    .max(6, 'Year of study cannot exceed 6')
    .optional(),
  
  // School Information
  schoolName: z.string()
    .max(200, 'School name must be less than 200 characters')
    .optional(),
  schoolType: z.nativeEnum(UKSchoolType).optional(),
  schoolCountry: z.string()
    .max(100, 'Country name must be less than 100 characters')
    .optional(),
  
  // Subject Interests
  subjectInterests: z.array(z.object({
    subjectName: z.string()
      .min(1, 'Subject name is required')
      .max(100, 'Subject name must be less than 100 characters'),
    qualificationLevel: z.nativeEnum(QualificationLevel),
    examBoard: z.string()
      .max(50, 'Exam board name must be less than 50 characters')
      .optional(),
    isCore: z.boolean().default(false),
    targetGrade: z.string()
      .max(10, 'Target grade must be less than 10 characters')
      .optional(),
  })).default([]),
  
  // Learning Information
  learningGoals: z.string()
    .max(1000, 'Learning goals must be less than 1000 characters')
    .optional(),
  specialNeeds: z.string()
    .max(1000, 'Special needs information must be less than 1000 characters')
    .optional(),
  preferredLearningStyle: z.enum([
    'VISUAL', 
    'AUDITORY', 
    'KINESTHETIC', 
    'READING_WRITING', 
    'MULTIMODAL'
  ]).optional(),
  
  // Other
  timezone: z.string()
    .max(50, 'Timezone must be less than 50 characters')
    .default('Europe/London'),
  parentId: z.string().uuid().optional(),
}).refine(
  (data) => {
    // Either UK Year Group or IB Programme should be selected, but not both
    const hasUKYear = !!data.ukYearGroup;
    const hasIBProgramme = !!data.ibProgramme;
    
    if (hasUKYear && hasIBProgramme) {
      return false;
    }
    
    return hasUKYear || hasIBProgramme;
  },
  {
    message: 'Please select either a UK Year Group or IB Programme, but not both',
    path: ['ukYearGroup'],
  }
).refine(
  (data) => {
    // If IB Programme is selected, year of study should be provided and within valid range
    if (data.ibProgramme && !data.ibYearOfStudy) {
      return false;
    }
    
    // Validate year of study based on programme
    if (data.ibProgramme && data.ibYearOfStudy) {
      switch (data.ibProgramme) {
        case IBProgramme.PYP:
          return data.ibYearOfStudy >= 1 && data.ibYearOfStudy <= 6;
        case IBProgramme.MYP:
          return data.ibYearOfStudy >= 1 && data.ibYearOfStudy <= 5;
        case IBProgramme.DP:
        case IBProgramme.CP:
          return data.ibYearOfStudy >= 1 && data.ibYearOfStudy <= 2;
        default:
          return true;
      }
    }
    
    return true;
  },
  {
    message: 'Please provide a valid year of study for the selected IB programme',
    path: ['ibYearOfStudy'],
  }
).refine(
  (data) => {
    // Subject interests should be appropriate for the academic level
    if (data.subjectInterests.length === 0) {
      return true; // Allow empty subject interests
    }
    
    // Basic validation - could be enhanced with more specific rules
    return data.subjectInterests.every(subject => 
      subject.subjectName.trim().length > 0
    );
  },
  {
    message: 'All subject interests must have valid names',
    path: ['subjectInterests'],
  }
);

export type EnhancedStudentProfileFormData = z.infer<typeof enhancedStudentProfileSchema>;

// Subject interest validation schema for adding individual subjects
export const subjectInterestSchema = z.object({
  subjectName: z.string()
    .min(1, 'Subject name is required')
    .max(100, 'Subject name must be less than 100 characters'),
  qualificationLevel: z.nativeEnum(QualificationLevel, {
    errorMap: () => ({ message: 'Please select a qualification level' }),
  }),
  examBoard: z.string()
    .max(50, 'Exam board name must be less than 50 characters')
    .optional(),
  isCore: z.boolean().default(false),
  targetGrade: z.string()
    .max(10, 'Target grade must be less than 10 characters')
    .optional(),
});

export type SubjectInterestFormData = z.infer<typeof subjectInterestSchema>;

// Helper function to validate academic level combination
export const validateAcademicLevel = (
  ukYearGroup?: UKYearGroup,
  ibProgramme?: IBProgramme,
  ibYearOfStudy?: number
): { isValid: boolean; error?: string } => {
  const hasUKYear = !!ukYearGroup;
  const hasIBProgramme = !!ibProgramme;
  
  if (!hasUKYear && !hasIBProgramme) {
    return {
      isValid: false,
      error: 'Please select either a UK Year Group or IB Programme'
    };
  }
  
  if (hasUKYear && hasIBProgramme) {
    return {
      isValid: false,
      error: 'Please select either UK Year Group or IB Programme, but not both'
    };
  }
  
  if (hasIBProgramme && !ibYearOfStudy) {
    return {
      isValid: false,
      error: 'Please provide year of study for the selected IB programme'
    };
  }
  
  if (hasIBProgramme && ibYearOfStudy) {
    const maxYears = {
      [IBProgramme.PYP]: 6,
      [IBProgramme.MYP]: 5,
      [IBProgramme.DP]: 2,
      [IBProgramme.CP]: 2,
    };
    
    if (ibYearOfStudy < 1 || ibYearOfStudy > maxYears[ibProgramme]) {
      return {
        isValid: false,
        error: `Year of study for ${ibProgramme} must be between 1 and ${maxYears[ibProgramme]}`
      };
    }
  }
  
  return { isValid: true };
};

// Helper function to get validation rules for target grades based on qualification level
export const getTargetGradeOptions = (qualificationLevel: QualificationLevel): string[] => {
  switch (qualificationLevel) {
    case QualificationLevel.GCSE:
    case QualificationLevel.IGCSE:
      return ['9', '8', '7', '6', '5', '4', '3', '2', '1', 'U'];
    case QualificationLevel.A_LEVEL:
    case QualificationLevel.AS_LEVEL:
      return ['A*', 'A', 'B', 'C', 'D', 'E', 'U'];
    case QualificationLevel.BTEC_LEVEL_1:
    case QualificationLevel.BTEC_LEVEL_2:
    case QualificationLevel.BTEC_LEVEL_3:
      return ['Distinction*', 'Distinction', 'Merit', 'Pass', 'Near Pass', 'Unclassified'];
    case QualificationLevel.IB_DP_SL:
    case QualificationLevel.IB_DP_HL:
      return ['7', '6', '5', '4', '3', '2', '1'];
    default:
      return ['Excellent', 'Good', 'Satisfactory', 'Developing'];
  }
};

// Validation for academic progression (ensuring student isn't selecting incompatible levels)
export const validateAcademicProgression = (
  currentLevel: UKYearGroup | IBProgramme,
  targetQualificationLevels: QualificationLevel[]
): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  
  // Add logic for academic progression validation
  // This could include warnings about selecting qualification levels that don't match the year group
  
  return {
    isValid: true,
    warnings
  };
}; 