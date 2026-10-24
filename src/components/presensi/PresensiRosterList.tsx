'use client';

import { useTranslations } from 'next-intl';
import { PresensiStudentRow } from '@/components/presensi/PresensiStudentRow';
import type { PresensiStatus, PresensiStudent } from '@/types/presensi';

/**
 * A roster row paired with its fixed class number.
 */
export type PresensiRosterEntry = {
  student: PresensiStudent;
  ordinal: number;
};

/**
 * Scrollable roster card: header, filtered student rows, and page footer.
 *
 * @param props - Visible entries, pagination state, and row handlers.
 * @returns Roster container.
 */
export function PresensiRosterList(props: {
  entries: PresensiRosterEntry[];
  visibleCount: number;
  rosterTotal: number;
  page: number;
  pageCount: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onStatusChange: (id: string, status: Exclude<PresensiStatus, 'none'>) => void;
  onOpenNote: (student: PresensiStudent, ordinal: number) => void;
}) {
  const t = useTranslations('PresensiPage');

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-border-control bg-surface shadow-[0_4px_16px_-2px_rgba(23,63,54,0.06)]">
      <div className="hidden gap-4 bg-[linear-gradient(90deg,#173F36_0%,#1F4F44_100%)] px-6 py-3.5 font-caption text-caption font-semibold tracking-wider text-white uppercase md:grid md:grid-cols-12 md:border-b-2 md:border-amber-gold">
        <div className="md:col-span-1">{t('roster_column_number')}</div>
        <div className="md:col-span-5">{t('roster_column_identity')}</div>
        <div className="text-center md:col-span-5">{t('roster_column_status')}</div>
        <div className="text-right md:col-span-1">{t('roster_column_note')}</div>
      </div>

      <div className="divide-y divide-border-divider">
        {props.entries.map((entry) => (
          <PresensiStudentRow
            key={entry.student.id}
            onOpenNote={() => {
              props.onOpenNote(entry.student, entry.ordinal);
            }}
            onStatusChange={(status) => {
              props.onStatusChange(entry.student.id, status);
            }}
            disabled={props.disabled}
            ordinal={entry.ordinal}
            student={entry.student}
          />
        ))}

        {props.entries.length === 0 && (
          <p className="px-6 py-space-xl text-center font-caption text-caption text-text-muted">
            {t('roster_empty')}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between bg-surface-container-low p-4 font-caption text-caption text-text-muted">
        <span className="font-medium">
          {t('roster_showing', {
            shown: props.visibleCount,
            total: props.rosterTotal,
            page: props.page,
          })}
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: props.pageCount }, (_, index) => index + 1).map((pageNumber) => (
            <button
              className={
                pageNumber === props.page
                  ? 'rounded-md bg-pine-deep px-2.5 py-1 font-semibold text-white shadow-xs'
                  : 'rounded-md px-2.5 py-1 text-on-surface-variant transition-colors hover:bg-surface'
              }
              key={pageNumber}
              onClick={() => {
                props.onPageChange(pageNumber);
              }}
              type="button"
            >
              {pageNumber}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
