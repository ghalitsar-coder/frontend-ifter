'use client';

import { FileHeart, Upload } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/api/client';
import {
  dispensationDateLabel,
  dispensationStatusLabel,
  dispensationTypeLabel,
  useCreateMyDispensation,
  useMyDispensations,
} from '@/lib/api/murid';

const DISPENSATION_TYPES = [
  { value: 'sick', label: 'Sakit' },
  { value: 'late', label: 'Terlambat' },
  { value: 'permit', label: 'Izin' },
  { value: 'other', label: 'Lainnya' },
];

type DispensationFormState = {
  type: string;
  reason: string;
  start_date: string;
  end_date: string;
  document: File | null;
};

const emptyForm: DispensationFormState = {
  type: 'sick',
  reason: '',
  start_date: '',
  end_date: '',
  document: null,
};

/**
 * Dispensation card — GET /my/dispensations list plus the POST
 * /my/dispensations create form (JSON, or multipart when a document file is
 * attached). Owns its local form state; success feedback is inline.
 * @returns The card element.
 */
export function MuridDispensationCard() {
  const dispensations = useMyDispensations({ limit: 20, offset: 0 });
  const createDispensation = useCreateMyDispensation();
  const [form, setForm] = useState<DispensationFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const items = dispensations.data?.data ?? [];

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    try {
      await createDispensation.mutateAsync({
        type: form.type,
        reason: form.reason,
        start_date: form.start_date,
        end_date: form.end_date,
        document: form.document,
      });
      setForm(emptyForm);
      setFormSuccess('Pengajuan dispensasi terkirim dan menunggu verifikasi guru.');
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : 'Gagal mengirim pengajuan. Coba lagi sebentar.',
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileHeart className="size-4 text-[#173F36]" />
          Dispensasi Saya
        </CardTitle>
        <CardDescription>Ajukan izin/sakit dan pantau status verifikasinya.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing requests */}
        <div className="space-y-3">
          {dispensations.isPending && <Skeleton className="h-20 w-full rounded-xl" />}
          {dispensations.isError && (
            <p className="text-sm text-red-600">Daftar dispensasi gagal dimuat.</p>
          )}
          {items.length === 0 && !dispensations.isPending && (
            <p className="text-sm text-[#6E7A76]">Belum ada pengajuan dispensasi.</p>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-[#E4E8E6] bg-[#F8F9F8] p-3 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[#173F36]">
                  {dispensationTypeLabel(item.type)} • {dispensationDateLabel(item)}
                </span>
                <Badge variant="secondary">{dispensationStatusLabel(item.status)}</Badge>
              </div>
              <p className="mt-1 text-[#414846]">{item.reason}</p>
              {item.note !== null && item.note !== '' && (
                <p className="mt-1 text-[#6E7A76]">Catatan guru: {item.note}</p>
              )}
              {item.document_available && (
                <p className="mt-1 text-[#6E7A76]">Lampiran dokumen tersedia.</p>
              )}
            </div>
          ))}
        </div>

        {/* Create form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="murid-disp-type">Jenis</Label>
              <select
                id="murid-disp-type"
                className="h-9 rounded-md border border-[#D4DAD7] bg-white px-2 text-sm"
                value={form.type}
                onChange={(event) => {
                  setForm({ ...form, type: event.target.value });
                }}
              >
                {DISPENSATION_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="murid-disp-start">Tanggal Mulai</Label>
              <Input
                id="murid-disp-start"
                type="date"
                required
                value={form.start_date}
                onChange={(event) => {
                  setForm({ ...form, start_date: event.target.value });
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="murid-disp-end">Selesai (opsional)</Label>
              <Input
                id="murid-disp-end"
                type="date"
                value={form.end_date}
                onChange={(event) => {
                  setForm({ ...form, end_date: event.target.value });
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="murid-disp-reason">Alasan</Label>
            <Textarea
              id="murid-disp-reason"
              required
              rows={3}
              placeholder="Contoh: demam disertai surat keterangan dokter"
              value={form.reason}
              onChange={(event) => {
                setForm({ ...form, reason: event.target.value });
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="murid-disp-doc" className="flex items-center gap-1.5">
              <Upload className="size-3.5" />
              Dokumen Pendukung (opsional)
            </Label>
            <Input
              id="murid-disp-doc"
              type="file"
              accept="image/*,application/pdf"
              onChange={(event) => {
                setForm({ ...form, document: event.target.files?.[0] ?? null });
              }}
            />
          </div>

          {formError !== null && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          {formSuccess !== null && (
            <Alert>
              <AlertDescription>{formSuccess}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={createDispensation.isPending}>
            {createDispensation.isPending ? <Spinner className="size-4" /> : null}
            Kirim Pengajuan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
