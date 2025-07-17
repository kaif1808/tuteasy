import { ParentProfileService } from '../src/services/parentProfile.service';
import { CreateParentProfileData, UpdateParentProfileData } from '../src/validation/parentProfile.validation';
import { prisma } from '../src/utils/prisma';

// Mock the prisma client
jest.mock('../src/utils/prisma');

describe('ParentProfileService', () => {
  let parentProfileService: ParentProfileService;
  let mockPrisma: jest.Mocked<typeof prisma>;

  beforeEach(() => {
    parentProfileService = new ParentProfileService();
    mockPrisma = prisma as jest.Mocked<typeof prisma>;
  });

  describe('getParentProfile', () => {
    it('should return parent profile if it exists', async () => {
      const mockParentProfile = { id: '1', userId: 'user-1', children: [] };
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(mockParentProfile);

      const result = await parentProfileService.getParentProfile('user-1');
      expect(result).toEqual(mockParentProfile);
      expect(mockPrisma.parentProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: { children: true },
      });
    });

    it('should return null if parent profile does not exist', async () => {
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await parentProfileService.getParentProfile('user-1');
      expect(result).toBeNull();
    });
  });

  describe('createParentProfile', () => {
    it('should create a new parent profile with 100% completeness for all fields', async () => {
      const profileData = {
        fullName: 'John Doe',
        phoneNumber: '1234567890',
        timezone: 'UTC',
        communicationPreferences: ['EMAIL', 'SMS'],
      };

      const mockCreatedProfile = {
        id: '1',
        userId: 'user-1',
        ...profileData,
        children: [],
        profileCompleteness: 100,
      };

      (mockPrisma.parentProfile.create as jest.Mock).mockResolvedValue(mockCreatedProfile);

      const result = await parentProfileService.createParentProfile('user-1', profileData);

      expect(result).toEqual(mockCreatedProfile);
      expect(mockPrisma.parentProfile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          ...profileData,
          profileCompleteness: 100,
        }),
      });
    });

    it('should create a profile with partial completeness', async () => {
      const profileData: CreateParentProfileData = {
        firstName: 'Jane',
        lastName: 'Doe',
        phoneNumber: '0987654321',
        communicationPreference: ['EMAIL'],
        timezone: 'Europe/London',
      };

      const expectedProfile = {
        id: '2',
        userId: 'user-2',
        firstName: 'Jane',
        lastName: 'Doe',
        phoneNumber: '0987654321',
        communicationPreference: ['EMAIL'],
        timezone: 'Europe/London',
        profileCompleteness: 57 // 4 out of 7 fields
      };

      (mockPrisma.parentProfile.create as jest.Mock).mockResolvedValue(expectedProfile);

      const result = await parentProfileService.createParentProfile('user-2', profileData);

      expect(result).toEqual(expectedProfile);
      expect(mockPrisma.parentProfile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-2',
          profileCompleteness: expect.any(Number)
        }),
      });
    });

    it('should calculate a low completeness for a minimal profile', async () => {
      const profileData: CreateParentProfileData = {
        firstName: 'Jane',
        communicationPreference: ['EMAIL'],
        timezone: 'Europe/London',
      };

      (mockPrisma.parentProfile.create as jest.Mock).mockResolvedValue({
        id: '1',
        userId: 'user-1',
        firstName: 'Jane',
        communicationPreference: ['EMAIL'],
        timezone: 'Europe/London',
        profileCompleteness: 43, // 3 out of 7 fields
      });

      const result = await parentProfileService.createParentProfile('user-1', profileData);

      expect(result.profileCompleteness).toBe(43);
    });
  });

  describe('updateParentProfile', () => {
    it('should update an existing parent profile', async () => {
      const existingProfile = {
        id: '1',
        userId: 'user-1',
        firstName: 'Old',
        lastName: 'Name',
        communicationPreference: ['EMAIL'],
        timezone: 'Europe/London',
        profileCompleteness: 80,
      };
      const updateData: UpdateParentProfileData = { firstName: 'New' };

      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(existingProfile);

      const updatedProfile = {
        ...existingProfile,
        ...updateData,
        profileCompleteness: 90,
      };

      (mockPrisma.parentProfile.update as jest.Mock).mockResolvedValue(updatedProfile);

      const result = await parentProfileService.updateParentProfile('user-1', updateData);
      expect(result).toEqual(updatedProfile);
      expect(mockPrisma.parentProfile.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: expect.objectContaining(updateData),
      });
    });

    it('should throw an error if profile to update is not found', async () => {
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(parentProfileService.updateParentProfile('user-1', { firstName: 'Test' })).rejects.toThrow('Parent profile not found');
    });

    it('should recalculate completeness on update', async () => {
      const existingProfile = {
        id: '1',
        userId: 'user-1',
        firstName: 'Old',
        lastName: 'Name',
        communicationPreference: ['EMAIL'],
        timezone: 'Europe/London',
        profileCompleteness: 57
      };
      const updatedProfile = { ...existingProfile, phoneNumber: '1234567890' };

      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(existingProfile);
      (mockPrisma.parentProfile.update as jest.Mock).mockResolvedValue(updatedProfile);

      await parentProfileService.updateParentProfile('user-1', { phoneNumber: '1234567890' });
      expect(mockPrisma.parentProfile.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ profileCompleteness: expect.any(Number) })
      }));
    });
  });

  describe('deleteParentProfile', () => {
    it('should delete a profile successfully', async () => {
      (mockPrisma.parentProfile.delete as jest.Mock).mockResolvedValue({} as any);
      await parentProfileService.deleteParentProfile('user-1');
      expect(mockPrisma.parentProfile.delete).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    });
  });

  describe('parentProfileExists', () => {
    it('should return true when profile exists', async () => {
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue({ id: 'parent-1' });
      const exists = await parentProfileService.parentProfileExists('user-1');
      expect(exists).toBe(true);
    });

    it('should return false when profile does not exist', async () => {
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(null);
      const exists = await parentProfileService.parentProfileExists('user-1');
      expect(exists).toBe(false);
    });
  });

  describe('getProfileCompleteness', () => {
    it('should return profile completeness when profile exists', async () => {
      const mockProfile = { profileCompleteness: 85 };
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);
      const completeness = await parentProfileService.getProfileCompleteness('user-1');
      expect(completeness).toBe(85);
    });

    it('should return 0 when profile does not exist', async () => {
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(null);
      const completeness = await parentProfileService.getProfileCompleteness('user-1');
      expect(completeness).toBe(0);
    });

    it('should return 100 for a complete profile', () => {
      const { calculateParentProfileCompleteness } = require('../src/validation/parentProfile.validation');

      const completeData = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+44 7123 456789',
        occupation: 'Software Engineer',
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phoneNumber: '+44 7987 654321',
        },
        communicationPreference: ['EMAIL', 'SMS'],
        timezone: 'Europe/London',
      };

      const completeness = calculateParentProfileCompleteness(completeData);
      expect(completeness).toBe(100);
    });

    it('should return 0 for an empty profile', () => {
      const { calculateParentProfileCompleteness } = require('../src/validation/parentProfile.validation');

      const emptyData = {};
      const completeness = calculateParentProfileCompleteness(emptyData);
      expect(completeness).toBe(0);
    });
  });
});