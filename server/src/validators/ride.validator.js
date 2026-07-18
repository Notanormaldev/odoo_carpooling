import { z } from 'zod';

const locationSchema = z.object({
  address: z.string().min(3, 'Address required'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  placeId: z.string().optional(),
});

export const createRideSchema = z.object({
  body: z.object({
    vehicleId: z.string().min(1, 'Vehicle ID required'),
    startLocation: locationSchema,
    destination: locationSchema,
    dateTime: z.string().datetime({ message: 'Invalid date-time format' }),
    totalSeats: z.number().int().min(1).max(7),
    farePerSeat: z.number().min(0),
    isRecurring: z.boolean().optional().default(false),
    recurringDays: z
      .object({
        monday: z.boolean().optional(),
        tuesday: z.boolean().optional(),
        wednesday: z.boolean().optional(),
        thursday: z.boolean().optional(),
        friday: z.boolean().optional(),
        saturday: z.boolean().optional(),
        sunday: z.boolean().optional(),
      })
      .optional(),
  }),
});

export const searchRidesSchema = z.object({
  query: z.object({
    lat: z.string().transform(Number).optional(),
    lng: z.string().transform(Number).optional(),
    destLat: z.string().transform(Number).optional(),
    destLng: z.string().transform(Number).optional(),
    date: z.string().optional(),
    seats: z.string().transform(Number).optional().default('1'),
    radius: z.string().transform(Number).optional().default('30'),
  }),
});

export const updateRideSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    farePerSeat: z.number().optional(),
    dateTime: z.string().datetime().optional(),
    status: z.enum(['published', 'cancelled']).optional(),
  }),
});

export default { createRideSchema, searchRidesSchema, updateRideSchema };
