import { ParentProfileService } from '../src/services/parentProfile.service';
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
      const profileData = {
        fullName: 'Jane Doe',
        phoneNumber: '0987654321',
      };

      const expectedProfile = { id: '2', userId: 'user-2', ...profileData, children: [], profileCompleteness: 50 };

      (mockPrisma.parentProfile.create as jest.Mock).mockResolvedValue(expectedProfile);

      const result = await parentProfileService.createParentProfile('user-2', profileData);

      expect(result).toEqual(expectedProfile);
      expect(mockPrisma.parentProfile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-2',
          profileCompleteness: 50
        }),
      });
    });

    it('should calculate a low completeness for a minimal profile', async () => {
      const profileData = {
        fullName: 'Jane Doe',
      };
      (mockPrisma.parentProfile.create as jest.Mock).mockResolvedValue({
        id: '1',
        userId: 'user-1',
        ...profileData,
        children: [],
        profileCompleteness: 25,
      });

      const result = await parentProfileService.createParentProfile('user-1', profileData);

      expect(result.profileCompleteness).toBe(25);
    });
  });

  describe('updateParentProfile', () => {
    it('should update an existing parent profile', async () => {
      const existingProfile = {
        id: '1',
        userId: 'user-1',
        fullName: 'Old Name',
        children: [],
        profileCompleteness: 80,
      };
      const updateData = { fullName: 'New Name' };

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
      await expect(parentProfileService.updateParentProfile('user-1', { fullName: 'Test' })).rejects.toThrow('Parent profile not found');
    });

    it('should recalculate completeness on update', async () => {
      const existingProfile = { id: '1', userId: 'user-1', fullName: 'Old Name', children: [] };
      const updatedProfile = { ...existingProfile, phoneNumber: '1234567890' };
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

  describe('verifyUserIsParent', () => {
    it('should return true if the user is a parent', async () => {
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue({ id: 'parent-1' } as any);
      const isParent = await parentProfileService.verifyUserIsParent('parent-user-id');
      expect(isParent).toBe(true);
    });

    it('should return false if the user is not a parent', async () => {
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(null);
      const isParent = await parentProfileService.verifyUserIsParent('non-parent-user-id');
      expect(isParent).toBe(false);
    });
  });

  describe('getChildProfiles', () => {
    it('should retrieve child profiles for a parent', async () => {
      const mockProfile = { children: [{ id: 'child-1' }, { id: 'child-2' }] };
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile as any);
      const children = await parentProfileService.getChildProfiles('parent-1');
      expect(children).toHaveLength(2);
    });

    it('should return an empty array if parent profile not found', async () => {
      (mockPrisma.parentProfile.findUnique as jest.Mock).mockResolvedValue(null);
      const children = await parentProfileService.getChildProfiles('parent-1');
      expect(children).toEqual([]);
    });
  });
}); 