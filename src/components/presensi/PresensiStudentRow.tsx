'use client';

import { useTranslations } from 'next-intl';
import { PresensiStatusSegments } from '@/components/presensi/PresensiStatusSegments';
import { PRESENSI_STATUS_STYLES } from '@/components/presensi/presensiStatusStyles';
import type { PresensiStatus, PresensiStudent } from '@/types/presensi';

type NoteTitleKey =
  | 'note_add'
  | 'note_alpa_unconfirmed'
  | 'note_document_verified'
  | 'note_doctor_letter';

type NoteAction = {
  icon: string;
  titleKey: NoteTitleKey;
  buttonClass: string;
};

const DEFAULT_NOTE_ACTION: NoteAction = {
  icon: 'edit_note',
  titleKey: 'note_add',
  buttonClass: 'text-text-muted hover:bg-surface-container hover:text-pine-deep transition-colors',
};

/**
 * Pick the trailing note/document button variant that matches the row status.
 *
 * @param student - Roster row to inspect.
 * @returns Icon, tooltip key, and surface classes.
 */
function resolveNoteAction(student: PresensiStudent): NoteAction {
  if (student.status === 'alpa') {
    return {
      icon: 'assignment_late',
      titleKey: 'note_alpa_unconfirmed',
      buttonClass: 'bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors',
    };
  }

  if (student.status === 'izin' && student.hasDocument) {
    return {
      icon: 'description',
      titleKey: 'note_document_verified',
      buttonClass: 'bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors',
    };
  }

  if (student.status === 'sakit') {
    return {
      icon: 'medical_services',
      titleKey: 'note_doctor_letter',
      buttonClass: 'bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors',
    };
  }

  return DEFAULT_NOTE_ACTION;
}

/**
 * One student row of the attendance roster, including the status segment control.
 *
 * @param props - Row data, ordinal number, and interaction handlers.
 * @returns Roster row markup.
 */
export function PresensiStudentRow(props: {
  student: PresensiStudent;
  ordinal: number;
  disabled?: boolean;
  onStatusChange: (status: Exclude<PresensiStatus, 'none'>) => void;
  onOpenNote: () => void;
}) {
  const t = useTranslations('PresensiPage');
  const { student } = props;
  const style = PRESENSI_STATUS_STYLES[student.status];
  const isUnrecorded = student.status === 'none';
  const noteAction = resolveNoteAction(student);

  return (
    <div
      className={`group flex flex-col items-center gap-4 border-l-4 p-4 transition-colors md:grid md:grid-cols-12 md:px-6 md:py-4 ${style.rowClass} ${style.rowAccentClass}`}
    >
      <div className="flex w-full items-center justify-between md:col-span-1 md:w-auto">
        <span
          className={`font-label-md text-label-md font-bold ${isUnrecorded ? 'text-amber-dark' : 'text-text-muted'}`}
        >
          {String(props.ordinal).padStart(2, '0')}
        </span>
        <span
          className={`font-caption text-caption md:hidden ${isUnrecorded ? 'text-amber-dark' : 'text-text-muted'}`}
        >
          {t('nisn_mobile', { nisn: student.nisn })}
        </span>
      </div>

      <div className="flex w-full items-center gap-3.5 md:col-span-5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border font-label-md text-label-md font-bold transition-transform group-hover:scale-105 ${style.avatarClass}`}
        >
          {student.initials}
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`truncate font-label-md text-label-md text-on-surface ${isUnrecorded ? 'font-bold' : 'font-semibold'}`}
            >
              {student.name}
            </span>
            {isUnrecorded && (
              <span className="py-0.2 rounded bg-amber-gold/30 px-1.5 text-[10px] font-bold tracking-wider text-amber-dark uppercase">
                {t('focus_input_tag')}
              </span>
            )}
          </div>
          <div
            className={`flex items-center gap-2 font-caption text-caption text-text-muted ${isUnrecorded ? 'mt-0.5' : ''}`}
          >
            <span className={`font-medium ${isUnrecorded ? 'text-amber-dark' : ''}`}>
              {t('nisn_inline', { nisn: student.nisn })}
            </span>
            <span>•</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-semibold ${style.badgeClass}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${style.badgeDotClass}`} />
              {t(style.labelKey)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center md:col-span-5">
        <PresensiStatusSegments
          disabled={props.disabled}
          onStatusChange={props.onStatusChange}
          status={student.status}
        />
      </div>

      <div className="flex w-full items-center justify-end md:col-span-1">
        <button
          className={`rounded-lg p-2 ${noteAction.buttonClass}`}
          disabled={props.disabled}
          onClick={props.onOpenNote}
          title={t(noteAction.titleKey)}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">{noteAction.icon}</span>
        </button>
      </div>
    </div>
  );
}
