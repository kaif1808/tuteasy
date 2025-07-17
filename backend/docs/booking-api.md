# Booking System API Documentation

## Overview

The TutEasy booking system provides comprehensive APIs for managing lesson bookings and tutor availability. The system includes transaction handling, audit logging, timezone support, and conflict detection.

## Authentication

All booking endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Base URL

```
https://api.tuteasy.com/api
```

## Booking Endpoints

### 1. Create Booking

**POST** `/bookings`

Creates a new lesson booking with transaction handling and conflict detection.

**Required Roles:** `STUDENT`, `PARENT`

**Request Body:**
```json
{
  "tutorId": "uuid",
  "scheduledDate": "2024-12-25",
  "startTime": "10:00",
  "duration": 60,
  "subject": "Mathematics",
  "qualificationLevel": "GCSE",
  "lessonType": "REGULAR",
  "teachingMode": "ONLINE",
  "studentNotes": "Looking forward to the lesson"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "bookingNumber": "BK001234",
    "studentId": "student-uuid",
    "tutorId": "tutor-uuid",
    "scheduledDate": "2024-12-25",
    "startTime": "10:00",
    "endTime": "11:00",
    "duration": 60,
    "subject": "Mathematics",
    "qualificationLevel": "GCSE",
    "lessonType": "REGULAR",
    "teachingMode": "ONLINE",
    "status": "PENDING",
    "hourlyRate": 30.00,
    "totalPrice": 30.00,
    "currency": "GBP",
    "confirmationCode": "ABC12345",
    "studentNotes": "Looking forward to the lesson",
    "createdAt": "2024-12-20T10:00:00Z",
    "updatedAt": "2024-12-20T10:00:00Z",
    "student": {
      "id": "student-uuid",
      "email": "student@example.com"
    },
    "tutor": {
      "id": "tutor-uuid",
      "user": {
        "email": "tutor@example.com"
      }
    }
  },
  "message": "Booking created successfully",
  "timestamp": "2024-12-20T10:00:00Z"
}
```

**Error Responses:**
- `400` - Validation error
- `409` - Booking conflict
- `404` - Tutor not available

### 2. Get Bookings

**GET** `/bookings`

Retrieves bookings with filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by booking status
- `tutorId` (optional): Filter by tutor ID
- `studentId` (optional): Filter by student ID
- `dateFrom` (optional): Filter from date (YYYY-MM-DD)
- `dateTo` (optional): Filter to date (YYYY-MM-DD)
- `sortBy` (optional): Sort field (scheduledDate, createdAt, status)
- `sortOrder` (optional): Sort order (asc, desc)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking-uuid",
        "bookingNumber": "BK001234",
        "status": "CONFIRMED",
        "scheduledDate": "2024-12-25",
        "startTime": "10:00",
        "endTime": "11:00",
        "subject": "Mathematics",
        "totalPrice": 30.00,
        "student": {
          "id": "student-uuid",
          "email": "student@example.com"
        },
        "tutor": {
          "id": "tutor-uuid",
          "user": {
            "email": "tutor@example.com"
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  },
  "timestamp": "2024-12-20T10:00:00Z"
}
```

### 3. Get Booking by ID

**GET** `/bookings/:id`

Retrieves a specific booking by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "bookingNumber": "BK001234",
    "studentId": "student-uuid",
    "tutorId": "tutor-uuid",
    "scheduledDate": "2024-12-25",
    "startTime": "10:00",
    "endTime": "11:00",
    "duration": 60,
    "subject": "Mathematics",
    "status": "CONFIRMED",
    "totalPrice": 30.00,
    "meetingUrl": "https://zoom.us/j/123456789",
    "student": {
      "id": "student-uuid",
      "email": "student@example.com"
    },
    "tutor": {
      "id": "tutor-uuid",
      "user": {
        "email": "tutor@example.com"
      }
    }
  },
  "timestamp": "2024-12-20T10:00:00Z"
}
```

### 4. Update Booking

**PUT** `/bookings/:id`

Updates an existing booking.

**Request Body:**
```json
{
  "scheduledDate": "2024-12-26",
  "startTime": "11:00",
  "duration": 90,
  "studentNotes": "Updated notes"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "scheduledDate": "2024-12-26",
    "startTime": "11:00",
    "endTime": "12:30",
    "duration": 90,
    "totalPrice": 45.00,
    "updatedAt": "2024-12-20T10:30:00Z"
  },
  "message": "Booking updated successfully",
  "timestamp": "2024-12-20T10:30:00Z"
}
```

### 5. Cancel Booking

**DELETE** `/bookings/:id`

Cancels a booking.

**Request Body:**
```json
{
  "cancellationReason": "Schedule conflict"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "status": "CANCELLED",
    "cancelledAt": "2024-12-20T10:00:00Z",
    "cancelledBy": "student-uuid",
    "cancellationReason": "Schedule conflict"
  },
  "message": "Booking cancelled successfully",
  "timestamp": "2024-12-20T10:00:00Z"
}
```

### 6. Confirm Booking (Tutor Only)

**POST** `/bookings/:id/confirm`

Confirms a booking (tutor only).

**Required Roles:** `TUTOR`

**Request Body:**
```json
{
  "tutorNotes": "Looking forward to teaching!",
  "meetingUrl": "https://zoom.us/j/123456789",
  "meetingId": "123456789",
  "meetingPassword": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "status": "CONFIRMED",
    "confirmedAt": "2024-12-20T10:00:00Z",
    "tutorNotes": "Looking forward to teaching!",
    "meetingUrl": "https://zoom.us/j/123456789"
  },
  "message": "Booking confirmed successfully",
  "timestamp": "2024-12-20T10:00:00Z"
}
```

### 7. Complete Booking

**POST** `/bookings/:id/complete`

Marks a booking as completed.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "status": "COMPLETED",
    "completedAt": "2024-12-25T11:00:00Z"
  },
  "message": "Booking completed successfully",
  "timestamp": "2024-12-25T11:00:00Z"
}
```

## Availability Endpoints

### 1. Create Availability Slot

**POST** `/availability`

Creates a new availability slot for a tutor.

**Required Roles:** `TUTOR`

**Request Body:**
```json
{
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "17:00",
  "isRecurring": true,
  "slotDuration": 60,
  "bufferTime": 15,
  "maxBookings": 1,
  "timezone": "Europe/London",
  "notes": "Available for all subjects"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "availability-uuid",
    "tutorId": "tutor-uuid",
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "17:00",
    "isRecurring": true,
    "isActive": true,
    "slotDuration": 60,
    "bufferTime": 15,
    "maxBookings": 1,
    "timezone": "Europe/London",
    "notes": "Available for all subjects",
    "createdAt": "2024-12-20T10:00:00Z",
    "updatedAt": "2024-12-20T10:00:00Z"
  },
  "message": "Availability created successfully",
  "timestamp": "2024-12-20T10:00:00Z"
}
```

### 2. Get Tutor Availability

**GET** `/availability/tutors/:tutorId`

Retrieves all availability slots for a tutor.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "availability-uuid",
      "tutorId": "tutor-uuid",
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "isRecurring": true,
      "isActive": true,
      "timezone": "Europe/London"
    }
  ],
  "timestamp": "2024-12-20T10:00:00Z"
}
```

### 3. Get Available Dates

**GET** `/availability/tutors/:tutorId/dates`

Gets available dates for a tutor within a date range.

**Query Parameters:**
- `from` (optional): Start date (YYYY-MM-DD)
- `to` (optional): End date (YYYY-MM-DD)
- `timezone` (optional): Timezone for date calculation

**Response (200):**
```json
{
  "success": true,
  "data": {
    "dates": [
      "2024-12-23",
      "2024-12-24",
      "2024-12-30",
      "2024-12-31"
    ]
  },
  "timestamp": "2024-12-20T10:00:00Z"
}
```

### 4. Get Available Time Slots

**GET** `/availability/tutors/:tutorId/slots`

Gets available time slots for a specific date.

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `duration` (optional): Lesson duration in minutes (default: 60)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "date": "2024-12-23",
    "timeSlots": [
      {
        "time": "09:00",
        "available": true,
        "price": 30.00,
        "duration": 60
      },
      {
        "time": "10:00",
        "available": true,
        "price": 30.00,
        "duration": 60
      },
      {
        "time": "11:00",
        "available": false,
        "price": 30.00,
        "duration": 60
      }
    ]
  },
  "timestamp": "2024-12-20T10:00:00Z"
}
```

## Error Handling

All endpoints return structured error responses:

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "There is a scheduling conflict with this booking",
    "details": {
      "conflictingBookingId": "booking-uuid"
    },
    "field": "startTime"
  },
  "timestamp": "2024-12-20T10:00:00Z"
}
```

### Common Error Codes

- `TUTOR_NOT_AVAILABLE` - Tutor is not available at the requested time
- `TIME_SLOT_UNAVAILABLE` - The time slot is already booked
- `BOOKING_CONFLICT` - Scheduling conflict detected
- `BOOKING_NOT_FOUND` - Booking does not exist
- `UNAUTHORIZED_BOOKING_ACCESS` - User lacks permission
- `BOOKING_ALREADY_CANCELLED` - Booking is already cancelled
- `BOOKING_ALREADY_CONFIRMED` - Booking is already confirmed
- `INVALID_TIME_SLOT` - Invalid time format or range
- `PAST_DATE_BOOKING` - Cannot book lessons in the past

## Rate Limiting

- General API: 100 requests per minute per user
- Booking creation: 10 requests per minute per user
- Availability queries: 50 requests per minute per user

## Timezone Support

The system supports international timezones:

- `Europe/London` (default)
- `Europe/Paris`
- `America/New_York`
- `America/Los_Angeles`
- `Asia/Tokyo`
- `Asia/Shanghai`
- `Australia/Sydney`

All times are stored in the tutor's timezone and converted for display.

## Audit Logging

All booking operations are automatically logged for audit purposes:

- Booking creation, updates, cancellations
- Status changes with timestamps
- User actions and IP addresses
- Availability modifications

## Webhooks (Future)

Webhook endpoints will be available for:

- Booking status changes
- Payment confirmations
- Lesson reminders
- Cancellation notifications
