import { CheckCircle2, Lightbulb, Paperclip, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { mockJournalOptions } from '@/data/mockTeacherPresence';

/**
 * Daily teaching journal form with curriculum formatting guidance.
 *
 * @param props - Save handler invoked with the journal payload.
 * @returns Journal section.
 */
export function TeacherJournalPanel(props: {
  onSaveJournal: (payload: { className: string; topic: string; note: string }) => void;
}) {
  const t = useTranslations('TeacherPresencePage');
  const [className, setClassName] = useState(mockJournalOptions[1]?.label ?? '');
  const [topic, setTopic] = useState('');
  const [note, setNote] = useState('');

  const canSave = topic.trim().length > 0 && note.trim().length > 0;

  return (
    <section className="mt-8 rounded-2xl border border-border-subtle bg-card p-5 shadow-xs sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 border-b border-border-subtle pb-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            {t('journal_title')}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{t('journal_subtitle')}</p>
        </div>

        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-pine-light px-3 py-1.5 text-[11px] font-semibold text-pine-deep lg:self-auto">
          <CheckCircle2 className="size-3.5" />
          {t('journal_sync_badge')}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="journal-class"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                {t('journal_class_label')}
              </label>
              <select
                id="journal-class"
                value={className}
                onChange={(e) => {
                  setClassName(e.target.value);
                }}
                className="h-11 w-full cursor-pointer rounded-xl border border-border-control bg-card px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
              >
                {mockJournalOptions.map((option) => (
                  <option key={option.id} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="journal-topic"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                {t('journal_topic_label')}
              </label>
              <input
                id="journal-topic"
                type="text"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                }}
                placeholder={t('journal_topic_placeholder')}
                className="h-11 w-full rounded-xl border border-border-control bg-card px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="journal-note"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              {t('journal_note_label')}
            </label>
            <textarea
              id="journal-note"
              rows={5}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
              }}
              placeholder={t('journal_note_placeholder')}
              className="w-full resize-y rounded-xl border border-border-control bg-card px-3 py-2.5 text-xs leading-relaxed text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
            />
          </div>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border-control bg-card px-3 py-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-pine-deep"
              >
                <Paperclip className="size-3.5" />
                {t('journal_upload')}
              </button>
              <span className="text-[10px] text-muted-foreground">{t('journal_upload_hint')}</span>
            </div>

            <button
              type="button"
              disabled={!canSave}
              onClick={() => {
                props.onSaveJournal({ className, topic: topic.trim(), note: note.trim() });
                setTopic('');
                setNote('');
              }}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-pine-deep px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              <Save className="size-4 text-amber-gold" />
              {t('journal_save')}
            </button>
          </div>
        </div>

        <aside className="flex flex-col rounded-2xl border border-amber-gold/40 bg-amber-surface p-4">
          <div className="mb-2 flex items-center gap-2 text-amber-dark">
            <Lightbulb className="size-4" />
            <h3 className="text-xs font-bold">{t('journal_guide_title')}</h3>
          </div>
          <ul className="flex-1 space-y-2 text-[11px] leading-relaxed text-amber-dark/90">
            <li className="flex gap-1.5">
              <span className="text-amber-gold">•</span>
              <span>{t('journal_guide_1')}</span>
            </li>
            <li className="flex gap-1.5">
              <span className="text-amber-gold">•</span>
              <span>{t('journal_guide_2')}</span>
            </li>
            <li className="flex gap-1.5">
              <span className="text-amber-gold">•</span>
              <span>{t('journal_guide_3')}</span>
            </li>
          </ul>

          <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-border-subtle bg-card p-3">
            <CheckCircle2 className="size-5 shrink-0 text-pine-deep" />
            <div>
              <p className="text-[11px] font-bold text-pine-deep">{t('journal_week_title')}</p>
              <p className="text-[10px] text-muted-foreground">{t('journal_week_value')}</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
