import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AttendlyShell } from '@/components/presensi/AttendlyShell';
import { readBackendToken } from '@/libs/BackendSession';
import { redirect } from '@/libs/I18nNavigation';

type PresensiLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for the Attendly attendance route.
 *
 * @param props - Route params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: PresensiLayoutProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'PresensiPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

/**
 * Attendly shell of the daily attendance route.
 *
 * @param props - Layout children and route params.
 * @returns Attendance shell.
 */
export default async function PresensiLayout(props: PresensiLayoutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  if ((await readBackendToken()) === undefined) {
    redirect({ href: '/sign-in', locale });
  }

  return <AttendlyShell signedIn>{props.children}</AttendlyShell>;
}
