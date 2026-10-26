import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPaymentsForConsultation, createPayment } from "./api";

export function usePayments(consultationId: string) {
  return useQuery({
    queryKey: ["payments", consultationId],
    queryFn: () => getPaymentsForConsultation(consultationId),
    enabled: !!consultationId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,
    onSuccess: (_, variables) => {
      // Invalidamos pagos y también la lista de consultas para que se refresquen los estados y montos cobrados
      queryClient.invalidateQueries({
        queryKey: ["payments", variables.consultationId],
      });
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
    },
  });
}
