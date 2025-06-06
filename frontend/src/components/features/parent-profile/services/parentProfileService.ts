import { api } from '../../../../services/api';
import type {
  ParentProfile,
  ParentProfileFormData,
  CreateParentProfileRequest,
} from '../types';

export class ParentProfileService {
  // Get parent profile
  static async getProfile(): Promise<ParentProfile> {
    const response = await api.get<{ success: boolean; data: ParentProfile }>('/profiles/parent');
    return response.data.data;
  }

  // Create parent profile
  static async createProfile(data: ParentProfileFormData): Promise<ParentProfile> {
    // Transform form data to API format
    const apiData: CreateParentProfileRequest = {
      firstName: data.firstName?.trim() || undefined,
      lastName: data.lastName?.trim() || undefined,
      phoneNumber: data.phoneNumber?.trim() || undefined,
      occupation: data.occupation?.trim() || undefined,
      emergencyContact: data.emergencyContact ? JSON.stringify(data.emergencyContact) : undefined,
      communicationPreference: data.communicationPreference,
      timezone: data.timezone,
    };

    const response = await api.post<{ success: boolean; data: ParentProfile }>('/profiles/parent', apiData);
    return response.data.data;
  }

  // Update parent profile
  static async updateProfile(data: ParentProfileFormData): Promise<ParentProfile> {
    // Transform form data to API format
    const apiData: Partial<CreateParentProfileRequest> = {
      firstName: data.firstName?.trim() || undefined,
      lastName: data.lastName?.trim() || undefined,
      phoneNumber: data.phoneNumber?.trim() || undefined,
      occupation: data.occupation?.trim() || undefined,
      emergencyContact: data.emergencyContact ? JSON.stringify(data.emergencyContact) : undefined,
      communicationPreference: data.communicationPreference,
      timezone: data.timezone,
    };

    const response = await api.put<{ success: boolean; data: ParentProfile }>('/profiles/parent', apiData);
    return response.data.data;
  }

  // Delete parent profile
  static async deleteProfile(): Promise<void> {
    await api.delete('/profiles/parent');
  }

  // Get profile completeness
  static async getProfileCompleteness(): Promise<{ completeness: number }> {
    const response = await api.get<{ success: boolean; data: { completeness: number } }>('/profiles/parent/completeness');
    return response.data.data;
  }
}

// React Query keys
export const parentProfileKeys = {
  all: ['parentProfile'] as const,
  profile: () => [...parentProfileKeys.all, 'profile'] as const,
  completeness: () => [...parentProfileKeys.all, 'completeness'] as const,
}; 