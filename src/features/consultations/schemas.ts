import { z } from "zod";

export const consultationSchema = z.object({
  patientId: z.string().min(1, "Debe seleccionar un paciente"),
  startsAt: z.string().min(1, "La fecha y hora son obligatorias"),
  durationMinutes: z.coerce
    .number()
    .min(10, "La duración mínima es de 10 minutos"),
  pricePesos: z.coerce.number().min(0, "El precio no puede ser negativo"),
  notes: z.string().optional(),
});

export type ConsultationFormInput = z.input<typeof consultationSchema>;
export type ConsultationFormData = z.output<typeof consultationSchema>;
