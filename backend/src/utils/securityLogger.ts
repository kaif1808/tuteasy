import { Request } from 'express';

// Security event types
export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  REGISTRATION_SUCCESS = 'REGISTRATION_SUCCESS',
  REGISTRATION_FAILURE = 'REGISTRATION_FAILURE',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
  PASSWORD_RESET_FAILURE = 'PASSWORD_RESET_FAILURE',
  TOKEN_REFRESH_SUCCESS = 'TOKEN_REFRESH_SUCCESS',
  TOKEN_REFRESH_FAILURE = 'TOKEN_REFRESH_FAILURE',
  LOGOUT_SUCCESS = 'LOGOUT_SUCCESS',
  EMAIL_VERIFICATION_SUCCESS = 'EMAIL_VERIFICATION_SUCCESS',
  EMAIL_VERIFICATION_FAILURE = 'EMAIL_VERIFICATION_FAILURE',
  ACCOUNT_LOCKOUT = 'ACCOUNT_LOCKOUT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

// Security event interface
interface SecurityEvent {
  timestamp: string;
  eventType: SecurityEventType;
  userId?: string;
  email?: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  additionalData?: Record<string, any>;
}

// Extract client information from request
const getClientInfo = (req: Request) => {
  return {
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
  };
};

// Log security event
export const logSecurityEvent = (
  eventType: SecurityEventType,
  req: Request,
  options: {
    userId?: string;
    email?: string;
    success: boolean;
    errorMessage?: string;
    additionalData?: Record<string, any>;
  }
): void => {
  const { ipAddress, userAgent } = getClientInfo(req);
  
  const event: SecurityEvent = {
    timestamp: new Date().toISOString(),
    eventType,
    userId: options.userId,
    email: options.email,
    ipAddress,
    userAgent,
    success: options.success,
    errorMessage: options.errorMessage,
    additionalData: options.additionalData,
  };

  // In production, this should be sent to a proper logging service
  // For now, we'll use structured console logging
  if (options.success) {
    console.info('SECURITY_EVENT', JSON.stringify(event));
  } else {
    console.warn('SECURITY_EVENT_FAILURE', JSON.stringify(event));
  }

  // Additional alerting for critical events
  if (shouldAlert(eventType, options.success)) {
    console.error('SECURITY_ALERT', JSON.stringify({
      ...event,
      severity: 'HIGH',
      requiresAttention: true,
    }));
  }
};

// Determine if an event should trigger an alert
const shouldAlert = (eventType: SecurityEventType, success: boolean): boolean => {
  // Alert on failures for critical events
  if (!success) {
    switch (eventType) {
      case SecurityEventType.LOGIN_FAILURE:
      case SecurityEventType.TOKEN_REFRESH_FAILURE:
      case SecurityEventType.SUSPICIOUS_ACTIVITY:
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        return true;
      default:
        return false;
    }
  }

  // Alert on successful critical events
  switch (eventType) {
    case SecurityEventType.ACCOUNT_LOCKOUT:
    case SecurityEventType.SUSPICIOUS_ACTIVITY:
      return true;
    default:
      return false;
  }
};

// Helper functions for common security events
export const logLoginAttempt = (req: Request, email: string, success: boolean, errorMessage?: string, userId?: string) => {
  logSecurityEvent(
    success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILURE,
    req,
    { email, success, errorMessage, userId }
  );
};

export const logRegistrationAttempt = (req: Request, email: string, success: boolean, errorMessage?: string, userId?: string) => {
  logSecurityEvent(
    success ? SecurityEventType.REGISTRATION_SUCCESS : SecurityEventType.REGISTRATION_FAILURE,
    req,
    { email, success, errorMessage, userId }
  );
};

export const logPasswordResetRequest = (req: Request, email: string, success: boolean, errorMessage?: string) => {
  logSecurityEvent(SecurityEventType.PASSWORD_RESET_REQUEST, req, { email, success, errorMessage });
};

export const logTokenRefresh = (req: Request, userId: string, success: boolean, errorMessage?: string) => {
  logSecurityEvent(
    success ? SecurityEventType.TOKEN_REFRESH_SUCCESS : SecurityEventType.TOKEN_REFRESH_FAILURE,
    req,
    { userId, success, errorMessage }
  );
};

export const logLogout = (req: Request, userId: string, success: boolean, errorMessage?: string) => {
  logSecurityEvent(SecurityEventType.LOGOUT_SUCCESS, req, { userId, success, errorMessage });
};

export const logRateLimitExceeded = (req: Request, endpoint: string) => {
  logSecurityEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, req, {
    success: false,
    errorMessage: `Rate limit exceeded for endpoint: ${endpoint}`,
    additionalData: { endpoint },
  });
};
