import { Gavel, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { DisciplineCategory, NewIncidentFormData } from '@/types/discipline';

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

  const [studentChoice, setStudentChoice] = useState('Rizky Pratama|00829103|IX A');
  const [category, setCategory] = useState<DisciplineCategory>('keterlambatan');
  const [dateTime, setDateTime] = useState('2026-10-05T08:00');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [immediateAction, setImmediateAction] = useState('');

  if (!props.isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [name, nis, className] = studentChoice.split('|');

    props.onSubmit({
      studentName: name || 'Rizky Pratama',
      studentNis: nis || '00829103',
      studentClass: className || 'IX A',
      categoryKey: category,
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
            <label className="block font-bold text-foreground">{t('field_student')}</label>
            <select
              value={studentChoice}
              onChange={(e) => {
                setStudentChoice(e.target.value);
              }}
              className="w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-foreground focus:border-pine-deep focus:outline-hidden"
            >
              <option value="Rizky Pratama|00829103|IX A">
                Rizky Pratama - IX A (NIS: 00829103)
              </option>
              <option value="Fajar Maulana|00829311|VIII A">
                Fajar Maulana - VIII A (NIS: 00829311)
              </option>
              <option value="Dimas Saputra|00829103|VIII A">
                Dimas Saputra - VIII A (NIS: 00829103)
              </option>
              <option value="Aldo Firmansyah|00829440|VIII B">
                Aldo Firmansyah - VIII B (NIS: 00829440)
              </option>
              <option value="Nabila Aulia|00829801|VII C">
                Nabila Aulia - VII C (NIS: 00829801)
              </option>
              <option value="Bagus Pamungkas|00829562|VIII A">
                Bagus Pamungkas - VIII A (NIS: 00829562)
              </option>
            </select>
          </div>

          {/* Kategori & Waktu */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block font-bold text-foreground">{t('field_category')}</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as DisciplineCategory);
                }}
                className="w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-foreground focus:border-pine-deep focus:outline-hidden"
              >
                <option value="keterlambatan">Keterlambatan (+2 Poin)</option>
                <option value="seragam">Atribut Seragam (+3 Poin)</option>
                <option value="tatatertib">Tata Tertib Kelas (+5 Poin)</option>
                <option value="barang_terlarang">Barang Terlarang (+25 Poin)</option>
                <option value="bullying">Etika & Bullying (+50 Poin)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-foreground">{t('field_datetime')}</label>
              <input
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
            <label className="block font-bold text-foreground">{t('field_location')}</label>
            <input
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
            <label className="block font-bold text-foreground">{t('field_description')}</label>
            <textarea
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
            <label className="block font-bold text-foreground">{t('field_action')}</label>
            <input
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
