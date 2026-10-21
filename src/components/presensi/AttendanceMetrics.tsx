import { AlertTriangle, CheckCircle2, FileText, Plus, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Bento summary metric cards showing total students, present, sick, permitted, and absent counts.
 *
 * @param props - Counts for attendance categories.
 * @returns Bento metrics grid.
 */
export function AttendanceMetrics(props: {
  total: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
}) {
  const t = useTranslations('AttendancePage');
  const hadirPercentage = props.total > 0 ? ((props.hadir / props.total) * 100).toFixed(1) : '0';

  return (
    <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* Total Siswa */}
      <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="mb-3 flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold tracking-wider uppercase">
            {t('total_students_label')}
          </span>
          <Users className="size-4 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tracking-tight text-foreground">{props.total}</span>
          <span className="text-xs text-muted-foreground">{t('total_students_unit')}</span>
        </div>
        <div className="mt-3 border-t border-border/50 pt-1 text-xs text-muted-foreground">
          {t('total_students_caption')}
        </div>
      </div>

      {/* Hadir (Mint) */}
      <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="mb-3 flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold tracking-wider uppercase">{t('hadir_label')}</span>
          <span className="rounded-full bg-pastel-mint px-2 py-0.5 text-xs font-semibold text-black">
            {hadirPercentage}%
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tracking-tight text-foreground">{props.hadir}</span>
          <span className="text-xs text-muted-foreground">{t('total_students_unit')}</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 border-t border-border/50 pt-1 text-xs font-medium text-foreground">
          <CheckCircle2 className="size-3.5 text-black" />
          <span>{t('hadir_caption')}</span>
        </div>
      </div>

      {/* Sakit (Yellow) */}
      <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="mb-3 flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold tracking-wider uppercase">{t('sakit_label')}</span>
          <span className="rounded-full bg-pastel-yellow px-2 py-0.5 text-xs font-semibold text-black">
            {t('sakit_badge')}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tracking-tight text-foreground">{props.sakit}</span>
          <span className="text-xs text-muted-foreground">{t('total_students_unit')}</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 border-t border-border/50 pt-1 text-xs font-medium text-foreground">
          <Plus className="size-3.5 text-black" />
          <span>{t('sakit_caption')}</span>
        </div>
      </div>

      {/* Izin (Blue) */}
      <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="mb-3 flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold tracking-wider uppercase">{t('izin_label')}</span>
          <span className="rounded-full bg-pastel-blue px-2 py-0.5 text-xs font-semibold text-black">
            {t('izin_badge')}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tracking-tight text-foreground">{props.izin}</span>
          <span className="text-xs text-muted-foreground">{t('total_students_unit')}</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 border-t border-border/50 pt-1 text-xs font-medium text-foreground">
          <FileText className="size-3.5 text-black" />
          <span>{t('izin_caption')}</span>
        </div>
      </div>

      {/* Alpa (Red) */}
      <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="mb-3 flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold tracking-wider uppercase">{t('alpa_label')}</span>
          <span className="rounded-full bg-pastel-red px-2 py-0.5 text-xs font-semibold text-black">
            {t('alpa_badge')}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tracking-tight text-foreground">{props.alpa}</span>
          <span className="text-xs text-muted-foreground">{t('total_students_unit')}</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 border-t border-border/50 pt-1 text-xs font-medium text-destructive">
          <AlertTriangle className="size-3.5 text-destructive" />
          <span>{t('alpa_caption')}</span>
        </div>
      </div>
    </section>
  );
}
