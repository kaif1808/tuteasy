import { Request, Response } from 'express';
import { ParentProfileController } from '../controllers/parentProfile.controller';
import { ParentProfileService } from '../services/parentProfile.service';

// Mock the ParentProfileService
jest.mock('../services/parentProfile.service');

describe('ParentProfileController', () => {
  let parentProfileController: ParentProfileController;
  let mockParentProfileService: jest.Mocked<ParentProfileService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Create a mock service with all methods
    mockParentProfileService = {
      getParentProfile: jest.fn(),
      createParentProfile: jest.fn(),
      updateParentProfile: jest.fn(),
      deleteParentProfile: jest.fn(),
      parentProfileExists: jest.fn(),
      getProfileCompleteness: jest.fn(),
    } as jest.Mocked<ParentProfileService>;

    // Mock the service constructor to return our mock
    (ParentProfileService as jest.Mock).mockImplementation(() => mockParentProfileService);
    
    parentProfileController = new ParentProfileController();
    
    mockRequest = {
      user: { id: 'user-1', email: 'user@example.com', role: 'PARENT' },
      body: {},
    };
    
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    const mockProfile = {
      id: 'parent-1',
      userId: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+44 7123 456789',
      occupation: 'Software Engineer',
      emergencyContact: JSON.stringify({
        name: 'Jane Doe',
        relationship: 'Spouse',
        phoneNumber: '+44 7987 654321',
      }),
      communicationPreference: ['EMAIL'],
      timezone: 'Europe/London',
      profileCompleteness: 86,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return parent profile successfully', async () => {
      mockParentProfileService.getParentProfile.mockResolvedValue(mockProfile);

      await parentProfileController.getProfile(mockRequest as Request, mockResponse as Response);

      expect(mockParentProfileService.getParentProfile).toHaveBeenCalledWith('user-1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        ...mockProfile,
        emergencyContact: JSON.parse(mockProfile.emergencyContact),
      });
    });

    it('should return 404 when profile not found', async () => {
      mockParentProfileService.getParentProfile.mockResolvedValue(null);

      await parentProfileController.getProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Parent profile not found' });
    });

    it('should handle service errors', async () => {
      mockParentProfileService.getParentProfile.mockRejectedValue(new Error('Database error'));

      await parentProfileController.getProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to fetch parent profile' });
    });

    it('should handle profile with null emergency contact', async () => {
      const profileWithNullEmergencyContact = {
        ...mockProfile,
        emergencyContact: null,
      };

      mockParentProfileService.getParentProfile.mockResolvedValue(profileWithNullEmergencyContact);

      await parentProfileController.getProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        ...profileWithNullEmergencyContact,
        emergencyContact: null,
      });
    });
  });

  describe('createProfile', () => {
    const validCreateData = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+44 7123 456789',
      occupation: 'Software Engineer',
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phoneNumber: '+44 7987 654321',
      },
      communicationPreference: ['EMAIL'],
      timezone: 'Europe/London',
    };

    const mockCreatedProfile = {
      id: 'parent-1',
      userId: 'user-1',
      ...validCreateData,
      emergencyContact: JSON.stringify(validCreateData.emergencyContact),
      profileCompleteness: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockRequest.body = validCreateData;
    });

    it('should create parent profile successfully', async () => {
      mockParentProfileService.getParentProfile.mockResolvedValue(null); // No existing profile
      mockParentProfileService.createParentProfile.mockResolvedValue(mockCreatedProfile);

      await parentProfileController.createProfile(mockRequest as Request, mockResponse as Response);

      expect(mockParentProfileService.createParentProfile).toHaveBeenCalledWith('user-1', validCreateData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        ...mockCreatedProfile,
        emergencyContact: validCreateData.emergencyContact,
      });
    });

    it('should return 409 when profile already exists', async () => {
      mockParentProfileService.getParentProfile.mockResolvedValue(mockCreatedProfile);

      await parentProfileController.createProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        error: 'Parent profile already exists. Use PUT to update.' 
      });
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        firstName: '', // Empty first name
        lastName: '', // Empty last name
        communicationPreference: [], // Empty array
      };

      mockRequest.body = invalidData;
      mockParentProfileService.getParentProfile.mockResolvedValue(null);

      await parentProfileController.createProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: expect.any(Array),
      });
    });

    it('should handle service errors', async () => {
      mockParentProfileService.getParentProfile.mockResolvedValue(null);
      mockParentProfileService.createParentProfile.mockRejectedValue(new Error('Database error'));

      await parentProfileController.createProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to create parent profile' });
    });
  });

  describe('updateProfile', () => {
    const validUpdateData = {
      occupation: 'Senior Software Engineer',
      communicationPreference: ['EMAIL', 'SMS'],
    };

    const mockUpdatedProfile = {
      id: 'parent-1',
      userId: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+44 7123 456789',
      occupation: 'Senior Software Engineer',
      emergencyContact: null,
      communicationPreference: ['EMAIL', 'SMS'],
      timezone: 'Europe/London',
      profileCompleteness: 86,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockRequest.body = validUpdateData;
    });

    it('should update parent profile successfully', async () => {
      mockParentProfileService.updateParentProfile.mockResolvedValue(mockUpdatedProfile);

      await parentProfileController.updateProfile(mockRequest as Request, mockResponse as Response);

      expect(mockParentProfileService.updateParentProfile).toHaveBeenCalledWith('user-1', validUpdateData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        ...mockUpdatedProfile,
        emergencyContact: null,
      });
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        phoneNumber: 'invalid-phone', // Invalid phone format
      };

      mockRequest.body = invalidData;

      await parentProfileController.updateProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: expect.any(Array),
      });
    });

    it('should handle profile not found error', async () => {
      mockParentProfileService.updateParentProfile.mockRejectedValue(
        new Error('Parent profile not found')
      );

      await parentProfileController.updateProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Parent profile not found' });
    });

    it('should handle service errors', async () => {
      mockParentProfileService.updateParentProfile.mockRejectedValue(new Error('Database error'));

      await parentProfileController.updateProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to update parent profile' });
    });
  });

  describe('deleteProfile', () => {
    it('should delete parent profile successfully', async () => {
      mockParentProfileService.parentProfileExists.mockResolvedValue(true);
      mockParentProfileService.deleteParentProfile.mockResolvedValue();

      await parentProfileController.deleteProfile(mockRequest as Request, mockResponse as Response);

      expect(mockParentProfileService.deleteParentProfile).toHaveBeenCalledWith('user-1');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 404 when profile not found', async () => {
      mockParentProfileService.parentProfileExists.mockResolvedValue(false);

      await parentProfileController.deleteProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Parent profile not found' });
    });

    it('should handle service errors', async () => {
      mockParentProfileService.parentProfileExists.mockResolvedValue(true);
      mockParentProfileService.deleteParentProfile.mockRejectedValue(new Error('Database error'));

      await parentProfileController.deleteProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to delete parent profile' });
    });
  });

  describe('getProfileCompleteness', () => {
    it('should return profile completeness successfully', async () => {
      mockParentProfileService.getProfileCompleteness.mockResolvedValue(85);

      await parentProfileController.getProfileCompleteness(mockRequest as Request, mockResponse as Response);

      expect(mockParentProfileService.getProfileCompleteness).toHaveBeenCalledWith('user-1');
      expect(mockResponse.json).toHaveBeenCalledWith({ completeness: 85 });
    });

    it('should handle service errors', async () => {
      mockParentProfileService.getProfileCompleteness.mockRejectedValue(new Error('Database error'));

      await parentProfileController.getProfileCompleteness(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to fetch profile completeness' });
    });
  });
}); 