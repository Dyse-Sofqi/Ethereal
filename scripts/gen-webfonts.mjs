// 生成「Web 字体兜底」**可选 CSS 片段**：本机未安装指定字体时，自动从 CDN 取用等价字体。
//
// 运行：node scripts/gen-webfonts.mjs [输出路径]   （默认 ../snippets/ethereal-web-fonts.css）
//
// ⚠️ 为什么是独立 snippet，而不是写进 theme.css
// --------------------------------------------
// Obsidian 的 **Developer policies** 把下面这条列在「Not allowed」：
//   "Themes may not load assets from the network."
// 并明确「不遵守的插件与主题会被移出官方目录」。Ethereal 已在官方社区主题目录中
// （obsidian-releases/community-css-themes.json），所以 theme.css **必须零网络请求**。
// 官方给的合规做法是内嵌资源（base64），但三个 CJK 字体合计 12.6MB woff2 → base64 约 17MB，
// theme.css 会膨胀到 17MB 且每次启动都要解析，不现实。
// 因此把字体规则放进独立 snippet：主题本体合规，想要兜底的用户自行启用。
//
// 用法：把本文件复制到 <库>/.obsidian/snippets/ 后，在「设置 → 外观 → CSS 片段」启用。
//
// 原理
// ----
// 为**与主题 font-family 里完全同名**的族生成 @font-face，src 列表为
// `local(...)` 优先、CDN url 兜底：
//   · 本机装了 → local() 命中，零网络请求；
//   · 本机没装 → 回落到 CDN 的 woff2 分片，只下载用到的 unicode-range 子集。
// 因为族名与原字体一致，主题里所有既有 font-family 声明与用户已保存的
// 自定义字体设置都无需改动即可获得兜底。
//
// ⚠️ local() 认的是 **FullName / PostScript name，不是族名**（规范如此）。
//    所以 locals 列表必须按字体 name 表填写，不能想当然写族名。
//    实测（Windows 用户字体目录）：
//      得意黑  → FullName: '得意黑 斜体' / 'Smiley Sans Oblique'，PostScript: 'SmileySans-Oblique'
//                （写 local('得意黑') 或 local('Smiley Sans') 都**不命中**）
//      思源宋体 → FullName: 'Source Han Serif SC VF'，中文 '思源宋体 VF'
//
// 为什么不用 @import
// ------------------
// Obsidian 的 index.html 里 CSP 只声明了
//   style-src 'unsafe-inline' 'self' https://fonts.googleapis.com
// 没有 font-src / default-src。所以：
//   · @import 远程 CSS 走 style-src → jsDelivr 会被拦（只有 Google Fonts 放行，国内不可用）；
//   · @font-face 的 url() 走 font-src → 该指令缺失、回落到不存在的 default-src → 不受限。
// 因此必须把字体规则**内联**进 theme.css 并直连 woff2，而不是 @import 外部 CSS。
//
// 数据源
// ------
// @fontsource-variable/noto-serif-sc = 思源宋体（Source Han Serif = Noto Serif CJK，同一字体）
// @fontsource-variable/noto-sans-sc  = 思源黑体
// cn-fontsource-smiley-sans-oblique-regular = 得意黑（中文网字计划，按 unicode-range 分好片）
// 版本号固定，避免上游改分片编号导致本地缓存失效；升级时改版本后重跑即可。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const outPath = process.argv[2] || path.join(here, "..", "snippets", "ethereal-web-fonts.css");

const REGION_START = "/* #region Web 字体兜底（本机未安装时自动从 CDN 加载） */";
const REGION_END = "/* #endregion */";

// 主源 + 备用镜像（jsDelivr 的三个官方入口，国内可达性互有差异）。
// src 是回退列表：主源网络失败时浏览器会自动尝试下一个。
const MIRRORS = [
  "https://cdn.jsdelivr.net/npm",
  "https://fastly.jsdelivr.net/npm",
];

// cssFile：包内的 CSS 入口（其 url() 多为相对路径，脚本会换成绝对 CDN 地址）
// family ：**必须与 theme.css 里 font-family 用的字符串一致**，否则兜底不会生效
const FONTS = [
  {
    pkg: "@fontsource-variable/noto-serif-sc",
    version: "5.3.0",
    cssFile: "index.css",
    family: "Source Han Serif SC VF",
    locals: [
      "Source Han Serif SC VF", // 英文 FullName（实测命中）
      "思源宋体 VF", // 中文 FullName
      "Source Han Serif SC", // 静态版（非 VF）
      "Source Han Serif CN",
      "思源宋体",
      "Noto Serif SC", // Google 命名，同一字体
    ],
  },
  {
    pkg: "@fontsource-variable/noto-sans-sc",
    version: "5.3.0",
    cssFile: "index.css",
    family: "Source Han Sans SC VF",
    locals: [
      "Source Han Sans SC VF",
      "思源黑体 VF",
      "Source Han Sans SC",
      "Source Han Sans CN",
      "思源黑体",
      "Noto Sans SC",
    ],
  },
  {
    pkg: "cn-fontsource-smiley-sans-oblique-regular",
    version: "1.0.1",
    cssFile: "font.css",
    family: "得意黑",
    // 注意：不要写 local('得意黑') / local('Smiley Sans')，实测都不命中（那是族名，local() 不认）
    locals: [
      "得意黑 斜体", // 中文 FullName（实测命中）
      "Smiley Sans Oblique", // 英文 FullName（实测命中）
      "SmileySans-Oblique", // PostScript（实测命中）
    ],
  },
];

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

async function fetchIndex(font) {
  let lastErr;
  for (const m of MIRRORS) {
    const url = `${m}/${font.pkg}@${font.version}/${font.cssFile}`;
    try {
      const text = await fetchText(url);
      if (!text.includes("@font-face")) throw new Error("no @font-face in response");
      return text;
    } catch (e) {
      lastErr = e;
      console.warn(`  ! ${url} -> ${e.message}`);
    }
  }
  throw new Error(`无法获取 ${font.pkg}@${font.version}/${font.cssFile}：${lastErr && lastErr.message}`);
}

// 把一个源 @font-face 块改写成「同名族 + local() 优先 + 绝对 CDN URL」
function rewrite(css, font) {
  const blocks = [...css.matchAll(/@font-face\s*\{([\s\S]*?)\}/g)].map((m) => m[1]);
  const faces = [];
  for (const body of blocks) {
    // 相对路径（可能带 ./ 前缀）与可选的 format()
    const m = body.match(/url\(\s*['"]?(?:\.\/)?([^)'"]+?)['"]?\s*\)\s*(format\([^)]*\))?/);
    const range = (body.match(/unicode-range\s*:\s*([^;]+);/) || [])[1]?.trim();
    if (!m || !range) continue;
    const file = m[1];
    const fmt = m[2] || "format('woff2')";
    // 源里没有 font-weight 时默认 normal —— 与「本地装了同款字体」的行为一致
    // （单字重字体被要求更粗时浏览器会合成，不声明即保持同样行为）
    const weight = (body.match(/font-weight\s*:\s*([^;]+);/) || [])[1]?.trim() || "normal";
    const locals = font.locals.map((n) => `local('${n}')`).join(", ");
    const urls = MIRRORS.map(
      (mirror) => `url('${mirror}/${font.pkg}@${font.version}/${file}') ${fmt}`
    ).join(",\n       ");
    faces.push(
      `@font-face {\n` +
        `  font-family: '${font.family}';\n` +
        `  font-style: normal;\n` +
        `  font-weight: ${weight};\n` +
        `  font-display: swap;\n` +
        `  src: ${locals},\n` +
        `       ${urls};\n` +
        `  unicode-range: ${range};\n` +
        `}`
    );
  }
  // 按分片编号排序，保证输出稳定、diff 可读
  const num = (s) => Number((s.match(/-(\d+)-wght-/) || [])[1] ?? 0);
  return faces.sort((a, b) => num(a) - num(b));
}

function buildRegion(groups) {
  const head = [
    REGION_START,
    "/* ==========",
    " * Ethereal 可选片段：中文字体网络兜底",
    " *",
    " * 本机未安装下列字体时，从 CDN 自动加载等价字体：",
    " *   思源宋体 / 思源黑体（Source Han Serif / Sans SC VF）、得意黑（Smiley Sans）",
    " *",
    " * ⚠️ 这是**可选**片段，不包含在主题本体里。原因：Obsidian 的 Developer policies 把",
    " *    「Themes may not load assets from the network」列在 Not allowed，",
    " *    而 Ethereal 已在官方社区主题目录中 —— 主题本体必须零网络请求。",
    " *",
    " * 启用方法：把本文件复制到 <库>/.obsidian/snippets/，",
    " *          再到「设置 → 外观 → CSS 片段」打开对应开关。",
    " *",
    " * 族名与主题 font-family 里用的字符串**完全一致**，src 为 local() 优先 + CDN 兜底：",
    " * 装了就走本地、零请求；没装才下载，且因 unicode-range 分片，只拉取实际用到的子集。",
    " * 因此主题里所有 font-family 声明、以及用户已保存的自定义字体设置都无需改动。",
    " *",
    " * 本文件由 scripts/gen-webfonts.mjs 生成，请勿手改；重新生成：npm run gen:webfonts",
    " * 数据源：" + groups.map((g) => `${g.pkg}@${g.version}`).join("、"),
    " *",
    " * ⚠️ 不能改用 @import：Obsidian 的 CSP 只放行 style-src 上的 fonts.googleapis.com，",
    " *    jsDelivr 的 CSS 会被拦截；而 @font-face 的 url() 属 font-src（CSP 未声明）不受限。",
    " *",
    " * ⚠️ local() 只认 FullName / PostScript name，不认族名 —— 改 locals 前先查字体 name 表。",
    " * ========== */",
  ];
  const body = [];
  for (const g of groups) {
    body.push("");
    body.push(`/* ${g.label} → ${g.family}（${g.faces.length} 个 unicode-range 分片） */`);
    body.push(g.faces.join("\n\n"));
  }
  return [...head, ...body, REGION_END].join("\n");
}

const LABELS = {
  "@fontsource-variable/noto-serif-sc": "思源宋体",
  "@fontsource-variable/noto-sans-sc": "思源黑体",
  "cn-fontsource-smiley-sans-oblique-regular": "得意黑",
};

const main = async () => {
  console.log("Ethereal Web 字体兜底生成器");
  const groups = [];
  for (const font of FONTS) {
    process.stdout.write(`  拉取 ${font.pkg}@${font.version} ... `);
    const css = await fetchIndex(font);
    const faces = rewrite(css, font);
    if (!faces.length) throw new Error(`${font.pkg} 分片为空`);
    console.log(`${faces.length} 个 @font-face → 族名 '${font.family}'`);
    groups.push({
      ...font,
      label: LABELS[font.pkg] || font.family,
      faces,
    });
  }
  const region = buildRegion(groups);

  const exists = fs.existsSync(outPath);
  const src = exists ? fs.readFileSync(outPath, "utf8") : "";
  const eol = src.includes("\r\n") ? "\r\n" : "\n";
  const regionText = eol === "\r\n" ? region.replace(/\n/g, "\r\n") : region;

  const startIdx = src.indexOf(REGION_START);
  let next;
  if (startIdx === -1) {
    const lead = src.replace(/\s*$/, "");
    next = (lead ? lead + eol + eol : "") + regionText + eol;
    console.log(exists ? "  区域不存在 → 追加到文件末尾" : "  文件不存在 → 新建");
  } else {
    const endIdx = src.indexOf(REGION_END, startIdx);
    const stop = endIdx === -1 ? src.length : endIdx + REGION_END.length;
    next = src.slice(0, startIdx) + regionText + src.slice(stop);
    console.log("  区域已存在 → 原地替换");
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, next, "utf8");
  const total = groups.reduce((n, g) => n + g.faces.length, 0);
  console.log(`  写入 ${outPath}`);
  console.log(
    `  合计 ${total} 条 @font-face，区域 ${(Buffer.byteLength(regionText, "utf8") / 1024).toFixed(1)} KB`
  );
};

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
