// La suscripción vive ahora en un contexto (una sola consulta por sesión en
// vez de una por componente). Se reexporta desde aquí para no cambiar los
// imports que ya existían.
export { useSubscription } from '@/context/SubscriptionContext'
