import { z } from "zod";

export const patientSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "El apellido es obligatorio"),
  phone: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;
