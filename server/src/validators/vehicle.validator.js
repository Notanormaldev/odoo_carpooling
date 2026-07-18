import { z } from 'zod';

export const createVehicleSchema = z.object({
  body: z.object({
    model: z.string().min(2, 'Vehicle model name must be at least 2 characters'),
    registrationNumber: z
      .string()
      .regex(/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/, 'Invalid Indian vehicle registration format (e.g. GJ01AB1234)'),
    seatingCapacity: z.number().int().min(2).max(8),
    fuelType: z.enum(['petrol', 'diesel', 'cng', 'electric', 'hybrid']).optional(),
    fuelEfficiency: z.number().min(1, 'Fuel efficiency must be positive').optional(),
  }),
});

export const approveVehicleSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['active', 'inactive']),
  }),
});

export default { createVehicleSchema, approveVehicleSchema };
