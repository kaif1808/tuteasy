import request from 'supertest';
import express from 'express';
import { StudentProfileController } from '../src/controllers/studentProfile.controller';
import { StudentProfileService } from '../src/services/studentProfile.service';
import { UKYearGroup, IBProgramme, QualificationLevel } from '../src/types/validation';

// Mock the service
jest.mock('../src/services/studentProfile.service');

describe('StudentProfileController', () => {
  let app: express.Application;
  let controller: StudentProfileController;
  let mockService: jest.Mocked<StudentProfileService>;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    controller = new StudentProfileController();
    mockService = new StudentProfileService() as jest.Mocked<StudentProfileService>;

    // Mock authentication middleware
    app.use((req, res, next) => {
      (req as any).user = { id: 'user-1', email: 'test@example.com', role: 'STUDENT' };
      next();
    });

    // Setup routes
    app.get('/profile', controller.getProfile.bind(controller));
    app.post('/profile', controller.createProfile.bind(controller));
    app.put('/profile', controller.updateProfile.bind(controller));
    app.delete('/profile', controller.deleteProfile.bind(controller));
    app.post('/profile/enhanced', controller.createEnhancedProfile.bind(controller));
    app.put('/profile/enhanced', controller.updateEnhancedProfile.bind(controller));
    app.post('/profile/validate-subjects', controller.validateSubjects.bind(controller));
    app.get('/profile/:studentId', controller.getStudentProfile.bind(controller));
    app.get('/children', controller.getChildrenProfiles.bind(controller));
    app.post('/profile/:studentId/link-parent', controller.linkParent.bind(controller));
    app.delete('/profile/:studentId/link-parent', controller.unlinkParent.bind(controller));
  });

  describe('GET /profile', () => {
    it('should return student profile successfully', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        ukYearGroup: 'YEAR_10',
        ukKeyStage: 'KS4',
        schoolName: 'Test School',
        profileCompleteness: 80,
        user: { id: 'user-1', email: 'test@example.com', role: 'STUDENT' }
      };

      mockService.getStudentProfile = jest.fn().mockResolvedValue(mockProfile);

      const response = await request(app)
        .get('/profile')
        .expect(200);

      expect(response.body).toEqual(mockProfile);
      expect(mockService.getStudentProfile).toHaveBeenCalledWith('user-1');
    });

    it('should return 404 when profile not found', async () => {
      mockService.getStudentProfile = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/profile')
        .expect(404);

      expect(response.body.error).toBe('Student profile not found');
    });

    it('should handle service errors', async () => {
      mockService.getStudentProfile = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/profile')
        .expect(500);

      expect(response.body.error).toBe('Failed to fetch student profile');
    });
  });

  describe('POST /profile/enhanced', () => {
    it('should create UK student profile successfully', async () => {
      const profileData = {
        ukYearGroup: UKYearGroup.YEAR_10,
        schoolName: 'Test Grammar School',
        subjectInterests: [{
          subjectName: 'Mathematics',
          qualificationLevel: QualificationLevel.GCSE,
          isCore: true,
          targetGrade: 'A*'
        }],
        learningGoals: 'Achieve A* in GCSE Mathematics',
        timezone: 'Europe/London'
      };

      const mockCreatedProfile = {
        id: 'profile-1',
        userId: 'user-1',
        ...profileData,
        profileCompleteness: 85,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockService.getStudentProfile = jest.fn().mockResolvedValue(null);
      mockService.validateSubjectInterests = jest.fn().mockResolvedValue({ isValid: true, errors: [] });
      mockService.createEnhancedStudentProfile = jest.fn().mockResolvedValue(mockCreatedProfile);

      const response = await request(app)
        .post('/profile/enhanced')
        .send(profileData)
        .expect(201);

      expect(response.body).toEqual(mockCreatedProfile);
      expect(mockService.validateSubjectInterests).toHaveBeenCalledWith(
        profileData.subjectInterests,
        profileData.ukYearGroup,
        undefined
      );
      expect(mockService.createEnhancedStudentProfile).toHaveBeenCalledWith('user-1', profileData);
    });

    it('should create IB student profile successfully', async () => {
      const profileData = {
        ibProgramme: IBProgramme.DP,
        ibYear: 1,
        schoolName: 'International School',
        subjectInterests: [{
          subjectName: 'Mathematics',
          qualificationLevel: QualificationLevel.IB_DP_HL,
          isCore: true
        }],
        timezone: 'Europe/London'
      };

      const mockCreatedProfile = {
        id: 'profile-2',
        userId: 'user-1',
        ...profileData,
        profileCompleteness: 75,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockService.getStudentProfile = jest.fn().mockResolvedValue(null);
      mockService.validateSubjectInterests = jest.fn().mockResolvedValue({ isValid: true, errors: [] });
      mockService.createEnhancedStudentProfile = jest.fn().mockResolvedValue(mockCreatedProfile);

      const response = await request(app)
        .post('/profile/enhanced')
        .send(profileData)
        .expect(201);

      expect(response.body).toEqual(mockCreatedProfile);
      expect(mockService.validateSubjectInterests).toHaveBeenCalledWith(
        profileData.subjectInterests,
        undefined,
        profileData.ibProgramme
      );
    });

    it('should return 409 when profile already exists', async () => {
      const existingProfile = { id: 'profile-1', userId: 'user-1' };
      mockService.getStudentProfile = jest.fn().mockResolvedValue(existingProfile as any);

      const response = await request(app)
        .post('/profile/enhanced')
        .send({ ukYearGroup: UKYearGroup.YEAR_10 })
        .expect(409);

      expect(response.body.error).toBe('Student profile already exists');
    });

    it('should return 400 for validation errors', async () => {
      const profileData = {
        ukYearGroup: UKYearGroup.YEAR_9,
        subjectInterests: [{
          subjectName: 'Mathematics',
          qualificationLevel: QualificationLevel.A_LEVEL, // Invalid for Year 9
          isCore: true
        }]
      };

      mockService.getStudentProfile = jest.fn().mockResolvedValue(null);
      mockService.validateSubjectInterests = jest.fn().mockResolvedValue({
        isValid: false,
        errors: ['A-Level subjects are only available for Year 12 and Year 13 students']
      });

      const response = await request(app)
        .post('/profile/enhanced')
        .send(profileData)
        .expect(400);

      expect(response.body.error).toBe('Subject validation failed');
      expect(response.body.details).toContain('A-Level subjects are only available for Year 12 and Year 13 students');
    });

    it('should return 400 for schema validation errors', async () => {
      const invalidData = {
        ukYearGroup: 'INVALID_YEAR', // Invalid enum value
        ibProgramme: IBProgramme.DP // Both UK and IB selected
      };

      const response = await request(app)
        .post('/profile/enhanced')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation error');
      expect(response.body.details).toBeDefined();
    });
  });

  describe('PUT /profile/enhanced', () => {
    it('should update profile successfully', async () => {
      const updateData = {
        schoolName: 'New School',
        learningGoals: 'Updated learning goals'
      };

      const mockUpdatedProfile = {
        id: 'profile-1',
        userId: 'user-1',
        ukYearGroup: 'YEAR_10',
        schoolName: 'New School',
        learningGoals: 'Updated learning goals',
        profileCompleteness: 85,
        updatedAt: new Date()
      };

      mockService.validateSubjectInterests = jest.fn().mockResolvedValue({ isValid: true, errors: [] });
      mockService.updateEnhancedStudentProfile = jest.fn().mockResolvedValue(mockUpdatedProfile);

      const response = await request(app)
        .put('/profile/enhanced')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockUpdatedProfile);
      expect(mockService.updateEnhancedStudentProfile).toHaveBeenCalledWith('user-1', updateData);
    });

    it('should return 404 when profile not found for update', async () => {
      const updateData = { schoolName: 'New School' };

      mockService.updateEnhancedStudentProfile = jest.fn().mockRejectedValue(new Error('Student profile not found'));

      const response = await request(app)
        .put('/profile/enhanced')
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('Student profile not found');
    });

    it('should validate subjects on update', async () => {
      const updateData = {
        subjectInterests: [{
          subjectName: 'Physics',
          qualificationLevel: QualificationLevel.A_LEVEL,
          isCore: false
        }],
        ukYearGroup: UKYearGroup.YEAR_9 // Invalid combination
      };

      mockService.validateSubjectInterests = jest.fn().mockResolvedValue({
        isValid: false,
        errors: ['A-Level subjects are only available for Year 12 and Year 13 students']
      });

      const response = await request(app)
        .put('/profile/enhanced')
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Subject validation failed');
    });
  });

  describe('POST /profile/validate-subjects', () => {
    it('should validate subjects successfully', async () => {
      const validationData = {
        subjectInterests: [{
          subjectName: 'Mathematics',
          qualificationLevel: QualificationLevel.GCSE,
          isCore: true
        }],
        ukYearGroup: UKYearGroup.YEAR_10
      };

      const mockValidation = { isValid: true, errors: [] };
      mockService.validateSubjectInterests = jest.fn().mockResolvedValue(mockValidation);

      const response = await request(app)
        .post('/profile/validate-subjects')
        .send(validationData)
        .expect(200);

      expect(response.body).toEqual(mockValidation);
      expect(mockService.validateSubjectInterests).toHaveBeenCalledWith(
        validationData.subjectInterests,
        validationData.ukYearGroup,
        undefined
      );
    });

    it('should return validation errors', async () => {
      const validationData = {
        subjectInterests: [{
          subjectName: 'Mathematics',
          qualificationLevel: QualificationLevel.A_LEVEL,
          isCore: true
        }],
        ukYearGroup: UKYearGroup.YEAR_9
      };

      const mockValidation = {
        isValid: false,
        errors: ['A-Level subjects are only available for Year 12 and Year 13 students']
      };
      mockService.validateSubjectInterests = jest.fn().mockResolvedValue(mockValidation);

      const response = await request(app)
        .post('/profile/validate-subjects')
        .send(validationData)
        .expect(200);

      expect(response.body).toEqual(mockValidation);
    });

    it('should return 400 for missing subject interests', async () => {
      const response = await request(app)
        .post('/profile/validate-subjects')
        .send({ ukYearGroup: UKYearGroup.YEAR_10 })
        .expect(400);

      expect(response.body.error).toBe('Subject interests array is required');
    });
  });

  describe('Parent Access Controls', () => {
    it('should allow parent to access children profiles', async () => {
      // Override auth middleware for parent user
      app.use((req, res, next) => {
        (req as any).user = { id: 'parent-1', email: 'parent@example.com', role: 'PARENT' };
        next();
      });

      const mockChildren = [
        { id: 'profile-1', userId: 'child-1', parentId: 'parent-1' },
        { id: 'profile-2', userId: 'child-2', parentId: 'parent-1' }
      ];

      mockService.getStudentProfilesByParent = jest.fn().mockResolvedValue(mockChildren);

      const response = await request(app)
        .get('/children')
        .expect(200);

      expect(response.body).toEqual(mockChildren);
      expect(mockService.getStudentProfilesByParent).toHaveBeenCalledWith('parent-1');
    });

    it('should deny non-parent access to children profiles', async () => {
      const response = await request(app)
        .get('/children')
        .expect(403);

      expect(response.body.error).toBe('Access denied. Parent role required.');
    });

    it('should allow access to specific student profile with permission', async () => {
      const mockProfile = { id: 'profile-1', userId: 'child-1' };
      mockService.verifyAccess = jest.fn().mockResolvedValue(true);
      mockService.getStudentProfile = jest.fn().mockResolvedValue(mockProfile);

      const response = await request(app)
        .get('/profile/child-1')
        .expect(200);

      expect(response.body).toEqual(mockProfile);
      expect(mockService.verifyAccess).toHaveBeenCalledWith('child-1', 'user-1');
    });

    it('should deny access to student profile without permission', async () => {
      mockService.verifyAccess = jest.fn().mockResolvedValue(false);

      const response = await request(app)
        .get('/profile/other-student')
        .expect(403);

      expect(response.body.error).toBe('Access denied to this student profile');
    });
  });

  describe('Parent Linking', () => {
    it('should link parent successfully', async () => {
      const mockLinkedProfile = {
        id: 'profile-1',
        userId: 'child-1',
        parentId: 'parent-1'
      };

      mockService.verifyAccess = jest.fn().mockResolvedValue(true);
      mockService.linkParent = jest.fn().mockResolvedValue(mockLinkedProfile);

      const response = await request(app)
        .post('/profile/child-1/link-parent')
        .send({ parentId: 'parent-1' })
        .expect(200);

      expect(response.body).toEqual(mockLinkedProfile);
      expect(mockService.linkParent).toHaveBeenCalledWith('child-1', 'parent-1');
    });

    it('should return 400 when parentId is missing', async () => {
      const response = await request(app)
        .post('/profile/child-1/link-parent')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Parent ID is required');
    });

    it('should return 403 for unauthorized linking', async () => {
      mockService.verifyAccess = jest.fn().mockResolvedValue(false);

      const response = await request(app)
        .post('/profile/child-1/link-parent')
        .send({ parentId: 'other-parent' })
        .expect(403);

      expect(response.body.error).toBe('Access denied');
    });

    it('should unlink parent successfully', async () => {
      const mockUnlinkedProfile = {
        id: 'profile-1',
        userId: 'child-1',
        parentId: null
      };

      mockService.verifyAccess = jest.fn().mockResolvedValue(true);
      mockService.unlinkParent = jest.fn().mockResolvedValue(mockUnlinkedProfile);

      const response = await request(app)
        .delete('/profile/child-1/link-parent')
        .expect(200);

      expect(response.body).toEqual(mockUnlinkedProfile);
      expect(mockService.unlinkParent).toHaveBeenCalledWith('child-1');
    });
  });

  describe('Legacy Endpoints', () => {
    it('should create legacy profile successfully', async () => {
      const legacyData = {
        gradeLevel: '10th Grade',
        schoolName: 'Test School',
        subjectsOfInterest: ['Mathematics', 'Science'],
        timezone: 'UTC'
      };

      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        ...legacyData,
        profileCompleteness: 60
      };

      mockService.getStudentProfile = jest.fn().mockResolvedValue(null);
      mockService.createStudentProfile = jest.fn().mockResolvedValue(mockProfile);

      const response = await request(app)
        .post('/profile')
        .send(legacyData)
        .expect(201);

      expect(response.body).toEqual(mockProfile);
      expect(mockService.createStudentProfile).toHaveBeenCalledWith('user-1', legacyData);
    });

    it('should update legacy profile successfully', async () => {
      const updateData = {
        schoolName: 'Updated School',
        learningGoals: 'New goals'
      };

      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        ...updateData,
        profileCompleteness: 70
      };

      mockService.updateStudentProfile = jest.fn().mockResolvedValue(mockProfile);

      const response = await request(app)
        .put('/profile')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockProfile);
      expect(mockService.updateStudentProfile).toHaveBeenCalledWith('user-1', updateData);
    });

    it('should delete profile successfully', async () => {
      mockService.deleteStudentProfile = jest.fn().mockResolvedValue(undefined);

      await request(app)
        .delete('/profile')
        .expect(204);

      expect(mockService.deleteStudentProfile).toHaveBeenCalledWith('user-1');
    });
  });
}); 