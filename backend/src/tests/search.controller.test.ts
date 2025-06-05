import { Request, Response } from 'express';
import { SearchController } from '../controllers/search.controller';
import { SearchService } from '../services/search.service';

// Mock SearchService
jest.mock('../services/search.service');
const mockSearchService = {
  searchTutors: jest.fn(),
  getSearchStatistics: jest.fn(),
  getFilterOptions: jest.fn(),
} as unknown as jest.Mocked<SearchService>;

// Mock the constructor
(SearchService as jest.MockedClass<typeof SearchService>).mockImplementation(() => mockSearchService);

describe('SearchController', () => {
  let searchController: SearchController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    searchController = new SearchController();
    
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {
      query: {},
      params: {},
    };
    
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  describe('searchTutors', () => {
    const mockSearchResult = {
      tutors: [
        {
          id: 'tutor1',
          userId: 'user1',
          user: { id: 'user1', email: 'tutor@example.com', role: 'TUTOR' },
          bio: 'Experienced tutor',
          hourlyRateMin: 25,
          hourlyRateMax: 40,
          profileImageUrl: null,
          verificationStatus: 'VERIFIED',
          isActive: true,
          rating: 4.5,
          totalStudents: 20,
          languageProficiencies: ['English'],
          subjects: [],
          qualifications: [],
          experienceYears: 5,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      filters: {
        sortBy: 'relevance',
        sortOrder: 'desc',
      },
    };

    it('should search tutors successfully with valid parameters', async () => {
      mockRequest.query = {
        subjects: ['Mathematics'],
        page: '1',
        limit: '10',
        sortBy: 'relevance',
        sortOrder: 'desc',
      };

      mockSearchService.searchTutors.mockResolvedValue(mockSearchResult);

      await searchController.searchTutors(mockRequest as Request, mockResponse as Response);

      expect(mockSearchService.searchTutors).toHaveBeenCalledWith({
        subjects: ['Mathematics'],
        page: 1,
        limit: 10,
        sortBy: 'relevance',
        sortOrder: 'desc',
      });

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockSearchResult,
      });
    });

    it('should handle empty query parameters', async () => {
      mockRequest.query = {};
      mockSearchService.searchTutors.mockResolvedValue(mockSearchResult);

      await searchController.searchTutors(mockRequest as Request, mockResponse as Response);

      expect(mockSearchService.searchTutors).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sortBy: 'relevance',
        sortOrder: 'desc',
      });

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockSearchResult,
      });
    });

    it('should return 400 for invalid parameters', async () => {
      mockRequest.query = {
        page: 'invalid',
        limit: '100', // Above max limit
        sortBy: 'invalid_sort',
      };

      await searchController.searchTutors(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid search parameters',
        details: expect.any(Array),
      });
    });

    it('should handle service errors', async () => {
      mockRequest.query = { page: '1', limit: '10' };
      mockSearchService.searchTutors.mockRejectedValue(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await searchController.searchTutors(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to search tutors',
      });

      consoleSpy.mockRestore();
    });

    it('should validate array parameters correctly', async () => {
      mockRequest.query = {
        subjects: ['Mathematics', 'Physics'],
        levels: ['GCSE', 'A_LEVEL'],
        keywords: 'experienced teacher',
      };

      mockSearchService.searchTutors.mockResolvedValue(mockSearchResult);

      await searchController.searchTutors(mockRequest as Request, mockResponse as Response);

      expect(mockSearchService.searchTutors).toHaveBeenCalledWith({
        subjects: ['Mathematics', 'Physics'],
        levels: ['GCSE', 'A_LEVEL'],
        keywords: 'experienced teacher',
        page: 1,
        limit: 10,
        sortBy: 'relevance',
        sortOrder: 'desc',
      });
    });
  });

  describe('getSearchStatistics', () => {
    const mockStatistics = {
      totalResults: 50,
      averageExperience: 4.2,
      averageRating: 4.5,
      priceRange: { min: 20, max: 80 },
      popularSubjects: [
        { subject: 'Mathematics', count: 25 },
        { subject: 'Physics', count: 15 },
      ],
    };

    it('should get statistics successfully', async () => {
      mockRequest.query = { subjects: ['Mathematics'] };
      mockSearchService.getSearchStatistics.mockResolvedValue(mockStatistics);

      await searchController.getSearchStatistics(mockRequest as Request, mockResponse as Response);

      expect(mockSearchService.getSearchStatistics).toHaveBeenCalledWith({
        subjects: ['Mathematics'],
        page: 1,
        limit: 10,
        sortBy: 'relevance',
        sortOrder: 'desc',
      });

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockStatistics,
      });
    });

    it('should handle validation errors for statistics', async () => {
      mockRequest.query = { page: 'invalid' };

      await searchController.getSearchStatistics(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid search parameters',
        details: expect.any(Array),
      });
    });

    it('should handle service errors for statistics', async () => {
      mockRequest.query = {};
      mockSearchService.getSearchStatistics.mockRejectedValue(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await searchController.getSearchStatistics(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to get search statistics',
      });

      consoleSpy.mockRestore();
    });
  });

  describe('getFilterOptions', () => {
    const mockFilterOptions = {
      subjects: ['Mathematics', 'Physics', 'Chemistry'],
      qualificationLevels: ['GCSE', 'A_LEVEL', 'IB_DP_HL'] as any,
    };

    it('should get filter options successfully', async () => {
      mockSearchService.getFilterOptions.mockResolvedValue(mockFilterOptions);

      await searchController.getFilterOptions(mockRequest as Request, mockResponse as Response);

      expect(mockSearchService.getFilterOptions).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockFilterOptions,
      });
    });

    it('should handle service errors for filter options', async () => {
      mockSearchService.getFilterOptions.mockRejectedValue(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await searchController.getFilterOptions(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to get filter options',
      });

      consoleSpy.mockRestore();
    });
  });

  describe('getTutorDetails', () => {
    const mockTutor = {
      id: 'tutor1',
      userId: 'user1',
      user: { id: 'user1', email: 'tutor@example.com', role: 'TUTOR' },
      bio: 'Experienced tutor',
      hourlyRateMin: 25,
      hourlyRateMax: 40,
      profileImageUrl: null,
      verificationStatus: 'VERIFIED',
      isActive: true,
      rating: 4.5,
      totalStudents: 20,
      languageProficiencies: ['English'],
      subjects: [],
      qualifications: [],
      experienceYears: 5,
    };

    it('should get tutor details successfully', async () => {
      mockRequest.params = { id: 'tutor1' };
      mockSearchService.searchTutors.mockResolvedValue({
        tutors: [mockTutor],
        pagination: {
          page: 1,
          limit: 1,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        filters: { sortBy: 'relevance', sortOrder: 'desc' },
      });

      await searchController.getTutorDetails(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockTutor,
      });
    });

    it('should return 400 when tutor ID is missing', async () => {
      mockRequest.params = {};

      await searchController.getTutorDetails(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Tutor ID is required',
      });
    });

    it('should return 404 when tutor is not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockSearchService.searchTutors.mockResolvedValue({
        tutors: [],
        pagination: {
          page: 1,
          limit: 1,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        filters: { sortBy: 'relevance', sortOrder: 'desc' },
      });

      await searchController.getTutorDetails(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Tutor not found or not available',
      });
    });

    it('should handle service errors for tutor details', async () => {
      mockRequest.params = { id: 'tutor1' };
      mockSearchService.searchTutors.mockRejectedValue(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await searchController.getTutorDetails(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to get tutor details',
      });

      consoleSpy.mockRestore();
    });
  });
}); 