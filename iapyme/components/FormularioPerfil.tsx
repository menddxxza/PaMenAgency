'use client';

import { useState } from 'react';
import { actualizarPerfil } from '@/app/dashboard/actions';
import SubirImagen from './SubirImagen';
import type { Profile } from '@/lib/database.types';

type Estado = 'reposo' | 'guardando' | 'guardado';

export default function FormularioPerfil({ perfil }: { perfil: Profile }) {
  const [estado, setEstado] = useState<Estado>('reposo');
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState(perfil.avatar_url ?? '');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado('guardando');
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set('avatar_url', avatar);

    const resultado = await actualizarPerfil(formData);

    if (!resultado.ok) {
      setError(resultado.error);
      setEstado('reposo');
      return;
    }

    setEstado('guardado');
    setTimeout(() => setEstado('reposo'), 2500);
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-xl space-y-5 p-6">
      <div>
        <label htmlFor="perfil-nombre" className="text-sm font-semibold">
          Nombre o negocio
        </label>
        <input
          id="perfil-nombre"
          name="display_name"
          required
          defaultValue={perfil.display_name}
          className="mt-1.5 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none
                     focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <p className="mt-1 text-xs text-ink/50">Así apareces firmando tus fichas y respuestas.</p>
      </div>

      <div>
        <label htmlFor="perfil-bio" className="text-sm font-semibold">
          Sobre ti o tu negocio
        </label>
        <textarea
          id="perfil-bio"
          name="bio"
          rows={4}
          maxLength={500}
          defaultValue={perfil.bio ?? ''}
          placeholder="A qué te dedicas, qué tipo de soluciones construyes, desde cuándo..."
          className="mt-1.5 w-full resize-y rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none
                     focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <p className="mt-1 text-xs text-ink/50">
          Se muestra en tu perfil público. Ayuda a que confíen antes de escribirte.
        </p>
      </div>

      <div>
        <label htmlFor="perfil-web" className="text-sm font-semibold">
          Web (opcional)
        </label>
        <input
          id="perfil-web"
          name="website_url"
          defaultValue={perfil.website_url ?? ''}
          placeholder="tuweb.com"
          className="mt-1.5 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none
                     focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div>
        <label className="text-sm font-semibold">Foto o logo (opcional)</label>
        <div className="mt-1.5 max-w-[220px]">
          <SubirImagen userId={perfil.id} valor={avatar} onChange={setAvatar} aspecto="aspect-square" />
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={estado === 'guardando'}
          className="btn-primary disabled:opacity-60"
        >
          {estado === 'guardando' ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {estado === 'guardado' ? (
          <span className="text-sm font-medium text-accent-700">✓ Guardado</span>
        ) : null}
      </div>
    </form>
  );
}
