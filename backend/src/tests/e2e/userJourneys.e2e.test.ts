import { test, expect } from '@playwright/test';

// E2E tests for critical user journeys
// These tests run against the full application stack

test.describe('User Authentication Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');
  });

  test('should complete user registration flow', async ({ page }) => {
    // Navigate to registration page
    await page.click('text=Sign up');
    await expect(page).toHaveURL(/.*register/);

    // Fill registration form
    await page.fill('[data-testid="firstName"]', 'John');
    await page.fill('[data-testid="lastName"]', 'Doe');
    await page.fill('[data-testid="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[data-testid="password"]', 'SecurePass123!');
    await page.fill('[data-testid="confirmPassword"]', 'SecurePass123!');
    await page.selectOption('[data-testid="role"]', 'STUDENT');
    await page.check('[data-testid="termsAccepted"]');

    // Submit registration
    await page.click('[data-testid="submit-button"]');

    // Verify success message
    await expect(page.locator('text=Registration successful')).toBeVisible();
    
    // Should redirect to email verification notice
    await expect(page).toHaveURL(/.*verify-email-notice/);
  });

  test('should complete user login flow', async ({ page }) => {
    // First register a user (using API to avoid UI dependency)
    const email = `test-login-${Date.now()}@example.com`;
    await page.request.post('http://localhost:3001/api/auth/register', {
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: email,
        password: 'SecurePass123!',
        role: 'STUDENT'
      }
    });

    // Navigate to login page
    await page.click('text=Sign in');
    await expect(page).toHaveURL(/.*login/);

    // Fill login form
    await page.fill('[data-testid="email"]', email);
    await page.fill('[data-testid="password"]', 'SecurePass123!');

    // Submit login
    await page.click('[data-testid="submit-button"]');

    // Verify successful login - should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Sign in');

    // Fill login form with invalid credentials
    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');

    // Submit login
    await page.click('[data-testid="submit-button"]');

    // Verify error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
    
    // Should remain on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should handle password reset flow', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Sign in');

    // Click forgot password link
    await page.click('text=Forgot password');
    await expect(page).toHaveURL(/.*forgot-password/);

    // Fill email for password reset
    await page.fill('[data-testid="email"]', 'test@example.com');

    // Submit password reset request
    await page.click('[data-testid="submit-button"]');

    // Verify success message
    await expect(page.locator('text=password reset link has been sent')).toBeVisible();
  });
});

test.describe('Profile Management Journey', () => {
  test.beforeEach(async ({ page, context }) => {
    // Create and login a test user
    const email = `test-profile-${Date.now()}@example.com`;
    
    // Register user via API
    await page.request.post('http://localhost:3001/api/auth/register', {
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: email,
        password: 'SecurePass123!',
        role: 'STUDENT'
      }
    });

    // Login via API to get auth token
    const loginResponse = await page.request.post('http://localhost:3001/api/auth/login', {
      data: {
        email: email,
        password: 'SecurePass123!'
      }
    });

    const loginData = await loginResponse.json();
    
    // Set auth token in browser storage
    await page.goto('http://localhost:5173');
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, loginData.accessToken);

    // Navigate to dashboard
    await page.goto('http://localhost:5173/dashboard');
  });

  test('should complete student profile creation', async ({ page }) => {
    // Navigate to student profile page
    await page.click('text=Manage Your Profile');
    await expect(page).toHaveURL(/.*student-profile/);

    // Fill student profile form
    await page.selectOption('[data-testid="ukYearGroup"]', 'YEAR_11');
    await page.selectOption('[data-testid="schoolType"]', 'STATE_SCHOOL');
    await page.fill('[data-testid="schoolName"]', 'Test High School');
    await page.selectOption('[data-testid="schoolCountry"]', 'United Kingdom');

    // Add subject interest
    await page.click('[data-testid="add-subject-button"]');
    await page.fill('[data-testid="subject-name"]', 'Mathematics');
    await page.selectOption('[data-testid="qualification-level"]', 'GCSE');
    await page.selectOption('[data-testid="target-grade"]', 'A');
    await page.click('[data-testid="save-subject-button"]');

    // Save profile
    await page.click('[data-testid="save-profile-button"]');

    // Verify success message
    await expect(page.locator('text=Profile saved successfully')).toBeVisible();
  });

  test('should complete tutor profile creation', async ({ page }) => {
    // First create a tutor user
    const email = `tutor-${Date.now()}@example.com`;
    
    await page.request.post('http://localhost:3001/api/auth/register', {
      data: {
        firstName: 'Tutor',
        lastName: 'User',
        email: email,
        password: 'SecurePass123!',
        role: 'TUTOR'
      }
    });

    const loginResponse = await page.request.post('http://localhost:3001/api/auth/login', {
      data: {
        email: email,
        password: 'SecurePass123!'
      }
    });

    const loginData = await loginResponse.json();
    
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, loginData.accessToken);

    // Navigate to tutor profile page
    await page.goto('http://localhost:5173/tutor-profile');

    // Fill tutor profile form
    await page.fill('[data-testid="bio"]', 'Experienced mathematics tutor with 5 years of experience.');
    await page.fill('[data-testid="hourlyRateMin"]', '25');
    await page.fill('[data-testid="hourlyRateMax"]', '40');
    await page.selectOption('[data-testid="experienceLevel"]', 'EXPERIENCED');

    // Add subject
    await page.click('[data-testid="add-subject-button"]');
    await page.fill('[data-testid="subject-name"]', 'Mathematics');
    await page.selectOption('[data-testid="qualification-level"]', 'A_LEVEL');
    await page.selectOption('[data-testid="exam-board"]', 'AQA');
    await page.click('[data-testid="save-subject-button"]');

    // Save profile
    await page.click('[data-testid="save-profile-button"]');

    // Verify success message
    await expect(page.locator('text=Profile saved successfully')).toBeVisible();
  });
});

test.describe('Booking Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Create student and tutor users, then login as student
    const studentEmail = `student-${Date.now()}@example.com`;
    const tutorEmail = `tutor-${Date.now()}@example.com`;

    // Create tutor
    await page.request.post('http://localhost:3001/api/auth/register', {
      data: {
        firstName: 'Tutor',
        lastName: 'Smith',
        email: tutorEmail,
        password: 'SecurePass123!',
        role: 'TUTOR'
      }
    });

    // Create student
    await page.request.post('http://localhost:3001/api/auth/register', {
      data: {
        firstName: 'Student',
        lastName: 'Jones',
        email: studentEmail,
        password: 'SecurePass123!',
        role: 'STUDENT'
      }
    });

    // Login as student
    const loginResponse = await page.request.post('http://localhost:3001/api/auth/login', {
      data: {
        email: studentEmail,
        password: 'SecurePass123!'
      }
    });

    const loginData = await loginResponse.json();
    
    await page.goto('http://localhost:5173');
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, loginData.accessToken);
  });

  test('should complete tutor search and booking flow', async ({ page }) => {
    // Navigate to tutor search
    await page.goto('http://localhost:5173/find-a-tutor');

    // Search for tutors
    await page.fill('[data-testid="search-subject"]', 'Mathematics');
    await page.click('[data-testid="search-button"]');

    // Wait for search results
    await expect(page.locator('[data-testid="tutor-card"]').first()).toBeVisible();

    // Click on first tutor to view profile
    await page.click('[data-testid="tutor-card"]');

    // Book a lesson
    await page.click('[data-testid="book-lesson-button"]');

    // Select date and time
    await page.click('[data-testid="calendar-date"]');
    await page.click('[data-testid="time-slot"]');

    // Confirm booking
    await page.click('[data-testid="confirm-booking-button"]');

    // Verify booking confirmation
    await expect(page.locator('text=Booking confirmed')).toBeVisible();
  });
});

test.describe('Error Handling and Edge Cases', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/**', route => route.abort());

    await page.goto('http://localhost:5173/login');

    // Try to login
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'SecurePass123!');
    await page.click('[data-testid="submit-button"]');

    // Should show network error message
    await expect(page.locator('text=Network error')).toBeVisible();
  });

  test('should handle session expiration', async ({ page }) => {
    // Login with expired token
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'expired-token');
    });

    // Try to access protected route
    await page.goto('http://localhost:5173/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('http://localhost:5173/register');

    // Try to submit empty form
    await page.click('[data-testid="submit-button"]');

    // Should show validation errors
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="email"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="password"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="submit-button"]')).toBeFocused();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    // Check for ARIA labels
    const emailInput = page.locator('[data-testid="email"]');
    await expect(emailInput).toHaveAttribute('aria-label');

    const passwordInput = page.locator('[data-testid="password"]');
    await expect(passwordInput).toHaveAttribute('aria-label');
  });
});

test.describe('Performance', () => {
  test('should load pages within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:5173');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    // This would test with a large number of tutors/bookings
    // Implementation depends on test data setup
    await page.goto('http://localhost:5173/find-a-tutor');
    
    // Measure search performance
    const startTime = Date.now();
    await page.fill('[data-testid="search-subject"]', 'Mathematics');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="tutor-card"]');
    const searchTime = Date.now() - startTime;
    
    // Search should complete within 2 seconds
    expect(searchTime).toBeLessThan(2000);
  });
});
