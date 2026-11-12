import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RecapDashboard } from '@/components/rekap/RecapDashboard';
import { readBackendToken } from '@/libs/BackendSession';
import { redirect } from '@/libs/I18nNavigation';

type DashboardRecapPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: DashboardRecapPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'RecapPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function DashboardRecapPage(props: DashboardRecapPageProps) {
  const [{ locale }, searchParams] = await Promise.all([props.params, props.searchParams]);
  setRequestLocale(locale);

  if ((await readBackendToken()) === undefined) {
    redirect({ href: '/sign-in', locale });
  }

  const role = Array.isArray(searchParams.role) ? searchParams.role[0] : searchParams.role;
  const readOnly = role === 'kepsek' || role === 'kepala_sekolah';
  return <RecapDashboard readOnly={readOnly} />;
}
