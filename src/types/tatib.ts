/**
 * Severity band of a school conduct rule, derived from its point weight.
 */
export type RuleSeverity = 'ringan' | 'sedang' | 'berat' | 'kritis';

/**
 * Sanction escalation tier triggered when a student crosses the point threshold.
 */
export type SanctionTier = {
  id: string;
  label: string;
  threshold: number;
  descriptionKey: 'tier_sp1_desc' | 'tier_sp2_desc' | 'tier_sp3_desc' | 'tier_pleno_desc';
};

/**
 * Single article (pasal) of the school code of conduct.
 */
export type TatibRule = {
  id: string;
  code: string;
  title: string;
  detail: string;
  points: number;
  procedure: string;
  authority: string;
  legalBasis: string;
  isActive: boolean;
};

/**
 * Severity filter selection for the rule catalog.
 */
export type SeverityFilter = 'all' | RuleSeverity;

/**
 * Payload submitted from the new rule modal.
 */
export type NewRuleInput = Omit<TatibRule, 'id' | 'code' | 'isActive'>;
