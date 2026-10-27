'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/libs/I18nNavigation';
import { AUTH_QUERY_KEY, signOut } from '@/services/presensiApi';

/**
 * Header sign-out button: drops the server-side session cookie, re-checks the gate and returns the
 * browser to the sign-in route, same flow as the dashboard profile menu's Keluar.
 *
 * @returns Icon button matching the header chip row.
 */
export function PresensiSignOut() {
  const t = useTranslations('PresensiPage');
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    // Only the gate is re-read: invalidating every query would refetch the still-mounted workspace
    // without a cookie and bounce through two pointless 401s.
    await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    router.replace('/sign-in');
  };

  return (
    <button
      className="rounded-xl border border-border-subtle bg-surface-container-low p-2.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
      onClick={() => {
        void handleSignOut();
      }}
      title={t('sign_out')}
      type="button"
    >
      <span className="material-symbols-outlined text-[20px]">logout</span>
    </button>
  );
}
