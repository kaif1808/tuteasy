import { api } from '../../../../services/api';
import {
  TutorProfile,
  TutorProfileResponse,
  TutorSubject,
  TutorSubjectResponse,
  TutorSubjectFormData,
  TutorQualification,
  TutorQualificationResponse,
  TutorQualificationFormData,
  TutorProfileFormData,
  ProfileImageUploadResponse,
} from '../types';

export class TutorProfileService {
  // Profile Management
  static async getProfile(): Promise<TutorProfile> {
    const response = await api.get<TutorProfileResponse>('/tutors/profile');
    return response.data.data;
  }

  static async updateProfile(data: TutorProfileFormData): Promise<TutorProfile> {
    const response = await api.put<TutorProfileResponse>('/tutors/profile', data);
    return response.data.data;
  }

  static async createProfile(data: TutorProfileFormData): Promise<TutorProfile> {
    const response = await api.post<TutorProfileResponse>('/tutors/profile', data);
    return response.data.data;
  }

  // Profile Image Management
  static async uploadProfileImage(file: File): Promise<{ profileImageUrl: string; profileImageKey: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<ProfileImageUploadResponse>('/tutors/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  static async deleteProfileImage(): Promise<void> {
    await api.delete('/tutors/profile/image');
  }

  // Subject Management
  static async getSubjects(): Promise<TutorSubject[]> {
    const response = await api.get<{ success: boolean; data: TutorSubject[] }>('/tutors/subjects');
    return response.data.data;
  }

  static async createSubject(data: TutorSubjectFormData): Promise<TutorSubject> {
    const response = await api.post<TutorSubjectResponse>('/tutors/subjects', data);
    return response.data.data;
  }

  static async updateSubject(id: string, data: TutorSubjectFormData): Promise<TutorSubject> {
    const response = await api.put<TutorSubjectResponse>(`/tutors/subjects/${id}`, data);
    return response.data.data;
  }

  static async deleteSubject(id: string): Promise<void> {
    await api.delete(`/tutors/subjects/${id}`);
  }

  // Qualification Management
  static async getQualifications(): Promise<TutorQualification[]> {
    const response = await api.get<{ success: boolean; data: TutorQualification[] }>('/tutors/qualifications');
    return response.data.data;
  }

  static async createQualification(data: TutorQualificationFormData): Promise<TutorQualification> {
    const formData = new FormData();
    
    // Add text fields
    formData.append('qualificationType', data.qualificationType);
    formData.append('institution', data.institution);
    formData.append('qualificationName', data.qualificationName);
    formData.append('issueDate', data.issueDate);
    formData.append('expiryDate', data.expiryDate);
    
    // Add file if provided
    if (data.document) {
      formData.append('document', data.document);
    }

    const response = await api.post<TutorQualificationResponse>('/tutors/qualifications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  static async updateQualification(id: string, data: Partial<TutorQualificationFormData>): Promise<TutorQualification> {
    const response = await api.put<TutorQualificationResponse>(`/tutors/qualifications/${id}`, data);
    return response.data.data;
  }

  static async deleteQualification(id: string): Promise<void> {
    await api.delete(`/tutors/qualifications/${id}`);
  }
}

// React Query Hooks
export const tutorProfileKeys = {
  all: ['tutorProfile'] as const,
  profile: () => [...tutorProfileKeys.all, 'profile'] as const,
  subjects: () => [...tutorProfileKeys.all, 'subjects'] as const,
  qualifications: () => [...tutorProfileKeys.all, 'qualifications'] as const,
}; 