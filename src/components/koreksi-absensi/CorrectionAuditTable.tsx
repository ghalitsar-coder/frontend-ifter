import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Eye,
  Hourglass,
  MoreVertical,
  Paperclip,
  Plus,
  Star,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  auditAvatarTones,
  attendanceStatusStyles,
} from '@/components/koreksi-absensi/statusStyles';
import type { paginateCorrectionLogs } from '@/data/mockAttendanceCorrection';
import type { AttendanceStatus, CorrectionLog } from '@/types/attendanceCorrection';

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
 * Audit log table with verification state, evidence, and ledger actions.
 *
 * @param props - Page of audit entries, pagination info, and handlers.
 * @returns Audit table panel.
 */
export function CorrectionAuditTable(props: {
  logs: CorrectionLog[];
  pagination: ReturnType<typeof paginateCorrectionLogs>;
  onPageChange: (page: number) => void;
  onOpenEvidence: (log: CorrectionLog) => void;
  onOpenHash: (log: CorrectionLog) => void;
}) {
  const t = useTranslations('AttendanceCorrectionPage');
  const pages = Array.from({ length: props.pagination.totalPages }, (_, index) => index + 1);

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
            {props.pagination.items.map((log) => {
              const initials = log.student.name
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('');

              return (
                <tr key={log.id} className="align-top transition-colors hover:bg-hover-row">
                  <td className="min-w-[8.5rem] px-5 py-4">
                    <p className="text-xs font-bold whitespace-nowrap text-pine-deep">{log.id}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] whitespace-nowrap text-muted-foreground">
                      <Clock3 className="size-2.5" />
                      {log.loggedDate}, {log.loggedTime}
                    </p>
                  </td>

                  {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- table cell groups the student avatar and name */}
                  <td className="min-w-[11rem] px-3 py-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          auditAvatarTones[props.logs.indexOf(log) % auditAvatarTones.length]
                        }`}
                      >
                        {initials}
                      </span>
                      <div>
                        <p className="text-xs font-bold whitespace-nowrap text-foreground">
                          {log.student.name}
                        </p>
                        <p className="text-[10px] whitespace-nowrap text-muted-foreground">
                          NIS: {log.student.nis} • {log.student.className}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="min-w-[7.5rem] px-3 py-4">
                    <p className="text-xs font-semibold whitespace-nowrap text-foreground">
                      {log.sessionDate}
                    </p>
                    <p className="text-[10px] whitespace-nowrap text-muted-foreground">
                      {log.sessionLabel}
                    </p>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-start gap-1.5">
                      <StatusPill status={log.fromStatus} />
                      <ArrowRight className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                      <div>
                        <StatusPill status={log.toStatus} />
                        <p className="mt-0.5 text-[9px] font-medium text-muted-foreground">
                          {log.toNote}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="max-w-[17rem] px-3 py-4">
                    <p className="text-[11px] leading-relaxed text-foreground/80">{log.reason}</p>
                    {log.attachment && (
                      <button
                        type="button"
                        onClick={() => {
                          props.onOpenEvidence(log);
                        }}
                        className="mt-1.5 inline-flex cursor-pointer items-center gap-1 rounded-md bg-surface-container-low px-1.5 py-1 text-[10px] font-semibold text-pine-deep transition-colors hover:bg-pine-light"
                      >
                        <Paperclip className="size-3" />
                        {log.attachment.fileName}
                        <span className="font-normal text-muted-foreground">
                          • {log.attachment.fileSize}
                        </span>
                      </button>
                    )}
                    {log.confirmationNote && (
                      <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-pine-light px-1.5 py-1 text-[10px] font-semibold text-pine-deep">
                        <BadgeCheck className="size-3" />
                        {log.confirmationNote}
                      </p>
                    )}
                  </td>

                  <td className="min-w-[8.5rem] px-3 py-4">
                    <p className="text-xs font-semibold text-foreground">{log.officer.name}</p>
                    <p className="text-[10px] text-muted-foreground">{log.officer.role}</p>
                  </td>

                  <td className="px-3 py-4">
                    {log.verification === 'validated' ? (
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
                          props.onOpenEvidence(log);
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-control bg-card px-2 py-1 text-[10px] font-bold text-pine-deep transition-colors hover:bg-pine-light"
                      >
                        <Eye className="size-3" />
                        {t('btn_evidence')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          props.onOpenHash(log);
                        }}
                        aria-label={t('btn_ledger', { id: log.id })}
                        className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-container-low hover:text-pine-deep"
                      >
                        <MoreVertical className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {props.pagination.items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-xs text-muted-foreground">
                  {t('table_empty')}
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
