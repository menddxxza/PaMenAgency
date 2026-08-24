'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import { runAuditEngine } from '@/lib/ai/audit-engine';
import { prioritizeOpportunities } from '@/lib/ai/opportunity-engine';
import { SECTORS } from '@/lib/sectors';
import type { BusinessInput, GoalInput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { EstimateNote } from '@/components/ui/demo-tag';
import { formatCurrency } from '@/lib/utils';

const EMPLOYEE_RANGES = ['1-5', '6-15', '16-50', '50+'];

function ConsoleField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-widest text-white/35">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const fieldClass =
  'w-full border-0 border-b border-white/10 bg-transparent py-1.5 font-mono text-sm text-white outline-none transition-colors focus:border-gold-400';

/** Cifra que se anima suavemente hacia el nuevo valor en cada recálculo, en vez de saltar. */
function AnimatedCurrency({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef({ v: value });

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }
    const tween = gsap.to(ref.current, {
      v: value,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => setDisplay(Math.round(ref.current.v)),
    });
    return () => {
      tween.kill();
    };
  }, [value]);

  return <>{formatCurrency(display)}</>;
}

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
    <section id="calculadora" className="bg-void relative mx-auto max-w-6xl scroll-mt-20 px-4 py-28 sm:px-8">
      <div className="max-w-xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold-400">Calculadora</p>
        <h2 className="mt-4 font-display text-3xl font-semibold uppercase tracking-tight text-white sm:text-4xl">
          Cuánto dinero se está quedando sobre la mesa
        </h2>
        <p className="mt-3 max-w-md text-sm text-white/45">
          Misma fórmula que usa el AI Business Audit real. Cambia los valores y el motor recalcula al
          instante.
        </p>
      </div>

      <div className="landing-hairline mt-14 grid grid-cols-1 border lg:grid-cols-[1.1fr_1fr]">
        <div className="landing-hairline border-b p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">Input</p>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <ConsoleField label="Sector">
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className={fieldClass}
              >
                {SECTORS.map((s) => (
                  <option key={s.slug} value={s.slug} className="bg-[#0b0b0c]">
                    {s.namePlural}
                  </option>
                ))}
              </select>
            </ConsoleField>
            <ConsoleField label="Empleados">
              <select
                value={employeesRange}
                onChange={(e) => setEmployeesRange(e.target.value)}
                className={fieldClass}
              >
                {EMPLOYEE_RANGES.map((r) => (
                  <option key={r} value={r} className="bg-[#0b0b0c]">
                    {r}
                  </option>
                ))}
              </select>
            </ConsoleField>
            <ConsoleField label="Facturación mensual (€)">
              <input
                type="number"
                min={0}
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(Number(e.target.value) || 0)}
                className={fieldClass}
              />
            </ConsoleField>
            <ConsoleField label="Clientes actuales">
              <input
                type="number"
                min={0}
                value={currentCustomers}
                onChange={(e) => setCurrentCustomers(Number(e.target.value) || 0)}
                className={fieldClass}
              />
            </ConsoleField>
            <ConsoleField label="Ticket medio (€)">
              <input
                type="number"
                min={0}
                value={avgTicket}
                onChange={(e) => setAvgTicket(Number(e.target.value) || 0)}
                className={fieldClass}
              />
            </ConsoleField>
            <ConsoleField label="Leads mensuales">
              <input
                type="number"
                min={0}
                value={monthlyLeads}
                onChange={(e) => setMonthlyLeads(Number(e.target.value) || 0)}
                className={fieldClass}
              />
            </ConsoleField>
            <ConsoleField label="Conversión actual (%)">
              <input
                type="number"
                min={0}
                max={100}
                value={conversionRate}
                onChange={(e) => setConversionRate(Number(e.target.value) || 0)}
                className={fieldClass}
              />
            </ConsoleField>
          </div>
        </div>

        <div className="flex flex-col justify-between p-6 sm:p-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">Potencial detectado</p>
            <p className="mt-3 font-display text-4xl font-semibold text-white sm:text-5xl">
              <AnimatedCurrency value={result.totalPotentialMin} />
              <span className="mx-1.5 text-white/25">–</span>
              <AnimatedCurrency value={result.totalPotentialMax} />
            </p>
            <p className="mt-1 font-mono text-xs text-white/30">/ mes</p>
            <EstimateNote className="mt-3 text-white/35" />

            <ul className="landing-hairline mt-7 divide-y divide-white/[0.06] border-t">
              {result.prioritized.map((o) => (
                <li key={o.category} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="text-white/50">{o.name}</span>
                  <span className="font-mono text-gold-300">
                    {formatCurrency(o.potentialMin)}–{formatCurrency(o.potentialMax)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Link href="/signup" className="mt-8">
            <Button
              variant="secondary"
              className="w-full border-0 bg-white text-[#0b0b0c] shadow-none hover:bg-white/90"
              size="lg"
            >
              Ver mi auditoría completa
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
