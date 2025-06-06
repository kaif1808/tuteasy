import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit, User, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '../../../ui/Button';
import { ParentProfileForm } from '../components/ParentProfileForm';
import { ParentProfileService, parentProfileKeys } from '../services/parentProfileService';
import { useToast, ToastContainer } from '../../../ui/Toast';

import { 
  type ParentProfile, 
  type ParentProfileFormData,
  type EmergencyContact,
  CommunicationPreference
} from '../types';

export const ParentProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toasts, addToast, removeToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Query to get existing profile
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: parentProfileKeys.profile(),
    queryFn: ParentProfileService.getProfile,
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (profile doesn't exist)
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Set editing mode if no profile exists
  useEffect(() => {
    if (!isLoading && !profile) {
      setIsEditing(true);
    }
  }, [isLoading, profile]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: ParentProfileService.createProfile,
    onSuccess: (data: ParentProfile) => {
      queryClient.setQueryData(parentProfileKeys.profile(), data);
      addToast({
        type: 'success',
        title: 'Profile Created Successfully',
        message: 'Your parent profile has been created successfully.',
      });
      setIsEditing(false);
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
    mutationFn: ParentProfileService.updateProfile,
    onSuccess: (data: ParentProfile) => {
      queryClient.setQueryData(parentProfileKeys.profile(), data);
      addToast({
        type: 'success',
        title: 'Profile Updated Successfully',
        message: 'Your parent profile has been updated successfully.',
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Failed to Update Profile',
        message: error.response?.data?.message || 'An error occurred while updating your profile. Please try again.',
      });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Transform ParentProfile to form data format
  const transformProfileToFormData = (profile: ParentProfile): ParentProfileFormData => {
    let emergencyContact: EmergencyContact | undefined;
    
    try {
      if (profile.emergencyContact) {
        emergencyContact = typeof profile.emergencyContact === 'string' 
          ? JSON.parse(profile.emergencyContact)
          : profile.emergencyContact;
      }
    } catch (error) {
      console.warn('Failed to parse emergency contact data:', error);
      emergencyContact = undefined;
    }

    return {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phoneNumber: profile.phoneNumber || '',
      occupation: profile.occupation || '',
      emergencyContact: emergencyContact || undefined,
      communicationPreference: profile.communicationPreference.map(pref => pref as CommunicationPreference) || [CommunicationPreference.EMAIL],
      timezone: profile.timezone || 'Europe/London',
    };
  };

  const handleFormSubmit = (data: ParentProfileFormData) => {
    if (profile) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state (only if not a 404)
  if (error && (error as any)?.response?.status !== 404) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Profile</h2>
          <p className="text-gray-600 mb-4">
            There was an error loading your profile. Please try again.
          </p>
          <div className="space-x-3">
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
            <Button variant="outline" onClick={handleBackClick}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formInitialData = profile ? transformProfileToFormData(profile) : {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={handleBackClick}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center">
                <User className="h-6 w-6 text-blue-600 mr-2" />
                <h1 className="text-xl font-semibold text-gray-900">
                  {profile ? 'Manage Your Profile' : 'Create Your Profile'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Edit toggle for existing profiles */}
              {profile && !isEditing && (
                <Button
                  variant="outline"
                  onClick={handleEditToggle}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Form or View */}
        {isEditing ? (
          <ParentProfileForm
            initialData={formInitialData}
            onSubmit={handleFormSubmit}
            isLoading={isSubmitting}
            isEditing={!!profile}
          />
        ) : (
          // Profile View Mode (for existing profiles)
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
                <Button onClick={handleEditToggle}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
              
              {profile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Name</h3>
                    <p className="text-gray-900">
                      {profile.firstName || profile.lastName 
                        ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
                        : 'Not provided'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h3>
                    <p className="text-gray-900">{profile.phoneNumber || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Occupation</h3>
                    <p className="text-gray-900">{profile.occupation || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Timezone</h3>
                    <p className="text-gray-900">{profile.timezone}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Communication Preferences</h3>
                    <p className="text-gray-900">
                      {profile.communicationPreference.length > 0 
                        ? profile.communicationPreference.join(', ')
                        : 'Email'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Profile Completeness</h3>
                    <p className="text-gray-900">{Math.round(profile.profileCompleteness)}%</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}; 