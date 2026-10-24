/* oxlint-disable jsx-a11y/prefer-tag-over-role -- vendored shadcn/ui component, role=status on span matches upstream shadcn/ui spinner announcement; do not hand-edit */
import { cn } from 'cn';
import { Loader2Icon } from 'lucide-react';

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
