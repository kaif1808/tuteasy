import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { AppError } from '../utils/AppError';

export class PaymentController {
  private paymentService = new PaymentService();

  public createPaymentIntent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { tutorId, duration } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new AppError('Authentication error', 401);
      }

      const { clientSecret, amount, currency } = await this.paymentService.createPaymentIntent(
        tutorId,
        duration,
        userId
      );

      res.status(200).json({
        status: 'success',
        clientSecret,
        amount,
        currency,
      });
    } catch (error) {
      next(error);
    }
  };
} 