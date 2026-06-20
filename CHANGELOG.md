# Changelog

All notable changes to this project will be documented in this file.

The format is based on "Keep a Changelog" and uses Semantic Versioning.

## [Unreleased]

### Added
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
