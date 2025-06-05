// Frontend types for tutor search functionality

export interface TutorSearchParams {
  subjects?: string[];
  levels?: string[];
  keywords?: string;
  sortBy?: 'relevance' | 'experience' | 'hourlyRateMin' | 'hourlyRateMax' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TutorSubject {
  id: string;
  subjectName: string;
  qualificationLevel: string;
  proficiencyLevel: string;
  yearsExperience: number;
  hourlyRate: number | null;
  examBoards: string[];
  ibSubjectGroup: string | null;
  ibLanguage: string | null;
}

export interface TutorQualification {
  id: string;
  qualificationType: string;
  qualificationName: string;
  institution: string | null;
  verificationStatus: string;
}

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
  subjects: TutorSubject[];
  qualifications: TutorQualification[];
  experienceYears: number;
  relevanceScore?: number;
}

export interface SearchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TutorSearchResponse {
  success: boolean;
  data: {
    tutors: TutorSearchResult[];
    pagination: SearchPagination;
    filters: {
      subjects?: string[];
      levels?: string[];
      keywords?: string;
      sortBy: string;
      sortOrder: string;
    };
  };
}

export interface SearchFiltersResponse {
  success: boolean;
  data: {
    subjects: string[];
    qualificationLevels: string[];
  };
}

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

export interface SearchStatisticsResponse {
  success: boolean;
  data: SearchStatistics;
}

// Qualification levels for the search dropdown
export const QUALIFICATION_LEVELS = [
  { value: 'EARLY_YEARS', label: 'Early Years' },
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'KS1', label: 'Key Stage 1' },
  { value: 'KS2', label: 'Key Stage 2' },
  { value: 'KS3', label: 'Key Stage 3' },
  { value: 'GCSE', label: 'GCSE' },
  { value: 'IGCSE', label: 'IGCSE' },
  { value: 'A_LEVEL', label: 'A-Level' },
  { value: 'AS_LEVEL', label: 'AS-Level' },
  { value: 'BTEC_LEVEL_1', label: 'BTEC Level 1' },
  { value: 'BTEC_LEVEL_2', label: 'BTEC Level 2' },
  { value: 'BTEC_LEVEL_3', label: 'BTEC Level 3' },
  { value: 'IB_PYP', label: 'IB Primary Years' },
  { value: 'IB_MYP', label: 'IB Middle Years' },
  { value: 'IB_DP_SL', label: 'IB Diploma (Standard Level)' },
  { value: 'IB_DP_HL', label: 'IB Diploma (Higher Level)' },
  { value: 'IB_CP', label: 'IB Career-related' },
  { value: 'UNDERGRADUATE', label: 'Undergraduate' },
  { value: 'POSTGRADUATE', label: 'Postgraduate' },
  { value: 'ADULT_EDUCATION', label: 'Adult Education' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'experience', label: 'Experience' },
  { value: 'hourlyRateMin', label: 'Price (Low to High)' },
  { value: 'hourlyRateMax', label: 'Price (High to Low)' },
  { value: 'rating', label: 'Rating' },
] as const; 