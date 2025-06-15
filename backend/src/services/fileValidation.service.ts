import { config } from '../config';
import path from 'path';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFilename?: string;
  detectedMimeType?: string;
}

export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  requireExtension?: boolean;
  sanitizeFilename?: boolean;
}

export class FileValidationService {
  private static readonly DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly DANGEROUS_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.app', '.deb', '.pkg', '.dmg', '.rpm', '.msi', '.sh', '.ps1'
  ];

  /**
   * Validate uploaded file against security and business rules
   */
  static validateFile(
    buffer: Buffer,
    filename: string,
    options: FileValidationOptions = {}
  ): FileValidationResult {
    const {
      maxSizeBytes = this.DEFAULT_MAX_SIZE,
      allowedMimeTypes = [],
      allowedExtensions = [],
      requireExtension = true,
      sanitizeFilename = true
    } = options;

    // Size validation
    if (buffer.length > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${maxSizeBytes / (1024 * 1024)}MB`
      };
    }

    // Filename sanitization and validation
    const sanitizedFilename = sanitizeFilename ? this.sanitizeFilename(filename) : filename;
    
    if (!sanitizedFilename) {
      return {
        isValid: false,
        error: 'Invalid filename'
      };
    }

    // Extension validation
    const extension = path.extname(sanitizedFilename).toLowerCase();
    
    if (requireExtension && !extension) {
      return {
        isValid: false,
        error: 'File must have an extension'
      };
    }

    // Check for dangerous extensions
    if (this.DANGEROUS_EXTENSIONS.includes(extension)) {
      return {
        isValid: false,
        error: 'File type not allowed for security reasons'
      };
    }

    // Allowed extensions check
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `File extension ${extension} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`
      };
    }

    // MIME type detection and validation
    const detectedMimeType = this.detectMimeType(buffer);
    
    if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(detectedMimeType)) {
      return {
        isValid: false,
        error: `File type ${detectedMimeType} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`
      };
    }

    // Additional security checks
    const securityCheck = this.performSecurityChecks(buffer, detectedMimeType);
    if (!securityCheck.isValid) {
      return securityCheck;
    }

    return {
      isValid: true,
      sanitizedFilename,
      detectedMimeType
    };
  }

  /**
   * Validate image files specifically
   */
  static validateImage(buffer: Buffer, filename: string): FileValidationResult {
    return this.validateFile(buffer, filename, {
      maxSizeBytes: config.upload.maxFileSizeMB * 1024 * 1024,
      allowedMimeTypes: config.upload.allowedImageTypes,
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
      requireExtension: true,
      sanitizeFilename: true
    });
  }

  /**
   * Validate document files specifically
   */
  static validateDocument(buffer: Buffer, filename: string): FileValidationResult {
    return this.validateFile(buffer, filename, {
      maxSizeBytes: config.upload.maxFileSizeMB * 1024 * 1024,
      allowedMimeTypes: config.upload.allowedDocumentTypes,
      allowedExtensions: ['.pdf', '.doc', '.docx', '.txt'],
      requireExtension: true,
      sanitizeFilename: true
    });
  }

  /**
   * Sanitize filename to prevent path traversal and other attacks
   */
  private static sanitizeFilename(filename: string): string {
    let sanitized = '';
    
    if (filename && typeof filename === 'string') {
      // Remove path separators and dangerous characters
      sanitized = filename
        .replace(/[\/\\:*?"<>|\s]/g, '_') // Replace dangerous characters and spaces
        .replace(/\.\./g, '_') // Prevent path traversal
        .replace(/^\.+/, '') // Remove leading dots
        .trim();
    }

    // Ensure filename isn't empty after sanitization
    if (!sanitized) {
      sanitized = `file_${Date.now()}`;
    }

    // Limit filename length
    const maxLength = 255;
    if (sanitized.length > maxLength) {
      const ext = path.extname(sanitized);
      const name = path.basename(sanitized, ext);
      sanitized = name.substring(0, maxLength - ext.length) + ext;
    }

    return sanitized;
  }

  /**
   * Detect MIME type from file buffer
   */
  private static detectMimeType(buffer: Buffer): string {
    // Check file signatures (magic numbers)
    const signatures: { [key: string]: string } = {
      // Images
      'ffd8ff': 'image/jpeg',
      '89504e47': 'image/png',
      '47494638': 'image/gif',
      '52494646': 'image/webp', // RIFF header, need to check further
      '424d': 'image/bmp',
      
      // Documents
      '25504446': 'application/pdf',
      'd0cf11e0': 'application/msword', // DOC/XLS/PPT
      '504b0304': 'application/zip', // ZIP/DOCX/XLSX/PPTX
      
      // Text
      'efbbbf': 'text/plain', // UTF-8 BOM
    };

    // Get first 8 bytes as hex
    const header = buffer.subarray(0, 8).toString('hex').toLowerCase();
    
    // Check for exact matches
    for (const [signature, mimeType] of Object.entries(signatures)) {
      if (header.startsWith(signature)) {
        // Special case for WEBP
        if (signature === '52494646') {
          const webpSignature = buffer.subarray(8, 12).toString('ascii');
          if (webpSignature === 'WEBP') {
            return 'image/webp';
          }
          continue;
        }
        
        // Special case for Office documents
        if (signature === '504b0304') {
          // Check for Office document signatures in ZIP
          const content = buffer.toString('ascii', 0, Math.min(buffer.length, 1000));
          if (content.includes('word/')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          if (content.includes('xl/')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          if (content.includes('ppt/')) return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          return 'application/zip';
        }
        
        return mimeType;
      }
    }

    // Fallback: try to detect text files
    if (this.isTextFile(buffer)) {
      return 'text/plain';
    }

    return 'application/octet-stream';
  }

  /**
   * Check if buffer contains text data
   */
  private static isTextFile(buffer: Buffer): boolean {
    const sample = buffer.subarray(0, Math.min(buffer.length, 1000));
    let textChars = 0;
    
    for (let i = 0; i < sample.length; i++) {
      const byte = sample[i];
      // Count printable ASCII characters and common whitespace
      if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
        textChars++;
      }
    }
    
    // If more than 95% of characters are text, consider it a text file
    return (textChars / sample.length) > 0.95;
  }

  /**
   * Perform additional security checks on file content
   */
  private static performSecurityChecks(buffer: Buffer, mimeType: string): FileValidationResult {
    // Check for embedded scripts in images
    if (mimeType.startsWith('image/')) {
      const content = buffer.toString('ascii').toLowerCase();
      const scriptPatterns = [
        '<script',
        'javascript:',
        'vbscript:',
        'onload=',
        'onerror=',
        'eval(',
        'document.cookie'
      ];
      
      for (const pattern of scriptPatterns) {
        if (content.includes(pattern)) {
          return {
            isValid: false,
            error: 'File contains potentially malicious content'
          };
        }
      }
    }

    // Check for suspicious PDF content
    if (mimeType === 'application/pdf') {
      const content = buffer.toString('ascii').toLowerCase();
      const suspiciousPatterns = [
        '/javascript',
        '/js',
        '/launch',
        '/openaction'
      ];
      
      for (const pattern of suspiciousPatterns) {
        if (content.includes(pattern)) {
          return {
            isValid: false,
            error: 'PDF contains potentially unsafe content'
          };
        }
      }
    }

    return { isValid: true };
  }

  /**
   * Generate secure filename with timestamp
   */
  static generateSecureFilename(originalFilename: string, prefix?: string): string {
    const sanitized = this.sanitizeFilename(originalFilename);
    const extension = path.extname(sanitized);
    const basename = path.basename(sanitized, extension);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    
    const prefixPart = prefix ? `${prefix}_` : '';
    return `${prefixPart}${timestamp}_${random}_${basename}${extension}`;
  }

  /**
   * Check if file type is allowed for specific context
   */
  static isAllowedFileType(mimeType: string, context: 'profile_image' | 'document' | 'general'): boolean {
    const allowedTypes = {
      profile_image: ['image/jpeg', 'image/png', 'image/webp'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      general: [...config.upload.allowedImageTypes, ...config.upload.allowedDocumentTypes]
    };

    return allowedTypes[context].includes(mimeType);
  }
}

export default FileValidationService;