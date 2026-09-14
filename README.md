# Ethereal

**Keywords / 关键词**

`Obsidian theme` · `zero-override` · `official CSS variables` · `Style Settings` · `light & dark` · `per-mode accent` · `layered CSS snippets` · `CJK web fonts` · `minimal`

Obsidian 主题 · 零覆盖 · 官方 CSS 变量 · Style Settings 面板 · 明暗双模 · 重音色分模式 · CSS 片段分层 · 中文字体兜底 · 极简

[English](#english) · [中文](#中文)

A minimal, **zero-override** theme for [Obsidian](https://obsidian.md/) (formerly *Silence*). Ethereal's base layer does **not** restyle anything itself — it only re-exposes Obsidian's official CSS variables (874 variables extracted from the official 1.13.7 `app.css`) through the [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) plugin, so every look stays 100% native and fully within your control. CSS snippets merged into the theme are self-contained extension layers on top of it.

极简、**零覆盖**的 [Obsidian](https://obsidian.md/) 主题（原名 *Silence*）。基础层**不修改任何原生规则**，只把 Obsidian 官方 CSS 变量（自官方 1.13.7 `app.css` 提取，共 874 个）通过 [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) 插件暴露出来，因此观感 100% 原生且完全由你掌控；并入主题的 CSS 片段则作为独立扩展层叠加其上。

<p align="center">
  <img src="https://raw.githubusercontent.com/Dyse-Sofqi/Ethereal/master/screenshot.png" alt="Ethereal theme screenshot" width="512">
</p>

---

## English

### Features

- **Zero overrides (official-variable layer).** The base layer contains no native-rule changes; only variable defaults are exposed, and locked where a value must not drift. A curated set of official variables gets the theme's own defaults (source: `scripts/defaults.json`), still fully overridable via Style Settings.
- **Two Style Settings panels.** 「Ethereal 定制」 is the beginner-facing panel (134 entries / 106 settings) covering everyday typography, UI and component options; 「Ethereal 官方变量」 is the advanced panel (908 entries / 821 settings) exposing the remaining official variables. Commonly used official variables live in the custom panel only — a single entry point, never duplicated.
- **Light / dark compatibility.** Dual-mode variables (shadows, input backgrounds, text selection, RGB palettes, …) are separated per mode and locked to official light-mode values in light theme. General variables are overridden on `body` and colours on `body.theme-light` / `body.theme-dark`, following Obsidian's theme guidelines.
- **Per-mode accent colours** (Blue Topaz style). The accent HSL settings are split into light/dark groups (`accent-h/s/l-light`, `accent-h/s/l-dark`), since Obsidian's `--accent-h/s/l` is otherwise shared between modes.
- **Layered CSS-snippet merges.** Beyond the official-variable layer, CSS snippets are appended at the end of `theme.css` as self-contained layers (`#region` blocks — List, Custom, …), each with its own Style Settings panel and its own `--*` namespace, never mixing into the official panel.
- **Optional CJK web-font fallback.** `snippets/ethereal-web-fonts.css` in this repo adds `@font-face` rules for the heading / internal-link fonts (`Source Han Serif SC VF`, `Source Han Sans SC VF`) and the H1 display face (`得意黑`) — `src: local(…)` first, CDN second, so an installed copy is used with **zero network requests** and a missing one is fetched as `unicode-range` subsets. It ships **separately from the theme** because Obsidian's developer policies forbid themes from loading network assets — see [Optional: CJK web fonts](#optional-cjk-web-fonts).
- **Preset management.** The optional companion plugin [silence-presets](https://github.com/Dyse-Sofqi/silence-presets) adds a preset bar (apply / save / restore official defaults) on top of this panel.
- **Pure CSS, no shipped JavaScript.** The release contains only `manifest.json` + `theme.css`. The Node scripts under `scripts/` are build-time tooling and are not part of the theme.

### Installation

1. Install the [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) community plugin (recommended; the theme works without it, but exposes no customization panel).
2. In Obsidian: **Settings → Appearance → Themes → Manage → Browse**, search for **Ethereal**, and install.
   - Manual installation: download the latest release from GitHub (contains `manifest.json` + `theme.css`) and place both inside your vault's `.obsidian/themes/Ethereal/` folder.

### Optional: CJK web fonts

The theme itself makes **no network calls at all** — the release contains only `manifest.json` + `theme.css`, with no remote references anywhere in the CSS. Obsidian's developer policies require this for community themes, so the font fallback lives in a separate, opt-in snippet.

To use it:

1. Download [`snippets/ethereal-web-fonts.css`](snippets/ethereal-web-fonts.css) from this repo.
2. Copy it into `<vault>/.obsidian/snippets/`.
3. Enable it in **Settings → Appearance → CSS snippets**.

Once enabled, the snippet contacts:

| Host | Purpose |
| --- | --- |
| `cdn.jsdelivr.net` (primary) | `@fontsource-variable/noto-serif-sc`, `@fontsource-variable/noto-sans-sc`, `cn-fontsource-smiley-sans-oblique-regular` |
| `fastly.jsdelivr.net` (mirror) | same packages, used only if the primary fails |

- If 思源宋体 / 思源黑体 / 得意黑 are installed locally, `local()` matches and **nothing is downloaded**.
- Because the faces are `unicode-range` subsets, only the subsets containing characters actually rendered are requested (~80–104 KB each, then HTTP-cached). Requests carry no cookies or identifiers.
- No telemetry, no analytics, no accounts. Turn the snippet off and all network activity stops.

### Development

```bash
npm run validate:settings   # validate both @settings blocks (structure, types, duplicate ids)
npm run gen:settings        # regenerate the official-variable panel (writes to a temp path — never straight onto theme.css)
npm run gen:webfonts        # regenerate the @font-face web-font region (idempotent, in-place)
```

### Compatibility

- Obsidian **1.0.0+** (panel contents are generated from the official **1.13.7** `app.css`).

### License

MIT License — see [LICENSE](LICENSE). The theme exposes Obsidian's native CSS variables; Obsidian's assets remain property of Obsidian, Inc. The optional web-font snippet references open-source fonts served by jsDelivr: 思源宋体 / 思源黑体 (SIL Open Font License 1.1) and 得意黑 Smiley Sans (SIL Open Font License 1.1).

---

## 中文

### 功能

- **零覆盖（官方变量层）**。基础层不含任何原生规则改动，只暴露变量默认值，并在「该值不应漂移」处锁定。一批官方变量采用主题自定默认值（数据源 `scripts/defaults.json`），且始终可在 Style Settings 中覆盖。
- **两个 Style Settings 面板**。「Ethereal 定制」面向日常使用（134 项 / 106 个设置），涵盖正文排版、界面与组件；「Ethereal 官方变量」为进阶面板（908 项 / 821 个设置），暴露其余官方变量。常用官方变量只出现在定制面板，单一入口、不重复。
- **明暗双模兼容**。明暗差异变量（阴影、输入框背景、文本选择、RGB 色板等）按模式分开，并在明亮主题下锁定为官方明亮值。通用变量在 `body` 上覆盖、颜色在 `body.theme-light` / `body.theme-dark` 上覆盖，遵循 Obsidian 主题规范。
- **重音色分模式**（Blue Topaz 风格）。重音 HSL 拆成明/暗两组（`accent-h/s/l-light`、`accent-h/s/l-dark`），因为 Obsidian 的 `--accent-h/s/l` 本身在明暗之间共享。
- **CSS 片段分层并入**。在官方变量层之外，CSS 片段以自包含层的形式追加在 `theme.css` 末尾（`#region` 区块 —— 无序列表、Custom 等），每层带独立 Style Settings 面板与独立 `--*` 命名空间，不与官方面板混在一起。
- **可选的中文字体兜底**。仓库内的 `snippets/ethereal-web-fonts.css` 为标题与内链字体（`Source Han Serif SC VF`、`Source Han Sans SC VF`）以及 H1 展示字体（`得意黑`）提供 `@font-face` 规则：`src` 以 `local(…)` 优先、CDN 兜底 —— 本机已装则**零网络请求**，未装才按 `unicode-range` 分片下载。它**独立于主题本体发布**，因为 Obsidian 的开发者政策禁止主题加载网络资源 —— 详见[可选：中文字体网络兜底](#可选中文字体网络兜底)。
- **预设管理**。可选配套插件 [silence-presets](https://github.com/Dyse-Sofqi/silence-presets) 在本面板之上提供预设栏（应用 / 保存 / 恢复官方默认）。
- **纯 CSS，不含 JS 产物**。发布物只有 `manifest.json` + `theme.css`；`scripts/` 下的 Node 脚本是构建期工具，不属于主题本体。

### 安装

1. 安装社区插件 [Style Settings](https://github.com/mgmeyers/obsidian-style-settings)（推荐；不装主题也能用，只是没有定制面板）。
2. 在 Obsidian 中：**设置 → 外观 → 主题 → 管理 → 浏览**，搜索 **Ethereal** 安装。
   - 手动安装：从 GitHub 下载最新 release（含 `manifest.json` + `theme.css`），两者一起放进库的 `.obsidian/themes/Ethereal/` 目录。

### 可选：中文字体网络兜底

主题本体**完全不发起任何网络请求** —— 发布物只有 `manifest.json` + `theme.css`，CSS 里没有任何远程引用。这是 Obsidian 开发者政策对社区主题的硬性要求，因此字体兜底被放在一个独立的、需自行启用的片段里。

启用方法：

1. 从本仓库下载 [`snippets/ethereal-web-fonts.css`](snippets/ethereal-web-fonts.css)。
2. 复制到 `<库>/.obsidian/snippets/`。
3. 在**设置 → 外观 → CSS 片段**中打开开关。

启用后，该片段会访问：

| 主机 | 用途 |
| --- | --- |
| `cdn.jsdelivr.net`（主源） | `@fontsource-variable/noto-serif-sc`、`@fontsource-variable/noto-sans-sc`、`cn-fontsource-smiley-sans-oblique-regular` |
| `fastly.jsdelivr.net`（镜像） | 同一批包，仅在主源失败时使用 |

- 本机装了思源宋体 / 思源黑体 / 得意黑时，`local()` 命中，**不产生任何下载**。
- 因为按 `unicode-range` 分片，只请求**实际渲染到的字符**所在的子集（单个约 80–104 KB，之后走 HTTP 缓存）。请求不带 Cookie 或任何标识。
- 无遥测、无统计、无账号。关掉该片段，所有网络活动即停止。

### 开发

```bash
npm run validate:settings   # 校验两个 @settings 块（结构、类型、重复 id）
npm run gen:settings        # 重新生成官方变量面板（输出到临时路径，切勿直接覆盖 theme.css）
npm run gen:webfonts        # 重新生成 @font-face 字体区域（幂等，原地替换）
```

### 兼容性

- Obsidian **1.0.0+**（面板内容基于官方 **1.13.7** 的 `app.css` 生成）。

### 许可

MIT License —— 见 [LICENSE](LICENSE)。主题暴露的是 Obsidian 原生 CSS 变量，Obsidian 的资产版权归 Obsidian, Inc.。可选字体片段引用 jsDelivr 上的开源字体：思源宋体 / 思源黑体（SIL Open Font License 1.1）、得意黑 Smiley Sans（SIL Open Font License 1.1）。
