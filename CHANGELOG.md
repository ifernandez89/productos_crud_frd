# Changelog

All notable changes to this project will be documented in this file.

The format is based on "Keep a Changelog" and uses Semantic Versioning.

## [Unreleased]

- Added: `scripts/generate-sw-workbox.js` — Workbox SW generator.
- Added: `.github/workflows/deploy_export_and_lighthouse.yml` — CI job to build, start and run Lighthouse (manual dispatch).
- Added: `public/sw-workbox.js` (generated) and `public/sw.orig.js` (backup of previous SW).
- Changed: `public/sw.js` now imports the Workbox bundle (shim) to keep canonical `/sw.js` registration.
- Changed: `src/components/RegisterSW.tsx` — register `/sw.js` (now imports Workbox SW).
- Changed: `package.json` — removed local `lighthouse` devDependency to avoid install errors; added `generate-workbox-sw` script.
- Added: `public/sw-workbox.js` generation step validated locally (`npm run generate-workbox-sw`).

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
