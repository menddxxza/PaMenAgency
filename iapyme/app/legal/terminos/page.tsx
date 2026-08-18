import PaginaLegal from '@/components/PaginaLegal';
import SeccionLegal from '@/components/SeccionLegal';

export const metadata = {
  title: 'Términos y condiciones · IAPyme',
  description: 'Condiciones de uso de la plataforma IAPyme.',
  alternates: { canonical: '/legal/terminos' },
};

export default function TerminosPage() {
  return (
    <PaginaLegal titulo="Términos y condiciones" actualizado="11 de agosto de 2026">
      <SeccionLegal titulo="1. Qué es IAPyme">
        <p>
          IAPyme es un marketplace donde vendedores publican soluciones de IA (automatizaciones,
          agentes, bots, apps, SaaS, scripts o plantillas) para que pymes las encuentren y
          contacten con ellos. Al usar iapymeapp.com aceptas estas condiciones.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="2. Qué papel tiene IAPyme">
        <p>
          IAPyme <strong>pone en contacto</strong> a compradores y vendedores; no es parte del
          acuerdo entre ambos. La venta, instalación, soporte y garantías de cada producto son
          responsabilidad exclusiva del vendedor que lo publica. Actualmente IAPyme no procesa
          pagos: la forma de pago se acuerda directamente entre comprador y vendedor.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="3. Comisión">
        <p>
          Publicar y vender en IAPyme es gratuito, sin comisión, mientras la plataforma esté
          en su fase inicial. Si en el futuro se introduce una comisión, se avisará con
          antelación y nunca se aplicará con carácter retroactivo a ventas ya realizadas.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="4. Cuentas de usuario">
        <ul className="list-disc space-y-2 pl-5">
          <li>Debes dar datos veraces al registrarte.</li>
          <li>Eres responsable de la actividad de tu cuenta y de mantener tu contraseña a salvo.</li>
          <li>Puedes cerrar tu cuenta cuando quieras, escribiendo a hola@iapymeapp.com.</li>
        </ul>
      </SeccionLegal>

      <SeccionLegal titulo="5. Qué se puede publicar">
        <p>Solo productos digitales listos para usar relacionados con IA. No está permitido publicar:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Productos físicos o servicios sin relación con IA.</li>
          <li>Contenido ilegal, fraudulento, engañoso o que infrinja derechos de terceros.</li>
          <li>Cursos, infoproductos o formaciones (para eso existen otras plataformas).</li>
        </ul>
        <p>
          Todo producto pasa por una revisión antes de publicarse. IAPyme puede rechazar,
          despublicar o eliminar cualquier ficha que incumpla estas condiciones, sin previo
          aviso si el caso lo requiere.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="6. Límite de responsabilidad">
        <p>
          IAPyme se ofrece &quot;tal cual&quot;. No garantizamos disponibilidad continua ni la
          calidad, funcionamiento o resultado de los productos publicados por terceros. En la
          medida permitida por la ley, IAPyme no será responsable de daños derivados del uso de
          la plataforma o de las soluciones adquiridas a través de ella.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="7. Cambios">
        <p>
          Podemos actualizar estas condiciones cuando sea necesario. Los cambios relevantes se
          indicarán con la fecha de actualización en esta misma página.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="8. Ley aplicable">
        <p>Estas condiciones se rigen por la legislación española.</p>
      </SeccionLegal>
    </PaginaLegal>
  );
}
