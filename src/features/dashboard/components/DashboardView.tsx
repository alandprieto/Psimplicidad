import { useDashboardMetrics } from "../hooks";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatARS } from "@/lib/money";
import { formatLocalDateTime } from "@/lib/dates";
import { Users, CalendarCheck, DollarSign, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PatientForm } from "@/features/patients/components/PatientForm";
import { ConsultationForm } from "@/features/consultations/components/ConsultationForm";
import { ConsultationTypeForm } from "@/features/consultation-types/components/ConsultationTypeForm";

export function DashboardView() {
  const { data, isLoading, error } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Cargando panel principal...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12 text-center text-destructive" role="alert">
        <p>Error al cargar las métricas del dashboard.</p>
        {error && <p className="mt-2 text-sm">{error.message}</p>}
      </div>
    );
  }

  const { activePatientsCount, todayConsultations, totalMonthRevenueCents } =
    data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel Principal"
        description="Resumen operativo y agenda de la jornada."
      />

      {/* Tarjetas de Métricas (KPIs) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pacientes Activos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePatientsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registrados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Turnos para Hoy
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayConsultations.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sesiones programadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos del Mes
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatARS(totalMonthRevenueCents)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cobros registrados este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-2">
            <PatientForm />
            <ConsultationForm />
            <ConsultationTypeForm />
          </CardContent>
        </Card>
      </div>

      {/* Agenda del Día */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Turnos de Hoy</h2>
        {todayConsultations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-card text-center">
            <Clock className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-medium">No hay consultas programadas para hoy</p>
            <p className="text-sm text-muted-foreground mt-1">
              ¡Disfruta de tu jornada o aprovecha para organizar notas!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {todayConsultations.map((consultation) => {
              const patientName = consultation.patient
                ? `${consultation.patient.lastName}, ${consultation.patient.firstName}`
                : "Paciente desconocido";
              const serviceName =
                consultation.consultationType?.name || "Sesión General";

              return (
                <div
                  key={consultation.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-primary/10 rounded-md text-primary font-semibold text-sm">
                      {formatLocalDateTime(consultation.startsAt).split(
                        ",",
                      )[1] || formatLocalDateTime(consultation.startsAt)}
                    </div>
                    <div>
                      <h4 className="font-medium text-base">{patientName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {serviceName} • {consultation.durationMinutes} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">
                      {formatARS(consultation.priceCents)}
                    </span>
                    <Badge
                      variant={
                        consultation.status === "pagada"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {consultation.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
