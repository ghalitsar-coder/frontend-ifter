'use client';

import { CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';
import { initialMockTeachers, mockPicketPosts } from '@/data/mockMasterGuru';
import type { EmploymentStatus, RoleFilter, TeacherProfile } from '@/types/masterGuru';
import { MasterGuruAddModal } from './MasterGuruAddModal';
import { MasterGuruHeader } from './MasterGuruHeader';
import { MasterGuruImportModal } from './MasterGuruImportModal';
import { MasterGuruPiketDrawer } from './MasterGuruPiketDrawer';
import { MasterGuruTable } from './MasterGuruTable';
import { MasterGuruToolbar } from './MasterGuruToolbar';

const AVAILABLE_ROMBELS = [
  'Kelas VII A',
  'Kelas VII B',
  'Kelas VIII A',
  'Kelas VIII B',
  'Kelas IX A',
  'Kelas IX B',
  'Kelas X MIPA 1',
  'Kelas XI MIPA 2',
  'Kelas XII MIPA 1',
];

/**
 * Coordinator component orchestrating Master Data Guru & Penugasan state, filtering, and modals.
 *
 * @returns Master guru workspace.
 */
export function MasterGuruManager() {
  const [teachers, setTeachers] = useState<TeacherProfile[]>(initialMockTeachers);
  const [picketPosts] = useState(mockPicketPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleFilter>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | EmploymentStatus>('all');
  const [isPiketDrawerOpen, setIsPiketDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
    setSelectedStatus('all');
  };

  const handleAddTeacher = (newTeacherData: Omit<TeacherProfile, 'id'>) => {
    const newRecord: TeacherProfile = {
      ...newTeacherData,
      id: `ptk-${Date.now()}`,
    };
    setTeachers([newRecord, ...teachers]);
    setIsAddModalOpen(false);
    showToast(`Guru ${newRecord.name} berhasil didaftarkan ke sistem.`);
  };

  const handleImportSuccess = (count: number) => {
    showToast(`Berhasil mengimpor dan menyinkronkan ${count} guru ke database sekolah.`);
  };

  const handleExport = () => {
    showToast('Mengekspor daftar PTK & penugasan ke berkas format Excel (.xlsx)...');
  };

  // Filter teachers based on search query, role tab, and employment status
  const filteredTeachers = teachers.filter((teacher) => {
    // Search filter: name, nip, nuptk, subject
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = teacher.name.toLowerCase().includes(q);
      const matchNip = teacher.nip.replace(/\s+/g, '').includes(q.replace(/\s+/g, ''));
      const matchNuptk = teacher.nuptk?.includes(q) ?? false;
      const matchSubject = teacher.subject.toLowerCase().includes(q);
      if (!matchName && !matchNip && !matchNuptk && !matchSubject) {
        return false;
      }
    }

    // Role tab filter
    if (selectedRole === 'homeroom' && !teacher.homeroomClass) {
      return false;
    }
    if (selectedRole === 'picket' && !teacher.picketDuty) {
      return false;
    }
    if (selectedRole === 'admin' && teacher.accessLevel !== 'admin') {
      return false;
    }

    // Employment status filter
    if (selectedStatus !== 'all' && teacher.employmentStatus !== selectedStatus) {
      return false;
    }

    return true;
  });

  const homeroomCount = teachers.filter((t) => t.homeroomClass).length;
  const picketCount = teachers.filter((t) => t.picketDuty).length;
  const adminCount = teachers.filter((t) => t.accessLevel === 'admin').length;
  const activePicketCount = picketPosts.filter((p) => p.isCheckedIn).length;
  const isFilterActive = searchQuery !== '' || selectedRole !== 'all' || selectedStatus !== 'all';

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-pine-deep px-4 py-3 text-white shadow-xl border border-pine-hover animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage(null);
            }}
            className="ml-2 text-white/60 hover:text-white cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Bento Header & Analytics */}
      <MasterGuruHeader
        totalCount={teachers.length}
        homeroomCount={homeroomCount}
        totalRombels={18}
        activePicketCount={activePicketCount}
        onOpenAddModal={() => {
          setIsAddModalOpen(true);
        }}
        onOpenImportModal={() => {
          setIsImportModalOpen(true);
        }}
        onTogglePiketDrawer={() => {
          setIsPiketDrawerOpen(!isPiketDrawerOpen);
        }}
        onExport={handleExport}
        isPiketDrawerOpen={isPiketDrawerOpen}
      />

      {/* Picket Monitoring Drawer */}
      <MasterGuruPiketDrawer
        isOpen={isPiketDrawerOpen}
        onClose={() => {
          setIsPiketDrawerOpen(false);
        }}
        posts={picketPosts}
      />

      {/* Toolbar & Filter Tabs */}
      <MasterGuruToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        totalTeachers={teachers.length}
        homeroomCount={homeroomCount}
        picketCount={picketCount}
        adminCount={adminCount}
        onResetFilters={handleResetFilters}
        isFilterActive={isFilterActive}
      />

      {/* Responsive Table of Teachers */}
      <MasterGuruTable
        teachers={filteredTeachers}
        onEditTeacher={(teacher) => {
          showToast(`Mengedit data guru: ${teacher.name}`);
        }}
        onAssignHomeroom={(teacher) => {
          showToast(`Mengatur kelas wali untuk: ${teacher.name}`);
        }}
      />

      {/* Add Teacher Modal */}
      <MasterGuruAddModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
        }}
        onSubmit={handleAddTeacher}
        availableClasses={AVAILABLE_ROMBELS}
      />

      {/* Excel Bulk Import & Validation Modal */}
      <MasterGuruImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
        }}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}
