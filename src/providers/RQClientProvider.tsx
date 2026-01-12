import type { PropsWithChildren } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// eslint-disable-next-line react-refresh/only-export-components
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});
export default function ReactQueryClientProvider({ children }: PropsWithChildren) {

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}