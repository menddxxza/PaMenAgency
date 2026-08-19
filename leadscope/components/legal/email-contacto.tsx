'use client';

import { useEffect, useState } from 'react';

/**
 * El email no va en el HTML que sirve el servidor: se reconstruye en el
 * navegador tras montar, para que un bot que solo lee el marcado estático
 * de estas páginas públicas no encuentre nada que recolectar.
 */
export function EmailContacto({ className }: { className?: string }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const usuario = ['hola', 'leadscope'].join('.');
    const dominio = ['leadscope', 'app'].join('.');
    setEmail(`${usuario}@${dominio}`);
  }, []);

  if (!email) {
    return <span className={className}>nuestro correo de contacto</span>;
  }

  return (
    <a href={`mailto:${email}`} className={className}>
      {email}
    </a>
  );
}
