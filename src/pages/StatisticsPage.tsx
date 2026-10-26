import { PageHeader } from "@/components/shared/PageHeader";
import { FinancialPieChart } from "@/features/statistics/components/FinancialPieChart";
import { MonthlyConsultations } from "@/features/statistics/components/MonthlyConsultations";

export function StatisticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Estadísticas y Reportes"
        description="Análisis financiero y métricas del consultorio."
      />

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <FinancialPieChart />
        <MonthlyConsultations />
      </div>
    </div>
  );
}
