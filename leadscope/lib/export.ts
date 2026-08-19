import type { Business } from '@/lib/types';

const WEBSITE_STATUS_LABEL: Record<Business['websiteStatus'], string> = {
  no_website: 'Sin web',
  social_only: 'Solo redes sociales',
  broken: 'Web rota',
  outdated: 'Web antigua',
  active: 'Web activa',
};

function toRow(b: Business) {
  return {
    Nombre: b.name,
    Teléfono: b.phone ?? '',
    Email: b.email ?? '',
    WhatsApp: b.socialLinks.whatsapp ?? '',
    Dirección: b.address,
    Rating: b.rating ?? '',
    Reseñas: b.reviewsCount,
    Categoría: b.category,
    'Abierto ahora': b.openingHours?.openNow ? 'Sí' : 'No',
    'Estado web': WEBSITE_STATUS_LABEL[b.websiteStatus],
    Web: b.website ?? '',
    Oportunidad: b.opportunity,
    'Google Maps': b.mapsUrl,
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportToCsv(businesses: Business[], filename = 'leadscope-resultados.csv') {
  const Papa = (await import('papaparse')).default;
  const csv = Papa.unparse(businesses.map(toRow));
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename);
}

export async function exportToXlsx(businesses: Business[], filename = 'leadscope-resultados.xlsx') {
  const XLSX = await import('xlsx');
  const worksheet = XLSX.utils.json_to_sheet(businesses.map(toRow));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados');
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  downloadBlob(
    new Blob([buffer], { type: 'application/octet-stream' }),
    filename
  );
}

export async function exportToPdf(businesses: Business[], filename = 'leadscope-resultados.pdf') {
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(14);
  doc.text('LeadScope — Resultados de búsqueda', 14, 16);
  doc.setFontSize(9);
  doc.text(`Generado el ${new Date().toLocaleString('es-ES')} · ${businesses.length} negocios`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [['Nombre', 'Teléfono', 'Dirección', 'Rating', 'Reseñas', 'Estado web', 'Oportunidad']],
    body: businesses.map((b) => [
      b.name,
      b.phone ?? '—',
      b.address,
      b.rating?.toFixed(1) ?? '—',
      String(b.reviewsCount),
      WEBSITE_STATUS_LABEL[b.websiteStatus],
      b.opportunity,
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [209, 143, 34] },
  });

  doc.save(filename);
}
