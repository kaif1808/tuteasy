import { z } from 'zod';

// Frontend validation schema that mirrors backend validation
export const subjectFormSchema = z.object({
  subjectName: z.string().min(1, 'Subject name is required').max(100, 'Subject name too long'),
  qualificationLevel: z.enum([
    'EARLY_YEARS', 'PRIMARY', 'KS1', 'KS2', 'KS3', 'GCSE', 'IGCSE', 
    'A_LEVEL', 'AS_LEVEL', 'BTEC_LEVEL_1', 'BTEC_LEVEL_2', 'BTEC_LEVEL_3',
    'IB_PYP', 'IB_MYP', 'IB_DP_SL', 'IB_DP_HL', 'IB_CP',
    'UNDERGRADUATE', 'POSTGRADUATE', 'ADULT_EDUCATION', 'OTHER'
  ] as const, {
    errorMap: () => ({ message: 'Please select a qualification level' })
  }),
  proficiencyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const, {
    errorMap: () => ({ message: 'Please select your proficiency level' })
  }),
  yearsExperience: z.number()
    .min(0, 'Experience cannot be negative')
    .max(50, 'Maximum 50 years')
    .int('Years must be a whole number'),
  hourlyRate: z.number()
    .min(0, 'Rate cannot be negative')
    .max(999999.99, 'Rate too high')
    .optional(),
  examBoards: z.array(z.string()).optional(),
  ibSubjectGroup: z.string().optional(),
  ibLanguage: z.string().optional(),
}).refine((data) => {
  // If subject name is "Other", we need a custom subject
  return data.subjectName !== 'Other' || !!data.subjectName;
}, {
  message: 'Please enter a custom subject name',
  path: ['subjectName'],
});

export type SubjectFormData = z.infer<typeof subjectFormSchema>;

// Utility function to format qualification level display
export const formatQualificationLevel = (level: string): string => {
  const levelMap: Record<string, string> = {
    'EARLY_YEARS': 'Early Years (Ages 3-5)',
    'PRIMARY': 'Primary (Ages 5-11)',
    'KS1': 'Key Stage 1 (Ages 5-7)',
    'KS2': 'Key Stage 2 (Ages 7-11)',
    'KS3': 'Key Stage 3 (Ages 11-14)',
    'GCSE': 'GCSE (Ages 14-16)',
    'IGCSE': 'IGCSE (Ages 14-16)',
    'A_LEVEL': 'A-Level (Ages 16-18)',
    'AS_LEVEL': 'AS-Level (Age 16)',
    'BTEC_LEVEL_1': 'BTEC Level 1',
    'BTEC_LEVEL_2': 'BTEC Level 2',
    'BTEC_LEVEL_3': 'BTEC Level 3',
    'IB_PYP': 'IB PYP (Ages 3-12)',
    'IB_MYP': 'IB MYP (Ages 11-16)',
    'IB_DP_SL': 'IB DP Standard Level (Ages 16-19)',
    'IB_DP_HL': 'IB DP Higher Level (Ages 16-19)',
    'IB_CP': 'IB CP (Ages 16-19)',
    'UNDERGRADUATE': 'Undergraduate',
    'POSTGRADUATE': 'Postgraduate',
    'ADULT_EDUCATION': 'Adult Education',
    'OTHER': 'Other',
  };
  
  return levelMap[level] || level;
}; 