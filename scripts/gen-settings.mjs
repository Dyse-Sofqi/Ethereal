// Generate Ethereal theme.css @settings block from Obsidian 1.13.7 app.css
// Runs: node gen-settings.mjs <appcss path> <output css path>
import fs from "node:fs";
import { zhName } from "./zh-translations.mjs";

const appCssPath = process.argv[2];
const outPath = process.argv[3];

const css = fs.readFileSync(appCssPath, "utf8");
const lines = css.split("\n");

// ---------- parse ----------
const records = []; // {name, value, scope, group, line}
let scope = "out";
let group = "";
for (let i = 1997; i < 3130 && i < lines.length; i++) {
  const l = lines[i];
  let m;
  if ((m = l.match(/^\s*\/\* (.+?) \*\//))) group = m[1];
  if (/^\s*:root\s*\{/.test(l)) { scope = "root"; group = "Headings (weights)"; }
  else if (/^\s*body\s*\{/.test(l)) { scope = "body"; if (i > 3100) group = "Fonts"; }
  else if (/^\s*\.theme-light\s*\{/.test(l)) scope = "theme-light";
  else if (/^\s*\.theme-dark\s*\{/.test(l)) scope = "theme-dark";
  else if (/^\s*\.mod-macos\s*\{/.test(l)) scope = "mod-macos";
  else if (/^\s*\}\s*$/.test(l)) scope = "out";
  if ((m = l.match(/^\s*--([a-zA-Z0-9-]+):\s*(.*?);?\s*$/))) {
    if (scope === "mod-macos") continue;
    // disambiguate second "Inputs" group (color mapping inputs at line ~2882)
    const g = (group === "Inputs" && i > 2800) ? "Color mapping inputs" : group;
    records.push({ name: m[1], value: m[2].trim(), scope, group: g, line: i + 1 });
  }
}

// aggregate by name
const byName = {};
for (const r of records) {
  const e = byName[r.name] || (byName[r.name] = { name: r.name, body: null, light: null, dark: null, groups: [], line: r.line });
  if (r.scope === "body" || r.scope === "root") e.body = r.value;
  if (r.scope === "theme-light") e.light = r.value;
  if (r.scope === "theme-dark") e.dark = r.value;
  if (!e.groups.includes(r.group)) e.groups.push(r.group);
}
const vars = Object.values(byName).filter(v => v.body || v.light || v.dark);

// ---------- classification ----------
const DEPRECATED_RE = /-(rgb|hsl)$/;
const BASE_PALETTE_RE = /^(color-base-\d+$|color-(red|orange|yellow|green|cyan|blue|purple|pink)$|mono-[01]$|color-accent(-[12])?$)/;
const isDeprecatedName = (n) => DEPRECATED_RE.test(n) || n === "text-highlight-bg-rgb";

const GROUP_MAP = {
  "Animations": ["effects", "动画 Animations"],
  "Bases": ["components", "数据库（Bases）"],
  "Blockquotes": ["typography", "引用块 Blockquotes"],
  "Bold": ["typography", "粗体 Bold"],
  "Borders": ["layout", "边框 Borders"],
  "Buttons": ["components", "按钮 Buttons"],
  "Blurs": ["effects", "模糊 Blurs"],
  "Callouts": ["components", "标注 Callouts"],
  "Canvas": ["views", "画布 Canvas"],
  "Caret (text entry cursor)": ["typography", "插入光标 Caret"],
  "Checkboxes": ["components", "复选框 Checkboxes"],
  "Code": ["typography", "代码 Code"],
  "Collapse icons": ["components", "折叠图标 Collapse icons"],
  "Cursor": ["effects", "鼠标指针 Cursor"],
  "Dialogs - e.g. small modals, confirmations": ["components", "对话框 Dialogs"],
  "Dividers — between panes": ["layout", "分隔线 Dividers"],
  "Dragging": ["effects", "拖拽 Dragging"],
  "Dropdowns": ["components", "下拉框 Dropdowns"],
  "Embeds": ["components", "嵌入 Embeds"],
  "File layout": ["layout", "文件布局 File layout"],
  "Relative font sizes": ["typography", "相对字号 Font sizes (relative)"],
  "Flair": ["typography", "标记 Flair"],
  "UI font sizes": ["typography", "UI 字号 Font sizes (UI)"],
  "Font weights": ["typography", "字重 Font weights"],
  "Footnotes": ["typography", "脚注 Footnotes"],
  "Graphs": ["views", "关系图谱 Graphs"],
  "Headings": ["typography", "标题 Headings"],
  "Horizontal rules": ["typography", "水平线 HR"],
  "Icons": ["components", "图标 Icons"],
  "Images": ["components", "图片 Images"],
  "Indent size": ["typography", "列表缩进 Indent size"],
  "Indentation guide": ["typography", "缩进参考线 Indentation guide"],
  "Inline title": ["typography", "内联标题 Inline title"],
  "Inputs": ["components", "输入框 Inputs"],
  "Italic": ["typography", "斜体 Italic"],
  "Z-index": ["effects", "层叠层级 Z-index"],
  "Lightbox": ["components", "灯箱 Lightbox"],
  "Line heights": ["typography", "行高 Line heights"],
  "Links": ["typography", "链接 Links"],
  "Lists": ["typography", "列表 Lists"],
  "File navigator": ["components", "文件导航 File navigator"],
  "Menus": ["components", "菜单 Menus"],
  "Metadata": ["components", "元数据 Metadata"],
  "Modals": ["components", "模态框 Modals"],
  "Multi-select pills": ["components", "多选胶囊 Pills"],
  "Paragraphs": ["typography", "段落 Paragraphs"],
  "PDF view": ["views", "PDF 视图"],
  "Popovers - file previews": ["components", "弹出预览 Popovers"],
  "Prompts - e.g. quick switcher, command palette": ["components", "命令面板 Prompts"],
  "Radiuses": ["layout", "圆角 Radiuses"],
  "Raised": ["effects", "浮起遮罩 Raised"],
  "Ribbon": ["components", "功能区 Ribbon"],
  "Scrollbars": ["layout", "滚动条 Scrollbars"],
  "Search": ["components", "搜索 Search"],
  "Setting groups": ["components", "设置面板 Settings"],
  "Layout sizing - for padding and margins": ["layout", "间距尺寸 Sizing"],
  "Sidebar": ["components", "侧边栏 Sidebar"],
  "Sliders": ["components", "滑块 Sliders"],
  "Status bar": ["components", "状态栏 Status bar"],
  "Suggestions": ["components", "自动补全 Suggestions"],
  "Sync": ["views", "同步 Sync"],
  "Swatch for color inputs": ["components", "色板 Swatch"],
  "Tabs": ["components", "标签页 Tabs"],
  "Mobile tab switcher": ["components", "移动端标签切换 Tab switcher (mobile)"],
  "Stacked tabs": ["components", "堆叠标签 Stacked tabs"],
  "Tables": ["components", "表格 Tables"],
  "Tags": ["components", "标签 Tags"],
  "Window frame": ["components", "窗口框架 Window frame"],
  "Toggles": ["components", "开关 Toggles"],
  "Touch sizes": ["layout", "触控尺寸 Touch sizes"],
  "Vault profile": ["components", "库档案 Vault profile"],
  "Workspace": ["effects", "工作区 Workspace"],
  "Accent HSL values": ["colors", "强调色 HSL Accent"],
  "Backgrounds": ["colors", "背景 Backgrounds"],
  "Text": ["colors", "文本 Text"],
  "Color mapping inputs": ["colors", "颜色映射·输入框 Inputs"],
  "Headings (weights)": ["typography", "标题字重 Heading weights"],
  "Fonts": ["typography", "字体 Fonts"],
  "Deprecated — kept for theme compatibility": ["deprecated", "兼容保留 Deprecated"],
  "__DualMode__": ["colors", "模式差异化变量 Dual-mode"],
  "__Palette__": ["colors", "基础调色板 Base palette"],
  "__DualShadow__": ["effects", "明暗差异阴影与遮罩 Shadows (dual)"],
};

function classify(v) {
  const n = v.name;
  if (isDeprecatedName(n)) return { cat: "deprecated", group: "Deprecated — kept for theme compatibility" };
  if (BASE_PALETTE_RE.test(n) && (v.light !== null || v.dark !== null)) return { cat: "colors", group: "__Palette__" };
  if (v.light !== null || v.dark !== null) {
    if (/^(shadow|input-shadow|blur|raised|pdf-|background-modifier-cover|background-modifier-box-shadow|text-selection|highlight-mix|background-secondary-alt|background-modifier-form-field|interactive-|text-accent|mono-rgb)/.test(n)) {
      return { cat: "effects", group: "__DualShadow__" };
    }
    return { cat: "colors", group: "__DualMode__" };
  }
  const g = (v.groups.find(g => GROUP_MAP[g]) || v.groups[0]);
  const mapped = GROUP_MAP[g];
  if (mapped) return { cat: mapped[0], group: g };
  return { cat: "components", group: "__Other__" };
}

// ---------- type decide ----------
const isPlainColor = (s) => /^(#[0-9a-fA-F]{3,8}|rgba?\([0-9.,%\s]+\)|hsla?\([0-9.,%\s]+\))$/.test(s) && !/var\(|calc\(|color-mix/.test(s);
function displayType(v) {
  if (isDeprecatedName(v.name)) return "text";
  const dual = (v.light !== null || v.dark !== null);
  if (dual) {
    const lv = v.light ?? v.body ?? v.dark;
    const dv = v.dark ?? v.light ?? v.body;
    if (lv && dv && lv !== dv) {
      let l = lv, d = dv;
      if (l === "white") l = "#ffffff";
      if (l === "black") l = "#000000";
      if (d === "white") d = "#ffffff";
      if (d === "black") d = "#000000";
      if (isPlainColor(l) && isPlainColor(d)) return "themed";
    }
    return "text";
  }
  return "text";
}

// ---------- helpers ----------
function yq(s) {
  if (s.includes("'") && s.includes('"')) return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  if (s.includes("'")) return `"${s.replace(/\\/g, "\\\\")}"`;
  return `'${s}'`;
}
function normColor(s) {
  if (s === "white") return "#ffffff";
  if (s === "black") return "#000000";
  return s;
}
function descOf(v, type) {
  const parts = [];
  if (type === "themed") parts.push("明/暗模式分别设置（默认=官方值）");
  else if (v.light !== null && v.dark !== null && v.light !== v.dark) parts.push(`暗色默认 ${v.dark}；亮色默认 ${v.light}`);
  else if (v.light !== null && v.light !== v.body) parts.push(`亮色默认 ${v.light}`);
  if (type !== "themed" && (v.light !== null || v.dark !== null) && (v.light ?? v.body) !== (v.dark ?? v.body)) {
    parts.push("注：原生与另一模式不同；暗色模式下本值独立生效，亮色由底部兜底规则保持原生");
  }
  if (isDeprecatedName(v.name)) parts.push("⚠️ 官方已标记为兼容保留（Deprecated）");
  return parts.join("；") || null;
}

// ---------- build ----------
const items = [];
for (const v of vars) {
  const c = classify(v);
  const type = displayType(v);
  const defaultVal = type === "themed"
    ? { light: normColor(v.light ?? v.body ?? v.dark), dark: normColor(v.dark ?? v.light ?? v.body) }
    : (v.dark ?? v.body ?? v.light) ?? "";
  items.push({ v, c, type, defaultVal, d: descOf(v, type) });
}

// group bookkeeping (preserve app.css order via first line)
const groupInsert = {};
for (const it of items) {
  if (!(it.c.group in groupInsert)) groupInsert[it.c.group] = { cat: it.c.cat, firstLine: it.v.line };
}
const CAT_ORDER = ["colors", "typography", "layout", "components", "views", "effects", "deprecated"];
const catGroups = {};
for (const it of items) (catGroups[it.c.group] ||= []).push(it);

// ---------- emit ----------
const out = [];
out.push(`/*
 * Ethereal — Obsidian 官方 CSS 变量面板
 * 说明：本主题完全基于 Obsidian 原生主题（零覆盖），仅通过 Style Settings 暴露
 * Obsidian 官方 CSS 变量（基于 Obsidian 1.13.7 app.css 提取，共 ${vars.length} 个变量）。
 * 使用方式：
 *  1. 安装并启用 Style Settings 插件（社区插件）
 *  2. 在 外观 → 主题 中选择 Ethereal 后，打开 设置 → 外观 → 样式设置
 *  3. 分组默认折叠，按需展开；每项默认值 = 官方默认值，修改即覆盖，重置按钮可恢复
 * 注意：所有设置项 id 与官方 CSS 变量同名（不含 -- 前缀），
 *       变量被修改后会注入 body.css-settings-manager，优先级高于官方默认。
 */`);

const CAT_TITLE = {
  colors: "颜色 Colors",
  typography: "排版 Typography",
  layout: "布局 Layout",
  components: "组件 Components",
  views: "特殊视图 Special Views",
  effects: "效果与杂项 Effects & Misc",
  deprecated: "兼容保留 Deprecated",
};

out.push(`/* @settings
name: Ethereal — 官方变量面板
id: ethereal-official-vars
settings:
    -
        id: ethereal-info
        title: 使用说明
        type: info-text
        description: "本面板暴露 Obsidian 官方 CSS 变量（基于 1.13.7 提取，共 ${vars.length} 项），主题本体零覆盖、完全依赖原生。修改即覆盖，恢复默认请点击行右侧重置按钮。颜色类变量多为「明/暗双模式」类型，明暗可分别设置（强调色 HSL 亦分亮/暗两组）；其余为文本框，默认值=官方默认。"
    -
        id: ethereal-presets-info
        title: 💾 方案管理（选择 / 保存 / 导入导出）
        type: info-text
        description: "想要把整套自定义值保存为方案、随时切换、导出分享？请安装配套插件「Ethereal 方案管理」（silence-presets）：启用后本面板顶部会直接出现方案栏（选择→应用、保存当前、恢复官方默认），完整管理在 设置 → Silence 方案管理 标签页（含逐方案导出/删除与 JSON 导入）。方案＝本面板全部变量的快照，明/暗双模式一并保存。"
`);

const emitted = new Set();
let gi = 0;
const lightFallbacks = []; // {name, lightValue}
for (const cat of CAT_ORDER) {
  const catsGroups = Object.entries(groupInsert).filter(([g, info]) => info.cat === cat)
    .sort((a, b) => a[1].firstLine - b[1].firstLine);
  if (!catsGroups.length) continue;
  // emit level-1 heading for this category FIRST, so subsequent
  // level-2 headings nest under it (Style Settings follows document order)
  out.push(`    -
        id: hd-${cat}
        title: ${yq(CAT_TITLE[cat])}
        type: heading
        level: 1
        collapsed: true
`);
  for (const [g] of catsGroups) {
    if (emitted.has(g)) continue;
    emitted.add(g);
    gi++;
    const info = GROUP_MAP[g] || ["components", g];
    out.push(`    -
        id: hd-g-${gi}
        title: ${yq(info[1])}
        type: heading
        level: 2
        collapsed: true
`);
    const sorted = [...(catGroups[g] || [])].sort((a, b) => a.v.line - b.v.line);
    for (const it of sorted) {
      const { v, type, defaultVal } = it;
      const d = descOf(v, type);
      // collect light fallback for dual text vars
      const lightV = v.light ?? v.body;
      if (type === "text" && lightV !== null && lightV !== (v.dark ?? v.body)) {
        lightFallbacks.push({ name: v.name, lightValue: lightV });
      }
      // 强调色 HSL：官方不分明暗（仅 :root 一份），拆成亮/暗两组设置 + 底部模式映射规则
      if (v.name === "accent-h" || v.name === "accent-s" || v.name === "accent-l") {
        const zh = zhName(v.name);
        const base = v.body ?? "";
        for (const [mode, sfx] of [["light", "-light"], ["dark", "-dark"]]) {
          out.push(`    -
        id: ${v.name}${sfx}
        title: ${yq(`${zh}（${mode === "light" ? "亮色" : "暗色"}）（--${v.name}${sfx}）`)}
        type: variable-text
        default: ${yq(defaultVal)}
        description: ${yq(`明/暗模式分别设置（默认=官方 ${base}）`)}
`);
        }
        continue;
      }
      out.push(`    -
        id: ${v.name}
        title: ${yq(`${zhName(v.name)}（--${v.name}）`)}
        type: ${type === "themed" ? "variable-themed-color" : "variable-text"}
${type === "themed"
        ? `        format: hex
        default-light: ${yq(defaultVal.light)}
        default-dark: ${yq(defaultVal.dark)}`
        : `        default: ${yq(defaultVal)}`}${d ? `
        description: ${yq(d)}` : ""}
`);
    }
  }
}
out.push(`*/`);

// ---------- theme css body: zero-override + light-mode fallback ----------
out.push(`
/* ---- 主题本体（零覆盖）：不改动任何原生规则，外观完全由原生变量 + 上方设置决定 ---- */

/*
 * 以下兜底：Style Settings 的 variable-text 设置会把 default（=官方暗色值）无条件注入
 * body.css-settings-manager（明暗同值），会污染原生的亮色默认值
 * （官方亮色值可能定义在 .theme-light，也可能仅定义在 :root）。
 * 这些变量在官方中仅对暗色差异化（亮色保持原生），这里用更高特异性选择器
 * 在亮色模式下按官方亮色值显式锁定；暗色模式不受影响（注入值正常生效）。
 * 如需自定义这些变量的亮色值，请直接编辑下方对应行。
 */
`);
const fb = lightFallbacks.map((f, i) => `        --${f.name}: ${f.lightValue};`).join("\n");
if (fb) {
  out.push(`body.theme-light.css-settings-manager.theme-light {
${fb}
}`);
}
// 强调色明暗分离：官方 --accent-h/--accent-s/--accent-l 仅定义于 :root（不分明暗），
// 主题色因此明暗相同；「强调色 HSL」分组提供亮/暗两组设置（--accent-h-light/-dark 等），
// 这里按当前模式把对应设置值映射回官方变量；未设置或未启用 Style Settings 时 = 官方默认。
out.push(`
body.theme-light.css-settings-manager.theme-light {
        --accent-h: var(--accent-h-light, 258);
        --accent-s: var(--accent-s-light, 88%);
        --accent-l: var(--accent-l-light, 66%);
}
body.theme-dark.css-settings-manager.theme-dark {
        --accent-h: var(--accent-h-dark, 258);
        --accent-s: var(--accent-s-dark, 88%);
        --accent-l: var(--accent-l-dark, 66%);
}
`);
fs.writeFileSync(outPath, out.join("\n"), "utf8");
// stats
let themed = 0, text = 0;
for (const it of items) it.type === "themed" ? themed++ : text++;
console.log(`OK vars=${vars.length} items=${items.length} groups=${emitted.size} themed=${themed} text=${text} fallbacks=${lightFallbacks.length}`);
