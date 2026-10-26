import { GraduationCap } from 'lucide-react';

/**
 * Attendly wordmark used by the attendance shell header and footer.
 *
 * @param props - Icon and text size variants.
 * @returns Brand lockup.
 */
export function AttendlyBrand(props: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <span
        className={`flex items-center justify-center rounded-xl bg-pine-deep text-amber-gold ${
          props.compact ? 'size-6' : 'size-8'
        }`}
      >
        <GraduationCap className={props.compact ? 'size-4' : 'size-5'} />
      </span>
      <span
        className={`font-headline-sm font-semibold tracking-tight text-pine-deep ${
          props.compact ? 'text-label-md' : 'text-headline-sm'
        }`}
      >
        Attendly
      </span>
    </span>
  );
}
