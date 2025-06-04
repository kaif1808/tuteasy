import React from 'react';
import { StudentProfileForm } from '../components/features/student-profile/components/StudentProfileForm';
import type { StudentProfileFormData } from '../components/features/student-profile/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { toast } from '../utils/toast';

export const StudentProfileDemo: React.FC = () => {
  const [savedProfile, setSavedProfile] = React.useState<StudentProfileFormData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: StudentProfileFormData) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSavedProfile(data);
      setIsLoading(false);
      toast.success('Student profile saved successfully! (Demo mode)');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Student Profile Management
            </h1>
            <p className="text-lg text-gray-600">
              Demo of the comprehensive student profile system for TutEasy
            </p>
            <p className="text-sm text-blue-600 bg-blue-50 rounded-lg p-3">
              🎯 This is a demo version - no authentication required. Try filling out the form!
            </p>
          </div>

          {/* Saved Profile Preview */}
          {savedProfile && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">✅ Profile Saved Successfully!</CardTitle>
                <CardDescription className="text-green-600">
                  Here's a preview of the saved student profile data:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Grade Level:</strong> {savedProfile.gradeLevel || 'Not specified'}
                  </div>
                  <div>
                    <strong>School:</strong> {savedProfile.schoolName || 'Not specified'}
                  </div>
                  <div>
                    <strong>Timezone:</strong> {savedProfile.timezone || 'UTC'}
                  </div>
                  <div>
                    <strong>Learning Style:</strong> {savedProfile.preferredLearningStyle?.replace('_', ' ') || 'Not specified'}
                  </div>
                  <div className="md:col-span-2">
                    <strong>Subjects of Interest:</strong> {savedProfile.subjectsOfInterest?.length > 0 ? savedProfile.subjectsOfInterest.join(', ') : 'None selected'}
                  </div>
                  {savedProfile.learningGoals && (
                    <div className="md:col-span-2">
                      <strong>Learning Goals:</strong> {savedProfile.learningGoals}
                    </div>
                  )}
                  {savedProfile.specialNeeds && (
                    <div className="md:col-span-2">
                      <strong>Special Accommodations:</strong> {savedProfile.specialNeeds}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    📚
                  </div>
                  <div>
                    <h3 className="font-semibold">Academic Information</h3>
                    <p className="text-sm text-gray-600">Grade level, school, and subjects</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    🎯
                  </div>
                  <div>
                    <h3 className="font-semibold">Learning Preferences</h3>
                    <p className="text-sm text-gray-600">Learning style and goals</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    ♿
                  </div>
                  <div>
                    <h3 className="font-semibold">Accessibility</h3>
                    <p className="text-sm text-gray-600">Special accommodations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <StudentProfileForm
            initialData={savedProfile || {}}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isEditing={!!savedProfile}
          />

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>🔧 Technical Implementation</CardTitle>
              <CardDescription>
                Key features and technologies used in this student profile system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">✅ Frontend Features</h4>
                  <ul className="text-sm space-y-1">
                    <li>• React Hook Form with Zod validation</li>
                    <li>• TypeScript for type safety</li>
                    <li>• Responsive design with Tailwind CSS</li>
                    <li>• Dynamic subject selection</li>
                    <li>• Accessibility-focused UI components</li>
                    <li>• Real-time form validation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">🔐 Backend Features</h4>
                  <ul className="text-sm space-y-1">
                    <li>• RESTful API with Express.js</li>
                    <li>• PostgreSQL database with Prisma ORM</li>
                    <li>• JWT authentication & authorization</li>
                    <li>• Input validation & sanitization</li>
                    <li>• GDPR/FERPA compliance features</li>
                    <li>• Parent-child profile linking</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 