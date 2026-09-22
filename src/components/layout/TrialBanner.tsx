import { Link } from 'react-router-dom'
import { useSubscription } from '@/hooks/useSubscription'

// Durante la prueba el cliente tiene que saber, sin buscarlo, cuánto le queda
// y dónde contratar. Sin esto la prueba se acaba de golpe un día cualquiera y
// el panel se cierra sin aviso previo, que es la peor manera de perder a
// alguien que ya estaba usando el producto.
export function TrialBanner() {
  const { isTrialing, trialDaysLeft } = useSubscription()

  if (!isTrialing) return null

  const daysLeft = trialDaysLeft
  // El último día (menos de 24 h) se avisa en tono de urgencia.
  const isLastDay = daysLeft !== null && daysLeft < 1

  let message: string
  if (daysLeft === null) {
    message = 'Estás probando Atiende gratis.'
  } else if (isLastDay) {
    message = 'Hoy es el último día de tu prueba gratuita.'
  } else if (daysLeft === 1) {
    message = 'Te queda 1 día de prueba gratuita.'
  } else {
    message = `Te quedan ${daysLeft} días de prueba gratuita.`
  }

  return (
    <div className={`trial-banner ${isLastDay ? 'trial-banner--urgent' : ''}`} role="status">
      <span className="trial-banner__text">
        <strong>{message}</strong> Después necesitarás un plan para seguir entrando al panel. Tus datos se quedan
        donde están.
      </span>
      <Link to="/suscripcion" className="btn btn--sm btn--primary trial-banner__cta">
        Elegir plan
      </Link>
    </div>
  )
}
