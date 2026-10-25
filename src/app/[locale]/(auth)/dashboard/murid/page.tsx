import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StudentPortalView } from '@/components/murid/StudentPortalView';

export type MuridPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for the student portal page.
 *
 * @param props - Layout params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: MuridPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  return {
    title: `Portal Siswa • ${t('meta_title')}`,
    description: 'Rekap presensi, kedisiplinan, dan pengajuan dispensasi mandiri siswa.',
  };
}

/**
 * Student self-service portal page (`/dashboard/murid`).
 *
 * The only route a `student`-role account reaches after sign-in: it renders
 * the `/my/*` backend data (attendance summary, discipline records,
 * dispensations + create form). Staff pages stay hidden and the shell
 * redirects student-only accounts here.
 *
 * @param props - Route params including locale.
 * @returns Rendered student portal.
 */
export default async function MuridPage(props: MuridPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <StudentPortalView />;
}
