'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { PresensiNotice } from '@/components/presensi/PresensiNotice';
import { PresensiWorkspace } from '@/components/presensi/PresensiWorkspace';
import { useRouter } from '@/libs/I18nNavigation';
import { AUTH_QUERY_KEY, getAuthStatus } from '@/services/presensiApi';

/**
 * Sign-in gate of the attendance screen: the layout already redirects unauthenticated browsers, so
 * this only re-checks the session cookie and bounces back to the sign-in route when a mid-session
 * 401 cleared it.
 *
 * @returns Loading notice, or the attendance workspace.
 */
export function PresensiAuthGate() {
  const t = useTranslations('PresensiPage');
  const router = useRouter();
  const auth = useQuery({ queryFn: getAuthStatus, queryKey: AUTH_QUERY_KEY, retry: false });

  useEffect(() => {
    if (auth.data === false) {
      router.replace('/sign-in');
    }
  });

  if (auth.data !== true) {
    return <PresensiNotice state="loading" text={t('loading_account')} />;
  }

  return <PresensiWorkspace />;
}
