'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { OnboardingCard } from '@/components/onboarding/onboarding-card';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SECTORS } from '@/lib/sectors';

const EMPLOYEE_RANGES = ['1-5', '6-15', '16-50', '50+'];
const CHANNEL_OPTIONS = [
  'Google / SEO',
  'Redes sociales',
  'Referidos',
  'Publicidad de pago',
  'Portales / directorios',
  'Networking / calle',
];

export default function OnboardingBusinessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [sector, setSector] = useState(SECTORS[0].slug);
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [employeesRange, setEmployeesRange] = useState(EMPLOYEE_RANGES[0]);
  const [avgTicket, setAvgTicket] = useState('');
  const [currentCustomers, setCurrentCustomers] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [monthlyLeads, setMonthlyLeads] = useState('');
  const [conversionRate, setConversionRate] = useState('');
  const [channels, setChannels] = useState<string[]>([]);
  const [mainProblem, setMainProblem] = useState('');

  function toggleChannel(channel: string) {
    setChannels((prev) => (prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        sector,
        location,
        website,
        employeesRange,
        avgTicket: Number(avgTicket) || 0,
        currentCustomers: Number(currentCustomers) || 0,
        monthlyRevenue: Number(monthlyRevenue) || 0,
        monthlyLeads: Number(monthlyLeads) || 0,
        conversionRate: (Number(conversionRate) || 0) / 100,
        acquisitionChannels: channels,
        mainProblem,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? 'No hemos podido guardar tu negocio. Inténtalo de nuevo.');
      return;
    }

    router.push('/onboarding/goal');
  }

  return (
    <OnboardingCard
      step={1}
      totalSteps={2}
      title="Conoce tu empresa"
      subtitle="Lo justo para que el motor de oportunidades tenga algo real con lo que trabajar."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Nombre del negocio</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="sector">Sector</Label>
            <Select id="sector" value={sector} onChange={(e) => setSector(e.target.value)}>
              {SECTORS.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.namePlural}
                </option>
              ))}
              <option value="otro">Otro</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ciudad, país"
            />
          </div>
          <div>
            <Label htmlFor="website">Web</Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://"
            />
          </div>
          <div>
            <Label htmlFor="employees">Nº aprox. de empleados</Label>
            <Select id="employees" value={employeesRange} onChange={(e) => setEmployeesRange(e.target.value)}>
              {EMPLOYEE_RANGES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="avgTicket">Ticket medio (€)</Label>
            <Input
              id="avgTicket"
              type="number"
              min={0}
              value={avgTicket}
              onChange={(e) => setAvgTicket(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="customers">Clientes actuales</Label>
            <Input
              id="customers"
              type="number"
              min={0}
              value={currentCustomers}
              onChange={(e) => setCurrentCustomers(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="revenue">Facturación mensual aprox. (€)</Label>
            <Input
              id="revenue"
              type="number"
              min={0}
              value={monthlyRevenue}
              onChange={(e) => setMonthlyRevenue(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="leads">Leads mensuales aprox.</Label>
            <Input
              id="leads"
              type="number"
              min={0}
              value={monthlyLeads}
              onChange={(e) => setMonthlyLeads(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="conversion">Conversión actual (%)</Label>
            <Input
              id="conversion"
              type="number"
              min={0}
              max={100}
              value={conversionRate}
              onChange={(e) => setConversionRate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Canales de captación actuales</Label>
          <div className="flex flex-wrap gap-2">
            {CHANNEL_OPTIONS.map((channel) => (
              <button
                type="button"
                key={channel}
                onClick={() => toggleChannel(channel)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  channels.includes(channel)
                    ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                    : 'border-border text-muted hover:text-fg'
                }`}
              >
                {channel}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="mainProblem">¿Cuál es tu principal problema comercial?</Label>
          <Textarea
            id="mainProblem"
            rows={3}
            value={mainProblem}
            onChange={(e) => setMainProblem(e.target.value)}
            placeholder="Ej: llegan leads pero no damos abasto para hacerles seguimiento"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" className="w-full" loading={loading}>
          Continuar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </OnboardingCard>
  );
}
