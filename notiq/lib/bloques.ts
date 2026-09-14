/**
 * El modelo de bloques del editor.
 *
 * Una nota se guarda como un array de bloques en `notes.content` (jsonb), no como
 * markdown. El markdown es una proyección: se genera al vuelo para mandarlo a la IA,
 * para copiar al portapapeles y para exportar. Guardar bloques y derivar markdown (y
 * no al revés) es lo que permite pegar el WYSIWYG encima sin reparsear en cada tecla.
 */

export type TipoBloque =
  | 'texto'
  | 'titulo'
  | 'subtitulo'
  | 'lista'
  | 'tarea'
  | 'codigo'
  | 'cita'
  | 'imagen'
  | 'tabla';

export type Bloque = {
  id: string;
  tipo: TipoBloque;
  texto: string;
  /** Solo para 'tarea'. */
  hecho?: boolean;
  /** Solo para 'codigo'. */
  lenguaje?: string;
  /** Solo para 'imagen': ruta de descarga del adjunto (/api/adjuntos/[id]). */
  url?: string;
  /** Solo para 'tabla': filas de celdas, todas con el mismo número de columnas. */
  filas?: string[][];
};

export const TIPOS_BLOQUE: { tipo: TipoBloque; etiqueta: string; atajo: string }[] = [
  { tipo: 'texto', etiqueta: 'Texto', atajo: 'texto' },
  { tipo: 'titulo', etiqueta: 'Título', atajo: '# ' },
  { tipo: 'subtitulo', etiqueta: 'Subtítulo', atajo: '## ' },
  { tipo: 'lista', etiqueta: 'Lista', atajo: '- ' },
  { tipo: 'tarea', etiqueta: 'Tarea', atajo: '[] ' },
  { tipo: 'codigo', etiqueta: 'Código', atajo: '```' },
  { tipo: 'cita', etiqueta: 'Cita', atajo: '> ' },
  { tipo: 'tabla', etiqueta: 'Tabla', atajo: 'tabla' },
];

export function nuevoBloque(tipo: TipoBloque = 'texto', texto = ''): Bloque {
  // 2×2 en blanco de partida: una tabla de 0 filas o columnas no tiene forma de
  // crecer desde la interfaz (los botones de "+ fila"/"+ columna" añaden a partir
  // de lo que ya haya, no parten de la nada).
  if (tipo === 'tabla') {
    return {
      id: idBloque(),
      tipo,
      texto,
      filas: [
        ['', ''],
        ['', ''],
      ],
    };
  }
  return { id: idBloque(), tipo, texto };
}

export function idBloque(): string {
  // crypto.randomUUID existe en el navegador moderno y en Node 19+, pero no en
  // algunos webviews viejos de Android que sí soportan el resto del editor.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Lee lo que hubiera en `notes.content`. Nunca lanza: el contenido es jsonb libre y
 * una nota rota no debe tumbar la lista entera de notas.
 */
export function comoBloques(valor: unknown): Bloque[] {
  if (!Array.isArray(valor)) return [nuevoBloque()];

  const bloques = valor.flatMap((crudo): Bloque[] => {
    if (!crudo || typeof crudo !== 'object') return [];
    const b = crudo as Record<string, unknown>;
    const tipo = TIPOS_BLOQUE.some((t) => t.tipo === b.tipo) || b.tipo === 'imagen'
      ? (b.tipo as TipoBloque)
      : 'texto';

    // Filas válidas: un array de arrays de strings, o si no, la tabla en blanco de
    // nuevoBloque — una tabla sin filas no se podría ni empezar a rellenar.
    const filasValidas =
      tipo === 'tabla' && Array.isArray(b.filas) && b.filas.every((f) => Array.isArray(f))
        ? (b.filas as unknown[]).map((f) => (f as unknown[]).map((c) => (typeof c === 'string' ? c : '')))
        : undefined;

    return [
      {
        id: typeof b.id === 'string' ? b.id : idBloque(),
        tipo,
        texto: typeof b.texto === 'string' ? b.texto : '',
        ...(tipo === 'tarea' ? { hecho: b.hecho === true } : {}),
        ...(tipo === 'codigo' && typeof b.lenguaje === 'string'
          ? { lenguaje: b.lenguaje }
          : {}),
        ...(tipo === 'imagen' && typeof b.url === 'string' ? { url: b.url } : {}),
        ...(tipo === 'tabla'
          ? { filas: filasValidas ?? [['', ''], ['', '']] }
          : {}),
      },
    ];
  });

  return bloques.length > 0 ? bloques : [nuevoBloque()];
}

/** Proyección a markdown: lo que ve la IA y lo que se exporta. */
export function aMarkdown(bloques: Bloque[]): string {
  return bloques
    .map((b) => {
      switch (b.tipo) {
        case 'titulo':
          return `# ${b.texto}`;
        case 'subtitulo':
          return `## ${b.texto}`;
        case 'lista':
          return `- ${b.texto}`;
        case 'tarea':
          return `- [${b.hecho ? 'x' : ' '}] ${b.texto}`;
        case 'codigo':
          return `\`\`\`${b.lenguaje ?? ''}\n${b.texto}\n\`\`\``;
        case 'cita':
          return `> ${b.texto}`;
        case 'imagen':
          return `![${b.texto}](${b.url ?? ''})`;
        case 'tabla': {
          const filas = b.filas ?? [];
          if (filas.length === 0) return '';
          const filaMd = (fila: string[]) => `| ${fila.map((c) => c.replace(/\|/g, '\\|')).join(' | ')} |`;
          const separador = `| ${filas[0].map(() => '---').join(' | ')} |`;
          return [filaMd(filas[0]), separador, ...filas.slice(1).map(filaMd)].join('\n');
        }
        default:
          return b.texto;
      }
    })
    .join('\n\n')
    .trim();
}

/** Camino de vuelta: pegar markdown en el editor lo convierte en bloques. */
export function desdeMarkdown(markdown: string): Bloque[] {
  const bloques: Bloque[] = [];
  const lineas = markdown.replace(/\r\n/g, '\n').split('\n');

  let enCodigo = false;
  let acumuladoCodigo: string[] = [];
  let lenguaje = '';

  // Filas de una tabla markdown en curso: una línea "|a|b|" tras otra, sin línea en
  // blanco de por medio. patronFilaTabla acepta la fila de datos y también la de
  // separación ("|---|---|" o "|:--|--:|"), que se descarta al cerrar la tabla —
  // filtrarla aquí es más simple que tratarla como un caso especial de la primera fila.
  let enTabla = false;
  let filasTabla: string[][] = [];
  const patronFilaTabla = /^\|.*\|\s*$/;
  const esFilaSeparadora = (fila: string[]) => fila.every((c) => /^:?-+:?$/.test(c.trim()));

  function cerrarTabla() {
    const filas = filasTabla.filter((f) => !esFilaSeparadora(f));
    if (filas.length > 0) bloques.push({ ...nuevoBloque('tabla'), filas });
    enTabla = false;
    filasTabla = [];
  }

  for (const linea of lineas) {
    if (enTabla && !patronFilaTabla.test(linea.trim())) cerrarTabla();

    if (patronFilaTabla.test(linea.trim())) {
      enTabla = true;
      const celdas = linea
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => c.trim());
      filasTabla.push(celdas);
      continue;
    }

    if (linea.startsWith('```')) {
      if (enCodigo) {
        bloques.push({
          ...nuevoBloque('codigo', acumuladoCodigo.join('\n')),
          lenguaje: lenguaje || undefined,
        });
        enCodigo = false;
        acumuladoCodigo = [];
        lenguaje = '';
      } else {
        enCodigo = true;
        lenguaje = linea.slice(3).trim();
      }
      continue;
    }

    if (enCodigo) {
      acumuladoCodigo.push(linea);
      continue;
    }

    const texto = linea.trim();
    if (!texto) continue;

    // \s* y no \s+ tras el corchete: aMarkdown serializa una tarea sin texto como
    // "- [x] " (espacio final), pero el trim() de arriba ya se lo ha comido, así
    // que "- [x]" a secas tiene que seguir reconociéndose como tarea — si no, una
    // tarea marcada como hecha sin descripción perdía su estado al pasar por aquí
    // y aparecía como el texto crudo "[x]" en un bloque de lista.
    const tarea = texto.match(/^[-*]\s+\[([ xX])\]\s*(.*)$/);
    if (tarea) {
      bloques.push({
        ...nuevoBloque('tarea', tarea[2]),
        hecho: tarea[1].toLowerCase() === 'x',
      });
      continue;
    }

    // ![alt](url): la propia sintaxis que produce aMarkdown() para 'imagen'. Sin
    // esta rama, pegar un markdown con una imagen la convertía en un bloque de
    // texto con la sintaxis cruda visible en vez de reconstruir la imagen.
    const imagen = texto.match(/^!\[(.*)\]\((\S*)\)$/);
    if (imagen) {
      bloques.push({ ...nuevoBloque('imagen', imagen[1]), url: imagen[2] || undefined });
      continue;
    }

    if (texto.startsWith('## ')) bloques.push(nuevoBloque('subtitulo', texto.slice(3)));
    else if (texto.startsWith('# ')) bloques.push(nuevoBloque('titulo', texto.slice(2)));
    else if (/^[-*]\s+/.test(texto)) bloques.push(nuevoBloque('lista', texto.replace(/^[-*]\s+/, '')));
    else if (texto.startsWith('> ')) bloques.push(nuevoBloque('cita', texto.slice(2)));
    else bloques.push(nuevoBloque('texto', texto));
  }

  // El markdown puede terminar justo en la última fila de una tabla, sin línea en
  // blanco después — sin esto esa tabla se perdía entera.
  if (enTabla) cerrarTabla();

  // Un bloque de código sin cerrar sigue siendo código: mejor eso que perderlo.
  if (enCodigo && acumuladoCodigo.length > 0) {
    bloques.push({
      ...nuevoBloque('codigo', acumuladoCodigo.join('\n')),
      lenguaje: lenguaje || undefined,
    });
  }

  return bloques.length > 0 ? bloques : [nuevoBloque()];
}

/** Texto plano, para el índice de búsqueda y para los extractos de la lista. */
export function aTextoPlano(bloques: Bloque[]): string {
  return bloques
    .map((b) => (b.tipo === 'tabla' ? (b.filas ?? []).flat().join(' ') : b.texto))
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extracto(bloques: Bloque[], largo = 160): string {
  const texto = aTextoPlano(bloques);
  return texto.length > largo ? `${texto.slice(0, largo).trimEnd()}…` : texto;
}
