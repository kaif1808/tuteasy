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