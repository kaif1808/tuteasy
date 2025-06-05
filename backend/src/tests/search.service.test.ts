import { SearchService } from '../services/search.service';
import { TutorSearchParams } from '../types/search.types';

// Mock Prisma Client
const mockPrisma = {
  tutor: {
    count: jest.fn(),
    findMany: jest.fn(),
    aggregate: jest.fn(),
  },
  tutorSubject: {
    findMany: jest.fn(),
    groupBy: jest.fn(),
  },
};

// Mock the Prisma module
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

describe('SearchService', () => {
  let searchService: SearchService;

  beforeEach(() => {
    searchService = new SearchService();
    jest.clearAllMocks();
  });

  describe('searchTutors', () => {
    const mockTutorData = [
      {
        id: 'tutor1',
        userId: 'user1',
        bio: 'Experienced maths tutor with 5 years experience',
        hourlyRateMin: 25.00,
        hourlyRateMax: 40.00,
        profileImageUrl: 'image1.jpg',
        verificationStatus: 'VERIFIED',
        isActive: true,
        rating: 4.5,
        totalStudents: 20,
        languageProficiencies: ['English', 'Spanish'],
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user1',
          email: 'tutor1@example.com',
          role: 'TUTOR',
        },
        subjects: [
          {
            id: 'subject1',
            subjectName: 'Mathematics',
            qualificationLevel: 'GCSE',
            proficiencyLevel: 'EXPERT',
            yearsExperience: 5,
            hourlyRate: 30.00,
            examBoards: ['AQA', 'Edexcel'],
            ibSubjectGroup: null,
            ibLanguage: null,
          },
        ],
        qualifications: [
          {
            id: 'qual1',
            qualificationType: 'BACHELORS_DEGREE',
            qualificationName: 'Mathematics BSc',
            institution: 'University of Cambridge',
            verificationStatus: 'VERIFIED',
          },
        ],
      },
    ];

    beforeEach(() => {
      (mockPrisma.tutor.count as jest.Mock).mockResolvedValue(1);
      (mockPrisma.tutor.findMany as jest.Mock).mockResolvedValue(mockTutorData);
    });

    it('should search tutors with default parameters', async () => {
      const params: TutorSearchParams = {
        page: 1,
        limit: 10,
        sortBy: 'relevance',
        sortOrder: 'desc',
      };

      const result = await searchService.searchTutors(params);

      expect(result).toHaveProperty('tutors');
      expect(result).toHaveProperty('pagination');
      expect(result).toHaveProperty('filters');
      expect(result.tutors).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should filter tutors by subjects', async () => {
      const params: TutorSearchParams = {
        subjects: ['Mathematics', 'Physics'],
        page: 1,
        limit: 10,
        sortBy: 'relevance',
        sortOrder: 'desc',
      };

      await searchService.searchTutors(params);

      expect(mockPrisma.tutor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            subjects: {
              some: {
                subjectName: {
                  in: ['Mathematics', 'Physics'],
                },
              },
            },
          }),
        })
      );
    });

    it('should filter tutors by qualification levels', async () => {
      const params: TutorSearchParams = {
        levels: ['GCSE', 'A_LEVEL'],
        page: 1,
        limit: 10,
        sortBy: 'relevance',
        sortOrder: 'desc',
      };

      await searchService.searchTutors(params);

      expect(mockPrisma.tutor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            subjects: {
              some: {
                qualificationLevel: {
                  in: ['GCSE', 'A_LEVEL'],
                },
              },
            },
          }),
        })
      );
    });

    it('should search tutors by keywords', async () => {
      const params: TutorSearchParams = {
        keywords: 'mathematics experienced',
        page: 1,
        limit: 10,
        sortBy: 'relevance',
        sortOrder: 'desc',
      };

      await searchService.searchTutors(params);

      expect(mockPrisma.tutor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                bio: {
                  contains: 'mathematics experienced',
                  mode: 'insensitive',
                },
              }),
            ]),
          }),
        })
      );
    });

    it('should combine multiple filters', async () => {
      const params: TutorSearchParams = {
        subjects: ['Mathematics'],
        levels: ['GCSE'],
        keywords: 'experienced',
        page: 1,
        limit: 10,
        sortBy: 'relevance',
        sortOrder: 'desc',
      };

      await searchService.searchTutors(params);

      expect(mockPrisma.tutor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            subjects: {
              some: {
                subjectName: {
                  in: ['Mathematics'],
                },
                qualificationLevel: {
                  in: ['GCSE'],
                },
              },
            },
            OR: expect.any(Array),
          }),
        })
      );
    });

    it('should sort by experience', async () => {
      const params: TutorSearchParams = {
        page: 1,
        limit: 10,
        sortBy: 'experience',
        sortOrder: 'desc',
      };

      await searchService.searchTutors(params);

      expect(mockPrisma.tutor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([
            {
              subjects: {
                _max: {
                  yearsExperience: 'desc',
                },
              },
            },
          ]),
        })
      );
    });

    it('should sort by hourly rate', async () => {
      const params: TutorSearchParams = {
        page: 1,
        limit: 10,
        sortBy: 'hourlyRateMin',
        sortOrder: 'asc',
      };

      await searchService.searchTutors(params);

      expect(mockPrisma.tutor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([
            { hourlyRateMin: 'asc' },
          ]),
        })
      );
    });

    it('should handle pagination correctly', async () => {
      const params: TutorSearchParams = {
        page: 2,
        limit: 5,
        sortBy: 'relevance',
        sortOrder: 'desc',
      };

      await searchService.searchTutors(params);

      expect(mockPrisma.tutor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page - 1) * limit = (2 - 1) * 5 = 5
          take: 5,
        })
      );
    });

    it('should calculate pagination metadata correctly', async () => {
      (mockPrisma.tutor.count as jest.Mock).mockResolvedValue(25);
      
      const params: TutorSearchParams = {
        page: 2,
        limit: 10,
        sortBy: 'relevance',
        sortOrder: 'desc',
      };

      const result = await searchService.searchTutors(params);

      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it('should only return verified and active tutors', async () => {
      const params: TutorSearchParams = {
        page: 1,
        limit: 10,
        sortBy: 'relevance',
        sortOrder: 'desc',
      };

      await searchService.searchTutors(params);

      expect(mockPrisma.tutor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            verificationStatus: 'VERIFIED',
            user: {
              isEmailVerified: true,
            },
          }),
        })
      );
    });

    it('should transform tutor data correctly', async () => {
      const params: TutorSearchParams = {
        page: 1,
        limit: 10,
        sortBy: 'relevance',
        sortOrder: 'desc',
      };

      const result = await searchService.searchTutors(params);

      expect(result.tutors[0]).toMatchObject({
        id: 'tutor1',
        userId: 'user1',
        bio: 'Experienced maths tutor with 5 years experience',
        hourlyRateMin: 25,
        hourlyRateMax: 40,
        rating: 4.5,
        totalStudents: 20,
        experienceYears: 5,
        subjects: expect.arrayContaining([
          expect.objectContaining({
            subjectName: 'Mathematics',
            qualificationLevel: 'GCSE',
          }),
        ]),
      });
    });
  });

  describe('getSearchStatistics', () => {
    beforeEach(() => {
      (mockPrisma.tutor.count as jest.Mock).mockResolvedValue(10);
      (mockPrisma.tutor.aggregate as jest.Mock).mockResolvedValue({
        _avg: {
          rating: 4.2,
          hourlyRateMin: 30.0,
          hourlyRateMax: 50.0,
        },
        _min: {
          hourlyRateMin: 20.0,
        },
        _max: {
          hourlyRateMax: 80.0,
        },
      });
      (mockPrisma.tutorSubject.groupBy as jest.Mock).mockResolvedValue([
        { subjectName: 'Mathematics', _count: { subjectName: 5 } },
        { subjectName: 'Physics', _count: { subjectName: 3 } },
      ]);
      (mockPrisma.tutor.findMany as jest.Mock).mockResolvedValue([
        {
          subjects: [
            { yearsExperience: 3 },
            { yearsExperience: 5 },
          ],
        },
        {
          subjects: [
            { yearsExperience: 2 },
          ],
        },
      ]);
    });

    it('should return search statistics', async () => {
      const params: TutorSearchParams = {
        page: 1,
        limit: 10,
        sortBy: 'relevance',
        sortOrder: 'desc',
      };

      const result = await searchService.getSearchStatistics(params);

      expect(result).toMatchObject({
        totalResults: 10,
        averageRating: 4.2,
        priceRange: {
          min: 20,
          max: 80,
        },
        popularSubjects: [
          { subject: 'Mathematics', count: 5 },
          { subject: 'Physics', count: 3 },
        ],
      });
    });

    it('should calculate average experience correctly', async () => {
      const params: TutorSearchParams = {
        page: 1,
        limit: 10,
        sortBy: 'relevance',
        sortOrder: 'desc',
      };

      const result = await searchService.getSearchStatistics(params);

      // Average of [3, 5, 2] = 10/3 = 3.33
      expect(result.averageExperience).toBeCloseTo(3.33, 2);
    });
  });

  describe('getFilterOptions', () => {
    beforeEach(() => {
      (mockPrisma.tutorSubject.findMany as jest.Mock)
        .mockResolvedValueOnce([
          { subjectName: 'Mathematics' },
          { subjectName: 'Physics' },
          { subjectName: 'Chemistry' },
        ])
        .mockResolvedValueOnce([
          { qualificationLevel: 'GCSE' },
          { qualificationLevel: 'A_LEVEL' },
          { qualificationLevel: 'IB_DP_HL' },
        ]);
    });

    it('should return available filter options', async () => {
      const result = await searchService.getFilterOptions();

      expect(result).toEqual({
        subjects: ['Mathematics', 'Physics', 'Chemistry'],
        qualificationLevels: ['GCSE', 'A_LEVEL', 'IB_DP_HL'],
      });
    });

    it('should only get options from verified active tutors', async () => {
      await searchService.getFilterOptions();

      expect(mockPrisma.tutorSubject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tutor: {
              isActive: true,
              verificationStatus: 'VERIFIED',
              user: {
                isEmailVerified: true,
              },
            },
          },
        })
      );
    });
  });

  describe('calculateRelevanceScore', () => {
    it('should calculate relevance score for keyword matches', () => {
      const tutor = {
        bio: 'Experienced mathematics tutor',
        subjects: [
          { subjectName: 'Mathematics', yearsExperience: 5 },
          { subjectName: 'Physics', yearsExperience: 3 },
        ],
        qualifications: [
          { qualificationName: 'Mathematics BSc', institution: 'Cambridge University' },
        ],
        rating: 4.5,
      };

      // Access private method via bracket notation for testing
      const score = (searchService as any).calculateRelevanceScore(tutor, 'mathematics experienced');

      expect(score).toBeGreaterThan(0);
      expect(typeof score).toBe('number');
    });
  });
}); 