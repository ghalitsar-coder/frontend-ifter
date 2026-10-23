import { setRequestLocale } from 'next-intl/server';
import { AttendlyDashboardOverview } from '@/components/dashboard/AttendlyDashboardOverview';

export type DashboardPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Main dashboard executive summary overview page.
 *
 * @param props - Page route params.
 * @returns Rendered dashboard overview.
 */
export default async function DashboardPage(props: DashboardPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <AttendlyDashboardOverview />;
}
