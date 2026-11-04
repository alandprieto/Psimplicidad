import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConsultationForm } from "@/features/consultations/components/ConsultationForm";
import { ConsultationTable } from "@/features/consultations/components/ConsultationTable";
import { ConsultationCalendar } from "@/features/consultations/components/ConsultationCalendar";
import { Button } from "@/components/ui/button";
import { List, CalendarDays } from "lucide-react";

type ConsultationsView = "list" | "calendar";

export function ConsultationsPage() {
  const [view, setView] = useState<ConsultationsView>(() => {
    const stored = localStorage.getItem("consultations:view");
    return stored === "calendar" ? "calendar" : "list";
  });

  useEffect(() => {
    localStorage.setItem("consultations:view", view);
  }, [view]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultas y Turnos"
        description="Agenda de sesiones y control de pagos."
      >
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border p-1">
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
              className="gap-1.5"
            >
              <List className="h-4 w-4" />
              Lista
            </Button>
            <Button
              variant={view === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("calendar")}
              className="gap-1.5"
            >
              <CalendarDays className="h-4 w-4" />
              Calendario
            </Button>
          </div>

          <ConsultationForm />
        </div>
      </PageHeader>

      {view === "list" ? <ConsultationTable /> : <ConsultationCalendar />}
    </div>
  );
}
