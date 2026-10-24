'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { AUTH_QUERY_KEY, signOut } from '@/services/presensiApi';

/**
 * Header sign-out button. It only drops the server-side session cookie and re-checks the gate, so the
 * workspace unmounts back into the sign-in form.
 *
 * @returns Icon button matching the header chip row.
 */
export function PresensiSignOut() {
  const t = useTranslations('PresensiPage');
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await signOut();
    // Only the gate is re-read: invalidating every query would refetch the still-mounted workspace
    // without a cookie and bounce through two pointless 401s.
    await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
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
