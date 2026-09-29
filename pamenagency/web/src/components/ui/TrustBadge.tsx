import { Icon } from './Icon'

/**
 * Aviso corto de confianza para junto al consentimiento de un formulario.
 *
 * No es un sello ni una certificación de terceros —no la tenemos— sino un
 * recordatorio honesto de la propia política: los datos no se venden ni se
 * ceden. Eso ya lo dice la política de privacidad; esto lo pone a la vista
 * en el momento exacto en que alguien duda si rellenar el formulario.
 */
export function TrustBadge() {
  return (
    <p className="pm-trustbadge">
      <Icon name="shield" size={15} />
      Tus datos no se venden ni se ceden a terceros. Solo se usan para responderte.
    </p>
  )
}
