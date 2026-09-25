# Baraja Coleccionable de Fármacos · QFDOS

**Química Farmacéutica II (2627 QFDOS)**  
*Grado en Farmacia — Facultad de Farmacia, Universidad de Granada*  
*Docencia y Coordinación:* Prof. Juan José Díaz-Mochón (Nexus Lab Team)

---

## 🎴 Descripción

Portal web interactivo de acceso abierto (sin necesidad de inicio de sesión ni registro) que presenta las monografías moleculares de los fármacos del programa de Química Farmacéutica II en formato de naipe científico coleccionable.

Diseñado siguiendo el sistema de identidad visual **2627 QFDOS Structural Affinity Identity (v3.0)**, cada carta reúne en un único objeto de aprendizaje:

1. **Estructura química 2D vectorial:** Generada mediante RDKit a partir del código SMILES canónico. En modo limpio se visualiza con trazo de tinta oscura sobre fondo claro, y en modo marino con enlaces blancos de alto contraste sobre fondo azul marino.
2. **Índices SAR comparativos (0–99):**
   - `AFI`: Afinidad a la diana molecular.
   - `SEL`: Selectividad subtipo/receptor.
   - `EST`: Estabilidad frente al metabolismo enzimático.
   - `ORA`: Biodisponibilidad por vía oral.
   - `SNC`: Penetración de la barrera hematoencefálica.
   - `DUR`: Duración de la acción farmacológica.
3. **Reverso técnico:**
   - Código SMILES con botón de copiado en un clic.
   - Mecanismo de acción farmacológica y diana diana.
   - Indicaciones clínicas autorizadas.
   - Claves de diseño estructural y relaciones estructura-actividad (SAR).
   - Tip de examen QFDOS para autoevaluación.
   - Acceso directo al modelado 3D interactivo en MolView.

---

## 🧭 Arquitectura Multi-Tema

El repositorio está diseñado con un núcleo modular que desacopla la lógica de visualización del contenido:

```
qfdos-cartas/
├── index.html                   # Interfaz de usuario accesible y responsiva
├── app.js                       # Lógica de aplicación modular (carga, enrutamiento hash, filtros)
├── styles.css                   # Sistema de diseño, rejilla 3D y modos Limpio/Marino
├── tokens.css                   # Variables de diseño (colores, fuentes, radios)
├── data/
│   ├── temas.json               # Manifiesto central con los 10 temas del programa
│   └── farmacos-tema01.json     # Monografías del Tema 01 (Colinérgicos)
└── estructuras/                 # Archivos vectoriales SVG de cada molécula
```

### Enrutamiento Directo por Hash (Deep-linking)
La aplicación permite enlaces directos a cada tema mediante fragmentos de URL, ideales para compartir en PRADO, diapositivas o códigos QR:
- Tema 01: `https://jjdmochon.github.io/qfdos-cartas/#tema-01`
- Tema 02: `https://jjdmochon.github.io/qfdos-cartas/#tema-02`

---

## 🛠️ Cómo Añadir Nuevos Temas conforme Avance el Curso

El sistema genera dinámicamente los botones de filtrado farmacológico a partir de los datos cargados. Para publicar un nuevo tema basta con seguir 3 pasos:

### 1. Crear el archivo de datos del tema
Crear `data/farmacos-temaNN.json` (por ejemplo, `data/farmacos-tema02.json`) siguiendo el esquema:
```json
{
  "tema": 2,
  "titulo": "Sistema Adrenérgico",
  "asignatura": "Química Farmacéutica II (QFDOS)",
  "curso": "2026/2027",
  "nota": "Nota docente sobre la escala comparativa 0-99...",
  "grupos": {
    "agonista_alfa": "Agonistas α",
    "agonista_beta": "Agonistas β",
    "bloqueante_beta": "β-bloqueantes"
  },
  "indices": {
    "AFI": "Afinidad a receptores adrenérgicos",
    "SEL": "Selectividad de subtipo (ej. β1 vs β2)",
    "EST": "Estabilidad frente a COMT y MAO",
    "ORA": "Biodisponibilidad oral",
    "SNC": "Paso de la barrera hematoencefálica",
    "DUR": "Duración de acción (SABA vs LABA)"
  },
  "farmacos": [
    {
      "id": "salbutamol",
      "nombre": "Salbutamol",
      "relevancia": 95,
      "rol": "AGONISTA β2 SELECTIVO",
      "grupo": "agonista_beta",
      "badge": "SABA · β2",
      "clase": "Feniletanolamina · Saligenina",
      "formula": "C13H21NO3",
      "masa": 239.31,
      "smiles": "CC(C)(C)NCC(O)c1ccc(O)c(CO)c1",
      "estructura": "estructuras/salbutamol.svg",
      "indices": { "AFI": 88, "SEL": 92, "EST": 80, "ORA": 65, "SNC": 15, "DUR": 55 },
      "accion": "Agonista selectivo de receptores β2-adrenérgicos...",
      "indicacion": "Broncoespasmo agudo en asma y EPOC...",
      "diseno": "El grupo saligenina (hidroximetilo) evita la degradación por COMT...",
      "examen": "¿Por qué el salbutamol resiste la acción de la COMT conservando la actividad agonista β2?"
    }
  ]
}
```

### 2. Colocar los archivos SVG
Depositar los archivos SVG correspondientes en la carpeta `estructuras/` (nombrados con el `id` de cada fármaco, ej. `estructuras/salbutamol.svg`).

### 3. Activar el tema en `data/temas.json`
Modificar el bloque del tema correspondiente en `data/temas.json`:
```json
{
  "id": "tema-02",
  "disponible": true,
  "totalFarmacos": 15
}
```

### 4. Desplegar
```bash
git add .
git commit -m "feat(tema-02): publicar baraja de farmacos del tema 02"
git push origin main
```
El portal en GitHub Pages se actualizará automáticamente en menos de un minuto.

---

## 📚 Catálogo del Tema 01 (Transmisión Colinérgica)

| # | Fármaco | Grupo | Relevancia | Fórmula | Masa (Da) |
|---|---|---|---|---|---|
| 01 | **Acetilcolina** | Agonista mixto (M+N) | 99 | C7H16NO2+ | 146.21 |
| 02 | **Metacolina** | Agonista muscarínico | 76 | C8H18NO2+ | 160.24 |
| 03 | **Carbacol** | Agonista mixto (M+N) | 80 | C6H15N2O2+ | 147.20 |
| 04 | **Betanecol** | Agonista muscarínico | 84 | C7H17N2O2+ | 161.22 |
| 05 | **Pilocarpina** | Agonista M parcial | 88 | C11H16N2O2 | 208.26 |
| 06 | **Muscarina** | Agonista muscarínico | 68 | C9H20NO2+ | 174.26 |
| 07 | **Nicotina** | Agonista nicotínico | 82 | C10H14N2 | 162.23 |
| 08 | **Neostigmina** | Inhibidor AChE (carb.) | 85 | C12H19N2O2+ | 223.29 |
| 09 | **Donepezilo** | Inhibidor AChE (rev.) | 92 | C24H29NO3 | 379.49 |
| 10 | **Paratión** | Organofosforado (irr.) | 79 | C10H14NO5PS | 291.26 |
| 11 | **Pralidoxima** | Antídoto / Reactivador | 83 | C7H9N2O+ | 137.16 |
| 12 | **Atropina** | Antagonista muscarínico | 96 | C17H23NO3 | 289.37 |
| 13 | **Butilescopolamina** | Antagonista M periférico | 81 | C21H30NO4+ | 360.47 |
| 14 | **Trihexifenidilo** | Antagonista M central | 77 | C20H31NO | 301.47 |
| 15 | **Atracurio** | Bloqueante nAChR (NMJ) | 86 | C53H72N2O12 | 929.14 |

---

## 🚀 Despliegue en GitHub Pages

Este repositorio está preparado para ser servido directamente como sitio estático sin necesidad de compilación o instalación de dependencias en local:

- **URL de producción:** [https://jjdmochon.github.io/qfdos-cartas/](https://jjdmochon.github.io/qfdos-cartas/)
- **Rama:** `main` (raíz `/`)
- **PWA:** Funciona como aplicación web progresiva con caché fuera de línea.
- **Acceso:** Libre y abierto, sin inicio de sesión ni contraseña requerida.

---

## 🖨️ Modo Impresión / Flashcards

El portal incluye una hoja de estilos optimizada para impresión (`@media print`):
Al pulsar el botón **Imprimir**, el navegador formatea automáticamente las cartas en una cuadrícula lista para imprimir en papel o guardar en PDF, permitiendo su recorte físico como fichas de estudio.

---

## ⚖️ Licencia

Material docente desarrollado para la asignatura de Química Farmacéutica II de la Universidad de Granada. Uso académico libre y abierto.
