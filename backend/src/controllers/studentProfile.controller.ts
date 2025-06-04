import { Request, Response } from 'express';
import { StudentProfileService } from '../services/studentProfile.service';
import { 
  updateStudentProfileSchema, 
  createStudentProfileSchema
} from '../types/validation';
import { z } from 'zod';

const studentProfileService = new StudentProfileService();

export class StudentProfileController {
  // GET /api/v1/student/profile
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await studentProfileService.getStudentProfile(userId);
      
      if (!profile) {
        res.status(404).json({ error: 'Student profile not found' });
        return;
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error fetching student profile:', error);
      res.status(500).json({ error: 'Failed to fetch student profile' });
    }
  }

  // PUT /api/v1/student/profile
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const validatedData = updateStudentProfileSchema.parse(req.body);
      
      const profile = await studentProfileService.updateStudentProfile(userId, validatedData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
      }
      console.error('Error updating student profile:', error);
      res.status(500).json({ error: 'Failed to update student profile' });
    }
  }

  // POST /api/v1/student/profile
  async createProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const validatedData = createStudentProfileSchema.parse(req.body);
      
      // Check if profile already exists
      const existingProfile = await studentProfileService.getStudentProfile(userId);
      if (existingProfile) {
        res.status(409).json({ error: 'Student profile already exists' });
        return;
      }
      
      const profile = await studentProfileService.createStudentProfile(userId, validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
      }
      console.error('Error creating student profile:', error);
      res.status(500).json({ error: 'Failed to create student profile' });
    }
  }

  // DELETE /api/v1/student/profile
  async deleteProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      await studentProfileService.deleteStudentProfile(userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting student profile:', error);
      res.status(500).json({ error: 'Failed to delete student profile' });
    }
  }

  // GET /api/v1/student/profile/:studentId (for parents/tutors with access)
  async getStudentProfile(req: Request, res: Response): Promise<void> {
    try {
      const requestingUserId = req.user!.id;
      const studentUserId = req.params.studentId;
      
      // Verify access
      const hasAccess = await studentProfileService.verifyAccess(studentUserId, requestingUserId);
      if (!hasAccess) {
        res.status(403).json({ error: 'Access denied to this student profile' });
        return;
      }
      
      const profile = await studentProfileService.getStudentProfile(studentUserId);
      if (!profile) {
        res.status(404).json({ error: 'Student profile not found' });
        return;
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error fetching student profile:', error);
      res.status(500).json({ error: 'Failed to fetch student profile' });
    }
  }

  // GET /api/v1/student/children (for parents to view their children's profiles)
  async getChildrenProfiles(req: Request, res: Response): Promise<void> {
    try {
      const parentId = req.user!.id;
      
      // Verify user has PARENT role
      if (req.user!.role !== 'PARENT') {
        res.status(403).json({ error: 'Only parents can access children profiles' });
        return;
      }
      
      const profiles = await studentProfileService.getStudentProfilesByParent(parentId);
      res.json(profiles);
    } catch (error) {
      console.error('Error fetching children profiles:', error);
      res.status(500).json({ error: 'Failed to fetch children profiles' });
    }
  }

  // POST /api/v1/student/link-parent
  async linkParent(req: Request, res: Response): Promise<void> {
    try {
      const studentUserId = req.user!.id;
      const { parentId } = req.body;
      
      if (!parentId) {
        res.status(400).json({ error: 'Parent ID is required' });
        return;
      }
      
      const profile = await studentProfileService.linkParent(studentUserId, parentId);
      res.json(profile);
    } catch (error) {
      console.error('Error linking parent:', error);
      if (error instanceof Error && error.message.includes('PARENT role')) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to link parent' });
    }
  }

  // DELETE /api/v1/student/link-parent
  async unlinkParent(req: Request, res: Response): Promise<void> {
    try {
      const studentUserId = req.user!.id;
      
      const profile = await studentProfileService.unlinkParent(studentUserId);
      res.json(profile);
    } catch (error) {
      console.error('Error unlinking parent:', error);
      res.status(500).json({ error: 'Failed to unlink parent' });
    }
  }
} 