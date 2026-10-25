'use client';

import { CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { mockPicketPosts } from '@/data/mockMasterGuru';
import type { Teacher } from '@/lib/api/dto';
import {
  apiErrorMessage,
  buildTeacherProfiles,
  downloadTeacherExport,
  saveBlob,
  useCreateTeacher,
  useDutyAssignments,
  useEmploymentTypes,
  useMasterGuruTeachers,
  useTeacherAccounts,
  useUpdateTeacherStatus,
} from '@/lib/api/master-guru';
import type { NewTeacherDraft, TeacherAccount } from '@/lib/api/master-guru';
import { useClassList } from '@/lib/api/queries';
import { can } from '@/lib/api/rbac';
import type { RoleFilter, TeacherProfile } from '@/types/masterGuru';
import { MasterGuruAddModal } from './MasterGuruAddModal';
import { MasterGuruHeader } from './MasterGuruHeader';
import { MasterGuruImportModal } from './MasterGuruImportModal';
import { MasterGuruPiketDrawer } from './MasterGuruPiketDrawer';
import { MasterGuruTable } from './MasterGuruTable';
import { MasterGuruToolbar } from './MasterGuruToolbar';
import { useAccountStatus } from './useAccountStatus';
import { useCredentialReset } from './useCredentialReset';
import { useTeacherEdit } from './useTeacherEdit';

/**
 * Index linked system accounts by teacher id for table badges.
 * @param teachers - Raw teachers from GET /teachers.
 * @param accounts - Accounts keyed by user id from GET /users.
 * @returns Teacher id to account lookup.
 */
function buildAccountsByTeacher(
  teachers: Teacher[],
  accounts: Record<string, TeacherAccount>,
): Record<string, TeacherAccount> {
  const byTeacher: Record<string, TeacherAccount> = {};
  for (const teacher of teachers) {
    if (teacher.user_id !== undefined) {
      const account = accounts[teacher.user_id];
      if (account !== undefined) {
        byTeacher[teacher.id] = account;
      }
    }
  }
  return byTeacher;
}

/**
 * Client-side filter for the role tabs and the employment type, which the
 * backend cannot query (GET /teachers has no role join or type filter).
 * @param teacher - Enriched profile row.
 * @param selectedRole - Active tab ('all' accepts everything).
 * @param selectedEmploymentTypeId - Type id ('' accepts everything).
 * @returns Whether the row belongs on the active tab.
 */
function matchesTabFilters(
  teacher: TeacherProfile,
  selectedRole: RoleFilter,
  selectedEmploymentTypeId: string,
): boolean {
  if (selectedRole === 'homeroom' && !teacher.homeroomClass) {
    return false;
  }
  if (selectedRole === 'picket' && !teacher.picketDuty) {
    return false;
  }
  if (selectedRole === 'admin' && teacher.accessLevel !== 'admin') {
    return false;
  }

  return selectedEmploymentTypeId === '' || teacher.employmentTypeId === selectedEmploymentTypeId;
}

/**
 * Coordinator component orchestrating Master Data Guru & Penugasan state,
 * filtering, and modals. Teacher records come from GET /teachers and are
 * enriched with /classes (homeroom) and /duty-assignments (picket) joins.
 *
 * @returns Master guru workspace.
 */
export function MasterGuruManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleFilter>('all');
  const [selectedEmploymentTypeId, setSelectedEmploymentTypeId] = useState('');
  const [isPiketDrawerOpen, setIsPiketDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { requestReset, credentialModal } = useCredentialReset();
  const { requestAccountStatus, accountStatusModal } = useAccountStatus();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { roles: authRoles } = useAuth();
  const isAdmin = can(authRoles, 'admin');

  const trimmedSearch = searchQuery.trim();
  const teachersQuery = useMasterGuruTeachers(
    trimmedSearch === '' ? { limit: 100 } : { search: trimmedSearch, limit: 100 },
  );
  const classesQuery = useClassList({ status: 'active' });
  const dutiesQuery = useDutyAssignments();
  const employmentTypesQuery = useEmploymentTypes();
  const employmentTypes = employmentTypesQuery.data ?? [];

  const teachers = teachersQuery.data?.data ?? [];
  const linkedUserIds = teachers
    .map((teacher) => teacher.user_id)
    .filter((id): id is string => id !== undefined);
  const accountsQuery = useTeacherAccounts(linkedUserIds);

  const profiles = buildTeacherProfiles(
    teachers,
    classesQuery.data ?? [],
    dutiesQuery.data ?? [],
    accountsQuery.data ?? {},
  );
  const accountsByTeacher = buildAccountsByTeacher(teachers, accountsQuery.data ?? {});

  // shortcut: gate posts + morning check-in status have no backend endpoint, keep mock
  const picketPosts = mockPicketPosts;

  const createTeacher = useCreateTeacher();
  const updateStatus = useUpdateTeacherStatus();

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const { requestEdit, editModal } = useTeacherEdit(employmentTypes, showToast);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
    setSelectedEmploymentTypeId('');
  };

  const handleAddTeacher = (draft: NewTeacherDraft) => {
    createTeacher.mutate(draft, {
      onSuccess: (result) => {
        setIsAddModalOpen(false);
        const accountNote = result.accountCreated
          ? ' Akun login berhasil dibuat.'
          : ' (Akun login tidak dibuat — cek hak akses admin.)';
        showToast(`Guru ${result.teacher.full_name} berhasil didaftarkan ke sistem.${accountNote}`);
      },
      onError: (error) => {
        showToast(apiErrorMessage(error, 'Gagal mendaftarkan guru. Silakan coba lagi.'));
      },
    });
  };

  const handleToggleStatus = (teacherId: string, name: string, next: 'active' | 'inactive') => {
    updateStatus.mutate(
      { id: teacherId, status: next },
      {
        onSuccess: () => {
          showToast(
            next === 'active'
              ? `Status ${name} diubah menjadi Aktif.`
              : `Status ${name} diubah menjadi Nonaktif.`,
          );
        },
        onError: (error) => {
          showToast(apiErrorMessage(error, 'Gagal mengubah status guru.'));
        },
      },
    );
  };

  const handleImportSuccess = (count: number) => {
    showToast(`Berhasil mengimpor dan menyinkronkan ${count} guru ke database sekolah.`);
  };

  const handleExport = () => {
    showToast('Menyiapkan berkas ekspor data guru (.xlsx)...');
    const run = async () => {
      try {
        const { blob, filename } = await downloadTeacherExport();
        saveBlob(blob, filename ?? 'data-guru.xlsx');
      } catch (error: unknown) {
        showToast(apiErrorMessage(error, 'Ekspor guru gagal dilakukan.'));
      }
    };
    void run();
  };

  const filteredTeachers = profiles.filter((teacher) =>
    matchesTabFilters(teacher, selectedRole, selectedEmploymentTypeId),
  );

  const homeroomCount = profiles.filter((t) => t.homeroomClass).length;
  const picketCount = profiles.filter((t) => t.picketDuty).length;
  const adminCount = profiles.filter((t) => t.accessLevel === 'admin').length;
  const activePicketCount = picketPosts.filter((p) => p.isCheckedIn).length;
  const isFilterActive =
    searchQuery !== '' || selectedRole !== 'all' || selectedEmploymentTypeId !== '';

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-50 flex animate-in items-center gap-3 rounded-xl border border-pine-hover bg-pine-deep px-4 py-3 text-white shadow-xl fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
          <span className="text-xs font-medium sm:text-sm">{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage(null);
            }}
            className="ml-2 cursor-pointer text-white/60 hover:text-white"
            aria-label="Tutup notifikasi"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Bento Header & Analytics */}
      <MasterGuruHeader
        totalCount={teachersQuery.data?.total ?? profiles.length}
        homeroomCount={homeroomCount}
        totalRombels={classesQuery.data?.length ?? 0}
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
        selectedEmploymentTypeId={selectedEmploymentTypeId}
        onEmploymentTypeIdChange={setSelectedEmploymentTypeId}
        employmentTypes={employmentTypes}
        totalTeachers={profiles.length}
        homeroomCount={homeroomCount}
        picketCount={picketCount}
        adminCount={adminCount}
        onResetFilters={handleResetFilters}
        isFilterActive={isFilterActive}
      />

      {/* Query status banners */}
      {teachersQuery.isPending && (
        <div className="bg-surface-card text-text-muted mb-4 rounded-xl border border-border-control px-4 py-3 text-xs font-semibold">
          Memuat data guru dari server…
        </div>
      )}
      {teachersQuery.isError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
          <span>{apiErrorMessage(teachersQuery.error, 'Gagal memuat data guru.')}</span>
          <button
            type="button"
            onClick={() => {
              void teachersQuery.refetch();
            }}
            className="cursor-pointer rounded-lg border border-rose-300 px-3 py-1 transition-colors hover:bg-rose-100"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Responsive Table of Teachers */}
      <MasterGuruTable
        teachers={filteredTeachers}
        accounts={accountsByTeacher}
        isStatusUpdating={updateStatus.isPending}
        onToggleStatus={(teacherId, name, next) => {
          handleToggleStatus(teacherId, name, next);
        }}
        onEditTeacher={requestEdit}
        onAssignHomeroom={(teacher) => {
          showToast(`Mengatur kelas wali untuk: ${teacher.name}`);
        }}
        canResetPassword={isAdmin}
        onResetPassword={requestReset}
        canManageAccount={isAdmin}
        onToggleAccountStatus={(teacher, account) => {
          requestAccountStatus(teacher, account);
        }}
      />

      {/* Add Teacher Modal */}
      <MasterGuruAddModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
        }}
        onSubmit={handleAddTeacher}
        availableClasses={(classesQuery.data ?? []).map((cls) => ({ id: cls.id, name: cls.name }))}
        employmentTypes={employmentTypes}
        isSubmitting={createTeacher.isPending}
      />

      {/* Edit Teacher Modal (PUT /teachers/:id — owned by useTeacherEdit) */}
      {editModal}

      {/* Excel Bulk Import & Validation Modal */}
      <MasterGuruImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
        }}
        onImportSuccess={handleImportSuccess}
      />

      {/* Credential reset modal (POST /users/:id/credential-reset — admin only) */}
      {credentialModal(accountsByTeacher, showToast)}

      {/* Login-account status confirm (PATCH /users/:id/status — admin only) */}
      {accountStatusModal(showToast)}
    </div>
  );
}
