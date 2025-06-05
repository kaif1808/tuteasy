import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Edit, User, AlertCircle, CheckCircle } from 'lucide-react';

import { Button } from '../../../ui/Button';
import { ParentProfileForm } from '../components/ParentProfileForm';

import { 
  type ParentProfile, 
  type ParentProfileFormData,
  type EmergencyContact,
  CommunicationPreference
} from '../types';

interface ParentProfilePageProps {
  // These will be connected to API calls and React Query later
  initialProfile?: ParentProfile | null;
  isLoading?: boolean;
  error?: string | null;
}

export const ParentProfilePage: React.FC<ParentProfilePageProps> = ({
  initialProfile = null,
  isLoading = false,
  error = null,
}) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(!initialProfile); // Auto-edit mode for new profiles
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

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

  // Transform form data to API request format
  const transformFormDataToRequest = (data: ParentProfileFormData) => {
    return {
      firstName: data.firstName?.trim() || undefined,
      lastName: data.lastName?.trim() || undefined,
      phoneNumber: data.phoneNumber?.trim() || undefined,
      occupation: data.occupation?.trim() || undefined,
      emergencyContact: data.emergencyContact ? JSON.stringify(data.emergencyContact) : undefined,
      communicationPreference: data.communicationPreference,
      timezone: data.timezone,
    };
  };

  // Placeholder API functions - to be replaced with actual API calls
  const createParentProfile = async (data: any): Promise<ParentProfile> => {
    console.log('API Call: Creating parent profile with data:', data);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate success response
    return {
      id: 'temp-id-' + Date.now(),
      userId: 'current-user-id',
      ...data,
      emergencyContact: data.emergencyContact || undefined,
      profileCompleteness: 85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const updateParentProfile = async (data: any): Promise<ParentProfile> => {
    console.log('API Call: Updating parent profile with data:', data);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate success response
    return {
      ...initialProfile!,
      ...data,
      profileCompleteness: 90,
      updatedAt: new Date().toISOString(),
    };
  };

  const handleFormSubmit = async (data: ParentProfileFormData) => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const requestData = transformFormDataToRequest(data);
      
      if (initialProfile) {
        // Update existing profile
        const updatedProfile = await updateParentProfile(requestData);
        console.log('Profile updated successfully:', updatedProfile);
      } else {
        // Create new profile
        const newProfile = await createParentProfile(requestData);
        console.log('Profile created successfully:', newProfile);
      }
      
      setSaveSuccess(true);
      setIsEditing(false);
      
      // TODO: Invalidate React Query cache and update data
      // queryClient.invalidateQueries(['parentProfile']);
      
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-3">
            <Button onClick={() => window.location.reload()}>
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

  const formInitialData = initialProfile ? transformProfileToFormData(initialProfile) : {};

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
                  {initialProfile ? 'Manage Your Profile' : 'Create Your Profile'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Success indicator */}
              {saveSuccess && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">Saved!</span>
                </div>
              )}
              
              {/* Edit toggle for existing profiles */}
              {initialProfile && !isEditing && (
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
        {/* Error Message */}
        {saveError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-800">Error saving profile</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{saveError}</p>
          </div>
        )}

        {/* Profile Form or View */}
        {isEditing ? (
          <ParentProfileForm
            initialData={formInitialData}
            onSubmit={handleFormSubmit}
            isLoading={isSaving}
            isEditing={!!initialProfile}
          />
        ) : (
          // Profile View Mode (for existing profiles)
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Profile</h2>
                <Button
                  variant="outline"
                  onClick={handleEditToggle}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Name</h3>
                  <p className="text-gray-900">
                    {[initialProfile?.firstName, initialProfile?.lastName].filter(Boolean).join(' ') || 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Phone Number</h3>
                  <p className="text-gray-900">{initialProfile?.phoneNumber || 'Not provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Occupation</h3>
                  <p className="text-gray-900">{initialProfile?.occupation || 'Not provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Timezone</h3>
                  <p className="text-gray-900">{initialProfile?.timezone || 'UTC'}</p>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Communication Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {initialProfile?.communicationPreference.map((pref) => (
                      <span
                        key={pref}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {pref}
                      </span>
                    )) || <span className="text-gray-500">Not provided</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 