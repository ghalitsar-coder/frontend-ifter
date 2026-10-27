import { detectBot } from '@arcjet/next';
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import arcjet from '@/libs/Arcjet';
import { decodeBackendToken, isAllowedPage, SESSION_COOKIE_NAME } from '@/libs/DashboardAccess';
import { routing } from './libs/I18nRouting';

const handleI18nRouting = createMiddleware(routing);

/**
 * Dashboard page gate: only an unexpired backend session may open `/dashboard`, and only the pages
 * its roles allow. The JWT signature itself is never trusted here — the Go backend re-verifies it
 * on every API call; this redirect is the UX-level selection.
 *
 * @param request - Incoming navigation request.
 * @returns A redirect, or null when the page may render.
 */
function gateDashboard(request: NextRequest): NextResponse | null {
  const allSegments = request.nextUrl.pathname.split('/').filter(Boolean);
  const locales = routing.locales as readonly string[];
  const segments = locales.includes(allSegments[0] ?? '') ? allSegments.slice(1) : allSegments;

  if (segments[0] !== 'dashboard') {
    return null;
  }

  const session = decodeBackendToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (session === null || session.expired) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (!isAllowedPage(session.roles, segments[1] ?? '')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return null;
}

// Improve security with Arcjet
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    // Block all bots except the following
    allow: [
      // See https://docs.arcjet.com/bot-protection/identifying-bots
      'CATEGORY:SEARCH_ENGINE', // Allow search engines
      'CATEGORY:PREVIEW', // Allow preview links to show OG images
      'CATEGORY:MONITOR', // Allow uptime monitoring services
    ],
  }),
);

export default async function proxy(request: NextRequest) {
  // Verify the request with Arcjet
  // Use `process.env` instead of Env to reduce bundle size in middleware
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const gate = gateDashboard(request);

  if (gate !== null) {
    return gate;
  }

  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next`, `/_vercel` or `monitoring`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!_next|_vercel|monitoring|api|.*\\..*).*)',
};
