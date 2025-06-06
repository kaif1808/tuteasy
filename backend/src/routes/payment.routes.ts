import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { validate } from '../middleware/validate';
import { createPaymentIntentSchema } from '../validation/payment.validation';
import { authenticate } from '../middleware/auth';

const router = Router();
const paymentController = new PaymentController();

router.post(
  '/create-intent',
  authenticate,
  validate(createPaymentIntentSchema),
  paymentController.createPaymentIntent
);

export default router; 