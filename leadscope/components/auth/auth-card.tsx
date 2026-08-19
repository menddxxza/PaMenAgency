import Link from 'next/link';
import { Radar } from 'lucide-react';

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-grid px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-semibold text-fg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Radar className="h-4 w-4" />
          </span>
          LeadScope
        </Link>

        <div className="rounded-2xl border border-border bg-surface p-7 shadow-card-hover">
          <h1 className="text-xl font-semibold text-fg">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      </div>
    </div>
  );
}
