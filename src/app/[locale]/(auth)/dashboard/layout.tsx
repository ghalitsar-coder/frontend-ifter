import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AttendlyShell } from '@/components/layout/AttendlyShell';

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
 * @param props - Layout properties.
 * @returns Shell layout wrapping dashboard pages.
 */
export default async function DashboardLayout(props: DashboardLayoutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const user = await currentUser();

  return (
    <AttendlyShell userEmail={user?.primaryEmailAddress?.emailAddress}>
      {props.children}
    </AttendlyShell>
  );
}
