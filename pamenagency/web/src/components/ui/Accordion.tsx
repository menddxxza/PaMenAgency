import { useId, useState } from 'react'

export type AccordionItem = {
  q: string
  a: string[]
}

/**
 * Acordeón accesible: los paneles existen siempre en el DOM (para que el
 * buscador del navegador los encuentre) y se ocultan con `hidden` cuando
 * están cerrados.
 */
export function Accordion({ items, allowMultiple = false }: { items: AccordionItem[]; allowMultiple?: boolean }) {
  const baseId = useId()
  const [open, setOpen] = useState<number[]>([])

  const toggle = (i: number) => {
    setOpen((prev) => {
      if (prev.includes(i)) return prev.filter((n) => n !== i)
      return allowMultiple ? [...prev, i] : [i]
    })
  }

  return (
    <div className="pm-accordion">
      {items.map((item, i) => {
        const isOpen = open.includes(i)
        const triggerId = `${baseId}-t-${i}`
        const panelId = `${baseId}-p-${i}`
        return (
          <div className="pm-accordion__item" key={item.q}>
            <h3>
              <button
                id={triggerId}
                className="pm-accordion__trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                type="button"
              >
                <span>{item.q}</span>
                <span className="pm-accordion__icon" aria-hidden="true" />
              </button>
            </h3>
            <div className="pm-accordion__panel" data-open={isOpen} role="region" aria-labelledby={triggerId}>
              <div className="pm-accordion__panelinner">
                <div className="pm-accordion__body" id={panelId}>
                  {item.a.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
