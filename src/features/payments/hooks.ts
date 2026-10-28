import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPaymentsForConsultation, createPayment } from "./api";
import { useAuth } from "@/features/auth/AuthProvider";

export function usePayments(consultationId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["payments", user?.id, consultationId],
    queryFn: () => getPaymentsForConsultation(consultationId),
    enabled: !!consultationId && !!user,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createPayment,
    onSuccess: (_, variables) => {
      // Invalidamos pagos y también la lista de consultas para que se refresquen los estados y montos cobrados
      queryClient.invalidateQueries({
        queryKey: ["payments", user?.id, variables.consultationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["consultations", user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboardMetrics", user?.id],
      });
    },
  });
}
