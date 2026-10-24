import { Calendar, Download, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { RekapClassOption } from '@/lib/api/rekap';

/**
 * Top Context and Filter Bar for Monthly Attendance Matrix.
 * @param props - Component properties.
 * @returns Rendered Rekap Header component.
 */
export function RekapHeader(props: {
  classes: RekapClassOption[];
  periods: string[];
  selectedClassId: string;
  selectedPeriod: string;
  onClassChange: (classId: string) => void;
  onPeriodChange: (period: string) => void;
  /** Export of the per-student recap workbook (GET /exports/attendance). */
  onExportSummary: () => void;
  /** Export of the grouped report workbook (GET /exports/attendance-report). */
  onExportReport: () => void;
  onOpenBroadcastModal: () => void;
}) {
  const t = useTranslations('RekapPage');

  return (
    <section className="bg-surface-card flex flex-col items-start justify-between gap-6 rounded-2xl p-6 shadow-xs xl:flex-row xl:items-center">
      <div className="max-w-2xl space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="font-caption inline-flex items-center gap-1.5 rounded-full bg-pine-light px-3 py-0.5 text-xs font-semibold text-pine-deep">
            <Calendar className="size-3.5 text-pine-deep" />
            {t('badge_module')}
          </span>
          <span className="font-caption text-text-muted text-xs">{t('badge_sync')}</span>
        </div>
        <h1 className="text-text-primary text-xl font-bold tracking-tight sm:text-2xl">
          {t('title')}
        </h1>
        <p className="font-body-md text-text-muted text-xs leading-relaxed sm:text-sm">
          {t('subtitle')}
        </p>
      </div>

      <div className="flex w-full flex-wrap items-center justify-start gap-3 xl:w-auto xl:justify-end">
        {/* Dropdown Kelas */}
        <div className="relative min-w-[240px] flex-1 sm:flex-initial">
          <label
            className="font-caption text-text-muted mb-1 block text-[11px] font-semibold tracking-wider uppercase"
            htmlFor="select-rekap-class"
          >
            {t('select_class_label')}
          </label>
          <select
            className="bg-canvas-base text-text-primary focus:bg-surface-card h-11 w-full cursor-pointer appearance-none rounded-xl px-3.5 pr-8 text-xs font-medium shadow-inner transition-all focus:ring-2 focus:ring-pine-deep/15 focus:outline-none"
            id="select-rekap-class"
            value={props.selectedClassId}
            onChange={(e) => {
              props.onClassChange(e.target.value);
            }}
          >
            {props.classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.homeroomName === undefined || cls.homeroomName === ''
                  ? cls.name
                  : `${cls.name} (Wali: ${cls.homeroomName})`}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Periode */}
        <div className="relative min-w-[200px] flex-1 sm:flex-initial">
          <label
            className="font-caption text-text-muted mb-1 block text-[11px] font-semibold tracking-wider uppercase"
            htmlFor="select-rekap-period"
          >
            {t('select_period_label')}
          </label>
          <select
            className="bg-canvas-base text-text-primary focus:bg-surface-card h-11 w-full cursor-pointer appearance-none rounded-xl px-3.5 pr-8 text-xs font-medium shadow-inner transition-all focus:ring-2 focus:ring-pine-deep/15 focus:outline-none"
            id="select-rekap-period"
            value={props.selectedPeriod}
            onChange={(e) => {
              props.onPeriodChange(e.target.value);
            }}
          >
            {props.periods.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full items-center gap-2 pt-2 sm:w-auto sm:pt-4">
          <button
            className="bg-canvas-base inline-flex h-11 items-center gap-2 rounded-xl px-4 text-xs font-semibold text-pine-deep shadow-xs transition-all hover:bg-pine-light active:scale-95"
            id="btn-export-excel"
            title="Download rekap per siswa (XLSX)"
            type="button"
            onClick={() => {
              props.onExportSummary();
            }}
          >
            <Download className="size-4 text-pine-deep" />
            <span>{t('btn_export_excel')}</span>
          </button>

          <button
            aria-label="Unduh laporan absensi terkelompok"
            className="bg-canvas-base inline-flex h-11 w-11 items-center justify-center rounded-xl text-pine-deep shadow-xs transition-all hover:bg-pine-light active:scale-95"
            id="btn-export-report"
            title="Unduh laporan absensi terkelompok (XLSX)"
            type="button"
            onClick={() => {
              props.onExportReport();
            }}
          >
            <Download className="size-4 text-pine-deep" />
          </button>

          <button
            className="text-on-primary inline-flex h-11 items-center gap-2 rounded-xl bg-pine-deep px-4 text-xs font-semibold shadow-sm transition-all hover:bg-pine-hover active:scale-95"
            id="btn-send-whatsapp"
            title="Send automated attendance WhatsApp broadcast"
            type="button"
            onClick={() => {
              props.onOpenBroadcastModal();
            }}
          >
            <Send className="size-4 text-amber-gold" />
            <span className="whitespace-nowrap">{t('btn_send_whatsapp')}</span>
            <span className="font-caption rounded-full bg-amber-gold px-1.5 py-0.5 text-[10px] font-bold text-pine-deep">
              {t('badge_auto')}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
