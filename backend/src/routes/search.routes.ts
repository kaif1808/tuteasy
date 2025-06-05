import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const searchController = new SearchController();

// All search routes require authentication
router.use(authenticate);

// Tutor search routes
router.get('/tutors', searchController.searchTutors);
router.get('/tutors/statistics', searchController.getSearchStatistics);
router.get('/tutors/:id', searchController.getTutorDetails);

// Filter options for search UI
router.get('/filters', searchController.getFilterOptions);

export default router; 