import { setRequestLocale } from 'next-intl/server';
import { StaffQrScanWorkspace } from '@/components/presensi/StaffQrScanWorkspace';
import { readBackendToken } from '@/libs/BackendSession';
import { decodeBackendToken, isAllowedPage } from '@/libs/DashboardAccess';
import { redirect } from '@/libs/I18nNavigation';

export default async function DashboardAbsenPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = decodeBackendToken(await readBackendToken());

  if (session === null || session.expired) {
    return redirect({ href: '/sign-in', locale: params.locale });
  }

  if (!isAllowedPage(session.roles, 'absen')) {
    return redirect({ href: '/dashboard', locale: params.locale });
  }

  return (
    <div className="attendly text-body-md text-on-surface">
      <StaffQrScanWorkspace />
    </div>
  );
}
