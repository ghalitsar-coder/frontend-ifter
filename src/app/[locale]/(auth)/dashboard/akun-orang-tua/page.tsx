import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ParentAccountManager } from '@/components/orang-tua/ParentAccountManager';

export type AkunOrangTuaPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Metadata for the admin parent-account page (hard-coded per repo convention:
 * no new locale keys are allowed for this feature).
 * @returns Page metadata.
 */
export const generateMetadata = (): Metadata => ({
  title: 'Akun Orang Tua',
  description: 'Buat akun portal orang tua, terbitkan token akses, dan tautkan anak.',
});

/**
 * Admin parent-account page (admin-only API surface).
 *
 * @param props - Route params including locale.
 * @returns Rendered parent-account management page.
 */
export default async function AkunOrangTuaPage(props: AkunOrangTuaPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <ParentAccountManager />;
}
