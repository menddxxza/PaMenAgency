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

  const filtered = useMemo(
    () => filterBusinesses(businesses, filters, query),
    [businesses, filters, query]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <ExportMenu businesses={filtered} />
      </div>
      <StatsBar businesses={businesses} />
      <FiltersPanel filters={filters} onChange={setFilters} query={query} onQueryChange={setQuery} />
      <ResultsTable businesses={filtered} loading={false} />
    </div>
  );
}
