# Ethereal

A minimal, zero-override theme for [Obsidian](https://obsidian.md/) (formerly *Silence*). Ethereal does **not** restyle anything itself — it only re-exposes Obsidian's official CSS variables (extracted from the official 1.13.7 `app.css`, 874 variables) through the [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) plugin, so every look stays 100% native and fully within your control.

<p align="center">
  <img src="https://raw.githubusercontent.com/Dyse-Sofqi/Ethereal/master/screenshot.png" alt="Ethereal theme screenshot" width="512">
</p>

## Features

- **Zero overrides**: the theme body contains no native-rule changes; only variable defaults are exposed and locked where needed.
- **Light / dark compatibility**: dual-mode variables (shadows, input field backgrounds, text selection, RGB palettes, …) are separated per mode and locked to official light-mode values in light theme.
- **Separate accent colors per mode** (Blue Topaz style): the accent HSL settings are split into light/dark groups (`accent-h/s/l-light`, `accent-h/s/l-dark`), since Obsidian's `--accent-h/s/l` is otherwise shared between themes.
- **Preset management**: the optional companion plugin [silence-presets](https://github.com/Dyse-Sofqi/silence-presets) adds a preset bar (apply / save / restore official defaults) on top of this panel.

## Installation

1. Install the [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) community plugin (recommended; the theme works without it, but exposes no customization panel).
2. In Obsidian: **Settings → Appearance → Themes → Manage → Browse**, search for **Ethereal**, and install.
   - Manual installation: download the latest release from GitHub (contains `manifest.json` + `theme.css`) and place both inside your vault's `.obsidian/themes/Ethereal/` folder.

## Compatibility

- Obsidian **1.0.0+** (panel contents are generated from the official **1.13.7** `theme.css`).

## License

MIT License — see [LICENSE](LICENSE). The theme exposes Obsidian's native CSS variables; Obsidian's assets remain property of Obsidian, Inc.
