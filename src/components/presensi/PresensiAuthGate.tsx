'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { PresensiLoginScreen } from '@/components/presensi/PresensiLoginScreen';
import { PresensiNotice } from '@/components/presensi/PresensiNotice';
import { restoreSession } from '@/lib/api/auth';
import { useRouter } from '@/libs/I18nNavigation';

/**
 * Sign-in gate of the standalone login screen: a restored session is sent to the dashboard, while
 * visitors without one get the login form.
 *
 * @returns Loading notice or the login screen.
 */
export function PresensiAuthGate() {
  const t = useTranslations('PresensiPage');
  const router = useRouter();
  const session = useQuery({
    queryFn: restoreSession,
    queryKey: ['auth', 'session-restore'],
    retry: false,
  });

  useEffect(() => {
    if (session.data !== null && session.data !== undefined) {
      router.replace('/dashboard');
    }
  }, [router, session.data]);

  if (session.data === null) {
    return <PresensiLoginScreen />;
  }

  return <PresensiNotice text={t('loading_account')} />;
}
