import { useTranslations } from 'next-intl';

/**
 * Pill badge that reflects whether a recap row is still editable (draft) or locked (dikunci).
 */
export function RecapStatusBadge(props: { status: 'draft' | 'dikunci' }) {
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
