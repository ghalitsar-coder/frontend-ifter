'use client';

import { ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { lastNDaysRange, useMyDiscipline } from '@/lib/api/murid';

// Same trailing-30-days window as the attendance card (limit 20 rows).
const DISCIPLINE_RANGE = { ...lastNDaysRange(30), limit: 20, offset: 0 };

const formatDateTimeId = (value: string): string =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

/**
 * Discipline card — GET /my/discipline: the student's own violation records
 * of the last 30 days with points and status.
 * @returns The card element.
 */
export function MuridDisciplineCard() {
  const discipline = useMyDiscipline(DISCIPLINE_RANGE);
  const records = discipline.data?.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="size-4 text-[#173F36]" />
          Catatan Kedisiplinan Saya
        </CardTitle>
        <CardDescription>Rekor pelanggaran 30 hari terakhir beserta poinnya.</CardDescription>
      </CardHeader>
      <CardContent>
        {discipline.isPending && <Skeleton className="h-24 w-full rounded-xl" />}
        {discipline.isError && (
          <p className="text-sm text-red-600">Catatan kedisiplinan gagal dimuat.</p>
        )}
        {records !== undefined && records.length === 0 && (
          <p className="text-sm text-[#6E7A76]">
            Tidak ada catatan kedisiplinan pada periode ini. Pertahankan!
          </p>
        )}
        {records !== undefined && records.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Poin</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {formatDateTimeId(record.occurred_at)}
                  </TableCell>
                  <TableCell className="text-xs font-semibold">{record.category_name}</TableCell>
                  <TableCell className="max-w-64 text-xs">{record.description}</TableCell>
                  <TableCell className="text-right text-xs font-bold">{record.points}</TableCell>
                  <TableCell className="text-xs">{record.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
