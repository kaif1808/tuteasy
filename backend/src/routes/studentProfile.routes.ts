import { Router } from 'express';
import { StudentProfileController } from '../controllers/studentProfile.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const studentProfileController = new StudentProfileController();

// All routes require authentication
router.use(authenticate);

// Student profile management routes
router.get('/profile', studentProfileController.getProfile);
router.post('/profile', studentProfileController.createProfile);
router.put('/profile', studentProfileController.updateProfile);
router.delete('/profile', studentProfileController.deleteProfile);

// Parent linking routes
router.post('/link-parent', studentProfileController.linkParent);
router.delete('/link-parent', studentProfileController.unlinkParent);

// Parent access routes
router.get('/children', studentProfileController.getChildrenProfiles);

// Access other student profiles (for parents/tutors with permission)
router.get('/profile/:studentId', studentProfileController.getStudentProfile);

export default router; 