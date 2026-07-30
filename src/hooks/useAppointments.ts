// Citas, conversaciones, clientes y servicios comparten ahora una sola carga
// y un solo canal de Realtime por negocio. Se reexporta para no cambiar los
// imports de las páginas.
export { useAppointments } from '@/context/BusinessDataContext'
