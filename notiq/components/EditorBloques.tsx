'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  aMarkdown,
  desdeMarkdown,
  nuevoBloque,
  type Bloque,
  type TipoBloque,
} from '@/lib/bloques';

/**
 * Editor por bloques.
 *
 * Cada bloque es un <textarea> que se autoajusta al alto de su contenido, no un
 * contenteditable. Es menos vistoso de implementar pero mucho más predecible: el
 * autocompletado del móvil, el corrector, deshacer/rehacer y los lectores de
 * pantalla funcionan sin tener que reimplementarlos.
 *
 * Los atajos de markdown se aplican al escribir ("# " al principio de un bloque lo
 * convierte en título) y al pegar (un texto con markdown se descompone en bloques).
 */

const ATAJOS: { patron: RegExp; tipo: TipoBloque }[] = [
  { patron: /^## $/, tipo: 'subtitulo' },
  { patron: /^# $/, tipo: 'titulo' },
  { patron: /^[-*] $/, tipo: 'lista' },
  { patron: /^\[\] $/, tipo: 'tarea' },
  { patron: /^> $/, tipo: 'cita' },
  { patron: /^```$/, tipo: 'codigo' },
];

const ESTILOS: Record<TipoBloque, string> = {
  titulo: 'text-3xl font-extrabold tracking-tight',
  subtitulo: 'text-xl font-bold tracking-tight',
  texto: 'text-[15px] leading-relaxed',
  lista: 'text-[15px] leading-relaxed',
  tarea: 'text-[15px] leading-relaxed',
  cita: 'text-[15px] italic leading-relaxed text-ink/70',
  codigo: 'font-mono text-[13px] leading-relaxed',
  imagen: 'text-sm text-ink/60',
};

const MARCADORES: Record<TipoBloque, string> = {
  titulo: 'Título',
  subtitulo: 'Subtítulo',
  texto: 'Escribe, o usa "# ", "- ", "[] ", "> "…',
  lista: 'Elemento',
  tarea: 'Tarea',
  cita: 'Cita',
  codigo: 'Código',
  imagen: 'Descripción',
};

export default function EditorBloques({
  bloques,
  onCambio,
}: {
  bloques: Bloque[];
  onCambio: (bloques: Bloque[]) => void;
}) {
  // Índice del bloque que debe recibir el foco tras el próximo render, o null.
  const [foco, setFoco] = useState<number | null>(null);
  const refs = useRef<(HTMLTextAreaElement | null)[]>([]);

  useEffect(() => {
    if (foco === null) return;
    const campo = refs.current[foco];
    if (campo) {
      campo.focus();
      const fin = campo.value.length;
      campo.setSelectionRange(fin, fin);
    }
    setFoco(null);
  }, [foco, bloques]);

  const actualizar = useCallback(
    (indice: number, cambios: Partial<Bloque>) => {
      onCambio(bloques.map((b, i) => (i === indice ? { ...b, ...cambios } : b)));
    },
    [bloques, onCambio],
  );

  function escribir(indice: number, valor: string) {
    const bloque = bloques[indice];

    // Los atajos solo transforman bloques de texto: en un bloque de código "# " es
    // un comentario, no un título.
    if (bloque.tipo === 'texto') {
      const atajo = ATAJOS.find(({ patron }) => patron.test(valor));
      if (atajo) {
        actualizar(indice, { tipo: atajo.tipo, texto: '' });
        return;
      }
    }

    actualizar(indice, { texto: valor });
  }

  function pulsar(evento: React.KeyboardEvent<HTMLTextAreaElement>, indice: number) {
    const campo = evento.currentTarget;
    const bloque = bloques[indice];

    if (evento.key === 'Enter' && !evento.shiftKey) {
      // En un bloque de código Enter es un salto de línea, no un bloque nuevo.
      if (bloque.tipo === 'codigo') return;

      evento.preventDefault();

      // Enter en un elemento de lista vacío sale de la lista, como en cualquier
      // editor: convierte el bloque en texto en lugar de encadenar vacíos.
      if (!bloque.texto && (bloque.tipo === 'lista' || bloque.tipo === 'tarea')) {
        actualizar(indice, { tipo: 'texto' });
        return;
      }

      // Enter en medio del texto parte el bloque en dos por donde está el cursor.
      const corte = campo.selectionStart;
      const antes = bloque.texto.slice(0, corte);
      const despues = bloque.texto.slice(corte);
      const hereda = bloque.tipo === 'lista' || bloque.tipo === 'tarea' ? bloque.tipo : 'texto';

      const siguientes = [...bloques];
      siguientes[indice] = { ...bloque, texto: antes };
      siguientes.splice(indice + 1, 0, nuevoBloque(hereda, despues));

      onCambio(siguientes);
      setFoco(indice + 1);
      return;
    }

    if (evento.key === 'Backspace' && campo.selectionStart === 0 && campo.selectionEnd === 0) {
      // Un bloque con formato primero vuelve a texto; solo el segundo Backspace lo
      // borra. Así no se pierde lo escrito por pulsar de más.
      if (bloque.tipo !== 'texto') {
        evento.preventDefault();
        actualizar(indice, { tipo: 'texto' });
        return;
      }

      if (indice > 0) {
        evento.preventDefault();
        const anterior = bloques[indice - 1];
        const siguientes = [...bloques];
        siguientes[indice - 1] = { ...anterior, texto: anterior.texto + bloque.texto };
        siguientes.splice(indice, 1);
        onCambio(siguientes);
        setFoco(indice - 1);
      }
      return;
    }

    if (evento.key === 'ArrowUp' && campo.selectionStart === 0 && indice > 0) {
      evento.preventDefault();
      setFoco(indice - 1);
      return;
    }

    if (
      evento.key === 'ArrowDown' &&
      campo.selectionStart === campo.value.length &&
      indice < bloques.length - 1
    ) {
      evento.preventDefault();
      setFoco(indice + 1);
    }
  }

  function pegar(evento: React.ClipboardEvent<HTMLTextAreaElement>, indice: number) {
    const texto = evento.clipboardData.getData('text/plain');

    // Solo se interpreta como markdown lo que tiene varias líneas o marcas claras.
    // Pegar una palabra suelta debe seguir siendo pegar una palabra suelta.
    const pareceMarkdown = /\n/.test(texto) && /^(#{1,2} |[-*] |> |```)/m.test(texto);
    if (!pareceMarkdown || bloques[indice].tipo === 'codigo') return;

    evento.preventDefault();
    const nuevos = desdeMarkdown(texto);
    const siguientes = [...bloques];
    const actual = siguientes[indice];

    // Si el bloque donde se pega está vacío, se sustituye; si no, se inserta detrás.
    if (!actual.texto) siguientes.splice(indice, 1, ...nuevos);
    else siguientes.splice(indice + 1, 0, ...nuevos);

    onCambio(siguientes);
    setFoco(Math.min(indice + nuevos.length, siguientes.length - 1));
  }

  function copiarMarkdown() {
    navigator.clipboard?.writeText(aMarkdown(bloques));
  }

  return (
    <div className="space-y-1">
      {bloques.map((bloque, indice) => (
        <div key={bloque.id} className="group relative flex items-start gap-2">
          <span
            aria-hidden
            className={`select-none pt-1.5 text-ink/30 ${
              bloque.tipo === 'lista' ? '' : 'invisible'
            }`}
          >
            •
          </span>

          {bloque.tipo === 'tarea' && (
            <input
              type="checkbox"
              checked={bloque.hecho ?? false}
              onChange={(e) => actualizar(indice, { hecho: e.target.checked })}
              aria-label={`Marcar "${bloque.texto || 'tarea'}" como hecha`}
              className="mt-2 h-4 w-4 shrink-0 rounded border-ink/25 text-brand-600 focus:ring-brand-400"
            />
          )}

          <textarea
            ref={(el) => {
              refs.current[indice] = el;
            }}
            value={bloque.texto}
            rows={1}
            onChange={(e) => {
              escribir(indice, e.target.value);
              autoAlto(e.target);
            }}
            onKeyDown={(e) => pulsar(e, indice)}
            onPaste={(e) => pegar(e, indice)}
            onFocus={(e) => autoAlto(e.target)}
            placeholder={MARCADORES[bloque.tipo]}
            className={`w-full resize-none bg-transparent outline-none placeholder:text-ink/25 ${
              ESTILOS[bloque.tipo]
            } ${bloque.tipo === 'cita' ? 'border-l-2 border-brand-300 pl-3' : ''} ${
              bloque.tipo === 'codigo' ? 'rounded-lg bg-ink/[0.04] p-3' : ''
            } ${bloque.tipo === 'tarea' && bloque.hecho ? 'text-ink/40 line-through' : ''}`}
          />
        </div>
      ))}

      <div className="flex items-center gap-2 pt-6">
        <button
          type="button"
          onClick={() => {
            onCambio([...bloques, nuevoBloque()]);
            setFoco(bloques.length);
          }}
          className="btn-fantasma text-xs"
        >
          + Bloque
        </button>
        <button type="button" onClick={copiarMarkdown} className="btn-fantasma text-xs">
          Copiar como markdown
        </button>
      </div>
    </div>
  );
}

/** Un textarea de una fila no crece solo: hay que recalcular el alto en cada tecla. */
function autoAlto(campo: HTMLTextAreaElement) {
  campo.style.height = 'auto';
  campo.style.height = `${campo.scrollHeight}px`;
}
