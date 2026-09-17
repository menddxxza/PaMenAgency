'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditorBloques from '@/components/EditorBloques';
import EtiquetasNota from '@/components/EtiquetasNota';
import PanelIa from '@/components/PanelIa';
import Adjuntos from '@/components/panel/Adjuntos';
import { aMarkdown, comoBloques, nuevoBloque, type Bloque } from '@/lib/bloques';
import {
  alternarCompartir,
  alternarFavorita,
  crearRecordatorioDeNota,
  duplicarNota,
  guardarNota,
  obtenerNota,
  obtenerNotas,
  obtenerNotasRelacionadas,
  type NotaRelacionada,
} from '@/app/(app)/notas/actions';

const RETARDO_GUARDADO = 900;

type Estado = 'guardado' | 'escribiendo' | 'guardando' | 'error';

export type NotaEditorHandle = {
  /** Fuerza el guardado pendiente ya, sin esperar al debounce, y no resuelve
   * hasta que termina. Antes de cerrar la nota (ver cerrarNota en
   * SeccionNotas.tsx) hay que esperar a esto: si se cierra y se vuelve a
   * abrir la nota antes de que el guardado normal termine, se lee de la base
   * de datos la versión de justo antes de escribir — la última edición no se
   * ha perdido todavía, pero parece que sí porque llega tarde. */
  guardarSiHaceFalta: () => Promise<void>;
};

const NotaEditor = forwardRef<
  NotaEditorHandle,
  {
    id: string;
    tituloInicial: string;
    bloquesIniciales: Bloque[];
    favoritaInicial: boolean;
    resumenInicial: string | null;
    etiquetasIniciales?: string[];
    /** Etiquetas ya usadas en otras notas del usuario, para sugerirlas al escribir. */
    etiquetasConocidas?: string[];
    compartidaInicial?: boolean;
    /** Se llama al marcar/desmarcar favorita. Sin esto (uso standalone en
     * /notas/[id]) se refresca la ruta del servidor; el panel único pasa aquí su
     * propio refetch, porque ahí no hay ruta de servidor que refrescar. */
    onFavoritaCambiada?: () => void;
  }
>(function NotaEditor(
  {
    id,
    tituloInicial,
    bloquesIniciales,
    favoritaInicial,
    resumenInicial,
    etiquetasIniciales = [],
    etiquetasConocidas = [],
    compartidaInicial = false,
    onFavoritaCambiada,
  },
  ref,
) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(tituloInicial);
  const [bloques, setBloques] = useState(bloquesIniciales);
  const [favorita, setFavorita] = useState(favoritaInicial);
  const [estado, setEstado] = useState<Estado>('guardado');
  const [menuExportar, setMenuExportar] = useState(false);
  const [recordatorioAbierto, setRecordatorioAbierto] = useState(false);
  const [mensajeRecordatorio, setMensajeRecordatorio] = useState<string | null>(null);
  const [menuVincular, setMenuVincular] = useState(false);
  const [qVincular, setQVincular] = useState('');
  const [resultadosVincular, setResultadosVincular] = useState<{ id: string; titulo: string }[]>([]);
  const [relacionadas, setRelacionadas] = useState<NotaRelacionada[]>([]);
  const [duplicando, setDuplicando] = useState(false);
  const [compartida, setCompartida] = useState(compartidaInicial);
  const [menuCompartir, setMenuCompartir] = useState(false);
  const [cambiandoCompartir, setCambiandoCompartir] = useState(false);
  const [enlaceCopiado, setEnlaceCopiado] = useState(false);

  const sucio = useRef(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Lo último escrito, para que el guardado use el valor actual y no el de la
  // clausura con la que se programó el temporizador.
  const ultimo = useRef({ titulo: tituloInicial, bloques: bloquesIniciales });

  /*
   * Sin serializar, dos guardados que se solapan (red lenta + una tecla de más, o
   * Ctrl+S mientras el debounce ya está en vuelo) pueden llegar en orden distinto al
   * que salieron: si el más lento responde después, sobrescribe en la base de datos
   * lo que el más rápido ya había guardado, y la última edición desaparece sin que
   * la interfaz avise (queda en "Guardado"). `enVueloPromesa` asegura que solo hay una
   * petición de guardado activa a la vez; si llegan cambios mientras tanto, se
   * encadena otro guardado justo al terminar en vez de esperar al siguiente debounce.
   *
   * Guarda la propia promesa (no solo un booleano) para que quien necesite estar
   * seguro de que un guardado ya ha terminado de verdad (guardarSiHaceFalta, al
   * cerrar la nota) pueda esperarla — antes, llamar a guardar() mientras ya había
   * uno en marcha simplemente no hacía nada, así que cerrar la nota y volver a
   * abrirla muy rápido podía leer de la base de datos la versión de justo antes
   * de escribir, como si la última edición no hubiera pasado.
   */
  const enVueloPromesa = useRef<Promise<void> | null>(null);

  const guardar = useCallback(async (): Promise<void> => {
    if (enVueloPromesa.current) {
      await enVueloPromesa.current;
      if (sucio.current) await guardar();
      return;
    }
    if (!sucio.current) return;

    setEstado('guardando');

    // `sucio` se queda a true DURANTE toda la petición, no solo hasta que
    // empieza — antes se ponía a false aquí mismo, antes incluso de mandar
    // nada, así que el aviso de "vas a perder cambios sin guardar" (más
    // abajo, en beforeunload) dejaba de avisar mientras el guardado todavía
    // estaba en el aire. Si el navegador recargaba de golpe justo en ese
    // hueco (el "atrás" del navegador, según qué navegación haga), ni
    // avisaba ni el guardado había llegado a confirmarse.
    const { titulo: t, bloques: b } = ultimo.current;
    const promesa = guardarNota(id, t, b).then((resultado) => {
      enVueloPromesa.current = null;

      if (!resultado.ok) {
        setEstado('error');
        return;
      }

      // Solo se marca a salvo si nadie ha vuelto a escribir mientras esto
      // viajaba (ultimo.current seguiría siendo exactamente lo que se mandó,
      // por referencia) — si ha cambiado, sigue sucio a propósito para que
      // se encadene otro guardado con lo último de verdad.
      if (ultimo.current.titulo === t && ultimo.current.bloques === b) {
        sucio.current = false;
        setEstado('guardado');
      }
    });
    enVueloPromesa.current = promesa;
    await promesa;
    if (sucio.current) await guardar();
  }, [id]);

  useImperativeHandle(
    ref,
    () => ({
      guardarSiHaceFalta: async () => {
        if (temporizador.current) {
          clearTimeout(temporizador.current);
          temporizador.current = null;
        }
        await guardar();
      },
    }),
    [guardar],
  );

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

  // Al salir de un campo (clic fuera, Tab...) fuerza el guardado ya, sin
  // esperar el debounce — un "atrás" del navegador no se puede interceptar
  // como si fuera un botón de la propia app (ver guardarSiHaceFalta arriba),
  // así que la mejor defensa ahí es que apenas quede nada pendiente que
  // guardar para cuando eso pase.
  const guardarYa = useCallback(() => {
    if (temporizador.current) {
      clearTimeout(temporizador.current);
      temporizador.current = null;
    }
    void guardar();
  }, [guardar]);

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

  // Notas que enlazan a esta (contienen "[[Título de esta nota]]" en su texto).
  // Se recalcula al abrir una nota distinta, no en cada tecla: son enlaces de
  // otras notas hacia esta, no algo que cambie por escribir aquí.
  useEffect(() => {
    obtenerNotasRelacionadas(id).then((r) => setRelacionadas(r ?? []));
  }, [id]);

  // Vuelve a pedir la nota de verdad al servidor nada más abrirla, por encima
  // de lo que ya se ve (bloquesIniciales, que puede venir de la caché propia
  // del "atrás" del navegador — la de Next.js para que el botón atrás sea
  // instantáneo, que no se puede desactivar y no sabe nada de lo que se ha
  // guardado después de esa foto). Una Server Action como obtenerNota() nunca
  // pasa por esa caché, así que esto es lo único que da la garantía real.
  // Si para cuando responde ya se ha escrito algo nuevo (sucio.current),
  // no se toca: gana siempre lo que hay delante del usuario en ese momento.
  useEffect(() => {
    let cancelado = false;
    obtenerNota(id).then((datos) => {
      if (cancelado || !datos || sucio.current) return;
      const frescos = comoBloques(datos.nota.content);
      const tituloFresco = datos.nota.titulo ?? '';
      setTitulo(tituloFresco);
      setBloques(frescos);
      ultimo.current = { titulo: tituloFresco, bloques: frescos };
    });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /*
   * El "atrás" del navegador tiene su propia foto congelada de la página
   * entera (bfcache) para que volver sea instantáneo — y a diferencia de la
   * caché de Next.js de arriba, esta ni siquiera vuelve a ejecutar el
   * JavaScript de la página al restaurarla: simplemente descongela el DOM
   * (y el estado de React dentro de él) tal como estaba en el momento de
   * salir. El efecto de aquí arriba, por bueno que sea, nunca llegaría a
   * dispararse en ese caso, porque nada vuelve a arrancar. El único aviso
   * fiable de que esto ha pasado es el evento `pageshow` con
   * `persisted: true` — y la única forma fiable de reaccionar es una
   * recarga de verdad, que sí vuelve a pedirlo todo al servidor.
   */
  useEffect(() => {
    function alMostrarPagina(evento: PageTransitionEvent) {
      if (evento.persisted) window.location.reload();
    }
    window.addEventListener('pageshow', alMostrarPagina);
    return () => window.removeEventListener('pageshow', alMostrarPagina);
  }, []);

  useEffect(() => {
    if (!menuVincular || !qVincular.trim()) {
      setResultadosVincular([]);
      return;
    }
    const temporizador = setTimeout(async () => {
      const datos = await obtenerNotas({ q: qVincular.trim() });
      setResultadosVincular(
        datos ? datos.notas.filter((n) => n.id !== id).slice(0, 6).map((n) => ({ id: n.id, titulo: n.titulo || 'Sin título' })) : [],
      );
    }, 200);
    return () => clearTimeout(temporizador);
  }, [qVincular, menuVincular, id]);

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

  function descargarMarkdown() {
    const nombreArchivo = `${(titulo || 'nota').slice(0, 60).replace(/[\\/:*?"<>|]+/g, '-')}.md`;
    const contenido = `# ${titulo || 'Sin título'}\n\n${aMarkdown(bloques)}\n`;
    const blob = new Blob([contenido], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }

  function imprimirComoPdf() {
    // No hay librería de PDF de por medio: el diálogo de impresión del propio
    // navegador ya deja "Guardar como PDF" como destino, y .imprimir-nota (ver
    // globals.css) oculta todo lo que no sea el título y el cuerpo de la nota.
    window.print();
  }

  function vincularNota(tituloVinculado: string) {
    // Un bloque de texto nuevo al final y no un enlace insertado en el cursor: el
    // editor guarda un textarea por bloque (ver la decisión en ROADMAP.md), así
    // que no hay una posición de cursor "actual" entre bloques a la que apuntar.
    const nuevosBloques = [...bloques, nuevoBloque('texto', `[[${tituloVinculado}]]`)];
    setBloques(nuevosBloques);
    programarGuardado(titulo, nuevosBloques);
    setMenuVincular(false);
    setQVincular('');
  }

  /** Al panel único (con onFavoritaCambiada) le basta un evento; la ruta
   * standalone /notas/[id] no tiene quien lo escuche, así que ahí navega. */
  function abrirNotaRelacionada(idRelacionada: string) {
    if (onFavoritaCambiada) {
      window.dispatchEvent(new CustomEvent('notiq:abrir-nota', { detail: idRelacionada }));
    } else {
      router.push(`/notas/${idRelacionada}`);
    }
  }

  /** Abre la copia igual que abrirNotaRelacionada: evento en el panel, navegación
   * en la ruta standalone. */
  async function duplicar() {
    setDuplicando(true);
    const resultado = await duplicarNota(id);
    setDuplicando(false);
    if (!resultado.ok || !resultado.id) return;

    if (onFavoritaCambiada) {
      window.dispatchEvent(new CustomEvent('notiq:abrir-nota', { detail: resultado.id }));
    } else {
      router.push(`/notas/${resultado.id}`);
    }
  }

  async function alCambiarCompartir(siguiente: boolean) {
    setCambiandoCompartir(true);
    const resultado = await alternarCompartir(id, siguiente);
    setCambiandoCompartir(false);
    if (resultado.ok) setCompartida(siguiente);
  }

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/compartido/${id}`);
      setEnlaceCopiado(true);
      setTimeout(() => setEnlaceCopiado(false), 2000);
    } catch {
      // Portapapeles bloqueado (permiso denegado, contexto no seguro): el enlace
      // sigue visible en el campo de texto de al lado para copiarlo a mano.
    }
  }

  async function crearRecordatorio(fecha: string) {
    if (!fecha) return;
    const resultado = await crearRecordatorioDeNota(id, fecha);
    setRecordatorioAbierto(false);
    setMensajeRecordatorio(
      resultado.ok
        ? `Añadida a Tareas con vencimiento el ${new Date(`${fecha}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}.`
        : resultado.error,
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 imprimir-nota">
        <div className="mb-4 flex items-center gap-3 text-xs text-ink/45 no-imprimir">
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

          <div className="relative">
            <button
              type="button"
              onClick={() => setRecordatorioAbierto((abierto) => !abierto)}
              aria-expanded={recordatorioAbierto}
              className="hover:text-ink"
            >
              📅 Recordar
            </button>
            {recordatorioAbierto && (
              <>
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setRecordatorioAbierto(false)}
                  className="fixed inset-0 z-10 cursor-default"
                />
                <div className="card absolute left-0 top-full z-20 mt-2 w-64 p-3.5 text-sm">
                  <p className="mb-2 text-ink/70">
                    Crea una tarea con esta nota y la fecha que elijas — la verás en Tareas.
                  </p>
                  <input
                    type="date"
                    autoFocus
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => void crearRecordatorio(e.target.value)}
                    aria-label="Fecha del recordatorio"
                    className="campo text-sm"
                  />
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuVincular((abierto) => !abierto)}
              aria-expanded={menuVincular}
              className="hover:text-ink"
            >
              🔗 Vincular nota
            </button>
            {menuVincular && (
              <>
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setMenuVincular(false)}
                  className="fixed inset-0 z-10 cursor-default"
                />
                <div className="card absolute left-0 top-full z-20 mt-2 w-64 overflow-hidden p-2">
                  <input
                    autoFocus
                    value={qVincular}
                    onChange={(e) => setQVincular(e.target.value)}
                    placeholder="Buscar una nota…"
                    aria-label="Buscar nota a vincular"
                    className="campo text-sm"
                  />
                  {qVincular.trim() && (
                    <ul className="mt-1.5 max-h-52 overflow-y-auto">
                      {resultadosVincular.length === 0 ? (
                        <li className="px-2 py-2 text-xs text-ink/45">Sin resultados.</li>
                      ) : (
                        resultadosVincular.map((n) => (
                          <li key={n.id}>
                            <button
                              type="button"
                              onClick={() => vincularNota(n.titulo)}
                              className="block w-full truncate rounded-lg px-2 py-1.5 text-left text-sm hover:bg-ink/[0.04]"
                            >
                              {n.titulo}
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>

          <button type="button" onClick={duplicar} disabled={duplicando} className="ml-auto hover:text-ink disabled:opacity-50">
            {duplicando ? 'Duplicando…' : '📑 Duplicar'}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuCompartir((abierto) => !abierto)}
              aria-expanded={menuCompartir}
              className={compartida ? 'font-semibold text-brand-600' : 'hover:text-ink'}
            >
              🌐 {compartida ? 'Compartida' : 'Compartir'}
            </button>
            {menuCompartir && (
              <>
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setMenuCompartir(false)}
                  className="fixed inset-0 z-10 cursor-default"
                />
                <div className="card absolute right-0 top-full z-20 mt-2 w-72 p-3.5 text-sm">
                  <label className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={compartida}
                      disabled={cambiandoCompartir}
                      onChange={(e) => void alCambiarCompartir(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span className="text-ink/75">
                      Cualquiera con el enlace puede ver esta nota (sin poder editarla). Las
                      imágenes no se muestran en la versión compartida.
                    </span>
                  </label>
                  {compartida && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <input
                        readOnly
                        value={typeof window !== 'undefined' ? `${window.location.origin}/compartido/${id}` : ''}
                        onFocus={(e) => e.target.select()}
                        aria-label="Enlace público de la nota"
                        className="campo truncate text-xs"
                      />
                      <button type="button" onClick={copiarEnlace} className="btn-secondary shrink-0 px-2.5 py-2 text-xs">
                        {enlaceCopiado ? 'Copiado ✓' : 'Copiar'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuExportar((abierto) => !abierto)}
              aria-expanded={menuExportar}
              className="hover:text-ink"
            >
              ⭳ Exportar
            </button>
            {menuExportar && (
              <>
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setMenuExportar(false)}
                  className="fixed inset-0 z-10 cursor-default"
                />
                <div className="card absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden py-1.5 text-sm text-ink/80">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuExportar(false);
                      descargarMarkdown();
                    }}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-left hover:bg-ink/[0.04]"
                  >
                    <span aria-hidden>⬇️</span> Descargar en Markdown
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuExportar(false);
                      imprimirComoPdf();
                    }}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-left hover:bg-ink/[0.04]"
                  >
                    <span aria-hidden>🖨️</span> Imprimir / Guardar como PDF
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {mensajeRecordatorio && (
          <p className="no-imprimir -mt-2 mb-4 text-xs text-brand-700">{mensajeRecordatorio}</p>
        )}

        <input
          value={titulo}
          onChange={(e) => {
            setTitulo(e.target.value);
            programarGuardado(e.target.value, bloques);
          }}
          onBlur={guardarYa}
          placeholder="Sin título"
          maxLength={200}
          aria-label="Título de la nota"
          className="mb-2 w-full bg-transparent text-4xl font-extrabold tracking-tight outline-none placeholder:text-ink/20"
        />

        <EtiquetasNota
          noteId={id}
          etiquetasIniciales={etiquetasIniciales}
          etiquetasConocidas={etiquetasConocidas}
        />

        <EditorBloques
          bloques={bloques}
          noteId={id}
          onCambio={(siguientes) => {
            setBloques(siguientes);
            programarGuardado(titulo, siguientes);
          }}
          onDejarDeEscribir={guardarYa}
        />
      </div>

      <div className="flex flex-col gap-5">
        <PanelIa
          noteId={id}
          titulo={titulo}
          markdown={aMarkdown(bloques)}
          resumenInicial={resumenInicial}
        />
        <div className="card p-5">
          <Adjuntos noteId={id} />
        </div>

        {relacionadas.length > 0 && (
          <div className="card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50">
              Notas que enlazan aquí
            </h3>
            <ul className="mt-2 space-y-1">
              {relacionadas.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => abrirNotaRelacionada(n.id)}
                    className="block w-full truncate rounded-lg px-2 py-1 text-left text-sm text-brand-700 hover:bg-brand-50"
                  >
                    📄 {n.titulo || 'Sin título'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
});

NotaEditor.displayName = 'NotaEditor';

export default NotaEditor;
