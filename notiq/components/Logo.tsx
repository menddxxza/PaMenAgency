export default function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-lg font-extrabold tracking-tight ${
        claro ? 'text-white' : 'text-ink'
      }`}
    >
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-sm font-black text-white"
      >
        N
      </span>
      Notiq
    </span>
  );
}
