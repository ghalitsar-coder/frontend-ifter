import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import type { AuditLogPage } from '@/lib/api/dto';

// ---------------------------------------------------------------------------
// Audit log viewer (GET /audit-logs — admin only). Keys extend the foundation
// convention with a module root so invalidations never collide with other
// modules.
// ---------------------------------------------------------------------------
export const auditQueryKeys = {
  root: ['audit'] as const,
  logs: (query: AuditLogQuery) => ['audit', 'logs', query] as const,
};

/** Server-side filter + pagination params accepted by GET /audit-logs. */
export type AuditLogFilterState = {
  action?: string;
  entity_type?: string;
  entity_id?: string;
  actor_id?: string;
  from?: string;
  to?: string;
};

export type AuditLogQuery = AuditLogFilterState & {
  limit: number;
  offset: number;
};

/**
 * Turn filter state into the API query, dropping blank inputs so the backend
 * default limit applies when no page size was chosen.
 * @param filter - Current filter bar state (page is 1-based).
 * @param page - 1-based page number.
 * @param pageSize - Rows per page.
 * @returns Query params for `auditLogsOptions`.
 */
export const buildAuditLogQuery = (
  filter: AuditLogFilterState,
  page: number,
  pageSize: number,
): AuditLogQuery => {
  const query: AuditLogQuery = {
    limit: pageSize,
    offset: (Math.max(1, page) - 1) * pageSize,
  };
  for (const key of ['action', 'entity_type', 'entity_id', 'actor_id', 'from', 'to'] as const) {
    const value = filter[key]?.trim();
    if (value !== undefined && value !== '') {
      query[key] = value;
    }
  }

  return query;
};

/**
 * Format one audit entry's before/after payload for display.
 * @param value - Raw JSON payload (may be undefined).
 * @returns Pretty JSON, or '' when absent.
 */
export const formatAuditPayload = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '';
  }

  return JSON.stringify(value, null, 2);
};

/**
 * Localized-ish timestamp label for the table (date + HH:mm, browser locale).
 * @param iso - RFC3339 timestamp.
 * @returns 'DD/MM/YYYY HH:mm', or the raw string when unparseable.
 */
export const formatAuditTimestamp = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return `${date.toLocaleDateString('en-CA')} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
};

const auditLogsOptions = (query: AuditLogQuery) =>
  queryOptions({
    queryKey: auditQueryKeys.logs(query),
    queryFn: async () => await apiGet<AuditLogPage>('/audit-logs', { ...query }),
  });

/**
 * GET /audit-logs → paginated audit entries with server-side filters.
 * @param query - Filters + limit/offset from `buildAuditLogQuery`.
 * @returns React Query result with `AuditLogPage`.
 */
export const useAuditLogs = (query: AuditLogQuery) => useQuery(auditLogsOptions(query));
