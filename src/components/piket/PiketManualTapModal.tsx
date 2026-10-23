import { AlertTriangle, CheckCircle2, Radio, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { TapStatus } from '@/types/piket';

type SampleStudent = {
  nis: string;
  name: string;
  className: string;
  photoUrl: string;
};

const SAMPLE_STUDENTS: SampleStudent[] = [
  {
    nis: '232408099',
    name: 'Nadhif Al-Faruq',
    className: 'Kelas VIII B',
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCP3Q5KAlHaSR5M3SMcQ4R8XXq2zWJhN-fDRd7Um-dC2umSfw9SzenHV1GKouoSFCLgePjbd5MWaZ-tRWn0Wpnq8NivfLvlKhKi8aKQT__mKLtDEhxV4IytxKdvQcv33sYP_Jzm7KL8wrjDm9csbv13TSAfrpXKtYib9ekRPFOv6PHRaCJhXpl0A5i2LxM77bb40Au_jJGZPQDlFakGTawjg7eB_276PJeF569Rid57tFuCEhxJT4tSmw',
  },
  {
    nis: '242507045',
    name: 'Tiara Amanda',
    className: 'Kelas VII A',
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBO0Xrp_4p-ctFbTHjjz8NdACTkO-CRE_pikwcaHR3HQtX4VCCfDwd_QE7OutmflDa9m2Z4sPFZZyBDvUNsvTeGMx6YKTrgVMtvXvxAuDMFSpgw6sGxNSRIGqnaYLbriK93FSN7kmD8CvWuFTlb520SVs8TeQp1Z8J-CU2MoN73rFif6NfW-gpkVVmbALvAj4gSVo4GWUwl_ywLrRqXV7bcHE4bkVIrh6nfPCu92tCRkPMy3VPScA2N5Q',
  },
  {
    nis: '222309033',
    name: 'Bima Satria',
    className: 'Kelas IX C',
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBLUViR1L6H0tE4HJfXmkE9cQXlG5aYAemlOiQOSk_89aEF6miTjiAntx3FbPm6rW6QhGnl6N4MNH_uET0tx7bUTdHQP4c47b8RLpfIm9jVseOzJ3OOzt3BPgkpEA8UDDqMY0JCpbOHnM3TpeI_h-7BcCJ7cMHdT_3J0mobPlI13VyX7-NiPMWGJDcRYA1W3gcENBW4bFSUj63rLT_JcaNoJ97H-yNFeZ1Xto6rxHBKAr-7WmIJGUhcjQ',
  },
];

const DEFAULT_STUDENT: SampleStudent = SAMPLE_STUDENTS[0] ?? {
  nis: '',
  name: '',
  className: '',
  photoUrl: '',
};

/**
 * Interactive RFID Card / Barcode Scanner Simulator Modal.
 * @param props - Component properties.
 * @returns Rendered simulation modal.
 */
export function PiketManualTapModal(props: {
  isOpen: boolean;
  onClose: () => void;
  onSimulateTap: (payload: {
    nis: string;
    studentName: string;
    className: string;
    photoUrl: string;
    readerName: string;
    status: TapStatus;
  }) => void;
}) {
  const t = useTranslations('PiketPage');

  const [selectedStudentIdx, setSelectedStudentIdx] = useState(0);
  const [selectedReader, setSelectedReader] = useState('Gerbang Reader 1');

  if (!props.isOpen) {
    return null;
  }

  const currentStudent = SAMPLE_STUDENTS[selectedStudentIdx] ?? DEFAULT_STUDENT;

  const handleSimulate = (status: TapStatus) => {
    props.onSimulateTap({
      nis: currentStudent.nis,
      studentName: currentStudent.name,
      className: currentStudent.className,
      photoUrl: currentStudent.photoUrl,
      readerName: selectedReader,
      status,
    });
    props.onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-surface-card relative w-full max-w-lg overflow-hidden rounded-2xl p-6 shadow-2xl">
        <button
          className="text-text-muted hover:text-text-primary absolute top-4 right-4 transition-colors"
          type="button"
          onClick={() => {
            props.onClose();
          }}
        >
          <X className="size-5" />
        </button>

        <div className="mb-4 flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-pine-light text-pine-deep">
            <Radio className="size-5" />
          </div>
          <div>
            <h3 className="text-text-primary text-base font-bold">{t('modal_tap_title')}</h3>
            <p className="font-caption text-text-muted text-xs">{t('modal_tap_desc')}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Select Student */}
          <div className="space-y-1.5">
            <label
              className="text-text-primary block text-xs font-semibold"
              htmlFor="sample-student-select"
            >
              {t('modal_tap_select_student')}
            </label>
            <select
              id="sample-student-select"
              className="bg-canvas-base text-text-primary h-11 w-full rounded-xl px-3 text-xs font-medium shadow-inner focus:outline-none"
              value={selectedStudentIdx}
              onChange={(e) => {
                setSelectedStudentIdx(Number(e.target.value));
              }}
            >
              {SAMPLE_STUDENTS.map((s, idx) => (
                <option key={s.nis} value={idx}>
                  {s.name} ({s.className} - NIS: {s.nis})
                </option>
              ))}
            </select>
          </div>

          {/* Select Reader */}
          <div className="space-y-1.5">
            <label
              className="text-text-primary block text-xs font-semibold"
              htmlFor="sample-reader-select"
            >
              {t('modal_tap_select_gate')}
            </label>
            <select
              id="sample-reader-select"
              className="bg-canvas-base text-text-primary h-11 w-full rounded-xl px-3 text-xs font-medium shadow-inner focus:outline-none"
              value={selectedReader}
              onChange={(e) => {
                setSelectedReader(e.target.value);
              }}
            >
              <option value="Gerbang Reader 1">Gerbang Reader 1 (Pintu Barat A)</option>
              <option value="Gerbang Reader 2">Gerbang Reader 2 (Pintu Barat B)</option>
              <option value="Gerbang Reader 3">Gerbang Reader 3 (Pintu Pejalan Kaki)</option>
              <option value="Gerbang Reader 4">Gerbang Reader 4 (Pintu Timur)</option>
            </select>
          </div>

          {/* Action Simulation Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700"
              type="button"
              onClick={() => {
                handleSimulate('on_time');
              }}
            >
              <CheckCircle2 className="size-4" />
              <span>{t('modal_tap_simulate_ontime')}</span>
            </button>

            <button
              className="bg-error flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors hover:bg-red-700"
              type="button"
              onClick={() => {
                handleSimulate('late');
              }}
            >
              <AlertTriangle className="size-4" />
              <span>{t('modal_tap_simulate_late')}</span>
            </button>
          </div>

          <div className="pt-2 text-center">
            <button
              className="text-text-muted hover:text-text-primary text-xs font-medium"
              type="button"
              onClick={() => {
                props.onClose();
              }}
            >
              {t('btn_cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
