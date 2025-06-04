import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Label } from '../../../ui/Label';
import { Textarea } from '../../../ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/Select';
import { Badge } from '../../../ui/Badge';
import { X, Plus } from 'lucide-react';
import type { 
  StudentProfileFormData
} from '../types';
import { 
  GRADE_LEVELS, 
  COMMON_SUBJECTS, 
  LEARNING_STYLE_DESCRIPTIONS 
} from '../types';

// Zod schema for form validation
const studentProfileSchema = z.object({
  gradeLevel: z.string().optional(),
  schoolName: z.string().max(200, 'School name must be less than 200 characters').optional(),
  subjectsOfInterest: z.array(z.string()).default([]),
  learningGoals: z.string().max(1000, 'Learning goals must be less than 1000 characters').optional(),
  specialNeeds: z.string().max(1000, 'Special needs must be less than 1000 characters').optional(),
  preferredLearningStyle: z.enum(['VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING_WRITING', 'MULTIMODAL']).optional(),
  timezone: z.string().max(50).default('UTC'),
});

interface StudentProfileFormProps {
  initialData?: Partial<StudentProfileFormData>;
  onSubmit: (data: StudentProfileFormData) => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const StudentProfileForm: React.FC<StudentProfileFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading = false,
  isEditing = false,
}) => {
  const [newSubject, setNewSubject] = React.useState('');
  const [showCustomSubject, setShowCustomSubject] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<StudentProfileFormData>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      gradeLevel: initialData.gradeLevel || '',
      schoolName: initialData.schoolName || '',
      subjectsOfInterest: initialData.subjectsOfInterest || [],
      learningGoals: initialData.learningGoals || '',
      specialNeeds: initialData.specialNeeds || '',
      preferredLearningStyle: initialData.preferredLearningStyle,
      timezone: initialData.timezone || 'UTC',
    },
  });

  const watchedSubjects = watch('subjectsOfInterest');

  const addSubject = (subject: string) => {
    if (subject && !watchedSubjects.includes(subject)) {
      setValue('subjectsOfInterest', [...watchedSubjects, subject], { shouldDirty: true });
      setNewSubject('');
      setShowCustomSubject(false);
    }
  };

  const removeSubject = (subjectToRemove: string) => {
    setValue(
      'subjectsOfInterest',
      watchedSubjects.filter(subject => subject !== subjectToRemove),
      { shouldDirty: true }
    );
  };

  const handleAddCustomSubject = () => {
    if (newSubject.trim()) {
      addSubject(newSubject.trim());
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Student Profile' : 'Create Student Profile'}
        </CardTitle>
        <CardDescription>
          Manage your academic information and learning preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Controller
                  name="gradeLevel"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_LEVELS.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gradeLevel && (
                  <p className="text-sm text-red-600">{errors.gradeLevel.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  {...register('schoolName')}
                  placeholder="Enter your school name"
                />
                {errors.schoolName && (
                  <p className="text-sm text-red-600">{errors.schoolName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London Time</SelectItem>
                      <SelectItem value="Europe/Paris">Central European Time</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo Time</SelectItem>
                      <SelectItem value="Australia/Sydney">Sydney Time</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.timezone && (
                <p className="text-sm text-red-600">{errors.timezone.message}</p>
              )}
            </div>
          </div>

          {/* Subjects of Interest Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Subjects of Interest</h3>
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {COMMON_SUBJECTS.filter(subject => !watchedSubjects.includes(subject))
                  .slice(0, 10).map((subject) => (
                  <Button
                    key={subject}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSubject(subject)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {subject}
                  </Button>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomSubject(true)}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Custom
                </Button>
              </div>

              {showCustomSubject && (
                <div className="flex gap-2">
                  <Input
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Enter custom subject"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSubject();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomSubject}
                    disabled={!newSubject.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCustomSubject(false);
                      setNewSubject('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {watchedSubjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeSubject(subject)}
                      className="ml-1 hover:bg-gray-500 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Learning Preferences Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Learning Preferences</h3>
            
            <div className="space-y-2">
              <Label htmlFor="preferredLearningStyle">Preferred Learning Style</Label>
              <Controller
                name="preferredLearningStyle"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select learning style" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LEARNING_STYLE_DESCRIPTIONS).map(([style, description]) => (
                        <SelectItem key={style} value={style}>
                          <div className="flex flex-col">
                            <span className="font-medium">{style.replace('_', ' ')}</span>
                            <span className="text-xs text-gray-500">{description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.preferredLearningStyle && (
                <p className="text-sm text-red-600">{errors.preferredLearningStyle.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="learningGoals">Learning Goals</Label>
              <Textarea
                id="learningGoals"
                {...register('learningGoals')}
                placeholder="Describe your learning objectives and goals..."
                rows={4}
              />
              {errors.learningGoals && (
                <p className="text-sm text-red-600">{errors.learningGoals.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialNeeds">Special Accommodations</Label>
              <Textarea
                id="specialNeeds"
                {...register('specialNeeds')}
                placeholder="Describe any special learning needs or accommodations..."
                rows={3}
              />
              {errors.specialNeeds && (
                <p className="text-sm text-red-600">{errors.specialNeeds.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading || (!isEditing && !isDirty)}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 