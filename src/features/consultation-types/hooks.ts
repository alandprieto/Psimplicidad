import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConsultationTypes,
  createConsultationType,
  toggleConsultationTypeStatus,
} from "./api";
import { useAuth } from "@/features/auth/AuthProvider";

export function useConsultationTypes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["consultationTypes", user?.id],
    queryFn: getConsultationTypes,
    enabled: !!user,
  });
}

export function useCreateConsultationType() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createConsultationType,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["consultationTypes", user?.id],
      });
    },
  });
}

export function useToggleConsultationTypeStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleConsultationTypeStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["consultationTypes", user?.id],
      });
    },
  });
}
