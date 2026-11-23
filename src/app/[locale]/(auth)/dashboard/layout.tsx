import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { readBackendToken } from '@/libs/BackendSession';
import { dashboardRoleForRoles, decodeBackendToken } from '@/libs/DashboardAccess';

type DashboardLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: DashboardLayoutProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function DashboardLayout(props: DashboardLayoutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const session = decodeBackendToken(await readBackendToken());
  const role = dashboardRoleForRoles(session?.roles ?? []) ?? 'admin';
  return <DashboardShell role={role}>{props.children}</DashboardShell>;
}
