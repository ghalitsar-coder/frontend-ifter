import { CheckCircle2, UserCog, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { EditTeacherDraft, EmploymentType } from '@/lib/api/master-guru';

/** Teacher fields the Edit modal starts from (a mapped UI profile). */
export type EditTeacherInitial = {
  teacherId: string;
  userId?: string;
  fullName: string;
  employeeNumber: string;
  email: string;
  phone: string;
  employmentTypeId?: string;
};

/**
 * Modal form for editing an existing teacher record via PUT /teachers/:id.
 * The backend update only carries identity, contact and employment-type
 * fields, so penugasan (wali kelas/piket) and akun login stay read-only here.
 *
 * @param props - Component properties.
 * @returns Modal JSX element or null.
 */
export function MasterGuruEditModal(props: {
  isOpen: boolean;
  initial: EditTeacherInitial | null;
  onClose: () => void;
  onSubmit: (draft: EditTeacherDraft) => void;
  employmentTypes: EmploymentType[];
  isSubmitting: boolean;
}) {
  const t = useTranslations('MasterGuruPage');
  const [name, setName] = useState(props.initial?.fullName ?? '');
  const [nip, setNip] = useState(props.initial?.employeeNumber ?? '');
  const [email, setEmail] = useState(props.initial?.email ?? '');
  const [phone, setPhone] = useState(props.initial?.phone ?? '');
  const [employmentTypeId, setEmploymentTypeId] = useState(props.initial?.employmentTypeId ?? '');

  if (!props.isOpen || props.initial === null) {
    return null;
  }

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || props.initial === null) {
      return;
    }
    props.onSubmit({
      teacherId: props.initial.teacherId,
      userId: props.initial.userId,
      fullName: name.trim(),
      employeeNumber: nip.trim(),
      email: email.trim(),
      phone: phone.trim(),
      employmentTypeId: employmentTypeId === '' ? undefined : employmentTypeId,
    });
  };

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-edit-guru-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-3 backdrop-blur-xs sm:p-4"
    >
      <div className="bg-surface-card relative my-6 w-full max-w-xl overflow-hidden rounded-2xl border border-border-control shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between bg-pine-deep px-6 py-4.5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-amber-300">
              <UserCog className="size-5" />
            </div>
            <div>
              <h2 id="modal-edit-guru-title" className="text-base font-bold sm:text-lg">
                Edit Data Guru
              </h2>
              <p className="text-xs text-emerald-100">
                Perbarui identitas, kontak, dan jenis kepegawaian (PUT /teachers/:id).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="cursor-pointer rounded-lg p-1.5 text-emerald-200 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={t('btn_close')}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="max-h-[80vh] space-y-5 overflow-y-auto p-6">
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
            Catatan: penugasan wali kelas, jadwal piket, dan akses sistem dikelola dari menu
            tindakan tabel — formulir ini hanya menyimpan data induk guru.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-text-primary mb-1 block text-xs font-semibold">
                {t('field_full_name_degree_label')} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder="Contoh: Drs. Agus Subagyo, M.Pd."
                className="bg-canvas-base h-10 w-full rounded-xl border border-border-control px-3 text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
              />
            </div>

            <div>
              <label className="text-text-primary mb-1 block text-xs font-semibold">
                {t('field_nip_label')}
              </label>
              <input
                type="text"
                value={nip}
                onChange={(e) => {
                  setNip(e.target.value);
                }}
                placeholder="19780412 200501 1 003"
                className="bg-canvas-base h-10 w-full rounded-xl border border-border-control px-3 text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="edit-employment-type"
                className="text-text-primary mb-1 block text-xs font-semibold"
              >
                Jenis Kepegawaian
              </label>
              <select
                id="edit-employment-type"
                value={employmentTypeId}
                onChange={(e) => {
                  setEmploymentTypeId(e.target.value);
                }}
                className="bg-canvas-base h-10 w-full rounded-xl border border-border-control px-3 text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
              >
                <option value="">Belum ditentukan</option>
                {props.employmentTypes
                  .filter((employmentType) => employmentType.is_active)
                  .map((employmentType) => (
                    <option key={employmentType.id} value={employmentType.id}>
                      {employmentType.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-text-primary mb-1 block text-xs font-semibold">
                {t('field_email_workspace_label')} *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                placeholder="nama.guru@sekolah.sch.id"
                className="bg-canvas-base h-10 w-full rounded-xl border border-border-control px-3 text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
              />
            </div>

            <div>
              <label className="text-text-primary mb-1 block text-xs font-semibold">
                {t('field_phone_whatsapp_label')} *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                }}
                placeholder="+62 812-XXXX-XXXX"
                className="bg-canvas-base h-10 w-full rounded-xl border border-border-control px-3 text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex flex-col-reverse justify-end gap-3 border-t border-border-subtle pt-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={props.onClose}
              className="text-text-muted cursor-pointer rounded-xl border border-border-control px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-slate-100 sm:text-sm"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              disabled={props.isSubmitting}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-pine-deep px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-pine-hover disabled:opacity-60 sm:text-sm"
            >
              <CheckCircle2 className="size-4 text-amber-300" />
              <span>{props.isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
