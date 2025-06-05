// Parent Profile Management Types

export interface ParentProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  occupation?: string;
  emergencyContact?: string; // JSON string
  communicationPreference: string[];
  timezone: string;
  profileCompleteness: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParentProfileFormData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  occupation?: string;
  emergencyContact?: EmergencyContact;
  communicationPreference: CommunicationPreference[];
  timezone: string;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  phoneNumber?: string;
  email?: string;
}

export enum CommunicationPreference {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PHONE = 'PHONE',
}

export const COMMUNICATION_PREFERENCE_OPTIONS = [
  { value: CommunicationPreference.EMAIL, label: 'Email' },
  { value: CommunicationPreference.SMS, label: 'SMS/Text' },
  { value: CommunicationPreference.PHONE, label: 'Phone Call' },
];

export const TIMEZONE_OPTIONS = [
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'UTC', label: 'UTC' },
];

// API Response types
export interface ParentProfileResponse {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  occupation?: string;
  emergencyContact?: string;
  communicationPreference: string[];
  timezone: string;
  profileCompleteness: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateParentProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  occupation?: string;
  emergencyContact?: string; // JSON string
  communicationPreference: string[];
  timezone: string;
}

export interface UpdateParentProfileRequest extends Partial<CreateParentProfileRequest> {} 