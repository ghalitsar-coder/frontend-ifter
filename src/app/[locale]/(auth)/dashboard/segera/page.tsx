import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/libs/I18nNavigation';

type ComingSoonPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ item?: string }>;
};

/**
 * Generate metadata for the placeholder route of unimplemented dashboard features.
 *
 * @param props - Route params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: ComingSoonPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'ComingSoonPage' });

  return {
    title: t('meta_title'),
  };
}

/**
 * Placeholder destination so every sidebar item navigates somewhere honest: it names the clicked
 * menu entry and links back to the dashboard.
 *
 * @param props - Route params and search params carrying the menu label.
 * @returns Placeholder notice inside the dashboard shell.
 */
export default async function ComingSoonPage(props: ComingSoonPageProps) {
  const { locale } = await props.params;
  const { item } = await props.searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ComingSoonPage' });

  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <span className="material-symbols-outlined text-[40px] text-text-muted">construction</span>
      <h1 className="text-xl font-bold text-text-primary">
        {t('title', { item: item ?? t('meta_title') })}
      </h1>
      <p className="max-w-md text-sm text-text-muted">{t('description')}</p>
      <Link
        className="rounded-xl bg-pine-deep px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pine-hover"
        href="/dashboard"
      >
        {t('back')}
      </Link>
    </div>
  );
}
