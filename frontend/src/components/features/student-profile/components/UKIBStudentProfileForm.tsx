import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Trash2, 
  GraduationCap, 
  School, 
  Globe, 
  BookOpen,
  Target,
  Info,
  AlertCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Select, SelectItem, SelectValue } from '../../../ui/Select';
import { useToast, ToastContainer } from '../../../ui/Toast';
import { Modal } from '../../../ui/Modal';

import { 
  enhancedStudentProfileSchema,
  subjectInterestSchema,
  validateAcademicLevel,
  getTargetGradeOptions,
  type EnhancedStudentProfileFormData,
  type SubjectInterestFormData 
} from '../utils/ukIbValidation';

import {
  UK_YEAR_GROUP_OPTIONS,
  IB_PROGRAMME_OPTIONS,
  UK_SCHOOL_TYPE_OPTIONS,
  UK_EXAM_BOARDS,
  getSubjectsForAcademicLevel,
  getQualificationLevelsForYear,
  type UKYearGroup,
  type IBProgramme,
  type UKSchoolType,
  type QualificationLevel,
  type SubjectInterest
} from '../types/ukIbTypes';

interface UKIBStudentProfileFormProps {
  initialData?: Partial<EnhancedStudentProfileFormData>;
  onSubmit: (data: EnhancedStudentProfileFormData) => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const UKIBStudentProfileForm: React.FC<UKIBStudentProfileFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading = false,
  isEditing = false,
}) => {
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableQualificationLevels, setAvailableQualificationLevels] = useState<QualificationLevel[]>([]);
  
  const { toasts, addToast, removeToast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
    trigger,
  } = useForm<EnhancedStudentProfileFormData>({
    resolver: zodResolver(enhancedStudentProfileSchema),
    defaultValues: {
      ukYearGroup: initialData.ukYearGroup,
      ibProgramme: initialData.ibProgramme,
      ibYearOfStudy: initialData.ibYearOfStudy,
      schoolName: initialData.schoolName || '',
      schoolType: initialData.schoolType,
      schoolCountry: initialData.schoolCountry || '',
      subjectInterests: initialData.subjectInterests || [],
      learningGoals: initialData.learningGoals || '',
      specialNeeds: initialData.specialNeeds || '',
      preferredLearningStyle: initialData.preferredLearningStyle,
      timezone: initialData.timezone || 'Europe/London',
      parentId: initialData.parentId,
    },
  });

  const { fields: subjectFields, append: appendSubject, remove: removeSubject } = useFieldArray({
    control,
    name: 'subjectInterests',
  });

  // Subject interest form for modal
  const {
    register: registerSubject,
    handleSubmit: handleSubjectSubmit,
    control: subjectControl,
    reset: resetSubject,
    formState: { errors: subjectErrors },
    watch: watchSubject,
  } = useForm<SubjectInterestFormData>({
    resolver: zodResolver(subjectInterestSchema),
    defaultValues: {
      subjectName: '',
      qualificationLevel: undefined,
      examBoard: '',
      isCore: false,
      targetGrade: '',
    },
  });

  const watchedUKYear = watch('ukYearGroup');
  const watchedIBProgramme = watch('ibProgramme');
  const watchedSubjectQualificationLevel = watchSubject('qualificationLevel');

  // Update available subjects and qualification levels when academic level changes
  useEffect(() => {
    const subjects = getSubjectsForAcademicLevel(watchedUKYear, watchedIBProgramme);
    const qualLevels = getQualificationLevelsForYear(watchedUKYear, watchedIBProgramme);
    
    setAvailableSubjects(subjects);
    setAvailableQualificationLevels(qualLevels);
  }, [watchedUKYear, watchedIBProgramme]);

  // Clear the other academic level when one is selected
  useEffect(() => {
    if (watchedUKYear && watchedIBProgramme) {
      setValue('ibProgramme', undefined);
      setValue('ibYearOfStudy', undefined);
    }
  }, [watchedUKYear, setValue]);

  useEffect(() => {
    if (watchedIBProgramme && watchedUKYear) {
      setValue('ukYearGroup', undefined);
    }
  }, [watchedIBProgramme, setValue]);

  const handleAcademicLevelValidation = () => {
    const validation = validateAcademicLevel(
      watchedUKYear,
      watchedIBProgramme,
      watch('ibYearOfStudy')
    );
    
    if (!validation.isValid && validation.error) {
      addToast({
        type: 'warning',
        title: 'Academic Level Selection',
        message: validation.error,
      });
    }
  };

  const handleAddSubject = (data: SubjectInterestFormData) => {
    const existingSubject = subjectFields.find(
      field => field.subjectName === data.subjectName
    );

    if (existingSubject) {
      addToast({
        type: 'warning',
        title: 'Subject Already Added',
        message: 'This subject is already in your interests list.',
      });
      return;
    }

    appendSubject(data);
    setShowSubjectModal(false);
    resetSubject();
    
    addToast({
      type: 'success',
      title: 'Subject Added',
      message: `${data.subjectName} has been added to your interests.`,
    });
  };

  const handleRemoveSubject = (index: number, subjectName: string) => {
    removeSubject(index);
    addToast({
      type: 'success',
      title: 'Subject Removed',
      message: `${subjectName} has been removed from your interests.`,
    });
  };

  const getYearOfStudyOptions = (programme: IBProgramme): number[] => {
    const maxYears = {
      PYP: 6,
      MYP: 5,
      DP: 2,
      CP: 2,
    };
    
    return Array.from({ length: maxYears[programme] }, (_, i) => i + 1);
  };

  const formatQualificationLevel = (level: QualificationLevel): string => {
    return level.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="w-6 h-6 mr-2 text-blue-600" />
            {isEditing ? 'Edit Student Profile' : 'Create Student Profile'}
          </CardTitle>
          <CardDescription>
            Manage your academic information using the UK educational system or International Baccalaureate framework
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Academic Level Selection */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Academic Level</h3>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Choose Your Academic System</p>
                    <p className="text-sm text-blue-800">
                      Select either the UK Year Group system or International Baccalaureate programme that matches your current education.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* UK Year Group Selection */}
                <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">UK Educational System</CardTitle>
                    <CardDescription>Select your current year group</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Year Group</label>
                      <Controller
                        name="ukYearGroup"
                        control={control}
                        render={({ field }) => (
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleAcademicLevelValidation();
                            }} 
                            value={field.value || ''}
                          >
                            <SelectValue placeholder="Select year group" />
                            {UK_YEAR_GROUP_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label} ({option.description})
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* IB Programme Selection */}
                <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">International Baccalaureate</CardTitle>
                    <CardDescription>Select your IB programme</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">IB Programme</label>
                        <Controller
                          name="ibProgramme"
                          control={control}
                          render={({ field }) => (
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleAcademicLevelValidation();
                              }} 
                              value={field.value || ''}
                            >
                              <SelectValue placeholder="Select IB programme" />
                              {IB_PROGRAMME_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </Select>
                          )}
                        />
                      </div>

                      {watchedIBProgramme && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Year of Study</label>
                          <Controller
                            name="ibYearOfStudy"
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value || '')}>
                                <SelectValue placeholder="Select year" />
                                {getYearOfStudyOptions(watchedIBProgramme).map((year) => (
                                  <SelectItem key={year} value={String(year)}>
                                    Year {year}
                                  </SelectItem>
                                ))}
                              </Select>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {errors.ukYearGroup && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{errors.ukYearGroup.message}</p>
                </div>
              )}
            </div>

            {/* School Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <School className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">School Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">School Name</label>
                  <Input
                    {...register('schoolName')}
                    placeholder="Enter your school name"
                    error={errors.schoolName?.message}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">School Type</label>
                  <Controller
                    name="schoolType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <SelectValue placeholder="Select school type" />
                        {UK_SCHOOL_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Country (if international)</label>
                  <Input
                    {...register('schoolCountry')}
                    placeholder="e.g., United Kingdom"
                    error={errors.schoolCountry?.message}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Timezone</label>
                  <Controller
                    name="timezone"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectValue placeholder="Select timezone" />
                        <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET/CEST)</SelectItem>
                        <SelectItem value="America/New_York">New York (EST/EDT)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                        <SelectItem value="Australia/Sydney">Sydney (AEST/AEDT)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Subject Interests */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Subject Interests</h3>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowSubjectModal(true)}
                  size="sm"
                  disabled={!watchedUKYear && !watchedIBProgramme}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </div>

              {(!watchedUKYear && !watchedIBProgramme) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Please select your academic level first to add subjects
                    </p>
                  </div>
                </div>
              )}

              {subjectFields.length > 0 ? (
                <div className="space-y-3">
                  {subjectFields.map((field, index) => (
                    <Card key={field.id} className="border border-gray-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-medium text-gray-900">{field.subjectName}</h4>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {formatQualificationLevel(field.qualificationLevel)}
                              </span>
                              {field.isCore && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Core Subject
                                </span>
                              )}
                            </div>
                            <div className="mt-2 text-sm text-gray-600 space-x-4">
                              {field.examBoard && <span>Exam Board: {field.examBoard}</span>}
                              {field.targetGrade && <span>Target Grade: {field.targetGrade}</span>}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveSubject(index, field.subjectName)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No subjects added yet</p>
                  <p className="text-sm text-gray-400">
                    Add subjects you're interested in studying or currently taking
                  </p>
                </div>
              )}
            </div>

            {/* Learning Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Learning Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Learning Goals</label>
                  <textarea
                    {...register('learningGoals')}
                    placeholder="Describe your learning goals and aspirations..."
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.learningGoals && (
                    <p className="text-sm text-red-600">{errors.learningGoals.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Special Educational Needs</label>
                  <textarea
                    {...register('specialNeeds')}
                    placeholder="Any learning support requirements or accommodations..."
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.specialNeeds && (
                    <p className="text-sm text-red-600">{errors.specialNeeds.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Preferred Learning Style</label>
                <Controller
                  name="preferredLearningStyle"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectValue placeholder="Select learning style" />
                      <SelectItem value="VISUAL">Visual - Learn through images and diagrams</SelectItem>
                      <SelectItem value="AUDITORY">Auditory - Learn through listening</SelectItem>
                      <SelectItem value="KINESTHETIC">Kinesthetic - Learn through hands-on activities</SelectItem>
                      <SelectItem value="READING_WRITING">Reading/Writing - Learn through text</SelectItem>
                      <SelectItem value="MULTIMODAL">Multimodal - Combination of styles</SelectItem>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !isDirty}
              >
                {isLoading ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Subject Interest Modal */}
      <Modal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        title="Add Subject Interest"
        maxWidth="md"
      >
        <form onSubmit={handleSubjectSubmit(handleAddSubject)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Subject Name</label>
            <Controller
              name="subjectName"
              control={subjectControl}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectValue placeholder="Select a subject" />
                  {availableSubjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
            {subjectErrors.subjectName && (
              <p className="text-sm text-red-600">{subjectErrors.subjectName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Qualification Level</label>
            <Controller
              name="qualificationLevel"
              control={subjectControl}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectValue placeholder="Select qualification level" />
                  {availableQualificationLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {formatQualificationLevel(level)}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
            {subjectErrors.qualificationLevel && (
              <p className="text-sm text-red-600">{subjectErrors.qualificationLevel.message}</p>
            )}
          </div>

          {(watchedSubjectQualificationLevel === 'GCSE' || 
            watchedSubjectQualificationLevel === 'IGCSE' || 
            watchedSubjectQualificationLevel === 'A_LEVEL' || 
            watchedSubjectQualificationLevel === 'AS_LEVEL') && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Exam Board</label>
              <Controller
                name="examBoard"
                control={subjectControl}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectValue placeholder="Select exam board" />
                    {UK_EXAM_BOARDS.map((board) => (
                      <SelectItem key={board} value={board}>
                        {board}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </div>
          )}

          {watchedSubjectQualificationLevel && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Target Grade</label>
              <Controller
                name="targetGrade"
                control={subjectControl}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectValue placeholder="Select target grade" />
                    {getTargetGradeOptions(watchedSubjectQualificationLevel).map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...registerSubject('isCore')}
              id="isCore"
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <label htmlFor="isCore" className="text-sm text-gray-700">
              Core/Required Subject
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSubjectModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Add Subject
            </Button>
          </div>
        </form>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}; 