# Changelog

All notable changes to this theme are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project follows [Semantic Versioning](https://semver.org/).

## [1.4.3] - 2026-09-22

**Overview.** This release closes the two remaining gaps in the theme's own list
and text styling — ordered lists and text selection — and settles a set of
alignment and visibility problems that only showed up once they were in daily
use. Ordered lists now mirror the unordered ones per level; text selection is
driven by the official variable from the custom panel; inline code became
actually visible in dark mode. Three build-tooling bugs that had silently made
`npm run gen:settings` unusable were fixed, and the shipped defaults were
reconciled with the generator's data source.

**功能构建.** 有序列表复刻无序列表（逐层字号/颜色/虚影），选中文本上收定制面板，
行内代码改用官方 `--code-*` 变量并给出一道可见的 1px 边框。
**错误修复.** 列表光标对齐（10.25px → 0）、编辑行序号回退变灰、生成器三处崩溃、
`defaults.json` 与交付物漂移。

### Added

- **Inline-code hover tint** (「Ethereal 定制 → 正文排版 → 文本样式 → 行内代码 →
  悬停压暗」, class `inline-code-hover-darken`, **on by default**). Hovering a
  chip lays Obsidian's own `--background-modifier-hover` over its background and
  switches the border to `--background-modifier-border-hover`. Those are exactly
  the tokens the variable chips in Style Tuner's settings UI use, so the tint is
  as strong as that reference and adapts per mode for free — the value is
  `color-mix(in oklch, var(--mono-100) 6.7%, transparent)`, i.e. 6.7% black in
  light mode and 6.7% white in dark, so it darkens by day and *lightens* at
  night. The direction flip is deliberate: `--code-background` (`#232323`) sits
  only five shades above `--background-primary` (`#1e1e1e`) in dark mode, so a
  darkening overlay would be invisible there.

  Two approaches were measured and rejected. `filter: brightness()` darkens the
  text along with the chip, and at a visible strength it makes the code text
  grey — while a mild `brightness(0.9)` moves `#282828` to `#242424`, a
  four-shade difference nobody can see. Hand-rolled alphas were worse: a first
  pass used 10% black by day and 38% black at night, which the user immediately
  reported as "darker than Style Tuner" — the reference is 6.7%, and the 38%
  was not only five times stronger but pointing the wrong way. A
  `linear-gradient(<token>, <token>)` overlay paints over the background only
  and leaves the text crisp, so that is what ships.

- **Ordered-list styling, mirroring the unordered list** (Ethereal 定制 →
  Typography → Ordered list; the existing group was renamed from 「列表」 to
  「无序列表」 / "Unordered list"). Four nesting levels, each with the number's
  size and colour plus the ghost halo (background colour, halo size,
  horizontal/vertical offset) — the same controls the unordered list offers, minus
  the symbol, because ordered lists **keep their numbering** instead of swapping
  the marker for a glyph. Defaults mirror the unordered list, so the two look
  alike out of the box.

  The two views differ in what is possible at all, and the settings say so:

  - **Reading view.** The number is the browser's native `::marker`. Measured in
    Chromium, `::marker` honours font properties (`font-size`, `font-weight`) and
    `color`, but drops `background`, `padding` and `border-radius` — so only size
    and colour can be styled there, and the halo cannot be drawn.
  - **Edit view.** CodeMirror renders the number as a real span
    (`.list-number`), so size, colour and the halo all work. The halo is drawn as
    a `::before` **pill** rather than a circle — a number is wider than a single
    glyph, so a 50% radius would stretch into an ellipse — and is pushed behind
    the text with `z-index: -1`, with `z-index: 0` on the span to contain it. It
    appears on the same triggers as the unordered list: hovering the fold arrow,
    or the item being collapsed.

  Two global sliders handle the geometry differences between the two list kinds,
  both measured off a screenshot of the running theme (≈35px font size):

  - **Horizontal adjust** (default **`0`**, see Changed below). The unordered-list
    symbol is drawn centred on the marker point, reaching 0.5em to its left,
    whereas a number is laid out to the right of it — so ordered numbers sat ~12px
    further right. Shifting the number left via `position: relative; left` lines
    the two *symbols* up while leaving the following text untouched (a negative
    margin would drag it along).
  - **Ghost horizontal inset** (default **`0.15em`**, see Changed below).
    CodeMirror's `list-number` mark covers the whole marker range including the
    trailing space, so the span's box is wider than the digits — a halo drawn from
    that box bulged ~20px left and ~28px right, straight into the body text. The
    halo is now pulled in by this amount before the halo size expands it again, and
    its height is fixed (`1em + 2 × size`) and centred so the line-height can no
    longer inflate it vertically (~12px per side) either.

### Changed

- **Text selection moved up to the custom panel** (「Ethereal 定制 → 正文排版 →
  文本样式 → 选中文本」, `◉ Selection background`). The selection background was
  already the official `--text-selection`; what changed is *where you reach it*.
  It used to sit in the advanced panel as a plain `variable-text` entry, and it
  stays `variable-text` on purpose: the official default is a `color-mix()`
  expression referencing `--interactive-accent`, so re-typing it as a
  `variable-themed-color` would have forced a hard-coded hex and silently broken
  "selection follows your accent colour". `text-selection` joined
  `MOVED_TO_CUSTOM` (58 names now) and the official-panel entry was removed, so
  there is still exactly one entry point. The old key
  (`ethereal-official-vars@@text-selection`) was checked against
  `obsidian-style-settings/data.json` before the move — no stored value existed,
  so nothing was lost when Style Settings drops it.
- **The store screenshot is now generated, not hand-captured.** `screenshot.png`
  was a 2505×1578 screen capture of an almost empty vault (placeholder notes,
  no styling on display) — neither the recommended 512×288 aspect ratio nor
  representative of the theme. It is now a 1024×576 render (the same 16:9 as
  512×288) produced against the **real** `app.css` + `theme.css` in headless
  Chromium, showing the theme's own features: the H1–H6 indicator labels, the
  per-level list markers, task checkboxes, the border-left quote box and an
  inline-code chip. `screenshot-dark.png` (same render, dark mode) was added
  alongside it. Both are reproducible via `.workbuddy-ai/verify/store-shot.cjs`.
- **Ghost horizontal inset default lowered from `0.3em` to `0.15em`**, so the
  ordered-list halo hugs the digits more tightly (measured at a 22px font: the
  level-1 halo's horizontal inset goes from −4.4px to **−1.1px**, i.e. 0.3em → 0.15em
  minus the 0.1em halo size). Applies to the edit view only; the reading view has
  no halo at all, because a native `::marker` cannot be given a background. Both
  the CSS default (`:root`) and the panel entry's reset value were updated, since
  Style Settings never injects defaults.

- **List alignment: the caret now takes priority over the symbol.** `Horizontal
  adjust` (`--list-ol-h-adjust`) drops from `0.35em` to **`0`**, and the unordered
  list's `Adjust amount` (`--list-bullet-h-adjust`) from `2px` to **`0`**, so the
  ordered-list and unordered-list carets line up exactly (measured: 0.00px apart at
  a 35px font size, from 10.25px before).

  The two things you might want to align — the *caret* and the *marker glyph* —
  are **mutually exclusive**, and this is geometry, not a matter of finding the
  right technique. A number is plain text, so its glyph and its caret occupy one
  coordinate: moving the glyph necessarily moves the caret. The unordered-list
  symbol is a pseudo-element drawn **centred on the marker point**, so it always
  sits ~0.5em left of its own caret. Lining the number up with the symbol
  therefore has to push the number's caret ~0.35em left of the unordered-list one,
  and it opens an equal-width gap between the number and the body text — the
  "unexplained blank space" this change removes. Measured breakdown of that gap at
  35px: 12.3px from the shift, 10.4px of pre-existing trailing-space padding.

  `--list-bullet-h-adjust` also changed **implementation**: it used to be
  `padding-inline-end: A` + `margin-inline-start: -A`. That keeps the net advance
  width at zero (so it never pushed the body text) but the negative margin shifts
  the `.list-bullet` element box, and with it the caret — which is exactly where
  the residual 2px caret offset came from. It is now a `translate` on the
  `::before` / `::after` pseudo-elements: pure paint-time displacement, leaving the
  element box, the caret and the text untouched. Verified by setting it to 4px and
  watching the symbol move 4px while the caret stayed put.

  Both sliders remain available: raising `Horizontal adjust` restores
  symbol-to-symbol alignment (accepting the caret offset and the gap), and raising
  `Adjust amount` moves the unordered-list symbol without disturbing anything else.
  The settings' descriptions now spell out the trade-off.

- **Two code defaults changed in the official-variable layer.**
  `--code-border-width` goes from the official `0px` to **`1px`**, and
  `--code-radius` from the official `var(--radius-s)` to **`6px`**. Both are set as
  real CSS defaults (`scripts/defaults.json` → `:root` / `body`, plus each panel
  entry's reset value), not merely as `@settings` defaults — Style Settings never
  injects defaults, so a panel-only value would have had no effect. Note that the
  official `--code-*` variables drive fenced code blocks as well as inline code, so
  both changes apply to both. The 1px border also fixes inline code being nearly
  invisible in dark mode, where `--code-background` (`#232323`) sits very close to
  `--background-primary` (`#1e1e1e`); its colour follows the official
  `--background-modifier-border`, so it adapts to light and dark on its own.
- **Inline code is driven by the official `--code-*` variables only.** An earlier
  draft of this feature added private `--inline-code-background` /
  `-border-width` / `-border-color` / `-radius` variables with their own settings
  rows; they duplicated what the official variables already provide, so they were
  dropped. The panel now carries a note pointing at the official Code group
  instead, and inline code has exactly one custom option (the hover toggle).
  Fenced code blocks (`pre > code`) and `code` elements in settings UIs are
  untouched either way.
- **One Live Preview artefact cleared.** Obsidian splits Live Preview inline code
  into several `.cm-inline-code` spans and gives the backtick "formatting" spans
  their own half-borders (`border-width: var(--code-border-width) 0 … 0`). At the
  official `0px` this is invisible, but at `1px` a backtick span nested inside the
  chip draws an extra vertical line *inside* it. The theme now zeroes border and
  padding on backtick spans nested inside another `.cm-inline-code`; the outer
  content span keeps its full box, and the older sibling layout is untouched.

### Fixed

- **`npm run gen:settings` crashed on every run.** A `defaults.json` override for
  a non-themed variable hit `defaultVal = ov` against a `const`, so the script
  died with `TypeError: Assignment to constant variable` before writing anything
  — it had been unusable ever since the themed-colour branch was added. The
  binding is now `let`.
- **`defaults.json`'s `_comment` key leaked into the generated CSS** as
  `--_comment: <the whole note text>;`. Keys starting with `_` are now skipped.
- **`checkbox-margin-inline-start` drift.** `defaults.json` said `1.3em` while the
  shipped theme (`:root` / `body` defaults *and* the panel's reset value) used
  `0.8em`, so regenerating would have silently moved every task checkbox.
  `defaults.json` now matches what actually ships. With these three fixed,
  re-running the generator reproduces the theme-default region exactly
  (88 declarations, zero drift).
- **Ordered-list numbers snapped back to the un-shifted position on the line the
  caret is on.** Obsidian's inline-decoration pass *skips any mark that
  intersects the selection* (`app.js`: `o = function(e,t){ return LL(n,e,t) ||
  OL(i,r,e,t) }` — `n` being the selection ranges — feeding
  `p = function(e){ if(c){ if(o(i,r)){ …only `always` decorations… } else { …all… } } }`),
  so a line whose marker intersects the selection never gets a `.list-number`
  span — only CodeMirror's raw `.cm-formatting-list-ol` wrapper around the source
  text. Because the horizontal shift was applied to `.list-number`, it had no
  effect there and the number fell back to the un-shifted position (then 0.35em
  further right, which is what made it visible as a "revert").

  **The affected lines are not just the caret's line.** `.cm-active` is attached
  only to `selection.head`'s line (`app.js`:
  `Zz = nn.line({ attributes: { class: "cm-active" } })`, applied per
  `lineBlockAt(head)`), whereas the suppression condition is per-range — so
  **drag-selecting across lines** strips `.list-number` from *every* line the
  selection covers while only one of them carries `.cm-active`. A first attempt
  keyed the fix on `.cm-active` and therefore still regressed during a drag; the
  rule is now keyed on the absence of `.list-number` itself, which covers the
  caret's line and every drag-covered line uniformly.

  The fallback layer also carries the per-level size and colour, so those lines no
  longer revert to source styling. Previously they did, which is what made the
  marker turn **grey** on the caret's line (`--list-marker-color` via app.css'
  `.cm-s-obsidian .cm-formatting-list`). Measured with a CDP probe comparing ink
  position and colour across an ordinary line, the caret's line and a
  drag-covered line (no `.cm-active`): offset **7.7px → 0.0px** and colour
  **`rgb(171,171,171)` → `rgb(43,68,144)`** in all cases (22px font). The halo is
  deliberately *not* reproduced on these lines — it needs the real `.list-number`
  box to draw its pill, and these lines are mid-edit, where showing source is
  Obsidian's native behaviour (the unordered list does the same).
- **The official list-colour variables are now labelled as superseded.** The
  theme's list styling consumes its own `--list-ul-marker-color-N` /
  `--list-ol-marker-color-N` first, with the official `--list-marker-color` only
  as a CSS fallback — and because those private variables always have a value
  (declared in `body.theme-light` / `body.theme-dark`), the fallback never
  resolves. Measured by injecting the official variable and watching for a
  change: `--list-marker-color` no longer affects any body-list marker (reading
  or edit view, ordered or unordered) and now only reaches **Bases** row numbers;
  `-hover` and `-collapsed` no longer reach the list markers either, since the
  unordered list's symbol and halo are fully theme-drawn. Rather than remove the
  entries (they are still official variables and the panel is meant to mirror the
  official set), each of the three now carries a `description` pointing at the
  Ethereal 定制 panel where the effective control lives. The notes are emitted by
  `scripts/gen-settings.mjs` from a new `EXTRA_DESC` map, so re-running the
  generator reproduces them instead of wiping them.

### Verification

- Settings structure: `validate-settings.mjs` (171 entries / 136 settings in the
  custom panel, 907 in the official panel, 0 errors) and a js-yaml parse check.
- CSS syntax: postcss parse plus a comment-block balance check — the settings
  validators only inspect the `@settings` YAML and cannot catch a broken CSS
  comment silently swallowing the rule that follows it.
- Visual: a mock Obsidian DOM rendered against the real `app.css` + `theme.css`
  in headless Chromium, light and dark, covering the nested / sibling /
  nested-with-inner-span Live Preview structures and fenced code blocks.
- Hover: driven through CDP (`Input.dispatchMouseEvent`) with computed styles
  read back, because static screenshots cannot trigger `:hover`. Confirms the
  overlay applies in reading view and both Live Preview layouts, and that turning
  the toggle off leaves the chip untouched.
- Selection: a CDP probe that really selects text confirms the highlight colour
  resolves from the official `--text-selection`, and that `::selection` keeps
  `border-radius: 0px` (unsupported) — the measurement behind dropping the radius
  option.
- Lists: a probe that renders both views against the real `app.css` + `theme.css`
  reports the per-level number size/colour actually applied (`1.1em` → `24.2px`
  at level 3, `#2B4490` in light), the halo pill's `border-radius: 999px` and its
  `scale(0)` → `scale(1)` reveal, and confirms `::marker` drops `background`,
  `padding` and `border-radius`. A second probe compares ink position **and
  colour** across an ordinary line, the caret's line and a drag-covered line
  without `.cm-active`, with a control group that disables the new rule: offset
  7.7px → 0.0px, colour `rgb(171,171,171)` → `rgb(43,68,144)`.
- Official list-colour variables: a CDP probe injects each of
  `--list-marker-color`, `-hover` and `-collapsed` in turn and reports which
  elements actually react, with the Bases row number as a positive control (it
  does change, confirming the injection path works). Confirms the first reaches
  only Bases, and none of the three reaches a body-list marker.
- Panel structure: `validate-settings.mjs` (171 entries / 136 settings in the
  custom panel, 907 in the official panel, 0 errors), plus a diff against the
  generator's output confirming the only change is the three added
  `description` lines.
- List alignment: a probe renders an ordered and an unordered list side by side
  against the real `app.css` + `theme.css` and reports, for each, the caret
  position (a collapsed `Range` at offset 0), the marker glyph's ink edges and the
  body-text left edge — read both from layout (`getBoundingClientRect`) and from
  the rendered pixels (a zero-dependency PNG decoder), since the unordered-list
  symbol is a pseudo-element and has no element box to measure. A configuration
  matrix over `left` values quantifies the trade-off and shows the caret and glyph
  alignments cannot both be zero. Final state: **caret offset 0.00px** (was
  10.25px), number-to-body gap 12.3px narrower. A separate probe sets
  `Adjust amount` to 4px and confirms the symbol moves 4px while the caret stays
  at 45.50px, verifying the `translate` implementation.
- Generator: re-running `gen-settings.mjs` into a scratch file reproduces the
  theme-default region exactly (88 declarations, zero drift).
- Community-directory compliance re-check against the current developer
  policies and theme submission requirements: `theme.css` contains **zero
  `https://` references, zero `@font-face` and zero `@import`** (the policy
  "Themes may not load assets from the network" is the one that gets themes
  removed), no client-side telemetry, no self-update, no obfuscation, no ads;
  `README.md` + `LICENSE` are in the repo root and the optional snippet's
  jsDelivr use is disclosed under *Optional: CJK web fonts*; `manifest.json`
  carries every required field (`name`, `version`, `minAppVersion`, `author`);
  `screenshot.png` is present in the root and matches the directory entry's
  `"screenshot": "screenshot.png"`.
- Version consistency: `manifest.json`, `package.json` and `versions.json` all
  read `1.4.3`, and the release tag is the bare `1.4.3` (no `v`), matching the
  directory's rule that the tag must equal `manifest.json`'s `version`.
- Panel structure re-read after the changes: `validate-settings.mjs` reports
  171 entries / 136 settings (custom) and 907 entries / 820 settings (official),
  `check-settings-yaml.mjs` parses both blocks under js-yaml with 0 type
  violations, and `check-css.cjs` passes parse + comment balance + all
  regression guards.

## [1.4.2] - 2026-09-14

### Added

- **Optional CJK web-font fallback, shipped as a snippet rather than in the
  theme.** The heading and internal-link fonts (`Source Han Serif SC VF`,
  `Source Han Sans SC VF`) and the H1 display face (`得意黑`) used to silently
  degrade to whatever the OS picked when not installed. A new
  `snippets/ethereal-web-fonts.css` (282 `@font-face` rules, ~360 KB) declares
  those **exact family names** with `src: local(…), url(…CDN…)` — an installed
  copy is used with zero network requests, a missing one is fetched from
  jsDelivr. Because the family names are unchanged, every existing `font-family`
  declaration *and* every already-saved user font setting gains the fallback with
  no edits. The faces are `unicode-range` subsets, so only the ranges actually
  used are downloaded (~80–104 KB each, then HTTP-cached); each `src` also lists
  a `fastly.jsdelivr.net` mirror as a second fallback. Generated by the new
  `npm run gen:webfonts` (`scripts/gen-webfonts.mjs`, idempotent, in-place
  between region markers).

  **Why a snippet and not `theme.css`.** Obsidian's developer policies list
  *"Themes may not load assets from the network"* under **Not allowed**, and
  state that non-compliant plugins and themes are removed from the directory.
  Ethereal is listed in the official community theme directory
  (`community-css-themes.json`), so `theme.css` must make no network calls at
  all — verified: it now contains **zero `@font-face` rules and zero `https://`
  references**. The remedy the policy points to (embedding assets as base64) is
  impractical here: the three CJK families total 12.6 MB of woff2, i.e. ~17 MB
  once base64-encoded, which would make `theme.css` 17 MB and re-parse it on
  every launch. Users who want the fallback copy the snippet into
  `.obsidian/snippets/` and enable it in Appearance → CSS snippets.

  Two constraints shaped the design, both verified against this Obsidian build:
  - **`@import` is not an option.** Obsidian's `index.html` ships
    `Content-Security-Policy: style-src 'unsafe-inline' 'self' https://fonts.googleapis.com`
    with no `font-src`/`default-src`. Remote stylesheets are therefore governed by
    `style-src` — jsDelivr CSS would be blocked, and the one allow-listed host
    (Google Fonts) is unreachable from mainland China. Font files, by contrast,
    fall under `font-src`, which is undeclared and thus unrestricted — so the
    `@font-face` rules must be inlined in the snippet and must point straight at
    the `.woff2`.
  - **`local()` still matches user-installed fonts** in this Chromium build
    (measured via `document.fonts.load()`; a bogus name correctly fails, so the
    probe discriminates). The spec permits user agents to ignore user-installed
    fonts for fingerprinting reasons, so if that ever changes the rules degrade
    gracefully to "always download" rather than breaking.

- **得意黑 (Smiley Sans) joins the fallback, and `h1-font` defaults to it.** The
  80-subset build from 中文网字计划
  (`cn-fontsource-smiley-sans-oblique-regular@1.0.1`, 1.11 MB across all subsets)
  is generated into the same snippet under the family name **`得意黑`** — the
  exact string `h1-font` already used, so no other declaration changed.
  `scripts/gen-webfonts.mjs` grew a per-font `pkg`/`version`/`cssFile` config and
  now normalises every source block: relative `url()` → absolute CDN URL, source
  family → target family, and **`font-display: swap` is forced on**. That last
  one matters: the upstream `font.css` omits `font-display` entirely, so it
  defaults to `auto` and a slow network would leave every H1 blank for up to 3 s
  instead of showing a fallback.

  A note on `local()`: it matches the font's **FullName or PostScript name, not
  its family name** (per spec). 得意黑 carries no English family name at all —
  its name table has `Family: 得意黑` only under Windows/zh-CN, with
  `TypoFamily: Smiley Sans`. Measured with `document.fonts.load()` against the
  installed copy: `local('得意黑 斜体')`, `local('Smiley Sans Oblique')` and
  `local('SmileySans-Oblique')` all resolve, while `local('得意黑')` and
  `local('Smiley Sans')` both fail. Only the three working names are emitted.
  Declaring the `@font-face` family as `得意黑` also sidesteps the ambiguity
  entirely: the family now resolves through the rule rather than depending on
  Chromium matching a zh-CN-only family name against a system font.

- **Checkbox group in 「Ethereal 定制」.** New `组件 Components → 复选框
  Checkboxes` group gathers every checkbox setting in one place: the two
  edit-view task-checkbox margins (行内起始 / 行内结束边距) plus the ten
  official checkbox variables (size, corner radius, colors and hover colors,
  border colors, marker color, start margin, completed-task decoration and
  color) moved out of the official panel. The trailing margin used to be
  hard-coded (`margin-inline-end: -0.1em`) in the task-list rule; it is now
  driven by `--checkbox-margin-inline-end`, with `-0.1em` kept as the CSS
  fallback so the look is unchanged when Style Settings is disabled.

### Changed

- **`h1-font` default is now `得意黑, Segoe UI` instead of `Segoe UI, 得意黑`.**
  Order matters: 得意黑 is now tried first, so Latin letters and digits in H1
  render in 得意黑's own glyphs rather than Segoe UI and the whole heading is one
  typeface. `Segoe UI` is kept as the fallback so headings still degrade sensibly
  when 得意黑 is unavailable (offline, with the optional snippet not enabled).
  Updated in all three places (`scripts/defaults.json`, plus the `:root` and
  `body` copies of the theme-default region) so a `gen:settings` re-run stays
  consistent.
- **The official panel no longer lists the checkbox group** — 「Ethereal 定制」
  is now its single entry point, consistent with the other moved variables.
  The moved-variable exclusion list grew from 47 to 57 names.

### Fixed

- **`gen:settings` could not run at all.** `MOVED_TO_CUSTOM` was referenced by
  the header template before its `const` declaration, so the script died with
  `ReferenceError: Cannot access 'MOVED_TO_CUSTOM' before initialization`. The
  set is now declared ahead of the emit phase. Groups (and whole categories)
  whose variables have all moved to the custom panel are skipped, so no empty
  heading is emitted for them.
- **`validate:settings` only checked the first `@settings` block**, silently
  skipping the 908-entry official panel. It now validates every block in the
  file and additionally reports setting ids that repeat across blocks — a
  duplicate id would make two settings share (and fight over) the same stored
  value.
- **The bold 「字重」 setting never showed up in the panel.** `bold-weight` shipped
  `default: 700`, which YAML parses as a *number*. Style Settings' `variable-text`
  renderer bails out on non-strings — its first statement is
  `if (typeof this.setting.default != "string") return console.error("... missing default value")`
  — so the entry was silently dropped (visible only as a console error). Quoted it
  as `default: '700'`. The sibling `em-weight` was unaffected because its default
  (`normal`) already was a string, which is exactly why only the bold group was
  missing a weight control.
- **`wiki-scale` carried `format: ×`, which emits invalid CSS.** `format` is
  appended verbatim to the emitted value, so touching that slider would inject
  `--wiki-scale: 1×` into `calc(var(--font-text-size) * var(--wiki-scale))` and
  break the internal-link font size. `bold-scale` / `em-scale` had already lost
  their `format: ×`; `wiki-scale` was missed. Removed there too.
- **`validate:settings` could not catch either of the above.** Being a
  zero-dependency parser that reads raw text, `700` and `'700'` both look like the
  string `"700"` to it, so its "variable-text default must be a string" check
  always passed. It now reconstructs the YAML scalar type (`yamlScalarType()`),
  requires `variable-number` / `variable-number-slider` defaults to be numbers,
  and rejects `format` values that are not a plain CSS unit. The js-yaml companion
  check (`check-settings-yaml.mjs`) gained the same type validation.
- **The bold weight default never actually applied.** `--bold-weight: 700` was
  declared on `:root`, but `app.css` declares the same variable on `body`
  (`body { --bold-weight: calc(var(--font-weight) + var(--bold-modifier)) }`).
  Custom properties resolve by nearest-ancestor inheritance, so `strong` /
  `.cm-strong` always picked up the `body` value — the `:root` declaration was
  dead code and the `700` fallback in the theme's own `strong` rule never fired,
  leaving bold text at `400 + 200 = 600`. The default is now declared at `body`
  level, which ties with the official rule on specificity and wins on source
  order (the theme is written into a `<style>` at the end of `<head>`, while
  `app.css` is an earlier `<link>`). User values from Style Settings still win:
  they land in `body.css-settings-manager`, one class more specific. Note this
  literal overrides the official `calc()`, so the official panel's
  「◉ 粗体修饰符」 no longer affects body bold — it duplicates the custom
  「字重」 control anyway; declaring `--bold-modifier: 300` here instead
  (`400 + 300 = 700`) would keep that knob alive.

---

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
