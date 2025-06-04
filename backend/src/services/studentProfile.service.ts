import { StudentProfile } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { 
  updateStudentProfileSchema, 
  createStudentProfileSchema 
} from '../types/validation';
import { z } from 'zod';

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

  // Create or update student profile
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

  // Create student profile (called during registration or as separate step)
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

  // Helper method to calculate profile completeness
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
} 