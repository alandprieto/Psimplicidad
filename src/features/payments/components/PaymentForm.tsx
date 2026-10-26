import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  paymentSchema,
  type PaymentFormData,
  type PaymentFormInput,
} from "../schemas";
import { useCreatePayment } from "../hooks";
import { pesosToCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { DollarSign } from "lucide-react";

interface PaymentFormProps {
  consultationId: string;
  remainingCents: number; // Para sugerir el monto pendiente
}

export function PaymentForm({
  consultationId,
  remainingCents,
}: PaymentFormProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreatePayment();

  const remainingPesos = remainingCents / 100;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormInput, unknown, PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amountPesos: remainingPesos > 0 ? remainingPesos : 0,
      paymentMethod: "transferencia",
      notes: "",
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    try {
      const amountCents = pesosToCents(data.amountPesos);

      await createMutation.mutateAsync({
        consultationId,
        amountCents,
        paymentMethod: data.paymentMethod,
        notes: data.notes || undefined,
      });

      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error al registrar pago:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button size="sm" variant="outline" className="gap-1.5" />}
      >
        <DollarSign className="h-4 w-4 text-emerald-600" />
        Registrar Pago
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Registrar Cobro / Pago</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Monto ($ ARS)</label>
            <Input type="number" step="any" {...register("amountPesos")} />
            {errors.amountPesos && (
              <p className="text-xs text-destructive">
                {errors.amountPesos.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Método de Pago</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("paymentMethod")}
            >
              <option value="transferencia">Transferencia Bancaria</option>
              <option value="efectivo">Efectivo</option>
              <option value="mercado_pago">Mercado Pago</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notas (opcional)</label>
            <Input
              placeholder="Nro de comprobante, etc."
              {...register("notes")}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Confirmar Pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
