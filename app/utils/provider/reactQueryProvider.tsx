"use client";

import {
  QueryClientProvider,
  QueryClient,
  HydrationBoundary,
  keepPreviousData,
  DefaultOptions,
} from "@tanstack/react-query";

const queryConfig: DefaultOptions = {
  queries: {
    // retry: false,
  },
};
export const queryClient = new QueryClient({ defaultOptions: queryConfig });

const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary>{children}</HydrationBoundary>
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;
