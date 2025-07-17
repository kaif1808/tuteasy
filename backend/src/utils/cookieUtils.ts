import { Response } from 'express';

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

// Cookie options for refresh token
export const getRefreshTokenCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true, // Prevents XSS attacks by making cookie inaccessible to JavaScript
    secure: isProduction, // Only send over HTTPS in production
    sameSite: 'strict' as const, // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/', // Cookie available for all paths
  };
};

// Set refresh token cookie
export const setRefreshTokenCookie = (res: Response, refreshToken: string): void => {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshTokenCookieOptions());
};

// Clear refresh token cookie
export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
};

// Extract refresh token from cookie
export const getRefreshTokenFromCookie = (req: any): string | undefined => {
  return req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
};
