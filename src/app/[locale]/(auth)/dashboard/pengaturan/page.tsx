import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SettingsManager } from '@/components/pengaturan/SettingsManager';

export type SettingsPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for the system settings page.
 *
 * @param props - Page route params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: SettingsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'SettingsPage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

/**
 * Operational policy settings dashboard page.
 *
 * @param props - Route params including locale.
 * @returns Rendered settings workspace.
 */
export default async function SettingsPage(props: SettingsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <SettingsManager />;
}
