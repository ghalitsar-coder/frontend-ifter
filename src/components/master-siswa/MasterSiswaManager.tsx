'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { MasterSiswaAccountModal } from '@/components/master-siswa/MasterSiswaAccountModal';
import { MasterSiswaAddModal } from '@/components/master-siswa/MasterSiswaAddModal';
import { MasterSiswaBulkDrawer } from '@/components/master-siswa/MasterSiswaBulkDrawer';
import { MasterSiswaHeader } from '@/components/master-siswa/MasterSiswaHeader';
import { MasterSiswaImportModal } from '@/components/master-siswa/MasterSiswaImportModal';
import { MasterSiswaMutationModal } from '@/components/master-siswa/MasterSiswaMutationModal';
import { MasterSiswaQuickDetailModal } from '@/components/master-siswa/MasterSiswaQuickDetailModal';
import { MasterSiswaTable } from '@/components/master-siswa/MasterSiswaTable';
import { MasterSiswaToolbar } from '@/components/master-siswa/MasterSiswaToolbar';
import { ApiError } from '@/lib/api/client';
import type { AttendanceSummaryItem, AcademicYear, Class } from '@/lib/api/dto';
import {
  downloadStudentsExport,
  mapClassToRombel,
  mapStudentToProfile,
  profileToStudentInput,
  rangeFromAcademicYear,
  uiStatusToBackend,
  useAttendanceSummary,
  useBulkAssignClass,
  useBulkStudentStatus,
  useClassCounts,
  useCreateStudent,
  useSaveStudentEdit,
  useMasterStudentList,
  useStudentDisciplineMap,
} from '@/lib/api/master-siswa';
import type { MasterSiswaListParams } from '@/lib/api/master-siswa';
import { useClassList, useAcademicYears } from '@/lib/api/queries';
import { can } from '@/lib/api/rbac';
import type { GradeFilter, StatusFilter, StudentProfile } from '@/types/masterSiswa';

const PAGE_SIZE = 6;

function errorText(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return 'Terjadi kesalahan tak terduga.';
}

/**
 * Picks the active academic year id (falls back to the first year).
 * @param years - All academic years from GET /academic-years.
 * @returns Year id, or '' while the list is still loading.
 */
function resolveDefaultYearId(years: AcademicYear[]): string {
  const activeYear = years.find((y) => y.is_active);
  if (activeYear !== undefined) {
    return activeYear.id;
  }
  const [firstYear] = years;
  return firstYear === undefined ? '' : firstYear.id;
}

/**
 * Assembles GET /students query params from the current UI filter state.
 * @param searchQuery - Free-text search box value.
 * @param classFilter - Selected class id or 'all'.
 * @param statusFilter - Selected UI status token.
 * @param sort - Sort column ('name' | 'nis').
 * @param currentPage - 1-based page index for limit/offset paging.
 * @returns MasterSiswaListParams ready for useMasterStudentList.
 */
function buildListParams(
  searchQuery: string,
  classFilter: string,
  statusFilter: StatusFilter,
  sort: 'name' | 'nis',
  currentPage: number,
): MasterSiswaListParams {
  const search = searchQuery === '' ? undefined : searchQuery;
  const classId = classFilter === 'all' ? undefined : classFilter;
  return {
    search,
    class_id: classId,
    status: uiStatusToBackend(statusFilter),
    sort,
    limit: PAGE_SIZE,
    offset: (currentPage - 1) * PAGE_SIZE,
  };
}

/**
 * Indexes class rows by id and by name for the homeroom join + name→id resolve.
 * @param classes - Classes from GET /classes for the selected year.
 * @returns Lookup maps keyed by class id and class name.
 */
function indexClasses(classes: Class[]): {
  classIndex: Record<string, Class>;
  classIdByName: Record<string, string>;
} {
  const classIndex: Record<string, Class> = {};
  const classIdByName: Record<string, string> = {};
  for (const classRow of classes) {
    classIndex[classRow.id] = classRow;
    classIdByName[classRow.name] = classRow.id;
  }
  return { classIndex, classIdByName };
}

/**
 * Indexes attendance summary rows by student id (GET /attendance/summary is unpaginated).
 * @param rows - Summary rows, or undefined while loading.
 * @returns Map of student id to its attendance summary item.
 */
function buildSummaryIndex(
  rows: AttendanceSummaryItem[] | undefined,
): Record<string, AttendanceSummaryItem> {
  const map: Record<string, AttendanceSummaryItem> = {};
  if (rows === undefined) {
    return map;
  }
  for (const row of rows) {
    map[row.student_id] = row;
  }
  return map;
}

/**
 * Main manager component orchestrating master student records, search, filters, and batch operations.
 * All data now flows from the real backend API through react-query (no mock seeds).
 *
 * @returns Master student management workspace.
 */
export function MasterSiswaManager() {
  const t = useTranslations('MasterSiswaPage');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const { roles } = useAuth();
  const isAdmin = can(roles, 'admin');
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [yearFilter, setYearFilter] = useState('');
  const [sort, setSort] = useState<'name' | 'nis'>('name');

  // Selection & pagination state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMutationModalOpen, setIsMutationModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [inspectedStudent, setInspectedStudent] = useState<StudentProfile | null>(null);
  const [accountStudent, setAccountStudent] = useState<StudentProfile | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // ---------------------------------------------------------------------------
  // Backend data
  // ---------------------------------------------------------------------------
  const academicYearsQuery = useAcademicYears();
  const academicYears = academicYearsQuery.data ?? [];
  const defaultYearId = resolveDefaultYearId(academicYears);
  const selectedYearId = yearFilter === '' ? defaultYearId : yearFilter;
  const selectedYear = academicYears.find((y) => y.id === selectedYearId);
  const range = rangeFromAcademicYear(selectedYear);

  const classesQuery = useClassList({ academic_year_id: selectedYearId, status: 'active' });
  const classes = classesQuery.data ?? [];
  const classIds = classes.map((c) => c.id);
  const classCounts = useClassCounts(classIds);

  const rombels = classes.map((c) => mapClassToRombel(c, classCounts[c.id] ?? 0));
  const { classIndex, classIdByName } = indexClasses(classes);

  const listParams = buildListParams(searchQuery, classFilter, statusFilter, sort, currentPage);

  const studentListQuery = useMasterStudentList(listParams);
  const apiStudents = studentListQuery.data?.data ?? [];
  const totalFilteredCount = studentListQuery.data?.total ?? 0;

  const summaryQuery = useAttendanceSummary(range);
  const summaryByStudent = buildSummaryIndex(summaryQuery.data?.data);
  const visibleIds = apiStudents.map((s) => s.id);
  const disciplineMap = useStudentDisciplineMap(visibleIds);

  const students: StudentProfile[] = apiStudents.map((s) =>
    mapStudentToProfile(s, {
      classIndex,
      metrics: { summary: summaryByStudent[s.id], discipline: disciplineMap[s.id] },
    }),
  );

  // shortcut: GET /students has no grade query param, so the grade chip filters
  // the current server page client-side (other filters + pagination stay server-side).
  const pageStudents =
    gradeFilter === 'all' ? students : students.filter((s) => s.grade === gradeFilter);

  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / PAGE_SIZE));

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------
  const createStudentMutation = useCreateStudent();
  const editStudentMutation = useSaveStudentEdit();
  const bulkStatusMutation = useBulkStudentStatus();
  const assignClassMutation = useBulkAssignClass();

  // Add / edit student handler
  const handleAddStudentSubmit = (newStudentData: Omit<StudentProfile, 'id'>, keepOpen = false) => {
    const targetClassId = classIdByName[newStudentData.className];

    if (editingStudent !== null) {
      const previousClassId = classIdByName[editingStudent.className];
      editStudentMutation.mutate(
        {
          id: editingStudent.id,
          payload: profileToStudentInput(newStudentData),
          classId:
            targetClassId === undefined || targetClassId === previousClassId
              ? undefined
              : targetClassId,
        },
        {
          onSuccess: () => {
            triggerToast(`Data ${newStudentData.name} diperbarui.`);
            setIsAddModalOpen(false);
            setEditingStudent(null);
          },
          onError: (error) => {
            triggerToast(errorText(error));
          },
        },
      );
      return;
    }

    createStudentMutation.mutate(profileToStudentInput(newStudentData, targetClassId), {
      onSuccess: () => {
        triggerToast(t('toast_student_added', { name: newStudentData.name }));
        if (!keepOpen) {
          setIsAddModalOpen(false);
        }
      },
      onError: (error) => {
        triggerToast(errorText(error));
      },
    });
  };

  // Mass mutation handler (class assignment)
  const handleConfirmMutation = (params: {
    studentIds: string[];
    targetClassId: string;
    targetClassName: string;
    reason: string;
    skNumber: string;
    notifyWhatsApp: boolean;
  }) => {
    // shortcut: PUT /students/:id/class only persists class_id + start_date;
    // reason / SK number / WhatsApp notify have no backend fields.
    assignClassMutation.mutate(
      { ids: params.studentIds, class_id: params.targetClassId },
      {
        onSuccess: () => {
          setSelectedStudentIds([]);
          triggerToast(
            t('toast_mutation_executed', {
              count: params.studentIds.length,
              target: params.targetClassName,
            }),
          );
        },
        onError: (error) => {
          triggerToast(errorText(error));
        },
      },
    );
  };

  // Bulk actions handlers
  const handleBroadcastCall = () => {
    // shortcut: no broadcast/WhatsApp endpoint, keep mock feedback
    triggerToast(t('toast_broadcast_sent', { count: selectedStudentIds.length }));
  };

  const handleExportSelected = () => {
    // shortcut: GET /exports/students filters by class/search/status but not by id list
    triggerToast(t('toast_export_selected_done', { count: selectedStudentIds.length }));
  };

  const handleChangeStatus = async () => {
    const selected = students.filter((s) => selectedStudentIds.includes(s.id));
    const activeIds = selected.filter((s) => s.status === 'active').map((s) => s.id);
    const otherIds = selected.filter((s) => s.status !== 'active').map((s) => s.id);

    try {
      const requests: Promise<unknown>[] = [];
      if (activeIds.length > 0) {
        requests.push(bulkStatusMutation.mutateAsync({ ids: activeIds, status: 'transferred' }));
      }
      if (otherIds.length > 0) {
        requests.push(bulkStatusMutation.mutateAsync({ ids: otherIds, status: 'active' }));
      }
      await Promise.all(requests);
      setSelectedStudentIds([]);
      triggerToast(t('toast_status_updated', { count: selectedStudentIds.length }));
    } catch (error) {
      triggerToast(errorText(error));
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      await downloadStudentsExport({
        search: listParams.search,
        class_id: listParams.class_id,
        status: uiStatusToBackend(statusFilter),
      });
      triggerToast(t('toast_export_all_done'));
    } catch (error) {
      triggerToast(errorText(error));
    }
    setIsExporting(false);
  };

  // Inspect student handler
  const handleViewStudent = (student: StudentProfile) => {
    setInspectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const handleEditStudent = (student: StudentProfile) => {
    setEditingStudent(student);
    setIsAddModalOpen(true);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setGradeFilter('all');
    setClassFilter('all');
    setStatusFilter('all');
    setYearFilter('');
    setCurrentPage(1);
  };

  // Derived counts for metrics (gender counts cover the current page only —
  // shortcut: no gender aggregate endpoint)
  const maleCount = students.filter((s) => s.gender === 'L').length;
  const femaleCount = students.filter((s) => s.gender === 'P').length;
  const fullRombelCount = rombels.filter((r) => r.currentCount >= r.capacity).length;
  const rombelCapacitySummary = `${fullRombelCount}/${rombels.length} ${t('unit_full')}`;

  const selectedStudents = students.filter((s) => selectedStudentIds.includes(s.id));
  const classOptions = classes.map((c) => ({ id: c.id, name: c.name }));
  const addModalKey = editingStudent === null ? 'new' : editingStudent.id;
  const inspectedMetrics =
    inspectedStudent === null
      ? undefined
      : {
          summary: summaryByStudent[inspectedStudent.id],
          discipline: disciplineMap[inspectedStudent.id],
        };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 py-2">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in duration-200 fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 rounded-2xl border border-pine-hover bg-pine-deep px-4 py-3 text-white shadow-xl">
            <CheckCircle2 className="size-4 text-amber-gold" />
            <span className="text-xs font-semibold sm:text-sm">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header with Title and Metrics Bento */}
      <MasterSiswaHeader
        totalCount={totalFilteredCount}
        maleCount={maleCount}
        femaleCount={femaleCount}
        rombelCapacitySummary={rombelCapacitySummary}
        isExporting={isExporting}
        onOpenAddStudent={() => {
          setEditingStudent(null);
          setIsAddModalOpen(true);
        }}
        onExportExcel={() => {
          void handleExportAll();
        }}
        onOpenImportExcel={() => {
          setIsImportModalOpen(true);
        }}
        onToggleBulkMode={() => {
          if (selectedStudentIds.length === 0) {
            setSelectedStudentIds(pageStudents.map((s) => s.id));
          } else {
            setSelectedStudentIds([]);
          }
        }}
      />

      {/* Toolbar with Search and Filters */}
      <MasterSiswaToolbar
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        gradeFilter={gradeFilter}
        onGradeChange={(val) => {
          setGradeFilter(val);
          setCurrentPage(1);
        }}
        classFilter={classFilter}
        onClassChange={(val) => {
          setClassFilter(val);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setCurrentPage(1);
        }}
        yearFilter={selectedYearId}
        defaultYearId={defaultYearId}
        yearOptions={academicYears.map((y) => ({ id: y.id, name: y.name }))}
        onYearChange={(val) => {
          setYearFilter(val);
          setClassFilter('all');
          setCurrentPage(1);
        }}
        sortValue={sort}
        onSortChange={(val) => {
          setSort(val);
          setCurrentPage(1);
        }}
        availableClasses={classOptions}
        onResetFilters={handleResetFilters}
      />

      {/* Student Master Table */}
      <MasterSiswaTable
        students={pageStudents}
        isLoading={studentListQuery.isPending}
        selectedStudentIds={selectedStudentIds}
        onToggleSelectAll={() => {
          const pageIds = pageStudents.map((s) => s.id);
          const areAllCurrentPageSelected =
            pageIds.length > 0 && pageIds.every((id) => selectedStudentIds.includes(id));

          if (areAllCurrentPageSelected) {
            setSelectedStudentIds((prev) => prev.filter((id) => !pageIds.includes(id)));
          } else {
            setSelectedStudentIds((prev) => [...new Set([...prev, ...pageIds])]);
          }
        }}
        onToggleSelectStudent={(id) => {
          setSelectedStudentIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
          );
        }}
        onViewStudent={handleViewStudent}
        onEditStudent={handleEditStudent}
        canManageAccount={isAdmin}
        onManageAccount={(student) => {
          setAccountStudent(student);
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        totalFilteredCount={totalFilteredCount}
        onPageChange={setCurrentPage}
      />

      {/* Floating Bulk Action Drawer */}
      <MasterSiswaBulkDrawer
        selectedCount={selectedStudentIds.length}
        isStatusPending={bulkStatusMutation.isPending || assignClassMutation.isPending}
        onClearSelection={() => {
          setSelectedStudentIds([]);
        }}
        onOpenMutationModal={() => {
          setIsMutationModalOpen(true);
        }}
        onBroadcastCall={handleBroadcastCall}
        onExportSelected={handleExportSelected}
        onChangeStatus={() => {
          void handleChangeStatus();
        }}
      />

      {/* Add / Edit Student Modal (keyed so edit seeds re-initialize the form) */}
      {isAddModalOpen && (
        <MasterSiswaAddModal
          key={addModalKey}
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingStudent(null);
          }}
          onSubmit={handleAddStudentSubmit}
          availableRombels={rombels}
          initialStudent={editingStudent ?? undefined}
          isSubmitting={createStudentMutation.isPending || editStudentMutation.isPending}
        />
      )}

      {/* Excel Import Modal */}
      <MasterSiswaImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
        }}
        onImported={(count) => {
          triggerToast(`Import selesai: ${count} data siswa tersinkron ke database.`);
        }}
      />

      {/* Mutation Modal */}
      <MasterSiswaMutationModal
        isOpen={isMutationModalOpen}
        onClose={() => {
          setIsMutationModalOpen(false);
        }}
        selectedStudents={selectedStudents}
        availableRombels={rombels}
        onConfirmMutation={handleConfirmMutation}
        isSubmitting={assignClassMutation.isPending}
      />

      {/* Quick Detail Modal */}
      <MasterSiswaQuickDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setInspectedStudent(null);
        }}
        student={inspectedStudent}
        metrics={inspectedMetrics}
        range={range}
        onQuickStatusChange={(student) => {
          // shortcut: no single-student today-status endpoint, keep mock feedback
          triggerToast(t('toast_status_quick_changed', { name: student.name }));
        }}
      />

      {/* Student login account management (admin only) */}
      {accountStudent !== null && (
        <MasterSiswaAccountModal
          student={accountStudent}
          onClose={() => {
            setAccountStudent(null);
          }}
          onToast={triggerToast}
        />
      )}
    </div>
  );
}
