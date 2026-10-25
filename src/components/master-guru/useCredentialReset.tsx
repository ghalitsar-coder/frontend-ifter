'use client';

import { useState } from 'react';
import type { TeacherAccount } from '@/lib/api/master-guru';
import type { TeacherProfile } from '@/types/masterGuru';
import { MasterGuruCredentialModal } from './MasterGuruCredentialModal';

/**
 * Owns the "reset password" dialog selection for MasterGuruManager (keeps the
 * manager under the lint complexity cap): `requestReset` is the table callback,
 * `credentialModal` renders the dialog for whichever teacher requested one.
 *
 * @returns Reset handler plus modal renderer.
 */
export function useCredentialReset() {
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);

  const requestReset = (target: TeacherProfile) => {
    setTeacher(target);
  };

  /**
   * The modal element, rendered only while a teacher is selected.
   * @param accountsByTeacher - Teacher id to linked account lookup.
   * @param onToast - Toast sink for success/failure messages.
   * @returns Modal JSX or null.
   */
  const credentialModal = (
    accountsByTeacher: Record<string, TeacherAccount>,
    onToast: (message: string) => void,
  ) =>
    teacher === null ? null : (
      <MasterGuruCredentialModal
        userId={teacher.userId ?? ''}
        username={accountsByTeacher[teacher.id]?.username ?? ''}
        teacherName={teacher.name}
        onClose={() => {
          setTeacher(null);
        }}
        onToast={onToast}
      />
    );

  return { requestReset, credentialModal };
}
