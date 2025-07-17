// Test setup file for booking system tests
import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/tuteasy_test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock Date.now for consistent testing
const mockDate = new Date('2024-12-15T10:00:00Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
Date.now = jest.fn(() => mockDate.getTime());

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  createMockUser: (overrides = {}) => ({
    id: 'user-1',
    email: 'test@example.com',
    role: 'STUDENT',
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockTutor: (overrides = {}) => ({
    id: 'tutor-1',
    userId: 'tutor-user-1',
    bio: 'Experienced tutor',
    hourlyRateMin: 30.00,
    hourlyRateMax: 50.00,
    isActive: true,
    verificationStatus: 'VERIFIED',
    user: {
      email: 'tutor@example.com',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockBooking: (overrides = {}) => ({
    id: 'booking-1',
    bookingNumber: 'BK001',
    studentId: 'student-1',
    tutorId: 'tutor-1',
    scheduledDate: new Date('2024-12-20'),
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    status: 'PENDING',
    hourlyRate: 30.00,
    totalPrice: 30.00,
    currency: 'GBP',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockAvailability: (overrides = {}) => ({
    id: 'availability-1',
    tutorId: 'tutor-1',
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: true,
    isActive: true,
    slotDuration: 60,
    bufferTime: 15,
    maxBookings: 1,
    timezone: 'Europe/London',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
};

// Extend global types
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        createMockUser: (overrides?: any) => any;
        createMockTutor: (overrides?: any) => any;
        createMockBooking: (overrides?: any) => any;
        createMockAvailability: (overrides?: any) => any;
      };
    }
  }
}
