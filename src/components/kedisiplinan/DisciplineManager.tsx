'use client';

import { useQueries } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ApiError, downloadFile } from '@/lib/api/client';
import type { DisciplineRecord } from '@/lib/api/dto';
import {
  composeIncidentDescription,
  displayStatusToRecordParam,
  filterIncidentRows,
  periodRange,
  reportMetrics,
  studentDisciplineProfileOptions,
  toIncidentRow,
  toWatchlist,
  todayInJakarta,
  useCreateDisciplineRecord,
  useDisciplineRecords,
  useDisciplineReport,
} from '@/lib/api/kedisiplinan';
import type {
  CreateDisciplineRecordInput,
  DisciplineIncidentRow,
  DisciplineRecordsQuery,
  NewIncidentFormData,
} from '@/lib/api/kedisiplinan';
import { useAcademicYears, useDisciplineCategories } from '@/lib/api/queries';
import type { DisciplineFilterState } from '@/types/discipline';
import { DisciplineFilterBar } from './DisciplineFilterBar';
import { DisciplineHeader } from './DisciplineHeader';
import { DisciplineIncidentTable } from './DisciplineIncidentTable';
import { DisciplineMetrics } from './DisciplineMetrics';
import { DisciplineRecordDetailModal } from './DisciplineRecordDetailModal';
import { DisciplineRecordModal } from './DisciplineRecordModal';
import { DisciplineRuleCatalog } from './DisciplineRuleCatalog';
import { DisciplineSidebar } from './DisciplineSidebar';

/**
 * Get student avatar background class depending on points.
 *
 * @param totalPoints - Cumulative violation points.
 * @returns CSS class string.
 */
export function getStudentAvatarBg(totalPoints: number): string {
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
export function getStudentPointStatus(totalPoints: number): string {
  if (totalPoints >= 50) {
    return 'SP1 Waspada';
  }
  if (totalPoints >= 30) {
    return 'Panggilan Ortu';
  }
  return 'Aman';
}

/**
 * Map a page of backend records to decorated table rows (adds the styling-only
 * avatar background and guidance status label on top of the DTO mapper).
 *
 * @param pageRecords - Records of the current page, undefined while loading.
 * @param totalsById - Cumulative points per student from GET /discipline/students/:id.
 * @returns Rows for the incident table.
 */
function buildIncidentRows(
  pageRecords: DisciplineRecord[] | undefined,
  totalsById: Map<string, number>,
): DisciplineIncidentRow[] {
  return (pageRecords ?? []).map((record) => {
    const base = toIncidentRow(record, totalsById.get(record.student_id) ?? 0);

    return {
      ...base,
      studentAvatarBg: getStudentAvatarBg(base.studentTotalPoints),
      studentPointStatus: getStudentPointStatus(base.studentTotalPoints),
    };
  });
}

/**
 * Quick-tab counters: server totals/KPIs when the report query resolved,
 * otherwise a best-effort count over the fetched page.
 *
 * @param rows - Decorated rows of the current page.
 * @param filteredCount - Rows visible after client-side search/tab filtering.
 * @param total - Server total for the current filter set.
 * @param metrics - Report KPI metrics, undefined while loading.
 * @returns Counts object for the filter bar.
 */
function buildCounts(
  rows: DisciplineIncidentRow[],
  filteredCount: number,
  total: number,
  metrics: ReturnType<typeof reportMetrics> | undefined,
): {
  all: number;
  needAction: number;
  resolved: number;
  highPoints: number;
  showing: number;
  total: number;
} {
  const openCount = rows.filter(
    (row) => row.status !== 'selesai' && row.status !== 'dibatalkan',
  ).length;
  const resolvedCount = rows.filter((row) => row.status === 'selesai').length;

  return {
    all: total,
    needAction: metrics?.needActionCount ?? openCount,
    resolved: metrics?.resolvedCount ?? resolvedCount,
    highPoints: rows.filter((row) => row.studentTotalPoints >= 30).length,
    showing: filteredCount,
    total,
  };
}

/**
 * Extract a display message from a failed API call.
 *
 * @param error - Caught error (usually `ApiError`).
 * @param fallback - Indonesian fallback text for non-API errors.
 * @returns Message string for the toast.
 */
function apiErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

/**
 * Translate the filter bar state into GET /discipline/records query params
 * (empty selectors become undefined so the server ignores them).
 *
 * @param filter - Current filter bar state.
 * @param range - Resolved from/to period range.
 * @returns Query params for the records list (and the matching export).
 */
function buildServerFilters(
  filter: DisciplineFilterState,
  range: { from: string; to: string },
): DisciplineRecordsQuery {
  return {
    from: range.from,
    to: range.to,
    class_id: filter.selectedClass === '' ? undefined : filter.selectedClass,
    category_id: filter.selectedCategory === '' ? undefined : filter.selectedCategory,
    status: displayStatusToRecordParam(filter.selectedStatus),
  };
}

/**
 * Interactive coordinator container for Discipline and Student Points management.
 *
 * @returns Rendered discipline management workspace.
 */
export function DisciplineManager() {
  const t = useTranslations('DisciplinePage');

  const [filter, setFilter] = useState<DisciplineFilterState>({
    search: '',
    selectedClass: '',
    selectedCategory: '',
    selectedStatus: '',
    selectedPeriod: 'bulan',
    quickTab: 'all',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleFilterChange = (next: DisciplineFilterState) => {
    setFilter(next);
    setPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  // Server-side period range: 'semester' anchors on the active academic year start.
  const academicYears = useAcademicYears();
  const activeYearStart = academicYears.data?.find((year) => year.is_active)?.start_date;
  const range = periodRange(filter.selectedPeriod, todayInJakarta(), activeYearStart);

  // Category catalog (shared cache with the modal + rule strip) for the rules toast.
  const categories = useDisciplineCategories();

  const serverFilters = buildServerFilters(filter, range);

  const records = useDisciplineRecords({
    ...serverFilters,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  // Per-student cumulative points: GET /discipline/students/:id fan-out for the
  // unique students on the current page.
  const studentIds = [...new Set((records.data?.data ?? []).map((record) => record.student_id))];
  const studentProfiles = useQueries({
    queries: studentIds.map((id) => studentDisciplineProfileOptions(id)),
  });
  const totalsById = new Map<string, number>();
  for (const [index, id] of studentIds.entries()) {
    totalsById.set(id, studentProfiles[index]?.data?.total_points ?? 0);
  }

  const rows = buildIncidentRows(records.data?.data, totalsById);

  const filtered = filterIncidentRows(rows, filter);
  const total = records.data?.total ?? 0;

  // KPI cards come from GET /reports/discipline for the selected period.
  const report = useDisciplineReport({ from: range.from, to: range.to });
  const metrics = report.data === undefined ? undefined : reportMetrics(report.data);

  const counts = buildCounts(rows, filtered.length, total, metrics);

  const watchlist = toWatchlist(rows);

  const createRecord = useCreateDisciplineRecord();

  const handleCreateIncident = (formData: NewIncidentFormData) => {
    const payload: CreateDisciplineRecordInput = {
      student_id: formData.studentId,
      category_id: formData.categoryId,
      occurred_at: formData.dateTime,
      description: composeIncidentDescription(
        formData.description,
        formData.location,
        formData.immediateAction,
      ),
    };

    createRecord.mutate(payload, {
      onSuccess: () => {
        setIsRecordModalOpen(false);
        setPage(1);
        showToast(t('toast_incident_saved'));
      },
      onError: (error) => {
        showToast(apiErrorMessage(error, 'Gagal menyimpan pelanggaran.'));
      },
    });
  };

  const handleExportExcel = async () => {
    try {
      const { blob, filename } = await downloadFile('/exports/discipline', serverFilters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename ?? `Rekap_Kedisiplinan_${Date.now()}.xlsx`);
      document.body.append(link);
      link.click();
      link.remove();

      showToast(t('toast_exported'));
    } catch (error) {
      showToast(apiErrorMessage(error, 'Gagal mengekspor laporan.'));
    }
  };

  // shortcut: no backend endpoint for parent-call letters or BK appointment
  // scheduling, keep the mock confirmation toasts.
  const handleSendParentCall = (studentName: string) => {
    showToast(`${t('toast_parent_sent')}: ${studentName}`);
  };

  const handleScheduleBk = (studentName: string) => {
    showToast(`${t('toast_bk_scheduled')}: ${studentName}`);
  };

  // shortcut: no backend "student dossier page" route; the summary numbers
  // already come from GET /discipline/students/:id via the watchlist data.
  const handleReviewHistory = (studentName: string) => {
    showToast(`Berkas rekam pembinaan (poin terkini): ${studentName}`);
  };

  // Record detail + followups live in DisciplineRecordDetailModal
  // (GET /discipline/records/:id, POST /:id/followups).
  const handleViewDetail = (incident: DisciplineIncidentRow) => {
    setSelectedRecordId(incident.id);
  };

  const handleEditIncident = (incident: DisciplineIncidentRow) => {
    setSelectedRecordId(incident.id);
  };

  // shortcut: audit trail is admin-only GET /audit-logs, outside this module's
  // wiring scope, keep the placeholder toast.
  const handleViewHistory = (incident: DisciplineIncidentRow) => {
    showToast(`Melihat audit trail untuk insiden: ${incident.studentName}`);
  };

  const handleOpenCategoryRules = () => {
    const rules = (categories.data ?? [])
      .map((category) => `${category.name} (+${category.default_points ?? 0})`)
      .join(', ');

    showToast(`Buku Pedoman Tata Tertib & Sanksi: ${rules}`);
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
        totalIncidents={metrics?.totalIncidents}
        accumulatedPoints={metrics?.accumulatedPoints}
        needActionCount={metrics?.needActionCount}
        resolvedCount={metrics?.resolvedCount}
      />

      {/* Handbook Point Weights Strip */}
      <DisciplineRuleCatalog />

      {/* Main Content: Table & Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left 3 Columns: Filters and Table */}
        <div className="space-y-4 lg:col-span-3">
          <DisciplineFilterBar
            filter={filter}
            onFilterChange={handleFilterChange}
            counts={counts}
          />

          <DisciplineIncidentTable
            incidents={filtered}
            isLoading={records.isPending}
            pagination={{ page, pageSize, total }}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            onViewDetail={handleViewDetail}
            onEditIncident={handleEditIncident}
            onViewHistory={handleViewHistory}
          />
        </div>

        {/* Right 1 Column: Parent Call Watchlist, Counseling Workflow, Sync Banner */}
        <div className="lg:col-span-1">
          <DisciplineSidebar
            watchlist={watchlist}
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

      {/* Record Detail & Follow-up Modal */}
      {selectedRecordId !== '' && (
        <DisciplineRecordDetailModal
          recordId={selectedRecordId}
          onClose={() => {
            setSelectedRecordId('');
          }}
          onToast={showToast}
        />
      )}
    </div>
  );
}
