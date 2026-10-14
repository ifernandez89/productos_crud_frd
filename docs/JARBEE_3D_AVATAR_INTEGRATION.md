# 🛸 Guía de Integración: JarBee 3D Cyber Avatar en el Frontend

Esta guía detalla la implementación del nuevo modelo 3D optimizado **JarBee Cyber Avatar** en el frontend (`productos_crud_frd`), sustituyendo el avatar animado SVG anterior por el renderizado interactivo Three.js WebGL con soporte para animaciones cinemáticas reactivas al estado del chat.

---

## 1. Ficheros y Ubicación de Assets

Los modelos optimizados se encuentran en el directorio estático del frontend:

| Archivo | Ruta en Frontend | Tamaño | Uso Recomendado |
| :--- | :--- | :--- | :--- |
| **`jarbee_robot.glb`** | `/models/jarbee/jarbee_robot.glb` | **4.37 MB** | Carga directa sin descompresor WebAssembly |
| **`jarbee_robot.draco.glb`** | `/models/jarbee/jarbee_robot.draco.glb` | **2.76 MB** | Carga ultra-rápida con `DRACOLoader` |
| **Reporte de Metadatos** | `/models/jarbee/jarbee_robot.report.json` | 1.1 KB | Metadatos de clips, frames y escala normalizada |

> [!NOTE]
> **Normalización Garantizada**: El modelo tiene escala normalizada (`bounding box = 1.0`), está perfectamente centrado en el origen `(0, 0, 0)` y su cabeza apunta directamente hacia la cámara frontal (`+Z` en Three.js).

---

## 2. Animaciones Nativas Incluidas

El archivo GLB incluye el rig completo de 107 huesos y 3 clips de animación con nombres estándar limpios:

| Clip | Frames | FPS | Descripción | Estado Ideal en Chat |
| :--- | :--- | :--- | :--- | :--- |
| **`"hover"`** | `0 - 45.6` | 24 | Aleteo continuo y levitación flotante | `isThinking`, `isSpeaking`, activo |
| **`"idle"`** | `0 - 236.0` | 24 | Reposo con movimientos sutiles de patas y antenas | Espera, reposo (`isSleeping`) |
| **`"take_off_and_land"`**| `0 - 219.2` | 24 | Despegue y aterrizaje cinemático | Apertura de chat, clic de saludo |

---

## 3. Mapeo de Estados Reactivos con `useJarBeeEngine`

El componente `JarBeeAvatar` conecta directamente los eventos del chat con Three.js:

| Estado en `useJarBeeEngine` | Clip Activo | Multiplicador de Velocidad | Efecto Visual / Luz |
| :--- | :--- | :--- | :--- |
| **`isSleeping: true`** | `"idle"` | `0.6x` (reposo pausado) | Luz tenue ambiental |
| **`isListening: true`** | `"hover"` | `0.9x` | Glow azul (#0078d7) con antenas receptivas |
| **`isThinking: true`** | `"hover"` | `1.3x` | Glow cian (#38bdf8) oscilante |
| **`isSpeaking: true`** | `"hover"` | `1.6x` (aleteo dinámico rápido) | Glow ámbar / esmeralda activo |
| **`triggerHappyReaction` (clic)** | `"take_off_and_land"` | `1.35x` (pirueta de saludo) | Pulso brillante reactivo |
| **Gaze Tracking (Mouse)** | Orientación 3D | Rotación sutil en ejes X/Y | JarBee sigue la mirada del usuario |

---

## 4. Rendimiento y Fallback

1. **Lazy Loading y Cacheo en Memoria**: El modelo GLTF se carga de forma asíncrona y se cachea en memoria para transiciones instantáneas sin parpadeo.
2. **Fallback Elegante**: Mientras el modelo 3D descarga o si WebGL no está disponible, se presenta un avatar vectorial estilizado de alta definición para asegurar cero demoras perceptivas.
3. **Optimización de Render Loop**: El `requestAnimationFrame` se pausa cuando la pestaña del navegador está oculta (`document.visibilityState === 'hidden'`) para ahorrar batería y CPU/GPU.
