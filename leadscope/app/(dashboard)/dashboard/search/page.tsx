'use client';

import { useEffect, useMemo, useState } from 'react';
import { Topbar } from '@/components/dashboard/topbar';
import { SearchForm } from '@/components/search/search-form';
import { FiltersPanel } from '@/components/search/filters-panel';
import { ResultsTable } from '@/components/search/results-table';
import { ExportMenu } from '@/components/search/export-menu';
import { StatsBar } from '@/components/search/stats-bar';
import { useSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { filterBusinesses } from '@/lib/filter-businesses';
import { cn } from '@/lib/utils';
import { DEFAULT_FILTERS } from '@/lib/types';

const FIRST_SEARCH_KEY = 'leadscope-first-search-done';

export default function SearchPage() {
  const { results, location, loading, runSearch } = useSearch();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [highlightFirst, setHighlightFirst] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(FIRST_SEARCH_KEY)) setHighlightFirst(true);
    } catch {
      // sin almacenamiento: se omite el resalte de bienvenida
    }
  }, []);

  const filtered = useMemo(
    () => filterBusinesses(results, filters, debouncedQuery),
    [results, filters, debouncedQuery]
  );

  const selectedBusinesses = useMemo(
    () => filtered.filter((b) => selected.has(b.id)),
    [filtered, selected]
  );

  function handleSearch(params: Parameters<typeof runSearch>[0]) {
    setSelected(new Set());
    if (highlightFirst) {
      setHighlightFirst(false);
      try {
        localStorage.setItem(FIRST_SEARCH_KEY, '1');
      } catch {
        // ignorado
      }
    }
    runSearch(params);
  }

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
    <>
      <Topbar title="Buscador de clientes" />

      <main className="flex-1 space-y-5 p-4 sm:p-6">
        <div
          className={cn(
            'space-y-5 rounded-2xl border border-border bg-surface p-5 transition-shadow duration-700',
            highlightFirst && 'ring-2 ring-brand-500/50 shadow-glow'
          )}
        >
          <SearchForm onSearch={handleSearch} loading={loading} />
          <hr className="border-border" />
          <FiltersPanel
            filters={filters}
            onChange={setFilters}
            query={query}
            onQueryChange={setQuery}
          />
        </div>

        {results.length > 0 && (
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                {filtered.length} de {results.length} resultados en{' '}
                <span className="font-medium text-fg">{location}</span>
              </p>
              <ExportMenu businesses={filtered} selectedBusinesses={selectedBusinesses} />
            </div>

            <StatsBar businesses={results} />
          </>
        )}

        <ResultsTable
          businesses={filtered}
          loading={loading}
          selectedIds={selected}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
        />
      </main>
    </>
  );
}
