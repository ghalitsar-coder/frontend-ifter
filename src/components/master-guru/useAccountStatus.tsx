'use client';

import { useState } from 'react';
import type { TeacherAccount } from '@/lib/api/master-guru';
import type { TeacherProfile } from '@/types/masterGuru';
import { MasterGuruAccountStatusModal } from './MasterGuruAccountStatusModal';

/**
 * Owns the login-account status dialog selection for MasterGuruManager so the
 * manager stays within the lint complexity cap.
 *
 * @returns Dialog request handler plus modal renderer.
 */
export function useAccountStatus() {
  const [target, setTarget] = useState<{
    teacher: TeacherProfile;
    account: TeacherAccount;
  } | null>(null);

  const requestAccountStatus = (teacher: TeacherProfile, account: TeacherAccount) => {
    setTarget({ teacher, account });
  };

  /**
   * The modal element, rendered only while an account is selected.
   * @param onToast - Toast sink for success/failure messages.
   * @returns Modal JSX or null.
   */
  const accountStatusModal = (onToast: (message: string) => void) =>
    target === null ? null : (
      <MasterGuruAccountStatusModal
        userId={target.account.id}
        username={target.account.username}
        teacherName={target.teacher.name}
        currentStatus={target.account.status}
        onClose={() => {
          setTarget(null);
        }}
        onToast={onToast}
      />
    );

  return { requestAccountStatus, accountStatusModal };
}
