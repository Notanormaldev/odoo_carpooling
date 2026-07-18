import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    amount: z.number().min(1, 'Amount must be at least ₹1'),
    type: z.enum(['trip_payment', 'wallet_recharge']),
    tripId: z.string().optional(),
  }),
});

export const capturePaymentSchema = z.object({
  body: z.object({
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
  }),
});

export const walletRechargeSchema = z.object({
  body: z.object({
    amount: z.number().min(1, 'Amount must be at least ₹1'),
  }),
});

export const payWithWalletSchema = z.object({
  body: z.object({
    tripId: z.string().min(1, 'Trip ID is required'),
  }),
});

export default { createOrderSchema, capturePaymentSchema, walletRechargeSchema, payWithWalletSchema };
