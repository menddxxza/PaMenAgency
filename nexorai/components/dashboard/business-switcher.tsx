'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from '@/components/ui/select';
import type { Business } from '@/lib/types';

const ADD_BUSINESS_VALUE = '__add__';

export function BusinessSwitcher({
  businesses,
  activeBusinessId,
  canAddBusiness,
}: {
  businesses: Business[];
  activeBusinessId: string;
  canAddBusiness: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (businesses.length <= 1 && !canAddBusiness) {
    return null;
  }

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    if (value === ADD_BUSINESS_VALUE) {
      router.push('/onboarding/business');
      return;
    }
    if (value === activeBusinessId) return;

    setLoading(true);
    await fetch('/api/businesses/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: value }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Select
      value={activeBusinessId}
      onChange={handleChange}
      disabled={loading}
      className="h-8 w-auto min-w-[9rem] py-0 text-xs"
      aria-label="Negocio activo"
    >
      {businesses.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
      {canAddBusiness && <option value={ADD_BUSINESS_VALUE}>+ Añadir negocio</option>}
    </Select>
  );
}
