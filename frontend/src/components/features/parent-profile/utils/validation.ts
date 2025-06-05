import { z } from 'zod';
import { CommunicationPreference } from '../types';

// Emergency contact validation schema
const emergencyContactSchema = z.object({
  name: z.string()
    .max(100, 'Emergency contact name must be less than 100 characters')
    .optional(),
  relationship: z.string()
    .max(50, 'Relationship must be less than 50 characters')
    .optional(),
  phoneNumber: z.string()
    .regex(/^[\+]?[(]?[\d\s\-\(\)]{7,20}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
}).optional();

// Parent profile validation schema
export const parentProfileSchema = z.object({
  firstName: z.string()
    .max(50, 'First name must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  lastName: z.string()
    .max(50, 'Last name must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  phoneNumber: z.string()
    .regex(/^[\+]?[(]?[\d\s\-\(\)]{7,20}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  occupation: z.string()
    .max(100, 'Occupation must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  emergencyContact: emergencyContactSchema,
  communicationPreference: z.array(z.nativeEnum(CommunicationPreference))
    .min(1, 'Please select at least one communication preference')
    .default([CommunicationPreference.EMAIL]),
  timezone: z.string()
    .min(1, 'Please select a timezone')
    .default('Europe/London'),
}).refine(
  (data) => {
    // At least first name or last name should be provided for better user experience
    if (!data.firstName?.trim() && !data.lastName?.trim()) {
      return false;
    }
    return true;
  },
  {
    message: 'Please provide either a first name or last name',
    path: ['firstName'],
  }
);

export type ParentProfileFormData = z.infer<typeof parentProfileSchema>;

// Helper function to validate phone number format
export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone || phone.trim() === '') return true; // Optional field
  const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{7,20}$/;
  return phoneRegex.test(phone);
};

// Helper function to validate email format
export const isValidEmail = (email: string): boolean => {
  if (!email || email.trim() === '') return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to calculate profile completeness
export const calculateProfileCompleteness = (profile: Partial<ParentProfileFormData>): number => {
  const fields = [
    'firstName',
    'lastName', 
    'phoneNumber',
    'occupation',
    'emergencyContact',
    'communicationPreference',
    'timezone'
  ];
  
  let completedFields = 0;
  const totalFields = fields.length;
  
  if (profile.firstName?.trim()) completedFields++;
  if (profile.lastName?.trim()) completedFields++;
  if (profile.phoneNumber?.trim()) completedFields++;
  if (profile.occupation?.trim()) completedFields++;
  if (profile.emergencyContact?.name?.trim() || profile.emergencyContact?.phoneNumber?.trim()) completedFields++;
  if (profile.communicationPreference && profile.communicationPreference.length > 0) completedFields++;
  if (profile.timezone?.trim()) completedFields++;
  
  return Math.round((completedFields / totalFields) * 100);
}; 