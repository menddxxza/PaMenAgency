import { Logomark, Wordmark } from '@/components/logomark';
import { Progress } from '@/components/ui/progress';

export function OnboardingCard({
  step,
  totalSteps,
  title,
  subtitle,
  children,
}: {
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-grid bg-fade-mask px-4 py-12">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Logomark />
          <Wordmark />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-7 shadow-card-hover sm:p-8">
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>
                Paso {step} de {totalSteps}
              </span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="mt-2" />
          </div>

          <h1 className="font-display text-xl font-semibold text-fg">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
