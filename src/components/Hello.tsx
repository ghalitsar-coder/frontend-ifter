import { getTranslations } from 'next-intl/server';

/**
 * Greeting shown on the dashboard home route.
 *
 * @returns Localized welcome line.
 */
export const Hello = async () => {
  const t = await getTranslations('Dashboard');

  return <p>{t('hello_message')}</p>;
};
