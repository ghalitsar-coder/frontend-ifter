'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { isStudentOnly } from '@/lib/api/rbac';
import { Link, useRouter } from '@/libs/I18nNavigation';
import { getI18nPath } from '@/utils/Helpers';

/**
 * Credential sign-in form replacing the former Clerk <SignIn /> widget.
 * Calls POST /auth/login, then redirects to the dashboard — student-only
 * accounts go to their `/dashboard/murid` portal instead of the staff shell.
 * @returns The sign-in card element.
 */
export function SignInForm() {
  const t = useTranslations('SignIn');
  const router = useRouter();
  const locale = useLocale();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const user = await login(username, password);
      const target = isStudentOnly(user.roles) ? '/dashboard/murid' : '/dashboard';
      router.replace(getI18nPath(target, locale));
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
        <CardTitle>{t('meta_title')}</CardTitle>
        <CardDescription>{t('meta_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-username">Username</Label>
            <Input
              id="login-username"
              name="login"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            />
          </div>

          {formError !== null && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Spinner className="size-4" /> : t('meta_title')}
          </Button>

          <p className="text-center text-xs text-neutral-500">
            Akun dibuat oleh administrator sekolah. Punya token aktivasi atau reset?{' '}
            <Link
              href="/aktivasi"
              className="font-semibold underline underline-offset-2 hover:text-neutral-700"
            >
              Aktivasi akun
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
