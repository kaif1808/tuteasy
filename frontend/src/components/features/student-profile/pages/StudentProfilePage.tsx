import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../../../utils/toast';
import { StudentProfileForm } from '../components/StudentProfileForm';
import { useStudentProfile, useUpsertStudentProfile } from '../hooks/useStudentProfile';
import type { StudentProfileFormData } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Skeleton } from '../../../ui/Skeleton';
import { AlertCircle, User, BookOpen, Target } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useStudentProfile();
  const upsertMutation = useUpsertStudentProfile();

  const handleSubmit = async (data: StudentProfileFormData) => {
    try {
      const isCreating = !profile;
      await upsertMutation.mutateAsync({ ...data, isCreating });
      
      toast.success(
        isCreating ? 'Student profile created successfully!' : 'Student profile updated successfully!'
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save student profile'
      );
    }
  };

  const handleViewOnlyMode = () => {
    // Navigate to read-only view or dashboard
    navigate('/dashboard');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !error.message.includes('not found')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Error Loading Profile
              </CardTitle>
              <CardDescription>
                There was an error loading your student profile. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Student Profile</h1>
          <p className="text-gray-600">
            {profile 
              ? 'Manage your academic information and learning preferences' 
              : 'Create your student profile to get started with personalized tutoring'
            }
          </p>
        </div>

        {/* Profile Completeness Indicator */}
        {profile && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Profile Completeness</h3>
                    <p className="text-sm text-gray-600">
                      Complete your profile to improve tutor matching
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {profile.profileCompleteness}%
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${profile.profileCompleteness}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats for existing profile */}
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Subjects of Interest</p>
                    <p className="font-semibold">
                      {profile.subjectsOfInterest?.length || 0} selected
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Learning Goals</p>
                    <p className="font-semibold">
                      {profile.learningGoals ? 'Defined' : 'Not set'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Grade Level</p>
                    <p className="font-semibold">
                      {profile.gradeLevel || 'Not specified'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Form */}
        <StudentProfileForm
          initialData={profile || {}}
          onSubmit={handleSubmit}
          isLoading={upsertMutation.isPending}
          isEditing={!!profile}
        />

        {/* Additional Actions */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Actions</CardTitle>
              <CardDescription>
                Other actions you can take with your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={handleViewOnlyMode}
                >
                  View Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Navigate to find tutors page
                    navigate('/find-tutors');
                  }}
                >
                  Find Tutors
                </Button>
                {profile.parent && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Navigate to parent dashboard
                      navigate('/parent-dashboard');
                    }}
                  >
                    Parent Dashboard
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}; 