import { Calendar, Radio } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Header section displaying attendance session details, class info, and active date.
 *
 * @param props - Component properties.
 * @returns Rendered attendance header.
 */
export function AttendanceHeader(props: { dateText?: string }) {
  const t = useTranslations('AttendancePage');

  return (
    <section className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="flex max-w-3xl flex-col">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pastel-mint px-3 py-1 text-xs font-medium text-black">
            <Radio className="size-3 animate-pulse text-black" />
            {t('session_active')}
          </span>
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {t('room_badge')}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t('page_title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('page_subtitle')}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
          <div className="flex size-10 items-center justify-center rounded-xl bg-surface-container-low text-foreground">
            <Calendar className="size-5 text-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{t('date_label')}</span>
            <span className="text-sm font-semibold text-foreground">
              {props.dateText || t('current_date')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
