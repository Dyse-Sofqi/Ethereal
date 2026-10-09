# Debug Log

排查记录：只写**怎么找到的** —— 症状、复现条件、试错路径、被证伪的假设、真因与证据。
「改了什么」记在 [CHANGELOG.md](CHANGELOG.md)，两者不重复。

倒序排列，最新在上。

---

## 2026-10-09 · 标注（callout）在实时预览下超出可读行宽 + 内部长内容不换行

**结论**：官方 app.css 对 `.cm-callout` 写了 `overflow-wrap: normal`，不可断行的内容顶住了
`width: fit-content` 的 min-content 下限。修复要**两条一起上**：`.cm-callout` 补
`max-width: 100%`（夹宽度）+ `overflow-wrap: break-word`（让它折行）。

> 这一条是**同一个缺陷的两半**，分两轮才做完：用户先报「宽度超出」，修完宽度后接着报
> 「里面的内容没有正常换行」—— 因为第一轮只加了 `max-width`，长 URL 被夹在 720px 里
> 走**横向滚动**而不是换行。两半的记录都留在下面。

### 症状

- 第一轮：「callout 的最大宽度超出了定制的行宽 `--file-line-width`」；
- 第二轮：「callout 里面的内容没有正常换行」。

两轮都只有一句话，没说哪个视图、什么内容。**先量再改**。

### 复现条件

- **只在实时预览**（阅读视图同一份笔记全部正常）；
- 内容里得有**不可断行**的东西：长 URL、长单词、连续西文串；
- 普通长段落、短内容、表格、代码块都**复现不出来**（这几类实测都正好 = 可用行宽）。

### 定位过程

先写 `verify/callout-width-probe.cjs`（隔离迷你库 + CDP，跑前把根 `theme.css` 同步进
迷你库，免得测到陈旧副本），用一份含 7 种内容的笔记 dump 每级容器的 used 宽度，
并造一个 `width: var(--file-line-width)` 的探针盒拿到行宽像素值。

第一轮没把窗口撑宽（窗格 592px < 行宽 720px），量出的 `delta` 是相对**行宽**算的，
读起来像「所有 callout 都偏窄」，不好判读。第二轮用
`Emulation.setDeviceMetricsOverride` 把视口改成 1500×950，让行宽成为真正的约束，
改判据为 `over = w − min(--file-line-width, 父元素可用宽)`，一眼就能看出谁溢出。

真机数据（视口 1500×950，行宽 720px）：

| 内容 | 编辑态 `.cm-callout` | 阅读态 `.callout` |
| --- | --- | --- |
| 长段落 | 720 | 720 |
| 短 | 200 | 200 |
| 表格 | 285 | 285 |
| **长单词** | **762.4**（超 42.4） | 720 |
| 超宽表格 | 720 | 720 |
| 长代码行 | 720 | 720 |
| **长 URL** | **1044.3**（超 324.3） | 720 |

### 真因

两条规则相乘：

1. 主题的 `.markdown-source-view.mod-cm6 .cm-callout { width: fit-content }`（宽度自适应）；
   `fit-content` = `min(max-content, max(min-content, stretch))` —— **收缩下限是 min-content**；
2. 官方 app.css 3742–3748 行对 `.cm-callout`（同组还有 `.cm-html-embed`、`.cm-table-widget`）
   显式写了 `white-space: normal; overflow-wrap: normal; word-break: normal` ——
   长 URL / 长单词**不会折行**，于是 min-content 就等于整串的宽度。

min-content > 可用行宽时，`fit-content` 只能取 min-content，widget 被撑破。
内层 `.callout { max-width: 100% }` 是相对**已经被撑大的 widget** 解析的（100% × 1044 = 1044），
所以它救不回来 —— 这解释了为什么「明明有 max-width 还是溢出」。

阅读视图为什么没事：那边容器是 `.markdown-preview-view`，app.css 给它设了
`overflow-wrap: break-word`，长串能断行 → min-content 很小 → inline-block 的
shrink-to-fit 自然收敛到可用宽。

### 被证伪 / 排除的假设

- **「阅读视图也会溢出」** —— 不会。同一份笔记阅读态全部 = 720px（见上表）。
- **「`.callout` 的 `max-width: 100%` 没生效」** —— 生效了，只是基准错了（见真因）。
- **「加 `max-width: var(--file-line-width)` 更准」** —— 不要。关闭「缩减栏宽」时正文占满
  窗格，用 `--file-line-width` 反而会把 callout 无端夹窄；`100%` 的基准 `.cm-content`
  本身就被官方 `.is-readable-line-width .cm-content { max-width: var(--file-line-width) }`
  夹住，天然等于「min(--file-line-width, 窗格可用宽)」，两种模式都对。
- **「只加 `overflow-wrap: break-word` 就够」（第二轮实测证伪）** —— 宽度照样溢出。
  造变体主题 `EtherealNoMaxWidth`（去掉 `max-width: 100%`、只留 `overflow-wrap: break-word`）
  实测：长单词 **762.4px**（超 42.4）、长 URL **1044.3px**（超 324.3），与修之前一模一样，
  且 `.cm-content` 的 `scrollWidth` 被撑到 1044（溢出直接逃到了滚动容器上）。
  原因是 `break-word` 的软换行机会**不参与 min-content 计算**（那是 `overflow-wrap: anywhere`
  才有的行为），`fit-content` 仍按「整串宽度」当下限。**所以 `max-width` 不能省。**
- **「只加 `max-width: 100%` 就够」** —— 也不够：宽度是夹住了，但长串只能**横向滚动**
  （长单词 `scrollWidth` 750 / `clientWidth` 720，长 URL 1032 / 720），用户下一轮就报
  「内容没有正常换行」。**两条必须成对。**

### 修复与回归

两条一起加在 `.markdown-source-view.mod-cm6 .cm-callout` 上：

```css
max-width: 100%;          /* 夹住宽度上限 */
overflow-wrap: break-word; /* 覆盖官方那条 normal，长串改折行 */
```

修复后逐项复测：

| 判据 | 修复前 | 只加 max-width | 只加 overflow-wrap | **两条都加** |
| --- | --- | --- | --- | --- |
| 长单词 callout 宽 | 762.4（超 42.4） | 720 | 762.4（超 42.4） | **720** |
| 长 URL callout 宽 | 1044.3（超 324.3） | 720 | 1044.3（超 324.3） | **720** |
| 长单词 `.callout-content` scroll/client | 762/762 | 750/720（横向滚动） | 762/762 | **720/720（折行）** |
| 长 URL `.callout-content` scroll/client | 1044/1044 | 1032/720（横向滚动） | 1044/1044 | **720/720（折行）** |
| 常规内容宽度（长段落/短/表格/超宽表格/代码块） | 720/200/285/720/720 | 同左，不变 | 同左，不变 | **同左，不变** |
| 阅读视图 | 全 ≤ 720 | 不变 | 不变 | **不变** |

代码块（`white-space: pre`）不受 `overflow-wrap` 影响，仍不折行；callout 内嵌的
`.cm-table-widget` / `.cm-html-embed` 由官方规则**直接命中**（不是继承），仍是 `normal`。
截图 `verify/out/callout-lp.png`（首屏）与 `verify/out/callout-lp-bottom.png`（滚到底）
确认右边缘与正文栏对齐、长 URL 跨两行显示、无横向滚动条。

**复现工具**：`verify/callout-width-probe.cjs`（真机 + 隔离迷你库，笔记
`scratch/od-vault/_probe-callout.md`）。判据：`over` 列全 0 **且** 各 `.callout-content`
的 `scroll == client` 为通过。传主题名可做 A/B：`node callout-width-probe.cjs EtherealNoMaxWidth`
（变体主题由迷你库 `themes/EtherealNoMaxWidth/` 提供，跑变体时脚本不会覆盖它的 `theme.css`）。

---

## 2026-10-09 · 打开文档后首次滚轮滚到标题处，滚动轴回跳

**版本**：1.6.1 ｜ **结论**：空白行压缩的两条规则同时给同一行声明 `line-height`，删掉冗余的那条。

### 症状

实时预览下滚轮滚动时，滚动条会自己跳回文档靠前的位置。用户的原始描述是
「只要标题长度超过一行，每次打开该文件时并滚到该标题位置时都会触发一次重绘」。

### 复现条件（第一轮没问到，第二轮才补齐）

只靠「标题换行」这个描述**复现不出来**。补齐后条件很具体：

1. **只在实时预览**（阅读视图不出现）；
2. 只在**打开文档后的第一次**滚轮滚动时触发 —— 之后继续滚正常；
3. **关掉文档重新打开**才会再次触发；
4. 可稳定复现的文件是一份 147 行的普通笔记（含引用块、代码块、若干标题与大量空行）。

### 环境与工具

隔离真机实例：独立 `--user-data-dir` + 迷你库（配置照抄用户真机：`baseFontSize: 20`、
可读行宽、实时预览），CDP 驱动。**滚动一律用 CDP `Input.dispatchMouseEvent{type:'mouseWheel'}`**
—— 用 `dispatchEvent(new WheelEvent(...))` 派发的是**非可信事件，浏览器不执行默认滚动动作**，
等于没滚（第一轮白测了一遍才发现）。

### 试错路径（含被证伪的假设）

#### 假设 ①：标题超宽换行 → CM6 行高估计失真 → 滚动补偿出错

听起来最合理：换行标题是「一个源码行占多个视觉行」的极端情况。**被证伪。**
把笔记末尾三条长标题全部改短，回跳照旧（−2865px，甚至更大）。长标题只是让错误更容易被
看见，不是必要条件。

#### 假设 ②：编辑态指示标签（绝对定位伪元素）撑开滚动轴

第一轮给出的修复注释写的就是这个机制。**物理上不成立**：做一个最小 HTML 夹具，把
「标题行未定位 / 已定位 / 完全没有标签」三种情形并排，量滚动容器的
`scrollHeight` / `scrollWidth` —— 三组**完全相同**（1200 / 285）。绝对定位盒不贡献滚动溢出，
改不了滚动轴。

#### 假设 ③：`position: relative` 那版修复把问题放大了

用户反馈「加上标题行 `position: relative` 之后变成循环触发」。**没复现出这个差别**：
把带修复与不带修复做成两个主题变体冷启动对跑，首次滚轮的逐帧轨迹**完全一致**
（都是 3200 → 444，−2756px）。所以这条修复与本 bug 无关（它修的是另一件事，见下）。

#### 假设 ④：空白行压缩的规则冲突

把 `body.blank-line-native`（空白行恢复原生）挂上 → **0 次回退**。顺着这条线做文件级 A/B
（生成主题变体，不做运行时注入），责任规则锁定。

### 定位手段：抓「是谁改了 scrollTop」

劫持 `Element.prototype.scrollTop` 的 setter，记录每次写入的值与**调用栈**：

```
scrollTop = 444
  at e.measure        (app.js)
  at e.onScrollChanged(app.js)
  at e.onScroll       (app.js)
```

改的人是 **CM6 自己**（不是主题、不是 Obsidian、不是浏览器滚动锚定）。同一帧
`.cm-content` 有 321 个子节点变更。`measure()` 里是 `scrollTop += Δ` 的读改写，
所以 Δ = −2756px —— 即 **CM6 认定视口以上的内容矮了 2756px**。

这个数字能对账：`2756 ÷ 26 ≈ 106 行`，而 `26px = 36px − 10px`，
正好是正文行高（`--line-height-main: 1.8` × 20px）与压缩后空行高（`0.5em` = 10px）之差。

### 真因

`Blank-line-hide` 片段层里有两条规则同时管同一批空行：

| | 选择器 | 声明 |
| --- | --- | --- |
| **rule1** | `.is-live-preview :is([class=cm-line]:has(+ :is(.HyperMD-quote, .cm-callout, .HyperMD-header)), :is(…) + [class=cm-line])` | `line-height: var(--blank-line-height)` + `border-radius` |
| **rule2** | `.markdown-source-view.mod-cm6 .cm-line:has(> br:only-child)` | `line-height` / `min-height: var(--blank-line-height) !important` |

rule1 的选择器**依赖兄弟关系**（`:has(+ …)`：这一行是不是紧挨着标题 / 引用块 / 标注）。
CM6 虚拟化会不断插入、移除行，每次插入都要让「前一个兄弟」的样式失效；失效与
`measure()` 读取高度不在同一个时机上，行高表就被写进了过期的值，随后 CM6 一次性纠正，
表现为滚动轴回跳。

**触发条件收窄为「同一条行被两个 `line-height` 声明同时命中」**，与 `!important` 无关
（把 rule2 的 `!important` 去掉仍然回跳），也与 `:has(+ …)` 半边无关（只去掉那半边仍然回跳）。

而 rule1 在真实文档里**几何效果为零**：逐行 dump 渲染中每个 `.cm-line` 的
`class / line-height / offsetHeight / min-height`，两条规则都在、与中和掉 rule1 之后
**完全一致**（空行一律 8px，非空行 28.8 / 57.6 / 86.4px）。原因是 rule2 的
`!important` + 更高特异性总是胜出，rule1 对空行的压缩纯属重复；它对**非空行**的压缩
本身还是错的 —— `0.5em` 行高会让正文溢出自身行盒、与相邻行重叠。

### A/B 数据（真机 · 真实笔记 · 首次滚轮最大回退）

| 变体 | 最大回退 |
| --- | --- |
| 现状（rule1 + rule2） | **−2756px** |
| 整条删除 rule1 | **0px** |
| rule1 只留 `border-radius`（不设 `line-height`） | **0px** |
| rule1 只去掉 `:has(+ …)` 半边 | 仍 −2756px |
| rule2 去掉 `!important` | 仍 −2737px |
| 文档末尾长标题改短（其余不变） | 仍 −2865px |
| 关掉主题（默认主题基线） | 0px（但文档总高估计偏低，见下） |

### 修复

整条删除 rule1，原处留注释说明原委。空行压缩继续由 rule2 负责，外观零变化
（空行实测仍为 8px）。同时收窄 `blank-line-height` 设置项的中英说明 —— 原文声称
「紧邻引用块 / 标注 / 标题的行（即使不是空行）也同样压缩」，修复后不再成立。

### 回归验证

- 空行高度仍全为 8px、非空行 28.8 / 57.6 / 86.4px —— 与修复前**逐行零差异**；
- `npm run validate:settings`（220 / 179，978 / 886，0 error）、CSS 校验、无头渲染验证全过；
- 复现探针复测首次滚轮：**0 回退帧**（两轮各 30 格 + 20 格）。

### 遗留 / 未验证

- **Chromium 侧的确切机制没有钉死**：已知「同一条行被两个 `line-height` 命中」是触发条件，
  但为什么样式失效与 CM6 测量会错位，没有深入到浏览器内部去证实。
  实用结论已经足够：**同一批元素的同一个几何属性，规则只留一条**。
- 用户观察到的「加 `position: relative` 后变成循环触发」**未能复现**（A/B 逐帧一致），
  差异来源不明，可能与当时同时改动的其他设置有关。
- 主题开着时 CM6 的初始行高估计偏大（含大量空行的文档实测 1480px / 24.9%，
  默认主题是 −896px / 偏低）。这与本 bug 无关（去掉 rule1 后估计误差照旧存在），
  但「滚动时文档总高变化 → 滑块漂移」是同一类现象，暂未处理。

### 复现工具

都放在本地验证目录 `.workbuddy-ai/verify/`（该目录 gitignore，未入库）：

| 工具 | 作用 |
| --- | --- |
| `firstscroll-probe.cjs` | 开文档 → 首次真实滚轮 → 逐帧统计 `scrollTop` 回退帧（0 为通过） |
| `who-moves-scroll.cjs` | 劫持 `scrollTop` setter + 记录调用栈，抓「是谁改的」 |
| `variant-ab-probe.cjs` / `variant-ab2-probe.cjs` | 生成主题变体做文件级 A/B（不做运行时注入 —— 注入会引入混淆） |
| `abs-pseudo-overflow.html` | 最小实验：绝对定位伪元素是否撑开滚动轴（无头 Edge `--dump-dom` 直接跑） |

做法都是「CDP 连一个隔离 Obsidian 实例，在页面里注入探针脚本」，每个 150 行上下。
若要长期保留为回归测试，可以收进 `scripts/` 并补一条 npm script。

---

## 2026-10-09 · 编辑态 H1–H6 指示标签丢失 / 错位

**版本**：1.6.1 ｜ **结论**：编辑态标题行缺 `position: relative`，标签的包含块落到了滚动容器上。

### 症状

编辑视图里，首屏以外的标题**完全看不到**左侧的 H1–H6 指示标签；首屏内的标题则可能出现
一个游离的标签。阅读视图一直正常。

### 真因

`::before` 指示标签是 `position: absolute`，位置靠 `bottom: 60%` 定。它的包含块是最近的
定位祖先：

- 阅读视图：`h1…h6` 本来就声明了 `position: relative`，包含块 = 标题本身，正常；
- 编辑视图：标题行 `.cm-line` 是 `static`，而 **CM6 baseTheme 把 `.cm-scroller` 声明成了
  `position: relative`**（同时 `height: 100%`、`z-index: 0`）—— 于是包含块回落到**滚动容器**，
  `bottom: 60%` 按**视口高度**解析。

实测（视口 698px）：`bottom` 计算值 418.7px、`top` 使用值 269.5px，即标签被画到
**内容坐标 y ≈ 269px** 处 —— 只有文档开头约 270px 以内的标题才碰得上它。

### 修复

给编辑态标题行 `.cm-line.HyperMD-header-1…6` 补 `position: relative`，包含块收拢到标题行
（实测 `top` 使用值变为 42.2px、`left` 0），与阅读视图一致。仅改绘制位置，不动 CM6 行高表。

### 一条被这次排查顺带证伪的说法

「绝对定位元素反复重算布局 → 滚动轴跳顶」——不成立。见上文最小实验：绝对定位盒对滚动容器的
`scrollHeight` / `scrollWidth` 零贡献。**滚动轴的问题要在「高度/几何」里找，不要往「定位」上找。**
