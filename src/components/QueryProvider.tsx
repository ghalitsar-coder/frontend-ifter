'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Provides one TanStack Query client for the whole app.
 * @param props - Content that shares the query cache.
 * @returns The query provider wrapping its children.
 */
export const QueryProvider = (props: { children: React.ReactNode }) => {
  // oxlint-disable-next-line react/hook-use-state -- the client lives for one provider mount and is never replaced
  const [queryClient] = useState(() => new QueryClient());

  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
};
