import { Clock, Wifi } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Segmented progress bar showing attendance compliance and sync health status.
 *
 * @param props - Counts for calculation.
 * @returns Progress bar section.
 */
export function AttendanceProgressBar(props: {
  total: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
}) {
  const t = useTranslations('AttendancePage');

  const hadirPct = props.total > 0 ? (props.hadir / props.total) * 100 : 0;
  const sakitPct = props.total > 0 ? (props.sakit / props.total) * 100 : 0;
  const izinPct = props.total > 0 ? (props.izin / props.total) * 100 : 0;
  const alpaPct = props.total > 0 ? (props.alpa / props.total) * 100 : 0;

  const validCount = props.hadir + props.sakit + props.izin;
  const verifiedRate = props.total > 0 ? ((validCount / props.total) * 100).toFixed(1) : '0';

  return (
    <section className="mb-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs md:flex-row">
      <div className="flex w-full flex-col gap-2 md:w-3/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block size-2.5 rounded-full bg-pastel-mint" />
            <span className="text-sm font-semibold text-foreground">
              {t('discipline_level_label')}
            </span>
          </div>
          <span className="text-sm font-bold text-foreground">
            {verifiedRate}% {t('verified_percentage').replace(/^\d+(\.\d+)?%\s*/u, '')}
          </span>
        </div>

        {/* Custom Segmented Gauge Bar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full border border-border/40 bg-surface-container-low">
          <div
            className="h-full bg-pastel-mint transition-all duration-300"
            style={{ width: `${hadirPct}%` }}
            title={`Hadir (${hadirPct.toFixed(1)}%)`}
          />
          <div
            className="h-full bg-pastel-yellow transition-all duration-300"
            style={{ width: `${sakitPct}%` }}
            title={`Sakit (${sakitPct.toFixed(1)}%)`}
          />
          <div
            className="h-full bg-pastel-blue transition-all duration-300"
            style={{ width: `${izinPct}%` }}
            title={`Izin (${izinPct.toFixed(1)}%)`}
          />
          <div
            className="h-full bg-pastel-red transition-all duration-300"
            style={{ width: `${alpaPct}%` }}
            title={`Alpa (${alpaPct.toFixed(1)}%)`}
          />
        </div>

        <span className="text-xs text-muted-foreground">
          {validCount} dari {props.total}{' '}
          {t('verified_caption').replace(/^\d+\s*dari\s*\d+\s*/iu, '')}
        </span>
      </div>

      <div className="flex w-full items-center justify-start gap-3 md:w-auto md:justify-end">
        <div className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-surface-container-low px-3 py-1.5 text-xs font-medium text-foreground">
          <Wifi className="size-3.5 text-muted-foreground" />
          <span>{t('cloud_sync_label')}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-surface-container-low px-3 py-1.5 text-xs font-medium text-foreground">
          <Clock className="size-3.5 text-muted-foreground" />
          <span>{t('sync_time_label')}</span>
        </div>
      </div>
    </section>
  );
}
