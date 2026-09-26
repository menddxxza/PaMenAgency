/**
 * Parser de GLB escrito a mano, portado del prototipo.
 *
 * Lee solo el chunk JSON del contenedor binario: no necesita three.js ni
 * GLTFLoader, así que funciona en el servidor (Node) sobre un ArrayBuffer
 * traído de R2. Es lo que usa el admin para listar los nodos de un modelo
 * recién subido sin descargar la geometría al navegador.
 *
 * Convención del pipeline (tools/blender_addon_vehicle3d.py):
 *   - nombre de objeto  SYS.SUBSYS.COMPONENT[.NNN]
 *   - extras.node_uuid  identificador estable, sobrevive renombrados
 *   - extras.explode    vector de despiece calculado en Blender
 */

const MAGIC_GLTF = 0x46546c67; // 'glTF'
const CHUNK_JSON = 0x4e4f534a; // 'JSON'

export type GltfJson = {
  asset?: { version?: string; generator?: string };
  scene?: number;
  scenes?: { nodes?: number[] }[];
  nodes?: {
    name?: string;
    mesh?: number;
    children?: number[];
    extras?: { node_uuid?: string; explode?: [number, number, number]; [k: string]: unknown };
  }[];
  meshes?: { primitives?: { indices?: number; attributes?: Record<string, number> }[] }[];
};

export type GlbNode = {
  index: number;
  name: string;
  path: string;
  node_uuid: string | null;
  explode: [number, number, number] | null;
};

export class GlbError extends Error {}

/** Extrae el JSON del contenedor GLB. Lanza GlbError si no lo es. */
export function parseGLB(buf: ArrayBuffer): GltfJson {
  const dv = new DataView(buf);
  if (buf.byteLength < 12 || dv.getUint32(0, true) !== MAGIC_GLTF) {
    throw new GlbError('No es un archivo GLB válido');
  }
  const len = Math.min(dv.getUint32(8, true), buf.byteLength);
  let off = 12;
  while (off + 8 <= len) {
    const chunkLength = dv.getUint32(off, true);
    const chunkType = dv.getUint32(off + 4, true);
    if (chunkType === CHUNK_JSON) {
      const bytes = new Uint8Array(buf, off + 8, chunkLength);
      return JSON.parse(new TextDecoder().decode(bytes)) as GltfJson;
    }
    off += 8 + chunkLength + ((4 - (chunkLength % 4)) % 4); // cabecera + datos + padding
  }
  throw new GlbError('No se encontró el chunk JSON');
}

/** Nodos con malla, con su ruta jerárquica y el node_uuid de extras. */
export function glbNodes(json: GltfJson): GlbNode[] {
  const out: GlbNode[] = [];
  const nodes = json.nodes ?? [];
  const seen = new Set<number>();

  const walk = (i: number, prefix: string) => {
    const node = nodes[i];
    if (!node || seen.has(i)) return; // ciclos o nodos repetidos: no reventar
    seen.add(i);
    const name = node.name || `node_${i}`;
    const path = (prefix ? `${prefix}/` : '') + name;
    if (node.mesh !== undefined) {
      const extras = node.extras ?? {};
      out.push({
        index: i,
        name,
        path,
        node_uuid: typeof extras.node_uuid === 'string' ? extras.node_uuid : null,
        explode: Array.isArray(extras.explode) && extras.explode.length === 3 ? extras.explode : null,
      });
    }
    for (const child of node.children ?? []) walk(child, path);
  };

  const scene = json.scenes?.[json.scene ?? 0];
  const roots = scene?.nodes ?? nodes.map((_, i) => i);
  for (const i of roots) walk(i, '');
  return out;
}

/**
 * Sugerencia de componente a partir del nombre del nodo: los tres primeros
 * segmentos son el código del componente (ENG.TURBO.HOUSING.001 →
 * ENG.TURBO.HOUSING). Devuelve el código solo si existe en el catálogo;
 * nunca inventa uno.
 */
export function suggestComponentCode(nodeName: string, knownCodes: Iterable<string>): string | null {
  const base = nodeName.split('.').slice(0, 3).join('.').toUpperCase();
  const known = knownCodes instanceof Set ? knownCodes : new Set(knownCodes);
  return known.has(base) ? base : null;
}

/** Recuento de triángulos declarado en el JSON, si se puede deducir. */
export function glbStats(json: GltfJson): { meshes: number; nodesWithMesh: number; withUuid: number } {
  const nodes = glbNodes(json);
  return {
    meshes: json.meshes?.length ?? 0,
    nodesWithMesh: nodes.length,
    withUuid: nodes.filter((n) => n.node_uuid).length,
  };
}
