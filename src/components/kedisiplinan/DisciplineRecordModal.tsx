import { Gavel, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { NewIncidentFormData } from '@/lib/api/kedisiplinan';
import { useDisciplineCategories, useStudentSearch } from '@/lib/api/queries';

/**
 * Modal form for recording a new disciplinary violation for a student.
 *
 * @param props - Component properties.
 * @returns Rendered recording modal dialog.
 */
export function DisciplineRecordModal(props: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewIncidentFormData) => void;
}) {
  const t = useTranslations('DisciplinePage');

  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentId, setStudentId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dateTime, setDateTime] = useState('2026-10-05T08:00');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [immediateAction, setImmediateAction] = useState('');

  // Real pickers: GET /students (search) + GET /discipline/categories (active).
  const students = useStudentSearch({
    search: studentSearchTerm.trim() === '' ? undefined : studentSearchTerm.trim(),
    limit: 50,
  });
  const categories = useDisciplineCategories();

  if (!props.isOpen) {
    return null;
  }

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    props.onSubmit({
      studentId,
      categoryId,
      dateTime,
      location: location.trim() || 'Lingkungan Sekolah',
      description: description.trim() || 'Pelanggaran tata tertib sekolah.',
      immediateAction: immediateAction.trim() || 'Pembinaan lisan oleh guru piket.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-150 fade-in">
      <div className="w-full max-w-xl animate-in overflow-hidden rounded-2xl border border-border bg-card shadow-2xl duration-150 zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-container-low p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-pine-deep text-amber-gold shadow-xs">
              <Gavel className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{t('modal_title')}</h3>
              <p className="text-xs text-muted-foreground">{t('modal_subtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6 text-xs">
          {/* Siswa Terlapor */}
          <div className="space-y-1.5">
            <label className="block font-bold text-foreground" htmlFor="incident-student-search">
              {t('field_student')}
            </label>
            <div className="flex h-10 w-full items-center rounded-xl border border-border bg-surface-container-low px-3 transition-colors focus-within:border-pine-deep">
              <Search className="mr-2 size-4 text-muted-foreground" />
              <input
                id="incident-student-search"
                type="text"
                value={studentSearchTerm}
                onChange={(e) => {
                  setStudentSearchTerm(e.target.value);
                }}
                placeholder={t('search_placeholder')}
                className="w-full bg-transparent p-0 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden"
              />
            </div>
            <select
              required
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
              }}
              className="w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-foreground focus:border-pine-deep focus:outline-hidden"
            >
              <option value="">— Pilih siswa —</option>
              {(students.data ?? []).map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name} - {student.current_class?.name ?? '-'} (NIS:{' '}
                  {student.student_number})
                </option>
              ))}
            </select>
          </div>

          {/* Kategori & Waktu */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block font-bold text-foreground" htmlFor="incident-category">
                {t('field_category')}
              </label>
              <select
                id="incident-category"
                required
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                }}
                className="w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-foreground focus:border-pine-deep focus:outline-hidden"
              >
                <option value="">— Pilih kategori —</option>
                {(categories.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} (+{category.default_points ?? 0} Poin)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-foreground" htmlFor="incident-datetime">
                {t('field_datetime')}
              </label>
              <input
                id="incident-datetime"
                type="datetime-local"
                value={dateTime}
                onChange={(e) => {
                  setDateTime(e.target.value);
                }}
                className="w-full rounded-xl border border-border bg-surface-container-low p-2 text-xs text-foreground focus:border-pine-deep focus:outline-hidden"
              />
            </div>
          </div>

          {/* Lokasi Kejadian */}
          <div className="space-y-1.5">
            <label className="block font-bold text-foreground" htmlFor="incident-location">
              {t('field_location')}
            </label>
            <input
              id="incident-location"
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
              }}
              placeholder={t('field_location_placeholder')}
              className="w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-pine-deep focus:outline-hidden"
            />
          </div>

          {/* Deskripsi Kronologi */}
          <div className="space-y-1.5">
            <label className="block font-bold text-foreground" htmlFor="incident-description">
              {t('field_description')}
            </label>
            <textarea
              id="incident-description"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              placeholder={t('field_description_placeholder')}
              className="w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-pine-deep focus:outline-hidden"
            />
          </div>

          {/* Tindakan Langsung */}
          <div className="space-y-1.5">
            <label className="block font-bold text-foreground" htmlFor="incident-action">
              {t('field_action')}
            </label>
            <input
              id="incident-action"
              type="text"
              value={immediateAction}
              onChange={(e) => {
                setImmediateAction(e.target.value);
              }}
              placeholder={t('field_action_placeholder')}
              className="w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-pine-deep focus:outline-hidden"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={props.onClose}
              className="rounded-xl border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              className="rounded-xl bg-pine-deep px-5 py-2 font-bold text-white shadow-xs transition-colors hover:bg-pine-hover"
            >
              {t('btn_submit_incident')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
