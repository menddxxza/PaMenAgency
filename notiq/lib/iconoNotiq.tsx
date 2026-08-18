/**
 * El icono de la app (para favicon, apple-touch-icon y el manifest de PWA) se
 * genera con ImageResponse en vez de guardar archivos .png a mano: mismo violeta
 * de marca (brand-600) que el resto de la app, y un solo sitio que tocar si algún
 * día cambia el color o el diseño del logo.
 *
 * Sin `borderRadius`: Apple aplica su propia máscara (esquinas redondeadas u
 * "squircle") al apple-touch-icon, y Android hace lo mismo con los iconos
 * `purpose: "maskable"` del manifest — un icono ya redondeado por dentro queda
 * redondeado dos veces, o recortado mal si el sistema espera el cuadrado entero.
 */
export function elementoIconoNotiq(size: number) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#6829e0',
      }}
    >
      <span
        style={{
          color: 'white',
          fontWeight: 700,
          fontSize: size * 0.6,
          fontFamily: 'sans-serif',
        }}
      >
        N
      </span>
    </div>
  );
}
