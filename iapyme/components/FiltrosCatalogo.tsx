'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const PRECIOS = [
  { valor: '100', etiqueta: 'Menos de 100 €' },
  { valor: '300', etiqueta: 'Menos de 300 €' },
  { valor: '1000', etiqueta: 'Menos de 1.000 €' },
];

const TIEMPOS = [
  { valor: '30', etiqueta: 'Menos de 30 min' },
  { valor: '60', etiqueta: 'Menos de 1 hora' },
  { valor: '1440', etiqueta: 'Menos de 1 día' },
];

const IDIOMAS = [
  { valor: 'es', etiqueta: 'Español' },
  { valor: 'en', etiqueta: 'Inglés' },
];

const ORDENES = [
  { valor: 'recientes', etiqueta: 'Más recientes' },
  { valor: 'vistos', etiqueta: 'Más vistas' },
  { valor: 'baratos', etiqueta: 'Precio más bajo' },
];

export default function FiltrosCatalogo() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function alternar(clave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(clave) === valor) params.delete(clave);
    else params.set(clave, valor);
    router.push(`${pathname}?${params.toString()}`);
  }

  const hayFiltros = ['precioMax', 'minutosMax', 'idioma', 'orden'].some((k) =>
    searchParams.has(k),
  );

  return (
    <div className="space-y-6">
      <Grupo
        titulo="Precio de entrada"
        opciones={PRECIOS}
        activo={searchParams.get('precioMax')}
        onSelect={(v) => alternar('precioMax', v)}
      />
      <Grupo
        titulo="Listo en"
        opciones={TIEMPOS}
        activo={searchParams.get('minutosMax')}
        onSelect={(v) => alternar('minutosMax', v)}
      />
      <Grupo
        titulo="Idioma del producto"
        opciones={IDIOMAS}
        activo={searchParams.get('idioma')}
        onSelect={(v) => alternar('idioma', v)}
      />
      <Grupo
        titulo="Ordenar por"
        opciones={ORDENES}
        activo={searchParams.get('orden') ?? 'recientes'}
        onSelect={(v) => alternar('orden', v)}
      />

      {hayFiltros ? (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="text-sm font-semibold text-brand-600 hover:underline"
        >
          Quitar filtros
        </button>
      ) : null}
    </div>
  );
}

function Grupo({
  titulo,
  opciones,
  activo,
  onSelect,
}: {
  titulo: string;
  opciones: { valor: string; etiqueta: string }[];
  activo: string | null;
  onSelect: (valor: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-xs font-bold uppercase tracking-wider text-ink/60">
        {titulo}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:items-start">
        {opciones.map((opcion) => {
          const seleccionado = activo === opcion.valor;
          return (
            <button
              key={opcion.valor}
              type="button"
              aria-pressed={seleccionado}
              onClick={() => onSelect(opcion.valor)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                seleccionado
                  ? 'bg-brand-50 font-semibold text-brand-700 ring-1 ring-brand-500'
                  : 'text-ink/70 hover:bg-ink/[0.04]'
              }`}
            >
              {opcion.etiqueta}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
