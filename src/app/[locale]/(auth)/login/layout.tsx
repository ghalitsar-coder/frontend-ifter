import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AttendlyShell } from '@/components/presensi/AttendlyShell';

type LoginLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for the Attendly login route.
 *
 * @param props - Route params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: LoginLayoutProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'PresensiPage' });

  return {
    title: t('login_meta_title'),
    description: t('login_meta_description'),
  };
}

/**
 * Attendly shell of the login route.
 *
 * @param props - Layout children and route params.
 * @returns Login shell.
 */
export default async function LoginLayout(props: LoginLayoutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <AttendlyShell>{props.children}</AttendlyShell>;
}
