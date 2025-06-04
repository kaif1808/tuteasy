import { Request, Response } from 'express';
import { TutorProfileService } from '../services/tutorProfile.service';
import { storageService } from '../services/storage.service';
import { processProfileImage } from '../utils/upload';
import { 
  updateTutorProfileSchema, 
  createSubjectSchema, 
  updateSubjectSchema,
  createQualificationSchema 
} from '../types/validation';
import { z } from 'zod';

const tutorProfileService = new TutorProfileService();

export class TutorProfileController {
  // GET /api/tutors/profile
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await tutorProfileService.getTutorProfile(userId);
      
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  // PUT /api/tutors/profile
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const validatedData = updateTutorProfileSchema.parse(req.body);
      
      const profile = await tutorProfileService.updateTutorProfile(userId, validatedData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
      }
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  // POST /api/tutors/profile/image
  async uploadProfileImage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      if (!req.file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }

      // Process image (resize, optimize)
      const processedBuffer = await processProfileImage(req.file.buffer);
      
      // Upload to storage
      const { url, key } = await storageService.uploadImage(
        processedBuffer,
        `profile-${userId}-${Date.now()}.jpg`
      );
      
      // Update profile with image URL
      const profile = await tutorProfileService.updateProfileImage(userId, url, key);
      res.json(profile);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }

  // DELETE /api/tutors/profile/image
  async deleteProfileImage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      // Get current profile to find image key
      const profile = await tutorProfileService.getTutorProfile(userId);
      if (profile?.profileImageKey) {
        await storageService.deleteFile(profile.profileImageKey);
      }
      
      // Remove image from profile
      const updatedProfile = await tutorProfileService.deleteProfileImage(userId);
      res.json(updatedProfile);
    } catch (error) {
      console.error('Error deleting profile image:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  }

  // GET /api/tutors/subjects
  async getSubjects(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await tutorProfileService.getTutorProfile(userId);
      
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }
      
      const subjects = await tutorProfileService.getSubjects(profile.id);
      res.json(subjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      res.status(500).json({ error: 'Failed to fetch subjects' });
    }
  }

  // POST /api/tutors/subjects
  async createSubject(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const validatedData = createSubjectSchema.parse(req.body);
      
      const profile = await tutorProfileService.getTutorProfile(userId);
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }
      
      const subject = await tutorProfileService.createSubject(profile.id, validatedData);
      res.status(201).json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
      }
      console.error('Error creating subject:', error);
      res.status(500).json({ error: 'Failed to create subject' });
    }
  }

  // PUT /api/tutors/subjects/:id
  async updateSubject(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const subjectId = req.params.id;
      const validatedData = updateSubjectSchema.parse(req.body);
      
      const profile = await tutorProfileService.getTutorProfile(userId);
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }
      
      const subject = await tutorProfileService.updateSubject(
        subjectId, 
        profile.id, 
        validatedData
      );
      res.json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
      }
      console.error('Error updating subject:', error);
      res.status(500).json({ error: 'Failed to update subject' });
    }
  }

  // DELETE /api/tutors/subjects/:id
  async deleteSubject(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const subjectId = req.params.id;
      
      const profile = await tutorProfileService.getTutorProfile(userId);
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }
      
      await tutorProfileService.deleteSubject(subjectId, profile.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting subject:', error);
      res.status(500).json({ error: 'Failed to delete subject' });
    }
  }

  // POST /api/tutors/qualifications
  async createQualification(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const validatedData = createQualificationSchema.parse(req.body);
      
      const profile = await tutorProfileService.getTutorProfile(userId);
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }
      
      let documentUrl: string | undefined;
      let documentKey: string | undefined;
      
      // Handle document upload if provided
      if (req.file) {
        const { url, key } = await storageService.uploadDocument(
          req.file.buffer,
          `qualification-${profile.id}-${Date.now()}.pdf`
        );
        documentUrl = url;
        documentKey = key;
      }
      
      const qualification = await tutorProfileService.createQualification(
        profile.id,
        validatedData,
        documentUrl,
        documentKey
      );
      
      res.status(201).json(qualification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
      }
      console.error('Error creating qualification:', error);
      res.status(500).json({ error: 'Failed to create qualification' });
    }
  }

  // GET /api/tutors/qualifications
  async getQualifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await tutorProfileService.getTutorProfile(userId);
      
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }
      
      const qualifications = await tutorProfileService.getQualifications(profile.id);
      res.json(qualifications);
    } catch (error) {
      console.error('Error fetching qualifications:', error);
      res.status(500).json({ error: 'Failed to fetch qualifications' });
    }
  }

  // DELETE /api/tutors/qualifications/:id
  async deleteQualification(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const qualificationId = req.params.id;
      
      const profile = await tutorProfileService.getTutorProfile(userId);
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }
      
      // TODO: Delete associated document from storage
      
      await tutorProfileService.deleteQualification(qualificationId, profile.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting qualification:', error);
      res.status(500).json({ error: 'Failed to delete qualification' });
    }
  }
} 