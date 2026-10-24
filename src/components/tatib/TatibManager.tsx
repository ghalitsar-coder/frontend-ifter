'use client';

import { CheckCircle2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
// shortcut: no backend endpoint for the sanction escalation ladder, keep mock
import { mockSanctionTiers } from '@/data/mockTatib';
import { getApiErrorMessage, useTatibRules, useTatibSave, useTatibStatus } from '@/lib/api/tatib';
import type { NewRuleInput, RuleSeverity, SeverityFilter, TatibRule } from '@/types/tatib';
import { getRuleSeverity } from './severityStyles';
import { TatibAddModal } from './TatibAddModal';
import { TatibHeader } from './TatibHeader';
import { TatibSanctionTiers } from './TatibSanctionTiers';
import { TatibTable } from './TatibTable';
import { TatibToolbar } from './TatibToolbar';

/**
 * Coordinator for the school code of conduct catalog state and modals.
 * The catalog is backed by GET/POST/PUT/PATCH /discipline/categories.
 *
 * @returns Conduct rule workspace.
 */
export function TatibManager() {
  const t = useTranslations('TatibPage');
  const rulesQuery = useTatibRules();
  const rules = rulesQuery.data ?? [];
  const saveMutation = useTatibSave();
  const statusMutation = useTatibStatus();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityFilter>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TatibRule | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const severityCounts: Record<RuleSeverity, number> = {
    ringan: 0,
    sedang: 0,
    berat: 0,
    kritis: 0,
  };
  for (const rule of rules) {
    severityCounts[getRuleSeverity(rule.points)] += 1;
  }

  const filteredRules = rules.filter((rule) => {
    if (selectedSeverity !== 'all' && getRuleSeverity(rule.points) !== selectedSeverity) {
      return false;
    }

    const query = searchQuery.trim().toLowerCase();
    if (query === '') {
      return true;
    }

    return (
      rule.code.toLowerCase().includes(query) ||
      rule.title.toLowerCase().includes(query) ||
      rule.detail.toLowerCase().includes(query) ||
      rule.authority.toLowerCase().includes(query)
    );
  });

  const nextCode = `PASAL-${String(rules.length + 1).padStart(2, '0')}`;

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingRule(null);
  };

  const handleAddRule = async (input: NewRuleInput, publish: boolean) => {
    const code = editingRule ? editingRule.code : nextCode;
    try {
      await saveMutation.mutateAsync({ code, input, publish, editing: editingRule });
      showToast(publish ? t('toast_rule_published', { code }) : t('toast_rule_draft'));
      if (publish || editingRule) {
        closeModal();
      }
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Gagal menyimpan tata tertib.'));
    }
  };

  const handleToggleStatus = (rule: TatibRule) => {
    statusMutation.mutate(
      { id: rule.id, is_active: !rule.isActive },
      {
        onSuccess: () => {
          showToast(
            rule.isActive ? t('toast_rule_draft') : t('toast_rule_published', { code: rule.code }),
          );
        },
        onError: (error) => {
          showToast(getApiErrorMessage(error, 'Gagal mengubah status pasal.'));
        },
      },
    );
  };

  return (
    <div className="w-full">
      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-50 flex animate-in items-center gap-3 rounded-xl border border-pine-hover bg-pine-deep px-4 py-3 text-white shadow-xl fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="size-5 shrink-0 text-amber-gold" />
          <span className="text-xs font-medium sm:text-sm">{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage(null);
            }}
            className="ml-2 cursor-pointer text-white/60 hover:text-white"
            aria-label={t('btn_close_notification')}
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <TatibHeader
        ruleCount={rules.length}
        tierCount={mockSanctionTiers.length}
        onOpenAddModal={() => {
          setEditingRule(null);
          setIsAddModalOpen(true);
        }}
        onDownloadHandbook={() => {
          // shortcut: no backend handbook export endpoint, keep toast-only behavior
          showToast(t('toast_download_handbook'));
        }}
      />

      <TatibSanctionTiers tiers={mockSanctionTiers} />

      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold tracking-tight text-pine-deep sm:text-base">
            {t('catalog_title')}
          </h2>
          <span className="text-xs text-muted-foreground">{t('catalog_subtitle')}</span>
        </div>

        <TatibToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSeverity={selectedSeverity}
          onSeverityChange={setSelectedSeverity}
          totalCount={rules.length}
          severityCounts={severityCounts}
        />

        {rulesQuery.isPending && (
          <div
            className="h-72 animate-pulse rounded-2xl border border-border-control bg-card"
            aria-hidden="true"
          />
        )}

        {rulesQuery.isError && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-center">
            <p className="text-xs font-semibold text-red-700">
              {getApiErrorMessage(rulesQuery.error, 'Gagal memuat tata tertib dari server.')}
            </p>
            <button
              type="button"
              onClick={() => {
                void rulesQuery.refetch();
              }}
              className="mt-3 cursor-pointer rounded-xl border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              {/* shortcut: no TatibPage locale key for retry */}
              Coba lagi
            </button>
          </div>
        )}

        {!rulesQuery.isPending && !rulesQuery.isError && (
          <TatibTable
            rules={filteredRules}
            onEditRule={(rule) => {
              setEditingRule(rule);
              setIsAddModalOpen(true);
            }}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </section>

      <TatibAddModal
        key={editingRule?.id ?? 'new'}
        isOpen={isAddModalOpen}
        nextCode={editingRule ? editingRule.code : nextCode}
        editingRule={editingRule}
        isSaving={saveMutation.isPending}
        onClose={closeModal}
        onSubmit={handleAddRule}
      />
    </div>
  );
}
