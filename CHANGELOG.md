# Changelog

All notable changes to this project will be documented in this file.

The format is based on "Keep a Changelog" and uses Semantic Versioning.

## [Unreleased]

### Added
- **Grabación de Voz Nativa con MediaRecorder y Visualizador de Ondas**:
  - Implementado [`useVoiceRecorder.ts`](file:///c:/Projects/productos_crud_frd/src/components/chat/useVoiceRecorder.ts): Hook reutilizable para captura de audio con códecs Opus/WebM (`audio/webm;codecs=opus`, `audio/ogg;codecs=opus`, `audio/wav`), temporizador digital en vivo y liberación automática de hardware/micrófono al cancelar o desmontar.
  - Análisis espectral sonoro en tiempo real: Integración de la API Web Audio (`AudioContext` + `AnalyserNode`) para calcular la amplitud acústica y renderizar ondas ecualizadoras dinámicas reactivas a la voz del usuario.
  - Barra de grabación interactiva en [`ChatInputSimple.tsx`](file:///c:/Projects/productos_crud_frd/src/components/chat/ChatInputSimple.tsx): Transformación visual suave del área de texto al presionar el micrófono, con pulso rojo `REC`, contador de duración (`00:04`), ondas sonoras, botón de descarte (`✕`) y botón de envío directo (`✓`).
  - Orquestación en [`ChatInterfaceSimple.tsx`](file:///c:/Projects/productos_crud_frd/src/components/chat/ChatInterfaceSimple.tsx): Flujo completo de envío del audio vía [`sendVoiceChat`](file:///c:/Projects/productos_crud_frd/src/app/services/jarbees.api.ts), renderizado inmediato de la transcripción del usuario (`🎙️ "..."`), streaming de respuesta y síntesis TTS con manejo de errores no bloqueante.
- **Soporte de Herramientas de Audio, Samples y Producción Musical**:
  - Menú de adjuntos con **Audio / Sample**: Soporte para adjuntar archivos de audio (`.wav`, `.mp3`, `.ogg`, `.flac`, `.aiff`, `.m4a`) en [`ChatInputSimple.tsx`](file:///c:/Projects/productos_crud_frd/src/components/chat/ChatInputSimple.tsx) con badge de formato, peso y tamaño en MB.
  - Nueva disciplina **Audio & Samples (🎚️)** en [`preguntas.api.ts`](file:///c:/Projects/productos_crud_frd/src/app/services/preguntas.api.ts): Orientada al análisis de loops/samples (tempo, BPM, escala/tono root), integración con DAWs (FL Studio, Studio One) y masterización sonora EBU R128.
  - Autocompletado de comandos rápidos en `/`: Inclusión de `/audio` (análisis de muestras musicales), `/podcast` (generación de audiolibros y resúmenes MP3) y `/balance`.
  - Botón de escucha rápida en respuestas: Integrado botón **Escuchar** (`Volume2`) en [`ChatMessageCompact.tsx`](file:///c:/Projects/productos_crud_frd/src/components/chat/ChatMessageCompact.tsx) en el hover de cada respuesta del asistente para reproducir la voz individualmente.
- **Servicio de Voz Backend (`sendVoiceChat`)**:
  - Implementado en [`jarbees.api.ts`](file:///c:/Projects/productos_crud_frd/src/app/services/jarbees.api.ts) con soporte para multipart/form-data (`voice_message.opus`/`webm`), resolución estándar `BACKEND_URL`, política de bypass ngrok y fallback de rutas (`/api/jarbees/voice/chat`, `/jarbees/voice/chat`, `/api/voice/chat`).
- **Selector Modular de Especialistas y Disciplinas de IA**:
  - Implementado [`DisciplineSelector.tsx`](file:///c:/Projects/productos_crud_frd/src/components/chat/DisciplineSelector.tsx) con barra de píldoras horizontal (*pills carousel*), scroll suave, gradientes dinámicos, borde resplandeciente (*glow effect*) e indicador del modelo del backend.
  - Soporte completo para las 10 disciplinas de JarBees:
    - 🧭 **Automático (`auto`)**: Enrutador inteligente según la intención del prompt.
    - 💬 **Chat General (`chatbot`)**: Asistencia general y conversación libre (`qwen2.5:7b`).
    - 💻 **Código & Dev (`coder`)**: Programación, debugging y arquitectura (`qwen2.5-coder:7b`).
    - 🌐 **Traductor (`traductor`)**: Traducción directa (`RogerBen/hy-mt1.5-1.8b:latest`).
    - 🎙️ **Lector & Audio (`reader`)**: Optimizado para lectura y síntesis de voz (`sematre/orpheus:it_es-3b`).
    - 📄 **PDF / OCR (`ocr`)**: Extracción de texto y análisis de documentos (`yemifo/qwen25-vl-3b-q4km:latest`).
    - 🎬 **Video Analysis (`video`)**: Análisis de frames y multimedia (`yemifo/qwen25-vl-3b-q4km:latest`).
    - 🔎 **Búsqueda RAG (`rag`)**: Recuperación vectorial sobre memoria (`bge-m3:latest`).
    - 🧠 **Planner (`planner`)**: Planificación y orquestación multi-paso de tareas.
    - 🛠️ **Herramientas (`tools`)**: Ejecución de herramientas (Google Calendar, Tasks, Gmail, Clima, etc.).
  - Consulta dinámica del catálogo vía `GET /aichat/disciplines` y `GET /jarbees/disciplines` con fallback robusto.
  - Persistencia de modo activo en `localStorage` (`jarbees_active_discipline_mode`).
  - Envío automático del campo `mode` en la carga útil JSON de las consultas al backend.
- **Sugerencias y Placeholders Dinámicos de Prompts**:
  - Placeholder del `textarea` en [`ChatInputSimple.tsx`](file:///c:/Projects/productos_crud_frd/src/components/chat/ChatInputSimple.tsx) actualizado en tiempo real con el `suggestedPrompt` del modo seleccionado.
  - Píldora interactiva de inserción rápida (`usar ↵`) sobre la barra de entrada.
  - Tarjetas de bienvenida y botones de acceso directo a especialistas en el estado inicial de conversación.
- **Avatar Interactivo JarBee con Motor de Vida Procedural**:
  - Implementado [`JarBeeAvatar.tsx`](file:///c:/Projects/productos_crud_frd/src/components/chat/JarBeeAvatar.tsx): Avatar vector SVG estilizado de abeja-drone cibernética ultra ligero (<15 KB, sin dependencias pesadas 3D), renderizado a 60 FPS con aceleración por hardware CSS y compatible tanto con escritorio como con dispositivos móviles.
  - Diseñado con visor OLED digital, ojos expresivos interactivos (`◉ ◉`, `^ ^`, `- -`, `• • ↗`), antenas con sensores pulsantes de radar y alas translúcidas con estética acrílica.
  - Implementado [`useJarBeeEngine.ts`](file:///c:/Projects/productos_crud_frd/src/components/chat/useJarBeeEngine.ts): Motor de vida procedural con estados de atención y ciclos autónomos:
    - **Seguimiento ocular de mirada**: Ojos que siguen la posición del cursor/mouse en tiempo real con suavizado angular y retorno natural al centro.
    - **Parpadeo estocástico natural**: Intervalos biológicos aleatorios de parpadeo (entre 2.5s y 6s).
    - **Modo reposo/sueño inteligente**: Entra en suspensión profunda (`sleepy` con emisión de `z`) tras 75s de inactividad, despertando instantáneamente ante interacciones del usuario (movimiento, toque táctil, tipeo).
    - **Reacción táctil al click**: Dispara expresión de alegría (`happy` `^ ^`) y aceleración temporal de aleteo al hacer click o pulsar el avatar.
    - **Lip-sync y modulación de voz**: Sincronización labial dinámica de apertura bucal durante la lectura por voz (TTS).
    - **Sensor de escucha de audio**: Pulso y ondas de radar visuales en las antenas cuando el reconocimiento de voz (`SpeechRecognition`) está activo.
  - Integrado en [`ChatInterfaceSimple.tsx`](file:///c:/Projects/productos_crud_frd/src/components/chat/ChatInterfaceSimple.tsx) (cabecera interactiva y bienvenida) y en [`ChatMessageCompact.tsx`](file:///c:/Projects/productos_crud_frd/src/components/chat/ChatMessageCompact.tsx) para los mensajes del asistente.
- **Rediseño Visual: Windows 10 Dark Acrylic**:
  - Implementada la paleta base de diseño "Windows 10 Dark" con fondo neutral profundo (`#0c0c0c`), superficies acrílicas translúcidas (`#101010`, `#181818`, `#1f1f1f`), bordes sutiles (`rgba(255, 255, 255, 0.08)`) y efecto backdrop blur intenso (`blur(20px)` a `blur(24px)`).
  - Acento unificado **Windows Blue (`#0078d7` / `#429ce3`)** para selección de especialistas, estado activo, indicador de modo, botón de envío y viñetas de Markdown, eliminando el tinte azul/cian saturado anterior.
  - Píldoras del selector de disciplinas rediseñadas con estilo acrílico uniforme, borde activo iluminado con acento azul sutil y tipografía nítida.
  - Mensajes del chat, avatares de usuario y asistente, y barra de entrada (`ChatInputSimple`) alineados con la estética Fluent/Acrylic dark.



### Fixed
- **Doble Despliegue en GitHub Actions (`deploy.yml`)**: Eliminado el paso redundante `peaceiris/actions-gh-pages` que hacía push a la rama `gh-pages` y activaba innecesariamente un segundo workflow paralelo de GitHub (`pages-build-deployment` del bot). Se consolidó el despliegue directo oficial mediante `actions/upload-pages-artifact` y `actions/deploy-pages`, añadiendo además caché de dependencias (`cache: "npm"`) para acelerar sustancialmente los tiempos de compilación.
- **Estándar Arquitectónico de Conexión al Backend (`BASE_URL`)**: Restaurada la lógica directa y limpia `export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL; const BASE_URL = BACKEND_URL ?? "http://localhost:4000";` en todos los servicios de API (`preguntas.api.ts`, `jarbees.api.ts`, `balance.api.ts`, `products.api.ts`), unificando el consumo del Chatbot y del Lector.
- **Corrección de Bloqueo CORS Preflight (`ngrok-skip-browser-warning`)**: Condicionada la cabecera `ngrok-skip-browser-warning` únicamente a llamadas que contengan `ngrok` en la URL. Esto evita que solicitudes locales a `http://localhost:4000` fallen durante el preflight OPTIONS de los navegadores.
- **Redirección Nativa de Servidor (`HomePage`)**: Actualizado `src/app/page.tsx` para usar `redirect("/preguntas/new")` de Next.js en lugar de un `useEffect` del cliente, eliminando retardos y pantallas de carga al ingresar a la raíz.
- **Redirección Alias `/lector`**: Creada la página `src/app/lector/page.tsx` que redirige instantáneamente a `/reader`, permitiendo ambas URLs de acceso a la biblioteca.
- **Claves Únicas en Renderizado de Lista (`React Key Duplicate`)**: Corregido el atributo `key` en `src/app/reader/page.tsx` a `key={`book-${item.id || item.titulo || index}-${index}`}`, resolviendo las 22 advertencias de React por claves duplicadas.
- **Reglas Persistentes de Agente (`.agents/AGENTS.md`)**: Creado el archivo de reglas de espacio de trabajo para garantizar la preservación inalterable del estándar de comunicación frontend-backend en el desarrollo futuro.

### Added
- **Módulo Lector de Audiolibros AI (`/reader`)**:
  - Nueva página `/reader` con vista de biblioteca de libros y audiolibros, integrando consulta dinámica al backend (`getLibraryIndex()`) y buscador `🔎 Buscar` en tiempo real por título y autor.
  - Reproductor de audio con soporte para el elemento nativo HTML `<audio>` que permite reproducción en segundo plano y con pantalla bloqueada en móviles.
  - Controles completos de reproducción: Play, Pause, Stop, barra de progreso (`input range`) y selector de velocidad exclusivo (`0.75x`, `1x`, `1.25x`, `1.5x`, `2x`).
  - Endpoint API `GET /api/reader/[documentId]` para extracción e integración por bloques de texto con modelo local de Ollama (`sematre/orpheus:it_es-3b`).
  - Nuevo botón `🎧 Lector` integrado en el header del chat (`ChatInterfaceSimple`) para navegar directamente a la sección `/reader`.
  - Integración estricta con los endpoints de audiolibros del backend NestJS (`/api/reader` y `/api/reader/:id`), garantizando la lectura secuencial ininterrumpida de todos los libros reales (hasta miles de bloques por obra).
- **Autenticación JWT completa**:
  - `auth.api.ts`: Servicio con `login()`, `verifyToken()`, `logout()`, `getToken()`, `storeToken()`, `buildAuthHeaders()`
  - Token JWT con expiración de 30 días, guardado en `localStorage` bajo clave `jarbees_auth_token`
  - Header `Authorization: Bearer <token>` en todas las peticiones al backend
  - `AuthContext.tsx`: Proveedor global de estado de autenticación con `isAuthenticated`, `isLoading`, `login()`, `logout()`
  - `AuthProvider` integrado en `layout.tsx` para disponibilidad en toda la app
  - Página de login `/login` con formulario usuario/contraseña, manejo de errores y UX consistente con la identidad JarBees
  - `ProtectedRoute.tsx`: Wrapper que redirige a `/login` si no hay sesión activa, con pantalla de carga mientras verifica el token
  - Interceptor 401: cualquier petición que retorne `401 Unauthorized` hace logout automático y redirige al login
  - Página `/preguntas/new` ahora protegida con `ProtectedRoute`
- **Botón de logout en header del chat**: Ícono `LogOut` + "Salir" en el header del `ChatInterfaceSimple`, visible en desktop

### Changed
- `preguntas.api.ts`: Reemplazada la función `buildHeaders()` local por `buildAuthHeaders()` de `auth.api.ts`. Todos los llamados al backend ahora incluyen el JWT automáticamente
- `preguntas.api.ts`: Eliminada variable `NEXT_PUBLIC_API_TOKEN` — el JWT reemplaza el token estático de entorno
- `layout.tsx`: Removido el wrapper `<main className="container mx-auto pt-5">` que rompía el layout `h-screen` del chat. El contenido ahora ocupa toda la pantalla correctamente

### Fixed
- Import de `buildAuthHeaders` movido al tope del archivo `preguntas.api.ts` (ES modules no permiten imports en medio del código)

- **UI minimalista estilo ChatGPT/Claude**: 
  - Rediseño completo de la interfaz del chat
  - Herramientas ocultas detrás del botón "+" (Imagen, Buscar Web, Documentos, Memoria, Herramientas)
  - Mensajes compactos estilo burbujas con avatares pequeños
  - Header simplificado con solo nombre y estado
  - Input bar inferior con 3 botones principales: +, 🎤, ➤
  - Reducción del 50%+ de ruido visual
- **PWA completa configurada**: 
  - Componente `InstallPWA` con prompt elegante de instalación
  - Página `/offline` con reconexión automática cada 5 segundos
  - Manifest.json completo con shortcuts (Nuevo Chat, Astronomía, Matemáticas)
  - Soporte para iconos maskable (Android adaptativos)
  - Documentación completa en `PWA_JARBEES.md` y `GENERATE_ICONS.md`
- **Reconocimiento de voz continuo**: Implementado modo `continuous: true` en ambos componentes de chat para grabación sin cortes por silencio
- **Voz masculina estilo JARVIS**: Sistema de selección automática de voces masculinas con parámetros optimizados (`pitch: 0.75`, `rate: 0.92`)
- **Botón de detener audio**: Nuevo botón visible en el panel de historial para detener la reproducción de respuestas
- **Auto-reinicio de reconocimiento de voz**: Reinicio automático cuando el navegador corta la sesión por razones internas
- **Nuevos dominios de consulta**: Agregadas capacidades de astronomía (🌙 fase lunar, 🌅 amanecer/atardecer, 🪐 planetas, eclipses), calendarios (📅 Maya con kin, ✡️ Hebreo) y matemáticas (📐 derivadas, integrales, aritmética)
- **Acciones rápidas expandidas**: 8 nuevos botones de acceso rápido a consultas frecuentes organizadas por categoría
- **Preguntas frecuentes categorizadas**: Organizadas en 4 grupos (Astronomía, Calendarios, Matemáticas, Celulares) con iconos y headers

### Changed
- **Página principal redirige al chat**: La home (`/`) ahora redirige automáticamente a `/preguntas/new` para acceso directo al chat
- **GitHub Actions workflows actualizados**: 
  - Agregado `permissions: contents: write` para permitir push a `gh-pages`
  - Actualizado Node.js de v18 a v20 para evitar deprecaciones
  - Actualizado `peaceiris/actions-gh-pages` de v3 a v4
  - Removido workflow duplicado `nextjs.yml` que causaba conflictos
- **Next.js config para GitHub Pages**: 
  - Agregado `basePath: '/productos_crud_frd'` para rutas correctas en GitHub Pages
  - Agregado `assetPrefix: '/productos_crud_frd'` para carga correcta de CSS/JS
  - Agregado `images: { unoptimized: true }` para compatibilidad con `output: 'export'`
- **Manejo de errores de voz mejorado**: Errores "network", "aborted" y "no-speech" ya no rompen el flujo de reconocimiento
- **UI del micrófono**: Textos actualizados para reflejar el nuevo comportamiento de grabación controlada por el usuario

### Fixed
- **Error 403 en GitHub Pages deploy**: Solucionado con permisos explícitos en workflow
- **Bloqueo de archivos Git en Windows**: Limpieza automática de procesos Git colgados
- **Reconocimiento de voz roto después de error de backend**: Implementado reinicio resiliente y manejo de errores no críticos
- **Auto-envío no deseado del micrófono**: El micrófono ya no envía automáticamente; el usuario controla cuándo detener y enviar
- **Error de optimización de imágenes en build estático**: Configurado `unoptimized: true` para exports estáticos
- **Estilos no cargando en GitHub Pages**: Agregado `basePath` y `assetPrefix` para rutas correctas de assets

---

## [0.1.0] - 2026-06-20

### Added
- Initial JarBees rebranding and PWA basics (logo, manifest, icons).
- Chat UI improvements: virtualization, IndexedDB persistence, streaming token updates (see components under `src/components/chat`).

### Changed
- Switched service worker to Workbox-generated runtime caching for `/api/` (NetworkFirst) and images (CacheFirst).

### Fixed
- Resolved build/lint issues related to SW registration code and removed problematic `lighthouse` devDependency to allow local installs.

---

How to use this file:
- Add new entries under `Unreleased` for ongoing changes.
- When releasing, move `Unreleased` entries into a new version heading like `## [0.1.1] - YYYY-MM-DD` and add a short summary.
- Follow Semantic Versioning for version numbers (MAJOR.MINOR.PATCH).
- Optionally include links to PRs/commit hashes for traceability.

Example release steps:

1. Update `CHANGELOG.md`: move entries from `Unreleased` to `## [X.Y.Z] - YYYY-MM-DD`.
2. Commit and push changes.
3. Tag the commit: `git tag -a vX.Y.Z -m "Release vX.Y.Z"` and push tags: `git push --follow-tags`.
