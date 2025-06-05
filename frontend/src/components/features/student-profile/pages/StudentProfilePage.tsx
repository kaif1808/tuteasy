import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, AlertCircle, CheckCircle } from 'lucide-react';

import { Button } from '../../../ui/Button';
import { useToast, ToastContainer } from '../../../ui/Toast';
import { UKIBStudentProfileForm } from '../components/UKIBStudentProfileForm';
import { 
  EnhancedStudentProfileService,
  enhancedStudentProfileKeys 
} from '../services/enhancedStudentProfileService';
import type { 
  EnhancedStudentProfileFormData,
  EnhancedStudentProfile 
} from '../types/ukIbTypes';

interface StudentProfilePageProps {
  mode?: 'create' | 'edit';
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({
  mode = 'create'
}) => {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const queryClient = useQueryClient();

  // Query to get existing profile (for edit mode)
  const {
    data: existingProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: enhancedStudentProfileKeys.profile(),
    queryFn: EnhancedStudentProfileService.getProfile,
    enabled: mode === 'edit',
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (profile doesn't exist)
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: EnhancedStudentProfileService.createProfile,
    onSuccess: (data: EnhancedStudentProfile) => {
      queryClient.setQueryData(enhancedStudentProfileKeys.profile(), data);
      addToast({
        type: 'success',
        title: 'Profile Created Successfully',
        message: 'Your student profile has been created with UK/IB academic information.',
      });
      // Navigate to dashboard or profile view
      navigate('/dashboard/student');
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Failed to Create Profile',
        message: error.response?.data?.message || 'An error occurred while creating your profile. Please try again.',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: EnhancedStudentProfileService.updateProfile,
    onSuccess: (data: EnhancedStudentProfile) => {
      queryClient.setQueryData(enhancedStudentProfileKeys.profile(), data);
      addToast({
        type: 'success',
        title: 'Profile Updated Successfully',
        message: 'Your student profile has been updated with the latest information.',
      });
      // Navigate back or stay on page
      navigate('/dashboard/student');
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Failed to Update Profile',
        message: error.response?.data?.message || 'An error occurred while updating your profile. Please try again.',
      });
    },
  });

  const handleSubmit = (data: EnhancedStudentProfileFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isEditing = mode === 'edit';

  // Show loading state for edit mode while fetching existing profile
  if (isEditing && isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading your profile...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if profile loading failed (and it's not a 404)
  if (isEditing && profileError && (profileError as any)?.response?.status !== 404) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-medium text-red-900">Error Loading Profile</h3>
                <p className="text-red-700 mt-1">
                  Unable to load your student profile. Please try again later.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleBack} variant="outline">
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Edit Student Profile' : 'Create Student Profile'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing 
                  ? 'Update your academic information and learning preferences'
                  : 'Set up your academic profile with UK Year Groups or IB Programmes'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Success message for profile creation */}
        {!isEditing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Welcome to TutEasy!
                </h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Let's set up your student profile to help us match you with the best tutors. 
                  Choose your academic level using either the UK educational system (Year Groups) 
                  or International Baccalaureate programmes, then add your subject interests.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile completion status for edit mode */}
        {isEditing && existingProfile && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Profile Completeness: {existingProfile.profileCompleteness}%
                  </p>
                  <p className="text-xs text-green-700">
                    Keep your profile updated to get the best tutor recommendations
                  </p>
                </div>
              </div>
              <div className="w-16 h-2 bg-green-200 rounded-full">
                <div 
                  className="h-2 bg-green-600 rounded-full transition-all duration-300"
                  style={{ width: `${existingProfile.profileCompleteness}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <UKIBStudentProfileForm
          initialData={existingProfile || {}}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isEditing={isEditing}
        />

        {/* Help Section */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">UK Educational System</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• <strong>Year Groups:</strong> From Nursery (age 3) to Year 13 (age 18)</li>
                <li>• <strong>Key Stages:</strong> Different educational phases with specific curricula</li>
                <li>• <strong>Qualifications:</strong> GCSEs (Year 10-11), A-Levels (Year 12-13)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">International Baccalaureate</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• <strong>PYP:</strong> Primary Years Programme (ages 3-12)</li>
                <li>• <strong>MYP:</strong> Middle Years Programme (ages 11-16)</li>
                <li>• <strong>DP:</strong> Diploma Programme (ages 16-19)</li>
                <li>• <strong>CP:</strong> Career-related Programme (ages 16-19)</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              If you're unsure about your academic level or need assistance, 
              our support team is here to help. You can always update your profile later.
            </p>
          </div>
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </div>
  );
}; 