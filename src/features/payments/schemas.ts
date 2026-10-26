import { z } from "zod";

export const paymentSchema = z.object({
  amountPesos: z.coerce.number().min(1, "El monto debe ser mayor a 0"),
  paymentMethod: z.string().min(1, "Selecciona un método de pago"),
  notes: z.string().optional(),
});

export type PaymentFormInput = z.input<typeof paymentSchema>;
export type PaymentFormData = z.output<typeof paymentSchema>;
