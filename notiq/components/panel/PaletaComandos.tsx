'use client';

import { useEffect, useRef, useState } from 'react';
import { obtenerNotas } from '@/app/(app)/notas/actions';
import { PESTANAS, type Pestana } from './pestanas';

type Comando = { clave: string; etiqueta: string; emoji: string; onSeleccionar: () => void };

/**
 * Paleta de comandos (Ctrl/Cmd+K): cambiar de pestaña, crear nota/tarea, cambiar
 * de tema o saltar directo a una nota por su título. El propio PanelApp escucha
 * el atajo y controla `abierta` — este componente no decide cuándo abrirse, solo
 * qué mostrar mientras lo está.
 *
 * Cruza al árbol de SeccionNotas/SeccionTareas con CustomEvent en `window` en vez
 * de subir su estado aquí: son secciones que ya viven montadas de por sí (ver
 * PanelApp), así que un evento que ya estén escuchando basta y evita levantar el
 * estado de "nota abierta" hasta un componente que no lo necesita para nada más.
 */
export default function PaletaComandos({
  abierta,
  onCerrar,
  onCambiarPestana,
}: {
  abierta: boolean;
  onCerrar: () => void;
  onCambiarPestana: (p: Pestana) => void;
}) {
  const [q, setQ] = useState('');
  const [notas, setNotas] = useState<{ id: string; titulo: string }[]>([]);
  const [indice, setIndice] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!abierta) return;
    setQ('');
    setNotas([]);
    setIndice(0);
    const marco = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(marco);
  }, [abierta]);

  useEffect(() => {
    if (!abierta || !q.trim()) {
      setNotas([]);
      return;
    }
    const temporizador = setTimeout(async () => {
      const datos = await obtenerNotas({ q: q.trim() });
      setNotas(datos ? datos.notas.slice(0, 6).map((n) => ({ id: n.id, titulo: n.titulo || 'Sin título' })) : []);
    }, 200);
    return () => clearTimeout(temporizador);
  }, [q, abierta]);

  if (!abierta) return null;

  function alternarTema() {
    const raiz = document.documentElement;
    const siguiente = !raiz.classList.contains('dark');
    raiz.classList.toggle('dark', siguiente);
    try {
      localStorage.setItem('notiq-tema', siguiente ? 'oscuro' : 'claro');
    } catch {
      // Ver el mismo catch en InterruptorTema.tsx: navegación privada, no crítico.
    }
  }

  const comandosBase: Comando[] = [
    ...PESTANAS.map((p) => ({
      clave: `ir-${p.id}`,
      etiqueta: `Ir a ${p.etiqueta}`,
      emoji: p.emoji,
      onSeleccionar: () => onCambiarPestana(p.id),
    })),
    {
      clave: 'nueva-nota',
      etiqueta: 'Nueva nota',
      emoji: '📝',
      onSeleccionar: () => {
        onCambiarPestana('notas');
        // setTimeout y no un dispatch directo: la primera vez que se abre "Notas"
        // en esta sesión, SeccionNotas todavía no está montada (PanelApp la monta
        // perezosamente) y nadie estaría escuchando el evento todavía. Pasar al
        // siguiente macrotask le da tiempo a montarse y suscribirse antes de que
        // llegue el evento.
        setTimeout(() => window.dispatchEvent(new CustomEvent('notiq:crear-nota')), 0);
      },
    },
    {
      clave: 'nueva-tarea',
      etiqueta: 'Nueva tarea',
      emoji: '✅',
      onSeleccionar: () => {
        onCambiarPestana('tareas');
        setTimeout(() => window.dispatchEvent(new CustomEvent('notiq:crear-tarea')), 0);
      },
    },
    {
      clave: 'tema',
      etiqueta: 'Cambiar entre tema claro y oscuro',
      emoji: '🌓',
      onSeleccionar: alternarTema,
    },
  ];

  const filtro = q.trim().toLowerCase();
  const comandosFiltrados = filtro
    ? comandosBase.filter((c) => c.etiqueta.toLowerCase().includes(filtro))
    : comandosBase;

  const items: Comando[] = [
    ...comandosFiltrados,
    ...notas.map((n) => ({
      clave: `nota-${n.id}`,
      etiqueta: n.titulo,
      emoji: '📄',
      onSeleccionar: () => {
        onCambiarPestana('notas');
        setTimeout(() => window.dispatchEvent(new CustomEvent('notiq:abrir-nota', { detail: n.id })), 0);
      },
    })),
  ];

  function elegir(item: Comando) {
    item.onSeleccionar();
    onCerrar();
  }

  function alTeclear(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndice((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndice((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[indice]) elegir(items[indice]);
    } else if (e.key === 'Escape') {
      onCerrar();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-24"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        className="card w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setIndice(0);
          }}
          onKeyDown={alTeclear}
          placeholder="Buscar notas o escribe un comando…"
          aria-label="Paleta de comandos"
          className="w-full border-b border-ink/10 bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-ink/35"
        />
        <ul className="max-h-80 overflow-y-auto py-1.5">
          {items.length === 0 && <li className="px-4 py-3 text-sm text-ink/45">Sin resultados.</li>}
          {items.map((item, i) => (
            <li key={item.clave}>
              <button
                type="button"
                onClick={() => elegir(item)}
                onMouseEnter={() => setIndice(i)}
                className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
                  i === indice ? 'bg-brand-50 text-brand-700' : 'text-ink/80'
                }`}
              >
                <span aria-hidden>{item.emoji}</span>
                <span className="truncate">{item.etiqueta}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="border-t border-ink/10 px-4 py-2 text-[11px] text-ink/40">
          ↑↓ para moverte · Enter para elegir · Esc para cerrar
        </p>
      </div>
    </div>
  );
}
