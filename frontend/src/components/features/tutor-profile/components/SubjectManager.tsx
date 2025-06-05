import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, GraduationCap, Clock, DollarSign, BookOpen } from 'lucide-react';

import { TutorProfileService, tutorProfileKeys } from '../services/tutorProfileService';
import { Modal } from '../../../ui/Modal';
import { useToast, ToastContainer } from '../../../ui/Toast';
import { Card, CardContent, CardHeader } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';

import type { 
  TutorSubject, 
  TutorSubjectFormData,
  ProficiencyLevel, 
  QualificationLevel 
} from '../types';
import { 
  SUBJECT_OPTIONS, 
  QUALIFICATION_LEVEL_OPTIONS, 
  UK_EXAM_BOARDS, 
  IB_SUBJECT_GROUPS 
} from '../types';
import { subjectFormSchema, formatQualificationLevel, type SubjectFormData } from '../utils/subjectValidation';

interface SubjectManagerProps {
  subjects: TutorSubject[];
}

export const SubjectManager: React.FC<SubjectManagerProps> = ({ subjects }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<TutorSubject | null>(null);
  const [customSubject, setCustomSubject] = useState('');
  const [selectedExamBoards, setSelectedExamBoards] = useState<string[]>([]);
  
  const { toasts, addToast, removeToast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      proficiencyLevel: 'INTERMEDIATE',
      yearsExperience: 0,
      examBoards: [],
    }
  });

  const watchQualificationLevel = watch('qualificationLevel');
  const watchSubjectName = watch('subjectName');

  // Mutations
  const createMutation = useMutation({
    mutationFn: TutorProfileService.createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.subjects() });
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.profile() });
      addToast({
        type: 'success',
        title: 'Subject Added',
        message: 'Your subject has been successfully added to your profile.',
      });
      handleCloseForm();
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error Adding Subject',
        message: error.response?.data?.message || 'Failed to add subject. Please try again.',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TutorSubjectFormData }) =>
      TutorProfileService.updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.subjects() });
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.profile() });
      addToast({
        type: 'success',
        title: 'Subject Updated',
        message: 'Your subject has been successfully updated.',
      });
      handleCloseForm();
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error Updating Subject',
        message: error.response?.data?.message || 'Failed to update subject. Please try again.',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: TutorProfileService.deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.subjects() });
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.profile() });
      addToast({
        type: 'success',
        title: 'Subject Removed',
        message: 'The subject has been removed from your profile.',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error Removing Subject',
        message: error.response?.data?.message || 'Failed to remove subject. Please try again.',
      });
    },
  });

  // Helper functions
  const getProficiencyColor = (level: ProficiencyLevel) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'INTERMEDIATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ADVANCED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'EXPERT':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQualificationLevelLabel = (level: QualificationLevel) => {
    return formatQualificationLevel(level);
  };

  const formatSubjectDisplay = (subject: TutorSubject) => {
    return `${getQualificationLevelLabel(subject.qualificationLevel)} ${subject.subjectName}`;
  };

  const handleOpenForm = (subject?: TutorSubject) => {
    if (subject) {
      setEditingSubject(subject);
      reset({
        subjectName: subject.subjectName,
        qualificationLevel: subject.qualificationLevel,
        proficiencyLevel: subject.proficiencyLevel,
        yearsExperience: subject.yearsExperience,
        hourlyRate: subject.hourlyRate || undefined,
        examBoards: subject.examBoards || [],
        ibSubjectGroup: subject.ibSubjectGroup || undefined,
        ibLanguage: subject.ibLanguage || undefined,
      });
      setSelectedExamBoards(subject.examBoards || []);
    } else {
      setEditingSubject(null);
      reset({
        proficiencyLevel: 'INTERMEDIATE',
        yearsExperience: 0,
        examBoards: [],
      });
      setSelectedExamBoards([]);
    }
    setCustomSubject('');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSubject(null);
    setCustomSubject('');
    setSelectedExamBoards([]);
    reset();
  };

  const handleDeleteSubject = (subject: TutorSubject) => {
    if (confirm(`Remove ${formatSubjectDisplay(subject)}?`)) {
      deleteMutation.mutate(subject.id);
    }
  };

  const onSubmit = (data: SubjectFormData) => {
    const formData: TutorSubjectFormData = {
      ...data,
      qualificationLevel: data.qualificationLevel as QualificationLevel,
      proficiencyLevel: data.proficiencyLevel as ProficiencyLevel,
      subjectName: data.subjectName === 'Other' ? customSubject : data.subjectName,
      examBoards: selectedExamBoards.length > 0 ? selectedExamBoards : undefined,
    };

    if (editingSubject) {
      updateMutation.mutate({ id: editingSubject.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleExamBoardChange = (board: string, checked: boolean) => {
    setSelectedExamBoards(prev => 
      checked 
        ? [...prev, board]
        : prev.filter(b => b !== board)
    );
    setValue('examBoards', selectedExamBoards);
  };

  const isIBLevel = watchQualificationLevel?.startsWith('IB_');
  const shouldShowExamBoards = watchQualificationLevel && 
    ['GCSE', 'IGCSE', 'A_LEVEL', 'AS_LEVEL', 'BTEC_LEVEL_1', 'BTEC_LEVEL_2', 'BTEC_LEVEL_3'].includes(watchQualificationLevel);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Teaching Subjects</h3>
            <p className="text-sm text-gray-500">
              Add the subjects you teach with UK/IB qualification levels and your experience
            </p>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
        </div>

        {subjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No subjects added yet</p>
              <p className="text-sm text-gray-400">
                Add your first teaching subject to help students find you
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <Card key={subject.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {formatSubjectDisplay(subject)}
                      </h4>
                      {subject.examBoards && subject.examBoards.length > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <BookOpen className="w-3 h-3" />
                          <span>{subject.examBoards.join(', ')}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <button
                        className="p-1 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"
                        onClick={() => handleOpenForm(subject)}
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1 text-red-600 hover:text-red-700 border border-red-300 rounded"
                        onClick={() => handleDeleteSubject(subject)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Proficiency:</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${getProficiencyColor(
                          subject.proficiencyLevel
                        )}`}
                      >
                        {subject.proficiencyLevel.charAt(0) + subject.proficiencyLevel.slice(1).toLowerCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Experience:</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {subject.yearsExperience} year{subject.yearsExperience !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {subject.hourlyRate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Rate:</span>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3 text-gray-400" />
                          <span className="text-sm font-medium text-green-600">
                            £{subject.hourlyRate}/hour
                          </span>
                        </div>
                      </div>
                    )}

                    {subject.ibSubjectGroup && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">IB Group:</span>
                        <span className="text-xs text-blue-600 text-right max-w-32">
                          {subject.ibSubjectGroup.replace('Group ', 'G')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Subject Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Subject Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Name *
            </label>
            <select
              {...register('subjectName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a subject</option>
              {SUBJECT_OPTIONS.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            {watchSubjectName === 'Other' && (
              <Input
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Enter custom subject name"
                className="mt-2"
              />
            )}
            {errors.subjectName && (
              <p className="mt-1 text-sm text-red-600">{errors.subjectName.message}</p>
            )}
          </div>

          {/* Qualification Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualification Level *
            </label>
            <select
              {...register('qualificationLevel')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select qualification level</option>
              {QUALIFICATION_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.qualificationLevel && (
              <p className="mt-1 text-sm text-red-600">{errors.qualificationLevel.message}</p>
            )}
          </div>

          {/* UK Exam Boards (for UK qualifications) */}
          {shouldShowExamBoards && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Boards (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {UK_EXAM_BOARDS.map((board) => (
                  <label key={board} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedExamBoards.includes(board)}
                      onChange={(e) => handleExamBoardChange(board, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{board}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* IB Subject Group (for IB qualifications) */}
          {isIBLevel && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IB Subject Group (Optional)
              </label>
              <select
                {...register('ibSubjectGroup')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select IB subject group</option>
                {IB_SUBJECT_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* IB Language (for language subjects) */}
          {isIBLevel && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language (For language subjects)
              </label>
              <Input
                {...register('ibLanguage')}
                placeholder="e.g., English, Spanish, French"
              />
            </div>
          )}

          {/* Proficiency Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teaching Proficiency *
            </label>
            <select
              {...register('proficiencyLevel')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="BEGINNER">Beginner - Building confidence</option>
              <option value="INTERMEDIATE">Intermediate - Comfortable teaching</option>
              <option value="ADVANCED">Advanced - Highly skilled</option>
              <option value="EXPERT">Expert - Subject specialist</option>
            </select>
            {errors.proficiencyLevel && (
              <p className="mt-1 text-sm text-red-600">{errors.proficiencyLevel.message}</p>
            )}
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience *
            </label>
            <Input
              type="number"
              min="0"
              max="50"
              {...register('yearsExperience', { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.yearsExperience && (
              <p className="mt-1 text-sm text-red-600">{errors.yearsExperience.message}</p>
            )}
          </div>

          {/* Hourly Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Rate (£) - Optional
            </label>
            <Input
              type="number"
              min="0"
              max="999999.99"
              step="0.01"
              {...register('hourlyRate', { valueAsNumber: true })}
              placeholder="0.00"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to use your general hourly rate
            </p>
            {errors.hourlyRate && (
              <p className="mt-1 text-sm text-red-600">{errors.hourlyRate.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
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
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (editingSubject ? 'Updating...' : 'Adding...') 
                : (editingSubject ? 'Update Subject' : 'Add Subject')
              }
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}; 