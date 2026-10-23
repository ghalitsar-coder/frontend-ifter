import { Check, Download, Plane } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { TeacherHistoryRow } from '@/types/teacherPresence';

/**
 * Weekly teacher attendance log with monthly PDF export action.
 *
 * @param props - History rows and export handler.
 * @returns History table card.
 */
export function TeacherHistoryTable(props: { rows: TeacherHistoryRow[]; onDownload: () => void }) {
  const t = useTranslations('TeacherPresencePage');

  return (
    <section className="mt-8 rounded-2xl border border-border-subtle bg-card p-5 shadow-xs sm:p-6">
      <div className="mb-4 flex flex-col justify-between gap-3 border-b border-border-subtle pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            {t('history_title')}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{t('history_subtitle')}</p>
        </div>

        <button
          type="button"
          onClick={props.onDownload}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-pine-light px-3.5 py-2.5 text-[11px] font-bold text-pine-deep transition-colors hover:bg-pine-light/70 sm:text-xs"
        >
          <Download className="size-3.5" />
          {t('history_download')}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              <th className="py-3 pr-4">{t('history_col_day')}</th>
              <th className="px-4 py-3">{t('history_col_in')}</th>
              <th className="px-4 py-3">{t('history_col_out')}</th>
              <th className="px-4 py-3">{t('history_col_method')}</th>
              <th className="px-4 py-3">{t('history_col_hours')}</th>
              <th className="py-3 pl-4">{t('history_col_status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {props.rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-hover-row">
                <td className="py-3.5 pr-4">
                  <span className="font-semibold text-foreground">
                    {row.day}, {row.date}
                  </span>
                  {row.isToday && (
                    <span className="ml-1 text-[11px] font-medium text-muted-foreground">
                      {t('history_today')}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 font-medium text-foreground tabular-nums">
                  {row.checkIn} WIB
                </td>
                <td className="px-4 py-3.5 font-medium text-foreground tabular-nums">
                  {row.checkOut} WIB
                </td>
                <td className="px-4 py-3.5 text-muted-foreground">{row.method}</td>
                <td className="px-4 py-3.5 font-semibold text-foreground">{row.hours}</td>
                <td className="py-3.5 pl-4">
                  {row.status === 'tepat_waktu' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-pine-light px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-pine-deep">
                      <Check className="size-3" />
                      {t('status_on_time')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-gold/50 bg-amber-surface px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-amber-dark">
                      <Plane className="size-3" />
                      {t('status_field_duty')}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
