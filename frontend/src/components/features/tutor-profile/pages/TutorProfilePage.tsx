import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, FileText, GraduationCap, Camera, Loader2, AlertCircle } from 'lucide-react';
import { TutorProfileService, tutorProfileKeys } from '../services/tutorProfileService';
import { ProfileForm } from '../components/ProfileForm';
import { ProfileImageUpload } from '../components/ProfileImageUpload';
import { SubjectManager } from '../components/SubjectManager';
import { QualificationManager } from '../components/QualificationManager';
import { ProfileCompleteness } from '../components/ProfileCompleteness';

export const TutorProfilePage: React.FC = () => {
  // Fetch profile data
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: tutorProfileKeys.profile(),
    queryFn: TutorProfileService.getProfile,
    retry: false,
  });

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Failed to load profile</h2>
          <p className="text-gray-600 mb-4">
            We couldn't load your profile. This might be because you haven't created one yet.
          </p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tutor Profile</h1>
                <p className="text-gray-600">
                  Manage your professional profile to attract students
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Profile Completeness */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ProfileCompleteness profile={profile || null} />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Image Section */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Camera className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Profile Image</h2>
              </div>
              <ProfileImageUpload
                currentImageUrl={profile?.profileImageUrl}
                onImageUpdate={(imageUrl) => {
                  // Refresh profile data after image update
                  refetch();
                }}
                onImageDelete={() => {
                  // Refresh profile data after image deletion
                  refetch();
                }}
              />
            </div>

            {/* Basic Information Section */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              </div>
              <ProfileForm profile={profile} />
            </div>

            {/* Teaching Subjects Section */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <GraduationCap className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Teaching Subjects</h2>
              </div>
              <SubjectManager subjects={profile?.subjects || []} />
            </div>

            {/* Qualifications Section */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Qualifications & Certificates</h2>
              </div>
              <QualificationManager qualifications={profile?.qualifications || []} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Hint */}
      {profile && profile.profileCompleteness < 100 && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Complete your profile</p>
              <p className="text-xs text-blue-100">
                {Math.round(profile.profileCompleteness)}% complete. Finish to attract more students!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 