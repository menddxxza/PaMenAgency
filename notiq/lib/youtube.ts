/**
 * Transcripción de un vídeo de YouTube a partir de su enlace, sin API key ni
 * SDK: YouTube no ofrece una forma sencilla y gratuita de bajar los
 * subtítulos de un vídeo ajeno (la Data API que sí lo hace exige OAuth del
 * dueño del vídeo), así que se lee la propia página pública del vídeo, que
 * ya trae los subtítulos incrustados en su JSON interno — el mismo mecanismo
 * que usan herramientas como youtube-transcript. Si YouTube cambia el
 * formato de esa página, esto puede dejar de funcionar; por eso los errores
 * de aquí son siempre mensajes claros, nunca un fallo silencioso.
 */

export class ErrorYoutube extends Error {}

const PATRON_ID = /^[\w-]{11}$/;

export function extraerIdVideo(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^(www\.|m\.)/, '');

  if (host === 'youtu.be') {
    const id = u.pathname.slice(1).split('/')[0];
    return PATRON_ID.test(id) ? id : null;
  }

  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (u.pathname === '/watch') {
      const id = u.searchParams.get('v');
      return id && PATRON_ID.test(id) ? id : null;
    }
    const coincidencia = u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/);
    if (coincidencia) return coincidencia[1];
  }

  return null;
}

/** Decodifica las entidades HTML que trae el XML de subtítulos de YouTube. */
function decodificarEntidades(texto: string): string {
  return texto
    .replace(/&#(\d+);/g, (_, cod) => String.fromCharCode(Number(cod)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

const CABECERAS = {
  // Sin un user-agent de navegador normal, YouTube devuelve una página
  // distinta (o vacía) que no trae los subtítulos incrustados.
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
};

export type TranscripcionYoutube = { titulo: string; texto: string };

export async function obtenerTranscripcionYoutube(url: string): Promise<TranscripcionYoutube> {
  const id = extraerIdVideo(url);
  if (!id) throw new ErrorYoutube('Ese enlace no parece ser de un vídeo de YouTube.');

  let html: string;
  try {
    const respuesta = await fetch(`https://www.youtube.com/watch?v=${id}`, {
      headers: CABECERAS,
      signal: AbortSignal.timeout(15_000),
    });
    if (!respuesta.ok) throw new Error(String(respuesta.status));
    html = await respuesta.text();
  } catch {
    throw new ErrorYoutube('No se ha podido acceder a ese vídeo. Comprueba el enlace.');
  }

  const tituloBruto = html.match(/"videoDetails":\{"videoId":"[^"]+","title":"((?:[^"\\]|\\.)*)"/);
  const titulo = tituloBruto ? JSON.parse(`"${tituloBruto[1]}"`) : 'Vídeo de YouTube';

  const pistasBrutas = html.match(/"captionTracks":(\[.*?\])(?=,")/);
  if (!pistasBrutas) {
    throw new ErrorYoutube('Este vídeo no tiene subtítulos disponibles.');
  }

  type Pista = { baseUrl: string; languageCode: string; kind?: string };
  let pistas: Pista[];
  try {
    pistas = JSON.parse(pistasBrutas[1]);
  } catch {
    throw new ErrorYoutube('No se han podido leer los subtítulos de este vídeo.');
  }
  if (pistas.length === 0) {
    throw new ErrorYoutube('Este vídeo no tiene subtítulos disponibles.');
  }

  // Prioridad: español "de verdad" (no autogenerado) → español autogenerado →
  // cualquier otro "de verdad" → lo que haya. Un subtítulo autogenerado en
  // otro idioma sigue siendo mejor contenido que nada.
  const pista =
    pistas.find((p) => p.languageCode.startsWith('es') && p.kind !== 'asr') ??
    pistas.find((p) => p.languageCode.startsWith('es')) ??
    pistas.find((p) => p.kind !== 'asr') ??
    pistas[0];

  let xml: string;
  try {
    const respuesta = await fetch(pista.baseUrl, { headers: CABECERAS, signal: AbortSignal.timeout(15_000) });
    if (!respuesta.ok) throw new Error(String(respuesta.status));
    xml = await respuesta.text();
  } catch {
    throw new ErrorYoutube('No se han podido descargar los subtítulos de este vídeo.');
  }

  const texto = [...xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)]
    .map((m) => decodificarEntidades(m[1]).replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ');

  if (texto.length < 40) {
    throw new ErrorYoutube('Los subtítulos de este vídeo están vacíos o son demasiado cortos.');
  }

  // Los modelos no necesitan una transcripción de horas para hacer un buen
  // resumen, y una de más de ~60.000 caracteres ni siquiera entra en el
  // contexto de una sola llamada — mismo límite práctico que el resto de la IA.
  return { titulo, texto: texto.slice(0, 60_000) };
}
