import Stripe from 'stripe';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export class PaymentService {
  public async createPaymentIntent(
    tutorId: string,
    duration: number, // duration in minutes
    userId: string
  ): Promise<{ clientSecret: string | null; amount: number }> {
    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!tutor || !tutor.hourlyRateMin) {
      throw new AppError('Tutor not found or hourly rate not set', 404);
    }

    // For now, let's use the minimum hourly rate.
    // In the future, this could be more complex (e.g., subject-specific rates).
    const hourlyRate = tutor.hourlyRateMin;
    const amount = this.calculateLessonCost(Number(hourlyRate), duration);

    // Amount must be in the smallest currency unit (e.g., pence for GBP)
    const amountInPence = Math.round(amount * 100);

    // In a real application, you would create or retrieve a Stripe Customer ID for the user
    // For this MVP, we will create a payment intent without a customer
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPence,
      currency: 'gbp',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        tutorId,
        lessonDuration: duration,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      amount: amountInPence,
    };
  }

  private calculateLessonCost(hourlyRate: number, duration: number): number {
    const ratePerMinute = hourlyRate / 60;
    return ratePerMinute * duration;
  }
} 