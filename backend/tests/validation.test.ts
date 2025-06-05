import { 
  enhancedStudentProfileSchema,
  subjectInterestSchema,
  UKYearGroup,
  IBProgramme,
  QualificationLevel,
  SchoolType
} from '../src/types/validation';

describe('Enhanced Student Profile Validation', () => {
  describe('UK Year Group Validation', () => {
    it('should accept valid UK year group data', () => {
      const validData = {
        ukYearGroup: UKYearGroup.YEAR_10,
        schoolName: 'Test School',
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      const result = enhancedStudentProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.ukYearGroup).toBe('YEAR_10');
        expect(result.data.timezone).toBe('Europe/London');
      }
    });

    it('should automatically derive UK Key Stage', () => {
      const validData = {
        ukYearGroup: UKYearGroup.YEAR_7,
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      const result = enhancedStudentProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UK Key Stage for Year Group', () => {
      const invalidData = {
        ukYearGroup: UKYearGroup.YEAR_10,
        ukKeyStage: 'KS1', // Wrong key stage for Year 10
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      const result = enhancedStudentProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('UK Key Stage must match')
        )).toBe(true);
      }
    });
  });

  describe('IB Programme Validation', () => {
    it('should accept valid IB programme data', () => {
      const validData = {
        ibProgramme: IBProgramme.DP,
        ibYear: 1,
        schoolName: 'International School',
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      const result = enhancedStudentProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.ibProgramme).toBe('DP');
        expect(result.data.ibYear).toBe(1);
      }
    });

    it('should reject IB programme without year of study', () => {
      const invalidData = {
        ibProgramme: IBProgramme.DP,
        // Missing ibYear
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      const result = enhancedStudentProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('valid year of study')
        )).toBe(true);
      }
    });

    it('should validate IB year ranges for different programmes', () => {
      // Valid DP year (1-2)
      const validDP = {
        ibProgramme: IBProgramme.DP,
        ibYear: 2,
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      expect(enhancedStudentProfileSchema.safeParse(validDP).success).toBe(true);

      // Invalid DP year (>2)
      const invalidDP = {
        ibProgramme: IBProgramme.DP,
        ibYear: 3,
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      expect(enhancedStudentProfileSchema.safeParse(invalidDP).success).toBe(false);

      // Valid MYP year (1-5)
      const validMYP = {
        ibProgramme: IBProgramme.MYP,
        ibYear: 5,
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      expect(enhancedStudentProfileSchema.safeParse(validMYP).success).toBe(true);

      // Invalid MYP year (>5)
      const invalidMYP = {
        ibProgramme: IBProgramme.MYP,
        ibYear: 6,
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      expect(enhancedStudentProfileSchema.safeParse(invalidMYP).success).toBe(false);

      // Valid PYP year (1-6)
      const validPYP = {
        ibProgramme: IBProgramme.PYP,
        ibYear: 6,
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      expect(enhancedStudentProfileSchema.safeParse(validPYP).success).toBe(true);
    });
  });

  describe('Academic System Mutual Exclusivity', () => {
    it('should reject both UK Year Group and IB Programme', () => {
      const invalidData = {
        ukYearGroup: UKYearGroup.YEAR_10,
        ibProgramme: IBProgramme.DP,
        ibYear: 1,
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      const result = enhancedStudentProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('either a UK Year Group or IB Programme')
        )).toBe(true);
      }
    });

    it('should accept neither UK nor IB for legacy profiles', () => {
      const legacyData = {
        gradeLevel: '10th Grade',
        schoolName: 'Legacy School',
        subjectInterests: [],
        timezone: 'UTC'
      };

      const result = enhancedStudentProfileSchema.safeParse(legacyData);
      expect(result.success).toBe(true);
    });
  });

  describe('Subject Interest Validation', () => {
    it('should accept valid subject interest', () => {
      const validSubject = {
        subjectName: 'Mathematics',
        qualificationLevel: QualificationLevel.GCSE,
        examBoard: 'AQA',
        isCore: true,
        targetGrade: 'A*'
      };

      const result = subjectInterestSchema.safeParse(validSubject);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.subjectName).toBe('Mathematics');
        expect(result.data.qualificationLevel).toBe('GCSE');
        expect(result.data.examBoard).toBe('AQA');
        expect(result.data.isCore).toBe(true);
        expect(result.data.targetGrade).toBe('A*');
      }
    });

    it('should reject empty subject name', () => {
      const invalidSubject = {
        subjectName: '',
        qualificationLevel: QualificationLevel.GCSE,
        isCore: false
      };

      const result = subjectInterestSchema.safeParse(invalidSubject);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('Subject name is required')
        )).toBe(true);
      }
    });

    it('should reject subject name that is too long', () => {
      const invalidSubject = {
        subjectName: 'A'.repeat(101), // Too long
        qualificationLevel: QualificationLevel.GCSE,
        isCore: false
      };

      const result = subjectInterestSchema.safeParse(invalidSubject);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('100 characters')
        )).toBe(true);
      }
    });

    it('should accept optional fields as undefined', () => {
      const minimalSubject = {
        subjectName: 'History',
        qualificationLevel: QualificationLevel.A_LEVEL,
        isCore: false
      };

      const result = subjectInterestSchema.safeParse(minimalSubject);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.examBoard).toBeUndefined();
        expect(result.data.targetGrade).toBeUndefined();
      }
    });

    it('should validate array of subject interests in profile', () => {
      const profileData = {
        ukYearGroup: UKYearGroup.YEAR_11,
        subjectInterests: [
          {
            subjectName: 'Mathematics',
            qualificationLevel: QualificationLevel.GCSE,
            isCore: true
          },
          {
            subjectName: 'Physics',
            qualificationLevel: QualificationLevel.GCSE,
            examBoard: 'Edexcel',
            isCore: false,
            targetGrade: 'B'
          }
        ],
        timezone: 'Europe/London'
      };

      const result = enhancedStudentProfileSchema.safeParse(profileData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.subjectInterests).toHaveLength(2);
        expect(result.data.subjectInterests[0].subjectName).toBe('Mathematics');
        expect(result.data.subjectInterests[1].examBoard).toBe('Edexcel');
      }
    });
  });

  describe('School Information Validation', () => {
    it('should accept valid school information', () => {
      const validData = {
        ukYearGroup: UKYearGroup.YEAR_12,
        schoolName: 'St. Mary\'s Grammar School',
        schoolType: SchoolType.STATE_GRAMMAR,
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      const result = enhancedStudentProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.schoolName).toBe('St. Mary\'s Grammar School');
        expect(result.data.schoolType).toBe('STATE_GRAMMAR');
      }
    });

    it('should reject school name that is too long', () => {
      const invalidData = {
        ukYearGroup: UKYearGroup.YEAR_10,
        schoolName: 'A'.repeat(201), // Too long
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      const result = enhancedStudentProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept all valid school types', () => {
      const schoolTypes = [
        SchoolType.STATE_COMPREHENSIVE,
        SchoolType.STATE_GRAMMAR,
        SchoolType.ACADEMY,
        SchoolType.FREE_SCHOOL,
        SchoolType.INDEPENDENT_SCHOOL,
        SchoolType.SIXTH_FORM_COLLEGE,
        SchoolType.FE_COLLEGE,
        SchoolType.INTERNATIONAL_SCHOOL,
        SchoolType.SPECIAL_SCHOOL,
        SchoolType.PUPIL_REFERRAL_UNIT,
        SchoolType.HOME_EDUCATED,
        SchoolType.OTHER
      ];

      schoolTypes.forEach(schoolType => {
        const data = {
          ukYearGroup: UKYearGroup.YEAR_10,
          schoolType,
          subjectInterests: [],
          timezone: 'Europe/London'
        };

        const result = enhancedStudentProfileSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Learning Information Validation', () => {
    it('should accept valid learning information', () => {
      const validData = {
        ukYearGroup: UKYearGroup.YEAR_10,
        learningGoals: 'Achieve excellent grades in GCSE examinations and prepare for A-Level studies',
        specialNeeds: 'Dyslexia - requires additional time for written work',
        preferredLearningStyle: 'VISUAL' as const,
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      const result = enhancedStudentProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.learningGoals).toBe('Achieve excellent grades in GCSE examinations and prepare for A-Level studies');
        expect(result.data.specialNeeds).toBe('Dyslexia - requires additional time for written work');
        expect(result.data.preferredLearningStyle).toBe('VISUAL');
      }
    });

    it('should reject learning goals that are too long', () => {
      const invalidData = {
        ukYearGroup: UKYearGroup.YEAR_10,
        learningGoals: 'A'.repeat(1001), // Too long
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      const result = enhancedStudentProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept all valid learning styles', () => {
      const learningStyles = ['VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING_WRITING', 'MULTIMODAL'] as const;

      learningStyles.forEach(style => {
        const data = {
          ukYearGroup: UKYearGroup.YEAR_10,
          preferredLearningStyle: style,
          subjectInterests: [],
          timezone: 'Europe/London'
        };

        const result = enhancedStudentProfileSchema.safeParse(data);
        expect(result.success).toBe(true);
        
        if (result.success) {
          expect(result.data.preferredLearningStyle).toBe(style);
        }
      });
    });
  });

  describe('Timezone and Parent ID Validation', () => {
    it('should default timezone to Europe/London', () => {
      const dataWithoutTimezone = {
        ukYearGroup: UKYearGroup.YEAR_10,
        subjectInterests: []
      };

      const result = enhancedStudentProfileSchema.safeParse(dataWithoutTimezone);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.timezone).toBe('Europe/London');
      }
    });

    it('should accept custom timezone', () => {
      const dataWithTimezone = {
        ukYearGroup: UKYearGroup.YEAR_10,
        timezone: 'America/New_York',
        subjectInterests: []
      };

      const result = enhancedStudentProfileSchema.safeParse(dataWithTimezone);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.timezone).toBe('America/New_York');
      }
    });

    it('should accept valid parent ID', () => {
      const validParentId = '123e4567-e89b-12d3-a456-426614174000';
      const dataWithParent = {
        ukYearGroup: UKYearGroup.YEAR_10,
        parentId: validParentId,
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      const result = enhancedStudentProfileSchema.safeParse(dataWithParent);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.parentId).toBe(validParentId);
      }
    });

    it('should reject invalid parent ID format', () => {
      const invalidData = {
        ukYearGroup: UKYearGroup.YEAR_10,
        parentId: 'invalid-uuid-format',
        subjectInterests: [],
        timezone: 'Europe/London'
      };

      const result = enhancedStudentProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Qualification Level Validation', () => {
    it('should accept all valid qualification levels', () => {
      const qualificationLevels = [
        QualificationLevel.EARLY_YEARS,
        QualificationLevel.PRIMARY,
        QualificationLevel.KS1,
        QualificationLevel.KS2,
        QualificationLevel.KS3,
        QualificationLevel.GCSE,
        QualificationLevel.IGCSE,
        QualificationLevel.A_LEVEL,
        QualificationLevel.AS_LEVEL,
        QualificationLevel.BTEC_LEVEL_1,
        QualificationLevel.BTEC_LEVEL_2,
        QualificationLevel.BTEC_LEVEL_3,
        QualificationLevel.IB_PYP,
        QualificationLevel.IB_MYP,
        QualificationLevel.IB_DP_SL,
        QualificationLevel.IB_DP_HL,
        QualificationLevel.IB_CP,
        QualificationLevel.UNDERGRADUATE,
        QualificationLevel.POSTGRADUATE,
        QualificationLevel.ADULT_EDUCATION,
        QualificationLevel.OTHER
      ];

      qualificationLevels.forEach(level => {
        const subject = {
          subjectName: 'Test Subject',
          qualificationLevel: level,
          isCore: false
        };

        const result = subjectInterestSchema.safeParse(subject);
        expect(result.success).toBe(true);
        
        if (result.success) {
          expect(result.data.qualificationLevel).toBe(level);
        }
      });
    });
  });

  describe('Partial Updates', () => {
    it('should accept partial updates with updateEnhancedStudentProfileSchema', () => {
      const { updateEnhancedStudentProfileSchema } = require('../src/types/validation');
      
      const partialUpdate = {
        schoolName: 'New School Name'
      };

      const result = updateEnhancedStudentProfileSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.schoolName).toBe('New School Name');
        expect(result.data.ukYearGroup).toBeUndefined();
      }
    });

    it('should still validate constraints in partial updates', () => {
      const { updateEnhancedStudentProfileSchema } = require('../src/types/validation');
      
      const invalidPartialUpdate = {
        ukYearGroup: UKYearGroup.YEAR_10,
        ibProgramme: IBProgramme.DP, // Still invalid to have both
        ibYear: 1
      };

      const result = updateEnhancedStudentProfileSchema.safeParse(invalidPartialUpdate);
      expect(result.success).toBe(false);
    });
  });
}); 