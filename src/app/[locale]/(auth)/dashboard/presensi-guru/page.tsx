import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TeacherPresenceManager } from '@/components/presensi-guru/TeacherPresenceManager';

export type TeacherPresencePageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for the teacher presence portal.
 *
 * @param props - Page route params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: TeacherPresencePageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'TeacherPresencePage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

/**
 * Teacher self check-in portal page with geofence and schedule context.
 *
 * @param props - Route params including locale.
 * @returns Rendered teacher presence portal.
 */
export default async function TeacherPresencePage(props: TeacherPresencePageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <TeacherPresenceManager />;
}
