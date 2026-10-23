import { Paperclip, PenSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Teaching journal and notes panel for recording classroom atmosphere and topics.
 *
 * @param props - Notes string and update callback.
 * @returns Teaching journal panel.
 */
export function AttendanceTeacherJournal(props: {
  notes: string;
  onNotesChange: (notes: string) => void;
  onAttachPhoto: () => void;
}) {
  const t = useTranslations('AttendancePage');

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenSquare className="size-4 text-foreground" />
            <h2 className="text-base font-semibold text-foreground">{t('journal_title')}</h2>
          </div>
          <span className="rounded-full border border-border/50 bg-surface-container-low px-2.5 py-1 text-xs text-muted-foreground">
            {t('journal_badge')}
          </span>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">{t('journal_description')}</p>
        <textarea
          rows={4}
          value={props.notes}
          onChange={(e) => {
            props.onNotesChange(e.target.value);
          }}
          placeholder={t('journal_placeholder')}
          className="w-full resize-none rounded-xl border border-border/60 bg-surface-container-low p-3 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:bg-background focus:ring-1 focus:ring-ring focus:outline-none"
        />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
        <span className="text-xs text-muted-foreground">
          {t('journal_char_count', { count: props.notes.length })}
        </span>
        <button
          type="button"
          onClick={props.onAttachPhoto}
          className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-surface-container-low px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-container-high"
        >
          <Paperclip className="size-3.5 text-muted-foreground" />
          <span>{t('attach_photo')}</span>
        </button>
      </div>
    </div>
  );
}
