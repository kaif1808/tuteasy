import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  body: z.object({
    tutorId: z.string().uuid({ message: 'Invalid tutor ID' }),
    duration: z.number().int().positive({ message: 'Duration must be a positive integer' }),
  }),
}); 