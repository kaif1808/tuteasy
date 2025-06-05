import { z } from 'zod';

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

// Parent profile creation schema
export const createParentProfileSchema = z.object({
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
  communicationPreference: z.array(z.enum(['EMAIL', 'SMS', 'PHONE']))
    .min(1, 'Please select at least one communication preference')
    .default(['EMAIL']),
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

// Parent profile update schema (all fields optional)
export const updateParentProfileSchema = z.object({
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
  communicationPreference: z.array(z.enum(['EMAIL', 'SMS', 'PHONE']))
    .min(1, 'Please select at least one communication preference')
    .optional(),
  timezone: z.string()
    .min(1, 'Please select a timezone')
    .optional(),
}).partial();

// Type inference
export type CreateParentProfileData = z.infer<typeof createParentProfileSchema>;
export type UpdateParentProfileData = z.infer<typeof updateParentProfileSchema>;

// Helper function to calculate profile completeness
export const calculateParentProfileCompleteness = (data: Partial<CreateParentProfileData>): number => {
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
  
  if (data.firstName?.trim()) completedFields++;
  if (data.lastName?.trim()) completedFields++;
  if (data.phoneNumber?.trim()) completedFields++;
  if (data.occupation?.trim()) completedFields++;
  if (data.emergencyContact?.name?.trim() || data.emergencyContact?.phoneNumber?.trim()) completedFields++;
  if (data.communicationPreference && data.communicationPreference.length > 0) completedFields++;
  if (data.timezone?.trim()) completedFields++;
  
  return Math.round((completedFields / totalFields) * 100);
}; 