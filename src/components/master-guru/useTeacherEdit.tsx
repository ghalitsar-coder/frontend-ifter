'use client';

import { useState } from 'react';
import { apiErrorMessage, useUpdateTeacher } from '@/lib/api/master-guru';
import type { EditTeacherDraft, EmploymentType } from '@/lib/api/master-guru';
import type { TeacherProfile } from '@/types/masterGuru';
import { MasterGuruEditModal } from './MasterGuruEditModal';

/**
 * Owns the edit-teacher dialog (state, PUT /teachers/:id mutation and the
 * seeded draft) so MasterGuruManager stays a thin coordinator.
 *
 * @param employmentTypes - Types offered in the edit form.
 * @param onToast - Toast sink for success/failure messages.
 * @returns Request handler plus the modal element.
 */
export function useTeacherEdit(
  employmentTypes: EmploymentType[],
  onToast: (message: string) => void,
) {
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const updateTeacher = useUpdateTeacher();

  const requestEdit = (target: TeacherProfile) => {
    setTeacher(target);
  };

  const handleSubmit = (draft: EditTeacherDraft) => {
    updateTeacher.mutate(draft, {
      onSuccess: (saved) => {
        setTeacher(null);
        onToast(`Data ${saved.full_name} berhasil diperbarui.`);
      },
      onError: (error) => {
        onToast(apiErrorMessage(error, 'Gagal memperbarui data guru. Silakan coba lagi.'));
      },
    });
  };

  const isEditOpen = teacher !== null;
  const editDraft: EditTeacherDraft | null = isEditOpen
    ? {
        teacherId: teacher.id,
        userId: teacher.userId,
        fullName: teacher.name,
        employeeNumber: teacher.nip === '-' ? '' : teacher.nip,
        email: teacher.email,
        phone: teacher.phone,
        employmentTypeId: teacher.employmentTypeId,
      }
    : null;

  const editModal = (
    <MasterGuruEditModal
      key={teacher === null ? 'edit-modal-closed' : teacher.id}
      isOpen={isEditOpen}
      onClose={() => {
        setTeacher(null);
      }}
      onSubmit={handleSubmit}
      employmentTypes={employmentTypes}
      isSubmitting={updateTeacher.isPending}
      initial={editDraft}
    />
  );

  return { requestEdit, editModal };
}
