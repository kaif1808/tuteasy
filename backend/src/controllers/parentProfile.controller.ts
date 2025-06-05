import { Request, Response } from 'express';
import { ParentProfileService } from '../services/parentProfile.service';
import { 
  createParentProfileSchema, 
  updateParentProfileSchema 
} from '../validation/parentProfile.validation';
import { z } from 'zod';

const parentProfileService = new ParentProfileService();

export class ParentProfileController {
  // GET /api/profiles/parent
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await parentProfileService.getParentProfile(userId);
      
      if (!profile) {
        res.status(404).json({ error: 'Parent profile not found' });
        return;
      }
      
      // Parse emergency contact JSON string back to object for response
      const profileResponse = {
        ...profile,
        emergencyContact: profile.emergencyContact 
          ? JSON.parse(profile.emergencyContact) 
          : null,
      };
      
      res.json(profileResponse);
    } catch (error) {
      console.error('Error fetching parent profile:', error);
      res.status(500).json({ error: 'Failed to fetch parent profile' });
    }
  }

  // POST /api/profiles/parent
  async createProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      // Check if profile already exists
      const existingProfile = await parentProfileService.getParentProfile(userId);
      if (existingProfile) {
        res.status(409).json({ error: 'Parent profile already exists. Use PUT to update.' });
        return;
      }

      const validatedData = createParentProfileSchema.parse(req.body);
      
      const profile = await parentProfileService.createParentProfile(userId, validatedData);
      
      // Parse emergency contact JSON string back to object for response
      const profileResponse = {
        ...profile,
        emergencyContact: profile.emergencyContact 
          ? JSON.parse(profile.emergencyContact) 
          : null,
      };
      
      res.status(201).json(profileResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
      }
      console.error('Error creating parent profile:', error);
      res.status(500).json({ error: 'Failed to create parent profile' });
    }
  }

  // PUT /api/profiles/parent
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const validatedData = updateParentProfileSchema.parse(req.body);
      
      const profile = await parentProfileService.updateParentProfile(userId, validatedData);
      
      // Parse emergency contact JSON string back to object for response
      const profileResponse = {
        ...profile,
        emergencyContact: profile.emergencyContact 
          ? JSON.parse(profile.emergencyContact) 
          : null,
      };
      
      res.json(profileResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === 'Parent profile not found') {
        res.status(404).json({ error: 'Parent profile not found' });
        return;
      }
      console.error('Error updating parent profile:', error);
      res.status(500).json({ error: 'Failed to update parent profile' });
    }
  }

  // DELETE /api/profiles/parent
  async deleteProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      // Check if profile exists
      const profileExists = await parentProfileService.parentProfileExists(userId);
      if (!profileExists) {
        res.status(404).json({ error: 'Parent profile not found' });
        return;
      }
      
      await parentProfileService.deleteParentProfile(userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting parent profile:', error);
      res.status(500).json({ error: 'Failed to delete parent profile' });
    }
  }

  // GET /api/profiles/parent/completeness
  async getProfileCompleteness(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const completeness = await parentProfileService.getProfileCompleteness(userId);
      
      res.json({ completeness });
    } catch (error) {
      console.error('Error fetching profile completeness:', error);
      res.status(500).json({ error: 'Failed to fetch profile completeness' });
    }
  }
} 