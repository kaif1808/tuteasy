import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { TutorProfileService, tutorProfileKeys } from '../services/tutorProfileService';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onImageUpdate?: (imageUrl: string) => void;
  onImageDelete?: () => void;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  onImageUpdate,
  onImageDelete,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: TutorProfileService.uploadProfileImage,
    onSuccess: (data) => {
      setPreview(null);
      onImageUpdate?.(data.profileImageUrl);
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.profile() });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: TutorProfileService.deleteProfileImage,
    onSuccess: () => {
      setPreview(null);
      onImageDelete?.();
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.profile() });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      
      // Upload file
      uploadMutation.mutate(file);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete your profile image?')) {
      deleteMutation.mutate();
    }
  };

  const imageUrl = preview || currentImageUrl;
  const isLoading = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Profile Image
      </label>
      
      <div className="flex items-start space-x-6">
        {/* Image Preview */}
        <div className="relative">
          <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${isLoading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {isDragActive ? (
                'Drop the image here...'
              ) : (
                <>
                  <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WEBP up to 5MB
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {imageUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            )}
          </div>

          {/* Error Message */}
          {uploadMutation.error && (
            <p className="text-sm text-red-600">
              {uploadMutation.error.message || 'Failed to upload image'}
            </p>
          )}
          
          {deleteMutation.error && (
            <p className="text-sm text-red-600">
              {deleteMutation.error.message || 'Failed to delete image'}
            </p>
          )}
        </div>
      </div>
      
      <p className="text-xs text-gray-500">
        Your profile image helps students and parents recognize you. Choose a professional, clear photo of yourself.
      </p>
    </div>
  );
}; 