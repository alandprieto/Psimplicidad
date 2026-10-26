import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  consultationTypeSchema,
  type ConsultationTypeFormData,
  type ConsultationTypeFormInput,
} from "../schemas";
import { useCreateConsultationType } from "../hooks";
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
import { Plus } from "lucide-react";

export function ConsultationTypeForm() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateConsultationType();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<
    ConsultationTypeFormInput,
    unknown,
    ConsultationTypeFormData
  >({
    resolver: zodResolver(consultationTypeSchema),
    defaultValues: {
      name: "",
      defaultDurationMinutes: 50,
      defaultPricePesos: 0,
    },
  });

  const onSubmit = async (data: ConsultationTypeFormData) => {
    try {
      const defaultPriceCents = pesosToCents(data.defaultPricePesos);

      await createMutation.mutateAsync({
        name: data.name,
        defaultDurationMinutes: data.defaultDurationMinutes,
        defaultPriceCents,
      });

      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error al crear tipo de consulta:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" />
        Nuevo Tipo de Servicio
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Tipo de Consulta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre del servicio</label>
            <Input
              placeholder="Ej. Psicoterapia Individual"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Duración (min)</label>
              <Input type="number" {...register("defaultDurationMinutes")} />
              {errors.defaultDurationMinutes && (
                <p className="text-xs text-destructive">
                  {errors.defaultDurationMinutes.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Precio por defecto ($)
              </label>
              <Input
                type="number"
                step="any"
                placeholder="Ej. 15000"
                {...register("defaultPricePesos")}
              />
              {errors.defaultPricePesos && (
                <p className="text-xs text-destructive">
                  {errors.defaultPricePesos.message}
                </p>
              )}
            </div>
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
              {isSubmitting ? "Guardando..." : "Guardar Servicio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
