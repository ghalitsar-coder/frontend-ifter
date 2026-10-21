'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { MasterSiswaAddModal } from '@/components/master-siswa/MasterSiswaAddModal';
import { MasterSiswaBulkDrawer } from '@/components/master-siswa/MasterSiswaBulkDrawer';
import { MasterSiswaHeader } from '@/components/master-siswa/MasterSiswaHeader';
import { MasterSiswaMutationModal } from '@/components/master-siswa/MasterSiswaMutationModal';
import { MasterSiswaQuickDetailModal } from '@/components/master-siswa/MasterSiswaQuickDetailModal';
import { MasterSiswaTable } from '@/components/master-siswa/MasterSiswaTable';
import { MasterSiswaToolbar } from '@/components/master-siswa/MasterSiswaToolbar';
import { AVAILABLE_ROMBELS, INITIAL_STUDENTS } from '@/data/mockMasterSiswa';
import type { GradeFilter, RombelOption, StatusFilter, StudentProfile } from '@/types/masterSiswa';

/**
 * Main manager component orchestrating master student records, search, filters, and batch operations.
 *
 * @param props - Component properties.
 * @returns Master student management workspace.
 */
export function MasterSiswaManager(props: {
  initialStudents?: StudentProfile[];
  initialRombels?: RombelOption[];
}) {
  const t = useTranslations('MasterSiswaPage');

  // Core state
  const [students, setStudents] = useState<StudentProfile[]>(
    props.initialStudents || INITIAL_STUDENTS,
  );
  const [rombels, setRombels] = useState<RombelOption[]>(props.initialRombels || AVAILABLE_ROMBELS);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [yearFilter, setYearFilter] = useState('2024/2025');

  // Selection & pagination state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMutationModalOpen, setIsMutationModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [inspectedStudent, setInspectedStudent] = useState<StudentProfile | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Extract available unique classes for filter
  const availableClasses = [...new Set(students.map((s) => s.className))].sort();

  // Filter calculation
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      searchQuery === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery) ||
      s.nisn.includes(searchQuery);

    const matchesGrade = gradeFilter === 'all' || s.grade === gradeFilter;
    const matchesClass = classFilter === 'all' || s.className === classFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesGrade && matchesClass && matchesStatus;
  });

  // Pagination calculation
  const totalFilteredCount = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Selection handlers
  const handleToggleSelectAll = () => {
    const pageIds = paginatedStudents.map((s) => s.id);
    const areAllCurrentPageSelected =
      pageIds.length > 0 && pageIds.every((id) => selectedStudentIds.includes(id));

    if (areAllCurrentPageSelected) {
      setSelectedStudentIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedStudentIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleClearSelection = () => {
    setSelectedStudentIds([]);
  };

  // Add student handler
  const handleAddStudentSubmit = (newStudentData: Omit<StudentProfile, 'id'>, keepOpen = false) => {
    const newStudent: StudentProfile = {
      ...newStudentData,
      id: `std-${Date.now()}`,
    };

    setStudents((prev) => [newStudent, ...prev]);

    // Update target rombel student count
    setRombels((prev) =>
      prev.map((r) =>
        r.name === newStudent.className ? { ...r, currentCount: r.currentCount + 1 } : r,
      ),
    );

    triggerToast(t('toast_student_added', { name: newStudent.name }));

    if (!keepOpen) {
      setIsAddModalOpen(false);
    }
  };

  // Mass mutation handler
  const handleConfirmMutation = (params: {
    studentIds: string[];
    targetClassId: string;
    targetClassName: string;
    reason: string;
    skNumber: string;
    notifyWhatsApp: boolean;
  }) => {
    const targetRombel = rombels.find((r) => r.id === params.targetClassId);
    let startAbsent = (targetRombel?.currentCount || 28) + 1;

    setStudents((prev) =>
      prev.map((student) => {
        if (params.studentIds.includes(student.id)) {
          const updated: StudentProfile = {
            ...student,
            className: params.targetClassName,
            absentNumber: startAbsent,
            homeroomTeacher: targetRombel?.homeroomTeacher || student.homeroomTeacher,
            homeroomNotes: `Mutasi ke ${params.targetClassName} berdasarkan SK ${params.skNumber}.`,
          };
          startAbsent += 1;
          return updated;
        }
        return student;
      }),
    );

    // Update rombel counters
    setRombels((prev) =>
      prev.map((r) => {
        if (r.id === params.targetClassId) {
          return { ...r, currentCount: r.currentCount + params.studentIds.length };
        }
        return r;
      }),
    );

    setSelectedStudentIds([]);
    triggerToast(
      t('toast_mutation_executed', {
        count: params.studentIds.length,
        target: params.targetClassName,
      }),
    );
  };

  // Bulk actions handlers
  const handleBroadcastCall = () => {
    triggerToast(t('toast_broadcast_sent', { count: selectedStudentIds.length }));
  };

  const handleExportSelected = () => {
    triggerToast(t('toast_export_selected_done', { count: selectedStudentIds.length }));
  };

  const handleChangeStatus = () => {
    setStudents((prev) =>
      prev.map((s) =>
        selectedStudentIds.includes(s.id)
          ? {
              ...s,
              status: s.status === 'active' ? 'mutation' : 'active',
            }
          : s,
      ),
    );
    triggerToast(t('toast_status_updated', { count: selectedStudentIds.length }));
  };

  // Inspect student handler
  const handleViewStudent = (student: StudentProfile) => {
    setInspectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const handleEditStudent = (student: StudentProfile) => {
    setInspectedStudent(student);
    setIsDetailModalOpen(true);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setGradeFilter('all');
    setClassFilter('all');
    setStatusFilter('all');
    setYearFilter('2024/2025');
    setCurrentPage(1);
  };

  // Derived counts for metrics
  const totalCount = students.length;
  const maleCount = students.filter((s) => s.gender === 'L').length;
  const femaleCount = students.filter((s) => s.gender === 'P').length;
  const fullRombelCount = rombels.filter((r) => r.currentCount >= r.capacity).length;
  const rombelCapacitySummary = `${fullRombelCount}/${rombels.length} ${t('unit_full')}`;

  const selectedStudents = students.filter((s) => selectedStudentIds.includes(s.id));

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
        totalCount={totalCount}
        maleCount={maleCount}
        femaleCount={femaleCount}
        rombelCapacitySummary={rombelCapacitySummary}
        onOpenAddStudent={() => {
          setIsAddModalOpen(true);
        }}
        onExportExcel={() => {
          triggerToast(t('toast_export_all_done'));
        }}
        onToggleBulkMode={() => {
          if (selectedStudentIds.length === 0) {
            setSelectedStudentIds(paginatedStudents.map((s) => s.id));
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
        yearFilter={yearFilter}
        onYearChange={setYearFilter}
        availableClasses={availableClasses}
        onResetFilters={handleResetFilters}
      />

      {/* Student Master Table */}
      <MasterSiswaTable
        students={paginatedStudents}
        selectedStudentIds={selectedStudentIds}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleSelectStudent={handleToggleSelectStudent}
        onViewStudent={handleViewStudent}
        onEditStudent={handleEditStudent}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalFilteredCount={totalFilteredCount}
        onPageChange={setCurrentPage}
      />

      {/* Floating Bulk Action Drawer */}
      <MasterSiswaBulkDrawer
        selectedCount={selectedStudentIds.length}
        onClearSelection={handleClearSelection}
        onOpenMutationModal={() => {
          setIsMutationModalOpen(true);
        }}
        onBroadcastCall={handleBroadcastCall}
        onExportSelected={handleExportSelected}
        onChangeStatus={handleChangeStatus}
      />

      {/* Add Student Modal */}
      <MasterSiswaAddModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
        }}
        onSubmit={handleAddStudentSubmit}
        availableRombels={rombels}
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
      />

      {/* Quick Detail Modal */}
      <MasterSiswaQuickDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setInspectedStudent(null);
        }}
        student={inspectedStudent}
        onQuickStatusChange={(student) => {
          triggerToast(t('toast_status_quick_changed', { name: student.name }));
        }}
      />
    </div>
  );
}
