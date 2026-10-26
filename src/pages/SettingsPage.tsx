import { PageHeader } from "@/components/shared/PageHeader";
import { ConsultationTypeForm } from "@/features/consultation-types/components/ConsultationTypeForm";
import { ConsultationTypeTable } from "@/features/consultation-types/components/ConsultationTypeTable";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración y Tarifas"
        description="Administra los tipos de prestaciones, duraciones y precios por defecto."
      >
        <ConsultationTypeForm />
      </PageHeader>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Tipos de Consulta
        </h2>
        <ConsultationTypeTable />
      </div>
    </div>
  );
}
