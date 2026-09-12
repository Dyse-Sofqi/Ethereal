# Changelog

All notable changes to this theme are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project follows [Semantic Versioning](https://semver.org/).

## [1.4.1] - 2026-09-12

### Added

- **Official-variable marker (◉).** Every variable setting in the official
  panel (877 settings) now carries a `◉` prefix, making official CSS
  variables recognizable at a glance.
- **Novice-friendly "Ethereal 定制" panel.** A new top-level panel, shown
  before the official panel, built for everyday use: a simplified heading
  framework (常用 Essentials / 正文排版 Typography / 界面 UI) that merges the
  previous list / paragraph / content / details groups, and groups heading
  tweaks under 颜色 / 字体 / 字号 / 字重 (4 level-3 headings). Commonly used
  official variables (text, backgrounds, fonts, radiuses, heading
  colors/fonts/sizes/weights, links, file line width, bold color/weight) now
  live here as the single entry point — 47 variables in total moved out of the
  official panel, whose advanced-only contents are unchanged and marked with an
  info note.
- **Language-adaptive headings.** All 116 setting headings and info texts now
  use `title` (English) + `title.zh` (Chinese), switching with the Obsidian
  UI language — consistent with the variable settings.

### Changed

- **Concise titles.** The redundant `（--var）` suffix was removed from 874
  setting titles. The variable name is now surfaced as a monospace,
  click-to-copy chip by the Style Tuner companion plugin instead.

### Fixed

- **Theme defaults now actually apply.** The 「主题默认值（官方变量层）」region
  overrides were written to `:root` only, but Obsidian's app.css defines most
  of these variables at `body` scope, so the nearer inherited value (e.g.
  `--header-height: 40px`) shadowed the theme override. The region now
  declares every single-mode override on both `:root` and `body` — all 39
  overridden defaults (header height, heading fonts/weights, ribbon/tab/status
  backgrounds, …) take effect without touching any setting.
- **bold-font-family / wiki-font-family defaults aligned** with the theme's
  actual applied values (bold inherits the body font; wiki font keeps the
  `var(--font-default)` fallback).

### Notes

- Tooling: `gen:settings` now emits titles/defaults matching the new
  conventions (no `（--var）` suffix, `title`/`title.zh` split) and writes
  the defaults region to both `:root` and `body`; a `MOVED_TO_CUSTOM`
  exclusion list keeps the 47 moved variables out of the official panel when
  regenerating. `validate:settings` now tolerates the custom panel's 4-space
  indentation and all Style Settings types.

---

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
