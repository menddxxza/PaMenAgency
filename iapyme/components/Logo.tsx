export default function Logo({ inverso = false }: { inverso?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600
                   text-sm font-black text-white"
        aria-hidden
      >
        IA
      </span>
      <span className={`text-lg font-extrabold ${inverso ? 'text-white' : 'text-ink'}`}>
        IAPyme
      </span>
    </span>
  );
}
