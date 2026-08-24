'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { SearchParams } from '@/lib/types';

export function SearchForm({
  onSearch,
  loading,
}: {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
}) {
  const [niche, setNiche] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [radiusKm, setRadiusKm] = useState(15);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch({
      niche,
      country: country || undefined,
      city: city || undefined,
      postalCode: postalCode || undefined,
      radiusKm,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <div className="lg:col-span-2">
        <Label htmlFor="niche">Nicho o tipo de negocio</Label>
        <Input
          id="niche"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="Dentistas, restaurantes, gimnasios…"
          required
        />
      </div>

      <div>
        <Label htmlFor="country">País</Label>
        <Input
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="España"
        />
      </div>

      <div>
        <Label htmlFor="city">Ciudad</Label>
        <Input
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Madrid"
        />
      </div>

      <div>
        <Label htmlFor="postalCode">C.P. o radio (km)</Label>
        <div className="flex gap-2">
          <Input
            id="postalCode"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="28001"
            className="w-1/2"
          />
          <Input
            type="number"
            min={1}
            max={100}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-1/2"
          />
        </div>
      </div>

      <div className="flex items-end lg:col-span-5">
        <Button type="submit" variant="brand" className="w-full sm:w-auto" loading={loading}>
          <Search className="h-4 w-4" />
          Buscar negocios
        </Button>
      </div>
    </form>
  );
}
