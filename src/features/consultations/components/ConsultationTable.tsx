import { useState } from "react";
import {
  useCancelConsultation,
  useConsultations,
} from "../hooks";
import { PaymentForm } from "@/features/payments/components/PaymentForm";
import { ConsultationForm } from "./ConsultationForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatLocalDateTime } from "@/lib/dates";
import { formatARS } from "@/lib/money";
import { Calendar, MoreHorizontal, Pencil, XCircle } from "lucide-react";
import type { Consultation, ConsultationStatus } from "@/types/domain";

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
  const cancelMutation = useCancelConsultation();
  const [editingConsultation, setEditingConsultation] =
    useState<Consultation | null>(null);

  const handleCancel = (consultation: Consultation) => {
    if (
      window.confirm(
        `¿Seguro que quieres cancelar la consulta de ${consultation.patient?.firstName ?? "este paciente"}?`,
      )
    ) {
      cancelMutation.mutate(consultation.id);
    }
  };

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
            <TableHead>Servicio</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Cobrado</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
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

            const serviceName =
              consultation.consultationType?.name || "Personalizado";
            const remainingCents =
              consultation.priceCents - consultation.paidCents;
            const canRegisterPayment =
              consultation.status !== "pagada" &&
              consultation.status !== "cancelada";

            return (
              <TableRow key={consultation.id}>
                <TableCell className="font-medium">
                  {formatLocalDateTime(consultation.startsAt)}
                </TableCell>
                <TableCell>{patientName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {serviceName}
                </TableCell>
                <TableCell>{formatARS(consultation.priceCents)}</TableCell>
                <TableCell>{formatARS(consultation.paidCents)}</TableCell>
                <TableCell>
                  <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {canRegisterPayment && (
                      <PaymentForm
                        consultationId={consultation.id}
                        remainingCents={remainingCents}
                      />
                    )}
                    {consultation.status !== "cancelada" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              aria-label="Acciones de la consulta"
                            />
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              setEditingConsultation(consultation)
                            }
                            className="gap-2 cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleCancel(consultation)}
                            disabled={cancelMutation.isPending}
                            className="gap-2 cursor-pointer text-destructive"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancelar consulta
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {cancelMutation.error && (
        <p className="px-4 py-3 text-sm text-destructive" role="alert">
          No se pudo cancelar la consulta: {cancelMutation.error.message}
        </p>
      )}
      <ConsultationForm
        consultation={editingConsultation ?? undefined}
        open={editingConsultation !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setEditingConsultation(null);
        }}
      />
    </div>
  );
}
