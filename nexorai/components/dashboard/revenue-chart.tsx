'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/utils';

export interface RevenuePoint {
  date: string;
  cumulative: number;
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted">
        Activa una oportunidad para empezar a ver evolución aquí.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#39bd8a" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#39bd8a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(220 16% 17%)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'hsl(220 10% 62%)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'hsl(220 10% 62%)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v) => formatCurrency(v)}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(220 22% 9%)',
              border: '1px solid hsl(220 16% 17%)',
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: 'hsl(40 22% 96%)' }}
            formatter={(value: number) => [formatCurrency(value), 'Potencial acumulado']}
          />
          <Area type="monotone" dataKey="cumulative" stroke="#39bd8a" strokeWidth={2} fill="url(#revenueFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
