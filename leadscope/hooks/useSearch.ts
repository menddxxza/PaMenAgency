'use client';

import { useState } from 'react';
import type { Business, SearchParams } from '@/lib/types';
import { useToast } from '@/components/providers/toast-provider';

interface SearchState {
  results: Business[];
  location: string;
  loading: boolean;
}

export function useSearch() {
  const { push } = useToast();
  const [state, setState] = useState<SearchState>({ results: [], location: '', loading: false });

  async function runSearch(params: SearchParams) {
    setState((s) => ({ ...s, loading: true }));

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (!res.ok) {
        push(data.error ?? 'Error al buscar negocios', 'error');
        setState((s) => ({ ...s, loading: false }));
        return;
      }

      setState({ results: data.results, location: data.location, loading: false });

      const withoutWebsite = (data.results as Business[]).filter(
        (b) => b.websiteStatus === 'no_website'
      ).length;
      push(
        `${data.results.length} negocios encontrados · ${withoutWebsite} sin página web`,
        'success'
      );
    } catch {
      push('No se pudo conectar con el servidor', 'error');
      setState((s) => ({ ...s, loading: false }));
    }
  }

  return { ...state, runSearch };
}
