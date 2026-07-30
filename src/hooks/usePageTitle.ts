import { useEffect } from 'react'

// El título que trae index.html (con el reclamo para buscadores) es el que
// debe quedar en la landing, así que se guarda al arrancar para poder
// restaurarlo al salir de una pantalla del panel.
const DEFAULT_TITLE = typeof document !== 'undefined' ? document.title : 'Atiende'

// Todas las pestañas se llamaban "Atiende". Con varias abiertas —lo normal
// en un negocio que trabaja con la agenda y las conversaciones a la vez— no
// había forma de distinguirlas.
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · Atiende`
    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [title])
}
