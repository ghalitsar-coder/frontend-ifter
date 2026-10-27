import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AttendlyShell } from '@/components/presensi/AttendlyShell';

type PendaftaranLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for the school registration route.
 *
 * @param props - Route params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: PendaftaranLayoutProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'PendaftaranPage' });

  return {
    description: t('meta_description'),
    title: t('meta_title'),
  };
}

/**
 * Attendly shell of the public school registration route.
 *
 * @param props - Layout children and route params.
 * @returns Registration shell with no signed-in account block.
 */
export default async function PendaftaranLayout(props: PendaftaranLayoutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <AttendlyShell>{props.children}</AttendlyShell>;
}
