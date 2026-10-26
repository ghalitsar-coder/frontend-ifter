import { ApiError } from '@/lib/api/client';

const ERROR_KEYS = {
  account_disabled: 'error_account_disabled',
  forbidden: 'error_forbidden',
  internal_error: 'error_generic',
  invalid_credentials: 'error_invalid_credentials',
  invalid_token: 'error_invalid_credentials',
  not_found: 'error_not_found',
  unreachable: 'error_unreachable',
} as const;

/**
 * PresensiPage key of the message for one backend failure.
 */
export type PresensiErrorKey = (typeof ERROR_KEYS)[keyof typeof ERROR_KEYS];

/**
 * Translation key of the message for a failed backend call. Codes the screen has no copy for fall
 * back to the generic line, so nothing ever renders the backend's own prose.
 *
 * @param error - Thrown value, expected to be an ApiError.
 * @returns Key inside the PresensiPage namespace.
 */
export function presensiErrorKey(error: unknown): PresensiErrorKey {
  const code = error instanceof ApiError ? error.code : '';
  const entry = Object.entries(ERROR_KEYS).find(([backendCode]) => backendCode === code);

  return entry?.[1] ?? 'error_generic';
}
