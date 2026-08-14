'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category, Product } from '@/lib/database.types';
import { guardarProducto } from '@/app/dashboard/actions';
import SubirImagen from './SubirImagen';

const PASOS = ['Lo básico', 'La ficha', 'El precio', 'La entrega'] as const;

const TIPOS = [
  { valor: 'automation', etiqueta: 'Automatización' },
  { valor: 'agent', etiqueta: 'Agente de IA' },
  { valor: 'bot', etiqueta: 'Bot' },
  { valor: 'app', etiqueta: 'App' },
  { valor: 'web', etiqueta: 'Web' },
  { valor: 'saas', etiqueta: 'SaaS' },
  { valor: 'script', etiqueta: 'Script' },
  { valor: 'template', etiqueta: 'Template' },
  { valor: 'service', etiqueta: 'Servicio' },
];

const MODELOS = [
  { valor: 'setup_plus_monthly', etiqueta: 'Instalación + cuota mensual' },
  { valor: 'one_time', etiqueta: 'Pago único' },
  { valor: 'monthly', etiqueta: 'Solo cuota mensual' },
  { valor: 'free', etiqueta: 'Gratis' },
];

export default function AsistentePublicacion({
  categorias,
  producto,
  userId,
}: {
  categorias: Category[];
  producto?: Product;
  userId: string;
}) {
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [modelo, setModelo] = useState(producto?.pricing_model ?? 'setup_plus_monthly');
  const [portada, setPortada] = useState(producto?.cover_image_url ?? '');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

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
      onSubmit={(e) => {
        e.preventDefault();
        const datos = new FormData(e.currentTarget);
        // El submit del formulario siempre manda a revisión; guardar borrador es el
        // otro botón, que llama a enviar() con aRevision=false.
        void enviar(datos, true);
      }}
    >
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
