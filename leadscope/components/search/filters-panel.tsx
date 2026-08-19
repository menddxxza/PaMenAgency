'use client';

import { Search as SearchIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import type { SearchFilters } from '@/lib/types';

export function FiltersPanel({
  filters,
  onChange,
  query,
  onQueryChange,
}: {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  query: string;
  onQueryChange: (query: string) => void;
}) {
  function set<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Búsqueda instantánea por nombre, dirección o categoría…"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Switch
          checked={filters.onlyNoWebsite}
          onChange={(v) => set('onlyNoWebsite', v)}
          label="Solo sin web"
        />
        <Switch
          checked={filters.onlySocialOnly}
          onChange={(v) => set('onlySocialOnly', v)}
          label="Solo redes sociales"
        />
        <Switch
          checked={filters.withPhone}
          onChange={(v) => set('withPhone', v)}
          label="Con teléfono"
        />
        <Switch checked={filters.withEmail} onChange={(v) => set('withEmail', v)} label="Con email" />

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted">Reseñas mín.</label>
          <Input
            type="number"
            min={0}
            value={filters.minReviews}
            onChange={(e) => set('minReviews', Number(e.target.value))}
            className="h-8 w-20"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted">Rating mín.</label>
          <Input
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={filters.minRating}
            onChange={(e) => set('minRating', Number(e.target.value))}
            className="h-8 w-20"
          />
        </div>
      </div>
    </div>
  );
}
