import type { Consultation, ConsultationStatus } from "@/types/domain";

export const statusBadgeVariant: Record<
  ConsultationStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  pendiente: { label: "Pendiente", variant: "secondary" },
  parcial: { label: "Pago Parcial", variant: "outline" },
  pagada: { label: "Pagada", variant: "default" },
  cancelada: { label: "Cancelada", variant: "destructive" },
};

export function getPatientName(consultation: Consultation): string {
  return consultation.patient
    ? `${consultation.patient.lastName}, ${consultation.patient.firstName}`
    : "Paciente desconocido";
}
