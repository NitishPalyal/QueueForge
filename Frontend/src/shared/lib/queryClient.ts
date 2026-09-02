import { QueryClient } from "@tanstack/react-query";

interface QueryErrorShape {
  response?: {
    status?: number;
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: unknown) => {
        const typedError = error as QueryErrorShape | null;
        if (
          typedError?.response?.status === 401 ||
          typedError?.response?.status === 404
        ) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});
