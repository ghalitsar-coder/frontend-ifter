'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Provides one TanStack Query client for the whole app.
 */
export const QueryProvider = (props: { children: React.ReactNode }) => {
  // Created once per browser session so cache survives re-renders
  const [queryClient] = useState(() => new QueryClient());

  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
};
