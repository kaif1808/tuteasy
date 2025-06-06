import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Phone, Briefcase, Users, MessageSquare, Clock, AlertCircle, CheckCircle } from 'lucide-react';

import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Select, SelectItem } from '../../../ui/Select';

import { 
  parentProfileSchema,
  calculateProfileCompleteness,
  type ParentProfileFormData 
} from '../utils/validation';

import {
  CommunicationPreference,
  COMMUNICATION_PREFERENCE_OPTIONS,
  TIMEZONE_OPTIONS,
} from '../types';
// import type { EmergencyContact } from '../types';

interface ParentProfileFormProps {
  initialData?: Partial<ParentProfileFormData>;
  onSubmit: (data: ParentProfileFormData) => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const ParentProfileForm: React.FC<ParentProfileFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading = false,
  isEditing = false,
}) => {
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [showEmergencyContact, setShowEmergencyContact] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
    // trigger,
  } = useForm<ParentProfileFormData>({
    resolver: zodResolver(parentProfileSchema),
    defaultValues: {
      firstName: initialData.firstName || '',
      lastName: initialData.lastName || '',
      phoneNumber: initialData.phoneNumber || '',
      occupation: initialData.occupation || '',
      emergencyContact: initialData.emergencyContact || {
        name: '',
        relationship: '',
        phoneNumber: '',
        email: '',
      },
      communicationPreference: initialData.communicationPreference || [CommunicationPreference.EMAIL],
      timezone: initialData.timezone || 'Europe/London',
    },
  });

  const watchedValues = watch();

  // Update profile completeness when form values change
  useEffect(() => {
    const completeness = calculateProfileCompleteness(watchedValues);
    setProfileCompleteness(completeness);
  }, [watchedValues]);

  // Show emergency contact section if any emergency contact data exists
  useEffect(() => {
    const emergencyContact = watchedValues.emergencyContact;
    if (emergencyContact?.name || emergencyContact?.phoneNumber || emergencyContact?.email || emergencyContact?.relationship) {
      setShowEmergencyContact(true);
    }
  }, [watchedValues.emergencyContact]);

  const handleFormSubmit = (data: ParentProfileFormData) => {
    // Clean up empty emergency contact
    if (data.emergencyContact && 
        !data.emergencyContact.name?.trim() && 
        !data.emergencyContact.phoneNumber?.trim() && 
        !data.emergencyContact.email?.trim() && 
        !data.emergencyContact.relationship?.trim()) {
      data.emergencyContact = undefined;
    }

    onSubmit(data);
  };

  const handleCommunicationPreferenceChange = (preference: CommunicationPreference) => {
    const currentPreferences = watchedValues.communicationPreference || [];
    const newPreferences = currentPreferences.includes(preference)
      ? currentPreferences.filter(p => p !== preference)
      : [...currentPreferences, preference];
    
    setValue('communicationPreference', newPreferences, { shouldValidate: true });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Completeness Indicator */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-blue-900">Profile Completeness</h3>
          <span className="text-sm font-medium text-blue-900">{profileCompleteness}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${profileCompleteness}%` }}
          />
        </div>
        <p className="text-xs text-blue-700 mt-2">
          Complete your profile to help tutors understand your family's needs better.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder="Enter your first name"
                error={errors.firstName?.message}
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder="Enter your last name"
                error={errors.lastName?.message}
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Phone className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                type="tel"
                {...register('phoneNumber')}
                placeholder="+44 20 1234 5678"
                error={errors.phoneNumber?.message}
              />
              <p className="text-xs text-gray-500 mt-1">
                Include country code for international numbers
              </p>
            </div>
            
            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                <Briefcase className="h-4 w-4 inline mr-1" />
                Occupation
              </label>
              <Input
                id="occupation"
                {...register('occupation')}
                placeholder="e.g., Software Engineer, Teacher, Doctor"
                error={errors.occupation?.message}
              />
            </div>
          </div>
        </div>

        {/* Communication Preferences Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Communication Preferences</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How would you like tutors to contact you? (Select all that apply)
              </label>
              <div className="space-y-2">
                {COMMUNICATION_PREFERENCE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={watchedValues.communicationPreference?.includes(option.value) || false}
                      onChange={() => handleCommunicationPreferenceChange(option.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.communicationPreference && (
                <p className="mt-1 text-sm text-red-600">{errors.communicationPreference.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="h-4 w-4 inline mr-1" />
                Timezone
              </label>
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {TIMEZONE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
              {errors.timezone && (
                <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Emergency Contact</h2>
              <span className="text-sm text-gray-500 ml-2">(Optional)</span>
            </div>
            {!showEmergencyContact && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowEmergencyContact(true)}
              >
                Add Emergency Contact
              </Button>
            )}
          </div>
          
          {showEmergencyContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <Input
                    id="emergencyContactName"
                    {...register('emergencyContact.name')}
                    placeholder="Full name"
                    error={errors.emergencyContact?.name?.message}
                  />
                </div>
                
                <div>
                  <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <Input
                    id="emergencyContactRelationship"
                    {...register('emergencyContact.relationship')}
                    placeholder="e.g., Spouse, Parent, Sibling"
                    error={errors.emergencyContact?.relationship?.message}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    {...register('emergencyContact.phoneNumber')}
                    placeholder="+44 20 1234 5678"
                    error={errors.emergencyContact?.phoneNumber?.message}
                  />
                </div>
                
                <div>
                  <label htmlFor="emergencyContactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="emergencyContactEmail"
                    type="email"
                    {...register('emergencyContact.email')}
                    placeholder="email@example.com"
                    error={errors.emergencyContact?.email?.message}
                  />
                </div>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEmergencyContact(false);
                  setValue('emergencyContact', {});
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Remove Emergency Contact
              </Button>
            </div>
          )}
        </div>

        {/* Submit Section */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center text-sm text-gray-600">
            {profileCompleteness === 100 ? (
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600 mr-1" />
            )}
            Profile {profileCompleteness}% complete
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={isLoading || !isDirty}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                isEditing ? 'Update Profile' : 'Create Profile'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}; 