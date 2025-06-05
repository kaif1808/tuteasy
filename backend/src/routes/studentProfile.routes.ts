import { Router } from 'express';
import { StudentProfileController } from '../controllers/studentProfile.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const studentProfileController = new StudentProfileController();

// All routes require authentication
router.use(authenticate);

// Student profile management routes (legacy endpoints)
router.get('/profile', studentProfileController.getProfile);
router.post('/profile', studentProfileController.createProfile);
router.put('/profile', studentProfileController.updateProfile);
router.delete('/profile', studentProfileController.deleteProfile);

// Enhanced UK/IB student profile routes
router.post('/profile/enhanced', studentProfileController.createEnhancedProfile);
router.put('/profile/enhanced', studentProfileController.updateEnhancedProfile);
router.post('/profile/validate-subjects', studentProfileController.validateSubjects);

// Parent access routes
router.get('/children', studentProfileController.getChildrenProfiles);

// Access other student profiles (for parents/tutors with permission)
router.get('/profile/:studentId', studentProfileController.getStudentProfile);

// Parent-child linking routes
router.post('/profile/:studentId/link-parent', studentProfileController.linkParent);
router.delete('/profile/:studentId/link-parent', studentProfileController.unlinkParent);

export default router; 