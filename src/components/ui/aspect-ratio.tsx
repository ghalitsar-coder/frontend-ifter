/* oxlint-disable typescript/no-unsafe-type-assertion -- vendored shadcn/ui component, CSS custom-property object cast is upstream shadcn/ui style typing; do not hand-edit */
import { cn } from 'cn';

function AspectRatio({
  ratio,
  className,
  ...props
}: React.ComponentProps<'div'> & { ratio: number }) {
  return (
    <div
      data-slot="aspect-ratio"
      style={
        {
          '--ratio': ratio,
        } as React.CSSProperties
      }
      className={cn('relative aspect-(--ratio)', className)}
      {...props}
    />
  );
}

export { AspectRatio };
