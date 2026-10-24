import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Eye,
  Hourglass,
  MoreVertical,
  PencilLine,
  Plus,
  Star,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  auditAvatarTones,
  attendanceStatusStyles,
} from '@/components/koreksi-absensi/statusStyles';
import type { CorrectionRow, PaginationMeta } from '@/lib/api/koreksi-absensi';
import type { AttendanceStatus } from '@/types/attendanceCorrection';

const statusIcons = {
  alpa: X,
  izin: Circle,
  sakit: Plus,
  hadir: Check,
  dispensasi: Star,
} as const;

/**
 * Status badge with the attendance code icon.
 *
 * @param props - Attendance code.
 * @returns Status pill.
 */
function StatusPill(props: { status: AttendanceStatus }) {
  const t = useTranslations('AttendanceCorrectionPage');
  const Icon = statusIcons[props.status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${attendanceStatusStyles[props.status]}`}
    >
      <Icon className="size-2.5" strokeWidth={3} />
      {t(`status_${props.status}`)}
    </span>
  );
}

/**
 * Audit log table over GET /attendance/history: one row per recorded session
 * with its current status, verification (day-lock) state, and ledger actions.
 *
 * @param props - Page of audit rows, pagination meta, and handlers.
 * @returns Audit table panel.
 */
export function CorrectionAuditTable(props: {
  rows: CorrectionRow[];
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onOpenEvidence: (row: CorrectionRow) => void;
  onOpenLedger: (row: CorrectionRow) => void;
  onCorrect: (row: CorrectionRow) => void;
}) {
  const t = useTranslations('AttendanceCorrectionPage');
  const pages = Array.from({ length: props.pagination.totalPages }, (_, index) => index + 1);

  let bodyMessage = t('table_empty');
  if (props.loading) {
    bodyMessage = 'Memuat riwayat absensi…';
  } else if (props.error !== null) {
    bodyMessage = props.error;
  }

  return (
    <section className="rounded-2xl border border-border-subtle bg-card shadow-xs">
      <div className="flex flex-col justify-between gap-3 border-b border-border-subtle px-5 py-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-amber-gold" />
          <h2 className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
            {t('table_title')}
          </h2>
          <span className="rounded-full bg-surface-container-low px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
            {t('table_total', { count: props.pagination.total })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-pine-deep" />
            {t('legend_validated')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-amber-gold" />
            {t('legend_pending')}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border-subtle text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              <th className="px-5 py-3">{t('col_log')}</th>
              <th className="px-3 py-3">{t('col_student')}</th>
              <th className="px-3 py-3">{t('col_session')}</th>
              <th className="px-3 py-3">{t('col_change')}</th>
              <th className="px-3 py-3">{t('col_reason')}</th>
              <th className="px-3 py-3">{t('col_officer')}</th>
              <th className="px-3 py-3">{t('col_verification')}</th>
              <th className="px-3 py-3 text-right">{t('col_action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {props.rows.map((row, index) => {
              const initials = row.student.name
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('');

              return (
                <tr key={row.recordId} className="align-top transition-colors hover:bg-hover-row">
                  <td className="min-w-[8.5rem] px-5 py-4">
                    <p className="text-xs font-bold whitespace-nowrap text-pine-deep">{row.id}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] whitespace-nowrap text-muted-foreground">
                      <Clock3 className="size-2.5" />
                      {row.loggedDate}, {row.loggedTime}
                    </p>
                  </td>

                  {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- table cell groups the student avatar and name */}
                  <td className="min-w-[11rem] px-3 py-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          auditAvatarTones[index % auditAvatarTones.length]
                        }`}
                      >
                        {initials}
                      </span>
                      <div>
                        <p className="text-xs font-bold whitespace-nowrap text-foreground">
                          {row.student.name}
                        </p>
                        <p className="text-[10px] whitespace-nowrap text-muted-foreground">
                          NIS: {row.student.nis} • {row.student.className}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="min-w-[7.5rem] px-3 py-4">
                    <p className="text-xs font-semibold whitespace-nowrap text-foreground">
                      {row.sessionDate}
                    </p>
                    <p className="text-[10px] whitespace-nowrap text-muted-foreground">
                      {row.sessionLabel}
                    </p>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-start gap-1.5">
                      <StatusPill status={row.status} />
                      <p className="mt-0.5 text-[9px] font-medium text-muted-foreground">
                        {row.isLate ? 'Hadir Terlambat' : 'Status tercatat'}
                      </p>
                    </div>
                  </td>

                  <td className="max-w-[17rem] px-3 py-4">
                    <p className="text-[11px] leading-relaxed text-foreground/80">{row.reason}</p>
                  </td>

                  <td className="min-w-[8.5rem] px-3 py-4">
                    <p className="text-xs font-semibold text-foreground">{row.sourceLabel}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {row.closed ? 'Hari telah ditutup' : 'Hari masih terbuka'}
                    </p>
                  </td>

                  <td className="px-3 py-4">
                    {row.closed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-pine-light px-2 py-1 text-[10px] font-bold whitespace-nowrap text-pine-deep">
                        <CheckCircle2 className="size-3" />
                        {t('verification_validated')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-surface px-2 py-1 text-[10px] font-bold whitespace-nowrap text-amber-dark">
                        <Hourglass className="size-3" />
                        {t('verification_pending')}
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          props.onCorrect(row);
                        }}
                        title="Koreksi kehadiran"
                        aria-label={`Koreksi kehadiran ${row.student.name}`}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-control bg-card px-2 py-1 text-[10px] font-bold text-pine-deep transition-colors hover:bg-pine-light"
                      >
                        <PencilLine className="size-3" />
                        Koreksi
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          props.onOpenEvidence(row);
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-control bg-card px-2 py-1 text-[10px] font-bold text-pine-deep transition-colors hover:bg-pine-light"
                      >
                        <Eye className="size-3" />
                        {t('btn_evidence')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          props.onOpenLedger(row);
                        }}
                        aria-label={t('btn_ledger', { id: row.id })}
                        className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-container-low hover:text-pine-deep"
                      >
                        <MoreVertical className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {(props.loading || props.error !== null || props.rows.length === 0) && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-xs text-muted-foreground">
                  {bodyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-border-subtle px-5 py-3 sm:flex-row">
        <p className="text-[11px] text-muted-foreground">
          {t('pagination_showing', {
            start: props.pagination.start,
            end: props.pagination.end,
            total: props.pagination.total,
          })}
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={props.pagination.page <= 1}
            onClick={() => {
              props.onPageChange(props.pagination.page - 1);
            }}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-3.5" />
            {t('pagination_prev')}
          </button>

          {pages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => {
                props.onPageChange(page);
              }}
              aria-current={page === props.pagination.page ? 'page' : undefined}
              className={`size-7 cursor-pointer rounded-lg text-[11px] font-bold transition-colors ${
                page === props.pagination.page
                  ? 'bg-pine-deep text-white'
                  : 'text-muted-foreground hover:bg-surface-container-low'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={props.pagination.page >= props.pagination.totalPages}
            onClick={() => {
              props.onPageChange(props.pagination.page + 1);
            }}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('pagination_next')}
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
