import { Tutor, TutorSubject, TutorQualification } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { 
  updateTutorProfileSchema, 
  createSubjectSchema, 
  updateSubjectSchema,
  createQualificationSchema 
} from '../types/validation';
import { z } from 'zod';

export class TutorProfileService {
  // Get tutor profile by user ID
  async getTutorProfile(userId: string): Promise<Tutor | null> {
    const tutor = await prisma.tutor.findUnique({
      where: { userId },
      include: {
        subjects: {
          orderBy: { createdAt: 'desc' },
        },
        qualifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return tutor;
  }

  // Create or update tutor profile
  async updateTutorProfile(
    userId: string, 
    data: z.infer<typeof updateTutorProfileSchema>
  ): Promise<Tutor> {
    // Calculate profile completeness
    const completeness = this.calculateProfileCompleteness(data);

    const tutor = await prisma.tutor.upsert({
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
        subjects: true,
        qualifications: true,
      },
    });

    return tutor;
  }

  // Upload profile image
  async updateProfileImage(userId: string, imageUrl: string, imageKey: string): Promise<Tutor> {
    const tutor = await prisma.tutor.update({
      where: { userId },
      data: {
        profileImageUrl: imageUrl,
        profileImageKey: imageKey,
      },
    });

    return tutor;
  }

  // Delete profile image
  async deleteProfileImage(userId: string): Promise<Tutor> {
    const tutor = await prisma.tutor.update({
      where: { userId },
      data: {
        profileImageUrl: null,
        profileImageKey: null,
      },
    });

    return tutor;
  }

  // Subject management
  async getSubjects(tutorId: string): Promise<TutorSubject[]> {
    return prisma.tutorSubject.findMany({
      where: { tutorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSubject(
    tutorId: string, 
    data: z.infer<typeof createSubjectSchema>
  ): Promise<TutorSubject> {
    return prisma.tutorSubject.create({
      data: {
        tutorId,
        ...data,
      },
    });
  }

  async updateSubject(
    id: string, 
    tutorId: string,
    data: z.infer<typeof updateSubjectSchema>
  ): Promise<TutorSubject> {
    return prisma.tutorSubject.update({
      where: { 
        id,
        tutorId, // Ensure tutor owns the subject
      },
      data,
    });
  }

  async deleteSubject(id: string, tutorId: string): Promise<void> {
    await prisma.tutorSubject.delete({
      where: { 
        id,
        tutorId,
      },
    });
  }

  // Qualification management
  async getQualifications(tutorId: string): Promise<TutorQualification[]> {
    return prisma.tutorQualification.findMany({
      where: { tutorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createQualification(
    tutorId: string,
    data: z.infer<typeof createQualificationSchema>,
    documentUrl?: string,
    documentKey?: string
  ): Promise<TutorQualification> {
    return prisma.tutorQualification.create({
      data: {
        tutorId,
        ...data,
        documentUrl,
        documentKey,
      },
    });
  }

  async deleteQualification(id: string, tutorId: string): Promise<void> {
    await prisma.tutorQualification.delete({
      where: { 
        id,
        tutorId,
      },
    });
  }

  // Helper method to calculate profile completeness
  private calculateProfileCompleteness(data: z.infer<typeof updateTutorProfileSchema>): number {
    const fieldsToCheck: Array<keyof z.infer<typeof updateTutorProfileSchema>> = [
      'bio',
      'hourlyRateMin',
      'hourlyRateMax',
      'teachingPreference',
      'ageGroupSpecialization',
      'languageProficiencies',
    ];

    let filledFieldsCount = 0;
    for (const key of fieldsToCheck) {
      const value = data[key];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
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