import type { 
  StudentProfile, 
  StudentProfileFormData,
  ApiError 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get authorization headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API errors
const handleApiError = async (response: Response): Promise<never> => {
  const errorData: ApiError = await response.json().catch(() => ({
    error: 'An unexpected error occurred',
  }));
  
  throw new Error(errorData.error || 'An unexpected error occurred');
};

export const studentProfileApi = {
  // Get current user's student profile
  async getProfile(): Promise<StudentProfile> {
    const response = await fetch(`${API_BASE_URL}/api/v1/student/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  },

  // Create a new student profile
  async createProfile(data: StudentProfileFormData): Promise<StudentProfile> {
    const response = await fetch(`${API_BASE_URL}/api/v1/student/profile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  },

  // Update existing student profile
  async updateProfile(data: StudentProfileFormData): Promise<StudentProfile> {
    const response = await fetch(`${API_BASE_URL}/api/v1/student/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  },

  // Delete student profile
  async deleteProfile(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/student/profile`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      await handleApiError(response);
    }
  },

  // Get specific student profile (for parents/tutors with access)
  async getStudentProfile(studentId: string): Promise<StudentProfile> {
    const response = await fetch(`${API_BASE_URL}/api/v1/student/profile/${studentId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  },

  // Get children profiles (for parents)
  async getChildrenProfiles(): Promise<StudentProfile[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/student/children`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  },

  // Link parent to student profile
  async linkParent(parentId: string): Promise<StudentProfile> {
    const response = await fetch(`${API_BASE_URL}/api/v1/student/link-parent`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ parentId }),
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  },

  // Unlink parent from student profile
  async unlinkParent(): Promise<StudentProfile> {
    const response = await fetch(`${API_BASE_URL}/api/v1/student/link-parent`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  },
}; 