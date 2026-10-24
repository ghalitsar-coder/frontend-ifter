'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PresensiLoginScreen } from '@/components/presensi/PresensiLoginScreen';
import { PresensiNotice } from '@/components/presensi/PresensiNotice';
import { PresensiWorkspace } from '@/components/presensi/PresensiWorkspace';
import { AUTH_QUERY_KEY, getAuthStatus } from '@/services/presensiApi';

/**
 * Sign-in gate of the attendance screen: it asks the session route for cookie presence only, shows
 * the login screen until a session exists, and mounts the workspace — with its backend queries — after.
 *
 * @returns Loading notice, login screen, or the attendance workspace.
 */
export function PresensiAuthGate() {
  const t = useTranslations('PresensiPage');
  const auth = useQuery({ queryFn: getAuthStatus, queryKey: AUTH_QUERY_KEY, retry: false });

  if (auth.data === undefined) {
    return <PresensiNotice state="loading" text={t('loading_account')} />;
  }

  if (!auth.data) {
    return <PresensiLoginScreen />;
  }

  return <PresensiWorkspace />;
}
