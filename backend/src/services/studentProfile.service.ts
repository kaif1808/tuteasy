import { StudentProfile } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { 
  updateStudentProfileSchema, 
  createStudentProfileSchema,
  createEnhancedStudentProfileSchema,
  updateEnhancedStudentProfileSchema,
  subjectInterestSchema
} from '../types/validation';
import { z } from 'zod';

// Type definitions for enhanced subject interests
interface SubjectInterest {
  subjectName: string;
  qualificationLevel: string;
  examBoard?: string;
  isCore: boolean;
  targetGrade?: string;
}

export class StudentProfileService {
  // Get student profile by user ID
  async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        parent: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return studentProfile;
  }

  // Create or update student profile (legacy)
  async updateStudentProfile(
    userId: string, 
    data: z.infer<typeof updateStudentProfileSchema>
  ): Promise<StudentProfile> {
    // Calculate profile completeness
    const completeness = this.calculateProfileCompleteness(data);

    const studentProfile = await prisma.studentProfile.upsert({
      where: { userId },
      update: {
        ...data,
        profileCompleteness: completeness,
        updatedAt: new Date(),
      },
      create: {
        userId,
        ...data,
        profileCompleteness: completeness,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        parent: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return studentProfile;
  }

  // Create student profile (legacy)
  async createStudentProfile(
    userId: string, 
    data: z.infer<typeof createStudentProfileSchema>
  ): Promise<StudentProfile> {
    const completeness = this.calculateProfileCompleteness(data);

    const studentProfile = await prisma.studentProfile.create({
      data: {
        userId,
        ...data,
        profileCompleteness: completeness,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        parent: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return studentProfile;
  }

  // Enhanced create student profile for UK/IB system
  async createEnhancedStudentProfile(
    userId: string, 
    data: z.infer<typeof createEnhancedStudentProfileSchema>
  ): Promise<StudentProfile> {
    // Automatically derive UK Key Stage from UK Year Group
    const enhancedData = this.enhanceProfileData(data);
    
    // Calculate enhanced profile completeness
    const completeness = this.calculateEnhancedProfileCompleteness(enhancedData);

    // Convert complex subject interests to simple string array for database storage
    const dbData = this.prepareDataForDatabase(enhancedData, completeness);

    const studentProfile = await prisma.studentProfile.create({
      data: {
        userId,
        ...dbData,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        parent: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return studentProfile;
  }

  // Enhanced update student profile for UK/IB system
  async updateEnhancedStudentProfile(
    userId: string, 
    data: z.infer<typeof updateEnhancedStudentProfileSchema>
  ): Promise<StudentProfile> {
    // Get existing profile to merge with updates
    const existingProfile = await this.getStudentProfile(userId);
    if (!existingProfile) {
      throw new Error('Student profile not found');
    }

    // Merge existing data with updates
    const mergedData = this.mergeProfileData(existingProfile, data);
    
    // Automatically derive UK Key Stage from UK Year Group
    const enhancedData = this.enhanceProfileData(mergedData);
    
    // Calculate enhanced profile completeness
    const completeness = this.calculateEnhancedProfileCompleteness(enhancedData);

    // Convert complex subject interests to simple string array for database storage
    const dbData = this.prepareDataForDatabase(enhancedData, completeness);

    const studentProfile = await prisma.studentProfile.update({
      where: { userId },
      data: {
        ...dbData,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        parent: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return studentProfile;
  }

  // Delete student profile
  async deleteStudentProfile(userId: string): Promise<void> {
    await prisma.studentProfile.delete({
      where: { userId },
    });
  }

  // Get profiles by parent ID (for parents managing multiple children)
  async getStudentProfilesByParent(parentId: string): Promise<StudentProfile[]> {
    return prisma.studentProfile.findMany({
      where: { parentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Verify user has access to profile (student owns it or is parent)
  async verifyAccess(profileUserId: string, requestingUserId: string): Promise<boolean> {
    // If requesting user is the profile owner
    if (profileUserId === requestingUserId) {
      return true;
    }

    // Check if requesting user is the parent of this student
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: profileUserId },
      select: { parentId: true },
    });

    return studentProfile?.parentId === requestingUserId;
  }

  // Link parent to student profile
  async linkParent(studentUserId: string, parentUserId: string): Promise<StudentProfile> {
    // Verify parent role
    const parent = await prisma.user.findUnique({
      where: { id: parentUserId },
      select: { role: true },
    });

    if (!parent || parent.role !== 'PARENT') {
      throw new Error('User must have PARENT role to be linked as parent');
    }

    return prisma.studentProfile.update({
      where: { userId: studentUserId },
      data: { parentId: parentUserId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        parent: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  // Unlink parent from student profile
  async unlinkParent(studentUserId: string): Promise<StudentProfile> {
    return prisma.studentProfile.update({
      where: { userId: studentUserId },
      data: { parentId: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  // Validate subject interests against academic level
  async validateSubjectInterests(
    subjectInterests: SubjectInterest[],
    ukYearGroup?: string,
    ibProgramme?: string
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const subject of subjectInterests) {
      try {
        subjectInterestSchema.parse(subject);
        
        // Additional validation based on academic level
        if (ukYearGroup) {
          const validationErrors = this.validateUKSubject(subject, ukYearGroup);
          errors.push(...validationErrors);
        }
        
        if (ibProgramme) {
          const validationErrors = this.validateIBSubject(subject, ibProgramme);
          errors.push(...validationErrors);
        }
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          errors.push(`Subject "${subject.subjectName}": ${validationError.errors[0]?.message}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper method to enhance profile data by automatically deriving fields
  private enhanceProfileData(data: any): any {
    const enhanced = { ...data };

    // Automatically derive UK Key Stage from UK Year Group
    if (enhanced.ukYearGroup && !enhanced.ukKeyStage) {
      enhanced.ukKeyStage = this.deriveUKKeyStage(enhanced.ukYearGroup);
    }

    // Generate academic level display
    if (enhanced.ukYearGroup) {
      enhanced.academicLevelDisplay = this.generateUKAcademicDisplay(enhanced.ukYearGroup);
    } else if (enhanced.ibProgramme && enhanced.ibYear) {
      enhanced.academicLevelDisplay = this.generateIBAcademicDisplay(enhanced.ibProgramme, enhanced.ibYear);
    }

    return enhanced;
  }

  // Helper method to merge existing profile data with updates
  private mergeProfileData(existingProfile: StudentProfile, updates: any): any {
    const currentSubjects = this.parseSubjectsOfInterest(existingProfile.subjectsOfInterest);
    
    // Cast to any to access new fields that may not be in the old type yet
    const profile = existingProfile as any;
    
    return {
      ukYearGroup: updates.ukYearGroup ?? profile.ukYearGroup,
      ukKeyStage: updates.ukKeyStage ?? profile.ukKeyStage,
      ibProgramme: updates.ibProgramme ?? profile.ibProgramme,
      ibYear: updates.ibYear ?? profile.ibYear,
      gradeLevel: updates.gradeLevel ?? existingProfile.gradeLevel,
      academicLevelDisplay: updates.academicLevelDisplay ?? profile.academicLevelDisplay,
      schoolName: updates.schoolName ?? existingProfile.schoolName,
      schoolType: updates.schoolType ?? profile.schoolType,
      subjectInterests: updates.subjectInterests ?? currentSubjects,
      learningGoals: updates.learningGoals ?? existingProfile.learningGoals,
      specialNeeds: updates.specialNeeds ?? existingProfile.specialNeeds,
      preferredLearningStyle: updates.preferredLearningStyle ?? existingProfile.preferredLearningStyle,
      timezone: updates.timezone ?? existingProfile.timezone,
      parentId: updates.parentId ?? existingProfile.parentId,
    };
  }

  // Helper method to prepare data for database storage
  private prepareDataForDatabase(data: any, completeness: number): any {
    const dbData = { ...data };
    
    // Convert complex subject interests to simple string array for storage
    if (data.subjectInterests && Array.isArray(data.subjectInterests)) {
      dbData.subjectsOfInterest = data.subjectInterests.map((subject: SubjectInterest) => 
        this.formatSubjectForStorage(subject)
      );
      delete dbData.subjectInterests;
    }

    dbData.profileCompleteness = completeness;

    return dbData;
  }

  // Helper method to derive UK Key Stage from UK Year Group
  private deriveUKKeyStage(ukYearGroup: string): string {
    const yearToKeyStageMap: Record<string, string> = {
      'NURSERY': 'EARLY_YEARS',
      'RECEPTION': 'EARLY_YEARS',
      'YEAR_1': 'KS1',
      'YEAR_2': 'KS1',
      'YEAR_3': 'KS2',
      'YEAR_4': 'KS2',
      'YEAR_5': 'KS2',
      'YEAR_6': 'KS2',
      'YEAR_7': 'KS3',
      'YEAR_8': 'KS3',
      'YEAR_9': 'KS3',
      'YEAR_10': 'KS4',
      'YEAR_11': 'KS4',
      'YEAR_12': 'KS5',
      'YEAR_13': 'KS5',
    };

    return yearToKeyStageMap[ukYearGroup] || 'KS3';
  }

  // Helper method to generate academic level display for UK system
  private generateUKAcademicDisplay(ukYearGroup: string): string {
    const displayMap: Record<string, string> = {
      'NURSERY': 'Nursery',
      'RECEPTION': 'Reception',
      'YEAR_1': 'Year 1',
      'YEAR_2': 'Year 2',
      'YEAR_3': 'Year 3',
      'YEAR_4': 'Year 4',
      'YEAR_5': 'Year 5',
      'YEAR_6': 'Year 6',
      'YEAR_7': 'Year 7',
      'YEAR_8': 'Year 8',
      'YEAR_9': 'Year 9',
      'YEAR_10': 'Year 10',
      'YEAR_11': 'Year 11',
      'YEAR_12': 'Year 12',
      'YEAR_13': 'Year 13',
    };

    return displayMap[ukYearGroup] || ukYearGroup;
  }

  // Helper method to generate academic level display for IB system
  private generateIBAcademicDisplay(ibProgramme: string, ibYear: number): string {
    const programmeNames: Record<string, string> = {
      'PYP': 'IB PYP',
      'MYP': 'IB MYP',
      'DP': 'IB Diploma Programme',
      'CP': 'IB Career-related Programme',
    };

    return `${programmeNames[ibProgramme] || ibProgramme} Year ${ibYear}`;
  }

  // Helper method to parse subjects of interest from database format
  private parseSubjectsOfInterest(subjectsArray: string[]): SubjectInterest[] {
    return subjectsArray.map(subjectString => {
      try {
        // Try to parse as JSON first (new format)
        return JSON.parse(subjectString);
      } catch {
        // Fall back to simple string format (legacy)
        return {
          subjectName: subjectString,
          qualificationLevel: 'OTHER',
          examBoard: undefined,
          isCore: false,
          targetGrade: undefined,
        };
      }
    });
  }

  // Helper method to format subject for storage
  private formatSubjectForStorage(subject: SubjectInterest): string {
    // Store as JSON string for rich data, but ensure compatibility
    return JSON.stringify(subject);
  }

  // Helper method to validate UK subjects
  private validateUKSubject(subject: SubjectInterest, ukYearGroup: string): string[] {
    const errors: string[] = [];
    
    // Example validation: A-Level subjects only for Year 12/13
    if (subject.qualificationLevel === 'A_LEVEL' && !['YEAR_12', 'YEAR_13'].includes(ukYearGroup)) {
      errors.push(`A-Level subjects are only available for Year 12 and Year 13 students`);
    }
    
    // GCSE subjects only for Year 10/11
    if (subject.qualificationLevel === 'GCSE' && !['YEAR_10', 'YEAR_11'].includes(ukYearGroup)) {
      errors.push(`GCSE subjects are only available for Year 10 and Year 11 students`);
    }

    return errors;
  }

  // Helper method to validate IB subjects
  private validateIBSubject(subject: SubjectInterest, ibProgramme: string): string[] {
    const errors: string[] = [];
    
    // Example validation: IB DP subjects only for DP programme
    if ((subject.qualificationLevel === 'IB_DP_SL' || subject.qualificationLevel === 'IB_DP_HL') && ibProgramme !== 'DP') {
      errors.push(`IB Diploma subjects are only available for DP programme students`);
    }

    return errors;
  }

  // Helper method to calculate profile completeness (legacy)
  private calculateProfileCompleteness(
    data: z.infer<typeof updateStudentProfileSchema> | z.infer<typeof createStudentProfileSchema>
  ): number {
    const fieldsToCheck = [
      'gradeLevel',
      'schoolName', 
      'subjectsOfInterest',
      'learningGoals',
      'preferredLearningStyle',
      'timezone',
    ];

    let filledFieldsCount = 0;
    for (const key of fieldsToCheck) {
      const value = data[key as keyof typeof data];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            filledFieldsCount++;
          }
        } else if (typeof value === 'string') {
          if (value.trim().length > 0) {
            filledFieldsCount++;
          }
        } else {
          filledFieldsCount++;
        }
      }
    }

    return Math.round((filledFieldsCount / fieldsToCheck.length) * 100);
  }

  // Enhanced method to calculate profile completeness for UK/IB profiles
  private calculateEnhancedProfileCompleteness(data: any): number {
    const fieldsToCheck = [
      // Academic level (either UK or IB)
      { key: 'academicLevel', check: () => data.ukYearGroup || data.ibProgramme },
      // School information
      { key: 'schoolName', check: () => data.schoolName },
      { key: 'schoolType', check: () => data.schoolType },
      // Subject interests
      { key: 'subjectInterests', check: () => data.subjectInterests && data.subjectInterests.length > 0 },
      // Learning preferences
      { key: 'learningGoals', check: () => data.learningGoals && data.learningGoals.trim().length > 0 },
      { key: 'preferredLearningStyle', check: () => data.preferredLearningStyle },
      // System fields
      { key: 'timezone', check: () => data.timezone },
    ];

    let filledFieldsCount = 0;
    for (const field of fieldsToCheck) {
      if (field.check()) {
        filledFieldsCount++;
      }
    }

    return Math.round((filledFieldsCount / fieldsToCheck.length) * 100);
  }
} 