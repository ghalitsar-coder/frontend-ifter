'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Read-only profile view backed by GET /auth/me (through the AuthProvider
 * session). Password/credential changes are admin-driven (credential reset).
 * @returns The profile card element.
 */
export function UserProfileView() {
  const { user } = useAuth();

  return (
    <Card className="my-6 w-full max-w-xl">
      <CardHeader>
        <CardTitle>Profil Akun</CardTitle>
        <CardDescription>
          Data akun dibaca dari endpoint /auth/me. Untuk perubahan kata sandi, hubungi administrator
          sekolah.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-neutral-100 pb-2">
          <span className="text-neutral-500">Nama lengkap</span>
          <span className="font-semibold">{user?.full_name ?? '-'}</span>
        </div>
        <div className="flex justify-between gap-4 border-b border-neutral-100 pb-2">
          <span className="text-neutral-500">Username</span>
          <span className="font-mono">{user?.username ?? '-'}</span>
        </div>
        <div className="flex justify-between gap-4 border-b border-neutral-100 pb-2">
          <span className="text-neutral-500">Email</span>
          <span>{user?.email ?? '-'}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-neutral-500">Peran</span>
          <span className="flex flex-wrap justify-end gap-1.5">
            {(user?.roles ?? []).map((role) => (
              <Badge key={role} variant="secondary">
                {role}
              </Badge>
            ))}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
