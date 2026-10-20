<div align="center">
  
  # 🍃 Zero Stress

  **El santuario digital de baja estimulación para diseñadores y desarrolladores.**

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Privacidad: 100% Local](https://img.shields.io/badge/Privacidad-100%25%20Local-success.svg)](#)
  [![Hecho por Axom](https://img.shields.io/badge/Hecho%20por-Axom-purple.svg)](#)

  *Herramientas breves para bajar la sobrecarga mental, inspiradas en investigación sobre respiración y relajación. Sin cuentas, sin rastreo, sin interrupciones.*
</div>

---

## 🌟 La Misión: Descomprimir a los Creadores de Ideas

**Zero Stress** no es una aplicación de bienestar genérica. Es un refugio digital creado por **Axom** diseñado específicamente para quienes experimentan una alta demanda cognitiva: desarrolladores, diseñadores, creadores y arquitectos de ideas del mundo. 

El estrés sostenido mantiene activa la respuesta de "lucha o huida" y hace más difícil pensar con claridad. **Zero Stress** ofrece ejercicios cortos (respiración, relajación muscular, grounding, sonido) que pueden ayudar a bajar la activación y recuperar la calma en pocos minutos.

---

## 🧠 En qué se inspira

Los módulos se basan en técnicas con respaldo en la literatura y en principios de tecnología calma (*Calm Technology*):

*   **Respiración lenta y exhalación larga:** Patrones como la respiración coherente (~6 ciclos/min), 4-6, 4-7-8, Respiración Cuadrada o Suspiro Cíclico favorecen la **arritmia sinusal respiratoria** y la variabilidad de la frecuencia cardíaca (HRV), asociadas a un estado más relajado.
*   **Zumbido (*Humming*):** Tararear alarga la exhalación y aumenta el óxido nítrico nasal de forma notable frente a la respiración silenciosa (Weitzberg & Lundberg, 2002).
*   **Técnicas de terapia cognitivo-conductual:** Registro de pensamientos, relajación muscular progresiva y grounding 5-4-3-2-1 son ejercicios de uso común para manejar la rumiación y la tensión física.

> ⚠️ **Aviso importante:** Zero Stress es una herramienta de bienestar, **no un dispositivo médico** ni sustituye el diagnóstico o tratamiento de un profesional de salud mental. Los tests son de autoorientación, no un diagnóstico.

---

## 🛠️ El Ecosistema de Módulos Terapéuticos

Descubre herramientas modulares orientadas a desactivar diferentes manifestaciones de la fatiga psicofísica:

| Módulo | Enfoque Clínico | Beneficio Principal |
| :--- | :--- | :--- |
| 🧘 **Práctica Zen & Respiración** | Coherencia cardíaca y tonificación vagal con guías visuales (Coherente 4:6, 4-6, 4-7-8, Respiración Cuadrada, Suspiro Cíclico, Nadi Shodhana, Bhramari, Energizante, Sueño Profundo). | Reduce el ritmo cardíaco e induce estados de calma física profunda. |
| 🎵 **Rochola Relajante** | Síntesis procedural pura en tiempo real (tonos binaurales multicapa, ruido marrón/rosa modulado por LFO, melodía generativa pentatónica, ambientes naturales: lluvia, océano, viento). | Evita la fatiga cerebral de los bucles de audio repetitivos; enmascara ruidos molestos. |
| 🧠 **Sana: Terapia Cognitiva** | Registros de Pensamientos Socráticos (CBT), Relajación Muscular Progresiva de Jacobson, Visualización Guiada, Grounding 5-4-3-2-1. | Rompe bucles de rumia mental e hipertonía muscular cervical y faríngea. |
| 📊 **Evaluación de Carga** | Cuestionarios de autoevaluación: PSS-10 (Estrés Percibido), GAD-7 (Ansiedad), adaptación breve del BAT (Burnout), Body Scan (Tensión Física), Sleep Check (Calidad del Sueño). | Orienta al usuario sobre su estado, sugiere prácticas. No es un diagnóstico. |
| 🔮 **Oráculo Zen** | Reestructuración cognitiva y cambio de perspectiva mediante afirmaciones de mindfulness y versículos de sabiduría y consuelo (Proverbios, Salmos, Eclesiastés y epístolas). | Ofrece un punto de enfoque de baja estimulación para romper la rumiación destructiva. |
| 🚨 **Botón de Pánico** | Rescate inmediato 4-1-7 (inhalación 4s, retención 1s, exhalación 7s) con orbe visual y mensajes de calma rotativos. | Ayuda a bajar el ritmo respiratorio durante picos de ansiedad o hiperventilación. |

---

## ⚡ Ingeniería de la Serenidad: Arquitectura de Alto Rendimiento

Un retraso en el dibujado o una animación cortada puede activar una sutil respuesta de sobresalto en el sistema visual, saboteando la relajación. Por ello, la UI/UX de Zero Stress sigue estrictos criterios de **Tecnología Calma**:

### 60fps Garantizados (GPU Compositing)
Las animaciones del pacer respiratorio se delegan exclusivamente al hilo del compositor de la GPU mediante la manipulación exclusiva de propiedades de transformación física (`scale`, `opacity`) y la declaración explícita de `will-change`. Se evitan modificaciones de `layout` o `paint` que saturen la CPU.

### Físicas Orgánicas de Muelles
En lugar de transiciones rígidas basadas en curvas Bezier, el pacer respiratorio utiliza físicas de muelles (*spring dynamics*) calibradas para emular el flujo elástico de los pulmones reales:
*   *Inhalación:* Rigidez (Stiffness) 12, Amortiguación (Damping) 20, Masa 1.2
*   *Exhalación:* Rigidez 8, Amortiguación 24, Masa 1.5

### Accesibilidad Inclusiva y Reducción de Movimiento
*   **Soporte de `prefers-reduced-motion`:** La interfaz detecta automáticamente las preferencias de accesibilidad a nivel del sistema operativo y sustituye los movimientos de escalado por suaves transiciones cruzadas de opacidad (*crossfades*) para proteger a usuarios con desórdenes vestibulares.
*   **Contraste WCAG 2.2:** Busca relaciones de contraste ≥4.5:1 en los estados cromáticos y modos de visualización.
*   **UI orgánica:** Border-radius imperfectos, textura de grano sutil, sombras en capas, transiciones con easing humano — sensación táctil, no sintética.

### Privacidad Local-First Absoluta
Tus datos, respuestas a pruebas psicométricas y notas de reflexión no viajan a ningún servidor externo. Zero Stress opera al 100% de forma local en tu navegador utilizando `localStorage`. Cero cookies de marketing, cero rastreo corporativo, cero fricción de registro.

### PWA Installable
Funciona offline completo tras la primera carga. Instalable en móvil y desktop como app nativa. Shortcuts directos: Respiración 4-6, Botón de Pánico, Sonidos Binaurales.

---

## 🚀 Stack de Desarrollo

*   **Framework Core:** React 19, TypeScript, Vite
*   **Animaciones:** Framer Motion (v12 / Motion React) — lazy-loaded
*   **Estilos:** Tailwind CSS v4 con variables semánticas biofílicas desaturadas (Ocean, Forest, Lava, Amethyst, Sunset)
*   **Gestión de Estado:** Zustand con persistencia selectiva en LocalStorage + `useShallow` selectors
*   **Motor de Audio:** Síntesis matemática directa con Web Audio API (tonos binaurales 4 capas, ruido rosa/marrón Kellet, melodía generativa, ambientes naturales con LFO — **zero assets, 100% runtime**)
*   **Code Splitting:** Lazy loading de 5 módulos principales + datos del Oráculo bajo demanda
*   **Tipografía:** Plus Jakarta Sans (Display) + Instrument Sans (Body) — redondeadas, humanas, cálidas

---

## 📦 Instalación y Desarrollo Local

Requisitos previos: [Node.js](https://nodejs.org/) y [pnpm](https://pnpm.io/) instalados.

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/jurbinaa/ztress.git
   cd ztress
   ```

2. Instalar dependencias:
   ```bash
   pnpm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

4. Construir la versión de producción:
   ```bash
   pnpm build
   ```

5. Preview producción:
   ```bash
   pnpm preview
   ```

---

## 📜 Licencia

Distribuido bajo la licencia **[MIT](LICENSE)**.

La propiedad intelectual, diseño visual y visión de Zero Stress pertenecen a **Axom**.

---

<div align="center">
  <br />
  <i>hecho con calma por <b>Axom</b></i> 🤍
</div>