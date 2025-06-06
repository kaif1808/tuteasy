// Mock the prisma utils module first
jest.mock('../utils/prisma', () => ({
  prisma: {
    parentProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { ParentProfileService } from '../services/parentProfile.service';
import { CreateParentProfileData, UpdateParentProfileData } from '../validation/parentProfile.validation';
import { prisma } from '../utils/prisma';

// Get the mocked prisma
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('ParentProfileService', () => {
  let parentProfileService: ParentProfileService;

  beforeEach(() => {
    parentProfileService = new ParentProfileService();
    jest.clearAllMocks();
  });

  describe('getParentProfile', () => {
    const mockParentProfile = {
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
        email: 'jane@example.com',
      }),
      communicationPreference: ['EMAIL', 'SMS'],
      timezone: 'Europe/London',
      profileCompleteness: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return parent profile when found', async () => {
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(mockParentProfile);

      const result = await parentProfileService.getParentProfile('user-1');

      expect(result).toEqual(mockParentProfile);
      expect(mockPrisma.parentProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('should return null when profile not found', async () => {
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await parentProfileService.getParentProfile('user-1');

      expect(result).toBeNull();
    });
  });

  describe('createParentProfile', () => {
    const createData: CreateParentProfileData = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+44 7123 456789',
      occupation: 'Software Engineer',
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phoneNumber: '+44 7987 654321',
        email: 'jane@example.com',
      },
      communicationPreference: ['EMAIL', 'SMS'],
      timezone: 'Europe/London',
    };

    const mockCreatedProfile = {
      id: 'parent-1',
      userId: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+44 7123 456789',
      occupation: 'Software Engineer',
      emergencyContact: JSON.stringify(createData.emergencyContact),
      communicationPreference: ['EMAIL', 'SMS'],
      timezone: 'Europe/London',
      profileCompleteness: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create parent profile successfully', async () => {
      (mockPrisma.parentProfile.create as jest.Mock).mockResolvedValue(mockCreatedProfile);

      const result = await parentProfileService.createParentProfile('user-1', createData);

      expect(result).toEqual(mockCreatedProfile);
      expect(mockPrisma.parentProfile.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+44 7123 456789',
          occupation: 'Software Engineer',
          emergencyContact: JSON.stringify(createData.emergencyContact),
          communicationPreference: ['EMAIL', 'SMS'],
          timezone: 'Europe/London',
          profileCompleteness: 100,
        },
      });
    });

    it('should handle null emergency contact', async () => {
      const dataWithoutEmergencyContact = {
        ...createData,
        emergencyContact: undefined,
      };

      const expectedProfile = {
        ...mockCreatedProfile,
        emergencyContact: null,
      };

      (mockPrisma.parentProfile.create as jest.Mock).mockResolvedValue(expectedProfile);

      await parentProfileService.createParentProfile('user-1', dataWithoutEmergencyContact);

      expect(mockPrisma.parentProfile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          emergencyContact: null,
        }),
      });
    });

    it('should calculate profile completeness correctly', async () => {
      const partialData: CreateParentProfileData = {
        firstName: 'John',
        communicationPreference: ['EMAIL'],
        timezone: 'Europe/London',
      };

      (mockPrisma.parentProfile.create as jest.Mock).mockResolvedValue({
        ...mockCreatedProfile,
        profileCompleteness: 43, // 3 out of 7 fields completed
      });

      await parentProfileService.createParentProfile('user-1', partialData);

      expect(mockPrisma.parentProfile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          profileCompleteness: 43,
        }),
      });
    });
  });

  describe('updateParentProfile', () => {
    const existingProfile = {
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
        email: 'jane@example.com',
      }),
      communicationPreference: ['EMAIL'],
      timezone: 'Europe/London',
      profileCompleteness: 86,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateData: UpdateParentProfileData = {
      occupation: 'Senior Software Engineer',
      communicationPreference: ['EMAIL', 'SMS'],
    };

    beforeEach(() => {
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(existingProfile);
    });

    it('should update parent profile successfully', async () => {
      const updatedProfile = {
        ...existingProfile,
        occupation: 'Senior Software Engineer',
        communicationPreference: ['EMAIL', 'SMS'],
        profileCompleteness: 100,
      };

      (mockPrisma.parentProfile.update as jest.Mock).mockResolvedValue(updatedProfile);

      const result = await parentProfileService.updateParentProfile('user-1', updateData);

      expect(result).toEqual(updatedProfile);
      expect(mockPrisma.parentProfile.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: expect.objectContaining({
          occupation: 'Senior Software Engineer',
          communicationPreference: ['EMAIL', 'SMS'],
          profileCompleteness: 100,
          updatedAt: expect.any(Date),
        }),
      });
    });

    it('should throw error when profile not found', async () => {
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        parentProfileService.updateParentProfile('user-1', updateData)
      ).rejects.toThrow('Parent profile not found');
    });

    it('should handle emergency contact updates', async () => {
      const updateWithEmergencyContact: UpdateParentProfileData = {
        emergencyContact: {
          name: 'Updated Emergency Contact',
          relationship: 'Friend',
          phoneNumber: '+44 7000 000000',
        },
      };

      const updatedProfile = {
        ...existingProfile,
        emergencyContact: JSON.stringify(updateWithEmergencyContact.emergencyContact),
      };

      (mockPrisma.parentProfile.update as jest.Mock).mockResolvedValue(updatedProfile);

      await parentProfileService.updateParentProfile('user-1', updateWithEmergencyContact);

      expect(mockPrisma.parentProfile.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: expect.objectContaining({
          emergencyContact: JSON.stringify(updateWithEmergencyContact.emergencyContact),
        }),
      });
    });
  });

  describe('deleteParentProfile', () => {
    it('should delete parent profile successfully', async () => {
      (mockPrisma.parentProfile.delete as jest.Mock).mockResolvedValue({} as any);

      await parentProfileService.deleteParentProfile('user-1');

      expect(mockPrisma.parentProfile.delete).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });

  describe('parentProfileExists', () => {
    it('should return true when profile exists', async () => {
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue({ id: 'parent-1' } as any);

      const result = await parentProfileService.parentProfileExists('user-1');

      expect(result).toBe(true);
      expect(mockPrisma.parentProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        select: { id: true },
      });
    });

    it('should return false when profile does not exist', async () => {
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await parentProfileService.parentProfileExists('user-1');

      expect(result).toBe(false);
    });
  });

  describe('getProfileCompleteness', () => {
    it('should return profile completeness when profile exists', async () => {
      const mockProfile = {
        id: 'parent-1',
        profileCompleteness: 85,
      };

      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile as any);

      const result = await parentProfileService.getProfileCompleteness('user-1');

      expect(result).toBe(85);
    });

    it('should return 0 when profile does not exist', async () => {
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await parentProfileService.getProfileCompleteness('user-1');

      expect(result).toBe(0);
    });

    it('should return 100 for a complete profile', () => {
      const completeData: UpdateParentProfileData = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+44 7123 456789',
        timezone: 'Europe/London',
      };

      const completeness = (parentProfileService as any).getProfileCompleteness(completeData);
      expect(completeness).toBe(100);
    });

    it('should return 0 for an empty profile', () => {
      const emptyData = {};
      const completeness = (parentProfileService as any).getProfileCompleteness(emptyData);
      expect(completeness).toBe(0);
    });
  });
}); 