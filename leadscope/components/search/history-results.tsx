'use client';

import { useMemo, useState } from 'react';
import { FiltersPanel } from '@/components/search/filters-panel';
import { ResultsTable } from '@/components/search/results-table';
import { ExportMenu } from '@/components/search/export-menu';
import { StatsBar } from '@/components/search/stats-bar';
import { filterBusinesses } from '@/lib/filter-businesses';
import { DEFAULT_FILTERS, type Business } from '@/lib/types';

export function HistoryResults({ businesses }: { businesses: Business[] }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () => filterBusinesses(businesses, filters, query),
    [businesses, filters, query]
  );

  const selectedBusinesses = useMemo(
    () => filtered.filter((b) => selected.has(b.id)),
    [filtered, selected]
  );

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const allSelected = filtered.length > 0 && filtered.every((b) => prev.has(b.id));
      return allSelected ? new Set() : new Set(filtered.map((b) => b.id));
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <ExportMenu businesses={filtered} selectedBusinesses={selectedBusinesses} />
      </div>
      <StatsBar businesses={businesses} />
      <div className="rounded-2xl border border-border bg-surface p-5">
        <FiltersPanel filters={filters} onChange={setFilters} query={query} onQueryChange={setQuery} />
      </div>
      <ResultsTable
        businesses={filtered}
        loading={false}
        selectedIds={selected}
        onToggleRow={toggleRow}
        onToggleAll={toggleAll}
      />
    </div>
  );
}
