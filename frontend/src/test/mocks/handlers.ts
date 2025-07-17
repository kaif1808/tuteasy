import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:3001/api';

export const handlers = [
  // Authentication endpoints
  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as any;
    
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { error: 'Registration failed. Please check your information and try again.' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      status: 'success',
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: 'user-123',
        email: body.email,
        role: body.role,
        isEmailVerified: false
      },
      accessToken: 'mock-access-token'
    }, { status: 201 });
  }),

  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as any;
    
    if (body.email === 'invalid@example.com' || body.password === 'wrongpassword') {
      return HttpResponse.json(
        { error: 'Invalid email or password. Please check your credentials and try again.' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      status: 'success',
      message: 'Login successful',
      user: {
        id: 'user-123',
        email: body.email,
        role: 'STUDENT',
        isEmailVerified: true,
        lastLoginAt: new Date().toISOString()
      },
      accessToken: 'mock-access-token'
    });
  }),

  http.post(`${API_BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({
      status: 'success',
      message: 'Logout successful'
    });
  }),

  http.post(`${API_BASE_URL}/auth/refresh-token`, () => {
    return HttpResponse.json({
      status: 'success',
      accessToken: 'new-mock-access-token'
    });
  }),

  http.post(`${API_BASE_URL}/auth/verify-email`, async ({ request }) => {
    const body = await request.json() as any;
    
    if (body.token === 'invalid-token') {
      return HttpResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      status: 'success',
      message: 'Email verified successfully'
    });
  }),

  http.post(`${API_BASE_URL}/auth/request-password-reset`, () => {
    return HttpResponse.json({
      status: 'success',
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }),

  http.post(`${API_BASE_URL}/auth/reset-password`, async ({ request }) => {
    const body = await request.json() as any;
    
    if (body.token === 'invalid-token') {
      return HttpResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      status: 'success',
      message: 'Password reset successful'
    });
  }),

  // Profile endpoints
  http.get(`${API_BASE_URL}/profiles/tutor`, () => {
    return HttpResponse.json({
      id: 'tutor-123',
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Experienced mathematics tutor',
      hourlyRateMin: 30,
      hourlyRateMax: 50,
      subjects: [],
      qualifications: []
    });
  }),

  http.get(`${API_BASE_URL}/profiles/student`, () => {
    return HttpResponse.json({
      id: 'student-123',
      firstName: 'Jane',
      lastName: 'Smith',
      ukYearGroup: 'YEAR_11',
      subjectInterests: []
    });
  }),

  http.get(`${API_BASE_URL}/profiles/parent`, () => {
    return HttpResponse.json({
      id: 'parent-123',
      firstName: 'Robert',
      lastName: 'Johnson',
      phoneNumber: '+44 7700 900123',
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '+44 7700 900456',
        email: 'emergency@example.com'
      }
    });
  }),

  // Booking endpoints
  http.get(`${API_BASE_URL}/bookings`, () => {
    return HttpResponse.json({
      status: 'success',
      bookings: [
        {
          id: 'booking-1',
          tutorId: 'tutor-123',
          subject: 'Mathematics',
          startTime: '2024-01-15T10:00:00Z',
          endTime: '2024-01-15T11:00:00Z',
          status: 'CONFIRMED'
        }
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    });
  }),

  http.post(`${API_BASE_URL}/bookings`, async ({ request }) => {
    const body = await request.json() as any;
    
    return HttpResponse.json({
      status: 'success',
      message: 'Booking created successfully',
      booking: {
        id: 'booking-new',
        tutorId: body.tutorId,
        subject: body.subject,
        startTime: body.startTime,
        endTime: new Date(new Date(body.startTime).getTime() + body.duration * 60000).toISOString(),
        status: 'PENDING',
        totalAmount: 50.00,
        currency: 'GBP'
      }
    }, { status: 201 });
  }),

  // Search endpoints
  http.get(`${API_BASE_URL}/search/tutors`, ({ request }) => {
    const url = new URL(request.url);
    const subject = url.searchParams.get('subject');
    
    return HttpResponse.json({
      status: 'success',
      tutors: [
        {
          id: 'tutor-1',
          firstName: 'Alice',
          lastName: 'Wilson',
          bio: 'Mathematics specialist',
          hourlyRateMin: 25,
          hourlyRateMax: 40,
          rating: 4.8,
          totalReviews: 15,
          subjects: subject ? [subject] : ['Mathematics', 'Physics']
        },
        {
          id: 'tutor-2',
          firstName: 'Bob',
          lastName: 'Brown',
          bio: 'Science tutor',
          hourlyRateMin: 30,
          hourlyRateMax: 45,
          rating: 4.6,
          totalReviews: 12,
          subjects: ['Physics', 'Chemistry']
        }
      ],
      pagination: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    });
  }),

  // Error simulation endpoints
  http.get(`${API_BASE_URL}/test/server-error`, () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }),

  http.get(`${API_BASE_URL}/test/network-error`, () => {
    return HttpResponse.error();
  }),

  // Rate limiting simulation
  http.post(`${API_BASE_URL}/test/rate-limit`, () => {
    return HttpResponse.json(
      { 
        error: 'Too many requests. Please try again later.',
        retryAfter: 900 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': '900',
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + 900000)
        }
      }
    );
  })
];

// Helper function to create custom handlers for specific tests
export const createMockHandler = (endpoint: string, response: any, status = 200) => {
  return http.get(`${API_BASE_URL}${endpoint}`, () => {
    return HttpResponse.json(response, { status });
  });
};

// Helper function to create error handlers
export const createErrorHandler = (endpoint: string, status = 500, error = 'Internal server error') => {
  return http.get(`${API_BASE_URL}${endpoint}`, () => {
    return HttpResponse.json({ error }, { status });
  });
};
