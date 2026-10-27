// Cookie name mirrors BackendSession.BACKEND_SESSION_COOKIE; kept literal so the proxy stays
// free of next/headers and Env imports (middleware bundle-size convention).
export const SESSION_COOKIE_NAME = 'ifter_token';

// shortcut: page-level gate is UX only — the Go backend re-checks the JWT role on every API call.
// Roles outside this table only reach the unrestricted dashboard pages.
const RESTRICTED_PAGES: Record<string, string[]> = {
  kedisiplinan: ['admin', 'guru'],
  presensi: ['admin', 'guru'],
};

type DecodedToken = {
  expired: boolean;
  roles: string[];
};

/**
 * Read the roles and expiry out of the backend JWT without verifying its signature; the signature
 * is the backend's job on every proxied API call.
 *
 * @param token - Raw `ifter_token` cookie value, or undefined when nobody is signed in.
 * @returns Decoded claims, or null when the cookie is missing or unreadable.
 */
export function decodeBackendToken(token?: string): DecodedToken | null {
  const payloadSegment = token?.split('.')[1];

  if (payloadSegment === undefined) {
    return null;
  }

  try {
    const base64 = payloadSegment.replaceAll('-', '+').replaceAll('_', '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const claims = JSON.parse(atob(padded)) as { exp?: number; roles?: unknown };

    return {
      expired: typeof claims.exp === 'number' && claims.exp * 1000 <= Date.now(),
      roles: Array.isArray(claims.roles)
        ? claims.roles.filter((r): r is string => typeof r === 'string')
        : [],
    };
  } catch {
    return null;
  }
}

/**
 * Decide whether a signed-in role may open one dashboard page.
 *
 * @param roles - Roles from the backend JWT.
 * @param page - Segment after `/dashboard` (empty string for the dashboard root itself).
 * @returns True when the page is unrestricted or one of the roles may see it.
 */
export function isAllowedPage(roles: string[], page: string): boolean {
  const allowedRoles = RESTRICTED_PAGES[page];

  if (allowedRoles === undefined) {
    return true;
  }

  // School admins registered through the wizard may carry any role name containing `admin`.
  return roles.some((role) => allowedRoles.includes(role) || role.includes('admin'));
}
