'use client';

import { CheckCircle2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { getRuleSeverity, mockSanctionTiers, mockTatibRules } from '@/data/mockTatib';
import type { NewRuleInput, RuleSeverity, SeverityFilter, TatibRule } from '@/types/tatib';
import { TatibAddModal } from './TatibAddModal';
import { TatibHeader } from './TatibHeader';
import { TatibSanctionTiers } from './TatibSanctionTiers';
import { TatibTable } from './TatibTable';
import { TatibToolbar } from './TatibToolbar';

/**
 * Coordinator for the school code of conduct catalog state and modals.
 *
 * @returns Conduct rule workspace.
 */
export function TatibManager() {
  const t = useTranslations('TatibPage');
  const [rules, setRules] = useState<TatibRule[]>(mockTatibRules);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityFilter>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  const handleAddRule = (input: NewRuleInput, publish: boolean) => {
    const newRule: TatibRule = {
      ...input,
      id: `tatib-${Date.now()}`,
      code: nextCode,
      isActive: publish,
    };

    setRules([newRule, ...rules]);
    showToast(publish ? t('toast_rule_published', { code: newRule.code }) : t('toast_rule_draft'));
    if (publish) {
      setIsAddModalOpen(false);
    }
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
          setIsAddModalOpen(true);
        }}
        onDownloadHandbook={() => {
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

        <TatibTable
          rules={filteredRules}
          onEditRule={(rule) => {
            showToast(t('toast_edit_rule', { code: rule.code }));
          }}
        />
      </section>

      <TatibAddModal
        isOpen={isAddModalOpen}
        nextCode={nextCode}
        onClose={() => {
          setIsAddModalOpen(false);
        }}
        onSubmit={handleAddRule}
      />
    </div>
  );
}
