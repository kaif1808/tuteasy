import { Request, Response } from 'express';
import { StudentProfileService } from '../services/studentProfile.service';
import { 
  updateStudentProfileSchema, 
  createStudentProfileSchema,
  createEnhancedStudentProfileSchema,
  updateEnhancedStudentProfileSchema
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

  // PUT /api/v1/student/profile (legacy)
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

  // POST /api/v1/student/profile (legacy)
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

  // POST /api/v1/student/profile/enhanced (new UK/IB enhanced endpoint)
  async createEnhancedProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const validatedData = createEnhancedStudentProfileSchema.parse(req.body);
      
      // Check if profile already exists
      const existingProfile = await studentProfileService.getStudentProfile(userId);
      if (existingProfile) {
        res.status(409).json({ error: 'Student profile already exists' });
        return;
      }

      // Validate subject interests if provided
      if (validatedData.subjectInterests && validatedData.subjectInterests.length > 0) {
        const subjectValidation = await studentProfileService.validateSubjectInterests(
          validatedData.subjectInterests,
          validatedData.ukYearGroup,
          validatedData.ibProgramme
        );

        if (!subjectValidation.isValid) {
          res.status(400).json({ 
            error: 'Subject validation failed', 
            details: subjectValidation.errors 
          });
          return;
        }
      }
      
      const profile = await studentProfileService.createEnhancedStudentProfile(userId, validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
      }
      console.error('Error creating enhanced student profile:', error);
      res.status(500).json({ error: 'Failed to create enhanced student profile' });
    }
  }

  // PUT /api/v1/student/profile/enhanced (new UK/IB enhanced endpoint)
  async updateEnhancedProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const validatedData = updateEnhancedStudentProfileSchema.parse(req.body);

      // Validate subject interests if provided
      if (validatedData.subjectInterests && validatedData.subjectInterests.length > 0) {
        const subjectValidation = await studentProfileService.validateSubjectInterests(
          validatedData.subjectInterests,
          validatedData.ukYearGroup,
          validatedData.ibProgramme
        );

        if (!subjectValidation.isValid) {
          res.status(400).json({ 
            error: 'Subject validation failed', 
            details: subjectValidation.errors 
          });
          return;
        }
      }
      
      const profile = await studentProfileService.updateEnhancedStudentProfile(userId, validatedData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === 'Student profile not found') {
        res.status(404).json({ error: 'Student profile not found' });
        return;
      }
      console.error('Error updating enhanced student profile:', error);
      res.status(500).json({ error: 'Failed to update enhanced student profile' });
    }
  }

  // POST /api/v1/student/profile/validate-subjects
  async validateSubjects(req: Request, res: Response): Promise<void> {
    try {
      const { subjectInterests, ukYearGroup, ibProgramme } = req.body;

      if (!subjectInterests || !Array.isArray(subjectInterests)) {
        res.status(400).json({ error: 'Subject interests array is required' });
        return;
      }

      const validation = await studentProfileService.validateSubjectInterests(
        subjectInterests,
        ukYearGroup,
        ibProgramme
      );

      res.json(validation);
    } catch (error) {
      console.error('Error validating subjects:', error);
      res.status(500).json({ error: 'Failed to validate subjects' });
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
      const user = await req.user;
      if (!user || user.role !== 'PARENT') {
        res.status(403).json({ error: 'Access denied. Parent role required.' });
        return;
      }
      
      const childrenProfiles = await studentProfileService.getStudentProfilesByParent(parentId);
      res.json(childrenProfiles);
    } catch (error) {
      console.error('Error fetching children profiles:', error);
      res.status(500).json({ error: 'Failed to fetch children profiles' });
    }
  }

  // POST /api/v1/student/profile/:studentId/link-parent
  async linkParent(req: Request, res: Response): Promise<void> {
    try {
      const studentUserId = req.params.studentId;
      const { parentId } = req.body;

      if (!parentId) {
        res.status(400).json({ error: 'Parent ID is required' });
        return;
      }

      // Verify requesting user has appropriate permissions
      const requestingUserId = req.user!.id;
      const hasAccess = await studentProfileService.verifyAccess(studentUserId, requestingUserId);
      
      if (!hasAccess && requestingUserId !== parentId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const profile = await studentProfileService.linkParent(studentUserId, parentId);
      res.json(profile);
    } catch (error) {
      if (error instanceof Error && error.message.includes('PARENT role')) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error('Error linking parent:', error);
      res.status(500).json({ error: 'Failed to link parent' });
    }
  }

  // DELETE /api/v1/student/profile/:studentId/link-parent
  async unlinkParent(req: Request, res: Response): Promise<void> {
    try {
      const studentUserId = req.params.studentId;
      const requestingUserId = req.user!.id;

      // Verify requesting user has appropriate permissions
      const hasAccess = await studentProfileService.verifyAccess(studentUserId, requestingUserId);
      if (!hasAccess) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const profile = await studentProfileService.unlinkParent(studentUserId);
      res.json(profile);
    } catch (error) {
      console.error('Error unlinking parent:', error);
      res.status(500).json({ error: 'Failed to unlink parent' });
    }
  }
} 