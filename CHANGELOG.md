# Changelog

All notable changes to this theme are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project follows [Semantic Versioning](https://semver.org/).

## [1.5.7] - 2026-10-06

**Overview.** A small release that folds four values the author had been
carrying as personal overrides into the theme's own defaults — the dot
lattice's spacing, the note-area background's scroll-with-document behaviour,
and the ribbon's width and padding — so a fresh install starts from the look
the theme is actually designed around instead of from the generic values. It
also fixes a rule that had quietly stopped matching: Obsidian renamed the
ribbon's side modifier, so the theme's "hide the ribbon border" rule had become
dead code and the divider was showing again.

**功能构建.** 四项默认值固化：点间距 20 → **40**、「随文档滚动」默认**开启**、
功能区宽度 42px → **38px**、功能区内边距 → **`10px 0px 6px 0px`**。
**错误修复.** 功能区右侧分隔线未被隐藏 —— Obsidian 已把 ribbon 的修饰类从
`mod-left` 改为 `mod-primary`，原选择器不再匹配任何元素。

**默认值变更.**

| 设置项 | 面板 | 旧默认值 | 新默认值 |
| --- | --- | --- | --- |
| `ui-background-dot-spacing` | Ethereal 定制 | `20` | **`40`** |
| `ui-background-scroll` | Ethereal 定制 | 关 | **开** |
| `ribbon-width` | Ethereal 官方变量 | `42px` | **`38px`** |
| `ribbon-padding` | Ethereal 官方变量 | `10px 2px 10px 2px` | **`10px 0px 6px 0px`** |

**功能构建.**

- **点间距默认值 20 → 40.** 「Ethereal 定制 → 界面 → 背景 → 点阵」的「点间距」
  默认值翻倍。**两处必须同时改**：面板条目的 `default:`（只影响「重置」按钮回填值）
  与 CSS 里的回退值 `--ui-bg-dot-spacing-current: var(--ui-background-dot-spacing,
  40px)`（**真正生效**的那一处）。Style Settings 从不注入默认值，所以只改面板
  等于没改；只改 CSS 则「重置」按钮会把值填回 20。
- **「随文档滚动」默认关闭 → 默认开启.** 该开关是 `class-toggle`，它的「默认值」
  不在 CSS 里，而在面板条目的 `default:` —— 插件据此把设置项 id 作为类挂到 `body`
  （`body.ui-background-scroll`），CSS 再把 `--ui-bg-attach` 从基线的 `scroll`
  翻成 `local`。因此这里**只动面板 `default: false` → `true`**；基线 CSS 保持
  `scroll` 不动，否则开关一旦关掉就没有可回退的状态。条目的中英文说明也同步改写
  （原文写着「默认关闭」，不改就是在撒谎）。
- **功能区几何：宽度 42px → 38px，内边距 `10px 2px 10px 2px` → `10px 0px 6px 0px`.**
  这两项是**官方变量**，按既有规矩三处同步：`scripts/defaults.json`（数据源）、
  `theme.css` 的「主题默认值（官方变量层）」`:root` + `body`（**真正生效**）、
  官方面板对应条目的 `default:`（只影响重置按钮）。改完用生成器对账，
  「主题默认值」区域的 `--*` 声明集合与 `theme.css` **零漂移**。

**错误修复.**

- **功能区右侧分隔线重新露出来了。** 「VS Code 布局」区块里那条「隐藏功能区边界」
  的规则写的是 `.workspace-ribbon.side-dock-ribbon.mod-left` —— 而 Obsidian
  已经不再给功能区挂 `mod-left`：官方 `app.css` 里功能区的修饰类只剩
  `.mod-primary`（可见的那个）与 `.mod-secondary`，`mod-left` 在该元素上
  彻底消失（`mod-left` 这个名字在别处仍存在，比如 `.sidebar-toggle-button.mod-left`，
  所以肉眼 grep 很容易误判成「类还在」）。选择器因此永不匹配，官方
  `.workspace-ribbon { border-inline-end: … }` 的分隔线照常显示，
  而**这条规则失效不会有任何报错** —— 与「类名契约」那类事故同源：
  设置项 / 元素的类名一旦改名，写死类名的选择器就静默变死代码。
  修法是退回到只依赖 `.workspace-ribbon` 本身。
- **同类隐患的排查结论：主题里其余 `mod-left` / `mod-right` 用法不受影响** ——
  它们选中的是 `.workspace-split`、`.sidebar-toggle-button`、`.titlebar-button-container`
  这些仍然带该修饰类的元素，本次不动。

定制面板计数不变（**219 项 / 178 设置**），官方面板亦不变（**896 项 / 809 设置**）——
本次只改默认值，未增删任何设置项。

## [1.5.6] - 2026-10-05

**Overview.** Hovering an entry in Obsidian's settings sidebar did nothing at
all — Obsidian paints a background only for the *active* tab, so the row under
the cursor stayed completely inert. A new switch under
「Ethereal 定制 → 界面 → 标签页与窗口」 gives that row the hover background the
moment the pointer lands on it. It is on by default, and it is deliberately the
plainest effect possible: background colour only, no transition, no movement.
The theme therefore still contains **no `transition` at all**.

**功能构建.**

- **设置侧边栏悬停底色（新增开关，默认开启）.** 入口：「Ethereal 定制 → 界面 →
  标签页与窗口 → 设置侧边栏悬停底色」（id `settings-nav-hover-highlight`）。
  原生 `.vertical-tab-nav-item` 只有 `.is-active` / `.mobile-tap` 才带底色，
  桌面端鼠标悬停**没有任何反馈** —— 这正是用户报的原始问题。开启后：指针移入
  即显示官方 `--background-modifier-hover` 底色。它与 `.is-active` 用的是同一个
  token，因此「悬停」与「选中」共用一套视觉语言，明暗也由 token 自己适配，
  不需要额外的明暗分档。
- **即时响应：只有底色，没有过渡、没有位移.** 反馈必须「指针一到就看得见」——
  最终规则只有一条 `:hover { background-color }`；底色在指针移入的那一帧就位，
  没有任何缓动延迟。位移也一并去掉了（见「错误修复」）。
- **限定在支持悬停的设备上.** 整块规则包在 `@media (hover: hover)` 里：
  触屏上 `:hover` 会「粘住」，不该有悬停态。
- **可关.** 关掉开关即回到原生「悬停毫无反应」的状态 —— 与主题其它
  `class-toggle` 一样，开关只挂一个 body 类（`body.settings-nav-hover-highlight`），
  关掉后 CSS 完全不匹配。

**设置项变更.**

| 操作 | 设置项 | 说明 |
| --- | --- | --- |
| 新增 | `settings-nav-hover-highlight` | 「设置侧边栏悬停底色」（`class-toggle`，默认开启） |

定制面板计数由 218 项 / 177 设置变为 **219 项 / 178 设置**。

**错误修复.**

- **1.5.5 及更早版本没有需要修复的线上问题**，本版也不改变任何既有行为；
  下面两条是本次开发过程中自查发现、并在发布前就改掉的隐患，记在这里以防回流：
  - **悬停反馈慢半拍.** 第一版把底色做成 140ms 淡入，指针移入后要等过渡跑完
    才看得清，与「及时响应」的要求相反 —— 已改为无过渡的即时底色。
    真机逐帧采样核对：悬停首帧（t≈0）底色就已到终值，此后每一帧不变，
    `getAnimations()` 为空。
  - **横向溢出隐患.** 第一版还让图标与标题右移 3px。位移一旦落在条目本身，
    `.vertical-tab-header` 的 `overflow-y: auto` 会让 `overflow-x` 也计算成
    `auto`，右侧可能凭空冒出横向滚动条。最终方案**完全不做位移**，隐患随之消失
    （真机实测日间/夜间两态横向溢出均为 0px）。
- **两条都进了体检守卫（`check-css.cjs`）**，且这次是**反向守卫**：一旦
  `settings-nav-hover-highlight` 相关规则里再出现 `transition` / `animation` /
  `transform`，或出现非 `:hover` 的残留规则，即判定为回归。教训：守卫是需求的快照，
  需求从「必须有过渡」变成「必须没有过渡」时，守卫本身也得跟着反过来，
  否则它会开始保护错误的东西。

## [1.5.5] - 2026-10-01

**Overview.** The dot lattice now offers a single shape — the circle — and the
grid no longer distinguishes heavy from fine lines. Both changes remove features
whose upkeep cost outweighed their use, and in the grid's case they fold four
settings into two. Along the way the dot lattice's remaining teardown exposed a
subtle bug in how the circle was selected, and the background group moved up the
panel so it sits with the other appearance settings.

**功能构建.**

- **点阵只保留圆形，移除方形 / 菱形两种点形.** 「界面 → 背景 → 点阵」下的
  「点的形状」设置项一并删除（该设置项原为三选一：圆形 / 方形 / 菱形）。
  被删的两种点形与「随文档滚动」存在**固有冲突**，三项要求无法同时满足：
  ① 点要清晰 → 不能用 `mask`（其 alpha 抗锯齿柔化，点尺寸小时边缘被插值冲淡到
  几乎不可见）；② 覆盖范围要对（含顶部内联标题、不含滚动条、不受「缩减栏宽」影响）
  → 宿主不能是内容容器；③ 图案要随内容滚动 → `background-attachment: local`
  要求宿主**自身就是滚动容器**。①排除滚动容器、②排除内容容器，只剩不滚动的外壳，
  与③直接矛盾。圆形没有这个问题：单层 `radial-gradient` 直接写在滚动容器**自身**上，
  透明底、无底色、边缘锐利，两种附着模式天然都支持。
  点阵的间距、大小、颜色、不透明度与偏移滑杆全部保留，观感不变。

- **网格不再区分粗细线，改为单一线宽.** 原先「每 N 格画一条粗线」，粗细两层各带
  一个不透明度，共 4 个设置项；现在横竖同宽，只由一个新设置项决定。规则同步从
  4 层渐变（粗线两条 + 细线两条）简化为 **2 层**（横竖各一条）。
  `background-size` 仍取**间距**、线宽只进渐变的硬停点，两者解耦 ——
  实测线宽 1 / 3 / 5px 时，竖线实测宽精确为 1 / 3 / 5px，而线间距恒为 20px，
  即**调粗细不会改变格子尺寸**。

**设置项变更.**

| 操作 | 设置项 | 说明 |
| --- | --- | --- |
| 删除 | `ui-background-dot-shape` | 「点的形状」（圆形 / 方形 / 菱形三选一） |
| 删除 | `ui-background-grid-major-every` | 「每 N 格一条粗线」 |
| 删除 | `ui-background-grid-major-opacity` | 「粗线不透明度」 |
| 新增 | `ui-background-grid-line-width` | 「线条粗细」默认 1px、范围 1–5px、步进 0.25px |
| 改名 | `ui-background-grid-opacity` | 「细线不透明度」→「线条不透明度」（id 不变） |
| 改名 | `ui-background-grid-color` | 「网格线颜色」→「线条颜色」（id 不变） |
| 改描述 | `ui-background-grid-size` | 「细网格的格子边长」→「单个格子的边长」 |

被改名的两个设置项 **id 未变**，已存的用户自定义值不受影响；被删的三个 id 会成为
无用残留（无害）。定制面板计数由 220 项 / 179 设置变为 **218 项 / 177 设置**。

**参数与面板.**

- 点大小滑块的默认值 `2` → **`2.5`**，范围 `1–20` → **`1–5`**，步进 `0.5` → **`0.1`**。
  原先上限 20px 远超实际可用范围，收窄后拖动能更精细地停在常用尺寸上。
  CSS 里的兜底默认值 `--ui-bg-dot-size-current` 同步改为 `2.5px`，
  保证未装 Style Settings 时的观感与面板默认一致。
- 「界面」下的 L2 分组「**背景**」上移到「**编辑与光标**」之前，与其它外观类设置相邻。

**错误修复.**

- **移除方形 / 菱形后，圆形点阵也一起消失了.** 点阵规则的选择器要求
  `.ui-dot-circle` 类，而**这个类正是由「点的形状」class-select 设置项挂到 `body` 上的**
  —— 设置项一删，类不再被挂上，选择器永不匹配，连圆形点阵一并失效（无报错、无提示）。
  修法是让选择器只按 `.ui-bg-dots` 选中：现在只有圆形一种点形，不再需要任何「形状」类。
  这条也解释了另一处历史问题：`class-toggle` / `class-select` 设置项挂出的类名与选择器
  里的类名是**必须成对维护的契约**，删设置项时必须一并检查依赖它的选择器。

- **网格线原先无法控制粗细.** 旧实现的线宽是硬编码的 `1px`（粗线同样是 `1px`，
  仅靠颜色不透明度区分），所以「粗线」看起来只比细线深、并不更粗。现在线宽成为
  真正的可调项，且与间距解耦。
## [1.5.4] - 2026-09-30

**Overview.** A new 「Ethereal 定制 → 界面 → 背景」 group gives the main-area
Markdown panes a background of their own: three drawn patterns (solid / grid /
dots) plus a background image with fit, position and opacity. The drawn patterns
can either stay pinned to the pane or **scroll with the document**, and a pair of
offset sliders nudges their starting position. The patterns are pure CSS; the
image is a variable only, because theme CSS cannot reach a file inside the vault.

**功能构建.** 「界面」下新增 L2 分组「背景」，含四个 L3 子组：绘制背景、网格、点阵、
背景图片，共 21 个设置项（定制面板 194 → 220 项 / 158 → 179 设置）。作用域刻意
收在主区域的 Markdown 笔记窗格，侧边栏、其它 `data-type` 与悬浮预览都不受影响。
网格为「细线 + 每 N 格一条粗线」，两者的颜色与不透明度各自可调；点阵提供圆形 /
方形 / 菱形三种点形，另有间距、大小、颜色、不透明度；绘制背景另有「随文档滚动」
开关与水平 / 垂直两个初始偏移滑杆。

**分层与宿主（这一版的关键改动）.** 背景分两层画：「纸面」层仍是
`.view-content`（官方在此声明 `--background-primary`），放白板纯色、背景图片与
veil；**图案层则改挂到真正滚动的那个元素上** —— 编辑视图是
`.cm-editor > .cm-scroller`，阅读视图是 `.markdown-reading-view >
.markdown-preview-view`。改挂的理由有两条：一是 `.view-content` 自己**不滚动**
（滚动发生在上面这两个后代里），挂在它上面时 `background-attachment: local`
等于死设置；二是后代元素天然画在祖先背景之上，图案因此稳定地叠在图片层上方。
两态只差 `background-attachment` 一个属性（`scroll` / `local`），默认 `scroll`。

滚动容器是查证过的：`.cm-scroller` 的纵向滚动来自 CM6 baseTheme 的
`overflow-x: auto`（另一轴的 `visible` 会**计算成 auto**）—— 这段在 `app.js` 里，
`app.css` 查不到；阅读视图的 `.markdown-preview-view` 则是 `app.css` 明写
`overflow-y: auto`，其高度来自官方在 `app.js` 里给 `.markdown-reading-view` 打的
**内联** `width/height: 100%`。

**验证.** 用「图案像素剖面互相关」量化，不靠肉眼：图案测试色取纯红、在右侧无文字区
取纵向 / 横向剖面，两张截图（`scrollTop` = 0 与 137）求最佳位移。实测两个视图都满足：
关闭开关时位移 ≡ 0，开启时 ≡ −137px（间距 20px 下 ≡ 3px）；偏移滑杆设 7/13 时
x/y 位移分别 ≡ 7 与 ≡ 13。另有一项附带结论：两态在 `scrollTop = 0` 的相位差为
**0px**，即拨动开关不会让图案跳一下。工具为 `bg-scroll-probe.cjs`（探针）、
`bg-shot.cjs` / `bg-shot.sh`（27 个用例）、`mutate-bg.cjs`（8 条不变量的变异验证）。

**错误修复.** 「随文档滚动」开关拨了没反应。Style Settings 的约定是 **`class-toggle`
加的类名 = 设置项 id**（`class-select` 加的才是 option 的 value），这个开关的类名在 CSS
里写成了 `ui-bg-scroll`，与 id `ui-background-scroll` 对不上 —— 类照样被加到 `body` 上，
只是没有任何规则匹配它，**不报错、不警告，功能整个失效**。现已改正；并补上两道防线
（`check-css.cjs` 的「类名对齐」通用守卫、mock 改用从 `theme.css` 抽出的真实类名），
同类错误不会再静默溜过去。

**已知限制（已写进面板说明）.**
- 方形与菱形点阵的底色不透明，会盖住背景图片；想让图片透出来请用圆形。
- 背景图片只能填 CSS 图片值（base64 data 地址或网络地址）。Obsidian 的主题 CSS
  读不到库内文件 —— `file://` 与 `app://local/` 均被应用层拦截，官方文档只认可
  base64 内嵌。想直接选仓库里的图片，需配合 *CSS Resource Variables* /
  *Style Context* 这类插件，把图片映射到同一个变量名 `ui-background-image`。
- 「随文档滚动」只作用于绘制图案：白板是纯色，背景图片始终固定在窗格上
  （`cover` 图片若跟着滚，会被拉伸到整条文档长度）。

### Added

- **Note-area background (「Ethereal 定制 → 界面 → 背景」).** Three drawn
  patterns — **solid**, **grid** (fine lines + a heavier line every N cells) and
  **dots** (circle / square / diamond, with spacing, size, colour and opacity) —
  painted on the main-area Markdown panes only, plus an optional background
  image with fit / position / opacity.
- **Scroll with document** (`ui-background-scroll`) and two **offset** sliders
  (`ui-background-offset-x` / `-y`, ±200px). The pattern layer lives on the
  element that actually scrolls — `.cm-editor > .cm-scroller` in the editor,
  `.markdown-reading-view > .markdown-preview-view` in the reading view — so the
  toggle is nothing more than `background-attachment: scroll` (default, pinned to
  the pane) versus `local` (travels with the text). Being a descendant of
  `.view-content` is also what keeps the pattern *above* the image layer.
- The 「纸面」 layer stays on
  `.workspace-split.mod-root .workspace-leaf-content[data-type="markdown"] > .view-content`:
  the element that already carries the official `--background-primary`. Its
  reading-view background is made transparent so it cannot cover the pattern;
  both layers are `var(--background-primary)`, so the baseline rule is a visual
  no-op when the feature is off (verified by screenshot with and without Style
  Settings).
- Image opacity is a page-coloured veil layered between the pattern and the
  image, so fading the image never fades the pattern.
- Square and diamond dots use the dot colour as the base and cover everything
  else with opaque page-coloured gradients — plain gradients cannot produce an
  arbitrarily sized, arbitrarily spaced square or diamond (two `linear-gradient`
  bands only ever intersect as a cross, and a `conic-gradient` quadrant is locked
  to half the tile). The cost is stated in the panel: those two shapes cover a
  background image.
- `check-css.cjs` gained regression guards for the layer: the baseline image rule
  must stay unconditional (scoping it to a mode class would silently kill the
  background image whenever 「绘制背景」 is 「无」); every pattern rule must target
  the scrolling containers rather than `.view-content` (both the "above the
  image" and the "scrolls with the document" behaviours depend on it); each
  pattern's `background-attachment` / `background-position` must stay
  variable-driven; the defaults must be `scroll` + `body.ui-background-scroll → local`;
  and the reading-view transparency rule must keep its direct-child chain so
  embedded notes are not affected.

### Changed

- The drawn pattern moved from `.view-content` to the scrolling containers
  (`.cm-editor > .cm-scroller` / `.markdown-reading-view > .markdown-preview-view`).
  No visual change when 「随文档滚动」 is off — both hosts share the same origin
  and size — but it is what makes the new toggle possible.
- README panel counts: 「Ethereal 定制」 194 entries / 158 settings → **220 / 179**.
- The 「UI」 row in the panel map now lists the Background sub-groups.

### Fixed

- **「随文档滚动」拨了没反应。** Style Settings 的约定是 **`class-toggle` 加的类名 =
  设置项 id**，而 `class-select` 加的才是 option 的 value；这个开关的类名在 CSS 里写成了
  `ui-bg-scroll`，与 id `ui-background-scroll` 对不上 —— 类照样被加到 `body` 上，
  只是没有任何规则匹配它，**不报错、不警告，功能整个失效**。现已改正。
- 为了不再犯：`check-css.cjs` 新增一条**通用守卫**，遍历两个面板的全部
  `class-toggle` / `class-select`，逐个确认「插件会加的类名」在 CSS 里真的被引用
  （当前 28 个，白名单只放 `ui-bg-none` —— 它靠「其它模式类都不存在」表达）；
  `mutate-bg.cjs` 加了对应的变异体；`bg-shot.cjs` 也改成**从 `theme.css` 的
  `@settings` 里读真实类名**再做白名单校验，写错直接报错退出 ——
  这次之所以本地全绿而真机失效，正是因为 mock 里用的也是那串错名字。

## [1.5.3] - 2026-09-30

**Overview.** A status-bar-only release, with no new settings: the bar keeps a
single height from the first paint to the last plugin registration, and nothing
that loads later can move it. The settled look is unchanged — 26px is where the
bar already ended up on a normal vault — but it no longer ramps up to it.

**功能构建.** 本次不新增功能，也不新增设置入口；状态栏几何改由两条**无条件规则**定义：
高度预留 `.status-bar { min-height: 26px }`（22px 图标条目 + 上下各 2px），条目封顶
`.status-bar-item { max-height: 22px }`。不做成开关是有意的：条目封顶之后，「不预留」
那一态只在整条栏连一个图标条目都没有时才看得出来（纯文字条目 22px / 空栏 18px），
对绝大多数库来说是个死设置。

**错误修复.** 启动过程中状态栏「先窄后宽」。用 CDP 对真实启动逐帧采样（冷启动 + 重载各一次）
定位到两段跳变：① 主题 CSS 比首绘晚 30–200ms 落地，空栏先从官方 18px 变成本主题的 26px；
② 插件条目注册到位时整条栏从 26px 被撑到 34px —— 提词器插件的条目里包了一个 24px 的
`.clickable-icon` 按钮（上下各 4px + 16px 图标），条目自身再加 3px×2 = 30px，而
`.status-bar` 默认 `align-items: stretch` 会把最高条目应用到同排每一个条目。现在 ② 彻底
消失，① 只剩首绘附近约一帧的交接（任何用 CSS 预留高度的主题都躲不掉，除非把状态栏压回
官方 18px）。

### Fixed

- **Status-bar startup jump (先窄后宽).** Two changes, both measured against
  Obsidian 1.13.7 with the official `app.css` + this `theme.css`:
  - `.status-bar` reserves `min-height: 26px` (22px icon entry + the theme's 2px
    padding), so no entry registration can move it. Official app.css renders
    18px (empty) / 27px (text entry) / 31px (icon entry); the theme is a constant
    26px in all three states.
  - `.status-bar-item` is capped at `max-height: 22px`. Without the cap a plugin
    entry that grows taller takes the whole bar with it: a teleprompter entry
    (Glimpse) wraps a 24px `.clickable-icon` button (4px padding + 16px icon),
    its own 3px padding makes that 30px, and `.status-bar`'s default
    `align-items: stretch` drags every sibling entry to the same 30px — the bar
    went to **34px** ~840ms into the boot, which is the jump users actually saw.
    `max-height` is a different property from `height`, so plugin CSS loading
    later cannot undo it — even a declared `height: 30px !important` stays
    clamped (verified in the mock); only a plugin declaring its own
    `max-height` / `min-height` can push past it. It caps the box without
    clipping content (`overflow` stays visible), so icons still render.
    Sampled timeline after the fix: 18px (official, pre-theme) → 26px when
    `theme.css` lands → 26px for every later entry, including that one.

  Both rules stay unconditional — no Style Settings switch. A switch that turns
  the reservation off can only differ once the bar has no icon-bearing entry at
  all (22px text-only / 18px empty), which is not a state most vaults reach; the
  capped entry height makes the reservation the only sensible shape, so the
  panel keeps one fewer dead option.

## [1.5.2] - 2026-09-28

**Overview.** Two vault snippets join the theme as self-contained merged
layers, and their looks become the theme defaults: `Callout.css` as the third
layer (settings under 「Ethereal 定制 → 组件 → Callouts」) and
`Blank-line-hide.css` as the fourth (settings under 「Ethereal 定制 → 正文排版 →
段落」). Eleven official layout/title/content callout variables moved from the
official panel into the custom panel — a single entry point — with six of them
re-defaulted to the snippet's look; eight theme-owned callout variables add
controls the official set has no knob for, and the blank-line compression
gained a height slider plus a native-restore toggle. The settings validator
learned to parse `variable-select` `options:` lists.

**功能构建.** 吞并 Callout.css 与 Blank-line-hide.css 为「Callout片段」「空白行
片段」两层；官方 callout 布局/标题/内容变量 11 项上收定制面板并改写 6 项默认值，
另增 8 项主题自有设置与两个开关；「段落」分组新增空白行行高滑杆（0–2em，默认
0.5em）与原生恢复开关。
**错误修复.** 校验脚本此前会把 `variable-select` 的 `options:` 子列表误判为
独立的 id-less 设置项（报出成堆 "entry missing id" 与虚假重复 id），已修复并
补齐选项完整性校验。

### Added

- **Callout layer** (「Ethereal 定制 → 组件 → Callouts」, 21 new entries; the
  fourteen per-type colours such as `callout-tip` remain in the official panel).
  The snippet's rules were merged verbatim at the end of `theme.css` under
  `/* #region Callout片段 */`, with three integration decisions:

  - **Official variables carry the look.** The container's border, radius and
    padding and the title/content paddings, colours, sizes and weights are
    consumed by Obsidian's own callout rules, so the layer re-declares none of
    them — it only re-defaults six via `scripts/defaults.json` → the
    「主题默认值（官方变量层）」region: `--callout-radius: 6px`,
    `--callout-padding: 0px`, `--callout-title-color: var(--text-normal)`,
    `--callout-title-padding: 4px 12px`, `--callout-title-weight: 600`,
    `--callout-content-padding: 0px 12px`. Because they are panel settings too
    (◉), every one of them stays user-tunable in one place.
  - **Theme-owned variables are declared on `body`, not `:root`.** Their values
    reference element-scoped variables — `--callout-color` is defined per
    callout on `.callout`, so a `:root`-declared default would substitute on
    `html`, find nothing, and silently invalidate (custom properties compute
    where they are declared, not where they are consumed). `body` sees every
    global variable and is also where Style Settings injects, so the defaults
    remain overridable. The title's tint therefore lives in the rule itself —
    `color-mix(in oklch, var(--callout-color) var(--callout-title-bg-alpha),
    transparent)` — where `--callout-color` resolves per element, driven by an
    injectable percentage slider (「标题底色浓度」, default 20%, 0% removes it).
  - **The width-adaptive geometry is preserved with its full measurement
    record** (2026-09-22, Obsidian 1.13.7 + Chrome 150): reading view keeps
    `display: inline-block`, the edit view uses `display: block` +
    `width: fit-content` — the same shrink-to-fit formula, widths identical to
    the pixel — which keeps CM6's line-height table consistent because the
    widget is a real block (the old inline-level widget hung a ~10px strut
    descent below itself and shifted every following line). The minimum-width
    floor stays on the `.cm-callout` widget, where `min(200px, 100%)` resolves
    against the full line instead of the shrunken box.

  The eight theme-owned settings: minimum width (`min(200px, 100%)`), title
  tint opacity, title font stack, title alignment (`variable-select`, centre by
  default — `flex-start` is the official look), icon/title gap, icon colour,
  and two class toggles: **撑满整行** `callout-full-width` (off by default; on
  restores the official full-width geometry) and **显示 tip 标注图标**
  `callout-show-tip-icon` (the merged snippet hides the `tip` callout's icon by
  default; written as `body:not(.callout-show-tip-icon)` so the hidden default
  also holds without Style Settings). The snippet's two virtual types survive:
  a callout type containing `empty` loses its whole title bar, `notitle` only
  its title text; the dormant `body.shade-callout-style` compat rule is kept
  for Style-Manager-style class toggles.

- **Blank-line layer** (「Ethereal 定制 → 正文排版 → 段落」, 2 new entries).
  The snippet compresses blank lines in the live-preview edit view — a line
  holding only a line break shrinks to `--blank-line-height` (0.5em by
  default), and so does any line sitting directly before or after a blockquote,
  callout or heading, even a non-blank one (selector kept verbatim). The rules
  are gated on `body:not(.blank-line-native)` — the inverse-class pattern, so
  the compressed default also holds without Style Settings, and the
  **空白行恢复原生** toggle (`blank-line-native`, off by default) restores
  native full-height blank lines. The height is a 0–2em slider (step 0.05em):
  0 hides blank lines completely, a value near the line height (e.g. 1.8em) is
  close to the native look. The snippet's `--hover-color` definition ships
  verbatim even though nothing consumes it, as insurance for external tools
  that might read the variable name.

### Fixed

- **Validator support for `variable-select` options.** `parseEntries` used to
  treat each `value:`/`label:` item under `options:` as an id-less entry,
  producing bogus "entry missing id"/duplicate-id errors; it now attaches them
  to `entry.options` (indent-aware, working for both panel indent styles) and
  `variable-select` entries are checked for a non-empty options list where
  every item has `value` and `label`.

### Changed

- **Panel accounting.** 「Ethereal 定制」171 → 194 entries / 136 → 158 settings;
  「Ethereal 官方变量」907 → 896 / 820 → 809. The eleven moved ids are recorded
  in `MOVED_TO_CUSTOM` (scripts/gen-settings.mjs) so a re-run of
  `npm run gen:settings` skips them in the official panel, same as the
  checkbox/text-selection moves before.
- **Vault config.** The original `Callout.css` snippet was disabled in the
  vault's `appearance.json` (`Blank-line-hide.css` was already off) — snippets
  load after themes, so leaving one on would override the new panel settings;
  the files themselves stay in `.obsidian/snippets/` for reference, like
  `Custom.css` and `List.css`.

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
