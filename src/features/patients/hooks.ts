import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPatients, createPatient } from "./api";
import { updatePatient, togglePatientStatus } from "./api";
import { useAuth } from "@/features/auth/AuthProvider";

export function usePatients() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["patients", user?.id],
    queryFn: getPatients,
    enabled: !!user,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      // Invalida la caché para que la lista de pacientes se actualice sola
      queryClient.invalidateQueries({ queryKey: ["patients", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["dashboardMetrics", user?.id],
      });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { firstName: string; lastName: string; phone?: string };
    }) => updatePatient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["dashboardMetrics", user?.id],
      });
    },
  });
}

export function useTogglePatientStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      togglePatientStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["dashboardMetrics", user?.id],
      });
    },
  });
}
