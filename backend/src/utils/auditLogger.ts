import { PrismaClient } from '@prisma/client';

export enum AuditEventType {
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_COMPLETED = 'BOOKING_COMPLETED',
  BOOKING_RESCHEDULED = 'BOOKING_RESCHEDULED',
  BOOKING_NO_SHOW_STUDENT = 'BOOKING_NO_SHOW_STUDENT',
  BOOKING_NO_SHOW_TUTOR = 'BOOKING_NO_SHOW_TUTOR',
  AVAILABILITY_CREATED = 'AVAILABILITY_CREATED',
  AVAILABILITY_UPDATED = 'AVAILABILITY_UPDATED',
  AVAILABILITY_DELETED = 'AVAILABILITY_DELETED'
}

export interface AuditLogEntry {
  eventType: AuditEventType;
  userId: string;
  resourceId: string;
  resourceType: 'booking' | 'availability';
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export class AuditLogger {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Log a booking-related audit event
   */
  async logBookingEvent(
    eventType: AuditEventType,
    userId: string,
    bookingId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        eventType,
        userId,
        resourceId: bookingId,
        resourceType: 'booking',
        oldValues,
        newValues,
        metadata,
        ipAddress,
        userAgent,
        timestamp: new Date()
      };

      // Log to console for development/debugging
      console.log('AUDIT LOG:', JSON.stringify(auditEntry, null, 2));

      // In production, you might want to store this in a dedicated audit table
      // For now, we'll use console logging and could extend to external services
      
      // Optional: Store in database audit table (would require additional schema)
      // await this.prisma.auditLog.create({ data: auditEntry });

    } catch (error) {
      // Audit logging should not break the main flow
      console.error('Failed to log audit event:', error);
    }
  }

  /**
   * Log an availability-related audit event
   */
  async logAvailabilityEvent(
    eventType: AuditEventType,
    userId: string,
    availabilityId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        eventType,
        userId,
        resourceId: availabilityId,
        resourceType: 'availability',
        oldValues,
        newValues,
        metadata,
        ipAddress,
        userAgent,
        timestamp: new Date()
      };

      console.log('AUDIT LOG:', JSON.stringify(auditEntry, null, 2));

    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  /**
   * Log booking status change with detailed context
   */
  async logBookingStatusChange(
    userId: string,
    bookingId: string,
    oldStatus: string,
    newStatus: string,
    reason?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const eventType = this.getEventTypeFromStatus(newStatus);
    
    await this.logBookingEvent(
      eventType,
      userId,
      bookingId,
      { status: oldStatus },
      { status: newStatus },
      { reason, ...metadata },
      ipAddress,
      userAgent
    );
  }

  /**
   * Get appropriate audit event type based on booking status
   */
  private getEventTypeFromStatus(status: string): AuditEventType {
    switch (status) {
      case 'CONFIRMED':
        return AuditEventType.BOOKING_CONFIRMED;
      case 'CANCELLED':
        return AuditEventType.BOOKING_CANCELLED;
      case 'COMPLETED':
        return AuditEventType.BOOKING_COMPLETED;
      case 'RESCHEDULED':
        return AuditEventType.BOOKING_RESCHEDULED;
      case 'NO_SHOW_STUDENT':
        return AuditEventType.BOOKING_NO_SHOW_STUDENT;
      case 'NO_SHOW_TUTOR':
        return AuditEventType.BOOKING_NO_SHOW_TUTOR;
      default:
        return AuditEventType.BOOKING_CREATED;
    }
  }

  /**
   * Get audit trail for a specific booking
   */
  async getBookingAuditTrail(bookingId: string): Promise<AuditLogEntry[]> {
    // This would query the audit table if implemented
    // For now, return empty array as audit logs are in console/external systems
    return [];
  }

  /**
   * Get audit trail for a specific user
   */
  async getUserAuditTrail(userId: string, limit: number = 50): Promise<AuditLogEntry[]> {
    // This would query the audit table if implemented
    return [];
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger();
