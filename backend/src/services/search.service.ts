import { PrismaClient } from '@prisma/client';
import { TutorSearchParams, TutorSearchResult, TutorSearchResponse, SearchStatistics } from '../types/search.types';

const prisma = new PrismaClient();

export class SearchService {
  /**
   * Search tutors with filtering, sorting, and pagination
   */
  async searchTutors(params: TutorSearchParams): Promise<TutorSearchResponse> {
    const { subjects, levels, keywords, sortBy, sortOrder, page, limit, availability, minRate, maxRate } = params;
    
    // Build the where clause
    const whereClause: any = {
      isActive: true,
      verificationStatus: 'VERIFIED', // Only show verified tutors
      user: {
        isEmailVerified: true, // Only show email-verified users
      },
    };

    // Subject and level filtering
    if (subjects && subjects.length > 0) {
      whereClause.subjects = {
        some: {
          subjectName: {
            in: subjects,
          },
        },
      };
    }

    if (levels && levels.length > 0) {
      whereClause.subjects = {
        some: {
          ...whereClause.subjects?.some,
          qualificationLevel: {
            in: levels,
          },
        },
      };
    }

    // Availability filtering
    if (availability && availability.length > 0) {
      whereClause.availability = {
        hasSome: availability,
      };
    }

    // Rate filtering
    if (minRate !== undefined) {
      whereClause.hourlyRateMin = {
        ...whereClause.hourlyRateMin,
        gte: minRate,
      };
    }
    if (maxRate !== undefined) {
      whereClause.hourlyRateMax = {
        ...whereClause.hourlyRateMax,
        lte: maxRate,
      };
    }

    // Keyword search in bio and qualifications
    if (keywords && keywords.trim().length > 0) {
      const keywordTerms = keywords.trim().split(/\s+/);
      whereClause.OR = [
        {
          bio: {
            contains: keywords,
            mode: 'insensitive',
          },
        },
        {
          qualifications: {
            some: {
              qualificationName: {
                contains: keywords,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          qualifications: {
            some: {
              institution: {
                contains: keywords,
                mode: 'insensitive',
              },
            },
          },
        },
        ...keywordTerms.map(term => ({
          subjects: {
            some: {
              subjectName: {
                contains: term,
                mode: 'insensitive',
              },
            },
          },
        })),
      ];
    }

    // Count total results for pagination
    const total = await prisma.tutor.count({
      where: whereClause,
    });

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Build order by clause
    let orderBy: any[] = [];
    
    switch (sortBy) {
      case 'experience':
        // Sort by maximum years of experience across all subjects
        orderBy = [
          {
            subjects: {
              _max: {
                yearsExperience: sortOrder,
              },
            },
          },
          { createdAt: 'desc' }, // Secondary sort
        ];
        break;
      case 'hourlyRateMin':
        orderBy = [
          { hourlyRateMin: sortOrder },
          { createdAt: 'desc' },
        ];
        break;
      case 'hourlyRateMax':
        orderBy = [
          { hourlyRateMax: sortOrder },
          { createdAt: 'desc' },
        ];
        break;
      case 'rating':
        orderBy = [
          { rating: sortOrder },
          { totalStudents: 'desc' }, // Secondary sort by experience
          { createdAt: 'desc' },
        ];
        break;
      case 'relevance':
      default:
        // For relevance, we'll sort by a combination of factors
        // and calculate relevance score in post-processing
        orderBy = [
          { rating: 'desc' },
          { totalStudents: 'desc' },
          { createdAt: 'desc' },
        ];
        break;
    }

    // Execute the search query
    const tutors = await prisma.tutor.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        subjects: {
          orderBy: [
            { yearsExperience: 'desc' },
            { proficiencyLevel: 'desc' },
          ],
        },
        qualifications: {
          where: {
            verificationStatus: 'VERIFIED',
          },
          select: {
            id: true,
            qualificationType: true,
            qualificationName: true,
            institution: true,
            verificationStatus: true,
          },
        },
      },
      orderBy,
      skip: offset,
      take: limit,
    });

    // Transform results and calculate relevance scores
    const transformedTutors: TutorSearchResult[] = tutors.map(tutor => {
      // Calculate maximum years of experience across all subjects
      const experienceYears = tutor.subjects.reduce(
        (max, subject) => Math.max(max, subject.yearsExperience),
        0
      );

      // Calculate relevance score for keyword searches
      let relevanceScore = 0;
      if (keywords && keywords.trim().length > 0) {
        relevanceScore = this.calculateRelevanceScore(tutor, keywords);
      }

      return {
        id: tutor.id,
        userId: tutor.userId,
        user: tutor.user,
        bio: tutor.bio,
        hourlyRateMin: tutor.hourlyRateMin ? Number(tutor.hourlyRateMin) : null,
        hourlyRateMax: tutor.hourlyRateMax ? Number(tutor.hourlyRateMax) : null,
        profileImageUrl: tutor.profileImageUrl,
        verificationStatus: tutor.verificationStatus,
        isActive: tutor.isActive,
        rating: 0, // TODO: Add rating system to Tutor model
        totalStudents: 0, // TODO: Add totalStudents tracking to Tutor model
        languageProficiencies: tutor.languageProficiencies,
        subjects: tutor.subjects.map(subject => ({
          id: subject.id,
          subjectName: subject.subjectName,
          qualificationLevel: subject.qualificationLevel,
          proficiencyLevel: subject.proficiencyLevel,
          yearsExperience: subject.yearsExperience,
          hourlyRate: subject.hourlyRate ? Number(subject.hourlyRate) : null,
          examBoards: subject.examBoards,
          ibSubjectGroup: subject.ibSubjectGroup,
          ibLanguage: subject.ibLanguage,
        })),
        qualifications: tutor.qualifications,
        experienceYears,
        relevanceScore: keywords ? relevanceScore : undefined,
      };
    });

    // Re-sort by relevance score if using relevance sort
    if (sortBy === 'relevance' && keywords) {
      transformedTutors.sort((a, b) => {
        const scoreA = a.relevanceScore || 0;
        const scoreB = b.relevanceScore || 0;
        return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
      });
    }

    return {
      tutors: transformedTutors,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        subjects,
        levels,
        availability,
        minRate,
        maxRate,
        keywords,
        sortBy,
        sortOrder,
      },
    };
  }

  /**
   * Calculate relevance score for keyword matching
   */
  private calculateRelevanceScore(tutor: any, keywords: string): number {
    let score = 0;
    const keywordTerms = keywords.toLowerCase().split(/\s+/);
    
    // Score bio matches (highest weight)
    if (tutor.bio) {
      const bioLower = tutor.bio.toLowerCase();
      keywordTerms.forEach(term => {
        if (bioLower.includes(term)) {
          score += 10; // High weight for bio matches
        }
      });
    }

    // Score subject name matches (high weight)
    tutor.subjects.forEach((subject: any) => {
      const subjectLower = subject.subjectName.toLowerCase();
      keywordTerms.forEach(term => {
        if (subjectLower.includes(term)) {
          score += 8; // High weight for subject matches
          // Bonus for exact subject name match
          if (subjectLower === term) {
            score += 5;
          }
        }
      });
    });

    // Score qualification matches (medium weight)
    tutor.qualifications.forEach((qual: any) => {
      const qualNameLower = qual.qualificationName.toLowerCase();
      const institutionLower = qual.institution?.toLowerCase() || '';
      
      keywordTerms.forEach(term => {
        if (qualNameLower.includes(term)) {
          score += 5; // Medium weight for qualification matches
        }
        if (institutionLower.includes(term)) {
          score += 3; // Lower weight for institution matches
        }
      });
    });

    // Bonus for experience and rating
    const maxExperience = tutor.subjects.reduce(
      (max: number, subject: any) => Math.max(max, subject.yearsExperience),
      0
    );
    score += Math.min(maxExperience * 0.5, 5); // Up to 5 points for experience
    score += (Number(tutor.rating) || 0) * 2; // Up to 10 points for rating

    return Math.round(score * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get search statistics for analytics
   */
  async getSearchStatistics(params: TutorSearchParams): Promise<SearchStatistics> {
    const { subjects, levels, keywords } = params;
    
    // Build the same where clause as search
    const whereClause: any = {
      isActive: true,
      verificationStatus: 'VERIFIED',
      user: {
        isEmailVerified: true,
      },
    };

    if (subjects && subjects.length > 0) {
      whereClause.subjects = {
        some: {
          subjectName: {
            in: subjects,
          },
        },
      };
    }

    if (levels && levels.length > 0) {
      whereClause.subjects = {
        some: {
          ...whereClause.subjects?.some,
          qualificationLevel: {
            in: levels,
          },
        },
      };
    }

    if (keywords && keywords.trim().length > 0) {
      // Same keyword logic as search
      const keywordTerms = keywords.trim().split(/\s+/);
      whereClause.OR = [
        {
          bio: {
            contains: keywords,
            mode: 'insensitive',
          },
        },
        {
          qualifications: {
            some: {
              qualificationName: {
                contains: keywords,
                mode: 'insensitive',
              },
            },
          },
        },
        ...keywordTerms.map(term => ({
          subjects: {
            some: {
              subjectName: {
                contains: term,
                mode: 'insensitive',
              },
            },
          },
        })),
      ];
    }

    // Get statistics
    const [totalResults, aggregateData, popularSubjects] = await Promise.all([
      // Total count
      prisma.tutor.count({ where: whereClause }),
      
      // Aggregate statistics
      prisma.tutor.aggregate({
        where: whereClause,
        _avg: {
          hourlyRateMin: true,
          hourlyRateMax: true,
        },
        _min: {
          hourlyRateMin: true,
        },
        _max: {
          hourlyRateMax: true,
        },
      }),
      
      // Popular subjects
      prisma.tutorSubject.groupBy({
        by: ['subjectName'],
        where: {
          tutor: whereClause,
        },
        _count: {
          subjectName: true,
        },
        orderBy: {
          _count: {
            subjectName: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    // Calculate average experience across all matching tutors
    const tutorsWithExperience = await prisma.tutor.findMany({
      where: whereClause,
      select: {
        subjects: {
          select: {
            yearsExperience: true,
          },
        },
      },
    });

    const allExperienceValues = tutorsWithExperience.flatMap(tutor =>
      tutor.subjects.map(subject => subject.yearsExperience)
    );
    
    const averageExperience = allExperienceValues.length > 0
      ? allExperienceValues.reduce((sum, exp) => sum + exp, 0) / allExperienceValues.length
      : 0;

    return {
      totalResults,
      averageExperience: Math.round(averageExperience * 100) / 100,
      averageRating: 0, // TODO: Add rating system to calculate actual average
      priceRange: {
        min: aggregateData._min?.hourlyRateMin ? Number(aggregateData._min.hourlyRateMin) : null,
        max: aggregateData._max?.hourlyRateMax ? Number(aggregateData._max.hourlyRateMax) : null,
      },
      popularSubjects: popularSubjects.map(item => ({
        subject: item.subjectName,
        count: item._count.subjectName,
      })),
    };
  }

  /**
   * Get available filter options for search UI
   */
  async getFilterOptions() {
    const [subjects, qualificationLevels] = await Promise.all([
      // Get all unique subjects from active verified tutors
      prisma.tutorSubject.findMany({
        where: {
          tutor: {
            isActive: true,
            verificationStatus: 'VERIFIED',
            user: {
              isEmailVerified: true,
            },
          },
        },
        select: {
          subjectName: true,
        },
        distinct: ['subjectName'],
        orderBy: {
          subjectName: 'asc',
        },
      }),
      
      // Get all unique qualification levels
      prisma.tutorSubject.findMany({
        where: {
          tutor: {
            isActive: true,
            verificationStatus: 'VERIFIED',
            user: {
              isEmailVerified: true,
            },
          },
        },
        select: {
          qualificationLevel: true,
        },
        distinct: ['qualificationLevel'],
        orderBy: {
          qualificationLevel: 'asc',
        },
      }),
    ]);

    return {
      subjects: subjects.map(s => s.subjectName),
      qualificationLevels: qualificationLevels.map(q => q.qualificationLevel),
    };
  }
} 