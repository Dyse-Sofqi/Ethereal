// Validate theme.css @settings block (zero-dependency).
// Mirrors the style-settings plugin parsing/rendering requirements:
//  - entry structure (id/title/type)
//  - variable-text: default must be a string
//  - variable-themed-color: default-light/default-dark must pass /^(#|rgb|hsl)/ + format
//  - heading nesting: level-2 headings must nest under a level-1 heading
//    (plugin attaches each heading to the nearest preceding same/higher level,
//     so a level-1 heading followed by another level-1 heading is EMPTY — bug)
// Usage: node validate-settings.mjs <theme.css>
import fs from "node:fs";

const css = fs.readFileSync(process.argv[2], "utf8");
const m = css.match(/\/\*\s*@settings([\s\S]*?)\*\//);
if (!m) { console.error("NO @settings BLOCK"); process.exit(1); }

// Entries look like:
//     -
//         id: <id>
//         title: ...
//         type: ...
//         level: 1   (headings only)
//         default/default-light/default-dark/format/description: ...
const raw = m[1].split("\n");
const entries = [];
let cur = null;
for (const l0 of raw) {
  const l = l0.replace(/\r$/, ""); // tolerate CRLF working-tree copies (git autocrlf)
  if (/^\s+-\s*$/.test(l)) { if (cur) entries.push(cur); cur = {}; continue; }
  if (!cur) continue;
  const kv = l.match(/^\s{8}(\w[\w-]*):\s*(.*)$/);
  if (kv) cur[kv[1]] = kv[2];
}
if (cur) entries.push(cur);
const unquote = (s) => {
  if (!s) return s;
  if (s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1);
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  return s;
};

console.log(`entries total: ${entries.length}`);
const ids = entries.map(e => e.id);
const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log(`duplicate ids: ${dup.length ? dup.join(", ") : "none"}`);

const errors = [];
const types = new Set();
const getCSSVarRE = /^(#|rgb|hsl)/;
for (const e of entries) {
  if (!e.id) errors.push(`entry missing id: ${JSON.stringify(e)}`);
  if (!e.title) errors.push(`${e.id}: missing title`);
  if (!e.type) errors.push(`${e.id}: missing type`);
  types.add(unquote(e.type));
  const t = unquote(e.type);
  if (t === "variable-text") {
    const d = unquote(e.default);
    if (typeof d !== "string" || d === "") errors.push(`${e.id}: variable-text default not non-empty string (${d})`);
  } else if (t === "variable-themed-color") {
    const dl = unquote(e["default-light"]), dd = unquote(e["default-dark"]);
    if (typeof dl !== "string" || !getCSSVarRE.test(dl)) errors.push(`${e.id}: bad default-light ${JSON.stringify(dl)}`);
    if (typeof dd !== "string" || !getCSSVarRE.test(dd)) errors.push(`${e.id}: bad default-dark ${JSON.stringify(dd)}`);
    if (!e.format) errors.push(`${e.id}: themed missing format`);
  } else if (t === "heading") {
    const lvl = Number(unquote(e.level));
    if (!lvl || lvl < 1) errors.push(`${e.id}: heading missing/invalid level`);
  } else if (t !== "info-text") {
    errors.push(`${e.id}: unknown type ${t}`);
  }
}
console.log(`types used: ${[...types].join(", ")}`);

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
console.log(`headings: l1=${l1s.length} l2=${l2s.length}`);
let empty = 0;
for (const h of l1s) {
  const kids = children.get(h.id) || [];
  const directGroups = kids.filter(k => /^hd-g-/.test(k)).length;
  if (!kids.length) { empty++; errors.push(`l1 heading ${h.id} (${unquote(h.title)}) has NO children — panel shows empty`); }
  else if (l2s.length && !directGroups) console.warn(`note: l1 heading ${h.id} (${unquote(h.title)}) has leaves but no l2 groups — plugin nests leaves under nearest preceding heading, renders fine`);
}
const orphanL2 = l2s.filter(h => children.get("ROOT") && children.get("ROOT").includes(h.id));
if (orphanL2.length) errors.push(`${orphanL2.length} l2 heading(s) are attached to ROOT (not nested under an l1): ${orphanL2.map(h => h.id).join(", ")}`);
const leafCount = [...children.values()].flat().filter(k => !/^hd-/.test(k)).length;
console.log(`leaf settings under headings: ${leafCount}`);
console.log(`empty l1 groups: ${empty}`);
console.log(`errors: ${errors.length}`);
if (errors.length) { errors.slice(0, 25).forEach(e => console.log("  -", e)); process.exit(1); }
console.log("VALIDATION PASSED");
