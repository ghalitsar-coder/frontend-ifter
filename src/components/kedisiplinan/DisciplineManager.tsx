'use client';

import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { DisciplineClassInspectionModal } from '@/components/kedisiplinan/DisciplineClassInspectionModal';
import { DisciplineFilterBar } from '@/components/kedisiplinan/DisciplineFilterBar';
import { DisciplineHeader } from '@/components/kedisiplinan/DisciplineHeader';
import { DisciplineIncidentTable } from '@/components/kedisiplinan/DisciplineIncidentTable';
import { DisciplineMetrics } from '@/components/kedisiplinan/DisciplineMetrics';
import { DisciplineRecordModal } from '@/components/kedisiplinan/DisciplineRecordModal';
import { DisciplineRuleCatalog } from '@/components/kedisiplinan/DisciplineRuleCatalog';
import { DisciplineSidebar } from '@/components/kedisiplinan/DisciplineSidebar';
import { DisciplineViolationTypesModal } from '@/components/kedisiplinan/DisciplineViolationTypesModal';
import { filterDisciplineIncidents, mockDisciplineIncidents } from '@/data/mockDiscipline';
import {
  deleteViolationRecord,
  DisciplineApiError,
  fetchSchoolStudents,
  fetchStudentViolations,
  fetchViolationTypes,
  fetchWatchlist,
  postRecordViolation,
  updateViolationRecord,
} from '@/services/disciplineApi';
import type {
  SchoolStudentRecord,
  StudentViolationRecord,
  ViolationTypeRecord,
  WatchlistStudentRecord,
} from '@/services/disciplineApi';
import { getClasses } from '@/services/presensiApi';
import type { ClassRecord } from '@/services/presensiApi';
import type {
  DisciplineCategory,
  DisciplineFilterState,
  DisciplineIncident,
  IncidentStatus,
  NewIncidentFormData,
} from '@/types/discipline';

function getStudentAvatarBg(totalPoints: number): string {
  if (totalPoints >= 50) {
    return 'bg-red-100 text-red-700 border border-red-200';
  }
  if (totalPoints >= 30) {
    return 'bg-amber-surface text-amber-dark border border-amber-gold/40';
  }
  return 'bg-pine-light text-pine-deep';
}

function getStudentPointStatus(totalPoints: number): string {
  if (totalPoints >= 100) {
    return 'SP3';
  }
  if (totalPoints >= 75) {
    return 'SP2';
  }
  if (totalPoints >= 50) {
    return 'SP1';
  }
  if (totalPoints >= 30) {
    return 'Panggilan Ortu';
  }
  if (totalPoints >= 15) {
    return 'Pembinaan';
  }
  return 'Aman';
}

function mapCategory(kategori: string): DisciplineCategory {
  if (
    kategori === 'atribut' ||
    kategori === 'kerapihan' ||
    kategori === 'perilaku' ||
    kategori === 'lainnya'
  ) {
    return kategori;
  }
  return 'perilaku';
}

function mapRecordsToIncidents(records: StudentViolationRecord[]): DisciplineIncident[] {
  const totalsByStudent = new Map<number, number>();
  for (const r of records) {
    totalsByStudent.set(r.student_id, (totalsByStudent.get(r.student_id) ?? 0) + r.poin);
  }

  return records.map((r) => {
    const initials = r.student_name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    let status: IncidentStatus = 'baru';
    const followup = r.tindak_lanjut?.toLowerCase() ?? '';
    if (followup.includes('selesai')) {
      status = 'selesai';
    } else if (followup.includes('tinjau') || followup.includes('wali')) {
      status = 'tinjau';
    } else if (r.tindak_lanjut) {
      status = 'tindak';
    }

    const totalPoints = totalsByStudent.get(r.student_id) ?? r.poin;

    return {
      id: String(r.id),
      studentId: r.student_id,
      violationTypeId: r.violation_type_id,
      violationCode: r.violation_code,
      violationName: r.violation_name,
      backendCategory: r.violation_category,
      date: r.tanggal,
      time: `${r.created_at.slice(11, 16)} WIB`,
      studentName: r.student_name,
      studentNis: r.nis ?? '-',
      studentClass: r.nama_kelas ?? '1A',
      studentInitials: initials || 'ST',
      studentAvatarBg: getStudentAvatarBg(totalPoints),
      categoryKey: mapCategory(r.violation_category),
      categoryLabel: `${r.violation_code} • ${r.violation_name} (+${r.poin})`,
      points: r.poin,
      description: r.keterangan ?? 'Pencatatan ketertiban siswa.',
      location: 'SD Islam Bakti Asih',
      immediateAction: r.tindak_lanjut ?? '',
      recorderName: 'Petugas Kesiswaan',
      recorderRole: 'Kesiswaan & BK',
      studentTotalPoints: totalPoints,
      studentPointStatus: getStudentPointStatus(totalPoints),
      status,
    };
  });
}

async function refreshData<T>(request: Promise<T>, update: (data: T) => void) {
  try {
    update(await request);
  } catch {
    // Keep existing UI state when endpoint is unavailable.
  }
}

/**
 * Interactive coordinator container for Discipline and Student Points management.
 *
 * @returns Rendered discipline management workspace.
 */
export function DisciplineManager() {
  const t = useTranslations('DisciplinePage');
  const router = useRouter();

  const [incidents, setIncidents] = useState<DisciplineIncident[]>(mockDisciplineIncidents);
  const [hasLoadedBackend, setHasLoadedBackend] = useState(false);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [students, setStudents] = useState<SchoolStudentRecord[]>([]);
  const [violationTypes, setViolationTypes] = useState<ViolationTypeRecord[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistStudentRecord[]>([]);
  const [filter, setFilter] = useState<DisciplineFilterState>({
    search: '',
    selectedClass: '',
    selectedCategory: '',
    selectedStatus: '',
    selectedPeriod: 'bulan',
    quickTab: 'all',
  });
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<DisciplineIncident | null>(null);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isTypesModalOpen, setIsTypesModalOpen] = useState(false);
  const [detailIncident, setDetailIncident] = useState<DisciplineIncident | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadData = () => {
    void refreshData(getClasses(), setClasses);
    void refreshData(fetchSchoolStudents(), setStudents);
    void refreshData(fetchViolationTypes(true), setViolationTypes);
    void refreshData(fetchWatchlist(1), setWatchlist);
    void refreshData(fetchStudentViolations(), (records) => {
      setHasLoadedBackend(true);
      setIncidents(mapRecordsToIncidents(records));
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = filterDisciplineIncidents(incidents, filter);

  const counts = {
    all: incidents.length,
    needAction: incidents.filter((i) => i.status !== 'selesai').length,
    resolved: incidents.filter((i) => i.status === 'selesai').length,
    highPoints: incidents.filter((i) => i.studentTotalPoints >= 30).length,
    showing: filtered.length,
    total: incidents.length,
  };

  const totalPoints = incidents.reduce((sum, item) => sum + item.points, 0);

  const handleSaveIncident = async (formData: NewIncidentFormData) => {
    const isEditing = editingIncident !== null;
    const numId = editingIncident ? Number(editingIncident.id) : 0;

    if (isEditing && !Number.isNaN(numId) && numId > 0) {
      try {
        await updateViolationRecord(numId, {
          violation_type_id: formData.violationTypeId,
          poin: formData.points,
          keterangan: formData.description,
          tindak_lanjut: formData.immediateAction,
          tanggal: formData.date,
        });
        setIsRecordModalOpen(false);
        setEditingIncident(null);
        showToast(t('toast_incident_updated'));
        loadData();
        return;
      } catch (error) {
        if (error instanceof DisciplineApiError && error.status === 403) {
          showToast(t('toast_forbidden'));
          return;
        }
        if (error instanceof DisciplineApiError) {
          showToast(error.message);
          return;
        }
      }
    }

    if (isEditing && editingIncident) {
      setIncidents((prev) =>
        prev.map((item) =>
          item.id === editingIncident.id
            ? {
                ...item,
                violationTypeId: formData.violationTypeId,
                violationCode: formData.violationCode,
                violationName: formData.violationName,
                backendCategory: formData.backendCategory,
                categoryKey: mapCategory(formData.backendCategory),
                categoryLabel: `${formData.violationCode} • ${formData.violationName} (+${formData.points})`,
                points: formData.points,
                date: formData.date,
                description: formData.description,
                immediateAction: formData.immediateAction,
              }
            : item,
        ),
      );
      setIsRecordModalOpen(false);
      setEditingIncident(null);
      showToast(t('toast_incident_updated'));
      return;
    }

    // Creating new incident
    try {
      await postRecordViolation({
        student_id: formData.studentId,
        violation_type_id: formData.violationTypeId,
        poin: formData.points,
        keterangan: formData.description,
        tindak_lanjut: formData.immediateAction,
        tanggal: formData.date || new Date().toISOString().slice(0, 10),
      });
      setIsRecordModalOpen(false);
      showToast(t('toast_incident_saved'));
      loadData();
    } catch (error) {
      if (error instanceof DisciplineApiError && error.status === 403) {
        showToast(t('toast_forbidden'));
        return;
      }
      if (hasLoadedBackend && error instanceof DisciplineApiError) {
        showToast(error.message);
        return;
      }

      // Offline demo fallback
      const initials = formData.studentName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      const newRecord: DisciplineIncident = {
        id: `inc-${Date.now()}`,
        studentId: formData.studentId,
        violationTypeId: formData.violationTypeId,
        violationCode: formData.violationCode,
        violationName: formData.violationName,
        backendCategory: formData.backendCategory,
        date: formData.date,
        time: formData.time,
        studentName: formData.studentName,
        studentNis: formData.studentNis,
        studentClass: formData.studentClass,
        studentInitials: initials || 'ST',
        studentAvatarBg: getStudentAvatarBg(formData.points),
        categoryKey: mapCategory(formData.backendCategory),
        categoryLabel: `${formData.violationCode} • ${formData.violationName} (+${formData.points})`,
        points: formData.points,
        description: formData.description,
        location: formData.location,
        immediateAction: formData.immediateAction,
        recorderName: 'Ibu Rina, S.Pd.',
        recorderRole: 'Kesiswaan & BK',
        studentTotalPoints: formData.points,
        studentPointStatus: getStudentPointStatus(formData.points),
        status: formData.immediateAction ? 'tindak' : 'baru',
      };
      setIncidents((prev) => [newRecord, ...prev]);
      setIsRecordModalOpen(false);
      showToast(t('toast_incident_saved'));
    }
  };

  const handleDeleteIncident = async (incident: DisciplineIncident) => {
    const numId = Number(incident.id);
    if (!Number.isNaN(numId) && numId > 0) {
      try {
        await deleteViolationRecord(numId);
        showToast(t('toast_incident_deleted'));
        loadData();
        return;
      } catch (error) {
        if (error instanceof DisciplineApiError && error.status === 403) {
          showToast(t('toast_forbidden'));
          return;
        }
      }
    }
    setIncidents((prev) => prev.filter((item) => item.id !== incident.id));
    showToast(t('toast_incident_deleted'));
  };

  const handleExportExcel = () => {
    const headers = 'ID,Tanggal,Waktu,Nama,NIS,Kelas,Kode,Pelanggaran,Poin,Deskripsi,Status\n';
    const rows = incidents
      .map(
        (i) =>
          `"${i.id}","${i.date}","${i.time}","${i.studentName}","${i.studentNis}","${i.studentClass}","${i.violationCode}","${i.violationName}",${i.points},"${i.description}","${i.status}"`,
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekap_Kedisiplinan_SD_Islam_Bakti_Asih_${Date.now()}.csv`);
    document.body.append(link);
    link.click();
    link.remove();

    showToast(t('toast_exported'));
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex animate-in items-center gap-2 rounded-xl bg-pine-deep px-4 py-3 text-sm font-semibold text-white shadow-xl duration-200 slide-in-from-top-4">
          <CheckCircle2 className="size-4.5 text-amber-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      <DisciplineHeader
        onOpenRecordModal={() => {
          setEditingIncident(null);
          setIsRecordModalOpen(true);
        }}
        onOpenClassInspection={() => {
          setIsInspectionModalOpen(true);
        }}
        onExportExcel={handleExportExcel}
        onOpenCategoryRules={() => {
          setIsTypesModalOpen(true);
        }}
      />

      <DisciplineMetrics
        totalIncidents={counts.all}
        accumulatedPoints={totalPoints}
        needActionCount={counts.needAction}
        resolvedCount={counts.resolved}
      />

      <DisciplineRuleCatalog violationTypes={violationTypes} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-3">
          <DisciplineFilterBar
            classes={classes}
            filter={filter}
            onFilterChange={setFilter}
            counts={counts}
          />

          <DisciplineIncidentTable
            incidents={filtered}
            onViewDetail={(incident) => {
              setDetailIncident(incident);
            }}
            onEditIncident={(incident) => {
              setEditingIncident(incident);
              setIsRecordModalOpen(true);
            }}
            onDeleteIncident={(incident) => {
              void handleDeleteIncident(incident);
            }}
          />
        </div>

        <div className="lg:col-span-1">
          <DisciplineSidebar
            watchlist={watchlist}
            onSendParentCall={() => {
              router.push('/dashboard/kedisiplinan/panggilan');
            }}
            onScheduleBk={() => {
              router.push('/dashboard/kedisiplinan/bimbingan');
            }}
            onReviewHistory={() => {
              router.push('/dashboard/kedisiplinan/waspada');
            }}
          />
        </div>
      </div>

      {/* Record / Edit Violation Modal */}
      <DisciplineRecordModal
        isOpen={isRecordModalOpen}
        editingIncident={editingIncident}
        classes={classes}
        students={students}
        violationTypes={violationTypes}
        onClose={() => {
          setIsRecordModalOpen(false);
          setEditingIncident(null);
        }}
        onSubmit={(data) => {
          void handleSaveIncident(data);
        }}
      />

      {/* Violation Types & Codes CRUD Modal */}
      <DisciplineViolationTypesModal
        isOpen={isTypesModalOpen}
        violationTypes={violationTypes}
        onClose={() => {
          setIsTypesModalOpen(false);
        }}
        onChanged={loadData}
        onNotify={showToast}
      />

      {/* Class Daily Inspection Checklist Modal */}
      <DisciplineClassInspectionModal
        isOpen={isInspectionModalOpen}
        classes={classes.length > 0 ? classes : [{ id: 1, nama_kelas: '1A' }]}
        violationTypes={violationTypes}
        onClose={() => {
          setIsInspectionModalOpen(false);
        }}
        onSaved={() => {
          showToast(t('toast_inspection_saved'));
          loadData();
        }}
      />

      {/* Incident Detail Drawer/Modal */}
      {detailIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="rounded bg-pine-deep/10 px-2 py-0.5 font-mono text-xs font-bold text-pine-deep">
                  {detailIncident.violationCode}
                </span>
                <h3 className="mt-1 text-base font-bold text-foreground">
                  {detailIncident.studentName} ({detailIncident.studentClass})
                </h3>
                <p className="text-xs text-muted-foreground">
                  NIS: {detailIncident.studentNis} • {detailIncident.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDetailIncident(null);
                }}
                className="rounded-lg px-2 py-1 text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                Tutup
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <p className="font-semibold text-muted-foreground">Jenis Pelanggaran & Poin</p>
                <p className="font-bold text-foreground">
                  {detailIncident.violationName} (+{detailIncident.points} Poin)
                </p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Kronologi Kejadian</p>
                <p className="text-foreground">{detailIncident.description}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Tindak Lanjut</p>
                <p className="text-foreground">
                  {detailIncident.immediateAction || 'Belum ada catatan tindak lanjut.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
