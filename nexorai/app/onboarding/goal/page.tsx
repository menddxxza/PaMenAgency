'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { OnboardingCard } from '@/components/onboarding/onboarding-card';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const GOAL_TYPES: { value: string; label: string; unit: string }[] = [
  { value: 'new_customers', label: 'Clientes nuevos', unit: 'clientes' },
  { value: 'revenue', label: 'Ingresos adicionales', unit: '€' },
  { value: 'leads', label: 'Leads nuevos', unit: 'leads' },
  { value: 'reactivation', label: 'Recuperar clientes antiguos', unit: 'clientes' },
];

const EXAMPLES = [
  'Quiero 30 clientes nuevos.',
  'Quiero generar 20.000€ adicionales.',
  'Quiero conseguir 100 leads.',
  'Quiero recuperar clientes antiguos.',
];

export default function OnboardingGoalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawInput, setRawInput] = useState('');
  const [goalType, setGoalType] = useState(GOAL_TYPES[0].value);
  const [targetValue, setTargetValue] = useState('30');
  const [timeframeDays, setTimeframeDays] = useState('30');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goalType,
        targetValue: Number(targetValue) || 0,
        timeframeDays: Number(timeframeDays) || 30,
        rawInput,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? 'No hemos podido guardar tu objetivo. Inténtalo de nuevo.');
      return;
    }

    router.push('/audit');
  }

  return (
    <OnboardingCard
      step={2}
      totalSteps={2}
      title="¿Cuánto quieres crecer?"
      subtitle="Escribe tu objetivo con tus propias palabras — nosotros lo convertimos en un plan de acción."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="rawInput">Tu objetivo</Label>
          <Textarea
            id="rawInput"
            rows={2}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={EXAMPLES[0]}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                type="button"
                key={ex}
                onClick={() => setRawInput(ex)}
                className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted hover:text-fg"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <Label htmlFor="goalType">Tipo de objetivo</Label>
            <Select id="goalType" value={goalType} onChange={(e) => setGoalType(e.target.value)}>
              {GOAL_TYPES.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="targetValue">Cantidad objetivo</Label>
            <Input
              id="targetValue"
              type="number"
              min={1}
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="timeframeDays">Plazo (días)</Label>
            <Input
              id="timeframeDays"
              type="number"
              min={7}
              value={timeframeDays}
              onChange={(e) => setTimeframeDays(e.target.value)}
              required
            />
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" className="w-full" loading={loading}>
          <Sparkles className="h-4 w-4" />
          Generar mi AI Business Audit
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </OnboardingCard>
  );
}
