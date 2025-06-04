import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Upload, Trash2, CheckCircle, Clock, X } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { TutorProfileService, tutorProfileKeys } from '../services/tutorProfileService';
import type { TutorQualification, QualificationType, VerificationStatus } from '../types';

interface QualificationManagerProps {
  qualifications: TutorQualification[];
}

export const QualificationManager: React.FC<QualificationManagerProps> = ({ qualifications }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: TutorProfileService.deleteQualification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.qualifications() });
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.profile() });
    },
  });

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

  const formatQualificationType = (type: QualificationType) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Qualifications & Certificates</h3>
          <p className="text-sm text-gray-500">
            Add your educational background and professional certifications
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Add Qualification
        </Button>
      </div>

      {qualifications.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No qualifications added yet</p>
          <p className="text-sm text-gray-400">
            Add your qualifications to build trust with students and parents
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {qualifications.map((qualification) => (
            <div
              key={qualification.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{qualification.qualificationName}</h4>
                    <div className="flex items-center space-x-2">
                      {getVerificationIcon(qualification.verificationStatus)}
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${getVerificationColor(
                          qualification.verificationStatus
                        )}`}
                      >
                        {qualification.verificationStatus.charAt(0) + qualification.verificationStatus.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Type:</span> {formatQualificationType(qualification.qualificationType)}
                    </div>
                    {qualification.institution && (
                      <div>
                        <span className="font-medium">Institution:</span> {qualification.institution}
                      </div>
                    )}
                    {qualification.issueDate && (
                      <div>
                        <span className="font-medium">Issue Date:</span> {new Date(qualification.issueDate).toLocaleDateString()}
                      </div>
                    )}
                    {qualification.expiryDate && (
                      <div>
                        <span className="font-medium">Expiry Date:</span> {new Date(qualification.expiryDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {qualification.documentUrl && (
                    <div className="mt-3">
                      <a
                        href={qualification.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View Document</span>
                      </a>
                    </div>
                  )}

                  {qualification.verificationNotes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Admin Notes:</span> {qualification.verificationNotes}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this qualification?')) {
                      deleteMutation.mutate(qualification.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TODO: Add form modal for adding qualifications */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Add Qualification</h3>
            <p className="text-gray-500 mb-4">Form will be implemented later</p>
            <Button onClick={() => setIsFormOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}; 