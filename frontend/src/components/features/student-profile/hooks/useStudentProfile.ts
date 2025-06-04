import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentProfileApi } from '../services/studentProfileApi';
import type { StudentProfileFormData } from '../types';

// Query keys for React Query
export const studentProfileKeys = {
  all: ['studentProfile'] as const,
  profile: () => [...studentProfileKeys.all, 'profile'] as const,
  student: (id: string) => [...studentProfileKeys.all, 'student', id] as const,
  children: () => [...studentProfileKeys.all, 'children'] as const,
};

// Hook to get current user's student profile
export const useStudentProfile = () => {
  return useQuery({
    queryKey: studentProfileKeys.profile(),
    queryFn: studentProfileApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 (profile doesn't exist)
      if (error.message.includes('not found')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook to create student profile
export const useCreateStudentProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentProfileApi.createProfile,
    onSuccess: (newProfile) => {
      // Update the profile cache
      queryClient.setQueryData(studentProfileKeys.profile(), newProfile);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: studentProfileKeys.all });
    },
    onError: (error) => {
      console.error('Failed to create student profile:', error);
    },
  });
};

// Hook to update student profile
export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentProfileApi.updateProfile,
    onSuccess: (updatedProfile) => {
      // Update the profile cache
      queryClient.setQueryData(studentProfileKeys.profile(), updatedProfile);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: studentProfileKeys.all });
    },
    onError: (error) => {
      console.error('Failed to update student profile:', error);
    },
  });
};

// Hook to delete student profile
export const useDeleteStudentProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentProfileApi.deleteProfile,
    onSuccess: () => {
      // Remove the profile from cache
      queryClient.removeQueries({ queryKey: studentProfileKeys.profile() });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: studentProfileKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete student profile:', error);
    },
  });
};

// Hook to get specific student profile (for parents/tutors)
export const useGetStudentProfile = (studentId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: studentProfileKeys.student(studentId),
    queryFn: () => studentProfileApi.getStudentProfile(studentId),
    enabled: enabled && !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get children profiles (for parents)
export const useChildrenProfiles = (enabled: boolean = true) => {
  return useQuery({
    queryKey: studentProfileKeys.children(),
    queryFn: studentProfileApi.getChildrenProfiles,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to link parent
export const useLinkParent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentProfileApi.linkParent,
    onSuccess: (updatedProfile) => {
      // Update the profile cache
      queryClient.setQueryData(studentProfileKeys.profile(), updatedProfile);
      
      // Invalidate children profiles cache if needed
      queryClient.invalidateQueries({ queryKey: studentProfileKeys.children() });
    },
    onError: (error) => {
      console.error('Failed to link parent:', error);
    },
  });
};

// Hook to unlink parent
export const useUnlinkParent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentProfileApi.unlinkParent,
    onSuccess: (updatedProfile) => {
      // Update the profile cache
      queryClient.setQueryData(studentProfileKeys.profile(), updatedProfile);
      
      // Invalidate children profiles cache if needed
      queryClient.invalidateQueries({ queryKey: studentProfileKeys.children() });
    },
    onError: (error) => {
      console.error('Failed to unlink parent:', error);
    },
  });
};

// Combined hook for creating or updating profile
export const useUpsertStudentProfile = () => {
  const createMutation = useCreateStudentProfile();
  const updateMutation = useUpdateStudentProfile();

  return {
    ...createMutation,
    mutateAsync: async (data: StudentProfileFormData & { isCreating?: boolean }) => {
      const { isCreating, ...profileData } = data;
      
      if (isCreating) {
        return createMutation.mutateAsync(profileData);
      } else {
        return updateMutation.mutateAsync(profileData);
      }
    },
    isPending: createMutation.isPending || updateMutation.isPending,
  };
}; 