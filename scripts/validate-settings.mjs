// Validate theme.css @settings blocks (zero-dependency).
// Mirrors the style-settings plugin parsing/rendering requirements:
//  - entry structure (id/title/type)
//  - variable-text: default must be a YAML **string** (see yamlScalarType below —
//    `default: 700` is a number to js-yaml, and the plugin's variable-text renderer
//    bails out on non-strings, so the setting silently disappears from the panel)
//  - variable-number/-slider: default must be a YAML number; `format` must be a
//    plain CSS unit (it is appended verbatim to the emitted value, so `format: ×`
//    would emit invalid CSS like `1×`)
//  - variable-themed-color: default-light/default-dark must pass /^(#|rgb|hsl)/ + format
//  - heading nesting: level-2 headings must nest under a level-1 heading
//    (plugin attaches each heading to the nearest preceding same/higher level,
//     so a level-1 heading followed by another level-1 heading is EMPTY — bug)
// Every @settings block in the file is validated (the theme ships two panels:
// 「Ethereal 定制」 and 「Ethereal 官方变量」), and setting ids must be unique
// across all of them — Style Settings keys stored values by id, so a duplicate
// id would make two settings share (and fight over) the same saved value.
// Usage: node validate-settings.mjs <theme.css>
import fs from "node:fs";

const css = fs.readFileSync(process.argv[2], "utf8");
const blocks = [...css.matchAll(/\/\*\s*@settings([\s\S]*?)\*\//g)];
if (!blocks.length) { console.error("NO @settings BLOCK"); process.exit(1); }
console.log(`@settings blocks: ${blocks.length}`);

const unquote = (s) => {
  if (!s) return s;
  if (s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1);
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  return s;
};

// 手写解析器拿到的是**原始文本**，`700` 与 `'700'` 都是字符串 "700"；
// 而 Style Settings 内部用 js-yaml 解析 —— 前者是 number，后者才是 string。
// variable-text 渲染器的第一行就是
//   if (typeof this.setting.default != "string") return console.error("... missing default value")
// 即类型不对时**直接 return、该项静默不渲染**（只在控制台报错），用户只会觉得「设置项不见了」。
// 所以必须还原 YAML 的标量类型，否则查不出这类 bug。
function yamlScalarType(raw) {
  if (raw === undefined) return "undefined";
  const s = raw.trim();
  if (!s) return "null";
  if (s.startsWith("'") || s.startsWith('"')) return "string";
  if (/^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(s)) return "number";
  if (/^(true|false)$/i.test(s)) return "boolean";
  if (/^(null|~)$/i.test(s)) return "null";
  return "string";
}

// Entries look like:
//     -
//         id: <id>
//         title: ...
//         type: ...
//         level: 1   (headings only)
//         default/default-light/default-dark/format/description: ...
function parseEntries(text) {
  const raw = text.split("\n");
  const entries = [];
  let cur = null;
  for (const l0 of raw) {
    const l = l0.replace(/\r$/, ""); // tolerate CRLF working-tree copies (git autocrlf)
    if (/^\s+-\s*$/.test(l)) { if (cur) entries.push(cur); cur = {}; continue; }
    if (!cur) continue;
    const kv = l.match(/^\s+(\w[\w-]*):\s*(.*)$/);
    if (kv) cur[kv[1]] = kv[2];
  }
  if (cur) entries.push(cur);
  return entries;
}

const errors = [];
const allIds = [];
const getCSSVarRE = /^(#|rgb|hsl)/;

blocks.forEach((m, bi) => {
  const label = `block ${bi + 1}`;
  const entries = parseEntries(m[1]);
  console.log(`\n[${label}] entries total: ${entries.length}`);
  const ids = entries.map(e => unquote(e.id));
  allIds.push(...ids);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  console.log(`${label} duplicate ids: ${dup.length ? dup.join(", ") : "none"}`);

  const types = new Set();
  for (const e of entries) {
    if (!e.id) errors.push(`${label}: entry missing id: ${JSON.stringify(e)}`);
    if (!e.title) errors.push(`${label} ${e.id}: missing title`);
    if (!e.type) errors.push(`${label} ${e.id}: missing type`);
    types.add(unquote(e.type));
    const t = unquote(e.type);
    if (t === "variable-text" || t === "variable-editable-text") {
      const d = unquote(e.default);
      if (yamlScalarType(e.default) !== "string") {
        errors.push(`${label} ${e.id}: ${t} default 被 YAML 解析成 ${yamlScalarType(e.default)}，必须是字符串（写成 default: '${d}'），否则插件静默不渲染该项`);
      } else if (d === "") {
        errors.push(`${label} ${e.id}: ${t} default 不能为空字符串`);
      }
    } else if (t === "variable-themed-color") {
      const dl = unquote(e["default-light"]), dd = unquote(e["default-dark"]);
      if (yamlScalarType(e["default-light"]) !== "string" || !getCSSVarRE.test(dl)) errors.push(`${label} ${e.id}: bad default-light ${JSON.stringify(dl)}（必须加引号且以 #/rgb/hsl 开头）`);
      if (yamlScalarType(e["default-dark"]) !== "string" || !getCSSVarRE.test(dd)) errors.push(`${label} ${e.id}: bad default-dark ${JSON.stringify(dd)}（必须加引号且以 #/rgb/hsl 开头）`);
      if (!e.format) errors.push(`${label} ${e.id}: themed missing format`);
    } else if (t === "variable-color") {
      const d = unquote(e.default);
      if (yamlScalarType(e.default) !== "string" || !getCSSVarRE.test(d)) errors.push(`${label} ${e.id}: bad default ${JSON.stringify(d)}`);
    } else if (t === "variable-number" || t === "variable-number-slider") {
      if (yamlScalarType(e.default) !== "number") {
        errors.push(`${label} ${e.id}: ${t} default 被 YAML 解析成 ${yamlScalarType(e.default)}，必须是数字（数字不要加引号）`);
      }
      if (e.format !== undefined && !/^[a-zA-Z%]+$/.test(unquote(e.format))) {
        errors.push(`${label} ${e.id}: format ${JSON.stringify(unquote(e.format))} 不是合法 CSS 单位 —— format 会被原样拼到取值后面（会产出 ${unquote(e.default)}${unquote(e.format)} 这样的无效 CSS）`);
      }
    } else if (t === "variable-select") {
      const d = unquote(e.default);
      if (yamlScalarType(e.default) !== "string" || d === "") errors.push(`${label} ${e.id}: select default missing（且必须是 YAML 字符串）`);
    } else if (t === "class-toggle" || t === "class-select") {
      // no required fields; class-toggle default may be boolean
    } else if (t === "heading") {
      const lvl = Number(unquote(e.level));
      if (!lvl || lvl < 1) errors.push(`${label} ${e.id}: heading missing/invalid level`);
    } else if (t !== "info-text") {
      errors.push(`${label} ${e.id}: unknown type ${t}`);
    }
  }
  console.log(`${label} types used: ${[...types].join(", ")}`);

  // ---- nesting check: simulate plugin algorithm ----
  const stack = [];
  const children = new Map();
  const add = (parent, child) => { if (!children.has(parent)) children.set(parent, []); children.get(parent).push(child); };
  for (const e of entries) {
    const t = unquote(e.type);
    if (t === "heading") {
      const lvl = Number(unquote(e.level));
      while (stack.length && stack[stack.length - 1].lvl >= lvl) stack.pop();
      const parent = stack.length ? stack[stack.length - 1].id : "ROOT";
      add(parent, e.id);
      stack.push({ id: e.id, lvl });
    } else {
      const parent = stack.length ? stack[stack.length - 1].id : "ROOT";
      add(parent, e.id);
    }
  }
  const l1s = entries.filter(e => unquote(e.type) === "heading" && Number(unquote(e.level)) === 1);
  const l2s = entries.filter(e => unquote(e.type) === "heading" && Number(unquote(e.level)) === 2);
  console.log(`${label} headings: l1=${l1s.length} l2=${l2s.length}`);
  let empty = 0;
  for (const h of l1s) {
    const kids = children.get(h.id) || [];
    const directGroups = kids.filter(k => /^hd-/.test(k)).length;
    if (!kids.length) { empty++; errors.push(`${label}: l1 heading ${h.id} (${unquote(h.title)}) has NO children — panel shows empty`); }
    else if (l2s.length && !directGroups) console.warn(`note: ${label} l1 heading ${h.id} (${unquote(h.title)}) has leaves but no l2 groups — plugin nests leaves under nearest preceding heading, renders fine`);
  }
  const orphanL2 = l2s.filter(h => children.get("ROOT") && children.get("ROOT").includes(h.id));
  if (orphanL2.length) errors.push(`${label}: ${orphanL2.length} l2 heading(s) are attached to ROOT (not nested under an l1): ${orphanL2.map(h => h.id).join(", ")}`);
  const leafCount = [...children.values()].flat().filter(k => !/^hd-/.test(k)).length;
  console.log(`${label} leaf settings under headings: ${leafCount}`);
  console.log(`${label} empty l1 groups: ${empty}`);
});

const crossDup = [...new Set(allIds.filter((id, i) => allIds.indexOf(id) !== i))];
console.log(`\ncross-block duplicate ids: ${crossDup.length ? crossDup.join(", ") : "none"}`);
if (crossDup.length) errors.push(`ids repeated across blocks: ${crossDup.join(", ")}`);

console.log(`\nerrors: ${errors.length}`);
if (errors.length) { errors.slice(0, 25).forEach(e => console.log("  -", e)); process.exit(1); }
console.log("VALIDATION PASSED");
