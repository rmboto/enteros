# >_ Feria Neón 84 · Concurso de fracciones y decimales

Concurso de 20 preguntas (2.º ESO) dentro de un parque de atracciones 3D con estética hacker ochentera y cyberpunk. Llevas a un hacker de neón por el parque con tus propios controles, como en un juego de mundo abierto. Te plantas delante de una atracción, pulsas espacio para subir y respondes su pregunta: si aciertas, se enciende y **te montas en primera persona**.

## Cómo arrancarlo

**Con doble clic en `iniciar-feria.bat`** (recomendado). Arranca un pequeño servidor local y abre el juego en el navegador. Así las puntuaciones se guardan solas en `jugadores.json`, en esta misma carpeta. Hace falta tener Node.js instalado.

```bash
node servidor.js --abrir
```

- `--puerto=8085` cambia el puerto (por defecto, 8084).
- `--red` deja entrar a otros equipos de la red local: el servidor escribe en pantalla la dirección que deben abrir, y todas las puntuaciones van al mismo `jugadores.json`. Sin esta opción solo se acepta este ordenador.

**Con doble clic en `index.html`** también se puede jugar, pero una página abierta así no puede escribir archivos por su cuenta. En Chrome o Edge el juego te pide una vez la carpeta y a partir de ahí escribe `jugadores.json` en ella; en otros navegadores las puntuaciones se quedan en el navegador y hay un botón para descargar el archivo.

## Jugadores y ranking

- Al empezar hay un formulario: el **usuario** (o un nombre por equipo). Sin nombre no se entra.
- Al terminar, la partida se anota en `jugadores.json` y se actualiza la ficha del jugador.
- Para dejarlo antes de acabar, el botón **Terminar** (o Esc) pide confirmación y guarda la partida tal como va, con las preguntas respondidas hasta ese momento. Mientras decides, el reloj de la pregunta se para.
- Si se cierra la página a media visita, la partida también se guarda: al momento con el servidor local, o la próxima vez que se abra el juego en ese navegador.
- El botón **Ranking** (o la tecla R) abre la clasificación completa en cualquier momento.

`jugadores.json` tiene dos listas:

| Lista | Qué guarda |
| --- | --- |
| `jugadores` | Una ficha por usuario, ordenadas por mejor puntuación: partidas jugadas, mejor puntuación, mejores aciertos, puntos totales, última puntuación y fecha de la última partida |
| `partidas` | Una línea por partida: fecha, usuario, puntos, aciertos, preguntas respondidas, si se completó, logros, modo (1 jugador o equipos) y duración en segundos |

Dos usuarios con el mismo nombre (sin distinguir mayúsculas) son la misma ficha.

### En el artifact de claude.ai

Publicado como artifact, el juego no puede escribir un archivo, así que usa la base de datos compartida del propio artifact: una ficha por jugador y un ranking que se actualiza en vivo para todos los que lo tienen abierto.

- Guarda quien tiene permiso de escritura: el dueño del artifact y, en un plan con más miembros, quienes pueden usarlo. Quien solo puede verlo (por ejemplo, con un enlace público) ve el ranking y guarda su puntuación solo en su navegador.
- Los nombres quedan a la vista de cualquiera que pueda abrir el artifact: mejor apodos que nombres completos.
- El botón **Descargar jugadores.json** (al final de la partida y en la ventana de ranking) saca una copia con el mismo formato que el archivo local.

## Controles

| Acción | Control |
| --- | --- |
| Mover al personaje | W A S D (o ↑ ↓ para avanzar y retroceder) |
| Girar la cámara | ← →, arrastrar sobre el parque o los botones ◀ ▶ |
| Subir o bajar la cámara | rueda del ratón o arrastrar en vertical |
| Correr | Mayús |
| Subir a la atracción que tienes delante | Espacio (o Intro, o el botón rosa) |
| Responder | A B C D (o 1 2 3 4) |
| Primera persona en cualquier momento | V |
| Poner o quitar el cine a bordo | C |
| Lanzar un suceso del parque | E |
| Ranking | R |
| Terminar la visita y guardar lo que llevas | Esc o el botón Terminar |
| Sonido, música y voz | M |

- La atracción que tienes **cerca y delante** queda seleccionada: se ilumina con un haz de luz y el botón dice qué puedes hacer con ella.
- Las atracciones son sólidas. La puerta se cruza por debajo del arco.
- El orden es libre. El **castillo** se abre cuando ya has visitado todo lo demás.
- 45 segundos por pregunta; responder rápido da puntos extra. Un jugador (con rachas) o equipos (2, 4 o 5), por turnos.

## Sucesos del parque

De vez en cuando (más o menos cada minuto, mientras paseas o vas montado) salta una alarma con sirena, viñeta roja que late y un rótulo de peligro:

- **Lluvia de meteoritos** que caen por todo el parque.
- **Dinosaurio suelto** recorriendo el paseo.
- **Advertencia de ataque aéreo**: platillos sobre el parque; uno se lleva una vaca y otro intenta **abducir a tu personaje**, con destellos blancos.
- **Robot gigante fuera de control** patrullando por fuera, con un láser que barre el suelo.
- **Alerta nuclear** con cuenta atrás, que resulta ser un simulacro.

El botón **Alertas** los activa o desactiva; la tecla E lanza uno al momento. Se apagan al subir a una atracción, para no molestar durante la pregunta. Los destellos laten despacio (menos de dos por segundo) y se quedan fijos si el sistema tiene activada la opción de reducir movimiento.

## Vega, la voz del parque

Una voz de mujer comenta cada atracción a la que subes, cada acierto, cada fallo, cada logro y cada alarma. Usa la síntesis de voz del navegador: el juego busca una voz femenina en español y la pone pausada y cálida, pero el timbre concreto depende de las voces instaladas en el equipo. Lo que dice sale siempre también como subtítulo.

Logros: primer hackeo, racha de tres, racha de cinco, medio parque encendido, velocista, cumbres conquistadas y parque completo.

## Cine a bordo

En la noria, la casa del terror y los globos aparece una pantalla con una película de dibujos en sesión continua: meteoritos, dinosaurios, robots gigantes, un maestro de kung-fu de chándal amarillo, ovnis y una carretera al atardecer. Con la C se pone o se quita en cualquier atracción.

## Las atracciones

Puerta de acceso · noria · tiovivo · **montaña rusa con looping** · sillas voladoras · **lanzadera** · barco pirata · **trineos** · coches de choque · **tren de la mina** · **cataratas** · péndulo · pulpo · casa del terror · tazas locas · circo · cohetes · tómbola · globos · castillo.

Contenidos: operaciones con decimales; fracción de una cantidad; fracciones equivalentes; paso entre fracción y decimal (incluido el periódico 0,333…); comparar y ordenar decimales; redondeo; operaciones con fracciones. Cada respuesta muestra una explicación breve.

## Archivos

| Archivo | Para qué |
| --- | --- |
| `index.html` | El juego entero: motor 3D, música, preguntas y frases |
| `servidor.js` | Servidor local sin dependencias: sirve el juego y escribe `jugadores.json` |
| `iniciar-feria.bat` | Arranque con doble clic en Windows |
| `jugadores.json` | La base de datos de jugadores y partidas (se crea sola si no existe) |

## Licencia

- **Código** (motor 3D, música, lógica del juego y `servidor.js`): licencia MIT, en [`LICENSE`](LICENSE).
- **Contenido didáctico** (preguntas, explicaciones, frases y textos): Creative Commons Atribución-CompartirIgual 4.0, en [`LICENSE-CONTENIDO.md`](LICENSE-CONTENIDO.md).

`jugadores.json` no se sube al repositorio (está en `.gitignore`), porque guarda nombres y puntuaciones reales.

## Cambiar las preguntas y las frases

- Preguntas: lista `QS` al principio del script. La **primera opción** de `o` es la correcta (se baraja al mostrarla) y `e` es la explicación. `QMAP` dice qué pregunta va con cada atracción.
- Frases de la voz: `LINES`. Sucesos del parque: `EVS`. Atracciones con cine automático: `CINE`.
