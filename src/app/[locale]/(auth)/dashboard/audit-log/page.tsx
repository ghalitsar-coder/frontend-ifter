import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuditLogManager } from '@/components/audit/AuditLogManager';

export type AuditLogPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for the audit log page.
 *
 * @param props - Page route params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: AuditLogPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'AuditPage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

/**
 * Admin-only system audit log page.
 *
 * @param props - Route params including locale.
 * @returns Audit log workspace.
 */
export default async function AuditLogPage(props: AuditLogPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <AuditLogManager />;
}
