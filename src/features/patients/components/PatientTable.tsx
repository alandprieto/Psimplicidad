import { useState } from "react";
import { usePatients, useTogglePatientStatus } from "../hooks";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatLocalDateTime } from "@/lib/dates";
import { Users, MoreHorizontal, Pencil, UserCheck, UserX } from "lucide-react";
import { PatientForm } from "./PatientForm";
import type { Patient } from "@/types/domain";

export function PatientTable() {
  const { data: patients, isLoading, error } = usePatients();
  const toggleStatusMutation = useTogglePatientStatus();
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const handleToggleStatus = (patient: Patient) => {
    toggleStatusMutation.mutate({
      id: patient.id,
      isActive: !patient.isActive,
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cargando pacientes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Error al cargar los pacientes.
      </div>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-card text-center">
        <Users className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-semibold text-lg">No hay pacientes registrados</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Comienza agregando tu primer paciente con el botón superior.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Apellido y Nombre</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de Registro</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">
                {patient.lastName}, {patient.firstName}
              </TableCell>
              <TableCell>{patient.phone || "Sin teléfono"}</TableCell>
              <TableCell>
                <Badge variant={patient.isActive ? "default" : "secondary"}>
                  {patient.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatLocalDateTime(patient.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" className="h-8 w-8 p-0" />}
                  >
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setEditingPatient(patient)}
                      className="w-full gap-2 cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleToggleStatus(patient)}
                      className="gap-2 cursor-pointer"
                    >
                      {patient.isActive ? (
                        <>
                          <UserX className="h-4 w-4 text-destructive" />
                          <span className="text-destructive">Desactivar</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 text-emerald-600" />
                          <span className="text-emerald-600">Activar</span>
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PatientForm
        patient={editingPatient ?? undefined}
        open={editingPatient !== null}
        onOpenChange={(open) => {
          if (!open) setEditingPatient(null);
        }}
      />
    </div>
  );
}
