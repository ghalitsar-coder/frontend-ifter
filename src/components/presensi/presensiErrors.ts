import { PresensiApiError } from '@/services/presensiApi';

const ERROR_KEYS = {
  account_disabled: 'error_account_disabled',
  empty_attendances: 'error_empty_attendances',
  forbidden: 'error_forbidden',
  internal_error: 'error_generic',
  invalid_credentials: 'error_invalid_credentials',
  locked: 'error_locked',
  no_role: 'error_no_role',
  not_found: 'error_not_found',
  not_staff: 'error_not_staff',
  student_not_enrolled: 'error_student_not_enrolled',
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
 * @param error - Thrown value, expected to be a PresensiApiError.
 * @returns Key inside the PresensiPage namespace.
 */
export function presensiErrorKey(error: unknown): PresensiErrorKey {
  const code = error instanceof PresensiApiError ? error.code : '';
  const entry = Object.entries(ERROR_KEYS).find(([backendCode]) => backendCode === code);

  return entry?.[1] ?? 'error_generic';
}

/**
 * Whether the backend rejected the session cookie, which means the teacher must sign in again.
 *
 * @param error - Thrown value of a failed backend call.
 * @returns True for HTTP 401.
 */
export function isUnauthorized(error: unknown): boolean {
  return error instanceof PresensiApiError && error.status === 401;
}
