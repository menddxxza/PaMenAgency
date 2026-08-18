import PaginaLegal from '@/components/PaginaLegal';
import SeccionLegal from '@/components/SeccionLegal';

export const metadata = {
  title: 'Política de cookies · IAPyme',
  description: 'Qué cookies usa IAPyme y para qué sirven.',
  alternates: { canonical: '/legal/cookies' },
};

export default function PoliticaCookiesPage() {
  return (
    <PaginaLegal titulo="Política de cookies" actualizado="11 de agosto de 2026">
      <SeccionLegal titulo="1. Qué es una cookie">
        <p>
          Una cookie es un pequeño archivo que se guarda en tu navegador cuando visitas una
          web, y que sirve para recordar información entre una página y otra (por ejemplo, que
          has iniciado sesión).
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="2. Qué cookies usa IAPyme">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Cookies de sesión (necesarias):</strong> las genera Supabase para
            mantenerte identificado mientras navegas con tu cuenta iniciada. Sin ellas no
            podrías entrar en tu panel de vendedor. No se pueden desactivar porque son
            imprescindibles para el funcionamiento de la web.
          </li>
          <li>
            <strong>Analítica (opcional):</strong> si está activada, usamos Plausible, una
            herramienta de estadísticas que <strong>no utiliza cookies</strong> ni recoge
            datos personales identificables: solo cuenta visitas de forma agregada y anónima.
          </li>
        </ul>
        <p>No usamos cookies de publicidad ni de seguimiento de terceros.</p>
      </SeccionLegal>

      <SeccionLegal titulo="3. Cómo desactivar las cookies">
        <p>
          Puedes bloquear o eliminar las cookies desde la configuración de tu navegador en
          cualquier momento. Ten en cuenta que, si bloqueas las cookies necesarias, no podrás
          iniciar sesión ni usar tu panel de vendedor.
        </p>
      </SeccionLegal>
    </PaginaLegal>
  );
}
