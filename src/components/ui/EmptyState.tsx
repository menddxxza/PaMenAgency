import type { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
}

// Un negocio que acaba de darse de alta ve todas las pantallas vacías. Antes
// solo había un "No hay citas todavía." en gris: ni explicaba de qué va la
// sección ni ofrecía el siguiente paso.
export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="blank-slate">
      {icon && (
        <span className="blank-slate__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="blank-slate__title">{title}</span>
      <p className="blank-slate__desc">{description}</p>
      {action}
    </div>
  )
}
