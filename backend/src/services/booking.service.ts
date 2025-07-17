import { PrismaClient } from '@prisma/client';
import {
  CreateBookingRequest,
  UpdateBookingRequest,
  CancelBookingRequest,
  ConfirmBookingRequest,
  BookingResponse,
  BookingListResponse,
  BookingQueryParams,
  BookingStatus,
  LessonType,
  TeachingMode
} from '../types/booking.types';
import {
  BookingErrorCode,
  BookingConflictError,
  BookingPermissionError,
  createBookingError
} from '../types/booking.errors';

export class BookingService {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }
  /**
   * Create a new booking
   */
  async createBooking(
    studentId: string,
    bookingData: CreateBookingRequest
  ): Promise<BookingResponse> {
    // Validate student exists and is not a tutor trying to book themselves
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { tutor: true }
    });

    if (!student) {
      throw createBookingError(BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS);
    }

    if (student.tutor?.id === bookingData.tutorId) {
      throw createBookingError(BookingErrorCode.CANNOT_BOOK_OWN_LESSONS);
    }

    // Validate tutor exists and is active
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: bookingData.tutorId },
      include: { user: true }
    });

    if (!tutor) {
      throw createBookingError(BookingErrorCode.TUTOR_NOT_AVAILABLE);
    }

    if (!tutor.isActive) {
      throw createBookingError(BookingErrorCode.TUTOR_INACTIVE);
    }

    if (tutor.verificationStatus !== 'VERIFIED') {
      throw createBookingError(BookingErrorCode.TUTOR_NOT_VERIFIED);
    }

    // Validate booking date and time
    const scheduledDate = new Date(bookingData.scheduledDate);
    const now = new Date();
    
    // Check if booking is in the past
    if (scheduledDate < now) {
      throw createBookingError(BookingErrorCode.PAST_DATE_BOOKING);
    }

    // Check minimum advance booking time (2 hours)
    const minAdvanceTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const bookingDateTime = new Date(`${bookingData.scheduledDate}T${bookingData.startTime}`);
    
    if (bookingDateTime < minAdvanceTime) {
      throw createBookingError(BookingErrorCode.BOOKING_TOO_LATE);
    }

    // Check maximum advance booking time (3 months)
    const maxAdvanceTime = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    if (bookingDateTime > maxAdvanceTime) {
      throw createBookingError(BookingErrorCode.BOOKING_TOO_EARLY);
    }

    // Calculate end time
    const endTime = this.calculateEndTime(bookingData.startTime, bookingData.duration);

    // Check for availability and conflicts
    await this.checkAvailabilityAndConflicts(
      bookingData.tutorId,
      scheduledDate,
      bookingData.startTime,
      endTime
    );

    // Calculate pricing
    const pricing = await this.calculatePricing(
      bookingData.tutorId,
      bookingData.duration,
      bookingData.subject
    );

    // Create the booking
    const booking = await this.prisma.booking.create({
      data: {
        studentId,
        tutorId: bookingData.tutorId,
        scheduledDate,
        startTime: bookingData.startTime,
        endTime,
        duration: bookingData.duration,
        subject: bookingData.subject,
        qualificationLevel: bookingData.qualificationLevel,
        lessonType: bookingData.lessonType || LessonType.REGULAR,
        teachingMode: bookingData.teachingMode || TeachingMode.ONLINE,
        status: BookingStatus.PENDING,
        hourlyRate: pricing.hourlyRate,
        totalPrice: pricing.totalPrice,
        currency: 'GBP',
        studentNotes: bookingData.studentNotes,
        confirmationCode: this.generateConfirmationCode(),
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            studentProfile: {
              select: {
                id: true,
                gradeLevel: true,
              }
            }
          }
        },
        tutor: {
          include: {
            user: {
              select: {
                email: true,
              }
            }
          }
        }
      }
    });

    return this.formatBookingResponse(booking);
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string, userId: string): Promise<BookingResponse> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            studentProfile: {
              select: {
                id: true,
                gradeLevel: true,
              }
            }
          }
        },
        tutor: {
          include: {
            user: {
              select: {
                email: true,
              }
            }
          }
        }
      }
    });

    if (!booking) {
      throw createBookingError(BookingErrorCode.BOOKING_NOT_FOUND);
    }

    // Check permissions - need to get tutor info separately since it's not included
    const bookingTutor = await this.prisma.tutor.findUnique({
      where: { id: booking.tutorId },
      select: { userId: true }
    });

    if (booking.studentId !== userId && bookingTutor?.userId !== userId) {
      throw new BookingPermissionError(
        BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS,
        'You do not have permission to access this booking',
        userId,
        bookingId
      );
    }

    return this.formatBookingResponse(booking);
  }

  /**
   * Get bookings with filtering and pagination
   */
  async getBookings(
    userId: string,
    userRole: string,
    queryParams: BookingQueryParams
  ): Promise<BookingListResponse> {
    const {
      page = 1,
      limit = 10,
      status,
      tutorId,
      studentId,
      dateFrom,
      dateTo,
      sortBy = 'scheduledDate',
      sortOrder = 'asc'
    } = queryParams;

    // Build where clause based on user role and permissions
    let whereClause: any = {};

    if (userRole === 'STUDENT') {
      whereClause.studentId = userId;
    } else if (userRole === 'TUTOR') {
      const tutor = await this.prisma.tutor.findUnique({
        where: { userId }
      });
      if (tutor) {
        whereClause.tutorId = tutor.id;
      }
    }

    // Apply additional filters
    if (status) {
      whereClause.status = status;
    }

    if (tutorId && userRole !== 'TUTOR') {
      whereClause.tutorId = tutorId;
    }

    if (studentId && userRole !== 'STUDENT') {
      whereClause.studentId = studentId;
    }

    if (dateFrom || dateTo) {
      whereClause.scheduledDate = {};
      if (dateFrom) {
        whereClause.scheduledDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.scheduledDate.lte = new Date(dateTo);
      }
    }

    // Get total count
    const total = await this.prisma.booking.count({ where: whereClause });

    // Get bookings
    const bookings = await this.prisma.booking.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            email: true,
            studentProfile: {
              select: {
                id: true,
                gradeLevel: true,
              }
            }
          }
        },
        tutor: {
          include: {
            user: {
              select: {
                email: true,
              }
            }
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      bookings: bookings.map(booking => this.formatBookingResponse(booking)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Update booking
   */
  async updateBooking(
    bookingId: string,
    userId: string,
    updateData: UpdateBookingRequest
  ): Promise<BookingResponse> {
    const booking = await this.getBookingById(bookingId, userId);

    // Check if booking can be updated
    if (booking.status === BookingStatus.CANCELLED) {
      throw createBookingError(BookingErrorCode.BOOKING_ALREADY_CANCELLED);
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw createBookingError(BookingErrorCode.BOOKING_ALREADY_COMPLETED);
    }

    // Prepare update data
    const updateFields: any = {};

    if (updateData.scheduledDate) {
      updateFields.scheduledDate = new Date(updateData.scheduledDate);
    }

    if (updateData.startTime) {
      updateFields.startTime = updateData.startTime;
    }

    if (updateData.duration) {
      updateFields.duration = updateData.duration;
    }

    if (updateData.startTime && updateData.duration) {
      updateFields.endTime = this.calculateEndTime(updateData.startTime, updateData.duration);
    } else if (updateData.startTime && !updateData.duration) {
      updateFields.endTime = this.calculateEndTime(updateData.startTime, booking.duration);
    } else if (!updateData.startTime && updateData.duration) {
      updateFields.endTime = this.calculateEndTime(booking.startTime, updateData.duration);
    }

    if (updateData.subject !== undefined) {
      updateFields.subject = updateData.subject;
    }

    if (updateData.qualificationLevel !== undefined) {
      updateFields.qualificationLevel = updateData.qualificationLevel;
    }

    if (updateData.lessonType) {
      updateFields.lessonType = updateData.lessonType;
    }

    if (updateData.teachingMode) {
      updateFields.teachingMode = updateData.teachingMode;
    }

    if (updateData.studentNotes !== undefined) {
      updateFields.studentNotes = updateData.studentNotes;
    }

    if (updateData.tutorNotes !== undefined) {
      updateFields.tutorNotes = updateData.tutorNotes;
    }

    // If time or date changed, check availability
    if (updateData.scheduledDate || updateData.startTime || updateData.duration) {
      const newDate = updateFields.scheduledDate || booking.scheduledDate;
      const newStartTime = updateFields.startTime || booking.startTime;
      const newEndTime = updateFields.endTime || booking.endTime;

      await this.checkAvailabilityAndConflicts(
        booking.tutor.id,
        new Date(newDate),
        newStartTime,
        newEndTime,
        bookingId // Exclude current booking from conflict check
      );

      // Recalculate pricing if duration changed
      if (updateData.duration) {
        const pricing = await this.calculatePricing(
          booking.tutor.id,
          updateData.duration,
          updateData.subject || booking.subject
        );
        updateFields.totalPrice = pricing.totalPrice;
      }
    }

    // Update the booking
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: updateFields,
      include: {
        student: {
          select: {
            id: true,
            email: true,
            studentProfile: {
              select: {
                id: true,
                gradeLevel: true,
              }
            }
          }
        },
        tutor: {
          include: {
            user: {
              select: {
                email: true,
              }
            }
          }
        }
      }
    });

    return this.formatBookingResponse(updatedBooking);
  }

  /**
   * Cancel booking
   */
  async cancelBooking(
    bookingId: string,
    userId: string,
    cancelData: CancelBookingRequest
  ): Promise<BookingResponse> {
    const booking = await this.getBookingById(bookingId, userId);

    // Check if booking can be cancelled
    if (booking.status === BookingStatus.CANCELLED) {
      throw createBookingError(BookingErrorCode.BOOKING_ALREADY_CANCELLED);
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw createBookingError(BookingErrorCode.BOOKING_ALREADY_COMPLETED);
    }

    // Update booking status
    const cancelledBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: userId,
        cancellationReason: cancelData.cancellationReason,
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            studentProfile: {
              select: {
                id: true,
                gradeLevel: true,
              }
            }
          }
        },
        tutor: {
          include: {
            user: {
              select: {
                email: true,
              }
            }
          }
        }
      }
    });

    return this.formatBookingResponse(cancelledBooking);
  }

  /**
   * Confirm booking (tutor only)
   */
  async confirmBooking(
    bookingId: string,
    tutorUserId: string,
    confirmData: ConfirmBookingRequest
  ): Promise<BookingResponse> {
    // Get tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { userId: tutorUserId }
    });

    if (!tutor) {
      throw new BookingPermissionError(
        BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS,
        'Only tutors can confirm bookings',
        tutorUserId
      );
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            studentProfile: {
              select: {
                id: true,
                gradeLevel: true,
              }
            }
          }
        },
        tutor: {
          include: {
            user: {
              select: {
                email: true,
              }
            }
          }
        }
      }
    });

    if (!booking) {
      throw createBookingError(BookingErrorCode.BOOKING_NOT_FOUND);
    }

    // Check if this tutor owns the booking
    if (booking.tutorId !== tutor.id) {
      throw new BookingPermissionError(
        BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS,
        'You can only confirm your own bookings',
        tutorUserId,
        bookingId
      );
    }

    // Check if booking can be confirmed
    if (booking.status !== BookingStatus.PENDING) {
      throw createBookingError(BookingErrorCode.BOOKING_ALREADY_CONFIRMED);
    }

    // Update booking
    const confirmedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
        confirmedAt: new Date(),
        tutorNotes: confirmData.tutorNotes,
        meetingUrl: confirmData.meetingUrl,
        meetingId: confirmData.meetingId,
        meetingPassword: confirmData.meetingPassword,
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            studentProfile: {
              select: {
                id: true,
                gradeLevel: true,
              }
            }
          }
        },
        tutor: {
          include: {
            user: {
              select: {
                email: true,
              }
            }
          }
        }
      }
    });

    return this.formatBookingResponse(confirmedBooking);
  }

  /**
   * Mark booking as completed
   */
  async completeBooking(bookingId: string, userId: string): Promise<BookingResponse> {
    const booking = await this.getBookingById(bookingId, userId);

    // Check if booking can be completed
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw createBookingError(BookingErrorCode.BOOKING_NOT_FOUND);
    }

    // Check if lesson time has passed
    const lessonDateTime = new Date(`${booking.scheduledDate}T${booking.endTime}`);
    if (lessonDateTime > new Date()) {
      throw createBookingError(BookingErrorCode.BOOKING_TOO_EARLY);
    }

    const completedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.COMPLETED,
        completedAt: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            studentProfile: {
              select: {
                id: true,
                gradeLevel: true,
              }
            }
          }
        },
        tutor: {
          include: {
            user: {
              select: {
                email: true,
              }
            }
          }
        }
      }
    });

    return this.formatBookingResponse(completedBooking);
  }

  // ========== Helper Methods ==========

  /**
   * Check if a tutor is available at the specified time and there are no conflicts
   */
  private async checkAvailabilityAndConflicts(
    tutorId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<void> {
    // Check if tutor has availability for this day and time
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    // const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD

    // Find matching availability slots
    const availabilitySlots = await this.prisma.tutorAvailability.findMany({
      where: {
        tutorId,
        isActive: true,
        OR: [
          // Recurring weekly slots for this day of week
          {
            dayOfWeek,
            isRecurring: true,
            startTime: { lte: startTime },
            endTime: { gte: endTime },
            OR: [
              { validFrom: null, validUntil: null },
              { validFrom: { lte: date }, validUntil: null },
              { validFrom: null, validUntil: { gte: date } },
              { validFrom: { lte: date }, validUntil: { gte: date } },
            ]
          },
          // One-time slots for this specific date
          {
            specificDate: date,
            isRecurring: false,
            startTime: { lte: startTime },
            endTime: { gte: endTime },
          }
        ]
      }
    });

    if (availabilitySlots.length === 0) {
      throw createBookingError(BookingErrorCode.TUTOR_NOT_AVAILABLE);
    }

    // Check for booking conflicts
    const conflictingBookings = await this.prisma.booking.findMany({
      where: {
        tutorId,
        scheduledDate: date,
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        OR: [
          // Booking starts during our time slot
          {
            startTime: { gte: startTime, lt: endTime }
          },
          // Booking ends during our time slot
          {
            endTime: { gt: startTime, lte: endTime }
          },
          // Booking completely encompasses our time slot
          {
            startTime: { lte: startTime },
            endTime: { gte: endTime }
          }
        ]
      }
    });

    if (conflictingBookings.length > 0) {
      throw new BookingConflictError(
        'There is a scheduling conflict with this booking',
        conflictingBookings[0].id
      );
    }
  }

  /**
   * Calculate pricing for a booking
   */
  private async calculatePricing(
    tutorId: string,
    durationMinutes: number,
    subject?: string
  ): Promise<{ hourlyRate: number; totalPrice: number }> {
    // Get tutor's hourly rate
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
      select: {
        hourlyRateMin: true,
        hourlyRateMax: true,
        subjects: {
          where: subject ? { subjectName: subject } : undefined,
          select: {
            hourlyRate: true
          }
        }
      }
    });

    if (!tutor) {
      throw createBookingError(BookingErrorCode.TUTOR_NOT_AVAILABLE);
    }

    // Determine hourly rate
    let hourlyRate: number;

    // If subject-specific rate exists, use that
    if (subject && tutor.subjects.length > 0 && tutor.subjects[0].hourlyRate) {
      hourlyRate = Number(tutor.subjects[0].hourlyRate);
    }
    // Otherwise use tutor's default rate
    else if (tutor.hourlyRateMin) {
      hourlyRate = Number(tutor.hourlyRateMin);
    }
    // Fallback to a default rate
    else {
      hourlyRate = 30.00; // Default hourly rate
    }

    // Calculate total price
    const durationHours = durationMinutes / 60;
    const totalPrice = parseFloat((hourlyRate * durationHours).toFixed(2));

    return { hourlyRate, totalPrice };
  }

  /**
   * Calculate end time based on start time and duration
   */
  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMinutes;

    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;

    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  }

  /**
   * Generate a unique confirmation code
   */
  private generateConfirmationCode(): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Format booking response
   */
  private formatBookingResponse(booking: any): BookingResponse {
    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      student: {
        id: booking.student.id,
        email: booking.student.email,
        gradeLevel: booking.student.studentProfile?.gradeLevel,
      },
      tutor: {
        id: booking.tutor.id,
        userId: booking.tutor.userId,
        bio: booking.tutor.bio,
        hourlyRateMin: booking.tutor.hourlyRateMin ? Number(booking.tutor.hourlyRateMin) : undefined,
        hourlyRateMax: booking.tutor.hourlyRateMax ? Number(booking.tutor.hourlyRateMax) : undefined,
        profileImageUrl: booking.tutor.profileImageUrl,
        user: {
          email: booking.tutor.user.email,
        }
      },
      scheduledDate: booking.scheduledDate.toISOString().split('T')[0],
      startTime: booking.startTime,
      endTime: booking.endTime,
      duration: booking.duration,
      subject: booking.subject,
      qualificationLevel: booking.qualificationLevel,
      lessonType: booking.lessonType,
      teachingMode: booking.teachingMode,
      status: booking.status,
      confirmationCode: booking.confirmationCode,
      hourlyRate: Number(booking.hourlyRate),
      totalPrice: Number(booking.totalPrice),
      currency: booking.currency,
      studentNotes: booking.studentNotes,
      tutorNotes: booking.tutorNotes,
      cancelledAt: booking.cancelledAt?.toISOString(),
      cancellationReason: booking.cancellationReason,
      meetingUrl: booking.meetingUrl,
      meetingId: booking.meetingId,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      confirmedAt: booking.confirmedAt?.toISOString(),
      completedAt: booking.completedAt?.toISOString(),
    };
  }
}
