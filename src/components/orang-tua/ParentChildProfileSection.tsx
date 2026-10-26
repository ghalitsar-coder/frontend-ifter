'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatIncidentDate } from '@/lib/api/kedisiplinan';
import type { ParentChild } from '@/lib/api/parent';
import { relationshipLabel, statusLabel } from '@/lib/api/parent';

/**
 * Identity card for one linked child, built from the parent's own
 * GET /parent/children entry. The portal has no write surface here: linking is
 * an administrator action on the parent-account page.
 *
 * @param props - Section inputs.
 * @param props.child - Linked child summary.
 * @returns Profile card element.
 */
export function ParentChildProfileSection(props: { child: ParentChild }) {
  const { child } = props;
  const fields = [
    { label: 'NIS', value: child.student_number },
    { label: 'Status Siswa', value: statusLabel(child.status) },
    { label: 'Kelas', value: child.class_name ?? 'Belum ada kelas' },
    { label: 'Hubungan dengan Anak', value: relationshipLabel(child.relationship) },
    { label: 'Sejak Tertaut', value: formatIncidentDate(child.linked_at) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{child.full_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.label}
              className="rounded-xl border border-border-control bg-surface-container-low px-4 py-3"
            >
              <dt className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">
                {field.label}
              </dt>
              <dd className="mt-1 text-sm font-bold text-pine-deep">{field.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-text-muted">
          Data identitas siswa dikelola sekolah. Hubungi Tata Usaha untuk perbaikan bila ada yang
          keliru.
        </p>
      </CardContent>
    </Card>
  );
}
