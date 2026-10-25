import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ActivateForm } from '@/components/auth/ActivateForm';

export type ActivatePageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for the public account activation page.
 *
 * @param props - Page route params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: ActivatePageProps): Promise<Metadata> {
  const { locale } = await props.params;

  return {
    title: locale === 'fr' ? 'Activation du compte - Attendly' : 'Account activation - Attendly',
    description:
      locale === 'fr'
        ? 'Activez votre compte avec le jeton à usage unique fourni par l’administrateur.'
        : 'Activate your account with the one-time token handed out by the school administrator.',
  };
}

/**
 * Public page where invite and reset tokens become a working password.
 *
 * @param props - Route params including locale.
 * @returns Rendered activation form.
 */
export default async function ActivatePage(props: ActivatePageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <ActivateForm />;
}
