import { Request, Response } from 'express';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie
} from '../../utils/cookieUtils';

describe('Cookie Security Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      cookies: {}
    };
    mockResponse = {
      cookie: jest.fn(),
      clearCookie: jest.fn()
    };
  });

  describe('setRefreshTokenCookie', () => {
    it('should set refresh token cookie with secure options', () => {
      const token = 'refresh-token-123';
      
      setRefreshTokenCookie(mockResponse as Response, token);

      expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      });
    });

    it('should use secure flag in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const token = 'refresh-token-123';
      setRefreshTokenCookie(mockResponse as Response, token);

      expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not use secure flag in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const token = 'refresh-token-123';
      setRefreshTokenCookie(mockResponse as Response, token);

      expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle empty token', () => {
      const token = '';
      setRefreshTokenCookie(mockResponse as Response, token);

      expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });
    });

    it('should handle long token values', () => {
      const longToken = 'a'.repeat(1000);
      setRefreshTokenCookie(mockResponse as Response, longToken);

      expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', longToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });
    });
  });

  describe('clearRefreshTokenCookie', () => {
    it('should clear refresh token cookie with secure options', () => {
      clearRefreshTokenCookie(mockResponse as Response);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
    });

    it('should use secure flag in production when clearing', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      clearRefreshTokenCookie(mockResponse as Response);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/'
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not use secure flag in development when clearing', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      clearRefreshTokenCookie(mockResponse as Response);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/'
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('getRefreshTokenFromCookie', () => {
    it('should retrieve refresh token from cookies', () => {
      mockRequest.cookies = {
        refreshToken: 'refresh-token-123'
      };

      const token = getRefreshTokenFromCookie(mockRequest as Request);

      expect(token).toBe('refresh-token-123');
    });

    it('should return undefined when refresh token cookie is missing', () => {
      mockRequest.cookies = {};

      const token = getRefreshTokenFromCookie(mockRequest as Request);

      expect(token).toBeUndefined();
    });

    it('should return undefined when cookies object is missing', () => {
      mockRequest.cookies = undefined;

      const token = getRefreshTokenFromCookie(mockRequest as Request);

      expect(token).toBeUndefined();
    });

    it('should handle empty refresh token cookie', () => {
      mockRequest.cookies = {
        refreshToken: ''
      };

      const token = getRefreshTokenFromCookie(mockRequest as Request);

      expect(token).toBe('');
    });

    it('should handle other cookies present', () => {
      mockRequest.cookies = {
        sessionId: 'session-123',
        refreshToken: 'refresh-token-123',
        preferences: 'dark-mode'
      };

      const token = getRefreshTokenFromCookie(mockRequest as Request);

      expect(token).toBe('refresh-token-123');
    });

    it('should handle malformed cookie values', () => {
      mockRequest.cookies = {
        refreshToken: null
      };

      const token = getRefreshTokenFromCookie(mockRequest as Request);

      expect(token).toBeNull();
    });
  });

  describe('Cookie Security Configuration', () => {
    it('should enforce HttpOnly flag to prevent XSS', () => {
      const token = 'test-token';
      setRefreshTokenCookie(mockResponse as Response, token);

      const cookieCall = (mockResponse.cookie as jest.Mock).mock.calls[0];
      expect(cookieCall[2].httpOnly).toBe(true);
    });

    it('should enforce SameSite strict to prevent CSRF', () => {
      const token = 'test-token';
      setRefreshTokenCookie(mockResponse as Response, token);

      const cookieCall = (mockResponse.cookie as jest.Mock).mock.calls[0];
      expect(cookieCall[2].sameSite).toBe('strict');
    });

    it('should set appropriate expiration time', () => {
      const token = 'test-token';
      setRefreshTokenCookie(mockResponse as Response, token);

      const cookieCall = (mockResponse.cookie as jest.Mock).mock.calls[0];
      const expectedMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      expect(cookieCall[2].maxAge).toBe(expectedMaxAge);
    });

    it('should set path to root for accessibility', () => {
      const token = 'test-token';
      setRefreshTokenCookie(mockResponse as Response, token);

      const cookieCall = (mockResponse.cookie as jest.Mock).mock.calls[0];
      expect(cookieCall[2].path).toBe('/');
    });
  });

  describe('Cookie Security Edge Cases', () => {
    it('should handle special characters in token', () => {
      const tokenWithSpecialChars = 'token.with-special_chars+123=';
      setRefreshTokenCookie(mockResponse as Response, tokenWithSpecialChars);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken', 
        tokenWithSpecialChars, 
        expect.any(Object)
      );
    });

    it('should handle Unicode characters in token', () => {
      const unicodeToken = 'token-with-unicode-🔒-chars';
      setRefreshTokenCookie(mockResponse as Response, unicodeToken);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken', 
        unicodeToken, 
        expect.any(Object)
      );
    });

    it('should maintain consistent options between set and clear', () => {
      const token = 'test-token';
      
      setRefreshTokenCookie(mockResponse as Response, token);
      const setOptions = (mockResponse.cookie as jest.Mock).mock.calls[0][2];
      
      clearRefreshTokenCookie(mockResponse as Response);
      const clearOptions = (mockResponse.clearCookie as jest.Mock).mock.calls[0][1];

      // Compare relevant options (excluding maxAge which is not used in clearCookie)
      expect(setOptions.httpOnly).toBe(clearOptions.httpOnly);
      expect(setOptions.secure).toBe(clearOptions.secure);
      expect(setOptions.sameSite).toBe(clearOptions.sameSite);
      expect(setOptions.path).toBe(clearOptions.path);
    });
  });

  describe('Environment-Specific Security', () => {
    it('should adapt security settings based on environment', () => {
      const environments = ['development', 'test', 'production'];
      
      environments.forEach(env => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = env;
        
        const token = 'test-token';
        setRefreshTokenCookie(mockResponse as Response, token);
        
        const cookieCall = (mockResponse.cookie as jest.Mock).mock.calls[0];
        const expectedSecure = env === 'production';
        
        expect(cookieCall[2].secure).toBe(expectedSecure);
        
        process.env.NODE_ENV = originalEnv;
        jest.clearAllMocks();
      });
    });
  });

  describe('Cookie Name Security', () => {
    it('should use consistent cookie name', () => {
      const token = 'test-token';
      setRefreshTokenCookie(mockResponse as Response, token);

      const cookieCall = (mockResponse.cookie as jest.Mock).mock.calls[0];
      expect(cookieCall[0]).toBe('refreshToken');
    });

    it('should use same cookie name for clearing', () => {
      clearRefreshTokenCookie(mockResponse as Response);

      const clearCall = (mockResponse.clearCookie as jest.Mock).mock.calls[0];
      expect(clearCall[0]).toBe('refreshToken');
    });

    it('should retrieve using correct cookie name', () => {
      mockRequest.cookies = {
        refreshToken: 'test-token',
        wrongName: 'wrong-token'
      };

      const token = getRefreshTokenFromCookie(mockRequest as Request);
      expect(token).toBe('test-token');
    });
  });
});
