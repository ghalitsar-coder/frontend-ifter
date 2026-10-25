import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { CtaSection } from '@/components/landing/CtaSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { GallerySection } from '@/components/landing/GallerySection';
import { HeroSection } from '@/components/landing/HeroSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { TrustSection } from '@/components/landing/TrustSection';
import { WorkflowSection } from '@/components/landing/WorkflowSection';

type IndexPageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: 'Attendly — Presensi & Disiplin Sekolah',
  description:
    'Catat kehadiran siswa dan guru dalam hitungan detik, validasi otomatis via QR atau daftar murid terpadu, serta rekapitulasi poin kedisiplinan dan integrasi Dapodik.',
};

export default async function IndexPage(props: IndexPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div
      className="attendly-landing min-h-screen bg-surface font-body-md text-on-surface antialiased"
      id="beranda"
      lang="id"
    >
      <LandingHeader />
      <main className="min-h-[calc(100vh-20rem)] w-full bg-surface pt-20">
        <div className="flex w-full flex-col overflow-hidden">
          <HeroSection />
          <TrustSection />
          <FeaturesSection />
          <WorkflowSection />
          <GallerySection />
          <TestimonialsSection />
          <CtaSection />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
