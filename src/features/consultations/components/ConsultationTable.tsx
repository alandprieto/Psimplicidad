import { useConsultations } from "../hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatLocalDateTime } from "@/lib/dates";
import { formatARS } from "@/lib/money";
import { Calendar } from "lucide-react";
import type { ConsultationStatus } from "@/types/domain";

const statusBadgeVariant: Record<
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

export function ConsultationTable() {
  const { data: consultations, isLoading, error } = useConsultations();

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cargando consultas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Error al cargar las consultas.
      </div>
    );
  }

  if (!consultations || consultations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-card text-center">
        <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-semibold text-lg">No hay consultas agendadas</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Comienza agendando un turno con el botón superior.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha y Hora</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Cobrado</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consultations.map((consultation) => {
            const badgeInfo = statusBadgeVariant[consultation.status] || {
              label: consultation.status,
              variant: "secondary",
            };
            const patientName = consultation.patient
              ? `${consultation.patient.lastName}, ${consultation.patient.firstName}`
              : "Paciente desconocido";

            return (
              <TableRow key={consultation.id}>
                <TableCell className="font-medium">
                  {formatLocalDateTime(consultation.startsAt)}
                </TableCell>
                <TableCell>{patientName}</TableCell>
                <TableCell>{formatARS(consultation.priceCents)}</TableCell>
                <TableCell>{formatARS(consultation.paidCents)}</TableCell>
                <TableCell>
                  <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
