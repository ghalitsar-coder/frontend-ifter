'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Provides one TanStack Query client for the whole app.
 * @param props - Component properties.
 * @param props.children - App subtree sharing the query cache.
 * @returns Query client provider element.
 */
export const QueryProvider = (props: { children: React.ReactNode }) => {
  // Created once per browser session so cache survives re-renders
  // oxlint-disable-next-line react/hook-use-state -- lazy singleton, the setter is intentionally unused
  const [queryClient] = useState(() => new QueryClient());

  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
};
