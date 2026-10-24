import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiPatch, apiPost, apiPut } from '@/lib/api/client';
import type { DisciplineCategory } from '@/lib/api/dto';
import { disciplineCategoriesOptions, queryKeys } from '@/lib/api/queries';
import type { NewRuleInput, TatibRule } from '@/types/tatib';

// ---------------------------------------------------------------------------
// Tatib (school code of conduct) = backend discipline categories.
//
// The backend Category row only stores `code`, `name`, `description`,
// `default_points`, `auto_on_attendance_status` and `is_active`, while the
// tatib UI also shows `detail`, `procedure`, `authority` and `legalBasis`.
// Those four extra fields are packed into `description` using fixed Indonesian
// markers and unpacked again by `categoryToRule` below. Categories written by
// other screens (plain description text) decode gracefully: the whole text
// becomes `detail` and the procedure columns stay empty.
// ---------------------------------------------------------------------------

const PROCEDURE_MARKER = '\nProsedur: ';
const AUTHORITY_MARKER = '\nPenindak: ';
const LEGAL_MARKER = '\nDasar: ';

// Matches the composite encoding produced by `buildCategoryPayload`.
const DESCRIPTION_PATTERN =
  /^([\s\S]*?)\nProsedur: ([\s\S]*?)\nPenindak: ([\s\S]*?)\nDasar: ([\s\S]*)$/u;

/** Payload sent to POST/PUT `/discipline/categories`. */
export type TatibCategoryPayload = {
  code: string;
  name: string;
  description: string;
  default_points: number;
};

/**
 * Mapper: backend Category → UI TatibRule.
 * Unpacks detail/procedure/authority/legalBasis from the composite
 * `description` (see marker constants above); plain descriptions fall back to
 * `detail` with the remaining columns empty.
 *
 * @param category - Discipline category as returned by the API.
 * @returns Row shaped for the tatib table and modal.
 */
export function categoryToRule(category: DisciplineCategory): TatibRule {
  const description = category.description ?? '';
  const match = DESCRIPTION_PATTERN.exec(description);

  return {
    id: category.id,
    code: category.code ?? category.id,
    title: category.name,
    detail: (match?.[1] ?? description).trim(),
    points: category.default_points ?? 0,
    procedure: match?.[2]?.trim() ?? '',
    authority: match?.[3]?.trim() ?? '',
    legalBasis: match?.[4]?.trim() ?? '',
    isActive: category.is_active,
  };
}

/**
 * Mapper: modal input → API payload (the reverse of `categoryToRule`).
 *
 * @param code - Article code assigned by the UI (PASAL-xx).
 * @param input - Form values from the add/edit modal.
 * @returns Body for POST/PUT `/discipline/categories`.
 */
export function buildCategoryPayload(code: string, input: NewRuleInput): TatibCategoryPayload {
  return {
    code,
    name: input.title,
    description: `${input.detail}${PROCEDURE_MARKER}${input.procedure}${AUTHORITY_MARKER}${input.authority}${LEGAL_MARKER}${input.legalBasis}`,
    default_points: input.points,
  };
}

/**
 * Extracts the backend error message when available, else a fallback.
 *
 * @param error - Unknown thrown value from a query/mutation.
 * @param fallback - Hard-coded Indonesian fallback text.
 * @returns Message to surface in the module toast.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

// Local key prefix (module-scoped extension of the queryKeys convention).
const categoriesKeyPrefix = ['discipline', 'categories'] as const;

/**
 * Options for the tatib catalog: GET /discipline/categories?include_inactive=true
 * mapped to `TatibRule[]`.
 * @returns react-query options with mapped rules.
 */
export const tatibRulesOptions = () => {
  const categories = disciplineCategoriesOptions({ include_inactive: true });
  return queryOptions({
    ...categories,
    select: (data) => data.map(categoryToRule),
  });
};

/**
 * Lists all conduct articles (active + drafts) from the real backend.
 * @returns React Query result with `TatibRule[]`.
 */
export const useTatibRules = () => useQuery(tatibRulesOptions());

/** Variables for the create/update mutation. */
export type TatibSaveVariables = {
  code: string;
  input: NewRuleInput;
  publish: boolean;
  editing: TatibRule | null;
};

/**
 * Creates (POST /discipline/categories) or updates
 * (PUT /discipline/categories/:id) one article. On create-as-draft the item is
 * immediately deactivated via PATCH status because POST has no is_active body
 * field. On edit the current activation is kept unless "publish" re-activates
 * it; deactivation lives on the table status toggle.
 * `auto_on_attendance_status` is not editable in this UI, so it is preserved
 * from the cached original before a PUT overwrite.
 *
 * @returns Mutation for saving one article.
 */
export const useTatibSave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TatibSaveVariables): Promise<DisciplineCategory> => {
      const payload = buildCategoryPayload(variables.code, variables.input);

      if (variables.editing === null) {
        let created = await apiPost<DisciplineCategory>('/discipline/categories', payload);
        if (!variables.publish && created.is_active) {
          created = await apiPatch<DisciplineCategory>(
            `/discipline/categories/${created.id}/status`,
            { is_active: false },
          );
        }
        return created;
      }

      const cacheKey = queryKeys.disciplineCategories({ include_inactive: true });
      const original = (queryClient.getQueryData<DisciplineCategory[]>(cacheKey) ?? []).find(
        (item) => item.id === variables.editing?.id,
      );
      const body:
        | TatibCategoryPayload
        | (TatibCategoryPayload & { auto_on_attendance_status?: string }) =
        original?.auto_on_attendance_status === undefined
          ? payload
          : { ...payload, auto_on_attendance_status: original.auto_on_attendance_status };

      let saved = await apiPut<DisciplineCategory>(
        `/discipline/categories/${variables.editing.id}`,
        body,
      );
      if (variables.publish && !saved.is_active) {
        saved = await apiPatch<DisciplineCategory>(`/discipline/categories/${saved.id}/status`, {
          is_active: true,
        });
      }
      return saved;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriesKeyPrefix });
    },
  });
};

/** Variables for the activate/deactivate mutation. */
export type TatibStatusVariables = {
  id: string;
  is_active: boolean;
};

/**
 * PATCH /discipline/categories/:id/status — flips an article between active
 * and draft.
 * @returns Mutation for one status change.
 */
export const useTatibStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TatibStatusVariables) =>
      await apiPatch<DisciplineCategory>(`/discipline/categories/${variables.id}/status`, {
        is_active: variables.is_active,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriesKeyPrefix });
    },
  });
};
