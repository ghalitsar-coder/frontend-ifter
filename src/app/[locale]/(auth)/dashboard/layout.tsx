import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AttendlyShell } from '@/components/layout/AttendlyShell';
import { academicPeriodLabel, SCHOOL_TIME_ZONE } from '@/utils/SchoolPeriod';

type DashboardLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for dashboard layout.
 *
 * @param props - Layout params.
 * @returns Metadata object.
 */
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

/**
 * Attendly school dashboard application shell layout.
 *
 * AuthProvider performs the client-side session gate (refresh + /auth/me) and
 * redirects unauthenticated visitors to sign-in; the HttpOnly refresh cookie
 * is not readable here in cross-origin dev setups, so no server check.
 *
 * @param props - Layout properties.
 * @returns Shell layout wrapping dashboard pages.
 */
export default async function DashboardLayout(props: DashboardLayoutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const now = new Date();
  const todayLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: SCHOOL_TIME_ZONE,
  }).format(now);

  return (
    <AuthProvider>
      <AttendlyShell periodLabel={academicPeriodLabel(now)} todayLabel={todayLabel}>
        {props.children}
      </AttendlyShell>
    </AuthProvider>
  );
}
