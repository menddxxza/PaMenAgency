import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/legal-layout';
import { LegalSection } from '@/components/legal/section';
import { EmailContacto } from '@/components/legal/email-contacto';

export const metadata: Metadata = {
  title: 'Tratamiento de datos — LeadScope',
  description:
    'Cómo trata LeadScope los datos de las cuentas de usuario y los datos de negocios de terceros que aparecen en los resultados de búsqueda.',
  alternates: { canonical: '/legal/tratamiento-datos' },
};

export default function TratamientoDatosPage() {
  return (
    <LegalLayout title="Tratamiento de datos" updated="19 de agosto de 2026">
      <p className="text-sm text-muted">
        Este documento complementa la{' '}
        <a href="/legal/privacidad" className="underline underline-offset-2">
          política de privacidad
        </a>{' '}
        y explica, con más detalle, cómo tratamos dos tipos de datos muy distintos: los tuyos
        (como usuario registrado) y los de los negocios que aparecen en tus resultados de
        búsqueda (terceros que no tienen cuenta en LeadScope).
      </p>

      <LegalSection title="1. Tus datos como usuario">
        <p>
          Actuamos como <strong>responsables del tratamiento</strong> de los datos de tu cuenta
          (email, nombre, historial de búsquedas, datos de facturación). La base legal es la
          ejecución del contrato de servicio que aceptas al registrarte, y en el caso de las
          comunicaciones de servicio, nuestro interés legítimo en que puedas usar la plataforma
          correctamente.
        </p>
      </LegalSection>

      <LegalSection title="2. Los datos de los negocios que muestra la búsqueda">
        <p>
          Cuando buscas «dentistas en Madrid», LeadScope consulta Google Places y, para cada
          resultado, comprueba en vivo el estado de su web. Los datos que ves —nombre, teléfono,
          dirección, rating, y el email si la propia web del negocio lo publica— son datos
          públicos que esas fuentes ya exponían antes de que LeadScope los consultara: no los
          obtenemos por scraping ni por ninguna vía distinta a la API oficial de Google y al HTML
          público de la web del negocio.
        </p>
        <p className="mt-3">
          Para negocios que son personas físicas (autónomos cuyo nombre comercial coincide con su
          nombre y apellidos), esta información puede constituir un dato personal a efectos del
          RGPD. Nuestra base legal para mostrarla es el{' '}
          <strong>interés legítimo</strong> en indexar información ya pública, con una finalidad
          de intermediación B2B (ayudar a agencias y profesionales a ofrecer sus servicios a
          negocios que podrían necesitarlos) — sin crear perfiles nuevos ni combinar esta
          información con otras fuentes.
        </p>
      </LegalSection>

      <LegalSection title="3. Tu responsabilidad al exportar y contactar">
        <p>
          Cuando exportas resultados y los usas para contactar a esos negocios, pasas a ser tú
          quien decide los medios y fines de ese tratamiento posterior — es decir,{' '}
          <strong>te conviertes en responsable independiente</strong> de esa parte del
          tratamiento, no LeadScope. Eso implica, entre otras cosas:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Identificarte con claridad en cualquier comunicación comercial.</li>
          <li>Ofrecer siempre una forma sencilla de que dejen de ser contactados.</li>
          <li>
            No conservar ni reutilizar esos datos más allá de lo necesario para tu prospección.
          </li>
          <li>
            Atender tú mismo cualquier solicitud de un negocio que quiera ejercer sus derechos
            sobre los datos que le enviaste o con los que le contactaste.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Encargados y subencargados del tratamiento">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Supabase</strong> — base de datos y autenticación (alojamiento en la UE).
          </li>
          <li>
            <strong>Vercel</strong> — alojamiento de la aplicación web.
          </li>
          <li>
            <strong>Google LLC</strong> — Places API y Geocoding API, para obtener los resultados
            de cada búsqueda.
          </li>
          <li>
            <strong>Stripe</strong> — procesamiento de pagos del plan Pro.
          </li>
          <li>
            <strong>Anthropic / OpenAI</strong> — solo si activas la clasificación de calidad de
            web con IA; reciben el HTML de la home del negocio, no datos personales tuyos.
          </li>
        </ul>
        <p className="mt-3">
          Algunos de estos proveedores pueden procesar datos fuera del Espacio Económico Europeo;
          en ese caso, se amparan en las Cláusulas Contractuales Tipo de la Comisión Europea u
          otro mecanismo de transferencia válido conforme al RGPD.
        </p>
      </LegalSection>

      <LegalSection title="5. Medidas de seguridad">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Cada usuario solo puede leer sus propias búsquedas y resultados guardados (Row Level
            Security a nivel de base de datos).
          </li>
          <li>Toda la comunicación viaja cifrada (HTTPS/TLS).</li>
          <li>
            Las claves con privilegios elevados (como la clave de servicio de Supabase) solo se
            usan en el servidor y nunca se exponen al navegador.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Derechos sobre datos de negocios mostrados">
        <p>
          Si eres titular de un negocio y quieres que dejemos de mostrar o de conservar en
          búsquedas guardadas la información asociada a tu negocio, escríbenos a{' '}
          <EmailContacto /> y lo eliminamos de nuestro sistema. Ten en cuenta que si tu
          información sigue siendo pública en Google Places o en tu propia web, futuras búsquedas
          podrían volver a mostrarla — el cambio real debe hacerse en la fuente original.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
