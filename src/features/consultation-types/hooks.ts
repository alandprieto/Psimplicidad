import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConsultationTypes,
  createConsultationType,
  toggleConsultationTypeStatus,
} from "./api";

export function useConsultationTypes() {
  return useQuery({
    queryKey: ["consultationTypes"],
    queryFn: getConsultationTypes,
  });
}

export function useCreateConsultationType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConsultationType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultationTypes"] });
    },
  });
}

export function useToggleConsultationTypeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleConsultationTypeStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultationTypes"] });
    },
  });
}
