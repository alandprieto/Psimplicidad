import { z } from "zod";

export const consultationTypeSchema = z.object({
  name: z.string().min(1, "El nombre del servicio es obligatorio"),
  defaultDurationMinutes: z.coerce
    .number()
    .min(5, "La duración mínima es de 5 minutos"),
  defaultPricePesos: z.coerce
    .number()
    .min(0, "El precio no puede ser negativo"),
});

export type ConsultationTypeFormInput = z.input<typeof consultationTypeSchema>;
export type ConsultationTypeFormData = z.output<typeof consultationTypeSchema>;
