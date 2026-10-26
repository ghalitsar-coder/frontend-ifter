import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AttendlyShell } from '@/components/presensi/AttendlyShell';
import { PresensiLoginScreen } from '@/components/presensi/PresensiLoginScreen';
import { readBackendToken } from '@/libs/BackendSession';
import { redirect } from '@/libs/I18nNavigation';

type SignInPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for the Attendly sign-in route.
 *
 * @param props - Route params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: SignInPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'SignIn' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

/**
 * Sign-in route of the Attendly portal: the credential screen on its own URL, and a signed-in
 * browser is sent straight to the attendance workspace.
 *
 * @param props - Route params including locale.
 * @returns Login screen inside the Attendly shell.
 */
export default async function SignInPage(props: SignInPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  if (await readBackendToken()) {
    redirect({ href: '/presensi', locale });
  }

  return (
    <AttendlyShell>
      <PresensiLoginScreen />
    </AttendlyShell>
  );
}
