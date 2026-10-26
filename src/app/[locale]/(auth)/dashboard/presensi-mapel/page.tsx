import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PresensiMapelManager } from '@/components/presensi-mapel/PresensiMapelManager';

export type PresensiMapelPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Metadata for the per-subject attendance page (hard-coded per repo convention:
 * no new locale keys are allowed for this feature).
 * @returns Page metadata.
 */
export const generateMetadata = (): Metadata => ({
  title: 'Presensi Mapel',
  description: 'Catat absensi per mata pelajaran dan rekap kehadiran per penugasan.',
});

/**
 * Per-subject attendance page: sessions for the ops roles, recap for everyone
 * with report read access.
 *
 * @param props - Route params including locale.
 * @returns Rendered subject-attendance page.
 */
export default async function PresensiMapelPage(props: PresensiMapelPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <PresensiMapelManager />;
}
