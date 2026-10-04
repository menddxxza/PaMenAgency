'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category, Product } from '@/lib/database.types';
import { guardarProducto } from '@/app/dashboard/actions';
import { familiaDeTipo, familiaPorSlug, type SlugFamilia } from '@/lib/tipos-publicacion';
import SubirImagen from './SubirImagen';

const PASOS = ['Lo básico', 'La ficha', 'El precio', 'La entrega'] as const;

const TODOS_LOS_TIPOS = [
  { valor: 'automation', etiqueta: 'Automatización' },
  { valor: 'agent', etiqueta: 'Agente de IA' },
  { valor: 'bot', etiqueta: 'Bot' },
  { valor: 'app', etiqueta: 'App' },
  { valor: 'web', etiqueta: 'Web' },
  { valor: 'saas', etiqueta: 'SaaS' },
  { valor: 'script', etiqueta: 'Script' },
  { valor: 'template', etiqueta: 'Template' },
  { valor: 'service', etiqueta: 'Servicio' },
  { valor: 'negocio', etiqueta: 'Negocio' },
  { valor: 'trabajo', etiqueta: 'Trabajo' },
  { valor: 'profesional', etiqueta: 'Profesional' },
  { valor: 'proyecto', etiqueta: 'Proyecto' },
];

const MODELOS = [
  { valor: 'setup_plus_monthly', etiqueta: 'Instalación + cuota mensual' },
  { valor: 'one_time', etiqueta: 'Pago único' },
  { valor: 'monthly', etiqueta: 'Solo cuota mensual' },
  { valor: 'free', etiqueta: 'Gratis' },
];

/**
 * Solo para fichas nuevas: una editada ya tiene su estado real en el
 * servidor, así que ahí el autoguardado no aporta nada y solo podría
 * confundir (¿el borrador es el de localStorage o el que ya está guardado?).
 */
const CLAVE_BORRADOR = 'iapyme_borrador_publicacion';

type Borrador = {
  campos: Record<string, string>;
  modelo: string;
  esPeticion: boolean;
  esRemoto: boolean;
  portada: string;
  guardadoEn: number;
};

export default function AsistentePublicacion({
  categorias,
  producto,
  userId,
  familiaInicial,
}: {
  categorias: Category[];
  producto?: Product;
  userId: string;
  /**
   * Slug de familia con el que se llegó desde /publicar (`?familia=negocios`).
   * Filtra qué tipos se pueden elegir, para no enseñar "Trabajo" a quien ya
   * dijo que quería publicar un negocio. Al editar una ficha existente no
   * llega — se deduce del `product_type` que ya tiene.
   */
  familiaInicial?: SlugFamilia;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [paso, setPaso] = useState(0);
  const [modelo, setModelo] = useState(producto?.pricing_model ?? 'setup_plus_monthly');
  const [portada, setPortada] = useState(producto?.cover_image_url ?? '');
  const [esPeticion, setEsPeticion] = useState(producto?.es_peticion ?? false);
  const [esRemoto, setEsRemoto] = useState(producto?.es_remoto ?? true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [borradorRecuperado, setBorradorRecuperado] = useState(false);

  function guardarBorrador() {
    if (producto || !formRef.current) return; // solo para fichas nuevas
    try {
      const campos: Record<string, string> = {};
      for (const [clave, valor] of new FormData(formRef.current).entries()) {
        if (typeof valor === 'string' && clave !== 'enviar' && clave !== 'id') campos[clave] = valor;
      }
      const borrador: Borrador = { campos, modelo, esPeticion, esRemoto, portada, guardadoEn: Date.now() };
      window.localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(borrador));
    } catch {
      // Modo privado o localStorage lleno: el autoguardado simplemente no
      // pasa nada, no es razón para romper el formulario.
    }
  }

  // Restaura un borrador anterior al montar, antes de que el vendedor vuelva
  // a escribir nada. Solo aplica a fichas nuevas y una vez.
  useEffect(() => {
    if (producto || !formRef.current) return;
    try {
      const guardado = window.localStorage.getItem(CLAVE_BORRADOR);
      if (!guardado) return;
      const borrador = JSON.parse(guardado) as Borrador;

      for (const [clave, valor] of Object.entries(borrador.campos)) {
        const campo = formRef.current.elements.namedItem(clave);
        // RadioNodeList (varios campos con el mismo name) también tiene
        // `.value`, pero no se usa ningún radio aquí — el cast pasa por
        // `unknown` porque los dos tipos no se solapan lo suficiente para TS.
        if (campo && 'value' in campo) (campo as unknown as HTMLInputElement).value = valor;
      }
      setModelo(borrador.modelo as typeof modelo);
      setEsPeticion(borrador.esPeticion);
      setEsRemoto(borrador.esRemoto);
      setPortada(borrador.portada);
      setBorradorRecuperado(true);
    } catch {
      // Un borrador corrupto se ignora igual que si no existiera.
    }
    // Solo al montar: restaurar de nuevo en cada cambio de estado borraría lo
    // que el vendedor acaba de escribir encima.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Vuelve a guardar cada vez que cambia algo que no pasa por `onChange` del
  // formulario (son botones, no inputs nativos).
  useEffect(() => {
    guardarBorrador();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelo, esPeticion, esRemoto, portada]);

  function descartarBorrador() {
    try {
      window.localStorage.removeItem(CLAVE_BORRADOR);
    } catch {
      // Sin acceso a localStorage no hay nada que descartar.
    }
    formRef.current?.reset();
    setModelo('setup_plus_monthly');
    setEsPeticion(false);
    setEsRemoto(true);
    setPortada('');
    setBorradorRecuperado(false);
  }

  const familia =
    (familiaInicial && familiaPorSlug(familiaInicial)) ??
    (producto ? familiaDeTipo(producto.product_type) : undefined);
  const TIPOS = familia
    ? TODOS_LOS_TIPOS.filter((t) => (familia.tipos as string[]).includes(t.valor))
    : TODOS_LOS_TIPOS;

  async function enviar(formData: FormData, aRevision: boolean) {
    if (guardando) return; // evita el doble envío por doble clic

    setGuardando(true);
    setError(null);

    formData.set('enviar', aRevision ? 'si' : 'no');
    formData.set('cover_image_url', portada);
    if (producto) formData.set('id', producto.id);

    try {
      const resultado = await guardarProducto(formData);

      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }

      try {
        window.localStorage.removeItem(CLAVE_BORRADOR);
      } catch {
        // Si no se pudo borrar, como mucho queda un borrador obsoleto —
        // no vale la pena interrumpir el guardado por esto.
      }

      router.push('/dashboard/productos');
      router.refresh();
    } catch {
      // Sin este catch, un fallo de red deja el botón en «Guardando…» para siempre
      // y el vendedor no sabe si se ha guardado o no.
      setError('No hemos podido contactar con el servidor. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form
      ref={formRef}
      onChange={guardarBorrador}
      onSubmit={(e) => {
        e.preventDefault();
        const datos = new FormData(e.currentTarget);
        // El submit del formulario siempre manda a revisión; guardar borrador es el
        // otro botón, que llama a enviar() con aRevision=false.
        void enviar(datos, true);
      }}
    >
      {borradorRecuperado ? (
        <p className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          Hemos recuperado lo que estabas escribiendo antes de salir.
          <button
            type="button"
            onClick={descartarBorrador}
            className="ml-auto text-xs font-semibold underline underline-offset-2 hover:text-amber-700"
          >
            Empezar de cero
          </button>
        </p>
      ) : null}

      <ol className="flex gap-2">
        {PASOS.map((nombre, indice) => (
          <li key={nombre} className="flex-1">
            <button
              type="button"
              onClick={() => setPaso(indice)}
              className={`w-full rounded-lg px-3 py-2 text-xs font-semibold transition ${
                indice === paso
                  ? 'bg-brand-600 text-white'
                  : indice < paso
                    ? 'bg-accent-500/15 text-accent-700'
                    : 'bg-ink/[0.05] text-ink/50'
              }`}
            >
              {indice + 1}. {nombre}
            </button>
          </li>
        ))}
      </ol>

      <div className="card mt-6 p-6">
        {/* Todos los pasos se mantienen montados: si se desmontaran, al volver atrás
            se perderían los campos que el vendedor ya había rellenado. */}
        <div className={paso === 0 ? 'block' : 'hidden'}>
          {/* Ofrecer/buscar como campos ocultos: los botones de abajo son los
              controles reales (más claros que un <select> de dos opciones),
              y estos inputs son los que de verdad viajan en el FormData. */}
          <input type="hidden" name="es_peticion" value={esPeticion ? 'si' : 'no'} />
          <input type="hidden" name="es_remoto" value={esRemoto ? 'si' : 'no'} />

          <Campo etiqueta="¿Ofreces o buscas?">
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEsPeticion(false)}
                aria-pressed={!esPeticion}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  !esPeticion
                    ? 'border-brand-500 bg-brand-50 font-semibold text-brand-800'
                    : 'border-ink/15 text-ink/70 hover:border-ink/30'
                }`}
              >
                Ofrezco esto
                <span className="mt-0.5 block text-xs font-normal opacity-70">
                  Tengo algo hecho y lo publico
                </span>
              </button>
              <button
                type="button"
                onClick={() => setEsPeticion(true)}
                aria-pressed={esPeticion}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  esPeticion
                    ? 'border-brand-500 bg-brand-50 font-semibold text-brand-800'
                    : 'border-ink/15 text-ink/70 hover:border-ink/30'
                }`}
              >
                Busco esto
                <span className="mt-0.5 block text-xs font-normal opacity-70">
                  Necesito que alguien me lo haga
                </span>
              </button>
            </div>
          </Campo>

          <Campo etiqueta="Título" ayuda="El nombre de tu solución. Corto y reconocible.">
            <input name="titulo" defaultValue={producto?.titulo} required maxLength={120} className={INPUT} />
          </Campo>

          <Campo
            etiqueta="Frase gancho"
            ayuda="Una línea que explique qué consigue el cliente. Aparece bajo el título."
          >
            <input
              name="tagline"
              defaultValue={producto?.tagline}
              required
              maxLength={200}
              placeholder="Atención al cliente automatizada 24/7 por WhatsApp"
              className={INPUT}
            />
          </Campo>

          <Campo etiqueta="Categoría">
            <select name="category_id" defaultValue={producto?.category_id ?? ''} required className={INPUT}>
              <option value="" disabled>
                Elige un sector…
              </option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.icono} {categoria.nombre}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Tipo de producto">
            <select name="product_type" defaultValue={producto?.product_type ?? 'automation'} className={INPUT}>
              {TIPOS.map((tipo) => (
                <option key={tipo.valor} value={tipo.valor}>
                  {tipo.etiqueta}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Idioma del producto" ayuda="La plataforma es en español, pero tu producto puede estar en inglés.">
            <select name="idioma_producto" defaultValue={producto?.idioma_producto ?? 'es'} className={INPUT}>
              <option value="es">Español</option>
              <option value="en">Inglés</option>
            </select>
          </Campo>
        </div>

        <div className={paso === 1 ? 'block' : 'hidden'}>
          <Campo
            etiqueta="El problema que resuelve"
            ayuda="Escríbelo desde el dolor del cliente, no desde la tecnología. Es lo primero que se lee."
          >
            <textarea
              name="problema"
              defaultValue={producto?.problema}
              required
              rows={4}
              maxLength={4000}
              placeholder="Las pymes pierden clientes porque no pueden responder WhatsApp 24 h…"
              className={INPUT}
            />
          </Campo>

          <Campo etiqueta="Cómo lo resuelve">
            <textarea
              name="solucion"
              defaultValue={producto?.solucion}
              required
              rows={4}
              maxLength={4000}
              className={INPUT}
            />
          </Campo>

          <Campo etiqueta="Qué hace exactamente" ayuda="Opcional. El detalle funcional, punto por punto.">
            <textarea
              name="descripcion"
              defaultValue={producto?.descripcion ?? ''}
              rows={5}
              maxLength={6000}
              className={INPUT}
            />
          </Campo>

          <Campo
            etiqueta="Integra con"
            ayuda="Separado por comas. Ej: WhatsApp Business, Google Calendar, n8n"
          >
            <input
              name="tags"
              defaultValue={producto?.tags?.join(', ')}
              maxLength={400}
              className={INPUT}
            />
          </Campo>
        </div>

        <div className={paso === 2 ? 'block' : 'hidden'}>
          <Campo etiqueta="Modelo de precio">
            <select
              name="pricing_model"
              value={modelo}
              onChange={(e) => setModelo(e.target.value as typeof modelo)}
              className={INPUT}
            >
              {MODELOS.map((m) => (
                <option key={m.valor} value={m.valor}>
                  {m.etiqueta}
                </option>
              ))}
            </select>
          </Campo>

          {modelo === 'setup_plus_monthly' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Precio de instalación (€)">
                <input
                  name="precio_setup"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={producto?.precio_setup ?? 197}
                  className={INPUT}
                />
              </Campo>
              <Campo etiqueta="Cuota mensual (€)">
                <input
                  name="precio_mensual"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={producto?.precio_mensual ?? 29}
                  className={INPUT}
                />
              </Campo>
            </div>
          ) : null}

          {modelo === 'one_time' ? (
            <Campo etiqueta="Precio (€)">
              <input
                name="precio_unico"
                type="number"
                min={0}
                step={1}
                defaultValue={producto?.precio_unico ?? 149}
                className={INPUT}
              />
            </Campo>
          ) : null}

          {modelo === 'monthly' ? (
            <Campo etiqueta="Cuota mensual (€)">
              <input
                name="precio_mensual"
                type="number"
                min={0}
                step={1}
                defaultValue={producto?.precio_mensual ?? 39}
                className={INPUT}
              />
            </Campo>
          ) : null}

          <div className="card mt-2 border-brand-200 bg-brand-50 p-4">
            <p className="text-sm font-bold text-brand-800">IAPyme no se lleva comisión</p>
            <p className="mt-1 text-sm text-brand-800/75">
              Cobras tú, directamente. En esta fase la plataforma no cobra nada: ni
              comisión, ni cuota. El precio que pongas es el que recibes.
            </p>
          </div>
        </div>

        <div className={paso === 3 ? 'block' : 'hidden'}>
          <Campo etiqueta="Ubicación">
            <div className="mt-1.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEsRemoto(true)}
                aria-pressed={esRemoto}
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  esRemoto
                    ? 'border-brand-500 bg-brand-50 font-semibold text-brand-800'
                    : 'border-ink/15 text-ink/70 hover:border-ink/30'
                }`}
              >
                En remoto / cualquier sitio
              </button>
              <button
                type="button"
                onClick={() => setEsRemoto(false)}
                aria-pressed={!esRemoto}
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  !esRemoto
                    ? 'border-brand-500 bg-brand-50 font-semibold text-brand-800'
                    : 'border-ink/15 text-ink/70 hover:border-ink/30'
                }`}
              >
                Sitio concreto
              </button>
            </div>

            {!esRemoto ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input
                  name="ubicacion"
                  defaultValue={producto?.ubicacion ?? ''}
                  placeholder="Jerez de la Frontera"
                  maxLength={200}
                  className={INPUT}
                />
                <input
                  name="provincia"
                  defaultValue={producto?.provincia ?? ''}
                  placeholder="Cádiz"
                  maxLength={80}
                  className={INPUT}
                />
              </div>
            ) : null}
          </Campo>

          <Campo
            etiqueta="Tiempo de instalación (minutos)"
            ayuda="Sé honesto. Es el dato que más miran las pymes, y quedar mal aquí cuesta reviews."
          >
            {/* step=1: con un step mayor el navegador rechaza en silencio los valores
                que no caen en la rejilla (con step=5 desde min=1, «30» era inválido)
                y el formulario deja de enviarse sin decir por qué. */}
            <input
              name="minutos_instalacion"
              type="number"
              min={1}
              step={1}
              defaultValue={producto?.minutos_instalacion ?? 30}
              className={INPUT}
            />
          </Campo>

          <Campo
            etiqueta="Qué necesita tener el comprador"
            ayuda="Cuentas, software o accesos imprescindibles. Sin esto, la ficha no pasa revisión."
          >
            <textarea
              name="requisitos"
              defaultValue={producto?.requisitos ?? ''}
              rows={3}
              maxLength={2000}
              placeholder="Un número de WhatsApp Business y una cuenta de Google Calendar."
              className={INPUT}
            />
          </Campo>

          <Campo etiqueta="Imagen de portada">
            <SubirImagen userId={userId} valor={portada} onChange={setPortada} />
          </Campo>

          <Campo etiqueta="Vídeo demo (URL)" ayuda="YouTube, Loom o Vimeo. Las fichas con demo convierten mucho mejor.">
            <input
              name="demo_video_url"
              type="url"
              defaultValue={producto?.demo_video_url ?? ''}
              placeholder="https://www.loom.com/share/…"
              className={INPUT}
            />
          </Campo>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {paso > 0 ? (
          <button type="button" onClick={() => setPaso(paso - 1)} className="btn-secondary">
            ← Atrás
          </button>
        ) : null}

        {paso < PASOS.length - 1 ? (
          <button type="button" onClick={() => setPaso(paso + 1)} className="btn-primary">
            Siguiente →
          </button>
        ) : (
          <button type="submit" disabled={guardando} className="btn-primary disabled:opacity-60">
            {guardando ? 'Guardando…' : 'Enviar a revisión'}
          </button>
        )}

        <button
          type="button"
          disabled={guardando}
          onClick={(e) => {
            const form = e.currentTarget.form;
            if (form) void enviar(new FormData(form), false);
          }}
          className="ml-auto text-sm font-semibold text-ink/60 hover:text-ink disabled:opacity-60"
        >
          Guardar borrador
        </button>
      </div>

      <p className="mt-4 text-xs text-ink/50">
        Toda ficha pasa por revisión antes de publicarse. Comprobamos que tenga demo,
        requisitos claros y que sea un producto, no un curso.
      </p>
    </form>
  );
}

const INPUT =
  'mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500';

function Campo({
  etiqueta,
  ayuda,
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-5 block">
      <span className="text-sm font-semibold">{etiqueta}</span>
      {ayuda ? <span className="mt-0.5 block text-xs text-ink/55">{ayuda}</span> : null}
      {children}
    </label>
  );
}
