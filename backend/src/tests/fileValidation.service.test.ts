import { describe, it, expect } from '@jest/globals';
import { FileValidationService } from '../services/fileValidation.service';

describe('FileValidationService', () => {
  describe('validateFile', () => {
    it('should validate file size', () => {
      const buffer = Buffer.alloc(1024 * 1024 * 15); // 15MB
      const result = FileValidationService.validateFile(buffer, 'test.jpg', {
        maxSizeBytes: 10 * 1024 * 1024 // 10MB limit
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File size exceeds maximum');
    });

    it('should sanitize dangerous filenames', () => {
      const buffer = Buffer.from('test content');
      const result = FileValidationService.validateFile(buffer, '../../../etc/passwd', {
        maxSizeBytes: 1024 * 1024,
        sanitizeFilename: true,
        requireExtension: false
      });

      expect(result.isValid).toBe(true);
      expect(result.sanitizedFilename).toBeDefined();
      expect(result.sanitizedFilename).not.toContain('..');
      expect(result.sanitizedFilename).not.toContain('/');
    });

    it('should reject dangerous file extensions', () => {
      const buffer = Buffer.from('test content');
      const result = FileValidationService.validateFile(buffer, 'malware.exe');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File type not allowed for security reasons');
    });

    it('should validate allowed extensions', () => {
      const buffer = Buffer.from('test content');
      const result = FileValidationService.validateFile(buffer, 'document.txt', {
        allowedExtensions: ['.pdf', '.doc'],
        maxSizeBytes: 1024 * 1024
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File extension .txt is not allowed');
    });

    it('should require file extension when specified', () => {
      const buffer = Buffer.from('test content');
      const result = FileValidationService.validateFile(buffer, 'filename_without_extension', {
        requireExtension: true,
        maxSizeBytes: 1024 * 1024
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File must have an extension');
    });
  });

  describe('MIME type detection', () => {
    it('should detect JPEG images', () => {
      // JPEG magic number: FF D8 FF
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
      const result = FileValidationService.validateFile(jpegBuffer, 'test.jpg', {
        allowedMimeTypes: ['image/jpeg'],
        maxSizeBytes: 1024 * 1024
      });

      expect(result.isValid).toBe(true);
      expect(result.detectedMimeType).toBe('image/jpeg');
    });

    it('should detect PNG images', () => {
      // PNG magic number: 89 50 4E 47
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const result = FileValidationService.validateFile(pngBuffer, 'test.png', {
        allowedMimeTypes: ['image/png'],
        maxSizeBytes: 1024 * 1024
      });

      expect(result.isValid).toBe(true);
      expect(result.detectedMimeType).toBe('image/png');
    });

    it('should detect PDF files', () => {
      // PDF magic number: 25 50 44 46 (%PDF)
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]);
      const result = FileValidationService.validateFile(pdfBuffer, 'test.pdf', {
        allowedMimeTypes: ['application/pdf'],
        maxSizeBytes: 1024 * 1024
      });

      expect(result.isValid).toBe(true);
      expect(result.detectedMimeType).toBe('application/pdf');
    });

    it('should reject files with mismatched MIME types', () => {
      // PNG magic number but claiming to be JPEG
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const result = FileValidationService.validateFile(pngBuffer, 'test.jpg', {
        allowedMimeTypes: ['image/jpeg'],
        maxSizeBytes: 1024 * 1024
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File type image/png is not allowed');
    });
  });

  describe('Security checks', () => {
    it('should detect script content in images', () => {
      const maliciousContent = Buffer.from('GIF89a<script>alert("xss")</script>');
      const result = FileValidationService.validateFile(maliciousContent, 'test.gif', {
        allowedMimeTypes: ['image/gif'],
        maxSizeBytes: 1024 * 1024
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('potentially malicious content');
    });

    it('should detect suspicious PDF content', () => {
      const suspiciousPdf = Buffer.from('%PDF-1.4\n/JavaScript (alert("xss"))');
      const result = FileValidationService.validateFile(suspiciousPdf, 'test.pdf', {
        allowedMimeTypes: ['application/pdf'],
        maxSizeBytes: 1024 * 1024
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('potentially unsafe content');
    });
  });

  describe('validateImage', () => {
    it('should validate image files with default settings', () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
      const result = FileValidationService.validateImage(jpegBuffer, 'profile.jpg');

      expect(result.isValid).toBe(true);
      expect(result.detectedMimeType).toBe('image/jpeg');
    });

    it('should reject non-image files', () => {
      const textBuffer = Buffer.from('This is just text content');
      const result = FileValidationService.validateImage(textBuffer, 'document.txt');

      expect(result.isValid).toBe(false);
    });
  });

  describe('validateDocument', () => {
    it('should validate PDF documents', () => {
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]);
      const result = FileValidationService.validateDocument(pdfBuffer, 'document.pdf');

      expect(result.isValid).toBe(true);
      expect(result.detectedMimeType).toBe('application/pdf');
    });

    it('should reject non-document files', () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
      const result = FileValidationService.validateDocument(jpegBuffer, 'image.jpg');

      expect(result.isValid).toBe(false);
    });
  });

  describe('Utility methods', () => {
    it('should generate secure filenames', () => {
      const filename = FileValidationService.generateSecureFilename('test file.jpg', 'profile');
      
      expect(filename).toMatch(/^profile_\d+_[a-z0-9]+_test_file\.jpg$/);
      expect(filename).not.toContain(' ');
    });

    it('should check allowed file types for different contexts', () => {
      expect(FileValidationService.isAllowedFileType('image/jpeg', 'profile_image')).toBe(true);
      expect(FileValidationService.isAllowedFileType('application/pdf', 'profile_image')).toBe(false);
      expect(FileValidationService.isAllowedFileType('application/pdf', 'document')).toBe(true);
    });

    it('should sanitize filenames properly', () => {
      const dangerous = '../../../etc/passwd';
      const result = FileValidationService.validateFile(Buffer.from('test'), dangerous, {
        sanitizeFilename: true,
        maxSizeBytes: 1024,
        requireExtension: false
      });

      expect(result.isValid).toBe(true);
      expect(result.sanitizedFilename).toBeDefined();
      expect(result.sanitizedFilename).not.toContain('..');
      expect(result.sanitizedFilename).not.toContain('/');
    });

    it('should handle empty filenames', () => {
      const result = FileValidationService.validateFile(Buffer.from('test'), '', {
        sanitizeFilename: true,
        maxSizeBytes: 1024,
        requireExtension: false
      });

      // Empty filename should generate a default filename
      expect(result.isValid).toBe(true);
      expect(result.sanitizedFilename).toBeDefined();
      expect(result.sanitizedFilename).toMatch(/^file_\d+$/);
    });

    it('should limit filename length', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = FileValidationService.validateFile(Buffer.from('test'), longName, {
        sanitizeFilename: true,
        maxSizeBytes: 1024
      });

      expect(result.sanitizedFilename!.length).toBeLessThanOrEqual(255);
      expect(result.sanitizedFilename).toMatch(/\.txt$/);
    });
  });

  describe('Text file detection', () => {
    it('should detect plain text files', () => {
      const textBuffer = Buffer.from('This is a plain text file with normal content.');
      const result = FileValidationService.validateFile(textBuffer, 'readme.txt', {
        allowedMimeTypes: ['text/plain'],
        maxSizeBytes: 1024 * 1024
      });

      expect(result.detectedMimeType).toBe('text/plain');
    });

    it('should not detect binary files as text', () => {
      const binaryBuffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xFF, 0xFE, 0xFD, 0xFC]);
      const result = FileValidationService.validateFile(binaryBuffer, 'binary.bin', {
        maxSizeBytes: 1024 * 1024
      });

      expect(result.detectedMimeType).toBe('application/octet-stream');
    });
  });
});