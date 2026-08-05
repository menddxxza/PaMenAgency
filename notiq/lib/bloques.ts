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
  | 'imagen';

export type Bloque = {
  id: string;
  tipo: TipoBloque;
  texto: string;
  /** Solo para 'tarea'. */
  hecho?: boolean;
  /** Solo para 'codigo'. */
  lenguaje?: string;
  /** Solo para 'imagen': ruta dentro del bucket de Storage. */
  url?: string;
};

export const TIPOS_BLOQUE: { tipo: TipoBloque; etiqueta: string; atajo: string }[] = [
  { tipo: 'texto', etiqueta: 'Texto', atajo: 'texto' },
  { tipo: 'titulo', etiqueta: 'Título', atajo: '# ' },
  { tipo: 'subtitulo', etiqueta: 'Subtítulo', atajo: '## ' },
  { tipo: 'lista', etiqueta: 'Lista', atajo: '- ' },
  { tipo: 'tarea', etiqueta: 'Tarea', atajo: '[] ' },
  { tipo: 'codigo', etiqueta: 'Código', atajo: '```' },
  { tipo: 'cita', etiqueta: 'Cita', atajo: '> ' },
];

export function nuevoBloque(tipo: TipoBloque = 'texto', texto = ''): Bloque {
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

  for (const linea of lineas) {
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
    .map((b) => b.texto)
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extracto(bloques: Bloque[], largo = 160): string {
  const texto = aTextoPlano(bloques);
  return texto.length > largo ? `${texto.slice(0, largo).trimEnd()}…` : texto;
}
