import Link from 'next/link';
import { Logomark, Wordmark } from '@/components/logomark';

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
    <div className="flex min-h-screen items-center justify-center bg-grid bg-fade-mask px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <Logomark />
          <Wordmark />
        </Link>

        <div className="rounded-2xl border border-border bg-surface p-7 shadow-card-hover">
          <h1 className="font-display text-xl font-semibold text-fg">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      </div>
    </div>
  );
}
