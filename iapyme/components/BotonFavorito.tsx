'use client';

import { useFavoritos } from './FavoritosProvider';

export default function BotonFavorito({
  productId,
  variante = 'tarjeta',
}: {
  productId: string;
  /** 'tarjeta': círculo pequeño sobre la imagen. 'ficha': botón con texto. */
  variante?: 'tarjeta' | 'ficha';
}) {
  const { esFavorito, alternar } = useFavoritos();
  const activo = esFavorito(productId);

  function onClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    void alternar(productId);
  }

  if (variante === 'ficha') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={activo}
        className={`btn-secondary w-full ${activo ? 'border-brand-400 text-brand-700' : ''}`}
      >
        <span aria-hidden>{activo ? '♥' : '♡'}</span>
        {activo ? 'Guardado en favoritos' : 'Guardar en favoritos'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      aria-label={activo ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={`flex h-8 w-8 items-center justify-center rounded-full text-lg shadow-sm
                  backdrop-blur-sm transition-colors duration-fast ease-out
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
                  ${activo ? 'bg-white text-brand-600' : 'bg-white/85 text-ink/45 hover:text-brand-600'}`}
    >
      <span aria-hidden>{activo ? '♥' : '♡'}</span>
    </button>
  );
}
