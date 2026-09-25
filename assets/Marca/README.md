# Marca QFDOS

Identidad propia de la asignatura. Tres piezas, ningún redibujado: usa siempre el archivo, nunca una reconstrucción.

| Archivo | Qué es | Uso |
| :--- | :--- | :--- |
| `qfdos-isotipo.png` | Isotipo: cinta proteica con el hexágono del ligando y los vectores de interacción, sobre fondo blanco cuadrado (1254 px). | Icono de la web, favicon, avatar de PRADO, marca de agua de diapositiva al 8 % de opacidad. Tamaño mínimo 48 px. |
| `qfdos-sello-circular.png` | Sello completo con el anillo de texto «QUÍMICA FARMACÉUTICA DOS QFDOS · CURSO 26-27 - GRUPO E» (2048 px). | Portadas de apuntes, exámenes, certificados y cabeceras de documento. Tamaño mínimo 160 px: por debajo el anillo de texto deja de leerse y se usa el isotipo. |
| `qfdos-sello-disco.png` | El isotipo sobre disco blanco recortado, sin anillo de texto (768 px). | Superposición sobre fondos claros con textura, como el banner de PRADO, donde el fondo cuadrado del isotipo sería visible. |

**Reglas.** Fondo blanco o `neutral-bg`; no colocar el sello sobre `primary`, `secondary` ni sobre el degradado `affinity-hero`. Área de respeto igual al radio del propio sello (`space-lg` como mínimo). No recolorear, no rotar, no aplicar sombra y no reencuadrar el anillo de texto. El curso y el grupo están grabados en el sello: al cambiar de curso hay que regenerar la pieza, no editarla sobre la imagen.

Tinta del isotipo: `primary` (#1e3a8a) en la cinta y en los vectores, `secondary` en las hélices, verde menta en el hexágono del ligando. Son imágenes rasterizadas: `<img>` no hereda `currentColor`.
