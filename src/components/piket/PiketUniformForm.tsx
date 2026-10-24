import { Award, Flag, Send, UserSearch } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
// shortcut: no backend endpoint for the uniform-infraction catalog (see PiketManager), keep mock
import { calculateInfractionPoints, UNIFORM_INFRACTIONS_CATALOG } from '@/data/mockPiket';

/**
 * Rapid Gate Intake Form for Student Uniform & Attire Infractions.
 * @param props - Component properties.
 * @returns Rendered rapid uniform form component.
 */
export function PiketUniformForm(props: {
  onSubmit: (data: {
    studentName: string;
    infractionIds: string[];
    totalPoints: number;
    notes: string;
  }) => void;
}) {
  const t = useTranslations('PiketPage');

  const [studentInput, setStudentInput] = useState('Rafi Ahmad Sanjaya (VII B - 242507088)');
  const [selectedIds, setSelectedIds] = useState<string[]>(['inf-dasi', 'inf-sabuk']);
  const [notes, setNotes] = useState(
    'Siswa menyatakan dasi tertinggal di rumah; sanggup membawa besok pagi & menyelesaikan pembersihan koridor.',
  );

  const totalPoints = calculateInfractionPoints(selectedIds, UNIFORM_INFRACTIONS_CATALOG);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.onSubmit({
      studentName: studentInput,
      infractionIds: selectedIds,
      totalPoints,
      notes,
    });
  };

  return (
    <div className="bg-surface-card rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4">
        <div className="space-y-0.5">
          <h2 className="text-text-primary text-lg font-bold">{t('form_title')}</h2>
          <p className="font-caption text-text-muted text-xs">{t('form_subtitle')}</p>
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-surface text-amber-dark">
          <Flag className="size-4.5" />
        </span>
      </div>

      <form className="space-y-4 pt-1" onSubmit={handleSubmit}>
        {/* Student Selector */}
        <div className="space-y-1.5">
          <label className="text-text-primary block text-xs font-semibold" htmlFor="siswa-search">
            {t('form_student_label')}
          </label>
          <div className="relative">
            <UserSearch className="text-text-muted absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2" />
            <input
              className="bg-canvas-base text-text-primary focus:bg-surface-card h-11 w-full rounded-xl pr-4 pl-10 text-xs font-medium shadow-inner focus:outline-none"
              id="siswa-search"
              placeholder={t('form_student_placeholder')}
              type="text"
              value={studentInput}
              onChange={(e) => {
                setStudentInput(e.target.value);
              }}
            />
          </div>
        </div>

        {/* Infraction Items Checklist */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-text-primary text-xs font-semibold">
              {t('form_infraction_title')}
            </span>
            <span className="font-caption text-text-muted text-xs">
              {t('form_infraction_desc')}
            </span>
          </div>

          <div className="space-y-2">
            {UNIFORM_INFRACTIONS_CATALOG.map((item) => {
              const isChecked = selectedIds.includes(item.id);

              return (
                <label
                  key={item.id}
                  className="bg-canvas-base flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors hover:bg-pine-light/40"
                >
                  <div className="flex items-center gap-3">
                    <input
                      checked={isChecked}
                      className="size-4.5 rounded text-pine-deep accent-pine-deep"
                      type="checkbox"
                      onChange={() => {
                        handleToggle(item.id);
                      }}
                    />
                    <span className="text-text-primary text-xs">{item.label}</span>
                  </div>
                  <span
                    className={`font-caption rounded-md px-2 py-0.5 text-xs font-bold ${
                      isChecked
                        ? 'bg-amber-surface text-amber-dark'
                        : 'text-text-muted bg-surface-container-low'
                    }`}
                  >
                    +{item.points} Poin
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Total Calculation Banner */}
        <div className="flex items-center justify-between rounded-xl bg-amber-surface p-3.5 text-amber-dark">
          <div className="flex items-center gap-2">
            <Award className="size-5" />
            <span className="text-xs font-bold">{t('form_total_label')}</span>
          </div>
          <span className="text-base font-bold text-amber-dark">+{totalPoints} Poin</span>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-text-primary block text-xs font-semibold" htmlFor="catatan-piket">
            {t('form_notes_label')}
          </label>
          <textarea
            className="bg-canvas-base text-text-primary focus:bg-surface-card w-full resize-none rounded-xl p-3 text-xs shadow-inner focus:outline-none"
            id="catatan-piket"
            placeholder={t('form_notes_placeholder')}
            rows={2}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          className="text-on-primary flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-pine-deep text-xs font-bold shadow-md transition-all hover:bg-pine-hover"
          id="btn-submit-infraction"
          type="submit"
        >
          <Send className="size-4" />
          <span>{t('btn_submit_infraction')}</span>
        </button>
      </form>
    </div>
  );
}
