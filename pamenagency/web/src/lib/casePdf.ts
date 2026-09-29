import type { Caso } from '@/content/cases'

/**
 * PDF descargable de un caso de ejemplo, con la marca de PaMenAgency.
 *
 * `jsPDF` se importa de forma diferida (`import()`), así que su peso no
 * entra en el bundle principal: sólo se descarga si alguien pulsa el botón.
 * El PDF repite la misma etiqueta "caso de ejemplo" que ya lleva la
 * tarjeta en pantalla — es información ilustrativa, y el documento debe
 * decirlo tan claro como la web.
 */
export async function descargarCasoPdf(caso: Caso) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const oro: [number, number, number] = [212, 175, 55]
  const gris: [number, number, number] = [110, 110, 110]
  const negro: [number, number, number] = [20, 20, 20]
  const margen = 56
  let y = 64

  // Marca en cabecera.
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...oro)
  doc.text('PAMEN', margen, y)
  doc.setTextColor(...negro)
  doc.text('AGENCY', margen + doc.getTextWidth('PAMEN'), y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...gris)
  doc.text('pamenagency.com', 595 - margen, y, { align: 'right' })

  y += 12
  doc.setDrawColor(...oro)
  doc.setLineWidth(1)
  doc.line(margen, y, 595 - margen, y)
  y += 36

  // Etiqueta de caso ilustrativo — misma advertencia que en la web.
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...oro)
  doc.text('CASO DE EJEMPLO — ILUSTRATIVO, NO UN CLIENTE REAL', margen, y)
  y += 30

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...negro)
  doc.text(caso.sector, margen, y)
  y += 20
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(...gris)
  doc.text(caso.tamano, margen, y)
  y += 34

  const parrafo = (titulo: string, texto: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...oro)
    doc.text(titulo.toUpperCase(), margen, y)
    y += 16
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(...negro)
    const lineas = doc.splitTextToSize(texto, 595 - margen * 2)
    doc.text(lineas, margen, y)
    y += lineas.length * 15 + 22
  }

  parrafo('El reto', caso.reto)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...oro)
  doc.text('LO QUE SE IMPLANTÓ', margen, y)
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(...negro)
  for (const item of caso.implantado) {
    const lineas = doc.splitTextToSize(`•  ${item}`, 595 - margen * 2)
    doc.text(lineas, margen, y)
    y += lineas.length * 15 + 4
  }
  y += 18

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...oro)
  // "->" en vez de "→": las fuentes estándar de PDF (Helvetica) sólo
  // soportan WinAnsi, y ese carácter Unicode sale corrupto sin incrustar
  // una fuente propia.
  doc.text('ANTES -> DESPUÉS', margen, y)
  y += 20
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...negro)
  doc.text(caso.antes, margen, y)
  doc.text('->', margen + 90, y)
  doc.text(caso.despues, margen + 120, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...gris)
  doc.text(caso.metrica, margen, y + 16)

  // Pie, en la parte baja de la página.
  const pieY = 780
  doc.setDrawColor(230, 230, 230)
  doc.line(margen, pieY - 20, 595 - margen, pieY - 20)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...gris)
  doc.text(
    'Caso ilustrativo construido sobre situaciones habituales del sector, no un cliente real. PaMenAgency · pamenagency.com',
    margen,
    pieY,
  )

  doc.save(`pamenagency-caso-${caso.sectorSlug}.pdf`)
}
