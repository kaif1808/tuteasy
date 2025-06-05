import { api, getErrorMessage } from './api';
import type {
  TutorSearchParams,
  TutorSearchResponse,
  SearchFiltersResponse,
  SearchStatisticsResponse,
  TutorSearchResult,
} from '../types/search';

export class SearchService {
  /**
   * Search for tutors with the given parameters
   */
  static async searchTutors(params: TutorSearchParams): Promise<TutorSearchResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add array parameters (subjects and levels)
      if (params.subjects && params.subjects.length > 0) {
        params.subjects.forEach(subject => {
          queryParams.append('subjects[]', subject);
        });
      }
      
      if (params.levels && params.levels.length > 0) {
        params.levels.forEach(level => {
          queryParams.append('levels[]', level);
        });
      }
      
      if (params.availability && params.availability.length > 0) {
        params.availability.forEach(avail => {
          queryParams.append('availability[]', avail);
        });
      }

      if (params.minRate !== undefined) {
        queryParams.append('minRate', params.minRate.toString());
      }

      if (params.maxRate !== undefined) {
        queryParams.append('maxRate', params.maxRate.toString());
      }
      
      // Add other parameters
      if (params.keywords) {
        queryParams.append('keywords', params.keywords);
      }
      
      if (params.sortBy) {
        queryParams.append('sortBy', params.sortBy);
      }
      
      if (params.sortOrder) {
        queryParams.append('sortOrder', params.sortOrder);
      }
      
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      
      const response = await api.get(`/search/tutors?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get available filter options (subjects and qualification levels)
   */
  static async getFilterOptions(): Promise<SearchFiltersResponse> {
    try {
      const response = await api.get('/search/filters');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get search statistics for the given parameters
   */
  static async getSearchStatistics(params: TutorSearchParams): Promise<SearchStatisticsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add the same parameters as search to get statistics for filtered results
      if (params.subjects && params.subjects.length > 0) {
        params.subjects.forEach(subject => {
          queryParams.append('subjects[]', subject);
        });
      }
      
      if (params.levels && params.levels.length > 0) {
        params.levels.forEach(level => {
          queryParams.append('levels[]', level);
        });
      }
      
      if (params.keywords) {
        queryParams.append('keywords', params.keywords);
      }
      
      const response = await api.get(`/search/tutors/statistics?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get details for a specific tutor
   */
  static async getTutorDetails(tutorId: string): Promise<{ success: boolean; data: TutorSearchResult }> {
    try {
      const response = await api.get(`/search/tutors/${tutorId}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
} 