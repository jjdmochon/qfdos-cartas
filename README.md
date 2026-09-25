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

---

## 🖨️ Modo Impresión / Flashcards

El portal incluye una hoja de estilos optimizada para impresión (`@media print`):
Al pulsar el botón **Imprimir**, el navegador formatea automáticamente las cartas en una cuadrícula lista para imprimir en papel o guardar en PDF, permitiendo su recorte físico como fichas de estudio.

---

## ⚖️ Licencia

Material docente desarrollado para la asignatura de Química Farmacéutica II de la Universidad de Granada. Uso académico libre y abierto.
