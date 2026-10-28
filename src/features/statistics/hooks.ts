import { useQuery } from "@tanstack/react-query";
import { getMonthlyFinancialStats } from "./api";
import { useAuth } from "@/features/auth/AuthProvider";

export function useMonthlyFinancialStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["monthlyFinancialStats", user?.id],
    queryFn: getMonthlyFinancialStats,
    enabled: !!user,
  });
}
