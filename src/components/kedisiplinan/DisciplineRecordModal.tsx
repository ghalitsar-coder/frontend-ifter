'use client';

import { Gavel, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { SchoolStudentRecord, ViolationTypeRecord } from '@/services/disciplineApi';
import type { ClassRecord } from '@/services/presensiApi';
import type { DisciplineIncident, NewIncidentFormData } from '@/types/discipline';

/**
 * Modal form for creating or editing a student disciplinary violation.
 *
 * @param props - Component properties.
 * @returns Rendered recording/editing modal dialog.
 */
export function DisciplineRecordModal(props: {
  classes: ClassRecord[];
  editingIncident: DisciplineIncident | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewIncidentFormData) => void;
  students: SchoolStudentRecord[];
  violationTypes: ViolationTypeRecord[];
}) {
  const t = useTranslations('DisciplinePage');

  const activeTypes = props.violationTypes.filter((vt) => vt.is_active);
  const typePool = activeTypes.length > 0 ? activeTypes : props.violationTypes;

  const [selectedClassName, setSelectedClassName] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [selectedTypeId, setSelectedTypeId] = useState<number>(0);
  const [points, setPoints] = useState<number>(3);
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [immediateAction, setImmediateAction] = useState<string>('');

  useEffect(() => {
    if (!props.isOpen) {
      return;
    }

    if (props.editingIncident) {
      const matchedType =
        props.violationTypes.find((vt) => vt.id === props.editingIncident?.violationTypeId) ??
        props.violationTypes.find((vt) => vt.kode === props.editingIncident?.violationCode) ??
        typePool[0];
      setSelectedClassName(props.editingIncident.studentClass);
      setSelectedStudentId(props.editingIncident.studentId ?? 0);
      setSelectedTypeId(matchedType?.id ?? 0);
      setPoints(props.editingIncident.points);
      setDate(props.editingIncident.date || new Date().toISOString().slice(0, 10));
      setLocation(props.editingIncident.location || 'Lingkungan Sekolah');
      setDescription(props.editingIncident.description || '');
      setImmediateAction(props.editingIncident.immediateAction || '');
      return;
    }

    const firstClass = props.classes[0]?.nama_kelas ?? props.students[0]?.nama_kelas ?? '1A';
    const matchingStudents = props.students.filter((s) => s.nama_kelas === firstClass);
    const firstStudent = matchingStudents[0] ?? props.students[0];
    const firstType = typePool[0];

    setSelectedClassName(firstStudent?.nama_kelas ?? firstClass);
    setSelectedStudentId(firstStudent?.id ?? 1);
    setSelectedTypeId(firstType?.id ?? 1);
    setPoints(firstType?.poin_default ?? 3);
    setDate(new Date().toISOString().slice(0, 10));
    setLocation('Lingkungan SD Islam Bakti Asih');
    setDescription('');
    setImmediateAction('');
  }, [props.isOpen, props.editingIncident, props.classes, props.students, props.violationTypes]);

  if (!props.isOpen) {
    return null;
  }

  const classNames =
    props.classes.length > 0
      ? props.classes.map((c) => c.nama_kelas)
      : Array.from(new Set(props.students.map((s) => s.nama_kelas)));

  const filteredStudents = selectedClassName
    ? props.students.filter((s) => s.nama_kelas === selectedClassName)
    : props.students;

  const chosenStudent =
    props.students.find((s) => s.id === selectedStudentId) ?? filteredStudents[0];
  const chosenType = props.violationTypes.find((vt) => vt.id === selectedTypeId) ?? typePool[0];

  const handleClassChange = (nextClass: string) => {
    setSelectedClassName(nextClass);
    const nextStudents = props.students.filter((s) => s.nama_kelas === nextClass);
    if (nextStudents[0]) {
      setSelectedStudentId(nextStudents[0].id);
    }
  };

  const handleTypeChange = (nextId: number) => {
    setSelectedTypeId(nextId);
    const found = props.violationTypes.find((vt) => vt.id === nextId);
    if (found) {
      setPoints(found.poin_default);
    }
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isEdit = Boolean(props.editingIncident);

    props.onSubmit({
      studentId: isEdit
        ? (props.editingIncident?.studentId ?? chosenStudent?.id ?? 1)
        : (chosenStudent?.id ?? 1),
      studentName: isEdit
        ? (props.editingIncident?.studentName ?? 'Siswa')
        : (chosenStudent?.nama ?? 'Aisyah Putri'),
      studentNis: isEdit
        ? (props.editingIncident?.studentNis ?? '-')
        : (chosenStudent?.nis ?? '0001'),
      studentClass: isEdit
        ? (props.editingIncident?.studentClass ?? selectedClassName)
        : (chosenStudent?.nama_kelas ?? selectedClassName),
      violationTypeId: chosenType?.id ?? 1,
      violationCode: chosenType?.kode ?? 'ATR-01',
      violationName: chosenType?.nama ?? 'Seragam tidak lengkap',
      backendCategory: chosenType?.kategori ?? 'atribut',
      points: Math.max(0, Number(points) || 0),
      date,
      time: `${new Date().toTimeString().slice(0, 5)} WIB`,
      location: location.trim() || 'Lingkungan SD Islam Bakti Asih',
      description: description.trim() || chosenType?.nama || 'Pelanggaran tata tertib sekolah.',
      immediateAction: immediateAction.trim() || 'Pembinaan lisan oleh petugas kesiswaan.',
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
              <h3 className="text-base font-bold text-foreground">
                {props.editingIncident ? t('modal_title_edit') : t('modal_title')}
              </h3>
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
          {props.editingIncident ? (
            <div className="rounded-xl border border-border bg-surface-container-low p-3">
              <p className="font-bold text-foreground">{props.editingIncident.studentName}</p>
              <p className="text-[11px] text-muted-foreground">
                Kelas {props.editingIncident.studentClass} • NIS:{' '}
                {props.editingIncident.studentNis}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block font-bold text-foreground">{t('field_class')}</label>
                <select
                  value={selectedClassName}
                  onChange={(e) => {
                    handleClassChange(e.target.value);
                  }}
                  className="w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-foreground focus:border-pine-deep focus:outline-hidden"
                >
                  {classNames.map((name) => (
                    <option key={name} value={name}>
                      Kelas {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-foreground">{t('field_student')}</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(Number(e.target.value));
                  }}
                  className="w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-foreground focus:border-pine-deep focus:outline-hidden"
                >
                  {filteredStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} (NIS: {s.nis ?? '-'})
                    </option>
                  ))}
                  {filteredStudents.length === 0 && (
                    <option value={0}>Tidak ada siswa aktif di kelas ini</option>
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Kode Pelanggaran & Bobot Poin */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block font-bold text-foreground">{t('field_category')}</label>
              <select
                value={selectedTypeId}
                onChange={(e) => {
                  handleTypeChange(Number(e.target.value));
                }}
                className="w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-foreground focus:border-pine-deep focus:outline-hidden"
              >
                {typePool.map((vt) => (
                  <option key={vt.id} value={vt.id}>
                    [{vt.kode}] {vt.nama} (+{vt.poin_default} Poin)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-foreground">{t('field_points')}</label>
              <input
                type="number"
                min={0}
                value={points}
                onChange={(e) => {
                  setPoints(Number(e.target.value));
                }}
                className="w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs font-bold text-foreground focus:border-pine-deep focus:outline-hidden"
              />
            </div>
          </div>

          {/* Tanggal & Lokasi */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block font-bold text-foreground">{t('field_datetime')}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                }}
                className="w-full rounded-xl border border-border bg-surface-container-low p-2 text-xs text-foreground focus:border-pine-deep focus:outline-hidden"
              />
            </div>

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

          {/* Tindak Lanjut */}
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
              {props.editingIncident ? t('btn_save_edit') : t('btn_submit_incident')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
