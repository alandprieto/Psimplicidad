import { useMonthlyFinancialStats } from "../hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { centsToPesos, formatARS } from "@/lib/money";
import { PieChart as ChartIcon } from "lucide-react";

const COLORS = ["#10b981", "#f59e0b"]; // Verde para cobrado, Amarillo/Naranja para pendiente

export function FinancialPieChart() {
  const { data, isLoading, error } = useMonthlyFinancialStats();

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Cargando estadísticas financieras...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Error al cargar las estadísticas.
      </div>
    );
  }

  const { totalCollectedCents, totalPendingCents } = data!;

  // Si no hay montos, mostramos un gráfico vacío o aviso
  const chartData = [
    { name: "Cobrado", value: centsToPesos(totalCollectedCents) },
    { name: "Pendiente de Cobro", value: centsToPesos(totalPendingCents) },
  ];

  const hasData = totalCollectedCents > 0 || totalPendingCents > 0;

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">
          Estado Financiero del Mes
        </CardTitle>
        <ChartIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <p>No hay registros financieros para este mes todavía.</p>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) =>
                    `${name}: ${formatARS(value * 100)}`
                  }
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatARS(Number(value) * 100)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
