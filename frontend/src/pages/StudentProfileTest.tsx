import React from 'react';
import { StudentProfileForm } from '../components/features/student-profile/components/StudentProfileForm';
import type { StudentProfileFormData } from '../components/features/student-profile/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';

export const StudentProfileTest: React.FC = () => {
  const [submittedData, setSubmittedData] = React.useState<StudentProfileFormData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (data: StudentProfileFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmittedData(data);
      console.log('✅ Student Profile Form submitted successfully:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('❌ Student Profile Form submission failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetTest = () => {
    setSubmittedData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Profile Form Test</CardTitle>
              <CardDescription>
                Testing the complete StudentProfileForm component functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={resetTest}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Reset Test
                </button>
                <div className="text-sm text-gray-600 self-center">
                  Form state: {submittedData ? '✅ Submitted' : '⏳ Waiting for submission'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-600">❌ Test Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Success Display */}
          {submittedData && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-600">✅ Form Submitted Successfully!</CardTitle>
                <CardDescription>The form data was captured correctly:</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-white p-4 rounded border overflow-auto">
                  {JSON.stringify(submittedData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* The Actual StudentProfileForm Component */}
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">
              📋 StudentProfileForm Component Test Area
            </h3>
            <StudentProfileForm
              initialData={submittedData || {}}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              isEditing={!!submittedData}
            />
          </div>

          {/* Test Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Test Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Fill out the student profile form above</li>
                <li>Try different combinations of fields</li>
                <li>Test form validation by leaving fields empty</li>
                <li>Add and remove subjects of interest</li>
                <li>Submit the form to see the captured data</li>
                <li>Use "Reset Test" to start over</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 