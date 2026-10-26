import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getConsultations, createConsultation } from "./api";

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
    },
  });
}
