import { useQuery } from "@tanstack/react-query";
import { getDashboardMetrics } from "./api";
import { useAuth } from "@/features/auth/AuthProvider";

export function useDashboardMetrics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboardMetrics", user?.id],
    queryFn: getDashboardMetrics,
    enabled: !!user,
  });
}
