# Changelog

All notable changes to this theme are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project follows [Semantic Versioning](https://semver.org/).

## [1.4.0] - 2026-09-01

### Added

- **Layered CSS-snippet merge architecture.** The theme is now built in layers:
  Layer 1 = the official Ethereal variable layer (zero overrides), and further
  layers = CSS snippets merged verbatim at the end of `theme.css`, each with its
  own independent Style Settings panel that never mixes into the official panel.
  The file header documents the layered structure and warns that
  `npm run gen:settings` rewrites the file with the official layer only (merged
  snippet layers must be preserved/migrated before re-running it).
- **Layer 1 — List** (merged from `List.css`). Independent Style Settings panel
  (name: List / id: `list-snippet`; existing `list-snippet@@…` user values remain
  active). Per-level unordered-list markers (ghost disc + glyph, derived from
  Blue Topaz 2.3.2.1.2) with hover/collapse ghost reveal, fold-indicator restore
  on active lines, `.list-bullet` geometry fix, and `--list-*` defaults in the
  layer's own `:root`.
- **Layer 2 — Custom** (merged from `Custom.css`). Independent Style Settings
  panel (name: Ethereal 自定义 / id: `custom-snippet`; existing
  `custom-snippet@@…` user values remain active). Typography (readable line
  width, line height), active-line highlight, tab title-bar shadow, inline-title
  centering, hide-fold-placeholder, embedded-backlink hiding, caret-blink
  disable, VS Code-style workspace layout, file-explorer tree styling, H1–H6
  heading indicator labels (reading & editing modes), quote-box styling, and
  internal-link / italic scaling.

### Notes

- Includes the unreleased **1.3.1** work: `screenshot.png` for the community
  listing preview and the `screenshot` field in `manifest.json` (required by
  the community listing review).

## [1.3.0] - 2026-09-01

- Finish the *Ethereal* rename residual updates (theme header comment,
  `gen:settings` template + panel ids, package name).
- Drop the README screenshot reference (no screenshot had been submitted for the
  community listing at that point).

## [1.2.0] - 2026-09-01

- Rename the theme from *Silence* to *Ethereal* (the name *Silence* collided
  with an existing community theme).
