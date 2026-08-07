'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditorBloques from '@/components/EditorBloques';
import PanelIa from '@/components/PanelIa';
import { aMarkdown, type Bloque } from '@/lib/bloques';
import { alternarFavorita, guardarNota } from '@/app/(app)/notas/actions';

const RETARDO_GUARDADO = 900;

type Estado = 'guardado' | 'escribiendo' | 'guardando' | 'error';

export default function NotaEditor({
  id,
  tituloInicial,
  bloquesIniciales,
  favoritaInicial,
  resumenInicial,
  onFavoritaCambiada,
}: {
  id: string;
  tituloInicial: string;
  bloquesIniciales: Bloque[];
  favoritaInicial: boolean;
  resumenInicial: string | null;
  /** Se llama al marcar/desmarcar favorita. Sin esto (uso standalone en
   * /notas/[id]) se refresca la ruta del servidor; el panel único pasa aquí su
   * propio refetch, porque ahí no hay ruta de servidor que refrescar. */
  onFavoritaCambiada?: () => void;
}) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(tituloInicial);
  const [bloques, setBloques] = useState(bloquesIniciales);
  const [favorita, setFavorita] = useState(favoritaInicial);
  const [estado, setEstado] = useState<Estado>('guardado');

  const sucio = useRef(false);
  const enVuelo = useRef(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Lo último escrito, para que el guardado use el valor actual y no el de la
  // clausura con la que se programó el temporizador.
  const ultimo = useRef({ titulo: tituloInicial, bloques: bloquesIniciales });

  /*
   * Sin serializar, dos guardados que se solapan (red lenta + una tecla de más, o
   * Ctrl+S mientras el debounce ya está en vuelo) pueden llegar en orden distinto al
   * que salieron: si el más lento responde después, sobrescribe en la base de datos
   * lo que el más rápido ya había guardado, y la última edición desaparece sin que
   * la interfaz avise (queda en "Guardado"). `enVuelo` asegura que solo hay una
   * petición de guardado activa a la vez; si llegan cambios mientras tanto, se
   * encadena otro guardado justo al terminar en vez de esperar al siguiente debounce.
   */
  const guardar = useCallback(async () => {
    if (enVuelo.current || !sucio.current) return;
    enVuelo.current = true;
    sucio.current = false;
    setEstado('guardando');

    const { titulo: t, bloques: b } = ultimo.current;
    const resultado = await guardarNota(id, t, b);
    enVuelo.current = false;

    if (!resultado.ok) {
      // La siguiente tecla también volvería a marcar sucio, pero no hay que
      // esperar a que el usuario teclee para reintentar un guardado fallido.
      sucio.current = true;
      setEstado('error');
      return;
    }

    if (sucio.current) void guardar();
    else setEstado('guardado');
  }, [id]);

  const programarGuardado = useCallback(
    (nuevoTitulo: string, nuevosBloques: Bloque[]) => {
      ultimo.current = { titulo: nuevoTitulo, bloques: nuevosBloques };
      sucio.current = true;
      setEstado('escribiendo');

      if (temporizador.current) clearTimeout(temporizador.current);
      temporizador.current = setTimeout(guardar, RETARDO_GUARDADO);
    },
    [guardar],
  );

  // Cerrar la pestaña con cambios sin guardar avisa. No siempre se puede evitar la
  // pérdida (el navegador puede matar la petición), pero al menos no es silenciosa.
  useEffect(() => {
    function alSalir(evento: BeforeUnloadEvent) {
      if (sucio.current) evento.preventDefault();
    }
    window.addEventListener('beforeunload', alSalir);
    return () => {
      window.removeEventListener('beforeunload', alSalir);
      if (temporizador.current) clearTimeout(temporizador.current);
      // beforeunload no se dispara al navegar dentro de la app (clic en un Link):
      // ahí lo que desmonta este componente es el router de Next, no una descarga
      // de página. Sin este flush, cancelar el timer sin más perdía en silencio la
      // última edición si el usuario navegaba antes de que venciera el debounce.
      // La petición sigue su curso aunque el componente ya no esté montado.
      void guardar();
    };
  }, [guardar]);

  // Ctrl/Cmd+S guarda ya, sin esperar al debounce.
  useEffect(() => {
    function atajo(evento: KeyboardEvent) {
      if ((evento.metaKey || evento.ctrlKey) && evento.key === 's') {
        evento.preventDefault();
        if (temporizador.current) clearTimeout(temporizador.current);
        void guardar();
      }
    }
    window.addEventListener('keydown', atajo);
    return () => window.removeEventListener('keydown', atajo);
  }, [guardar]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0">
        <div className="mb-4 flex items-center gap-3 text-xs text-ink/45">
          <span aria-live="polite">
            {estado === 'guardando'
              ? 'Guardando…'
              : estado === 'escribiendo'
                ? 'Sin guardar'
                : estado === 'error'
                  ? '⚠ No se ha podido guardar'
                  : 'Guardado'}
          </span>
          <button
            type="button"
            onClick={async () => {
              const siguiente = !favorita;
              setFavorita(siguiente);
              const resultado = await alternarFavorita(id, siguiente);
              if (!resultado.ok) setFavorita(!siguiente);
              else if (onFavoritaCambiada) onFavoritaCambiada();
              else router.refresh();
            }}
            className="hover:text-ink"
            aria-pressed={favorita}
          >
            {favorita ? '⭐ Favorita' : '☆ Marcar favorita'}
          </button>
        </div>

        <input
          value={titulo}
          onChange={(e) => {
            setTitulo(e.target.value);
            programarGuardado(e.target.value, bloques);
          }}
          placeholder="Sin título"
          maxLength={200}
          aria-label="Título de la nota"
          className="mb-6 w-full bg-transparent text-4xl font-extrabold tracking-tight outline-none placeholder:text-ink/20"
        />

        <EditorBloques
          bloques={bloques}
          onCambio={(siguientes) => {
            setBloques(siguientes);
            programarGuardado(titulo, siguientes);
          }}
        />
      </div>

      <PanelIa
        noteId={id}
        titulo={titulo}
        markdown={aMarkdown(bloques)}
        resumenInicial={resumenInicial}
      />
    </div>
  );
}
