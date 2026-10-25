'use client';

import { ArrowLeft, BadgeCheck, CheckCircle2, ChevronRight, UserRound, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  mockDispensationDocument,
  mockDispensationEvent,
  mockDispensationStudent,
  mockDispensationSubcategories,
  mockMedicalCertificateStudent,
} from '@/data/mockDispensation';
import {
  canVerifyDispensation,
  dispensationErrorMessage,
  useCreateDispensation,
} from '@/lib/api/izin-dispensasi';
import type { DispensationDto } from '@/lib/api/izin-dispensasi';
import { useStudentSearch } from '@/lib/api/queries';
import { Link } from '@/libs/I18nNavigation';
import type { DispensationCoverage, DispensationSubcategory } from '@/types/dispensation';
import { AttendanceStatementModal } from './AttendanceStatementModal';
import { DispensationCategoryCard } from './DispensationCategoryCard';
import { DispensationEventCard } from './DispensationEventCard';
import { DispensationIdentityCard } from './DispensationIdentityCard';
import { DispensationLetterModal } from './DispensationLetterModal';
import { DispensationLetterPreview } from './DispensationLetterPreview';
import { DispensationQueueCard } from './DispensationQueueCard';
import { DispensationSidebar } from './DispensationSidebar';
import { DispensationUploadCard } from './DispensationUploadCard';
import { DispensationVerifyModal } from './DispensationVerifyModal';
import { MedicalCertificateModal } from './MedicalCertificateModal';

/**
 * Dispensation submission workspace with letter, statement, and medical modals.
 *
 * @returns Dispensation form page.
 */
export function DispensationManager() {
  const t = useTranslations('DispensationPage');
  const { roles } = useAuth();
  const canVerify = canVerifyDispensation(roles);
  const [subcategory, setSubcategory] = useState<DispensationSubcategory['id']>('osn');
  const [coverage, setCoverage] = useState<DispensationCoverage>('full');
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [studentId, setStudentId] = useState('');
  const [pendingDocument, setPendingDocument] = useState<File | null>(null);
  const [verifying, setVerifying] = useState<DispensationDto | null>(null);

  const createDispensation = useCreateDispensation();
  // Shared hook (queries.ts): real student directory to supply the mandatory
  // `student_id` field of POST /dispensations — the mock identity card has no id.
  const studentSearch = useStudentSearch({ limit: 100, status: 'active' });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handlePublish = () => {
    if (studentId === '') {
      showToast('Pilih siswa pada dropdown Pengajuan Nyata sebelum mengirim.');
      return;
    }

    createDispensation.mutate(
      {
        studentId,
        type: 'permit',
        reason: `${mockDispensationEvent.taskLine} — ${mockDispensationEvent.competition}`,
        startDate: mockDispensationEvent.startIso,
        endDate: mockDispensationEvent.endIso,
        document: pendingDocument,
      },
      {
        onSuccess: () => {
          setPendingDocument(null);
          showToast('Dispensasi terkirim ke backend — status menunggu verifikasi.');
        },
        onError: (error) => {
          showToast(dispensationErrorMessage(error, 'Gagal mengirim dispensasi.'));
        },
      },
    );
  };

  return (
    <div className="w-full">
      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-50 flex animate-in items-center gap-3 rounded-xl border border-pine-hover bg-pine-deep px-4 py-3 text-white shadow-xl fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="size-5 shrink-0 text-amber-gold" />
          <span className="text-xs font-medium sm:text-sm">{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage(null);
            }}
            className="ml-2 cursor-pointer text-white/60 hover:text-white"
            aria-label={t('btn_close_notification')}
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <nav
        aria-label={t('breadcrumb_label')}
        className="flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground"
      >
        <span>{t('breadcrumb_dashboard')}</span>
        <ChevronRight className="size-2.5" />
        <span>{t('breadcrumb_presence')}</span>
        <ChevronRight className="size-2.5" />
        <span>{t('breadcrumb_unit')}</span>
        <ChevronRight className="size-2.5" />
        <span className="font-semibold text-foreground">{t('breadcrumb_page')}</span>
      </nav>

      <Link
        href="/dashboard/presensi"
        className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-pine-deep"
      >
        <ArrowLeft className="size-3.5" />
        {t('back_link')}
      </Link>

      <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-light px-2.5 py-1 text-[8px] font-extrabold tracking-wider text-pine-deep uppercase">
              <BadgeCheck className="size-3" />
              {t('portal_badge')}
            </span>
            <span className="rounded-md border border-border-subtle bg-card px-2 py-0.5 font-mono text-[9px] font-bold text-muted-foreground">
              {mockDispensationStudent.requestId}
            </span>
          </div>

          <h1 className="mt-2 text-2xl leading-tight font-extrabold tracking-tight text-foreground sm:text-3xl">
            {t('title')}
          </h1>
          <p className="mt-1.5 max-w-xl text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
            {t('description')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsStatementModalOpen(true);
          }}
          className="flex shrink-0 cursor-pointer items-center gap-2.5 rounded-2xl border border-pine-deep/15 bg-pine-light px-3.5 py-2.5 text-left transition-colors hover:bg-pine-light/70"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-pine-deep text-amber-gold">
            <BadgeCheck className="size-4" />
          </span>
          <span>
            <span className="block text-[8px] font-bold tracking-wider text-muted-foreground uppercase">
              {t('status_label')}
            </span>
            <span className="block text-xs font-extrabold text-pine-deep">
              {mockDispensationStudent.status}
            </span>
          </span>
          <ChevronRight className="ml-1 size-3.5 text-pine-deep" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-pine-deep/15 bg-pine-light/50 px-3 py-2.5">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold tracking-wider text-pine-deep uppercase">
              <UserRound className="size-3" />
              Pengajuan Nyata (POST /dispensations)
            </span>
            <select
              aria-label="Pilih siswa untuk pengajuan dispensasi"
              value={studentId}
              onChange={(event) => {
                setStudentId(event.target.value);
              }}
              className="ml-auto rounded-xl border border-border-control bg-card px-2.5 py-1.5 text-[10px] font-semibold text-foreground focus:border-pine-deep focus:outline-none"
            >
              <option value="">
                {studentSearch.isPending ? 'Memuat siswa…' : '— Pilih siswa —'}
              </option>
              {(studentSearch.data ?? []).map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name} · {student.student_number}
                  {student.current_class === undefined ? '' : ` · ${student.current_class.name}`}
                </option>
              ))}
            </select>
          </div>

          <DispensationIdentityCard student={mockDispensationStudent} />

          <DispensationCategoryCard
            subcategories={mockDispensationSubcategories}
            selectedSubcategory={subcategory}
            onSubcategoryChange={setSubcategory}
            onOpenDoctorNote={() => {
              setIsMedicalModalOpen(true);
            }}
          />

          <DispensationEventCard
            event={mockDispensationEvent}
            coverage={coverage}
            onCoverageChange={setCoverage}
          />

          <DispensationUploadCard
            document={mockDispensationDocument}
            onPreview={() => {
              showToast(t('toast_view_file'));
            }}
            onReplace={() => {
              setIsLetterModalOpen(true);
            }}
            onExtraFile={(file) => {
              // Real file captured for the multipart `document` part of POST /dispensations.
              setPendingDocument(file);
              showToast(`File disiapkan untuk pengajuan: ${file.name}`);
            }}
          />

          <div className="flex flex-col-reverse gap-2 rounded-2xl border border-border-subtle bg-card p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => {
                showToast(t('toast_cancelled'));
              }}
              className="cursor-pointer text-left text-[11px] font-semibold text-muted-foreground transition-colors hover:text-red-600 sm:px-2"
            >
              {t('btn_cancel')}
            </button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  // shortcut: no backend draft state (status enum is pending|approved|rejected), keep local toast
                  showToast(t('toast_draft'));
                }}
                className="cursor-pointer rounded-xl border border-border-control bg-card px-4 py-2 text-[11px] font-semibold text-foreground transition-colors hover:bg-surface-container-low"
              >
                {t('btn_save_draft')}
              </button>
              <button
                type="button"
                disabled={createDispensation.isPending}
                onClick={handlePublish}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <BadgeCheck className="size-3.5 text-amber-gold" />
                {createDispensation.isPending ? 'Mengirim…' : t('btn_publish')}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <DispensationLetterPreview
            student={mockDispensationStudent}
            event={mockDispensationEvent}
            onDownload={() => {
              // shortcut: generated letter preview is mock-only; real documents
              // are downloaded per row via GET /dispensations/:id/document in the queue.
              showToast(t('toast_download'));
            }}
          />

          <DispensationSidebar
            student={mockDispensationStudent}
            onContactCoach={() => {
              showToast(t('toast_contact'));
            }}
          />
        </div>
      </div>

      <div className="mt-3">
        <DispensationQueueCard
          canVerify={canVerify}
          onToast={showToast}
          onVerifyRequest={setVerifying}
        />
      </div>

      {verifying !== null && (
        <DispensationVerifyModal
          dispensation={verifying}
          onClose={() => {
            setVerifying(null);
          }}
          onVerified={showToast}
        />
      )}

      {isLetterModalOpen && (
        <DispensationLetterModal
          student={mockDispensationStudent}
          event={mockDispensationEvent}
          document={mockDispensationDocument}
          onClose={() => {
            setIsLetterModalOpen(false);
          }}
          onSubmit={() => {
            setIsLetterModalOpen(false);
            showToast(t('toast_letter_saved'));
          }}
        />
      )}

      {/* shortcut: statement letter and medical-certificate variants have no
          backend endpoint in wave 2 (dispensations cover type/status only),
          keep the AttendanceStatementModal / MedicalCertificateModal mocks. */}
      {isStatementModalOpen && (
        <AttendanceStatementModal
          student={mockDispensationStudent}
          event={mockDispensationEvent}
          document={mockDispensationDocument}
          coverage={coverage}
          onClose={() => {
            setIsStatementModalOpen(false);
          }}
          onSubmit={() => {
            setIsStatementModalOpen(false);
            showToast(t('toast_statement_saved'));
          }}
        />
      )}

      {isMedicalModalOpen && (
        <MedicalCertificateModal
          student={mockMedicalCertificateStudent}
          onClose={() => {
            setIsMedicalModalOpen(false);
          }}
          onSubmit={() => {
            setIsMedicalModalOpen(false);
            showToast(t('toast_medical_saved'));
          }}
        />
      )}
    </div>
  );
}
