import Asistente from '@/components/Asistente';

export const metadata = { title: 'Asistente · Notiq' };

export default function AsistentePage() {
  return (
    <div className="flex h-full flex-col px-5 py-6 sm:px-8">
      <header className="mb-6 shrink-0">
        <h1 className="text-2xl font-extrabold tracking-tight">Asistente</h1>
        <p className="mt-1 text-sm text-ink/55">
          Con contexto de tus notas y de tus tareas abiertas.
        </p>
      </header>

      <Asistente />
    </div>
  );
}
