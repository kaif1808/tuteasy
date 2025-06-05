import { z } from 'zod';

// Search request validation schema
export const tutorSearchSchema = z.object({
  // Subject filters - array of subject names
  subjects: z.array(z.string().min(1).max(100)).optional(),
  
  // Level filters - array of qualification levels
  levels: z.array(z.enum([
    'EARLY_YEARS', 'PRIMARY', 'KS1', 'KS2', 'KS3', 'GCSE', 'IGCSE',
    'A_LEVEL', 'AS_LEVEL', 'BTEC_LEVEL_1', 'BTEC_LEVEL_2', 'BTEC_LEVEL_3',
    'IB_PYP', 'IB_MYP', 'IB_DP_SL', 'IB_DP_HL', 'IB_CP',
    'UNDERGRADUATE', 'POSTGRADUATE', 'ADULT_EDUCATION', 'OTHER'
  ] as const)).optional(),
  
  // Keyword search in bio, qualifications
  keywords: z.string().max(255).optional(),
  
  // Sorting options
  sortBy: z.enum(['relevance', 'experience', 'hourlyRateMin', 'hourlyRateMax', 'rating']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type TutorSearchParams = z.infer<typeof tutorSearchSchema>;

// Search result types
export interface TutorSearchResult {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  bio: string | null;
  hourlyRateMin: number | null;
  hourlyRateMax: number | null;
  profileImageUrl: string | null;
  verificationStatus: string;
  isActive: boolean;
  rating: number;
  totalStudents: number;
  languageProficiencies: string[];
  subjects: Array<{
    id: string;
    subjectName: string;
    qualificationLevel: string;
    proficiencyLevel: string;
    yearsExperience: number;
    hourlyRate: number | null;
    examBoards: string[];
    ibSubjectGroup: string | null;
    ibLanguage: string | null;
  }>;
  qualifications: Array<{
    id: string;
    qualificationType: string;
    qualificationName: string;
    institution: string | null;
    verificationStatus: string;
  }>;
  // Computed fields
  experienceYears: number;
  relevanceScore?: number;
}

export interface TutorSearchResponse {
  tutors: TutorSearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    subjects?: string[];
    levels?: string[];
    keywords?: string;
    sortBy: string;
    sortOrder: string;
  };
}

// Search statistics for analytics
export interface SearchStatistics {
  totalResults: number;
  averageExperience: number;
  averageRating: number;
  priceRange: {
    min: number | null;
    max: number | null;
  };
  popularSubjects: Array<{
    subject: string;
    count: number;
  }>;
} 