'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { PendaftaranDocumentsStep } from '@/components/pendaftaran/PendaftaranDocumentsStep';
import { PendaftaranIdentityStep } from '@/components/pendaftaran/PendaftaranIdentityStep';
import { PendaftaranOtpStep } from '@/components/pendaftaran/PendaftaranOtpStep';
import {
  EMPTY_PENDAFTARAN_DRAFT,
  identityIssues,
  nextPendaftaranStep,
} from '@/components/pendaftaran/pendaftaranState';
import type {
  PendaftaranDraft,
  PendaftaranField,
  PendaftaranStep,
} from '@/components/pendaftaran/pendaftaranState';
import { PendaftaranStepRibbon } from '@/components/pendaftaran/PendaftaranStepRibbon';
import { PendaftaranSuccessStep } from '@/components/pendaftaran/PendaftaranSuccessStep';
import { useRouter } from '@/libs/I18nNavigation';

/**
 * School registration wizard: the portal headline, the progress ribbon and whichever of the four
 * steps the teacher is on. Registration is not sent anywhere yet, so the draft only lives here.
 *
 * @returns The current wizard step inside the portal page frame.
 */
export function PendaftaranWizard() {
  const t = useTranslations('PendaftaranPage');
  const router = useRouter();
  const [draft, setDraft] = useState<PendaftaranDraft>(EMPTY_PENDAFTARAN_DRAFT);
  const [step, setStep] = useState<PendaftaranStep>('identitas');
  const [showIssues, setShowIssues] = useState(false);

  const issues = showIssues ? identityIssues(draft) : {};
  const school = { name: draft.name, npsn: draft.npsn };

  return (
    <div className="flex w-full flex-col">
      {step === 'identitas' && (
        <div className="relative w-full overflow-hidden py-space-xl lg:py-space-3xl">
          <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary-fixed/30 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-secondary-fixed/25 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-7xl px-margin">
            <div className="mb-space-2xl max-w-3xl">
              <div className="mb-space-md inline-flex items-center gap-space-xs rounded-full bg-pine-light px-space-sm py-1 text-primary shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                <span className="font-eyebrow text-eyebrow tracking-widest text-primary uppercase">
                  {t('hero_eyebrow')}
                </span>
              </div>
              <h1 className="mb-space-sm font-headline-xl text-headline-xl tracking-tight text-text-primary">
                {t('hero_title')}
              </h1>
              <p className="font-body-lg text-body-lg text-text-muted">{t('hero_desc')}</p>
            </div>
            <PendaftaranStepRibbon issueCount={Object.keys(issues).length} step={step} />
          </div>
        </div>
      )}

      {step !== 'identitas' && step !== 'selesai' && (
        <div className="mx-auto w-full max-w-7xl px-margin pt-space-xl sm:px-gutter">
          <PendaftaranStepRibbon issueCount={0} step={step} />
        </div>
      )}

      {step === 'identitas' && (
        <div className="mx-auto w-full max-w-7xl px-margin pb-space-2xl sm:px-gutter">
          <PendaftaranIdentityStep
            draft={draft}
            issues={issues}
            onChange={(field: PendaftaranField, value: string | boolean) => {
              setDraft({ ...draft, [field]: value });
            }}
            onSubmit={() => {
              if (Object.keys(identityIssues(draft)).length === 0) {
                setStep('dokumen');
                return;
              }
              setShowIssues(true);
            }}
          />
        </div>
      )}

      {step === 'dokumen' && (
        <div className="mx-auto w-full max-w-7xl px-margin pb-space-2xl sm:px-gutter">
          <PendaftaranDocumentsStep
            onBack={() => {
              setStep('identitas');
            }}
            onContinue={() => {
              setStep(nextPendaftaranStep(step, 'next'));
            }}
            school={school}
          />
        </div>
      )}

      {step === 'otp' && (
        <div className="mx-auto w-full max-w-7xl px-margin pb-space-2xl sm:px-gutter">
          <PendaftaranOtpStep
            onBack={() => {
              setStep(nextPendaftaranStep(step, 'back'));
            }}
            onVerified={() => {
              setStep(nextPendaftaranStep(step, 'next'));
            }}
            school={{
              level: draft.level,
              name: draft.name,
              npsn: draft.npsn,
              pic: draft.adminName,
            }}
          />
        </div>
      )}

      {step === 'selesai' && (
        <PendaftaranSuccessStep
          onStart={() => {
            router.push('/presensi');
          }}
        />
      )}
    </div>
  );
}
