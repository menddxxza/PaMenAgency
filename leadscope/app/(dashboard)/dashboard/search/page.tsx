'use client';

import { useMemo, useState } from 'react';
import { Topbar } from '@/components/dashboard/topbar';
import { SearchForm } from '@/components/search/search-form';
import { FiltersPanel } from '@/components/search/filters-panel';
import { ResultsTable } from '@/components/search/results-table';
import { ExportMenu } from '@/components/search/export-menu';
import { StatsBar } from '@/components/search/stats-bar';
import { useSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { filterBusinesses } from '@/lib/filter-businesses';
import { DEFAULT_FILTERS } from '@/lib/types';

export default function SearchPage() {
  const { results, location, loading, runSearch } = useSearch();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200);

  const filtered = useMemo(
    () => filterBusinesses(results, filters, debouncedQuery),
    [results, filters, debouncedQuery]
  );

  return (
    <>
      <Topbar title="Buscador de negocios" />

      <main className="flex-1 space-y-5 p-4 sm:p-6">
        <SearchForm onSearch={runSearch} loading={loading} />

        {results.length > 0 && (
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                {filtered.length} de {results.length} resultados en{' '}
                <span className="font-medium text-fg">{location}</span>
              </p>
              <ExportMenu businesses={filtered} />
            </div>

            <StatsBar businesses={results} />
            <FiltersPanel
              filters={filters}
              onChange={setFilters}
              query={query}
              onQueryChange={setQuery}
            />
          </>
        )}

        <ResultsTable businesses={filtered} loading={loading} />
      </main>
    </>
  );
}
