/**
 * Mockup del asistente para la landing: mismo lenguaje visual que el chat real
 * (components/Asistente.tsx — burbuja violeta a la derecha, blanca a la
 * izquierda), pero con una conversación fija, no conectada a la IA de verdad.
 * Se marca como ejemplo en el pie: fingir que es una demo en vivo cuando no lo
 * es sería el tipo de cosa que luego hay que desmentir.
 */
export default function DemoAsistente() {
  return (
    <div className="card-flotante w-full max-w-md p-5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-sm text-white"
        >
          🤖
        </span>
        <p className="text-sm font-bold tracking-tight">Asistente</p>
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-2xl bg-brand-600 px-3.5 py-2.5 text-xs leading-relaxed text-white">
            ¿Qué tengo pendiente para el viernes?
          </p>
        </div>
        <div className="flex justify-start">
          <p className="max-w-[90%] rounded-2xl border border-ink/10 bg-white/80 px-3.5 py-2.5 text-xs leading-relaxed text-ink/80">
            Dos cosas: <strong className="font-semibold">«Enviar propuesta a Marta»</strong>{' '}
            (urgente) y <strong className="font-semibold">«Revisar maqueta»</strong>. Las dos
            vencen el viernes.
          </p>
        </div>
      </div>

      <p className="mt-4 border-t border-ink/10 pt-3 text-[11px] text-ink/40">
        Ejemplo ilustrativo. Con tu cuenta, responde sobre tus propias notas y tareas.
      </p>
    </div>
  );
}
