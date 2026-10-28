import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cancelConsultation,
  createConsultation,
  getConsultations,
  updateConsultation,
} from "./api";
import { useAuth } from "@/features/auth/AuthProvider";

export function useConsultations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["consultations", user?.id],
    queryFn: getConsultations,
    enabled: !!user,
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["dashboardMetrics", user?.id],
      });
    },
  });
}

export function useUpdateConsultation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateConsultation>[1];
    }) => updateConsultation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["dashboardMetrics", user?.id],
      });
    },
  });
}

export function useCancelConsultation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: cancelConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["dashboardMetrics", user?.id],
      });
    },
  });
}
