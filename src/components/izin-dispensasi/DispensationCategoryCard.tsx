import { Check, Stethoscope, BadgeCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DispensationSubcategory } from '@/types/dispensation';

/**
 * Category selector and activity sub-category pills.
 *
 * @param props - Sub-categories, selection, and doctor-note handler.
 * @returns Category card.
 */
export function DispensationCategoryCard(props: {
  subcategories: DispensationSubcategory[];
  selectedSubcategory: DispensationSubcategory['id'];
  onSubcategoryChange: (id: DispensationSubcategory['id']) => void;
  onOpenDoctorNote: () => void;
}) {
  const t = useTranslations('DispensationPage');

  return (
    <section className="rounded-2xl border border-border-subtle bg-card p-4 shadow-xs sm:p-5">
      <h2 className="text-sm font-extrabold tracking-tight text-foreground">
        {t('category_title')}
      </h2>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{t('category_desc')}</p>

      <div className="mt-3 grid grid-cols-1 gap-1.5 rounded-2xl bg-surface-container-low p-1.5 sm:grid-cols-2">
        <button
          type="button"
          onClick={props.onOpenDoctorNote}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
        >
          <Stethoscope className="size-3.5" />
          {t('category_sick')}
        </button>
        <button
          type="button"
          aria-pressed
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-pine-deep px-3 py-2.5 text-[11px] font-bold text-white shadow-sm"
        >
          <BadgeCheck className="size-3.5 text-amber-gold" />
          {t('category_dispensation')}
        </button>
      </div>

      <p className="mt-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        {t('subcategory_title')}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {props.subcategories.map((subcategory) => {
          const isSelected = subcategory.id === props.selectedSubcategory;

          return (
            <button
              key={subcategory.id}
              type="button"
              onClick={() => {
                props.onSubcategoryChange(subcategory.id);
              }}
              aria-pressed={isSelected}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                isSelected
                  ? 'border-pine-deep bg-pine-light text-pine-deep'
                  : 'border-border-subtle bg-card text-muted-foreground hover:border-border-control hover:text-foreground'
              }`}
            >
              {isSelected && <Check className="size-2.5" strokeWidth={3} />}
              {subcategory.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
