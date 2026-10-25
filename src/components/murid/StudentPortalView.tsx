'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api/client';
import { useMyProfile } from '@/lib/api/murid';
import { MuridAttendanceCard } from './MuridAttendanceCard';
import { MuridDisciplineCard } from './MuridDisciplineCard';
import { MuridDispensationCard } from './MuridDispensationCard';

/**
 * GET /my/profile answers 403 (`forbidden`) while no active student row is linked to the login.
 * @param error - The react-query error thrown by `useMyProfile`.
 * @returns Whether the message should be the account-not-linked notice.
 */
const isAccountNotLinked = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 403;

/**
 * Student self-service portal (`/dashboard/murid`) — the only surface a
 * `student`-role account reaches after sign-in. Composes the `/my/*` cards:
 * 30-day attendance summary (GET /my/attendance-summary), discipline records
 * (GET /my/discipline) and the dispensation list with its create form
 * (GET/POST /my/dispensations). Staff navigation stays hidden for this role —
 * AttendlyShell gates the menu and bounces student-only accounts here.
 * @returns The portal JSX.
 */
export function StudentPortalView() {
  const auth = useAuth();
  const profile = useMyProfile();

  if (profile.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (profile.isError && isAccountNotLinked(profile.error)) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Akun login Anda belum terhubung ke data siswa aktif. Hubungi bagian Tata Usaha atau
          administrator sekolah untuk menautkan akun sebelum membuka portal ini.
        </AlertDescription>
      </Alert>
    );
  }

  const className = profile.data?.class_name;

  return (
    <div className="space-y-6">
      {/* Identity header */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-5">
          <div>
            <h1 className="text-lg font-extrabold text-[#173F36]">
              {profile.data?.full_name ?? auth.user?.full_name ?? 'Portal Siswa'}
            </h1>
            <p className="text-xs text-[#6E7A76]">
              NIS {profile.data?.student_number ?? '—'}
              {typeof className === 'string' ? ` • Kelas ${className}` : ''}
            </p>
          </div>
          <Badge variant="secondary" className="bg-[#E9F0EE] text-[#173F36]">
            Portal Siswa
          </Badge>
        </CardContent>
      </Card>

      <MuridAttendanceCard />
      <MuridDisciplineCard />
      <MuridDispensationCard />
    </div>
  );
}
