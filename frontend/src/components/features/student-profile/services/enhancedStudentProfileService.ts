import { api } from '../../../../services/api';
import type {
  EnhancedStudentProfile,
  EnhancedStudentProfileFormData,
} from '../types/ukIbTypes';

export class EnhancedStudentProfileService {
  // Get current user's enhanced student profile
  static async getProfile(): Promise<EnhancedStudentProfile> {
    const response = await api.get<{ success: boolean; data: EnhancedStudentProfile }>('/students/profile');
    return response.data.data;
  }

  // Create a new enhanced student profile
  static async createProfile(data: EnhancedStudentProfileFormData): Promise<EnhancedStudentProfile> {
    const response = await api.post<{ success: boolean; data: EnhancedStudentProfile }>('/students/profile', data);
    return response.data.data;
  }

  // Update existing enhanced student profile
  static async updateProfile(data: Partial<EnhancedStudentProfileFormData>): Promise<EnhancedStudentProfile> {
    const response = await api.put<{ success: boolean; data: EnhancedStudentProfile }>('/students/profile', data);
    return response.data.data;
  }

  // Delete student profile
  static async deleteProfile(): Promise<void> {
    await api.delete('/students/profile');
  }

  // Get specific student profile (for parents/tutors with access)
  static async getStudentProfile(studentId: string): Promise<EnhancedStudentProfile> {
    const response = await api.get<{ success: boolean; data: EnhancedStudentProfile }>(`/students/profile/${studentId}`);
    return response.data.data;
  }

  // Get children profiles (for parents)
  static async getChildrenProfiles(): Promise<EnhancedStudentProfile[]> {
    const response = await api.get<{ success: boolean; data: EnhancedStudentProfile[] }>('/students/children');
    return response.data.data;
  }

  // Link parent to student profile
  static async linkParent(parentId: string): Promise<EnhancedStudentProfile> {
    const response = await api.post<{ success: boolean; data: EnhancedStudentProfile }>('/students/link-parent', { parentId });
    return response.data.data;
  }

  // Unlink parent from student profile
  static async unlinkParent(): Promise<EnhancedStudentProfile> {
    const response = await api.delete<{ success: boolean; data: EnhancedStudentProfile }>('/students/link-parent');
    return response.data.data;
  }

  // Get available subjects for academic level
  static async getAvailableSubjects(
    ukYearGroup?: string,
    ibProgramme?: string
  ): Promise<string[]> {
    const params = new URLSearchParams();
    if (ukYearGroup) params.append('ukYearGroup', ukYearGroup);
    if (ibProgramme) params.append('ibProgramme', ibProgramme);
    
    const response = await api.get<{ success: boolean; data: string[] }>(`/students/available-subjects?${params}`);
    return response.data.data;
  }

  // Get available qualification levels for academic level
  static async getAvailableQualificationLevels(
    ukYearGroup?: string,
    ibProgramme?: string
  ): Promise<string[]> {
    const params = new URLSearchParams();
    if (ukYearGroup) params.append('ukYearGroup', ukYearGroup);
    if (ibProgramme) params.append('ibProgramme', ibProgramme);
    
    const response = await api.get<{ success: boolean; data: string[] }>(`/students/qualification-levels?${params}`);
    return response.data.data;
  }
}

// React Query Keys
export const enhancedStudentProfileKeys = {
  all: ['enhancedStudentProfile'] as const,
  profile: () => [...enhancedStudentProfileKeys.all, 'profile'] as const,
  children: () => [...enhancedStudentProfileKeys.all, 'children'] as const,
  subjects: (ukYearGroup?: string, ibProgramme?: string) => 
    [...enhancedStudentProfileKeys.all, 'subjects', { ukYearGroup, ibProgramme }] as const,
  qualificationLevels: (ukYearGroup?: string, ibProgramme?: string) => 
    [...enhancedStudentProfileKeys.all, 'qualificationLevels', { ukYearGroup, ibProgramme }] as const,
}; 