/**
 * Parser CSV mínimo (sin dependencias) para importar leads reales: soporta
 * campos entre comillas con comas dentro, no soporta saltos de línea dentro
 * de un campo (suficiente para un CSV de nombre/email/teléfono/valor).
 */

export interface ParsedLeadRow {
  name: string;
  email: string | null;
  phone: string | null;
  estimatedValue: number | null;
}

export interface ParseLeadsCsvResult {
  rows: ParsedLeadRow[];
  errors: string[];
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function findColumn(header: string[], candidates: string[]): number {
  for (const candidate of candidates) {
    const idx = header.indexOf(candidate);
    if (idx !== -1) return idx;
  }
  return -1;
}

export function parseLeadsCsv(text: string): ParseLeadsCsvResult {
  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { rows: [], errors: ['El archivo está vacío.'] };
  }

  const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const nameIdx = findColumn(header, ['name', 'nombre']);
  const emailIdx = findColumn(header, ['email', 'correo']);
  const phoneIdx = findColumn(header, ['phone', 'telefono', 'teléfono', 'móvil', 'movil']);
  const valueIdx = findColumn(header, ['estimated_value', 'valor', 'value', 'ticket']);

  if (nameIdx === -1) {
    return { rows: [], errors: ['El CSV necesita una columna "name" o "nombre".'] };
  }

  const rows: ParsedLeadRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const name = (cols[nameIdx] ?? '').trim();
    const email = emailIdx !== -1 ? (cols[emailIdx] ?? '').trim() : '';
    const phone = phoneIdx !== -1 ? (cols[phoneIdx] ?? '').trim() : '';
    const rawValue = valueIdx !== -1 ? (cols[valueIdx] ?? '').trim() : '';

    if (!name) {
      errors.push(`Fila ${i + 1}: falta el nombre, se ignora.`);
      continue;
    }
    if (!email && !phone) {
      errors.push(`Fila ${i + 1} ("${name}"): sin email ni teléfono, se ignora.`);
      continue;
    }

    const parsedValue = rawValue ? Number(rawValue.replace(',', '.')) : NaN;

    rows.push({
      name,
      email: email || null,
      phone: phone || null,
      estimatedValue: Number.isFinite(parsedValue) ? parsedValue : null,
    });
  }

  return { rows, errors };
}
