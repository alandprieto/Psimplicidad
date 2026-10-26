import { PageHeader } from "@/components/shared/PageHeader";
import { ConsultationForm } from "@/features/consultations/components/ConsultationForm";
import { ConsultationTable } from "@/features/consultations/components/ConsultationTable";

export function ConsultationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultas y Turnos"
        description="Agenda de sesiones y control de pagos."
      >
        <ConsultationForm />
      </PageHeader>

      <ConsultationTable />
    </div>
  );
}
