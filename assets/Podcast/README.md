# Podcast

Piezas de «Química Farmacéutica · El podcast en vídeo», tercera temporada, curso 26-27. Fondo `primary` con degradado hacia `primary-dark`, retícula hexagonal al 9 % en blanco, título en Montserrat Extrabold sobre `text-on-dark`, reclamo en `tertiary` y línea de temporada en Roboto Mono sobre `text-muted` claro.

| Archivo | Tamaño | Uso |
| :--- | :--- | :--- |
| `qfdos-podcast-portada-cuadrada.png` | 2048 × 2048 | Carátula de temporada: Spotify, Apple Podcasts, avatar del canal. |
| `qfdos-podcast-portada-horizontal.png` | 1920 × 1080 | Carátula ancha y vídeo de presentación del canal. |
| `qfdos-podcast-portada-vertical.png` | 1080 × 1920 | Shorts, Reels y stories de promoción de la temporada. |
| `qfdos-podcast-ep01-16x9.png` | 1920 × 1080 | Thumbnail de YouTube del episodio 01, «Acetilcolina y neurotransmisión colinérgica». |
| `qfdos-podcast-ep01-cuadrado.png` | 2048 × 2048 | El mismo episodio en cuadrado, para plataformas de audio. |

**Reglas.** El número y el título de episodio van en Montserrat Extrabold en caja alta y baja; la línea de temporada y el pie, en Roboto Mono en versales. El título no baja de 62 px en 1920 × 1080: por debajo deja de leerse en la miniatura del móvil. En 16:9 se deja libre la esquina inferior derecha (sello de duración de YouTube) y en 9:16 la franja inferior y el lateral derecho (interfaz de Shorts).

El disco de reproducción es un círculo `surface` con triángulo `primary`: forma neutra, nunca el logotipo de una plataforma.

Las piezas se generan con el script `qfdos-podcast-generador.py`, que no puede almacenarse aquí por su extensión; vive en el repositorio del curso. Expone `cover`, `cover_h`, `cover_v`, `episode` y `episode_sq`, todas parametrizadas por número, título, temporada y curso.
