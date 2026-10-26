import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  consultationSchema,
  type ConsultationFormData,
  type ConsultationFormInput,
} from "../schemas";
import { useCreateConsultation } from "../hooks";
import { usePatients } from "@/features/patients/hooks";
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
import { CalendarPlus } from "lucide-react";

export function ConsultationForm() {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createMutation = useCreateConsultation();
  const { data: patients } = usePatients();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationFormInput, unknown, ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      patientId: "",
      startsAt: "",
      durationMinutes: 50, // Duración estándar por defecto
      pricePesos: 0,
      notes: "",
    },
  });

  const onSubmit = async (data: ConsultationFormData) => {
    setSubmitError(null);
    try {
      // Convertimos la fecha local a formato ISO string y el precio a centavos
      const startsAtIso = new Date(data.startsAt).toISOString();
      const priceCents = pesosToCents(data.pricePesos);

      await createMutation.mutateAsync({
        patientId: data.patientId,
        startsAt: startsAtIso,
        durationMinutes: data.durationMinutes,
        priceCents,
        notes: data.notes || undefined,
      });

      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error al agendar consulta:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo agendar la consulta. Inténtalo nuevamente.",
      );
    }
  };

  const activePatients = patients?.filter((p) => p.isActive) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <CalendarPlus className="h-4 w-4" />
        Nueva Consulta
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Agendar Nueva Consulta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Paciente</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("patientId")}
            >
              <option value="">Seleccionar paciente...</option>
              {activePatients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.lastName}, {patient.firstName}
                </option>
              ))}
            </select>
            {errors.patientId && (
              <p className="text-xs text-destructive">
                {errors.patientId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha y Hora</label>
            <Input type="datetime-local" {...register("startsAt")} />
            {errors.startsAt && (
              <p className="text-xs text-destructive">
                {errors.startsAt.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Duración (minutos)</label>
              <Input type="number" {...register("durationMinutes")} />
              {errors.durationMinutes && (
                <p className="text-xs text-destructive">
                  {errors.durationMinutes.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Precio ($ ARS)</label>
              <Input
                type="number"
                step="any"
                placeholder="Ej. 15000"
                {...register("pricePesos")}
              />
              {errors.pricePesos && (
                <p className="text-xs text-destructive">
                  {errors.pricePesos.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notas (opcional)</label>
            <Input
              placeholder="Observaciones de la sesión..."
              {...register("notes")}
            />
          </div>

          {submitError && (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Agendar Consulta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
