import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, type PatientFormData } from "../schemas";
import { useCreatePatient, useUpdatePatient } from "../hooks";
import type { Patient } from "@/types/domain";
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
import { UserPlus } from "lucide-react";

interface PatientFormProps {
  patient?: Patient; // Si se pasa, funciona como modo edición
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PatientForm({
  patient,
  open,
  onOpenChange,
}: PatientFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setDialogOpen = onOpenChange ?? setInternalOpen;
  const isEditing = !!patient;

  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: patient?.firstName || "",
      lastName: patient?.lastName || "",
      phone: patient?.phone || "",
    },
  });

  useEffect(() => {
    if (patient) {
      reset({
        firstName: patient.firstName,
        lastName: patient.lastName,
        phone: patient.phone || "",
      });
    }
  }, [patient, reset]);

  const onSubmit = async (data: PatientFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: patient.id,
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || undefined,
        });
        reset();
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Error al guardar paciente:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setDialogOpen}>
      {open === undefined && (
        <DialogTrigger render={<Button className="gap-2" />}>
          <UserPlus className="h-4 w-4" />
          Nuevo Paciente
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Paciente" : "Registrar Nuevo Paciente"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre</label>
            <Input placeholder="Ej. Juan" {...register("firstName")} />
            {errors.firstName && (
              <p className="text-xs text-destructive">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Apellido</label>
            <Input placeholder="Ej. Pérez" {...register("lastName")} />
            {errors.lastName && (
              <p className="text-xs text-destructive">
                {errors.lastName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Teléfono (opcional)</label>
            <Input placeholder="Ej. 1123456789" {...register("phone")} />
          </div>
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
                  : "Guardar Paciente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
