# Ethereal

**Keywords / 关键词**

`Obsidian theme` · `zero-override` · `official CSS variables` · `Style Settings` · `light & dark` · `per-mode accent` · `layered CSS snippets` · `ordered & unordered lists` · `inline code` · `text selection` · `CJK web fonts` · `minimal`

Obsidian 主题 · 零覆盖 · 官方 CSS 变量 · Style Settings 面板 · 明暗双模 · 重音色分模式 · CSS 片段分层 · 有序与无序列表 · 行内代码 · 选中文本 · 中文字体兜底 · 极简

[English](#english) · [中文](#中文)

A minimal, **zero-override** theme for [Obsidian](https://obsidian.md/) (formerly *Silence*). Ethereal's base layer does **not** restyle anything itself — it only re-exposes Obsidian's official CSS variables (874 variables extracted from the official 1.13.7 `app.css`) through the [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) plugin, so every look stays 100% native and fully within your control. CSS snippets merged into the theme are self-contained extension layers on top of it.

极简、**零覆盖**的 [Obsidian](https://obsidian.md/) 主题（原名 *Silence*）。基础层**不修改任何原生规则**，只把 Obsidian 官方 CSS 变量（自官方 1.13.7 `app.css` 提取，共 874 个）通过 [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) 插件暴露出来，因此观感 100% 原生且完全由你掌控；并入主题的 CSS 片段则作为独立扩展层叠加其上。

<p align="center">
  <img src="https://raw.githubusercontent.com/Dyse-Sofqi/Ethereal/master/screenshot.png" alt="Ethereal — light mode" width="420">
  <img src="https://raw.githubusercontent.com/Dyse-Sofqi/Ethereal/master/screenshot-dark.png" alt="Ethereal — dark mode" width="420">
</p>

<p align="center"><sub>Both images are 1024×576 renders of the real <code>app.css</code> + <code>theme.css</code> in headless Chromium (the community directory recommends 512×288 — same 16:9 aspect).<br>
两张图都是把真实 <code>app.css</code> + <code>theme.css</code> 丢进无头 Chromium 渲染出的 1024×576 图像（社区目录推荐 512×288，比例同为 16:9）。</sub></p>

---

## English

### Features

- **Zero overrides (official-variable layer).** The base layer contains no native-rule changes; only variable defaults are exposed, and locked where a value must not drift. A curated set of official variables gets the theme's own defaults (source: `scripts/defaults.json`), still fully overridable via Style Settings.
- **Two Style Settings panels.** 「Ethereal 定制」 is the beginner-facing panel (171 entries / 136 settings) covering everyday typography, UI and component options; 「Ethereal 官方变量」 is the advanced panel (907 entries / 820 settings) exposing the remaining official variables. Commonly used official variables live in the custom panel only — a single entry point, never duplicated.
- **Light / dark compatibility.** Dual-mode variables (shadows, input backgrounds, text selection, RGB palettes, …) are separated per mode and locked to official light-mode values in light theme. General variables are overridden on `body` and colours on `body.theme-light` / `body.theme-dark`, following Obsidian's theme guidelines.
- **Per-mode accent colours** (Blue Topaz style). The accent HSL settings are split into light/dark groups (`accent-h/s/l-light`, `accent-h/s/l-dark`), since Obsidian's `--accent-h/s/l` is otherwise shared between modes.
- **Layered CSS-snippet merges.** Beyond the official-variable layer, CSS snippets are appended at the end of `theme.css` as self-contained layers (`#region` blocks — List, Custom, …), each with its own Style Settings panel and its own `--*` namespace, never mixing into the official panel.
- **Inline code: official variables + one hover effect.** Inline code deliberately has **no private variables** — its background, border and radius come from Obsidian's own `--code-background` / `--code-border-width` / `--code-border-color` / `--code-radius`, so there is a single source of truth instead of a second set of controls duplicating them. The theme changes two of those defaults — `--code-border-width` from the official `0px` to **`1px`**, and `--code-radius` from `var(--radius-s)` to **`6px`** — declared as real CSS defaults in the official-variable layer (`scripts/defaults.json` → `:root` / `body`), not merely as panel defaults: Style Settings never injects defaults, so a panel-only value would have no effect. (Since these are official variables, they shape fenced code blocks too.) The border colour stays `--background-modifier-border`, so it adapts to light and dark for free, and the 1px border is what makes inline code visible in dark mode at all, where `--code-background` sits very close to the page background. The single custom option is **hover darken** (「Ethereal 定制 → Typography → Text styles → Inline code」, on by default), which lays Obsidian's own `--background-modifier-hover` over the chip and switches its border to `--background-modifier-border-hover` — the same tokens the variable chips in Style Tuner's settings UI use, so the tint is exactly as strong as that reference (darkens in light mode, lightens in dark) and adapts on its own. **Click-to-copy is deliberately left out of the theme**: Obsidian themes are CSS-only and cannot write to the clipboard or raise a `Notice` — install a community plugin such as *Inline Code Copy* or *Copy Inline Code* if you want that behaviour.
- **Ordered lists mirror the unordered ones.** 「Ethereal 定制 → Typography → Ordered list」 carries the same per-level controls (number size and colour, ghost halo colour/size/offset) as 「Unordered list」, with the same defaults — except the symbol, because ordered lists **keep their numbering**. The two views allow different things, and the settings say so: reading-view numbers are the browser's native `::marker`, which honours font properties and `color` but drops `background`/`padding`/`border-radius`, so only size and colour apply there; the halo works in the edit view, where CodeMirror renders the number as a real span (drawn as a pill rather than a circle, since a number is wider than a glyph). Two global sliders tune the geometry: **horizontal adjust** shifts the number left, and **ghost horizontal inset** pulls the halo in so it hugs the digits instead of bulging into the body text. Horizontal adjust defaults to **0**, which makes the ordered-list caret line up exactly with the unordered-list one. Raising it lines the number up with the unordered-list *symbol* instead, but the caret moves with it and the gap before the body text grows by the same amount — **the two alignments are mutually exclusive**: a number is plain text, so its glyph and its caret share a single coordinate, whereas the unordered-list symbol is a pseudo-element drawn centred on the marker point and therefore always sits left of its own caret. (The unordered list's own **symbol adjust** defaults to 0 too, and moves only the symbol — it used to shift the element box, and with it the caret, which is what put the two carets 2px apart.) Both apply to lines that are being edited too — Obsidian skips inline marks that intersect the selection, so any such line has no `.list-number` span for the shift to hang off, and the number used to snap back to the un-shifted position and turn grey. The offset and the per-level size/colour are now applied to that line's marker span as well, covering the caret's line **and** every line a drag-selection covers (only the caret's line carries `.cm-active`, so the rule keys off the missing span instead). The halo is not reproduced there: it needs the real span's box, and these lines are mid-edit, where showing source is Obsidian's native behaviour.
- **Text selection.** The selection background lives in 「Ethereal 定制 → Typography → Text styles → Text selection」 and is Obsidian's own `--text-selection`, moved up from the advanced panel rather than duplicated, so it keeps following your accent colour by default and accepts any CSS colour. No corner-radius option: reading-view selections are painted by the browser and `::selection` does not accept `border-radius`, so only the edit view could be rounded.
- **Optional CJK web-font fallback.** `snippets/ethereal-web-fonts.css` in this repo adds `@font-face` rules for the heading / internal-link fonts (`Source Han Serif SC VF`, `Source Han Sans SC VF`) and the H1 display face (`得意黑`) — `src: local(…)` first, CDN second, so an installed copy is used with **zero network requests** and a missing one is fetched as `unicode-range` subsets. It ships **separately from the theme** because Obsidian's developer policies forbid themes from loading network assets — see [Optional: CJK web fonts](#optional-cjk-web-fonts).
- **Companion plugin: Style Tuner.** The optional [obsidian-style-tuner](https://github.com/Dyse-Sofqi/obsidian-style-tuner) plugin adds a live UI for adjusting theme, plugin and snippet CSS variables from inside Obsidian, and shows each setting's variable name as a monospace, click-to-copy chip — which is what replaced the old `（--var）` title suffix. (The earlier `silence-presets` link was dead and has been removed.)
- **Pure CSS, no shipped JavaScript.** The release contains only `manifest.json` + `theme.css`. The Node scripts under `scripts/` are build-time tooling and are not part of the theme.

### Style Settings panel map

Two panels, two audiences. Settings live in exactly one of them.

**「Ethereal 定制」 — 171 entries / 136 settings.** The everyday panel. Group
titles follow the Obsidian UI language (`title` / `title.zh`).

| Group | Sub-groups |
| --- | --- |
| **Essentials** | Colors · Backgrounds · Fonts · Radiuses |
| **Typography** | Paragraphs · Headings *(Colors / Fonts / Sizes / Weights)* · Text styles *(Highlights / Bold / Italic / Inline code / Text selection)* · Links *(Wiki)* · Unordered list *(levels 1–4)* · Ordered list *(levels 1–4)* |
| **UI** | Editing · Tabs |
| **Components** | Checkboxes |

**「Ethereal 官方变量」 — 907 entries / 820 settings.** Every remaining official
variable, grouped as in `app.css`, each title prefixed with `◉` so an official
variable is recognisable at a glance.

An official variable that has a better home in the custom panel is moved there
and removed from the official panel — a single entry point, never two. Where an
official variable is still listed but no longer reaches what its name suggests
(the three `--list-marker-*` colours, whose job the per-level list colours took
over), its description says so and points at the panel that does work.

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
- **两个 Style Settings 面板**。「Ethereal 定制」面向日常使用（171 项 / 136 个设置），涵盖正文排版、界面与组件；「Ethereal 官方变量」为进阶面板（907 项 / 820 个设置），暴露其余官方变量。常用官方变量只出现在定制面板，单一入口、不重复。
- **明暗双模兼容**。明暗差异变量（阴影、输入框背景、文本选择、RGB 色板等）按模式分开，并在明亮主题下锁定为官方明亮值。通用变量在 `body` 上覆盖、颜色在 `body.theme-light` / `body.theme-dark` 上覆盖，遵循 Obsidian 主题规范。
- **重音色分模式**（Blue Topaz 风格）。重音 HSL 拆成明/暗两组（`accent-h/s/l-light`、`accent-h/s/l-dark`），因为 Obsidian 的 `--accent-h/s/l` 本身在明暗之间共享。
- **CSS 片段分层并入**。在官方变量层之外，CSS 片段以自包含层的形式追加在 `theme.css` 末尾（`#region` 区块 —— 无序列表、Custom 等），每层带独立 Style Settings 面板与独立 `--*` 命名空间，不与官方面板混在一起。
- **行内代码：只用官方变量 + 一个悬停效果**。行内代码刻意**不设私有变量** —— 底色、边框、圆角全部来自 Obsidian 官方的 `--code-background` / `--code-border-width` / `--code-border-color` / `--code-radius`，单一数据源，不再重复造一套控件。主题改动了其中两个默认值 —— `--code-border-width` 从官方 `0px` 提到 **`1px`**、`--code-radius` 从 `var(--radius-s)` 提到 **`6px`**，都写在官方变量层的 CSS 默认值里（`scripts/defaults.json` → `:root` / `body`），而不是只改面板默认值 —— Style Settings 从不注入默认值，只改面板等于无效。（这两个都是官方变量，因此围栏代码块同样受影响。）边框色沿用 `--background-modifier-border`，因此自动适配日间/夜间；这道 1px 边框也是深色模式下行内代码能被看见的关键（那里 `--code-background` 与页面底色非常接近）。唯一的自建选项是**悬停压暗**（「Ethereal 定制 → 正文排版 → 文本样式 → 行内代码」，默认开启）：在底色上叠一层官方 `--background-modifier-hover`，并把边框换成 `--background-modifier-border-hover` —— 正是 Style Tuner 设置界面变量代码块用的那两个 token，强度与参照物完全一致（日间压暗、夜间提亮），且明暗自适应。**点击复制刻意不做进主题**：主题只有 CSS，无法写剪贴板、无法弹 `Notice` —— 需要该行为请安装社区插件（如 *Inline Code Copy*、*Copy Inline Code*）。
- **有序列表复刻无序列表**。「Ethereal 定制 → 正文排版 → 有序列表」提供与「无序列表」相同的逐层设置（数字大小/颜色、虚影背景色/光环大小/偏移），默认值也一致 —— 只少了「符号」项，因为有序列表**保留序号**。两个视图能做的事不同，设置项里已注明：阅读模式的序号是浏览器原生 `::marker`，只认字体属性与 `color`，`background`/`padding`/`border-radius` 会被丢弃，因此只能调字号与颜色；虚影在编辑视图生效（那里 CodeMirror 把序号渲染成真实 span，虚影画成随数字宽度自适应的胶囊而非圆形）。另有两个全局微调：**序号左右调整量**（默认 **0**，此时有序列表的**光标**与无序列表精确对齐）与**虚影水平内缩**（把虚影收进来贴住数字，避免胖出去压到正文）。把序号调整量调为正值，序号会改为与无序列表的**符号**对齐 —— 但光标会跟着一起移动、序号与正文之间的空隙也等量变大，**这两种对齐互斥**：序号是普通文本，字形与光标共用一个坐标；而无序列表的符号是伪元素、以标记点为圆心绘制，永远比它自己的光标靠左。（无序列表的**符号左右调整量**默认也是 0，且只移动符号本身 —— 旧写法会连元素盒与光标一起推，正是两个光标差 2px 的原因。）两项在**正在编辑的行上也生效** —— Obsidian 会跳过与选区相交的行内装饰，这类行没有 `.list-number` 可挂，序号本来会「回退」并变灰。现在偏移量与逐层字号/颜色都补到了该行的标记段上，覆盖**光标所在行**以及**拖拽选区覆盖的每一行**（只有光标行带 `.cm-active`，所以规则按「缺少 span」判断而非按 `.cm-active`）。这些行不补虚影：虚影需要真实盒子的几何，而这些行正处于编辑中，显示源码是 Obsidian 的原生行为。
- **选中文本**。选区底色在「Ethereal 定制 → 正文排版 → 文本样式 → 选中文本」，用的是 Obsidian 官方的 `--text-selection`（自进阶面板上收，不重复造变量），默认仍跟随强调色，也可填任意 CSS 颜色。**不提供圆角**：阅读模式的选区由浏览器绘制，`::selection` 不接受 `border-radius`，只有编辑视图能加圆角。
- **可选的中文字体兜底**。仓库内的 `snippets/ethereal-web-fonts.css` 为标题与内链字体（`Source Han Serif SC VF`、`Source Han Sans SC VF`）以及 H1 展示字体（`得意黑`）提供 `@font-face` 规则：`src` 以 `local(…)` 优先、CDN 兜底 —— 本机已装则**零网络请求**，未装才按 `unicode-range` 分片下载。它**独立于主题本体发布**，因为 Obsidian 的开发者政策禁止主题加载网络资源 —— 详见[可选：中文字体网络兜底](#可选中文字体网络兜底)。
- **配套插件：Style Tuner**。可选插件 [obsidian-style-tuner](https://github.com/Dyse-Sofqi/obsidian-style-tuner) 在 Obsidian 内提供一套实时调节主题 / 插件 / 片段 CSS 变量的界面，并把每个设置项的变量名显示成等宽、可点击复制的标签 —— 1.4.1 移除标题里的 `（--var）` 后缀，就是由它接替。（旧文档里的 `silence-presets` 链接已失效，本次一并撤掉。）
- **纯 CSS，不含 JS 产物**。发布物只有 `manifest.json` + `theme.css`；`scripts/` 下的 Node 脚本是构建期工具，不属于主题本体。

### 面板结构

两个面板，对应两类使用者。同一个设置只会出现在其中一个。

**「Ethereal 定制」—— 171 项 / 136 个设置**，面向日常使用。分组标题跟随 Obsidian 界面语言切换（`title` / `title.zh`）。

| 分组 | 子分组 |
| --- | --- |
| **常用 Essentials** | 颜色 · 背景 · 字体 · 圆角 |
| **正文排版 Typography** | 段落 · 标题*（颜色 / 字体 / 字号 / 字重）* · 文本样式*（高亮 / 粗体 / 斜体 / 行内代码 / 选中文本）* · 链接*（双链）* · 无序列表*（第 1–4 层）* · 有序列表*（第 1–4 层）* |
| **界面 UI** | 编辑与光标 · 标签页与窗口 |
| **组件 Components** | 复选框 |

**「Ethereal 官方变量」—— 907 项 / 820 个设置**，收录其余全部官方变量，分组沿用 `app.css` 的分类，标题统一带 `◉` 前缀，一眼可辨官方变量。

在定制面板里有更好归属的官方变量会被**搬过去并从官方面板删除** —— 单一入口，不重复。若某个官方变量仍然列出、但已不再影响它名字所暗示的对象（如三个 `--list-marker-*` 颜色已被逐层列表配色接管），它的说明里会写明这一点，并指向真正生效的面板。

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
