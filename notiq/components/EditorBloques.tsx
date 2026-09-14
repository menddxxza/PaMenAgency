'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  aMarkdown,
  desdeMarkdown,
  nuevoBloque,
  TIPOS_BLOQUE,
  type Bloque,
  type TipoBloque,
} from '@/lib/bloques';
import { borrarAdjunto, subirAdjunto } from '@/app/(app)/adjuntos/actions';

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
  tabla: '',
};

const MARCADORES: Record<TipoBloque, string> = {
  titulo: 'Título',
  subtitulo: 'Subtítulo',
  texto: 'Escribe, o usa "# ", "- ", "[] ", "> ", "/" …',
  lista: 'Elemento',
  tarea: 'Tarea',
  cita: 'Cita',
  codigo: 'Código',
  imagen: 'Descripción',
  tabla: '',
};

/** Emoji por tipo de bloque, solo para el menú de comandos "/". */
const ICONOS_COMANDO: Record<TipoBloque, string> = {
  texto: '📄',
  titulo: '🔠',
  subtitulo: '🔡',
  lista: '•',
  tarea: '☑️',
  codigo: '💻',
  cita: '❝',
  imagen: '🖼️',
  tabla: '▦',
};

export default function EditorBloques({
  bloques,
  onCambio,
  noteId,
}: {
  bloques: Bloque[];
  onCambio: (bloques: Bloque[]) => void;
  /** Para subir imágenes como adjuntos de esta nota. */
  noteId: string;
}) {
  // Índice del bloque que debe recibir el foco tras el próximo render, o null.
  const [foco, setFoco] = useState<number | null>(null);
  const refs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const inputImagenRef = useRef<HTMLInputElement | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState<string | null>(null);

  // Menú de comandos ("/" al principio de un bloque de texto): comandoAbierto es
  // el índice del bloque con el menú abierto, o null. indiceComando es la opción
  // resaltada dentro de la lista ya filtrada por filtroComando.
  const [comandoAbierto, setComandoAbierto] = useState<number | null>(null);
  const [filtroComando, setFiltroComando] = useState('');
  const [indiceComando, setIndiceComando] = useState(0);

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

  function comandosFiltrados(filtro: string) {
    const q = filtro.trim().toLowerCase();
    if (!q) return TIPOS_BLOQUE;
    return TIPOS_BLOQUE.filter((t) => t.etiqueta.toLowerCase().includes(q) || t.tipo.includes(q));
  }

  function elegirComando(indice: number, tipo: TipoBloque) {
    const nuevo = nuevoBloque(tipo, '');
    onCambio(bloques.map((b, i) => (i === indice ? { ...nuevo, id: b.id } : b)));
    setComandoAbierto(null);
    setFiltroComando('');
    setFoco(indice);
  }

  function escribir(indice: number, valor: string) {
    const bloque = bloques[indice];

    // Los atajos solo transforman bloques de texto: en un bloque de código "# " es
    // un comentario, no un título.
    if (bloque.tipo === 'texto') {
      const atajo = ATAJOS.find(({ patron }) => patron.test(valor));
      if (atajo) {
        actualizar(indice, { tipo: atajo.tipo, texto: '' });
        setComandoAbierto(null);
        return;
      }

      // "/" al principio abre el menú de comandos; lo que se escriba después filtra
      // la lista. Deja de estarlo en cuanto el texto ya no empieza por "/" (borrar
      // la barra, o pegar algo encima) — no hace falta un Escape para eso.
      if (valor.startsWith('/')) {
        setComandoAbierto(indice);
        setFiltroComando(valor.slice(1));
        setIndiceComando(0);
      } else if (comandoAbierto === indice) {
        setComandoAbierto(null);
        setFiltroComando('');
      }
    }

    actualizar(indice, { texto: valor });
  }

  function pulsar(evento: React.KeyboardEvent<HTMLTextAreaElement>, indice: number) {
    const campo = evento.currentTarget;
    const bloque = bloques[indice];

    // Con el menú de comandos abierto, las flechas/Enter/Escape lo gobiernan a él
    // y no al bloque — el resto de teclas (letras, Backspace…) siguen su camino
    // normal más abajo, que es lo que hace que escribir seguido de "/" filtre.
    if (comandoAbierto === indice) {
      const opciones = comandosFiltrados(filtroComando);
      if (evento.key === 'ArrowDown') {
        evento.preventDefault();
        setIndiceComando((i) => Math.min(i + 1, Math.max(opciones.length - 1, 0)));
        return;
      }
      if (evento.key === 'ArrowUp') {
        evento.preventDefault();
        setIndiceComando((i) => Math.max(i - 1, 0));
        return;
      }
      if (evento.key === 'Enter') {
        evento.preventDefault();
        if (opciones[indiceComando]) elegirComando(indice, opciones[indiceComando].tipo);
        return;
      }
      if (evento.key === 'Escape') {
        evento.preventDefault();
        setComandoAbierto(null);
        setFiltroComando('');
        return;
      }
    }

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
    const pareceMarkdown = /\n/.test(texto) && /^(#{1,2} |[-*] |> |```|\|.*\|)/m.test(texto);
    if (!pareceMarkdown || bloques[indice].tipo === 'codigo') return;

    evento.preventDefault();
    const nuevos = desdeMarkdown(texto);
    const siguientes = [...bloques];
    const actual = siguientes[indice];

    // Si el bloque donde se pega está vacío, se sustituye; si no, se inserta detrás.
    // Los dos casos desplazan el último bloque pegado a un índice distinto: al
    // sustituir, ese bloque queda en indice + nuevos.length - 1 (se ha quitado 1);
    // al insertar detrás, en indice + nuevos.length (indice se conserva). Usar la
    // misma fórmula para los dos casos dejaba el foco un bloque más allá del que
    // se acababa de pegar cuando se sustituía un bloque vacío que no era el último.
    let indiceFinal: number;
    if (!actual.texto) {
      siguientes.splice(indice, 1, ...nuevos);
      indiceFinal = indice + nuevos.length - 1;
    } else {
      siguientes.splice(indice + 1, 0, ...nuevos);
      indiceFinal = indice + nuevos.length;
    }

    onCambio(siguientes);
    setFoco(Math.min(indiceFinal, siguientes.length - 1));
  }

  function copiarMarkdown() {
    navigator.clipboard?.writeText(aMarkdown(bloques));
  }

  /**
   * El bloque 'imagen' existe en el modelo desde siempre, pero hasta ahora solo se
   * podía rellenar pegando markdown con una imagen ya subida a otro sitio — nada en
   * el editor sabía subir un archivo. Reutiliza el mismo mecanismo de los adjuntos
   * (subirAdjunto guarda el archivo en la base de datos y confirma que la nota es
   * del usuario) en vez de inventar una ruta de subida aparte.
   */
  async function subirImagen(archivo: File) {
    setErrorImagen(null);
    setSubiendoImagen(true);

    const fd = new FormData();
    fd.set('archivo', archivo);
    fd.set('noteId', noteId);
    const resultado = await subirAdjunto(fd);

    setSubiendoImagen(false);

    if (!resultado.ok || !resultado.adjunto) {
      setErrorImagen(!resultado.ok ? resultado.error : 'No se ha podido subir la imagen.');
      return;
    }

    const bloque = { ...nuevoBloque('imagen', ''), url: `/api/adjuntos/${resultado.adjunto.id}` };
    onCambio([...bloques, bloque]);
    setFoco(bloques.length);
  }

  // Borra también el adjunto de verdad: sin esto, quitar una imagen del editor deja
  // el archivo huérfano en la base de datos para siempre.
  function quitarImagen(indice: number) {
    const url = bloques[indice].url;
    const id = url?.split('/').pop();
    if (id) void borrarAdjunto(id);
    onCambio(bloques.filter((_, i) => i !== indice));
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

          <div className="min-w-0 flex-1">
            {bloque.tipo === 'imagen' && bloque.url && (
              <div className="group/imagen relative mb-1.5 inline-block max-w-full">
                {/* eslint-disable-next-line @next/next/no-img-element -- imagen de un
                    adjunto propio, servida por /api/adjuntos/[id]: no es una URL
                    externa que valga la pena optimizar con next/image. */}
                <img
                  src={bloque.url}
                  alt={bloque.texto || 'Imagen de la nota'}
                  className="max-h-96 rounded-xl border border-ink/10 object-contain"
                />
                <button
                  type="button"
                  onClick={() => quitarImagen(indice)}
                  aria-label="Quitar imagen"
                  // bg-[#141319]/70 fijo, no bg-ink/70: mismo motivo que el panel de
                  // /entrar — este botón flota sobre una imagen cualquiera y necesita
                  // contraste garantizado, no uno que se invierta con el tema.
                  className="absolute right-2 top-2 rounded-full bg-[#141319]/70 px-2 py-1 text-xs text-white opacity-0 transition group-hover/imagen:opacity-100"
                >
                  Quitar
                </button>
              </div>
            )}

            {bloque.tipo === 'tabla' ? (
              <TablaBloque
                filas={bloque.filas ?? [['', ''], ['', '']]}
                onCambiar={(filas) => actualizar(indice, { filas })}
                onBorrar={() => onCambio(bloques.filter((_, i) => i !== indice))}
              />
            ) : (
              <div className="relative">
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

                {comandoAbierto === indice && (
                  <MenuComandos
                    opciones={comandosFiltrados(filtroComando)}
                    indiceResaltado={indiceComando}
                    onResaltar={setIndiceComando}
                    onElegir={(tipo) => elegirComando(indice, tipo)}
                    onCerrar={() => {
                      setComandoAbierto(null);
                      setFiltroComando('');
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {errorImagen && (
        <p role="alert" className="pt-4 text-xs text-red-700">
          {errorImagen}
        </p>
      )}

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
        <button
          type="button"
          onClick={() => inputImagenRef.current?.click()}
          disabled={subiendoImagen}
          className="btn-fantasma text-xs"
        >
          {subiendoImagen ? 'Subiendo imagen…' : '+ Imagen'}
        </button>
        <button
          type="button"
          onClick={() => {
            onCambio([...bloques, nuevoBloque('tabla')]);
            setFoco(bloques.length);
          }}
          className="btn-fantasma text-xs"
        >
          + Tabla
        </button>
        <input
          ref={inputImagenRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            e.target.value = '';
            if (archivo) void subirImagen(archivo);
          }}
        />
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

/**
 * Menú de comandos ("/" al principio de un bloque de texto): mismo patrón de
 * capa transparente para cerrar al hacer clic fuera que ya usan PaletaComandos.tsx
 * y los desplegables de NotaEditor.tsx.
 */
function MenuComandos({
  opciones,
  indiceResaltado,
  onResaltar,
  onElegir,
  onCerrar,
}: {
  opciones: { tipo: TipoBloque; etiqueta: string; atajo: string }[];
  indiceResaltado: number;
  onResaltar: (indice: number) => void;
  onElegir: (tipo: TipoBloque) => void;
  onCerrar: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onCerrar}
        className="fixed inset-0 z-10 cursor-default"
      />
      <div className="card absolute left-0 top-full z-20 mt-1 w-56 overflow-hidden py-1.5">
        {opciones.length === 0 ? (
          <p className="px-3.5 py-2 text-xs text-ink/45">Sin resultados.</p>
        ) : (
          opciones.map((op, i) => (
            <button
              key={op.tipo}
              type="button"
              // onMouseDown y no onClick: el clic primero le quita el foco al
              // textarea (blur), y con onClick ese blur llegaría a tiempo de que
              // React ya hubiera desmontado este menú antes de procesar la
              // selección. mousedown se dispara antes del blur.
              onMouseDown={(e) => {
                e.preventDefault();
                onElegir(op.tipo);
              }}
              onMouseEnter={() => onResaltar(i)}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm ${
                i === indiceResaltado ? 'bg-brand-50 text-brand-700' : 'text-ink/80'
              }`}
            >
              <span aria-hidden>{ICONOS_COMANDO[op.tipo]}</span>
              {op.etiqueta}
            </button>
          ))
        )}
      </div>
    </>
  );
}

/** Bloque de tabla: celdas editables, sin el textarea compartido del resto de bloques. */
function TablaBloque({
  filas,
  onCambiar,
  onBorrar,
}: {
  filas: string[][];
  onCambiar: (filas: string[][]) => void;
  onBorrar: () => void;
}) {
  const columnas = filas[0]?.length ?? 0;

  function celda(f: number, c: number, valor: string) {
    onCambiar(filas.map((fila, i) => (i === f ? fila.map((cel, j) => (j === c ? valor : cel)) : fila)));
  }

  function anadirFila() {
    onCambiar([...filas, Array(columnas || 2).fill('')]);
  }

  function anadirColumna() {
    onCambiar(filas.map((fila) => [...fila, '']));
  }

  function quitarFila(f: number) {
    if (filas.length <= 1) return;
    onCambiar(filas.filter((_, i) => i !== f));
  }

  function quitarUltimaColumna() {
    if (columnas <= 1) return;
    onCambiar(filas.map((fila) => fila.slice(0, -1)));
  }

  return (
    <div className="my-1">
      <div className="overflow-x-auto rounded-lg border border-ink/10">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {filas.map((fila, f) => (
              <tr key={f} className="group/fila">
                {fila.map((celdaTexto, c) => (
                  <td key={c} className="border border-ink/10 p-0">
                    <input
                      value={celdaTexto}
                      onChange={(e) => celda(f, c, e.target.value)}
                      aria-label={`Celda, fila ${f + 1}, columna ${c + 1}`}
                      className="w-full min-w-[7rem] bg-transparent px-2.5 py-1.5 outline-none focus:bg-ink/[0.03]"
                    />
                  </td>
                ))}
                <td className="w-0 border-0 pl-1">
                  <button
                    type="button"
                    onClick={() => quitarFila(f)}
                    aria-label={`Quitar la fila ${f + 1}`}
                    className="px-1 text-xs text-ink/25 opacity-0 transition hover:text-red-600 group-hover/fila:opacity-100"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-1.5 flex items-center gap-3 text-xs text-ink/45">
        <button type="button" onClick={anadirFila} className="hover:text-ink">
          + fila
        </button>
        <button type="button" onClick={anadirColumna} className="hover:text-ink">
          + columna
        </button>
        {columnas > 1 && (
          <button type="button" onClick={quitarUltimaColumna} className="hover:text-ink">
            − columna
          </button>
        )}
        <button type="button" onClick={onBorrar} className="ml-auto hover:text-red-600">
          Borrar tabla
        </button>
      </div>
    </div>
  );
}
