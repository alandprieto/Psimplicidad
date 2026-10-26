import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cancelConsultation,
  createConsultation,
  getConsultations,
  updateConsultation,
} from "./api";

export function useConsultations() {
  return useQuery({
    queryKey: ["consultations"],
    queryFn: getConsultations,
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
    },
  });
}

export function useUpdateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateConsultation>[1];
    }) => updateConsultation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
    },
  });
}

export function useCancelConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
    },
  });
}
