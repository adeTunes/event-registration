import { z } from 'zod';

export const registrationSchema = z.object({
  firstName: z.string().min(2),
  middleName: z.string().optional(),
  lastName: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z.string().min(7),
  alternatePhoneNumber: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']),
  consentForFollowUp: z.boolean(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
