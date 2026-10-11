# Voz en off — pendiente de grabar

No se ha generado locución: en este entorno no había ningún motor de voz neuronal
en español peninsular disponible, y una voz sintética robótica empeoraría la pieza.
Todo lo demás (montaje, música, subtítulos y mezcla) está preparado para recibirla.

## Dirección

- Voz adulta, español de España, tono seguro, sobrio y natural. Nada de "voz de anuncio".
- Ritmo pausado al principio; más decidido desde «En PaMenAgency…».
- Pausas reales entre frases. No acelerar para encajar: si sobra texto, se recorta texto.
- Grabar en WAV 48 kHz / 24 bits, mono, sin música, con 1 s de silencio al principio.
- Pronunciación de la marca: «Pa-men-Agency» (confirmar con PaMenAgency antes de grabar).

## Guion cronometrado (tiempos del vídeo de 35 s)

| Entrada | Salida | Texto |
|--------:|-------:|-------|
| 0,9 s | 2,7 s | Tu empresa no necesita trabajar más horas. |
| 3,0 s | 4,6 s | Necesita trabajar mejor. |
| 5,5 s | 10,4 s | Mientras sigues dedicando tiempo a tareas repetitivas, existen formas más inteligentes de trabajar. |
| 11,8 s | 18,9 s | En PaMenAgency analizamos los problemas y diseñamos soluciones digitales, automatizaciones e inteligencia artificial adaptadas a cada negocio. |
| 19,2 s | 20,9 s | Sin humo. Sin complicaciones innecesarias. |
| 21,3 s | 26,3 s | La IA no sustituye tu capacidad. *(pausa)* La multiplica con criterio. |
| 27,6 s | 30,5 s | PaMenAgency. Convierte la IA en una ventaja real. |

Los subtítulos de esta tabla están en `subtitulos_vo.srt`. Si la locución final
cae en tiempos distintos, ajusta el SRT antes de integrarlo.

## Integración

Coloca la locución en `audio/voz/voz_en_off.wav` (alineada a 0 s con el vídeo) y ejecuta
desde `video-pamenagency/`:

```bash
src/mix_vo.sh audio/voz/voz_en_off.wav
```

Genera la mezcla con la música atenuada bajo la voz y las dos versiones con voz
(limpia y con subtítulos integrados) en `renders/`.
