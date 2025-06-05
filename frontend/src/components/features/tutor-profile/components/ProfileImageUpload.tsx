import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { Camera, Upload, X, Loader2, Crop as CropIcon, Save, RotateCcw } from 'lucide-react';

import { Button } from '../../../ui/Button';
import { useToast, ToastContainer } from '../../../ui/Toast';
import { TutorProfileService, tutorProfileKeys } from '../services/tutorProfileService';

// Import react-image-crop CSS
import 'react-image-crop/dist/ReactCrop.css';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  currentImageKey?: string;
  onImageChange?: (imageUrl: string | null, imageKey: string | null) => void;
}

// Helper function to convert canvas to file
const canvasToFile = (canvas: HTMLCanvasElement, fileName: string = 'cropped-image.jpg'): Promise<File> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        resolve(file);
      }
    }, 'image/jpeg', 0.9);
  });
};

// Helper function to get cropped canvas
const getCroppedCanvas = (
  image: HTMLImageElement,
  crop: PixelCrop,
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height,
  );

  return canvas;
};

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  currentImageKey,
  onImageChange,
}) => {
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImageSrc, setNewImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [showCropper, setShowCropper] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const { toasts, addToast, removeToast } = useToast();
  const queryClient = useQueryClient();

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: TutorProfileService.uploadProfileImage,
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: 'Profile Image Updated',
        message: 'Your profile image has been successfully uploaded.',
      });
      onImageChange?.(data.profileImageUrl, data.profileImageKey);
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.profile() });
      handleCancelCrop();
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: error.response?.data?.message || 'Failed to upload image. Please try again.',
      });
      setIsProcessing(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: TutorProfileService.deleteProfileImage,
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Image Removed',
        message: 'Your profile image has been successfully removed.',
      });
      onImageChange?.(null, null);
      queryClient.invalidateQueries({ queryKey: tutorProfileKeys.profile() });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: error.response?.data?.message || 'Failed to delete image. Please try again.',
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setNewImageFile(file);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setNewImageSrc(reader.result?.toString() || '');
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: showCropper || uploadMutation.isPending || deleteMutation.isPending,
  });

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Create a centered crop with 1:1 aspect ratio
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        1,
        width,
        height,
      ),
      width,
      height,
    );
    
    setCrop(crop);
  };

  const handleSaveCrop = async () => {
    if (!imgRef.current || !completedCrop || !newImageFile) {
      return;
    }

    setIsProcessing(true);

    try {
      // Get the cropped canvas
      const canvas = getCroppedCanvas(imgRef.current, completedCrop);
      
      // Convert canvas to file
      const croppedFile = await canvasToFile(canvas, `profile-${Date.now()}.jpg`);
      
      // Upload the cropped file
      uploadMutation.mutate(croppedFile);
    } catch (error) {
      setIsProcessing(false);
      addToast({
        type: 'error',
        title: 'Crop Failed',
        message: 'Failed to process the cropped image. Please try again.',
      });
    }
  };

  const handleCancelCrop = () => {
    setNewImageFile(null);
    setNewImageSrc('');
    setShowCropper(false);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setIsProcessing(false);
  };

  const handleDeleteImage = () => {
    if (confirm('Are you sure you want to delete your profile image?')) {
      deleteMutation.mutate();
    }
  };

  const isLoading = uploadMutation.isPending || deleteMutation.isPending || isProcessing;

  // Determine which image to display
  const displayImageUrl = currentImageUrl;
  const hasImage = displayImageUrl && !showCropper;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Image
        </label>
        <p className="text-sm text-gray-500">
          Upload a professional photo of yourself. This helps students and parents recognize you.
        </p>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && newImageSrc && (
        <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 flex items-center">
              <CropIcon className="w-5 h-5 mr-2" />
              Crop Your Image
            </h4>
            <p className="text-sm text-gray-600">
              Adjust the crop area to select the part of your image you want to use
            </p>
          </div>

          <div className="max-w-lg mx-auto mb-6">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop={false}
              keepSelection={true}
              minWidth={100}
              minHeight={100}
            >
              <img
                ref={imgRef}
                src={newImageSrc}
                onLoad={onImageLoad}
                alt="Crop preview"
                className="max-w-full h-auto"
                style={{ maxHeight: '400px' }}
              />
            </ReactCrop>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              onClick={handleCancelCrop}
              disabled={isLoading}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveCrop}
              disabled={isLoading || !completedCrop}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Image
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Main Upload Interface */}
      {!showCropper && (
        <div className="flex items-start space-x-6">
          {/* Current Image Preview */}
          <div className="relative">
            <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
              {hasImage ? (
                <img
                  src={displayImageUrl}
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
                PNG, JPG, WEBP up to 10MB
              </p>
            </div>

            {/* Action Buttons */}
            {hasImage && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteImage}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove Image
                </Button>
              </div>
            )}

            {/* Helpful Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-blue-900 mb-2">Tips for a great profile photo:</h5>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Use a high-quality, well-lit photo</li>
                <li>• Face the camera and smile naturally</li>
                <li>• Wear professional or smart casual clothing</li>
                <li>• Ensure your face takes up most of the frame</li>
                <li>• Avoid busy backgrounds</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}; 