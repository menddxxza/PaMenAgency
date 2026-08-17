'use client';

import { useEffect, useState } from 'react';

/**
 * El email de contacto no va en el HTML que sirve el servidor: se reconstruye en
 * el navegador después de montar. Los bots de recolección de spam leen el HTML
 * estático de páginas públicas como estas (privacidad, cookies, términos) buscando
 * "algo@algo.algo" — si nunca aparece así en el marcado, no hay nada que cosechar.
 * Para una persona real es invisible: el email aparece en cuanto carga la página.
 */
export default function EmailContacto({ className }: { className?: string }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const usuario = ['pabloangelmendoza', '82'].join('');
    const dominio = ['gmail', 'com'].join('.');
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
