import { useMonthlyFinancialStats } from "../hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatLocalDateTime } from "@/lib/dates";
import { formatARS } from "@/lib/money";
import type { ConsultationStatus } from "@/types/domain";

const statusLabels: Record<ConsultationStatus, string> = {
  pendiente: "Pendiente",
  parcial: "Pago parcial",
  pagada: "Pagada",
  cancelada: "Cancelada",
};

const statusVariants: Record<
  ConsultationStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pendiente: "secondary",
  parcial: "outline",
  pagada: "default",
  cancelada: "destructive",
};

export function MonthlyConsultations() {
  const { data, isLoading, error } = useMonthlyFinancialStats();

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Consultas del mes
        </CardTitle>
        {data && (
          <p className="text-sm text-muted-foreground">
            {data.consultations.length}{" "}
            {data.consultations.length === 1 ? "consulta" : "consultas"}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Cargando consultas...
          </p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-destructive" role="alert">
            No se pudieron cargar las consultas: {error.message}
          </p>
        ) : data?.consultations.length ? (
          <div className="max-h-[360px] divide-y overflow-y-auto">
            {data.consultations.map((consultation) => (
              <div
                key={consultation.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {consultation.patient
                      ? `${consultation.patient.lastName}, ${consultation.patient.firstName}`
                      : "Paciente desconocido"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatLocalDateTime(consultation.startsAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-medium">
                    {formatARS(consultation.priceCents)}
                  </span>
                  <Badge variant={statusVariants[consultation.status]}>
                    {statusLabels[consultation.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay consultas registradas este mes.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
