import { useState, useMemo } from "react";
import { useCancelConsultation, useConsultations } from "../hooks";
import { PaymentForm } from "@/features/payments/components/PaymentForm";
import { ConsultationForm } from "./ConsultationForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatMonthYear,
  getInitialMonth,
  getMonthGrid,
  toDateKey,
  formatTime,
} from "@/lib/dates";
import {
  MoreHorizontal,
  Pencil,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Consultation, ConsultationStatus } from "@/types/domain";
import { cn } from "cn";
import { statusBadgeVariant, getPatientName } from "../lib/presentation";

const statusDotClass: Record<ConsultationStatus, string> = {
  pendiente: "bg-slate-400",
  parcial: "bg-amber-500",
  pagada: "bg-emerald-500",
  cancelada: "bg-red-500",
};

function addMonths(year: number, month: number, delta: number) {
  const total = year * 12 + month + delta;
  return {
    year: Math.floor(total / 12),
    month: ((total % 12) + 12) % 12,
  };
}

export function ConsultationCalendar() {
  const { data: consultations, isLoading, error } = useConsultations();
  const cancelMutation = useCancelConsultation();

  const [editingConsultation, setEditingConsultation] =
    useState<Consultation | null>(null);
  const [cursor, setCursor] = useState(getInitialMonth());

  const byDay = useMemo(() => {
    const map = new Map<string, Consultation[]>();
    for (const consultation of consultations ?? []) {
      const key = toDateKey(consultation.startsAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(consultation);
    }
    for (const items of map.values()) {
      items.sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      );
    }
    return map;
  }, [consultations]);

  const cells = getMonthGrid(cursor.year, cursor.month);

  const handleCancel = (consultation: Consultation) => {
    if (
      window.confirm(
        `¿Seguro que quieres cancelar la consulta de ${getPatientName(consultation)}?`,
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

  const hasAny = (consultations?.length ?? 0) > 0;

  return (
    <div className="border rounded-lg bg-card shadow-sm p-4 space-y-4">
      {/* Header del calendario */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold capitalize">
          {formatMonthYear(cursor.year, cursor.month)}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(addMonths(cursor.year, cursor.month, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(getInitialMonth())}
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(addMonths(cursor.year, cursor.month, 1))}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!hasAny ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-4xl mb-3">📅</span>
          <h3 className="font-semibold text-lg">No hay consultas agendadas</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Comienza agendando un turno con el botón superior.
          </p>
        </div>
      ) : (
        <>
          {/* Encabezado de días */}
          <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grilla mensual */}
          <div className="grid grid-cols-7 gap-px rounded-lg overflow-hidden border bg-border">
            {cells.map((cell) => {
              const items = byDay.get(cell.key) ?? [];

              return (
                <div
                  key={cell.key}
                  className={cn(
                    "min-h-28 bg-card p-1.5 flex flex-col gap-1",
                    !cell.inMonth && "bg-muted/40 text-muted-foreground",
                    cell.isToday && "ring-1 ring-inset ring-primary",
                  )}
                >
                  <div className="text-xs font-medium">{cell.day}</div>

                  <div className="flex flex-col gap-1 overflow-y-auto max-h-24">
                    {items.map((consultation) => {
                      const badgeInfo = statusBadgeVariant[
                        consultation.status
                      ] || {
                        label: consultation.status,
                        variant: "secondary" as const,
                      };

                      const remainingCents =
                        consultation.priceCents - consultation.paidCents;
                      const canRegisterPayment =
                        consultation.status !== "pagada" &&
                        consultation.status !== "cancelada";

                      return (
                        <div
                          key={consultation.id}
                          className={cn(
                            "rounded-md border p-1.5 text-xs shadow-sm border-l-4",
                            consultation.status === "pagada" &&
                              "border-l-emerald-500",
                            consultation.status === "parcial" &&
                              "border-l-amber-500",
                            consultation.status === "pendiente" &&
                              "border-l-slate-400",
                            consultation.status === "cancelada" &&
                              "border-l-red-500 opacity-60",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setEditingConsultation(consultation)}
                            className="block w-full text-left"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-medium">
                                {formatTime(consultation.startsAt)}
                              </span>
                              <span
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  statusDotClass[consultation.status],
                                )}
                              />
                            </div>
                            <div className="truncate">
                              {getPatientName(consultation)}
                            </div>
                            <div className="truncate text-muted-foreground">
                              {consultation.title}
                            </div>
                          </button>

                          <div className="mt-1 flex items-center gap-1">
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
                                      size="icon-xs"
                                      aria-label="Acciones de la consulta"
                                    />
                                  }
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
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

                          <Badge
                            variant={badgeInfo.variant}
                            className="mt-1 text-[10px] px-1.5 py-0"
                          >
                            {badgeInfo.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {cancelMutation.error && (
        <p className="text-sm text-destructive" role="alert">
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
