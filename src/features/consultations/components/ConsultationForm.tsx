import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  consultationSchema,
  type ConsultationFormData,
  type ConsultationFormInput,
} from "../schemas";
import {
  useCreateConsultation,
  useUpdateConsultation,
} from "../hooks";
import { usePatients } from "@/features/patients/hooks";
import { useConsultationTypes } from "@/features/consultation-types/hooks";
import { pesosToCents, centsToPesos } from "@/lib/money";
import type { Consultation } from "@/types/domain";
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

interface ConsultationFormProps {
  consultation?: Consultation;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function toDateTimeLocal(value: string): string {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function getFormValues(consultation?: Consultation): ConsultationFormData {
  return {
    patientId: consultation?.patientId ?? "",
    consultationTypeId: consultation?.consultationTypeId ?? "",
    title: consultation?.title ?? "Consulta psicológica",
    startsAt: consultation ? toDateTimeLocal(consultation.startsAt) : "",
    durationMinutes: consultation?.durationMinutes ?? 50,
    pricePesos: consultation ? centsToPesos(consultation.priceCents) : 0,
    notes: consultation?.notes ?? "",
  };
}

export function ConsultationForm({
  consultation,
  open,
  onOpenChange,
}: ConsultationFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setDialogOpen = onOpenChange ?? setInternalOpen;
  const isEditing = !!consultation;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createMutation = useCreateConsultation();
  const updateMutation = useUpdateConsultation();
  const { data: patients } = usePatients();
  const { data: consultationTypes } = useConsultationTypes();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationFormInput, unknown, ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: getFormValues(consultation),
  });

  useEffect(() => {
    if (isOpen) {
      reset(getFormValues(consultation));
      setSubmitError(null);
    }
  }, [consultation, isOpen, reset]);

  const selectedTypeId = watch("consultationTypeId");

  // Autocompletar duración y precio cuando se elige un tipo de consulta
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const typeId = e.target.value;
    setValue("consultationTypeId", typeId);
    const found = consultationTypes?.find((type) => type.id === typeId);
    setValue("title", found?.name ?? "Consulta psicológica");

    if (found) {
      setValue("durationMinutes", found.defaultDurationMinutes);
      setValue("pricePesos", centsToPesos(found.defaultPriceCents));
    }
  };

  const onSubmit = async (data: ConsultationFormData) => {
    setSubmitError(null);
    try {
      const startsAtIso = new Date(data.startsAt).toISOString();
      const priceCents = pesosToCents(data.pricePesos);

      const values = {
        patientId: data.patientId,
        consultationTypeId: data.consultationTypeId || undefined,
        title: data.title,
        startsAt: startsAtIso,
        durationMinutes: data.durationMinutes,
        priceCents,
        notes: data.notes || undefined,
      };

      if (consultation) {
        await updateMutation.mutateAsync({ id: consultation.id, data: values });
      } else {
        await createMutation.mutateAsync(values);
      }

      reset();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error al guardar consulta:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la consulta. Inténtalo nuevamente.",
      );
    }
  };

  const activePatients = patients?.filter((p) => p.isActive) || [];
  const activeTypes = consultationTypes?.filter((t) => t.isActive) || [];
  const patientOptions =
    consultation?.patient && !consultation.patient.isActive
      ? [...activePatients, consultation.patient]
      : activePatients;
  const typeOptions =
    consultation?.consultationTypeId &&
    !activeTypes.some((type) => type.id === consultation.consultationTypeId)
      ? [
          ...activeTypes,
          {
            id: consultation.consultationTypeId,
            name: "Tipo de servicio actual",
            defaultPriceCents: consultation.priceCents,
            defaultDurationMinutes: consultation.durationMinutes,
          },
        ]
      : activeTypes;

  return (
    <Dialog open={isOpen} onOpenChange={setDialogOpen}>
      {open === undefined && (
        <DialogTrigger render={<Button className="gap-2" />}>
          <CalendarPlus className="h-4 w-4" />
          Nueva Consulta
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Consulta" : "Agendar Nueva Consulta"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Paciente</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("patientId")}
            >
              <option value="">Seleccionar paciente...</option>
              {patientOptions.map((patient) => (
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
            <label className="text-sm font-medium">Título</label>
            <Input placeholder="Consulta psicológica" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tipo de Servicio (Opcional)
            </label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedTypeId}
              onChange={handleTypeChange}
            >
              <option value="">Personalizado / Sin tipo específico</option>
              {typeOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (${centsToPesos(t.defaultPriceCents)} -{" "}
                  {t.defaultDurationMinutes} min)
                </option>
              ))}
            </select>
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
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Guardando..."
                : isEditing
                  ? "Guardar Cambios"
                  : "Agendar Consulta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
