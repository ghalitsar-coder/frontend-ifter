'use client';

import { CheckCircle2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { activateAccount } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { useRouter } from '@/libs/I18nNavigation';
import { getI18nPath } from '@/utils/Helpers';

/**
 * Public account activation form (POST /auth/activate). A one-time token —
 * an invite from student/staff provisioning or a password reset from the
 * admin — is exchanged for a new password (min. 12 characters), then the
 * user is sent to sign-in. A `?token=` query param pre-fills the token so an
 * activation link can be shared directly.
 *
 * @returns The activation card element.
 */
export function ActivateForm() {
  const router = useRouter();
  const locale = useLocale();
  // A `?token=` deep link pre-fills the field. useSearchParams defers this
  // subtree to client rendering (Suspense), so window is available here.
  const searchParams = useSearchParams();
  const [token, setToken] = useState(() => searchParams.get('token') ?? '');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [activated, setActivated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await activateAccount(token.trim(), password);
      setActivated(true);
      setTimeout(() => {
        router.replace(getI18nPath('/sign-in', locale));
      }, 2500);
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : 'Terjadi kesalahan. Coba lagi beberapa saat.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Aktivasi Akun</CardTitle>
        <CardDescription>
          Gunakan token sekali pakai dari administrator untuk mengatur password akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activated ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="size-10 text-emerald-600" />
            <p className="text-sm font-semibold">
              Akun berhasil diaktivasi. Mengalihkan ke halaman masuk…
            </p>
          </div>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="activate-token">Token aktivasi</Label>
              <Input
                id="activate-token"
                name="token"
                required
                autoComplete="one-time-code"
                value={token}
                onChange={(event) => {
                  setToken(event.target.value);
                }}
                placeholder="Tempel token dari admin"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="activate-password">Password baru</Label>
              <Input
                id="activate-password"
                name="password"
                type="password"
                required
                minLength={12}
                autoComplete="new-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
              />
              <p className="text-xs text-neutral-500">Minimal 12 karakter.</p>
            </div>

            {formError !== null && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={submitting || token.trim() === ''}>
              {submitting ? <Spinner className="size-4" /> : 'Aktivasi Akun'}
            </Button>

            <p className="text-center text-xs text-neutral-500">
              Token invite maupun reset hanya berlaku satu kali.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
