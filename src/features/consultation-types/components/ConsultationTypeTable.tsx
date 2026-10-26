import {
  useConsultationTypes,
  useToggleConsultationTypeStatus,
} from "../hooks";
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
import { formatARS } from "@/lib/money";
import { Clock, Tag, Power, PowerOff } from "lucide-react";
import type { ConsultationType } from "@/types/domain";

export function ConsultationTypeTable() {
  const { data: types, isLoading, error } = useConsultationTypes();
  const toggleStatusMutation = useToggleConsultationTypeStatus();

  const handleToggle = (item: ConsultationType) => {
    toggleStatusMutation.mutate({
      id: item.id,
      isActive: !item.isActive,
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cargando tipos de consulta...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Error al cargar los tipos de consulta.
      </div>
    );
  }

  if (!types || types.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-card text-center">
        <Tag className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-semibold text-lg">
          No hay tipos de servicios configurados
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Crea tu primer tipo de consulta para empezar a definir tarifas.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Servicio</TableHead>
            <TableHead>Duración</TableHead>
            <TableHead>Precio Referencia</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {types.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {item.defaultDurationMinutes} min
              </TableCell>
              <TableCell>{formatARS(item.defaultPriceCents)}</TableCell>
              <TableCell>
                <Badge variant={item.isActive ? "default" : "secondary"}>
                  {item.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggle(item)}
                  className="gap-1.5"
                >
                  {item.isActive ? (
                    <>
                      <PowerOff className="h-4 w-4 text-destructive" />
                      <span className="text-destructive text-xs">
                        Desactivar
                      </span>
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-600 text-xs">Activar</span>
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
