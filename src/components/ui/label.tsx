'use client';

/* oxlint-disable jsx-a11y/label-has-associated-control -- vendored shadcn/ui component, generic label primitive; htmlFor/control association is the consumer responsibility; do not hand-edit */
import { cn } from 'cn';
import * as React from 'react';

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Label };
