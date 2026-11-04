/**
 * Fondo fijo de toda la web: el terciopelo burdeos con manchas de luz
 * difusas y unas formas de cristal que flotan muy despacio, como en la web
 * de referencia pero con los colores de la marca.
 *
 * Es decorativo y no recibe eventos. Con «reducir movimiento» las formas se
 * quedan quietas (ver estetica.css).
 */
export function FondoAmbiental() {
  return (
    <div className="pt-velvet pt-ambiente" aria-hidden="true">
      <span className="pt-ambiente__luz pt-ambiente__luz--1" />
      <span className="pt-ambiente__luz pt-ambiente__luz--2" />
      <span className="pt-ambiente__luz pt-ambiente__luz--3" />
      <span className="pt-ambiente__forma pt-ambiente__forma--1" />
      <span className="pt-ambiente__forma pt-ambiente__forma--2" />
      <span className="pt-ambiente__forma pt-ambiente__forma--3" />
      <span className="pt-ambiente__forma pt-ambiente__forma--4" />
      <span className="pt-ambiente__puntos" />
    </div>
  )
}
