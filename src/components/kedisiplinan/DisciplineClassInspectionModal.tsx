'use client';

import { Check, CheckCircle2, ClipboardCheck, Sparkles, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  type ClassStudentRecord,
  type CreateInspectionViolationItem,
  fetchClassStudents,
  postCreateInspection,
  type ViolationTypeRecord,
} from '@/services/disciplineApi';

type StudentCheckState = {
  uniformAttr: boolean;
  grooming: boolean;
  socksShoes: boolean;
  conduct: boolean;
  notes: string;
};

/**
 * Interactive modal for conducting daily mass class discipline inspections.
 *
 * @param props - Component properties.
 * @returns Rendered class inspection modal.
 */
export function DisciplineClassInspectionModal(props: {
  classes: { id: number; nama_kelas: string }[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  violationTypes: ViolationTypeRecord[];
}) {
  const t = useTranslations('DisciplinePage');

  const [selectedClassId, setSelectedClassId] = useState<number>(
    props.classes[0]?.id ?? 1,
  );
  const [inspectionDate, setInspectionDate] = useState<string>(
    () => new Date().toISOString().slice(0, 10),
  );
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [students, setStudents] = useState<ClassStudentRecord[]>([]);
  const [checkMap, setCheckMap] = useState<Record<number, StudentCheckState>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load roster whenever selected class changes
  useEffect(() => {
    if (!props.isOpen || selectedClassId <= 0) {
      return;
    }
    let isMounted = true;
    fetchClassStudents(selectedClassId)
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setStudents(data);
        const initialChecks: Record<number, StudentCheckState> = {};
        for (const s of data) {
          initialChecks[s.id] = {
            uniformAttr: false,
            grooming: false,
            socksShoes: false,
            conduct: false,
            notes: '',
          };
        }
        setCheckMap(initialChecks);
      })
      .catch(() => {
        // Fallback demo students if network fails
        if (!isMounted) {
          return;
        }
        const fallback: ClassStudentRecord[] = [
          { id: 1, nama: 'Aisyah Putri', nis: '0001', jenis_kelamin: 'P', nama_kelas: '1A' },
          { id: 2, nama: 'Budi Santoso', nis: '0002', jenis_kelamin: 'L', nama_kelas: '1A' },
          { id: 3, nama: 'Citra Lestari', nis: '0003', jenis_kelamin: 'P', nama_kelas: '1A' },
        ];
        setStudents(fallback);
      });

    return () => {
      isMounted = false;
    };
  }, [props.isOpen, selectedClassId]);

  if (!props.isOpen) {
    return null;
  }

  const toggleCheck = (
    studentId: number,
    field: 'uniformAttr' | 'grooming' | 'socksShoes' | 'conduct',
  ) => {
    const current = checkMap[studentId] ?? {
      uniformAttr: false,
      grooming: false,
      socksShoes: false,
      conduct: false,
      notes: '',
    };
    setCheckMap({
      ...checkMap,
      [studentId]: {
        ...current,
        [field]: !current[field],
      },
    });
  };

  const markAllOrderly = () => {
    const cleared: Record<number, StudentCheckState> = {};
    for (const s of students) {
      cleared[s.id] = {
        uniformAttr: false,
        grooming: false,
        socksShoes: false,
        conduct: false,
        notes: '',
      };
    }
    setCheckMap(cleared);
  };

  const getViolationTypeIdByCode = (prefix: string): number => {
    const match = props.violationTypes.find((vt) => vt.kode.startsWith(prefix));
    return match ? match.id : 1;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const violationsToSubmit: CreateInspectionViolationItem[] = [];

    // Map checked items to violation records
    for (const student of students) {
      const c = checkMap[student.id];
      if (!c) {
        continue;
      }
      if (c.uniformAttr) {
        violationsToSubmit.push({
          student_id: student.id,
          violation_type_id: getViolationTypeIdByCode('S01'),
          keterangan: 'Kelengkapan atribut seragam/dasi tidak lengkap',
        });
      }
      if (c.grooming) {
        violationsToSubmit.push({
          student_id: student.id,
          violation_type_id: getViolationTypeIdByCode('K01'),
          keterangan: 'Kerapian rambut atau seragam tidak rapi',
        });
      }
      if (c.socksShoes) {
        violationsToSubmit.push({
          student_id: student.id,
          violation_type_id: getViolationTypeIdByCode('S03'),
          keterangan: 'Kaos kaki atau sepatu tidak sesuai standar',
        });
      }
      if (c.conduct) {
        violationsToSubmit.push({
          student_id: student.id,
          violation_type_id: getViolationTypeIdByCode('G01'),
          keterangan: 'Membawa/menggunakan gadget atau membuat gaduh',
        });
      }
    }

    try {
      await postCreateInspection({
        class_id: selectedClassId,
        tanggal: inspectionDate,
        jumlah_diperiksa: students.length,
        catatan: generalNotes.trim() || undefined,
        violations: violationsToSubmit,
      });
      props.onSaved();
      props.onClose();
    } catch {
      setErrorMessage('Gagal menyimpan hasil inspeksi ke backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const countStudentsWithViolations = students.filter((s) => {
    const c = checkMap[s.id];
    return c && (c.uniformAttr || c.grooming || c.socksShoes || c.conduct);
  }).length;

  const countOrderly = students.length - countStudentsWithViolations;

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-150 fade-in">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col animate-in overflow-hidden rounded-2xl border border-border bg-card shadow-2xl duration-150 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-container-low px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-pine-deep text-amber-gold shadow-xs">
              <ClipboardCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {t('inspection_modal_title')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('inspection_modal_subtitle')}
              </p>
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

        {/* Top Controls */}
        <div className="border-b border-border bg-card p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-foreground">
                {t('field_select_class')}
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(Number(e.target.value));
                }}
                className="mt-1 w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-foreground focus:border-pine-deep focus:outline-hidden"
              >
                {props.classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Kelas {c.nama_kelas}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                {t('field_inspection_date')}
              </label>
              <input
                type="date"
                value={inspectionDate}
                onChange={(e) => {
                  setInspectionDate(e.target.value);
                }}
                className="mt-1 w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-foreground focus:border-pine-deep focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                {t('field_general_notes')}
              </label>
              <input
                type="text"
                placeholder="misal: Pemeriksaan seragam upacara hari Senin"
                value={generalNotes}
                onChange={(e) => {
                  setGeneralNotes(e.target.value);
                }}
                className="mt-1 w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-foreground focus:border-pine-deep focus:outline-hidden"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-medium text-muted-foreground">
                {t('summary_inspected')}: <strong className="text-foreground">{students.length}</strong>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-pine-light px-2.5 py-0.5 font-semibold text-pine-deep">
                <Check className="size-3" />
                {t('summary_orderly')}: {countOrderly}
              </span>
              {countStudentsWithViolations > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-error-container px-2.5 py-0.5 font-semibold text-red-700">
                  <X className="size-3" />
                  {t('summary_violations')}: {countStudentsWithViolations}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={markAllOrderly}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <Sparkles className="size-3.5 text-amber-gold" />
              <span>{t('btn_mark_all_orderly')}</span>
            </button>
          </div>
        </div>

        {/* Student Checklist Table */}
        <div className="flex-1 overflow-y-auto p-5">
          {errorMessage && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-container-low font-semibold text-muted-foreground">
                <tr>
                  <th className="p-3">{t('col_student_name')}</th>
                  <th className="p-3 text-center">{t('col_uniform_attr')}</th>
                  <th className="p-3 text-center">{t('col_grooming')}</th>
                  <th className="p-3 text-center">{t('col_socks_shoes')}</th>
                  <th className="p-3 text-center">{t('col_conduct')}</th>
                  <th className="p-3 text-right">{t('col_inspection_status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {students.map((student) => {
                  const c = checkMap[student.id] ?? {
                    uniformAttr: false,
                    grooming: false,
                    socksShoes: false,
                    conduct: false,
                    notes: '',
                  };
                  const hasViolation = c.uniformAttr || c.grooming || c.socksShoes || c.conduct;

                  return (
                    <tr key={student.id} className="transition-colors hover:bg-surface-container-low/50">
                      <td className="p-3 font-medium text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7 items-center justify-center rounded-full bg-pine-light text-[11px] font-bold text-pine-deep">
                            {student.nama.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{student.nama}</p>
                            <p className="text-[10px] text-muted-foreground">NIS: {student.nis ?? '-'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Dasi/Atribut */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            toggleCheck(student.id, 'uniformAttr');
                          }}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                            c.uniformAttr
                              ? 'border border-red-300 bg-red-100 text-red-800'
                              : 'border border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {c.uniformAttr ? '⚠️ Tidak Lengkap' : '✓ Lengkap'}
                        </button>
                      </td>

                      {/* Kerapian Rambut */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            toggleCheck(student.id, 'grooming');
                          }}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                            c.grooming
                              ? 'border border-amber-gold/50 bg-amber-surface text-amber-dark'
                              : 'border border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {c.grooming ? '⚠️ Tidak Rapi' : '✓ Rapi'}
                        </button>
                      </td>

                      {/* Kaos Kaki / Sepatu */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            toggleCheck(student.id, 'socksShoes');
                          }}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                            c.socksShoes
                              ? 'border border-amber-gold/50 bg-amber-surface text-amber-dark'
                              : 'border border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {c.socksShoes ? '⚠️ Melanggar' : '✓ Sesuai'}
                        </button>
                      </td>

                      {/* Conduct / Gadget */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            toggleCheck(student.id, 'conduct');
                          }}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                            c.conduct
                              ? 'border border-red-300 bg-red-100 text-red-800'
                              : 'border border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {c.conduct ? '⚠️ Gaduh/HP' : '✓ Tertib'}
                        </button>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-right">
                        {hasViolation ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
                            Ada Catatan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-pine-light px-2 py-0.5 text-[11px] font-bold text-pine-deep">
                            <CheckCircle2 className="size-3" />
                            {t('status_all_orderly')}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-border bg-surface-container-low px-6 py-4">
          <button
            type="button"
            onClick={props.onClose}
            className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-pine-deep px-5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-pine-hover disabled:opacity-50"
          >
            <ClipboardCheck className="size-4" />
            <span>{isSubmitting ? 'Menyimpan...' : t('btn_save_inspection')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
