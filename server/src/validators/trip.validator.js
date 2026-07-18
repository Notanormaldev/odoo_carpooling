import { z } from 'zod';

export const createTripSchema = z.object({
  body: z.object({
    rideId: z.string().min(1, 'Ride ID is required'),
    seatsBooked: z.number().int().min(1).max(7),
  }),
});

export const updateTripStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Trip ID is required'),
  }),
  body: z.object({
    status: z.enum(['started', 'in_progress', 'completed', 'cancelled']),
    cancellationReason: z.string().optional(),
  }),
});

export const rateTripSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Trip ID is required'),
  }),
  body: z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().max(300).optional(),
  }),
});

export default { createTripSchema, updateTripStatusSchema, rateTripSchema };
