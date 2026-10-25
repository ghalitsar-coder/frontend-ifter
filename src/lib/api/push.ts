import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiDelete, apiGet, apiPost } from '@/lib/api/client';
import type { DataList } from '@/lib/api/dto';

/** GET /push/config response. */
export type PushConfig = {
  enabled: boolean;
  public_key: string;
};

/** Subscription record returned by the backend. */
export type PushSubscriptionRecord = {
  id: string;
  endpoint: string;
  user_agent?: string | null;
  created_at: string;
  updated_at: string;
};

/** POST /push/subscriptions body. */
export type PushSubscriptionPayload = {
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string;
};

/** POST /admin/push/test result. */
export type PushTestResult = {
  sent: number;
  failed: number;
};

export const pushKeys = {
  config: ['push', 'config'] as const,
  subscriptions: ['push', 'subscriptions'] as const,
};

/**
 * GET /push/config.
 * @returns Server push capability and VAPID public key.
 */
export const fetchPushConfig = async (): Promise<PushConfig> =>
  await apiGet<PushConfig>('/push/config');

/**
 * GET /push/subscriptions.
 * @returns Current user's device subscriptions.
 */
export const fetchPushSubscriptions = async (): Promise<PushSubscriptionRecord[]> => {
  const result = await apiGet<DataList<PushSubscriptionRecord>>('/push/subscriptions');
  return result.data;
};

/**
 * POST /push/subscriptions.
 * @param payload - Browser subscription keys.
 * @returns Created subscription record.
 */
export const createPushSubscription = async (
  payload: PushSubscriptionPayload,
): Promise<PushSubscriptionRecord> => {
  const result = await apiPost<{ subscription: PushSubscriptionRecord }>(
    '/push/subscriptions',
    payload,
  );
  return result.subscription;
};

/**
 * DELETE /push/subscriptions/:id.
 * @param subscriptionId - Subscription record id.
 */
export const deletePushSubscription = async (subscriptionId: string): Promise<void> => {
  await apiDelete<null>(`/push/subscriptions/${encodeURIComponent(subscriptionId)}`);
};

/**
 * POST /admin/push/test.
 * @param payload - Notification title and body.
 * @returns Delivery counters.
 */
export const sendPushTest = async (payload: {
  title: string;
  body: string;
}): Promise<PushTestResult> => await apiPost<PushTestResult>('/admin/push/test', payload);

/**
 * Whether the backend rejected the call because push is disabled (503).
 * @param error - Error thrown by the API client.
 * @returns True only for `ApiError` with code `push_disabled`.
 */
export const isPushDisabled = (error: unknown): boolean =>
  error instanceof ApiError && error.code === 'push_disabled';

export const pushConfigOptions = () =>
  queryOptions({
    queryKey: pushKeys.config,
    queryFn: async () => await fetchPushConfig(),
  });

export const pushSubscriptionOptions = () =>
  queryOptions({
    queryKey: pushKeys.subscriptions,
    queryFn: async () => await fetchPushSubscriptions(),
  });

/**
 * GET /push/config.
 * @returns React Query result with `PushConfig`.
 */
export const usePushConfig = () => useQuery(pushConfigOptions());

/**
 * GET /push/subscriptions.
 * @returns React Query result with subscription records.
 */
export const usePushSubscriptions = () => useQuery(pushSubscriptionOptions());

/**
 * POST /push/subscriptions.
 * @returns Mutation over `PushSubscriptionPayload`.
 */
export const useCreatePushSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PushSubscriptionPayload) => await createPushSubscription(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pushKeys.subscriptions });
    },
  });
};

/**
 * DELETE /push/subscriptions/:id.
 * @returns Mutation over the subscription id.
 */
export const useDeletePushSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      await deletePushSubscription(subscriptionId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pushKeys.subscriptions });
    },
  });
};

/**
 * POST /admin/push/test.
 * @returns Mutation over the test notification payload.
 */
export const useSendPushTest = () =>
  useMutation({
    mutationFn: async (payload: { title: string; body: string }) => await sendPushTest(payload),
  });
