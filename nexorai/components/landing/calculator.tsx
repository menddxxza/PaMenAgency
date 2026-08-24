'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { runAuditEngine } from '@/lib/ai/audit-engine';
import { prioritizeOpportunities } from '@/lib/ai/opportunity-engine';
import { SECTORS } from '@/lib/sectors';
import type { BusinessInput, GoalInput } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Label, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { EstimateNote } from '@/components/ui/demo-tag';
import { formatCurrency } from '@/lib/utils';

const EMPLOYEE_RANGES = ['1-5', '6-15', '16-50', '50+'];

export function Calculator({ defaultSector }: { defaultSector?: string } = {}) {
  const [sector, setSector] = useState(defaultSector ?? SECTORS[0].slug);
  const [monthlyRevenue, setMonthlyRevenue] = useState(8000);
  const [currentCustomers, setCurrentCustomers] = useState(40);
  const [avgTicket, setAvgTicket] = useState(350);
  const [monthlyLeads, setMonthlyLeads] = useState(60);
  const [conversionRate, setConversionRate] = useState(18);
  const [employeesRange, setEmployeesRange] = useState(EMPLOYEE_RANGES[0]);

  const result = useMemo(() => {
    const business: BusinessInput = {
      name: '',
      sector,
      location: '',
      website: '',
      employeesRange,
      avgTicket,
      currentCustomers,
      monthlyRevenue,
      monthlyLeads,
      conversionRate: conversionRate / 100,
      acquisitionChannels: ['calculadora'],
      mainProblem: '',
    };
    const goal: GoalInput = { goalType: 'revenue', targetValue: 1, timeframeDays: 30, rawInput: '' };
    const audit = runAuditEngine(business, goal);
    const prioritized = prioritizeOpportunities(audit.opportunities).slice(0, 3);
    return { ...audit, prioritized };
  }, [sector, monthlyRevenue, currentCustomers, avgTicket, monthlyLeads, conversionRate, employeesRange]);

  return (
    <section id="calculadora" className="mx-auto max-w-6xl px-4 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-brand-400">Calculadora</p>
        <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          ¿Cuánto dinero se está quedando sobre la mesa?
        </h2>
        <p className="mt-3 text-sm text-muted">
          Cifras orientativas calculadas con la misma fórmula que usa el AI Business Audit real.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="calc-sector">Sector</Label>
              <Select id="calc-sector" value={sector} onChange={(e) => setSector(e.target.value)}>
                {SECTORS.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.namePlural}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="calc-revenue">Facturación mensual (€)</Label>
              <Input
                id="calc-revenue"
                type="number"
                min={0}
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="calc-customers">Clientes actuales</Label>
              <Input
                id="calc-customers"
                type="number"
                min={0}
                value={currentCustomers}
                onChange={(e) => setCurrentCustomers(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="calc-ticket">Ticket medio (€)</Label>
              <Input
                id="calc-ticket"
                type="number"
                min={0}
                value={avgTicket}
                onChange={(e) => setAvgTicket(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="calc-leads">Leads mensuales</Label>
              <Input
                id="calc-leads"
                type="number"
                min={0}
                value={monthlyLeads}
                onChange={(e) => setMonthlyLeads(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="calc-conversion">Conversión actual (%)</Label>
              <Input
                id="calc-conversion"
                type="number"
                min={0}
                max={100}
                value={conversionRate}
                onChange={(e) => setConversionRate(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="calc-employees">Empleados</Label>
              <Select id="calc-employees" value={employeesRange} onChange={(e) => setEmployeesRange(e.target.value)}>
                {EMPLOYEE_RANGES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between bg-gradient-to-b from-brand-500/10 to-transparent p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Potencial detectado</p>
            <p className="mt-2 font-display text-4xl font-semibold text-fg">
              {formatCurrency(result.totalPotentialMin)} – {formatCurrency(result.totalPotentialMax)}
              <span className="ml-1 text-base font-normal text-muted">/mes</span>
            </p>
            <EstimateNote className="mt-2" />

            <ul className="mt-6 space-y-3">
              {result.prioritized.map((o) => (
                <li key={o.category} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted">{o.name}</span>
                  <span className="font-mono text-fg">
                    {formatCurrency(o.potentialMin)}–{formatCurrency(o.potentialMax)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Link href="/signup" className="mt-8">
            <Button className="w-full" size="lg">
              Ver mi auditoría completa
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </div>
    </section>
  );
}
