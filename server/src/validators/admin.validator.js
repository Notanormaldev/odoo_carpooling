import { z } from 'zod';

export const addEmployeeSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    department: z.string().optional(),
    manager: z.string().optional(),
    officeLocation: z.string().optional(),
  }),
});

export const updateOrgSettingsSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    registeredAddress: z.string().optional(),
    industry: z.string().optional(),
    fuelCostPerLitre: z.number().min(0).optional(),
    costPerKm: z.number().min(0).optional(),
    travelCostOperational: z.number().min(0).optional(),
  }),
});

export default { addEmployeeSchema, updateOrgSettingsSchema };
