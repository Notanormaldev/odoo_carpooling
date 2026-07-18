import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number').optional(),
    department: z.string().optional(),
    officeLocation: z.string().optional(),
    drivingLicense: z.string().min(5).optional(),
  }),
});

export const addSavedPlaceSchema = z.object({
  body: z.object({
    label: z.string().min(1, 'Label is required'),
    address: z.string().min(3, 'Address is required'),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    icon: z.enum(['home', 'work', 'custom']).optional().default('custom'),
  }),
});

export const addEmergencyContactSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  }),
});

export default { updateProfileSchema, addSavedPlaceSchema, addEmergencyContactSchema };
