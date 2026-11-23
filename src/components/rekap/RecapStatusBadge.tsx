import { useTranslations } from 'next-intl';
import type { RecapStatus } from '@/types/recap';

/**
 * Displays the verification status of a recap row.
 *
 * @param props - Current verification status.
 * @returns The localized draft or locked badge.
 */
export function RecapStatusBadge(props: { status: RecapStatus }) {
  const t = useTranslations('RecapPage');

  if (props.status === 'dikunci') {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
        {t('status_locked')}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
      {t('status_draft')}
    </span>
  );
}
