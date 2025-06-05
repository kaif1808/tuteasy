import { ParentProfile } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { 
  CreateParentProfileData, 
  UpdateParentProfileData,
  calculateParentProfileCompleteness 
} from '../validation/parentProfile.validation';

export class ParentProfileService {
  // Get parent profile by user ID
  async getParentProfile(userId: string): Promise<ParentProfile | null> {
    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId },
    });

    return parentProfile;
  }

  // Create parent profile
  async createParentProfile(
    userId: string, 
    data: CreateParentProfileData
  ): Promise<ParentProfile> {
    // Convert emergency contact object to JSON string for database storage
    const emergencyContactString = data.emergencyContact 
      ? JSON.stringify(data.emergencyContact) 
      : null;

    // Calculate profile completeness
    const completeness = calculateParentProfileCompleteness(data);

    const parentProfile = await prisma.parentProfile.create({
      data: {
        userId,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phoneNumber: data.phoneNumber || null,
        occupation: data.occupation || null,
        emergencyContact: emergencyContactString,
        communicationPreference: data.communicationPreference,
        timezone: data.timezone,
        profileCompleteness: completeness,
      },
    });

    return parentProfile;
  }

  // Update parent profile
  async updateParentProfile(
    userId: string, 
    data: UpdateParentProfileData
  ): Promise<ParentProfile> {
    // Get existing profile to merge data
    const existingProfile = await this.getParentProfile(userId);
    
    if (!existingProfile) {
      throw new Error('Parent profile not found');
    }

    // Convert emergency contact object to JSON string for database storage if provided
    let emergencyContactString: string | null | undefined = undefined;
    if (data.emergencyContact !== undefined) {
      emergencyContactString = data.emergencyContact 
        ? JSON.stringify(data.emergencyContact) 
        : null;
    }

    // Prepare update data, only including defined fields
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.firstName !== undefined) updateData.firstName = data.firstName || null;
    if (data.lastName !== undefined) updateData.lastName = data.lastName || null;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber || null;
    if (data.occupation !== undefined) updateData.occupation = data.occupation || null;
    if (emergencyContactString !== undefined) updateData.emergencyContact = emergencyContactString;
    if (data.communicationPreference !== undefined) updateData.communicationPreference = data.communicationPreference;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;

    // Calculate new profile completeness with merged data
    const mergedData = {
      firstName: updateData.firstName !== undefined ? updateData.firstName : existingProfile.firstName,
      lastName: updateData.lastName !== undefined ? updateData.lastName : existingProfile.lastName,
      phoneNumber: updateData.phoneNumber !== undefined ? updateData.phoneNumber : existingProfile.phoneNumber,
      occupation: updateData.occupation !== undefined ? updateData.occupation : existingProfile.occupation,
      emergencyContact: updateData.emergencyContact !== undefined 
        ? (updateData.emergencyContact ? JSON.parse(updateData.emergencyContact) : null)
        : (existingProfile.emergencyContact ? JSON.parse(existingProfile.emergencyContact) : null),
      communicationPreference: updateData.communicationPreference !== undefined 
        ? updateData.communicationPreference 
        : existingProfile.communicationPreference,
      timezone: updateData.timezone !== undefined ? updateData.timezone : existingProfile.timezone,
    };

    updateData.profileCompleteness = calculateParentProfileCompleteness(mergedData);

    const parentProfile = await prisma.parentProfile.update({
      where: { userId },
      data: updateData,
    });

    return parentProfile;
  }

  // Delete parent profile (soft delete by setting user role if needed in future)
  async deleteParentProfile(userId: string): Promise<void> {
    await prisma.parentProfile.delete({
      where: { userId },
    });
  }

  // Check if parent profile exists
  async parentProfileExists(userId: string): Promise<boolean> {
    const profile = await prisma.parentProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    
    return !!profile;
  }

  // Get profile completeness percentage
  async getProfileCompleteness(userId: string): Promise<number> {
    const profile = await this.getParentProfile(userId);
    return profile ? profile.profileCompleteness : 0;
  }
} 