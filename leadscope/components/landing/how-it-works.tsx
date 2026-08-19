const STEPS = [
  {
    step: '01',
    title: 'Define tu búsqueda',
    description: 'Elige un nicho y una ubicación: ciudad, código postal o radio en kilómetros.',
  },
  {
    step: '02',
    title: 'Analizamos cada negocio',
    description:
      'Consultamos Google Places y comprobamos en vivo el estado de la web de cada resultado.',
  },
  {
    step: '03',
    title: 'Filtra y prioriza',
    description:
      'Ordena por oportunidad, reseñas o puntuación y quédate solo con los leads que te interesan.',
  },
  {
    step: '04',
    title: 'Exporta y contacta',
    description: 'Descarga en CSV, Excel o PDF y súbelo directamente a tu CRM o secuencia de email.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-y border-border bg-surface/50 py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            De la búsqueda al lead en segundos
          </h2>
        </div>

        <div className="relative mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ step, title, description }) => (
            <div key={step} className="relative">
              <span className="text-4xl font-semibold text-brand-500/30">{step}</span>
              <h3 className="mt-3 text-base font-semibold text-fg">{title}</h3>
              <p className="mt-2 text-sm text-muted">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
