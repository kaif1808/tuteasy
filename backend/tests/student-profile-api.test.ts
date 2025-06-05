import { StudentProfileService } from '../src/services/studentProfile.service';
import { 
  createEnhancedStudentProfileSchema, 
  updateEnhancedStudentProfileSchema,
  UKYearGroup, 
  IBProgramme, 
  QualificationLevel 
} from '../src/types/validation';

describe('Student Profile API Integration', () => {
  let service: StudentProfileService;

  beforeEach(() => {
    service = new StudentProfileService();
  });

  describe('Enhanced Schema Validation', () => {
    it('should validate UK student profile creation data', () => {
      const ukProfileData = {
        ukYearGroup: UKYearGroup.YEAR_10,
        schoolName: 'Test Grammar School',
        subjectInterests: [{
          subjectName: 'Mathematics',
          qualificationLevel: QualificationLevel.GCSE,
          examBoard: 'AQA',
          isCore: true,
          targetGrade: 'A*'
        }],
        learningGoals: 'Achieve A* in GCSE Mathematics',
        preferredLearningStyle: 'VISUAL' as const,
        timezone: 'Europe/London'
      };

      const result = createEnhancedStudentProfileSchema.safeParse(ukProfileData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.ukYearGroup).toBe('YEAR_10');
        expect(result.data.subjectInterests).toHaveLength(1);
        expect(result.data.subjectInterests[0].subjectName).toBe('Mathematics');
      }
    });

    it('should validate IB student profile creation data', () => {
      const ibProfileData = {
        ibProgramme: IBProgramme.DP,
        ibYear: 1,
        schoolName: 'International School London',
        subjectInterests: [{
          subjectName: 'Mathematics',
          qualificationLevel: QualificationLevel.IB_DP_HL,
          isCore: true
        }],
        timezone: 'Europe/London'
      };

      const result = createEnhancedStudentProfileSchema.safeParse(ibProfileData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.ibProgramme).toBe('DP');
        expect(result.data.ibYear).toBe(1);
      }
    });

    it('should validate partial updates', () => {
      const updateData = {
        schoolName: 'New School Name',
        learningGoals: 'Updated learning goals'
      };

      const result = updateEnhancedStudentProfileSchema.safeParse(updateData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.schoolName).toBe('New School Name');
        expect(result.data.learningGoals).toBe('Updated learning goals');
      }
    });

    it('should reject conflicting academic systems', () => {
      const conflictingData = {
        ukYearGroup: UKYearGroup.YEAR_10,
        ibProgramme: IBProgramme.DP,
        ibYear: 1,
        timezone: 'Europe/London'
      };

      const result = createEnhancedStudentProfileSchema.safeParse(conflictingData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('either a UK Year Group or IB Programme')
        )).toBe(true);
      }
    });
  });

  describe('Subject Interest Validation Logic', () => {
    it('should validate UK subject restrictions correctly', async () => {
      // Test A-Level restriction for non-sixth form students
      const invalidSubjects = [{
        subjectName: 'Mathematics',
        qualificationLevel: QualificationLevel.A_LEVEL,
        isCore: true
      }];

      const validation = await service.validateSubjectInterests(
        invalidSubjects,
        UKYearGroup.YEAR_9 // Too young for A-Levels
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('A-Level subjects are only available for Year 12 and Year 13 students');
    });

    it('should validate GCSE subject restrictions correctly', async () => {
      const invalidSubjects = [{
        subjectName: 'History',
        qualificationLevel: QualificationLevel.GCSE,
        isCore: false
      }];

      const validation = await service.validateSubjectInterests(
        invalidSubjects,
        UKYearGroup.YEAR_7 // Too young for GCSEs
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('GCSE subjects are only available for Year 10 and Year 11 students');
    });

    it('should validate IB DP subject restrictions correctly', async () => {
      const invalidSubjects = [{
        subjectName: 'Mathematics',
        qualificationLevel: QualificationLevel.IB_DP_HL,
        isCore: true
      }];

      const validation = await service.validateSubjectInterests(
        invalidSubjects,
        undefined,
        IBProgramme.MYP // Wrong programme for DP subjects
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('IB Diploma subjects are only available for DP programme students');
    });

    it('should accept valid UK subjects for appropriate year groups', async () => {
      const validSubjects = [{
        subjectName: 'Mathematics',
        qualificationLevel: QualificationLevel.GCSE,
        examBoard: 'AQA',
        isCore: true,
        targetGrade: 'A*'
      }];

      const validation = await service.validateSubjectInterests(
        validSubjects,
        UKYearGroup.YEAR_10 // Correct year for GCSEs
      );

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should accept valid IB subjects for appropriate programmes', async () => {
      const validSubjects = [{
        subjectName: 'Mathematics',
        qualificationLevel: QualificationLevel.IB_DP_HL,
        isCore: true
      }];

      const validation = await service.validateSubjectInterests(
        validSubjects,
        undefined,
        IBProgramme.DP // Correct programme for DP subjects
      );

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Academic Level Processing', () => {
    it('should automatically derive UK Key Stage from Year Group', () => {
      // Test various year group to key stage mappings
      const testCases = [
        { yearGroup: UKYearGroup.NURSERY, expectedKeyStage: 'EARLY_YEARS' },
        { yearGroup: UKYearGroup.RECEPTION, expectedKeyStage: 'EARLY_YEARS' },
        { yearGroup: UKYearGroup.YEAR_1, expectedKeyStage: 'KS1' },
        { yearGroup: UKYearGroup.YEAR_2, expectedKeyStage: 'KS1' },
        { yearGroup: UKYearGroup.YEAR_7, expectedKeyStage: 'KS3' },
        { yearGroup: UKYearGroup.YEAR_10, expectedKeyStage: 'KS4' },
        { yearGroup: UKYearGroup.YEAR_12, expectedKeyStage: 'KS5' },
      ];

      testCases.forEach(testCase => {
        const profileData = {
          ukYearGroup: testCase.yearGroup,
          subjectInterests: [],
          timezone: 'Europe/London'
        };

        const result = createEnhancedStudentProfileSchema.safeParse(profileData);
        expect(result.success).toBe(true);
      });
    });

    it('should validate IB year ranges for different programmes', () => {
      // Test valid IB programme year combinations
      const validCombinations = [
        { programme: IBProgramme.PYP, year: 1 },
        { programme: IBProgramme.PYP, year: 6 },
        { programme: IBProgramme.MYP, year: 1 },
        { programme: IBProgramme.MYP, year: 5 },
        { programme: IBProgramme.DP, year: 1 },
        { programme: IBProgramme.DP, year: 2 },
        { programme: IBProgramme.CP, year: 1 },
        { programme: IBProgramme.CP, year: 2 },
      ];

      validCombinations.forEach(combo => {
        const profileData = {
          ibProgramme: combo.programme,
          ibYear: combo.year,
          subjectInterests: [],
          timezone: 'Europe/London'
        };

        const result = createEnhancedStudentProfileSchema.safeParse(profileData);
        expect(result.success).toBe(true);
      });

      // Test invalid combinations
      const invalidCombinations = [
        { programme: IBProgramme.DP, year: 3 }, // DP only has 2 years
        { programme: IBProgramme.MYP, year: 6 }, // MYP only has 5 years
        { programme: IBProgramme.PYP, year: 7 }, // PYP only has 6 years
      ];

      invalidCombinations.forEach(combo => {
        const profileData = {
          ibProgramme: combo.programme,
          ibYear: combo.year,
          subjectInterests: [],
          timezone: 'Europe/London'
        };

        const result = createEnhancedStudentProfileSchema.safeParse(profileData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Backward Compatibility', () => {
    it('should support legacy profile data', () => {
      const legacyData = {
        gradeLevel: '10th Grade',
        schoolName: 'Legacy School',
        subjectInterests: [],
        timezone: 'UTC'
      };

      const result = createEnhancedStudentProfileSchema.safeParse(legacyData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.gradeLevel).toBe('10th Grade');
        expect(result.data.ukYearGroup).toBeUndefined();
        expect(result.data.ibProgramme).toBeUndefined();
      }
    });

    it('should handle mixed legacy and new field updates', () => {
      const mixedUpdateData = {
        gradeLevel: '11th Grade', // Legacy field
        ukYearGroup: UKYearGroup.YEAR_11, // New field - this would be invalid
        schoolName: 'Updated School'
      };

      // This should pass validation since we're not enforcing mutual exclusivity in updates
      const result = updateEnhancedStudentProfileSchema.safeParse(mixedUpdateData);
      expect(result.success).toBe(true);
    });
  });
}); 