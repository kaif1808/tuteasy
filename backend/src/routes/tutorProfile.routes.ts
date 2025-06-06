import { Router } from 'express';
import { TutorProfileController } from '../controllers/tutorProfile.controller';
import { authenticate } from '../middleware/auth';
import { uploadImage, uploadDocument } from '../utils/upload';

const router = Router();
const tutorProfileController = new TutorProfileController();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', tutorProfileController.getProfile);
router.put('/profile', tutorProfileController.updateProfile);
router.post('/profile/image', uploadImage.single('image') as any, tutorProfileController.uploadProfileImage);
router.delete('/profile/image', tutorProfileController.deleteProfileImage);

// Subject routes
router.get('/subjects', tutorProfileController.getSubjects);
router.post('/subjects', tutorProfileController.createSubject);
router.put('/subjects/:id', tutorProfileController.updateSubject);
router.delete('/subjects/:id', tutorProfileController.deleteSubject);

// Qualification routes
router.get('/qualifications', tutorProfileController.getQualifications);
router.post('/qualifications', uploadDocument.single('document') as any, tutorProfileController.createQualification);
router.delete('/qualifications/:id', tutorProfileController.deleteQualification);

export default router; 