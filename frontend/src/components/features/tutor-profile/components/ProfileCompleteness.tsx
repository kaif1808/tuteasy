import React from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import type { TutorProfile } from '../types';

interface ProfileCompletenessProps {
  profile: TutorProfile | null;
}

interface CompletionItem {
  id: string;
  label: string;
  description: string;
  isComplete: boolean;
  isRequired: boolean;
}

export const ProfileCompleteness: React.FC<ProfileCompletenessProps> = ({ profile }) => {
  const completionItems: CompletionItem[] = [
    {
      id: 'basic-info',
      label: 'Basic Information',
      description: 'Bio and teaching preferences',
      isComplete: !!(profile?.bio && profile.bio.length >= 50),
      isRequired: true,
    },
    {
      id: 'profile-image',
      label: 'Profile Image',
      description: 'Professional headshot',
      isComplete: !!profile?.profileImageUrl,
      isRequired: true,
    },
    {
      id: 'hourly-rate',
      label: 'Hourly Rates',
      description: 'Set your pricing',
      isComplete: !!(profile?.hourlyRateMin && profile?.hourlyRateMax),
      isRequired: true,
    },
    {
      id: 'subjects',
      label: 'Teaching Subjects',
      description: 'At least one subject with experience',
      isComplete: !!(profile?.subjects && profile.subjects.length > 0),
      isRequired: true,
    },
    {
      id: 'qualifications',
      label: 'Qualifications',
      description: 'Educational background and certifications',
      isComplete: !!(profile?.qualifications && profile.qualifications.length > 0),
      isRequired: true,
    },
    {
      id: 'age-groups',
      label: 'Age Group Specialization',
      description: 'Target student age groups',
      isComplete: !!(profile?.ageGroupSpecialization && profile.ageGroupSpecialization.length > 0),
      isRequired: false,
    },
    {
      id: 'languages',
      label: 'Language Proficiencies',
      description: 'Languages you can teach in',
      isComplete: !!(profile?.languageProficiencies && profile.languageProficiencies.length > 0),
      isRequired: false,
    },
  ];

  const requiredItems = completionItems.filter(item => item.isRequired);
  const completedRequired = requiredItems.filter(item => item.isComplete).length;
  const completedAll = completionItems.filter(item => item.isComplete).length;
  
  const requiredProgress = (completedRequired / requiredItems.length) * 100;
  const overallProgress = (completedAll / completionItems.length) * 100;

  const getStatusIcon = (item: CompletionItem) => {
    if (item.isComplete) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (item.isRequired) {
      return <AlertCircle className="w-5 h-5 text-orange-500" />;
    }
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 80) return 'bg-blue-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Profile Completeness</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{Math.round(overallProgress)}%</div>
          <div className="text-sm text-gray-500">Complete</div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>{completedAll} of {completionItems.length} completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(overallProgress)}`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Required Items Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Required Items</span>
          <span>{completedRequired} of {requiredItems.length} completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(requiredProgress)}`}
            style={{ width: `${requiredProgress}%` }}
          />
        </div>
      </div>

      {/* Completion Checklist */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Checklist</h4>
        {completionItems.map((item) => (
          <div key={item.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(item)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className={`text-sm font-medium ${item.isComplete ? 'text-green-700' : 'text-gray-900'}`}>
                  {item.label}
                </p>
                {item.isRequired && (
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                    Required
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {requiredProgress === 100 ? (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-sm font-medium text-green-800">
              Great! Your profile meets all requirements
            </p>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Your profile is ready to attract students. Consider completing optional sections to stand out more.
          </p>
        </div>
      ) : (
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <p className="text-sm font-medium text-orange-800">
              Complete required sections to activate your profile
            </p>
          </div>
          <p className="text-sm text-orange-700 mt-1">
            Your profile needs to be {Math.round(requiredProgress)}% complete before students can find you.
          </p>
        </div>
      )}
    </div>
  );
}; 