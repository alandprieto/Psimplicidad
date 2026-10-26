import { useQuery } from "@tanstack/react-query";
import { getMonthlyFinancialStats } from "./api";

export function useMonthlyFinancialStats() {
  return useQuery({
    queryKey: ["monthlyFinancialStats"],
    queryFn: getMonthlyFinancialStats,
  });
}
