import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { DeviceManager } from '@/components/perangkat/DeviceManager';

export type PerangkatPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Metadata for the device registry page (hard-coded per repo convention:
 * no new locale keys are allowed for this feature).
 * @returns Page metadata.
 */
export const generateMetadata = (): Metadata => ({
  title: 'Registry Perangkat',
  description: 'Kelola pembaca RFID, gerbang, dan tablet yang terhubung ke sekolah.',
});

/**
 * Device registry dashboard page (admin-only API surface).
 *
 * @param props - Route params including locale.
 * @returns Rendered device registry page.
 */
export default async function PerangkatPage(props: PerangkatPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <DeviceManager />;
}
