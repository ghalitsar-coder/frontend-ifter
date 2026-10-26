import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ParentPortalManager } from '@/components/orang-tua/ParentPortalManager';

export type OrangTuaPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Metadata for the parent portal page (hard-coded per repo convention:
 * no new locale keys are allowed for this feature).
 * @returns Page metadata.
 */
export const generateMetadata = (): Metadata => ({
  title: 'Portal Orang Tua',
  description: 'Pantau kehadiran, kedisiplinan, dan dispensasi ananda.',
});

/**
 * Parent portal dashboard page (`parent` role only, backed by GET /parent/*).
 *
 * @param props - Route params including locale.
 * @returns Rendered parent portal page.
 */
export default async function OrangTuaPage(props: OrangTuaPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <ParentPortalManager />;
}
