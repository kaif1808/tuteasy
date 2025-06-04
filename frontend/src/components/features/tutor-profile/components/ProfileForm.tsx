import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2 } from 'lucide-react';
// import { Button } from '../../../ui/Button';
import { TutorProfileService, tutorProfileKeys } from '../services/tutorProfileService';
import type { TutorProfile } from '../types';
import { AGE_GROUP_OPTIONS, LANGUAGE_OPTIONS, TeachingPreference } from '../types';

// Validation schema
const profileSchema = z.object({
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(1000, 'Bio cannot exceed 1000 characters'),
  hourlyRateMin: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : parseFloat(String(val))),
    z.number().min(5, 'Minimum rate must be at least £5').optional()
  ),
  hourlyRateMax: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : parseFloat(String(val))),
    z.number().min(5, 'Maximum rate must be at least £5').optional()
  ),
  teachingPreference: z.nativeEnum(TeachingPreference),
  ageGroupSpecialization: z.array(z.string()),
  languageProficiencies: z.array(z.string()),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile?: TutorProfile | null;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: profile?.bio || '',
      hourlyRateMin: profile?.hourlyRateMin ?? undefined,
      hourlyRateMax: profile?.hourlyRateMax ?? undefined,
      teachingPreference: profile?.teachingPreference || TeachingPreference.BOTH,
      ageGroupSpecialization: profile?.ageGroupSpecialization || [],
      languageProficiencies: profile?.languageProficiencies || [],
    },
  });

  const watchedAgeGroups = watch('ageGroupSpecialization');
  const watchedLanguages = watch('languageProficiencies');
  const bio = watch('bio');

  // Update or create mutation
  const saveMutation = useMutation({
    mutationFn: (data: ProfileFormData) => {
      // Ensure hourly rates are numbers or undefined
      const processedData = {
        ...data,
        hourlyRateMin: data.hourlyRateMin === undefined ? undefined : Number(data.hourlyRateMin),
        hourlyRateMax: data.hourlyRateMax === undefined ? undefined : Number(data.hourlyRateMax),
      };

      if (profile) {
        return TutorProfileService.updateProfile(processedData);
      } else {
        return TutorProfileService.createProfile(processedData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.profile() });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    saveMutation.mutate(data);
  };

  const handleAgeGroupChange = (ageGroup: string, isChecked: boolean) => {
    const currentAgeGroups = watchedAgeGroups || [];
    if (isChecked) {
      setValue('ageGroupSpecialization', [...currentAgeGroups, ageGroup], { shouldDirty: true });
    } else {
      setValue('ageGroupSpecialization', currentAgeGroups.filter(group => group !== ageGroup), { shouldDirty: true });
    }
  };

  const handleLanguageChange = (language: string, isChecked: boolean) => {
    const currentLanguages = watchedLanguages || [];
    if (isChecked) {
      setValue('languageProficiencies', [...currentLanguages, language], { shouldDirty: true });
    } else {
      setValue('languageProficiencies', currentLanguages.filter(lang => lang !== language), { shouldDirty: true });
    }
  };

  const bioWordCount = bio ? bio.trim().split(/\s+/).length : 0;
  const bioCharCount = bio ? bio.length : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Professional Bio */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Bio *
          </label>
          <textarea
            {...register('bio')}
            rows={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell students and parents about your teaching background, experience, and approach. What makes you a great tutor?"
          />
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-gray-500">
              {bioCharCount}/1000 characters • {bioWordCount} words
            </div>
            {errors.bio && (
              <p className="text-sm text-red-600">{errors.bio.message}</p>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Write an engaging bio that showcases your expertise and teaching style. Students and parents read this first!
          </p>
        </div>
      </div>

      {/* Hourly Rates */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Hourly Rates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Rate (£/hour)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">£</span>
              <input
                type="number"
                min="5"
                max="500"
                step="0.01"
                {...register('hourlyRateMin', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="25.00"
              />
            </div>
            {errors.hourlyRateMin && (
              <p className="text-sm text-red-600 mt-1">{errors.hourlyRateMin.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Rate (£/hour)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">£</span>
              <input
                type="number"
                min="5"
                max="500"
                step="0.01"
                {...register('hourlyRateMax', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="45.00"
              />
            </div>
            {errors.hourlyRateMax && (
              <p className="text-sm text-red-600 mt-1">{errors.hourlyRateMax.message}</p>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Set a range to attract different types of students. You can set specific rates per subject later.
        </p>
      </div>

      {/* Teaching Preference */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Teaching Preference</h3>
        <div className="space-y-2">
          {[
            { value: 'ONLINE', label: 'Online Only', description: 'Video calls, online whiteboards, screen sharing' },
            { value: 'IN_PERSON', label: 'In-Person Only', description: 'Face-to-face sessions at your location or theirs' },
            { value: 'BOTH', label: 'Both Online & In-Person', description: 'Flexible - students can choose their preference' },
          ].map((option) => (
            <label key={option.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                {...register('teachingPreference')}
                value={option.value}
                className="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-500">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Age Group Specialization */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Age Group Specialization</h3>
        <p className="text-sm text-gray-500">Select the age groups you prefer to teach (optional but recommended)</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AGE_GROUP_OPTIONS.map((ageGroup) => (
            <label key={ageGroup} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={watchedAgeGroups?.includes(ageGroup) || false}
                onChange={(e) => handleAgeGroupChange(ageGroup, e.target.checked)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{ageGroup}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Language Proficiencies */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Language Proficiencies</h3>
        <p className="text-sm text-gray-500">Select languages you can teach in (optional)</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LANGUAGE_OPTIONS.map((language) => (
            <label key={language} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={watchedLanguages?.includes(language) || false}
                onChange={(e) => handleLanguageChange(language, e.target.checked)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{language}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={!isDirty || isSubmitting || saveMutation.isPending}
          className="min-w-[120px] inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </>
          )}
        </button>
      </div>

      {/* Success/Error Messages */}
      {saveMutation.isSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">Profile saved successfully!</p>
        </div>
      )}

      {saveMutation.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            Failed to save profile: {saveMutation.error.message}
          </p>
        </div>
      )}
    </form>
  );
}; 