'use client';

import { useLocale } from 'next-intl';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { logout as logoutSession, restoreSession } from '@/lib/api/auth';
import { setLogoutHandler } from '@/lib/api/client';
import type { ApiUser, UserRole } from '@/lib/api/dto';
import { getI18nPath } from '@/utils/Helpers';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthContextValue = {
  user: ApiUser | null;
  roles: UserRole[];
  status: AuthStatus;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Restores the backend session on mount (POST /auth/refresh then GET /auth/me)
 * and gates every route rendered inside it. Unauthenticated visitors are
 * redirected to the locale-aware sign-in page.
 *
 * @param props - `children` renders only when authenticated; optional
 *   `fallback` replaces children during the restore/loading phase.
 * @returns Provider element, loading fallback, or the gated children.
 */
export const AuthProvider = (props: {
  children: React.ReactNode;
  fallback?: React.ReactElement;
}) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const locale = useLocale();
  // Plain string keeps the mount effect dependency-stable (no re-runs).
  const signInPath = getI18nPath('/sign-in', locale);

  useEffect(() => {
    let active = true;

    const goToSignIn = () => {
      window.location.assign(signInPath);
    };

    setLogoutHandler(() => {
      setUser(null);
      setStatus('unauthenticated');
      goToSignIn();
    });

    const init = async () => {
      const restored = await restoreSession();
      if (!active) {
        return;
      }
      if (restored === null) {
        setStatus('unauthenticated');
        goToSignIn();
        return;
      }
      setUser(restored);
      setStatus('authenticated');
    };

    void init();

    return () => {
      active = false;
      setLogoutHandler(null);
    };
  }, [signInPath]);

  // useMemo is unavoidable here: the react lint rule requires a stable
  // context value object (no-constructed-context-values).
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      roles: user?.roles ?? [],
      status,
      logout: async () => {
        await logoutSession();
        setUser(null);
        setStatus('unauthenticated');
        window.location.assign(signInPath);
      },
    }),
    [user, status, signInPath],
  );

  if (status === 'loading') {
    return (
      props.fallback ?? (
        <div className="flex min-h-screen items-center justify-center">
          <span className="text-sm text-neutral-500">Memuat sesi…</span>
        </div>
      )
    );
  }

  if (status === 'unauthenticated') {
    // Redirect to sign-in is in flight; render nothing to avoid flicker.
    return null;
  }

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
};

/**
 * Access the authenticated user, roles, status and logout action.
 * @returns The current auth context value.
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }
  return context;
};
