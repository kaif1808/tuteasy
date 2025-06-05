import { Router } from 'express';
import { ParentProfileController } from '../controllers/parentProfile.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const parentProfileController = new ParentProfileController();

// All routes require authentication and PARENT role
router.use(authenticate);
router.use(authorize('PARENT'));

// Parent profile routes
router.get('/', parentProfileController.getProfile);
router.post('/', parentProfileController.createProfile);
router.put('/', parentProfileController.updateProfile);
router.delete('/', parentProfileController.deleteProfile);

// Profile completeness endpoint
router.get('/completeness', parentProfileController.getProfileCompleteness);

export default router; 