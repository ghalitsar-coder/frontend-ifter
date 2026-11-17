import { setRequestLocale } from 'next-intl/server';
import { StaffQrScanWorkspace } from '@/components/presensi/StaffQrScanWorkspace';
import { readBackendToken } from '@/libs/BackendSession';
import { redirect } from '@/libs/I18nNavigation';

type DashboardStaffQrScanPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardStaffQrScanPage(props: DashboardStaffQrScanPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  if ((await readBackendToken()) === undefined) {
    redirect({ href: '/sign-in', locale });
  }

  return (
    <div className="attendly text-body-md text-on-surface">
      <StaffQrScanWorkspace />
    </div>
  );
}
