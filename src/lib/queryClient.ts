import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Considerar datos frescos por 5 minutos
      gcTime: 1000 * 60 * 30,    // Mantener en caché no usada por 30 minutos
      refetchOnWindowFocus: false, // Evitar refetch invasivo al cambiar de pestaña
      retry: 1,
    },
  },
});
