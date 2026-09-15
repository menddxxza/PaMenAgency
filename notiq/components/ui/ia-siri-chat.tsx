'use client';

import { Mic, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type FaseVisual = 'inactivo' | 'grabando' | 'procesando';

type Particula = { id: number; x: number; y: number; velocidad: { x: number; y: number } };

export interface GrabadoraVisualProps {
  fase: FaseVisual;
  /** Ya en español y decidido por quien llama (p. ej. "Transcribiendo…",
   * "Generando apuntes…") — este componente no sabe nada del backend, solo pinta. */
  etiqueta: string;
  segundos: number;
  /** Nivel real del micrófono (0–1), no simulado — ver el AnalyserNode en
   * GrabarClase.tsx. Con la longitud que tenga se pintan igual de barras. */
  nivelAudio: number[];
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

function formatearTiempo(segundos: number) {
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Versión adaptada de un componente "Siri-style voice chat" de 21st.dev para
 * el estado real de "Grabar clase" (ver components/panel/GrabarClase.tsx):
 * sin modo demo, sin "hablando" (Notiq no responde por voz) y con la onda
 * dibujada a partir del micrófono de verdad, no de números aleatorios.
 */
export function GrabadoraVisual({ fase, etiqueta, segundos, nivelAudio, onToggle, disabled, className }: GrabadoraVisualProps) {
  const [particulas, setParticulas] = useState<Particula[]>([]);

  useEffect(() => {
    setParticulas(
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        velocidad: { x: (Math.random() - 0.5) * 0.15, y: (Math.random() - 0.5) * 0.15 },
      })),
    );
  }, []);

  useEffect(() => {
    let raf: number;
    const animar = () => {
      setParticulas((prev) =>
        prev.map((p) => ({ ...p, x: (p.x + p.velocidad.x + 100) % 100, y: (p.y + p.velocidad.y + 100) % 100 })),
      );
      raf = requestAnimationFrame(animar);
    };
    raf = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(raf);
  }, []);

  const grabando = fase === 'grabando';
  const procesando = fase === 'procesando';

  const colorEstado = grabando ? 'text-red-600' : procesando ? 'text-amber-500' : 'text-muted-foreground';
  const colorBorde = grabando ? 'border-red-500 shadow-lg shadow-red-500/20' : procesando ? 'border-amber-500 shadow-lg shadow-amber-500/20' : 'border-border hover:border-primary/50';
  const colorBarra = grabando ? 'bg-red-500' : procesando ? 'bg-amber-500' : 'bg-muted';

  return (
    <div className={cn('relative flex flex-col items-center justify-center overflow-hidden rounded-2xl py-6', className)}>
      <div className="pointer-events-none absolute inset-0">
        {particulas.map((p) => (
          <motion.div
            key={p.id}
            className="absolute h-1 w-1 rounded-full bg-primary/20"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.div
          className="h-48 w-48 rounded-full bg-gradient-to-r from-red-500/10 via-brand-400/10 to-amber-400/10 blur-3xl"
          animate={{ scale: grabando ? [1, 1.2, 1] : [1, 1.08, 1], opacity: grabando ? [0.3, 0.6, 0.3] : [0.1, 0.18, 0.1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5">
        <motion.div className="relative" whileHover={disabled ? undefined : { scale: 1.05 }} whileTap={disabled ? undefined : { scale: 0.95 }}>
          <button
            type="button"
            onClick={onToggle}
            disabled={disabled}
            aria-label={grabando ? 'Detener grabación' : 'Empezar a grabar'}
            className={cn(
              'relative flex h-24 w-24 items-center justify-center rounded-full border-2 bg-gradient-to-br from-primary/15 to-primary/5 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60',
              colorBorde,
            )}
          >
            <AnimatePresence mode="wait">
              {procesando ? (
                <motion.div key="procesando" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                  <Loader2 className="h-9 w-9 animate-spin text-amber-500" />
                </motion.div>
              ) : (
                <motion.div key={grabando ? 'grabando' : 'idle'} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                  <Mic className={cn('h-9 w-9', grabando ? 'text-red-600' : 'text-muted-foreground')} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <AnimatePresence>
            {grabando && (
              <>
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-full border-2 border-red-500/30"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-full border-2 border-red-500/20"
                  initial={{ scale: 1, opacity: 0.4 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                />
              </>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex h-10 items-center justify-center gap-[3px]">
          {nivelAudio.map((nivel, i) => (
            <motion.div
              key={i}
              className={cn('w-1 rounded-full transition-colors duration-300', colorBarra)}
              animate={{ height: `${Math.max(4, nivel * 36)}px`, opacity: grabando ? 1 : 0.3 }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
            />
          ))}
        </div>

        <div className="space-y-1 text-center">
          <p className={cn('text-sm font-semibold transition-colors', colorEstado)}>{etiqueta}</p>
          {segundos > 0 && <p className="font-mono text-xs text-muted-foreground">{formatearTiempo(segundos)}</p>}
        </div>
      </div>
    </div>
  );
}
