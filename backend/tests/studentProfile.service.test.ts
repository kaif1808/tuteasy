import { StudentProfileService } from '../src/services/studentProfile.service';
import { prisma } from '../src/utils/prisma';
import { 
  UKYearGroup, 
  IBProgramme, 
  QualificationLevel, 
  SchoolType 
} from '../src/types/validation';

// Mock the prisma client
jest.mock('../src/utils/prisma');

describe('StudentProfileService', () => {
  let studentProfileService: StudentProfileService;
  let mockPrisma: jest.Mocked<typeof prisma>;

  beforeEach(() => {
    studentProfileService = new StudentProfileService();
    mockPrisma = prisma as jest.Mocked<typeof prisma>;
  });

  describe('Enhanced UK/IB Profile Creation', () => {
    it('should create UK student profile with valid data', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        ukYearGroup: 'YEAR_10',
        ukKeyStage: 'KS4',
        schoolName: 'Test Grammar School',
        schoolType: 'STATE_GRAMMAR',
        subjectsOfInterest: ['["{\\"subjectName\\":\\"Mathematics\\",\\"qualificationLevel\\":\\"GCSE\\",\\"isCore\\":true}"]'],
        profileCompleteness: 85,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 'user-1', email: 'test@example.com', role: 'STUDENT' },
        parent: null,
      };

      (mockPrisma.studentProfile.create as jest.Mock).mockResolvedValue(mockProfile as any);

      const profileData = {
        ukYearGroup: UKYearGroup.YEAR_10,
        schoolName: 'Test Grammar School',
        schoolType: SchoolType.STATE_GRAMMAR,
        subjectInterests: [{
          subjectName: 'Mathematics',
          qualificationLevel: QualificationLevel.GCSE,
          examBoard: 'AQA',
          isCore: true,
          targetGrade: 'A*'
        }],
        learningGoals: 'Achieve A* in GCSE Mathematics',
        timezone: 'Europe/London'
      };

      const result = await studentProfileService.createEnhancedStudentProfile('user-1', profileData);

      expect((mockPrisma.studentProfile.create as jest.Mock).mock.calls[0][0]).toEqual(expect.objectContaining({
        userId: 'user-1',
        ukYearGroup: 'YEAR_10',
        ukKeyStage: 'KS4',
        schoolName: 'Test Grammar School',
        schoolType: 'STATE_GRAMMAR',
        academicLevelDisplay: 'Year 10',
        subjectsOfInterest: expect.arrayContaining([expect.any(String)]),
        learningGoals: 'Achieve A* in GCSE Mathematics',
        timezone: 'Europe/London',
        profileCompleteness: expect.any(Number)
      }));

      expect(result).toEqual(mockProfile);
    });

    it('should create IB student profile with valid data', async () => {
      const mockProfile = {
        id: 'profile-2',
        userId: 'user-2',
        ibProgramme: 'DP',
        ibYear: 1,
        schoolName: 'International School London',
        schoolType: 'INTERNATIONAL_SCHOOL',
        subjectsOfInterest: [],
        profileCompleteness: 70,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 'user-2', email: 'test2@example.com', role: 'STUDENT' },
        parent: null,
      };

      (mockPrisma.studentProfile.create as jest.Mock).mockResolvedValue(mockProfile as any);

      const profileData = {
        ibProgramme: IBProgramme.DP,
        ibYear: 1,
        schoolName: 'International School London',
        schoolType: SchoolType.INTERNATIONAL_SCHOOL,
        subjectInterests: [{
          subjectName: 'Mathematics',
          qualificationLevel: QualificationLevel.IB_DP_HL,
          isCore: true
        }],
        timezone: 'Europe/London'
      };

      const result = await studentProfileService.createEnhancedStudentProfile('user-2', profileData);

      expect((mockPrisma.studentProfile.create as jest.Mock).mock.calls[0][0]).toEqual(expect.objectContaining({
        userId: 'user-2',
        ibProgramme: 'DP',
        ibYear: 1,
        schoolName: 'International School London',
        schoolType: 'INTERNATIONAL_SCHOOL',
        academicLevelDisplay: 'IB Diploma Programme Year 1',
        profileCompleteness: expect.any(Number)
      }));

      expect(result).toEqual(mockProfile);
    });

    it('should automatically derive UK Key Stage from Year Group', async () => {
      const mockProfile = {
        id: 'profile-3',
        userId: 'user-3',
        ukYearGroup: 'YEAR_7',
        ukKeyStage: 'KS3',
        profileCompleteness: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 'user-3', email: 'test3@example.com', role: 'STUDENT' },
        parent: null,
      };

      (mockPrisma.studentProfile.create as jest.Mock).mockResolvedValue(mockProfile as any);

      const profileData = {
        ukYearGroup: UKYearGroup.YEAR_7,
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      await studentProfileService.createEnhancedStudentProfile('user-3', profileData);

      expect((mockPrisma.studentProfile.create as jest.Mock).mock.calls[0][0]).toEqual(expect.objectContaining({
        ukYearGroup: 'YEAR_7',
        ukKeyStage: 'KS3',
        academicLevelDisplay: 'Year 7'
      }));
    });
  });

  describe('Enhanced Profile Updates', () => {
    it('should update existing profile with new UK/IB data', async () => {
      const existingProfile = {
        id: 'profile-1',
        userId: 'user-1',
        ukYearGroup: 'YEAR_9',
        ukKeyStage: 'KS3',
        schoolName: 'Old School',
        subjectsOfInterest: ['["{\\"subjectName\\":\\"Science\\",\\"qualificationLevel\\":\\"KS3\\",\\"isCore\\":true}"]'],
        learningGoals: 'Old goals',
        timezone: 'UTC',
        profileCompleteness: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
        parent: null,
      };

      const updatedProfile = {
        ...existingProfile,
        ukYearGroup: 'YEAR_10',
        ukKeyStage: 'KS4',
        schoolName: 'New School',
        profileCompleteness: 80,
        updatedAt: new Date(),
      };

      (mockPrisma.studentProfile.findUnique as jest.Mock).mockResolvedValue(existingProfile as any);
      (mockPrisma.studentProfile.update as jest.Mock).mockResolvedValue(updatedProfile as any);

      const updateData = {
        ukYearGroup: UKYearGroup.YEAR_10,
        schoolName: 'New School',
        subjectInterests: [{
          subjectName: 'Mathematics',
          qualificationLevel: QualificationLevel.GCSE,
          isCore: true
        }]
      };

      const result = await studentProfileService.updateEnhancedStudentProfile('user-1', updateData);

      expect((mockPrisma.studentProfile.findUnique as jest.Mock).mock.calls[0][0]).toEqual({
        where: { userId: 'user-1' },
        include: expect.any(Object)
      });

      expect((mockPrisma.studentProfile.update as jest.Mock).mock.calls[0][0]).toEqual({
        where: { userId: 'user-1' },
        data: expect.objectContaining({
          ukYearGroup: 'YEAR_10',
          ukKeyStage: 'KS4',
          schoolName: 'New School',
          academicLevelDisplay: 'Year 10',
          profileCompleteness: expect.any(Number),
          updatedAt: expect.any(Date)
        }),
        include: expect.any(Object)
      });

      expect(result).toEqual(updatedProfile);
    });

    it('should throw error when updating non-existent profile', async () => {
      (mockPrisma.studentProfile.findUnique as jest.Mock).mockResolvedValue(null);

      const updateData = {
        ukYearGroup: UKYearGroup.YEAR_10
      };

      await expect(
        studentProfileService.updateEnhancedStudentProfile('non-existent-user', updateData)
      ).rejects.toThrow('Student profile not found');
    });
  });

  describe('Subject Interest Validation', () => {
    it('should validate UK subjects correctly', async () => {
      const validSubjects = [{
        subjectName: 'Mathematics',
        qualificationLevel: QualificationLevel.GCSE,
        isCore: true
      }];

      const result = await studentProfileService.validateSubjectInterests(
        validSubjects,
        UKYearGroup.YEAR_10
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject A-Level subjects for non-sixth form students', async () => {
      const invalidSubjects = [{
        subjectName: 'Mathematics',
        qualificationLevel: QualificationLevel.A_LEVEL,
        isCore: true
      }];

      const result = await studentProfileService.validateSubjectInterests(
        invalidSubjects,
        UKYearGroup.YEAR_9
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A-Level subjects are only available for Year 12 and Year 13 students');
    });

    it('should reject GCSE subjects for non-GCSE year students', async () => {
      const invalidSubjects = [{
        subjectName: 'Mathematics',
        qualificationLevel: QualificationLevel.GCSE,
        isCore: true
      }];

      const result = await studentProfileService.validateSubjectInterests(
        invalidSubjects,
        UKYearGroup.YEAR_7
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('GCSE subjects are only available for Year 10 and Year 11 students');
    });

    it('should validate IB subjects correctly', async () => {
      const validSubjects = [{
        subjectName: 'Mathematics',
        qualificationLevel: QualificationLevel.IB_DP_HL,
        isCore: true
      }];

      const result = await studentProfileService.validateSubjectInterests(
        validSubjects,
        undefined,
        IBProgramme.DP
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject IB DP subjects for non-DP students', async () => {
      const invalidSubjects = [{
        subjectName: 'Mathematics',
        qualificationLevel: QualificationLevel.IB_DP_HL,
        isCore: true
      }];

      const result = await studentProfileService.validateSubjectInterests(
        invalidSubjects,
        undefined,
        IBProgramme.MYP
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('IB Diploma subjects are only available for DP programme students');
    });

    it('should handle invalid subject data', async () => {
      const invalidSubjects = [{
        subjectName: '', // Invalid - empty name
        qualificationLevel: QualificationLevel.GCSE,
        isCore: true
      }];

      const result = await studentProfileService.validateSubjectInterests(
        invalidSubjects,
        UKYearGroup.YEAR_10
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Profile Completeness Calculation', () => {
    it('should calculate enhanced profile completeness correctly', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        profileCompleteness: 85,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 'user-1', email: 'test@example.com', role: 'STUDENT' },
        parent: null,
      };

      (mockPrisma.studentProfile.create as jest.Mock).mockResolvedValue(mockProfile as any);

      // Complete profile data
      const completeProfileData = {
        ukYearGroup: UKYearGroup.YEAR_10,
        schoolName: 'Test School',
        schoolType: SchoolType.STATE_COMPREHENSIVE,
        subjectInterests: [{
          subjectName: 'Mathematics',
          qualificationLevel: QualificationLevel.GCSE,
          isCore: true
        }],
        learningGoals: 'Achieve high grades',
        preferredLearningStyle: 'VISUAL' as const,
        timezone: 'Europe/London'
      };

      await studentProfileService.createEnhancedStudentProfile('user-1', completeProfileData);

      const createCall = (mockPrisma.studentProfile.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.profileCompleteness).toBeGreaterThan(80);
    });

    it('should calculate lower completeness for incomplete profiles', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        profileCompleteness: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 'user-1', email: 'test@example.com', role: 'STUDENT' },
        parent: null,
      };

      (mockPrisma.studentProfile.create as jest.Mock).mockResolvedValue(mockProfile as any);

      // Minimal profile data
      const minimalProfileData = {
        ukYearGroup: UKYearGroup.YEAR_10,
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      await studentProfileService.createEnhancedStudentProfile('user-1', minimalProfileData);

      const createCall = (mockPrisma.studentProfile.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.profileCompleteness).toBeLessThan(50);
    });
  });

  describe('Access Control', () => {
    it('should allow student to access their own profile', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        parentId: null,
      };

      (mockPrisma.studentProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile as any);

      const hasAccess = await studentProfileService.verifyAccess('user-1', 'user-1');
      expect(hasAccess).toBe(true);
    });

    it('should allow parent to access child profile', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        parentId: 'parent-1',
      };

      (mockPrisma.studentProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile as any);

      const hasAccess = await studentProfileService.verifyAccess('user-1', 'parent-1');
      expect(hasAccess).toBe(true);
    });

    it('should deny access to unrelated users', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        parentId: 'parent-1',
      };

      (mockPrisma.studentProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile as any);

      const hasAccess = await studentProfileService.verifyAccess('user-1', 'unrelated-user');
      expect(hasAccess).toBe(false);
    });
  });

  describe('Parent Linking', () => {
    it('should successfully link parent to student', async () => {
      const mockParent = { id: 'parent-1', role: 'PARENT' };
      const mockUpdatedProfile = {
        id: 'profile-1',
        userId: 'user-1',
        parentId: 'parent-1',
        user: { id: 'user-1', email: 'student@example.com', role: 'STUDENT' },
        parent: { id: 'parent-1', email: 'parent@example.com', role: 'PARENT' },
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockParent as any);
      (mockPrisma.studentProfile.update as jest.Mock).mockResolvedValue(mockUpdatedProfile as any);

      const result = await studentProfileService.linkParent('user-1', 'parent-1');

      expect((mockPrisma.user.findUnique as jest.Mock).mock.calls[0][0]).toEqual({
        where: { id: 'parent-1' },
        select: { role: true }
      });

      expect((mockPrisma.studentProfile.update as jest.Mock).mock.calls[0][0]).toEqual({
        where: { userId: 'user-1' },
        data: { parentId: 'parent-1' },
        include: expect.any(Object)
      });

      expect(result).toEqual(mockUpdatedProfile);
    });

    it('should reject linking non-parent user', async () => {
      const mockUser = { id: 'user-1', role: 'STUDENT' };
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser as any);

      await expect(
        studentProfileService.linkParent('user-1', 'user-1')
      ).rejects.toThrow('User must have PARENT role to be linked as parent');
    });

    it('should reject linking non-existent user', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        studentProfileService.linkParent('user-1', 'non-existent')
      ).rejects.toThrow('User must have PARENT role to be linked as parent');
    });
  });

  describe('Data Format Handling', () => {
    it('should parse legacy subject format correctly', async () => {
      const existingProfile = {
        id: 'profile-1',
        userId: 'user-1',
        subjectsOfInterest: ['Mathematics', 'Science'], // Legacy format
        profileCompleteness: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
        parent: null,
      };

      const updatedProfile = {
        ...existingProfile,
        profileCompleteness: 70,
        updatedAt: new Date(),
      };

      (mockPrisma.studentProfile.findUnique as jest.Mock).mockResolvedValue(existingProfile as any);
      (mockPrisma.studentProfile.update as jest.Mock).mockResolvedValue(updatedProfile as any);

      const updateData = {
        learningGoals: 'New learning goals'
      };

      await studentProfileService.updateEnhancedStudentProfile('user-1', updateData);

      // Should handle legacy format without errors
      expect((mockPrisma.studentProfile.update as jest.Mock).mock.calls[0][0]).toEqual(expect.objectContaining({
        learningGoals: 'New learning goals'
      }));
    });

    it('should parse JSON subject format correctly', async () => {
      const existingProfile = {
        id: 'profile-1',
        userId: 'user-1',
        subjectsOfInterest: [
          JSON.stringify({
            subjectName: 'Mathematics',
            qualificationLevel: 'GCSE',
            isCore: true
          })
        ],
        profileCompleteness: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
        parent: null,
      };

      const updatedProfile = {
        ...existingProfile,
        profileCompleteness: 70,
        updatedAt: new Date(),
      };

      (mockPrisma.studentProfile.findUnique as jest.Mock).mockResolvedValue(existingProfile as any);
      (mockPrisma.studentProfile.update as jest.Mock).mockResolvedValue(updatedProfile as any);

      const updateData = {
        learningGoals: 'New learning goals'
      };

      await studentProfileService.updateEnhancedStudentProfile('user-1', updateData);

      // Should handle JSON format without errors
      expect((mockPrisma.studentProfile.update as jest.Mock).mock.calls[0][0]).toEqual(expect.objectContaining({
        learningGoals: 'New learning goals'
      }));
    });
  });
}); 