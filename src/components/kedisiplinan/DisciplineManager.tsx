'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { filterDisciplineIncidents, mockDisciplineIncidents } from '@/data/mockDiscipline';
import type {
  DisciplineCategory,
  DisciplineFilterState,
  DisciplineIncident,
  NewIncidentFormData,
} from '@/types/discipline';
import { DisciplineFilterBar } from './DisciplineFilterBar';
import { DisciplineHeader } from './DisciplineHeader';
import { DisciplineIncidentTable } from './DisciplineIncidentTable';
import { DisciplineMetrics } from './DisciplineMetrics';
import { DisciplineRecordModal } from './DisciplineRecordModal';
import { DisciplineRuleCatalog } from './DisciplineRuleCatalog';
import { DisciplineSidebar } from './DisciplineSidebar';

/**
 * Calculate point weight based on violation category.
 *
 * @param category - Category key.
 * @returns Numerical point penalty.
 */
function getViolationPointWeight(category: DisciplineCategory): number {
  if (category === 'bullying') {
    return 50;
  }
  if (category === 'barang_terlarang') {
    return 25;
  }
  if (category === 'tatatertib') {
    return 5;
  }
  if (category === 'seragam') {
    return 3;
  }
  return 2;
}

/**
 * Get category display label with point weight suffix.
 *
 * @param category - Category key.
 * @returns Formatted label string.
 */
function getViolationLabel(category: DisciplineCategory): string {
  if (category === 'bullying') {
    return 'Perkelahian (+50)';
  }
  if (category === 'barang_terlarang') {
    return 'Barang Terlarang (+25)';
  }
  if (category === 'tatatertib') {
    return 'Tata Tertib (+5)';
  }
  if (category === 'seragam') {
    return 'Atribut Seragam (+3)';
  }
  return 'Keterlambatan (+2)';
}

/**
 * Get student avatar background class depending on points.
 *
 * @param totalPoints - Cumulative violation points.
 * @returns CSS class string.
 */
function getStudentAvatarBg(totalPoints: number): string {
  if (totalPoints >= 50) {
    return 'bg-red-100 text-red-700 border border-red-200';
  }
  if (totalPoints >= 30) {
    return 'bg-amber-surface text-amber-dark border border-amber-gold/40';
  }
  return 'bg-pine-light text-pine-deep';
}

/**
 * Get student guidance warning status label.
 *
 * @param totalPoints - Cumulative violation points.
 * @returns Status string.
 */
function getStudentPointStatus(totalPoints: number): string {
  if (totalPoints >= 50) {
    return 'SP1 Waspada';
  }
  if (totalPoints >= 30) {
    return 'Panggilan Ortu';
  }
  return 'Aman';
}

/**
 * Interactive coordinator container for Discipline and Student Points management.
 *
 * @returns Rendered discipline management workspace.
 */
export function DisciplineManager() {
  const t = useTranslations('DisciplinePage');

  const [incidents, setIncidents] = useState<DisciplineIncident[]>(mockDisciplineIncidents);
  const [filter, setFilter] = useState<DisciplineFilterState>({
    search: '',
    selectedClass: '',
    selectedCategory: '',
    selectedStatus: '',
    selectedPeriod: 'bulan',
    quickTab: 'all',
  });
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const filtered = filterDisciplineIncidents(incidents, filter);

  // Compute counts
  const counts = {
    all: incidents.length,
    needAction: incidents.filter((i) => i.status !== 'selesai').length,
    resolved: incidents.filter((i) => i.status === 'selesai').length,
    highPoints: incidents.filter((i) => i.studentTotalPoints >= 30).length,
    showing: filtered.length,
    total: incidents.length,
  };

  const totalPoints = incidents.reduce((sum, item) => sum + item.points, 0);

  const handleCreateIncident = (formData: NewIncidentFormData) => {
    const pointWeight = getViolationPointWeight(formData.categoryKey);
    const label = getViolationLabel(formData.categoryKey);

    const initials = formData.studentName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    // Previous student incidents to calculate cumulative points
    const previousPoints = incidents
      .filter((i) => i.studentNis === formData.studentNis)
      .reduce((sum, curr) => sum + curr.points, 0);
    const newStudentTotal = previousPoints + pointWeight;

    const newRecord: DisciplineIncident = {
      id: `inc-${Date.now()}`,
      date: '05 Okt 2026',
      time: '10:00 WIB',
      studentName: formData.studentName,
      studentNis: formData.studentNis,
      studentClass: formData.studentClass,
      studentInitials: initials || 'ST',
      studentAvatarBg: getStudentAvatarBg(newStudentTotal),
      categoryKey: formData.categoryKey,
      categoryLabel: label,
      points: pointWeight,
      description: formData.description,
      location: formData.location,
      recorderName: 'Drs. H. Mulyono',
      recorderRole: 'Kesiswaan & BK',
      studentTotalPoints: newStudentTotal,
      studentPointStatus: getStudentPointStatus(newStudentTotal),
      status: 'baru',
    };

    setIncidents([newRecord, ...incidents]);
    setIsRecordModalOpen(false);
    showToast(t('toast_incident_saved'));
  };

  const handleExportExcel = () => {
    const headers = 'ID,Tanggal,Waktu,Nama,NIS,Kelas,Kategori,Poin,Deskripsi,Status\n';
    const rows = incidents
      .map(
        (i) =>
          `"${i.id}","${i.date}","${i.time}","${i.studentName}","${i.studentNis}","${i.studentClass}","${i.categoryLabel}",${i.points},"${i.description}","${i.status}"`,
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekap_Kedisiplinan_SMPN1_${Date.now()}.csv`);
    document.body.append(link);
    link.click();
    link.remove();

    showToast(t('toast_exported'));
  };

  const handleSendParentCall = (studentName: string) => {
    showToast(`${t('toast_parent_sent')}: ${studentName}`);
  };

  const handleScheduleBk = (studentName: string) => {
    showToast(`${t('toast_bk_scheduled')}: ${studentName}`);
  };

  const handleReviewHistory = (studentName: string) => {
    showToast(`Membuka berkas rekam pembinaan untuk: ${studentName}`);
  };

  const handleViewDetail = (incident: DisciplineIncident) => {
    showToast(`Detail Pelanggaran: ${incident.studentName} (${incident.categoryLabel})`);
  };

  const handleEditIncident = (incident: DisciplineIncident) => {
    showToast(`Membuka dialog penyuntingan insiden: ${incident.id}`);
  };

  const handleViewHistory = (incident: DisciplineIncident) => {
    showToast(`Melihat audit trail untuk insiden: ${incident.studentName}`);
  };

  const handleOpenCategoryRules = () => {
    showToast(
      'Buku Pedoman Tata Tertib & Sanksi: Terlambat (+2), Seragam (+3), Gadget (+5), Barang Terlarang (+25), Bullying (+50)',
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex animate-in items-center gap-2 rounded-xl bg-pine-deep px-4 py-3 text-sm font-semibold text-white shadow-xl duration-200 slide-in-from-top-4">
          <CheckCircle2 className="size-4.5 text-amber-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with quick actions */}
      <DisciplineHeader
        onOpenRecordModal={() => {
          setIsRecordModalOpen(true);
        }}
        onExportExcel={handleExportExcel}
        onOpenCategoryRules={handleOpenCategoryRules}
      />

      {/* KPI 4 Bento Summary Cards */}
      <DisciplineMetrics
        totalIncidents={counts.all}
        accumulatedPoints={totalPoints}
        needActionCount={counts.needAction}
        resolvedCount={counts.resolved}
      />

      {/* Handbook Point Weights Strip */}
      <DisciplineRuleCatalog />

      {/* Main Content: Table & Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left 3 Columns: Filters and Table */}
        <div className="space-y-4 lg:col-span-3">
          <DisciplineFilterBar filter={filter} onFilterChange={setFilter} counts={counts} />

          <DisciplineIncidentTable
            incidents={filtered}
            onViewDetail={handleViewDetail}
            onEditIncident={handleEditIncident}
            onViewHistory={handleViewHistory}
          />
        </div>

        {/* Right 1 Column: Parent Call Watchlist, Counseling Workflow, Sync Banner */}
        <div className="lg:col-span-1">
          <DisciplineSidebar
            onSendParentCall={handleSendParentCall}
            onScheduleBk={handleScheduleBk}
            onReviewHistory={handleReviewHistory}
          />
        </div>
      </div>

      {/* Record Violation Modal */}
      <DisciplineRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
        }}
        onSubmit={handleCreateIncident}
      />
    </div>
  );
}
