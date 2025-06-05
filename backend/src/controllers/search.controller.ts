import { Request, Response } from 'express';
import { SearchService } from '../services/search.service';
import { tutorSearchSchema } from '../types/search.types';
import { z } from 'zod';

const searchService = new SearchService();

export class SearchController {
  /**
   * GET /api/search/tutors
   * Search for tutors with filtering, sorting, and pagination
   */
  async searchTutors(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const validatedParams = tutorSearchSchema.parse(req.query);
      
      // Execute search
      const results = await searchService.searchTutors(validatedParams);
      
      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid search parameters',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      
      console.error('Error searching tutors:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search tutors',
      });
    }
  }

  /**
   * GET /api/search/tutors/statistics
   * Get search result statistics for analytics
   */
  async getSearchStatistics(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters (same as search)
      const validatedParams = tutorSearchSchema.parse(req.query);
      
      // Get statistics
      const statistics = await searchService.getSearchStatistics(validatedParams);
      
      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid search parameters',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      
      console.error('Error getting search statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get search statistics',
      });
    }
  }

  /**
   * GET /api/search/filters
   * Get available filter options for search UI
   */
  async getFilterOptions(_req: Request, res: Response): Promise<void> {
    try {
      const filterOptions = await searchService.getFilterOptions();
      
      res.json({
        success: true,
        data: filterOptions,
      });
    } catch (error) {
      console.error('Error getting filter options:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get filter options',
      });
    }
  }

  /**
   * GET /api/search/tutors/:id
   * Get detailed tutor profile for search results
   */
  async getTutorDetails(req: Request, res: Response): Promise<void> {
    try {
      const tutorId = req.params.id;
      
      if (!tutorId) {
        res.status(400).json({
          success: false,
          error: 'Tutor ID is required',
        });
        return;
      }

      // For now, we'll implement a basic version that searches for a single tutor
      // This can be expanded to include additional details not in search results
      const searchResults = await searchService.searchTutors({
        page: 1,
        limit: 1,
        sortBy: 'relevance',
        sortOrder: 'desc',
      });

      // Find the specific tutor in results (this is a simplified implementation)
      // In a real implementation, you might want a separate service method
      const tutor = searchResults.tutors.find(t => t.id === tutorId);
      
      if (!tutor) {
        res.status(404).json({
          success: false,
          error: 'Tutor not found or not available',
        });
        return;
      }

      res.json({
        success: true,
        data: tutor,
      });
    } catch (error) {
      console.error('Error getting tutor details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get tutor details',
      });
    }
  }
} 