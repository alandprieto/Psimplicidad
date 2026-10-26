import { PageHeader } from "@/components/shared/PageHeader";
import { PatientForm } from "@/features/patients/components/PatientForm";
import { PatientTable } from "@/features/patients/components/PatientTable";

export function PatientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacientes"
        description="Administra el directorio de pacientes y su información de contacto."
      >
        <PatientForm />
      </PageHeader>

      <PatientTable />
    </div>
  );
}
