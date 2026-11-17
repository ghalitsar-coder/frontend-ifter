import { setRequestLocale } from 'next-intl/server';
import { StaffQrWorkspace } from '@/components/presensi/StaffQrWorkspace';
import { readBackendToken } from '@/libs/BackendSession';
import { redirect } from '@/libs/I18nNavigation';

type DashboardQrPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardQrPage(props: DashboardQrPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  if ((await readBackendToken()) === undefined) {
    redirect({ href: '/sign-in', locale });
  }

  return (
    <div className="attendly text-body-md text-on-surface">
      <StaffQrWorkspace />
    </div>
  );
}
