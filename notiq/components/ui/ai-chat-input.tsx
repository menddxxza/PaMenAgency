'use client';

import * as React from 'react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ----------------------------------------------------------------------
// Física de la transición — igual que el componente original de 21st.dev,
// solo se ha recortado lo que no tenía nada real detrás en Notiq (selector
// de modelo/esfuerzo, adjuntar imágenes): el asistente (app/api/ia/chat)
// es un único modelo por texto, sin visión.
// ----------------------------------------------------------------------
const SPRING_TRANSITION =
  'max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
const SMOOTH_HEIGHT_TRANSITION = 'max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.15s ease-out';

function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="5" y="1" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.75 6.5V7a4.25 4.25 0 0 0 8.5 0v-.5M7 11.25V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  );
}

type ReconocimientoVoz = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

export interface PromptInputProps {
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  /** El envío queda deshabilitado (p. ej. mientras el asistente responde), pero
   * se puede seguir escribiendo. */
  disabled?: boolean;
  maxLength?: number;
}

/**
 * Caja de texto para "hablar" con el asistente: crece de una píldora a un
 * bloque de varias líneas al escribir (con la física del componente
 * original), y permite dictar por voz con la Web Speech API del navegador —
 * sin backend nuevo, el texto reconocido entra igual que si se escribiera.
 *
 * A diferencia del componente de origen, no hay selector de modelo/esfuerzo
 * ni adjuntar imágenes: en Notiq eso no correspondía a nada real todavía
 * (/api/ia/chat no admite ni lo uno ni lo otro), así que mostrarlo habría
 * sido un botón que finge hacer algo.
 */
export const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  (
    { onSubmit, placeholder = 'Pregúntame lo que sea…', className, defaultValue = '', value: controlledValue, onChange, disabled = false, maxLength = 1000 },
    ref,
  ) => {
    const [expanded, setExpanded] = useState(false);
    const [isSmoothResize, setIsSmoothResize] = useState(false);
    const [localValue, setLocalValue] = useState(defaultValue);
    const valueRef = useRef(controlledValue !== undefined ? controlledValue : localValue);

    const [isRecording, setIsRecording] = useState(false);
    const [audioData, setAudioData] = useState<number[]>(new Array(5).fill(0));
    const [errorVoz, setErrorVoz] = useState<string | null>(null);

    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const rafRef = useRef<number | null>(null);
    const recognitionRef = useRef<ReconocimientoVoz | null>(null);

    const [containerHeight, setContainerHeight] = useState(116);
    const [textareaHeight, setTextareaHeight] = useState(68);
    const [isScrolling, setIsScrolling] = useState(false);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : localValue;
    const hasValue = value.trim() !== '';

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const internalContainerRef = useRef<HTMLDivElement>(null);
    const topFadeRef = useRef<HTMLDivElement>(null);
    const bottomFadeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      valueRef.current = value;
    }, [value]);

    const updateFades = () => {
      const el = textareaRef.current;
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (topFadeRef.current) topFadeRef.current.style.opacity = Math.min(scrollTop / 20, 1).toString();
      if (bottomFadeRef.current) {
        const bottomScroll = scrollHeight - clientHeight - scrollTop;
        bottomFadeRef.current.style.opacity = Math.min(Math.max(bottomScroll - 16, 0) / 10, 1).toString();
      }
    };

    const handleValueChange = useCallback(
      (val: string) => {
        setIsSmoothResize(true);
        if (!isControlled) setLocalValue(val);
        onChange?.(val);
      },
      [isControlled, onChange],
    );

    const expand = () => {
      setIsSmoothResize(false);
      setExpanded(true);
    };

    // --- Dictado por voz ---
    const stopRecording = useCallback(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setIsRecording(false);
      setAudioData(new Array(5).fill(0));
    }, []);

    const startRecording = useCallback(async () => {
      setErrorVoz(null);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setErrorVoz('Tu navegador no admite dictado por voz. Prueba con Chrome o Edge.');
        return;
      }

      let stream: MediaStream | null = null;
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      } catch {
        setErrorVoz('No se ha podido acceder al micrófono — revisa los permisos del navegador.');
        return;
      }
      if (!stream) {
        setErrorVoz('Este navegador no permite grabar audio.');
        return;
      }

      setIsSmoothResize(false);
      setExpanded(true);
      setIsRecording(true);
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVisualizer = () => {
        analyser.getByteFrequencyData(dataArray);
        const bands = new Array(5).fill(0);
        const step = Math.floor(dataArray.length / 5);
        for (let i = 0; i < 5; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) sum += dataArray[i * step + j];
          bands[i] = sum / step / 255;
        }
        setAudioData(bands);
        rafRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();

      const recognition: ReconocimientoVoz = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      let baseline = valueRef.current;
      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
          else interim += event.results[i][0].transcript;
        }
        if (final) baseline += (baseline ? ' ' : '') + final;
        handleValueChange((baseline + (interim ? ' ' + interim : '')).trim());
      };
      recognition.onerror = () => stopRecording();
      recognition.onend = () => stopRecording();

      recognitionRef.current = recognition;
      recognition.start();
    }, [handleValueChange, stopRecording]);

    useEffect(() => {
      if (isRecording && textareaRef.current) textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }, [value, isRecording]);

    useEffect(() => stopRecording, [stopRecording]);

    useEffect(() => {
      if (value.trim() !== '' && !expanded) {
        setIsSmoothResize(false);
        setExpanded(true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, expanded]);

    useEffect(() => {
      if (expanded && !isRecording) {
        const timer = setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            const length = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(length, length);
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [expanded, isRecording]);

    useEffect(() => {
      if (!textareaRef.current) return;
      const el = textareaRef.current;
      const currentHeight = el.style.height;
      el.style.transition = 'none';
      el.style.height = '0px';
      const scrollHeight = el.scrollHeight;
      el.style.height = currentHeight;
      void el.offsetHeight;
      el.style.transition = '';

      const newHeight = Math.max(68, Math.min(scrollHeight, 160));
      el.style.height = `${newHeight}px`;
      setTextareaHeight(newHeight);
      setIsScrolling(scrollHeight > 160);
      setTimeout(updateFades, 0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, expanded]);

    useEffect(() => {
      setContainerHeight(Math.max(116, textareaHeight + 48));
      setTimeout(updateFades, 0);
    }, [textareaHeight]);

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      if (internalContainerRef.current && internalContainerRef.current.contains(e.relatedTarget as Node)) return;
      if (value.trim() === '' && !isRecording) {
        setIsSmoothResize(false);
        setExpanded(false);
      }
    };

    const handleSubmit = () => {
      if (value.trim() === '' || disabled) return;
      setIsSmoothResize(false);
      onSubmit?.(value);
      handleValueChange('');
      setExpanded(false);
    };

    const showArrow = hasValue && !isRecording;
    const showStop = isRecording;
    const showMic = !hasValue && !isRecording;

    const onActionButtonClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (isRecording) stopRecording();
      else if (hasValue) handleSubmit();
      else void startRecording();
    };

    return (
      <div
        ref={(node) => {
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          internalContainerRef.current = node;
        }}
        onBlur={handleBlur}
        className={cn('relative flex flex-col w-full', className)}
        style={{
          maxWidth: expanded ? 480 : 320,
          transition: isSmoothResize ? 'max-width 0.15s ease-out' : 'max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        <div
          onMouseDown={(e) => {
            const isTextarea = e.target === textareaRef.current;
            if (expanded && !isTextarea && !isRecording) {
              e.preventDefault();
              textareaRef.current?.focus();
            }
          }}
          style={{
            borderRadius: 24,
            height: expanded ? containerHeight : 48,
            transition: isSmoothResize ? SMOOTH_HEIGHT_TRANSITION : SPRING_TRANSITION,
            overflow: expanded ? 'visible' : 'hidden',
          }}
          className={cn(
            'relative w-full border border-border bg-card shadow-sm focus-within:border-ring/40 focus-within:ring-1 focus-within:ring-ring/20 hover:border-border/80 z-10',
            expanded ? 'cursor-text' : 'cursor-default',
          )}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
              .prompt-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; background: transparent; }
              .prompt-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .prompt-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 4px; }
              .prompt-scrollbar:hover::-webkit-scrollbar-thumb { background: rgb(var(--color-ink-soft) / 0.3); }
            `,
            }}
          />

          <textarea
            ref={textareaRef}
            value={value}
            maxLength={maxLength}
            onChange={(e) => handleValueChange(e.target.value)}
            onScroll={updateFades}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
              if (e.key === 'Escape' && value.trim() === '') {
                setIsSmoothResize(false);
                setExpanded(false);
              }
            }}
            placeholder={placeholder}
            aria-label="Pregunta para el asistente"
            disabled={isRecording}
            style={{
              transition: isSmoothResize
                ? 'height 0.15s ease-out'
                : 'opacity 0.3s ease-out, transform 0.3s ease-out, height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
            className={cn(
              'prompt-scrollbar absolute top-0 inset-x-0 z-[1] w-full resize-none bg-transparent pl-4 pr-12 py-3.5 text-sm leading-[22px] text-foreground outline-none placeholder:font-medium placeholder:text-muted-foreground/80 cursor-text',
              expanded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none',
              isScrolling ? 'overflow-y-auto' : 'overflow-y-hidden',
              isRecording && 'pointer-events-none',
            )}
          />

          <div ref={topFadeRef} className="absolute left-4 right-12 top-0 z-[2] h-8 bg-gradient-to-b from-card via-card/90 to-transparent pointer-events-none" />
          <div
            ref={bottomFadeRef}
            className="absolute left-4 right-12 z-[2] h-8 bg-gradient-to-t from-card via-card/90 to-transparent pointer-events-none"
            style={{
              opacity: 0,
              top: `${textareaHeight - 32}px`,
              transition: isSmoothResize ? 'top 0.15s ease-out' : 'top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          />

          <button
            type="button"
            onClick={expand}
            style={{ transition: isSmoothResize ? 'none' : 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
            className={cn(
              'absolute inset-x-0 top-0 z-[1] cursor-text pl-4 pr-12 py-[15px] text-left text-sm font-medium leading-[17px] text-muted-foreground/80 outline-none',
              !expanded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-105 translate-y-1 pointer-events-none',
            )}
            aria-label="Abrir el cuadro de pregunta"
          >
            {placeholder}
          </button>

          <div
            className={cn(
              'absolute right-12 bottom-2 z-[10] flex h-8 items-center justify-end gap-[3px] transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]',
              isRecording ? 'w-16 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-4 pointer-events-none',
            )}
          >
            {audioData.map((val, i) => (
              <div key={i} className="w-1 rounded-full bg-primary transition-[height] duration-75 ease-out" style={{ height: `${Math.max(4, val * 24)}px` }} />
            ))}
          </div>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={onActionButtonClick}
            disabled={disabled && !isRecording}
            aria-label={showArrow ? 'Enviar pregunta' : showStop ? 'Detener grabación' : 'Dictar por voz'}
            style={{ borderRadius: 9999 }}
            className="absolute right-2 bottom-2 z-[10] flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground transition-all duration-300 hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none cursor-default"
          >
            <span className="relative flex h-full w-full items-center justify-center">
              <span
                className={cn(
                  'absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]',
                  showArrow ? 'opacity-100 scale-100 rotate-0 blur-none' : 'opacity-0 scale-50 rotate-45 blur-[1px] pointer-events-none',
                )}
              >
                <ArrowUpIcon />
              </span>
              <span
                className={cn(
                  'absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]',
                  showMic ? 'opacity-100 scale-100 rotate-0 blur-none' : 'opacity-0 scale-50 -rotate-45 blur-[1px] pointer-events-none',
                )}
              >
                <MicIcon />
              </span>
              <span
                className={cn(
                  'absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]',
                  showStop ? 'opacity-100 scale-100 rotate-0 blur-none' : 'opacity-0 scale-50 rotate-45 blur-[1px] pointer-events-none',
                )}
              >
                <StopIcon />
              </span>
            </span>
          </button>
        </div>

        {errorVoz && (
          <p role="alert" className="mt-2 px-1 text-xs text-red-700">
            {errorVoz}
          </p>
        )}
      </div>
    );
  },
);

PromptInput.displayName = 'PromptInput';
