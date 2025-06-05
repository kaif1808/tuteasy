import { z } from 'zod';
import { QualificationType } from '../types';

// Frontend qualification form validation schema
export const qualificationFormSchema = z.object({
  qualificationType: z.nativeEnum(QualificationType, {
    errorMap: () => ({ message: 'Please select a qualification type' }),
  }),
  institution: z.string().max(255, 'Institution name must be less than 255 characters').optional(),
  qualificationName: z.string()
    .min(1, 'Qualification name is required')
    .max(255, 'Qualification name must be less than 255 characters'),
  issueDate: z.string()
    .min(1, 'Issue date is required')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
    }, 'Issue date must be a valid date in the past or present'),
  expiryDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Expiry date must be a valid date'),
  document: z.instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      return file.size <= 10 * 1024 * 1024; // 10MB limit
    }, 'File size must be less than 10MB')
    .refine((file) => {
      if (!file) return true;
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      return allowedTypes.includes(file.type);
    }, 'File must be a PDF, JPEG, or PNG'),
}).refine(
  (data) => {
    if (data.issueDate && data.expiryDate) {
      return new Date(data.issueDate) < new Date(data.expiryDate);
    }
    return true;
  },
  {
    message: 'Issue date must be before expiry date',
    path: ['expiryDate'],
  }
);

export type QualificationFormData = z.infer<typeof qualificationFormSchema>;

// Helper function to format qualification type for display
export const formatQualificationType = (type: QualificationType): string => {
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

// Qualification type options for select component
export const QUALIFICATION_TYPE_OPTIONS = [
  { value: QualificationType.DEGREE, label: 'Degree' },
  { value: QualificationType.TEACHING_CERTIFICATION, label: 'Teaching Certification' },
  { value: QualificationType.DBS_CHECK, label: 'DBS Check' },
  { value: QualificationType.PROFESSIONAL_CERTIFICATION, label: 'Professional Certification' },
  { value: QualificationType.OTHER, label: 'Other' },
]; 