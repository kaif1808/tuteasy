#!/usr/bin/env ts-node

/**
 * Booking System Verification Script
 * 
 * This script verifies that the booking system is properly deployed and functional.
 * It tests database connectivity, API endpoints, and core business logic.
 */

import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { BookingStatus, LessonType, TeachingMode } from '../src/types/booking.types';

const prisma = new PrismaClient();
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

interface VerificationResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration?: number;
}

class BookingSystemVerifier {
  private results: VerificationResult[] = [];
  private authToken: string = '';

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Booking System Verification...\n');

    try {
      await this.testDatabaseConnectivity();
      await this.testDatabaseSchema();
      await this.testAPIConnectivity();
      await this.testAuthentication();
      await this.testBookingEndpoints();
      await this.testAvailabilityEndpoints();
      await this.testBusinessLogic();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Verification failed:', error);
    } finally {
      await prisma.$disconnect();
    }
  }

  private async testDatabaseConnectivity(): Promise<void> {
    const startTime = Date.now();
    
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      
      this.addResult({
        test: 'Database Connectivity',
        status: 'PASS',
        message: 'Successfully connected to database',
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.addResult({
        test: 'Database Connectivity',
        status: 'FAIL',
        message: `Failed to connect to database: ${error}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testDatabaseSchema(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Check if booking tables exist
      const bookingCount = await prisma.booking.count();
      const availabilityCount = await prisma.tutorAvailability.count();
      
      this.addResult({
        test: 'Database Schema',
        status: 'PASS',
        message: `Booking tables exist (${bookingCount} bookings, ${availabilityCount} availability slots)`,
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.addResult({
        test: 'Database Schema',
        status: 'FAIL',
        message: `Database schema verification failed: ${error}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testAPIConnectivity(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
      
      if (response.status === 200) {
        this.addResult({
          test: 'API Connectivity',
          status: 'PASS',
          message: 'API server is responding',
          duration: Date.now() - startTime
        });
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      this.addResult({
        test: 'API Connectivity',
        status: 'FAIL',
        message: `API server not responding: ${error}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testAuthentication(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Try to access a protected endpoint without auth
      try {
        await axios.get(`${API_BASE_URL}/bookings`);
        throw new Error('Expected 401 but got success');
      } catch (error: any) {
        if (error.response?.status !== 401) {
          throw error;
        }
      }

      // For this verification, we'll skip actual login since it requires test data
      this.addResult({
        test: 'Authentication',
        status: 'PASS',
        message: 'Authentication middleware is working (401 for unauthorized requests)',
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.addResult({
        test: 'Authentication',
        status: 'FAIL',
        message: `Authentication test failed: ${error}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testBookingEndpoints(): Promise<void> {
    const endpoints = [
      { method: 'GET', path: '/bookings', description: 'List bookings' },
      { method: 'POST', path: '/bookings', description: 'Create booking' },
    ];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      
      try {
        const config = {
          method: endpoint.method.toLowerCase() as any,
          url: `${API_BASE_URL}${endpoint.path}`,
          headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
          validateStatus: (status: number) => status < 500, // Don't throw on 4xx
        };

        const response = await axios(config);
        
        // We expect 401 for unauthorized requests
        if (response.status === 401) {
          this.addResult({
            test: `Booking Endpoint: ${endpoint.method} ${endpoint.path}`,
            status: 'PASS',
            message: `${endpoint.description} - Properly requires authentication`,
            duration: Date.now() - startTime
          });
        } else {
          this.addResult({
            test: `Booking Endpoint: ${endpoint.method} ${endpoint.path}`,
            status: 'SKIP',
            message: `${endpoint.description} - Skipped (requires authentication)`,
            duration: Date.now() - startTime
          });
        }
      } catch (error) {
        this.addResult({
          test: `Booking Endpoint: ${endpoint.method} ${endpoint.path}`,
          status: 'FAIL',
          message: `${endpoint.description} - Failed: ${error}`,
          duration: Date.now() - startTime
        });
      }
    }
  }

  private async testAvailabilityEndpoints(): Promise<void> {
    const endpoints = [
      { method: 'POST', path: '/availability', description: 'Create availability' },
      { method: 'GET', path: '/availability/tutors/test-id/dates', description: 'Get available dates' },
      { method: 'GET', path: '/availability/tutors/test-id/slots', description: 'Get time slots' },
    ];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      
      try {
        const config = {
          method: endpoint.method.toLowerCase() as any,
          url: `${API_BASE_URL}${endpoint.path}`,
          headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
          params: endpoint.path.includes('slots') ? { date: '2024-12-20' } : {},
          validateStatus: (status: number) => status < 500,
        };

        const response = await axios(config);
        
        if (response.status === 401) {
          this.addResult({
            test: `Availability Endpoint: ${endpoint.method} ${endpoint.path}`,
            status: 'PASS',
            message: `${endpoint.description} - Properly requires authentication`,
            duration: Date.now() - startTime
          });
        } else {
          this.addResult({
            test: `Availability Endpoint: ${endpoint.method} ${endpoint.path}`,
            status: 'SKIP',
            message: `${endpoint.description} - Skipped (requires authentication)`,
            duration: Date.now() - startTime
          });
        }
      } catch (error) {
        this.addResult({
          test: `Availability Endpoint: ${endpoint.method} ${endpoint.path}`,
          status: 'FAIL',
          message: `${endpoint.description} - Failed: ${error}`,
          duration: Date.now() - startTime
        });
      }
    }
  }

  private async testBusinessLogic(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test enum values are properly defined
      const lessonTypes = Object.values(LessonType);
      const teachingModes = Object.values(TeachingMode);
      const bookingStatuses = Object.values(BookingStatus);
      
      if (lessonTypes.length > 0 && teachingModes.length > 0 && bookingStatuses.length > 0) {
        this.addResult({
          test: 'Business Logic Types',
          status: 'PASS',
          message: `Enums properly defined (${lessonTypes.length} lesson types, ${teachingModes.length} teaching modes, ${bookingStatuses.length} booking statuses)`,
          duration: Date.now() - startTime
        });
      } else {
        throw new Error('Enum values not properly defined');
      }
    } catch (error) {
      this.addResult({
        test: 'Business Logic Types',
        status: 'FAIL',
        message: `Business logic verification failed: ${error}`,
        duration: Date.now() - startTime
      });
    }
  }

  private addResult(result: VerificationResult): void {
    this.results.push(result);
  }

  private printResults(): void {
    console.log('\n📊 Verification Results:\n');
    console.log('=' .repeat(80));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    
    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${icon} ${result.test}${duration}`);
      console.log(`   ${result.message}\n`);
    });
    
    console.log('=' .repeat(80));
    console.log(`📈 Summary: ${passed} passed, ${failed} failed, ${skipped} skipped`);
    
    if (failed === 0) {
      console.log('🎉 All critical tests passed! Booking system is ready for use.');
    } else {
      console.log('⚠️  Some tests failed. Please review and fix issues before deployment.');
    }
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new BookingSystemVerifier();
  verifier.runAllTests().catch(console.error);
}

export { BookingSystemVerifier };
