import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Upload, 
  Trash2, 
  CheckCircle, 
  Clock, 
  X, 
  Edit,
  Calendar,
  Building,
  AlertCircle,
  Paperclip
} from 'lucide-react';

import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Select, SelectItem, SelectValue } from '../../../ui/Select';
import { Card, CardContent, CardHeader } from '../../../ui/Card';
import { useToast, ToastContainer } from '../../../ui/Toast';

import { TutorProfileService, tutorProfileKeys } from '../services/tutorProfileService';
import { 
  qualificationFormSchema, 
  formatQualificationType,
  QUALIFICATION_TYPE_OPTIONS,
  type QualificationFormData 
} from '../utils/qualificationValidation';
import type { 
  TutorQualification, 
  TutorQualificationFormData,
  QualificationType, 
  VerificationStatus 
} from '../types';

interface QualificationManagerProps {
  qualifications: TutorQualification[];
}

export const QualificationManager: React.FC<QualificationManagerProps> = ({ qualifications }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQualification, setEditingQualification] = useState<TutorQualification | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toasts, addToast, removeToast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<QualificationFormData>({
    resolver: zodResolver(qualificationFormSchema),
  });

  const watchedFile = watch('document');

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: TutorQualificationFormData) => {
      setUploadProgress(0);
      const result = await TutorProfileService.createQualification(data);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(null), 1000);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.qualifications() });
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.profile() });
      addToast({
        type: 'success',
        title: 'Qualification Added',
        message: 'Your qualification has been successfully added and is pending verification.',
      });
      handleCloseForm();
    },
    onError: (error: any) => {
      setUploadProgress(null);
      addToast({
        type: 'error',
        title: 'Error Adding Qualification',
        message: error.response?.data?.message || 'Failed to add qualification. Please try again.',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TutorQualificationFormData> }) =>
      TutorProfileService.updateQualification(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.qualifications() });
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.profile() });
      addToast({
        type: 'success',
        title: 'Qualification Updated',
        message: 'Your qualification has been successfully updated.',
      });
      handleCloseForm();
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error Updating Qualification',
        message: error.response?.data?.message || 'Failed to update qualification. Please try again.',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: TutorProfileService.deleteQualification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.qualifications() });
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.profile() });
      addToast({
        type: 'success',
        title: 'Qualification Removed',
        message: 'The qualification has been removed from your profile.',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error Removing Qualification',
        message: error.response?.data?.message || 'Failed to remove qualification. Please try again.',
      });
    },
  });

  // Helper functions
  const getVerificationIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'REJECTED':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getVerificationColor = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleOpenForm = (qualification?: TutorQualification) => {
    if (qualification) {
      setEditingQualification(qualification);
      reset({
        qualificationType: qualification.qualificationType,
        institution: qualification.institution || '',
        qualificationName: qualification.qualificationName,
        issueDate: qualification.issueDate ? qualification.issueDate.split('T')[0] : '',
        expiryDate: qualification.expiryDate ? qualification.expiryDate.split('T')[0] : '',
      });
    } else {
      setEditingQualification(null);
      reset({
        qualificationType: undefined,
        institution: '',
        qualificationName: '',
        issueDate: '',
        expiryDate: '',
        document: undefined,
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingQualification(null);
    setUploadProgress(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteQualification = (qualification: TutorQualification) => {
    if (confirm(`Are you sure you want to remove "${qualification.qualificationName}"?`)) {
      deleteMutation.mutate(qualification.id);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('document', file);
    }
  };

  const onSubmit = (data: QualificationFormData) => {
    const formData: TutorQualificationFormData = {
      qualificationType: data.qualificationType,
      institution: data.institution || '',
      qualificationName: data.qualificationName,
      issueDate: data.issueDate,
      expiryDate: data.expiryDate || '',
      document: data.document,
    };

    if (editingQualification) {
      // For updates, we don't include the document field as that's handled separately
      const updateData = {
        qualificationType: formData.qualificationType,
        institution: formData.institution,
        qualificationName: formData.qualificationName,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
      };
      updateMutation.mutate({ id: editingQualification.id, data: updateData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Qualifications & Certificates</h3>
          <p className="text-sm text-gray-500">
            Add your educational background and professional certifications to build trust with students
          </p>
        </div>
        <Button onClick={() => handleOpenForm()} size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Add Qualification
        </Button>
      </div>

      {qualifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No qualifications added yet</p>
            <p className="text-sm text-gray-400 mb-4">
              Add your qualifications to showcase your expertise and build credibility
            </p>
            <Button onClick={() => handleOpenForm()} variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Add Your First Qualification
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {qualifications.map((qualification) => (
            <Card key={qualification.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{qualification.qualificationName}</h4>
                      <div className="flex items-center space-x-2">
                        {getVerificationIcon(qualification.verificationStatus)}
                        <span
                          className={`text-xs px-2 py-1 rounded-full border ${getVerificationColor(
                            qualification.verificationStatus
                          )}`}
                        >
                          {qualification.verificationStatus.charAt(0) + 
                           qualification.verificationStatus.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-medium text-gray-700">
                        {formatQualificationType(qualification.qualificationType)}
                      </span>
                      {qualification.institution && (
                        <span className="ml-2">• {qualification.institution}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenForm(qualification)}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQualification(qualification)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {qualification.issueDate && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Issued: {formatDateForDisplay(qualification.issueDate)}</span>
                    </div>
                  )}
                  {qualification.expiryDate && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Expires: {formatDateForDisplay(qualification.expiryDate)}</span>
                    </div>
                  )}
                </div>

                {qualification.documentUrl && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <a
                      href={qualification.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Certificate</span>
                    </a>
                  </div>
                )}

                {qualification.verificationNotes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Admin Notes:</p>
                        <p className="text-sm text-gray-600">{qualification.verificationNotes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Qualification Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingQualification ? 'Edit Qualification' : 'Add New Qualification'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Qualification Type */}
          <div>
            <label htmlFor="qualificationType" className="block text-sm font-medium text-gray-700 mb-2">
              Qualification Type *
            </label>
            <Select
              {...register('qualificationType')}
              onValueChange={(value) => setValue('qualificationType', value as QualificationType)}
            >
              <SelectValue placeholder="Select qualification type" />
              {QUALIFICATION_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            {errors.qualificationType && (
              <p className="mt-1 text-sm text-red-600">{errors.qualificationType.message}</p>
            )}
          </div>

          {/* Qualification Name */}
          <div>
            <label htmlFor="qualificationName" className="block text-sm font-medium text-gray-700 mb-2">
              Qualification Name *
            </label>
                       <Input
             {...register('qualificationName')}
             placeholder="e.g., Bachelor of Science in Mathematics"
             error={errors.qualificationName?.message}
           />
          </div>

          {/* Institution */}
          <div>
            <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-2">
              Institution
            </label>
                       <Input
             {...register('institution')}
             placeholder="e.g., University of Cambridge"
             error={errors.institution?.message}
           />
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date *
              </label>
                           <Input
               {...register('issueDate')}
               type="date"
               error={errors.issueDate?.message}
             />
            </div>

            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date (Optional)
              </label>
                           <Input
               {...register('expiryDate')}
               type="date"
               error={errors.expiryDate?.message}
             />
            </div>
          </div>

          {/* File Upload */}
          {!editingQualification && (
            <div>
              <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Certificate (Optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  {watchedFile ? (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Paperclip className="w-5 h-5" />
                      <span className="text-sm">{watchedFile.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue('document', undefined);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="document"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            ref={fileInputRef}
                            id="document"
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
              {errors.document && (
                <p className="mt-1 text-sm text-red-600">{errors.document.message}</p>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseForm}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || uploadProgress !== null}
            >
              {isSubmitting ? 'Saving...' : editingQualification ? 'Update Qualification' : 'Add Qualification'}
            </Button>
          </div>
        </form>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}; 