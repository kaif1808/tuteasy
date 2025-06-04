import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, GraduationCap, Clock, DollarSign } from 'lucide-react';
import { TutorProfileService, tutorProfileKeys } from '../services/tutorProfileService';
import type { TutorSubject, ProficiencyLevel } from '../types';
import { SUBJECT_OPTIONS } from '../types';

interface SubjectManagerProps {
  subjects: TutorSubject[];
}

export const SubjectManager: React.FC<SubjectManagerProps> = ({ subjects }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: TutorProfileService.deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.subjects() });
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.profile() });
    },
  });

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

  const getProficiencyLabel = (level: ProficiencyLevel) => {
    return level.charAt(0) + level.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Teaching Subjects</h3>
          <p className="text-sm text-gray-500">
            Add the subjects you teach, your proficiency level, and experience
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No subjects added yet</p>
          <p className="text-sm text-gray-400">
            Add your first teaching subject to help students find you
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900">{subject.subjectName}</h4>
                <div className="flex space-x-1">
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"
                    onClick={() => {/* TODO: Add edit functionality */}}
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    className="p-1 text-red-600 hover:text-red-700 border border-red-300 rounded"
                    onClick={() => {
                      if (confirm(`Remove ${subject.subjectName}?`)) {
                        deleteMutation.mutate(subject.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Proficiency:</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${getProficiencyColor(
                      subject.proficiencyLevel
                    )}`}
                  >
                    {getProficiencyLabel(subject.proficiencyLevel)}
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TODO: Add comprehensive form modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Add Subject</h3>
            <p className="text-gray-500 mb-4">Subject form will be implemented in the next iteration</p>
            <button
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 