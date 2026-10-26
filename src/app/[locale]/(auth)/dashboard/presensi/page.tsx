import { setRequestLocale } from 'next-intl/server';
import { PresensiAuthGate } from '@/components/presensi/PresensiAuthGate';
import { readBackendToken } from '@/libs/BackendSession';
import { redirect } from '@/libs/I18nNavigation';

type DashboardPresensiPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Daily attendance workspace inside the dashboard shell; unauthenticated visits are sent to the
 * sign-in route before any backend query runs.
 *
 * @param props - Route params including locale.
 * @returns The attendance workspace behind the session gate.
 */
export default async function DashboardPresensiPage(props: DashboardPresensiPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  if ((await readBackendToken()) === undefined) {
    redirect({ href: '/sign-in', locale });
  }

  return (
    <div className="attendly text-body-md text-on-surface">
      <PresensiAuthGate />
    </div>
  );
}
