// Import script for JavaGuide markdown → seed data JSON
//
// Usage:
//   node scripts/import-javaguide.mjs fetch <category> [--dry-run] [--append]
//   node scripts/import-javaguide.mjs file <path> <category> [--dry-run] [--append]
//
// Examples:
//   node scripts/import-javaguide.mjs fetch java_basic --dry-run
//   node scripts/import-javaguide.mjs fetch java_advanced --append
//   node scripts/import-javaguide.mjs file ./java-guide-page.md java_basic --append
//
// The script fetches JavaGuide markdown from GitHub, parses ### headings as
// questions, generates seed-data entries, and either previews or appends them.

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// ─── Config ──────────────────────────────────────────────────────────────────

// Map category names to JavaGuide GitHub paths
const GUIDES = {
  java_basic: "docs/java/basis/java-basic-questions-01.md",
  java_basic_02: "docs/java/basis/java-basic-questions-02.md",
  java_basic_03: "docs/java/basis/java-basic-questions-03.md",
  java_advanced: "docs/java/basis/java-basic-questions-03.md",
  java_collections: "docs/java/collection/java-collection-questions-01.md",
  java_collections_02: "docs/java/collection/java-collection-questions-02.md",
  java_concurrent: "docs/java/concurrent/java-concurrent-questions-01.md",
  java_concurrent_02: "docs/java/concurrent/java-concurrent-questions-02.md",
  java_concurrent_03: "docs/java/concurrent/java-concurrent-questions-03.md",
  jvm: "docs/java/jvm/java-jvm-questions-01.md",
  jvm_02: "docs/java/jvm/java-jvm-questions-02.md",
  spring: "docs/system-design/framework/spring/spring-knowledge.md",
  spring_common: "docs/system-design/framework/spring/spring-questions.md",
};

// Default difficulty by topic
const DIFFICULTY_MAP = {
  java_basic: "easy",
  java_basic_02: "easy",
  java_basic_03: "medium",
  java_advanced: "medium",
  java_collections: "medium",
  java_collections_02: "medium",
  java_concurrent: "hard",
  java_concurrent_02: "hard",
  java_concurrent_03: "hard",
  jvm: "hard",
  jvm_02: "hard",
};

// Tags to assign based on category
const TAG_MAP = {
  java_basic: ["Java基础"],
  java_advanced: ["Java进阶"],
  java_collections: ["Java集合"],
  java_concurrent: ["Java并发"],
  jvm: ["JVM"],
};

const REPO = "Snailclimb/JavaGuide";
const SEED_DIR = path.resolve(import.meta.dirname, "../seed_data");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fetchViaGitHub(pathInRepo) {
  const cmd = `gh api repos/${REPO}/contents/${pathInRepo} --jq '.content'`;
  const base64 = execSync(cmd, { encoding: "utf-8" }).trim();
  return Buffer.from(base64, "base64").toString("utf-8");
}

function stripFrontmatter(md) {
  return md.replace(/^---[\s\S]*?---\n*/, "");
}

function stripImages(md) {
  // Remove markdown images ![alt](url) and HTML images <img ...>
  return md
    .replace(/!\[.*?\]\(.*?\)/g, "")       // ![alt](url)
    .replace(/!\[.*?\]/g, "")              // dangling ![alt] (url already stripped)
    .replace(/^!\S.*$/gm, "")              // lines starting with ! (stray image artifacts)
    .replace(/<img[^>]*>/gi, "")
    .replace(/\n\(?https?:\/\/oss\.javaguide\.cn[^\s)]*\)?/g, "")
    .replace(/!(\w)/g, "$1");              // remove ! prefixing words from broken image refs
}

function stripLinks(md) {
  return md.replace(/\[([^\]]*)\]\(https?:\/\/[^)]*\)/g, "$1");
}

function stripHtml(md) {
  return md.replace(/<[^>]*>/g, "");
}

function stripCodeBlocks(md) {
  return md.replace(/```[\s\S]*?```/g, "");
}

function stripInlineCode(md) {
  return md.replace(/`([^`]+)`/g, "$1");
}

function stripSubHeadings(md) {
  // Remove #### and lower sub-headings (but keep their text)
  return md.replace(/^#{4,}\s+.*$/gm, "");
}

function stripCallouts(md) {
  // JavaGuide uses > **🐛 修正**、> **🌈 拓展**、> **📌 补充** style callouts
  // and also > reference-style blockquotes
  return md.replace(/^>.*$/gm, "");
}

function stripRefLinks(md) {
  return md.replace(/^\[.*?\]:\s*https?:\/\/.*$/gm, "");
}

function stripReferences(md) {
  return md
    .replace(/\n[—\-]{3,}.*$/gm, "")
    .replace(/\n相关阅读[^。]*。?/g, "")
    .replace(/\n参考链接[：:][^\n]*/g, "")
    .replace(/\n来源：[^\n]*/g, "");
}

function stripEmoji(md) {
  return md.replace(/[🐛🌈📌💡🔒🔗📝✅❌⭐️]/g, "").trim();
}

function stripCalloutLabels(md) {
  // Remaining callout headers after emoji stripped: "拓展一下：", "修正：", etc.
  // Also strip trailing "……" or "..." before a new callout section
  let text = md;
  for (const label of ["拓展一下", "修正", "补充", "广告"]) {
    text = text.replace(new RegExp(`${label}[：:](\\s*)`, "g"), "\n$1");
  }
  return text;
}

function normalizeHeading(text) {
  return text.replace(/^⭐️\s*/, "").replace(/^\*\*|\*\*$/g, "").trim();
}

// Compress multi-line answer into clean paragraphs, remove empties
function compactText(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

// Generate a `content` field (the prompt shown to the user) from the title
function generateContent(title) {
  // If title already reads like a question, use as-is
  if (/[？?]/.test(title) || /^(说说|说一说|什么是|何为|如何|怎么)/.test(title)) {
    return title;
  }
  if (title.includes("的区别") || title.includes("vs") || title.includes(" VS ")) {
    return `请比较 ${title}。`;
  }
  if (title.includes("的作用") || title.includes("的优点") || title.includes("好处")) {
    return `请说明${title}。`;
  }
  return `请解释 ${title}。`;
}

function cleanContent(text) {
  return text
    .replace(/^(请解释|请说明|请比较)\s+\1/, "$1")
    .replace(/[，]\s*$/, "")
    .replace(/。\s*$/, "。")
    .replace(/\s+。/g, "。")
    .trim();
}

function extractTags(title, bodyText, defaultTags) {
  // Match primarily on the title, secondarily on body
  const tagKeywords = [
    { words: ["jvm", "虚拟机", "字节码", "类加载"], tag: "JVM" },
    { words: ["string", "字符串", "常量池"], tag: "String" },
    { words: ["集合", "hashmap", "arraylist", "linkedlist", "concurrenthashmap"], tag: "集合" },
    { words: ["线程", "并发", "锁", "synchronized", "volatile", "cas", "aqs"], tag: "并发" },
    { words: ["异常", "exception", "throwable", "error"], tag: "异常" },
    { words: ["反射", "动态代理", "proxy"], tag: "反射" },
    { words: ["泛型", "通配符"], tag: "泛型" },
    { words: ["注解", "annotation"], tag: "注解" },
    { words: ["io", "nio", "bio", "aio"], tag: "IO" },
    { words: ["optional", "stream", "lambda", "函数式"], tag: "函数式" },
    { words: ["设计模式", "单例", "工厂", "代理模式", "观察者"], tag: "设计模式" },
    { words: ["gc", "垃圾回收", "内存管理"], tag: "内存管理" },
    { words: ["spring", "ioc", "aop", "依赖注入", "bean"], tag: "Spring" },
    { words: ["网络", "tcp", "http", "netty", "socket"], tag: "网络" },
    { words: ["aot", "jit", "即时编译", "提前编译"], tag: "编译" },
    { words: ["序列化", "serializ"], tag: "序列化" },
    { words: ["关键字", "final", "static", "instanceof", "transient", "volatile"], tag: "关键字" },
    { words: ["重载", "重写", "overload", "override"], tag: "重载重写" },
    { words: ["封装", "继承", "多态", "面向对象", "oop", "object-oriented"], tag: "面向对象" },
    { words: ["分布式", "rpc", "服务"], tag: "分布式" },
  ];

  const titleLower = title.toLowerCase();
  const bodyLower = bodyText.toLowerCase().slice(0, 500); // only first 500 chars

  const matched = [];
  for (const { words, tag } of tagKeywords) {
    // Check title first (stronger signal), then body
    const inTitle = words.some((w) => titleLower.includes(w));
    const inBody = words.some((w) => bodyLower.includes(w));
    if (inTitle || (inBody && !matched.includes(tag))) {
      if (!matched.includes(tag)) matched.push(tag);
    }
  }

  // Merge with default tags (topics), deduplicate, max 4 tags
  const all = [...defaultTags];
  for (const t of matched) {
    if (!all.includes(t) && all.length < 4) all.push(t);
  }
  return all;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseQuestions(markdown, category) {
  const body = stripFrontmatter(markdown);
  const defaultTags = TAG_MAP[category] || ["Java"];

  // Split by ### headings (but not #### which are sub-topics)
  const lines = body.split("\n");
  const entries = [];
  let currentHeading = null;
  let currentBody = [];

  for (let i = 0; i < lines.length; i++) {
    // Check if this is a ### heading (but not ####)
    const h3Match = lines[i].match(/^###\s+(.+)/);

    if (h3Match) {
      // Save previous entry
      if (currentHeading) {
        entries.push({
          heading: currentHeading,
          body: currentBody.join("\n").trim(),
        });
      }

      currentHeading = normalizeHeading(h3Match[1]);
      currentBody = [];
    } else if (currentHeading) {
      currentBody.push(lines[i]);
    }
  }

  // Push last entry
  if (currentHeading) {
    entries.push({
      heading: currentHeading,
      body: currentBody.join("\n").trim(),
    });
  }

  // Filter out non-question headings (sections, tables, etc.)
  return entries
    .filter((e) => {
      const h = e.heading;
      // Skip purely structural headings
      if (/(?:总结|小结|参考|参考资料|扩展阅读|推荐).*/.test(h)) return false;
      if (h.length < 3) return false;
      if (/^(表格|图示|图片|表\d)/.test(h)) return false;
      // Skip section intro headings that aren't real questions
      // "Java 集合概览", "集合框架底层数据结构总结" → skip
      // "Comparable 和 Comparator 的区别" → keep (it's a comparison question)
      if (!/[？?]/.test(h) && /(概览|概述|结构|介绍|分类)$/.test(h)) {
        return false;
      }
      return true;
    })
    .map((e) => {
      const rawAnswer = stripSubHeadings(stripCalloutLabels(stripEmoji(stripRefLinks(stripReferences(stripCallouts(stripImages(stripLinks(stripHtml(stripInlineCode(stripCodeBlocks(e.body)))))))))))
        .replace(/\n{4,}/g, "\n\n")
        .trim();

      const answer = extractStructuredAnswer(e.heading, rawAnswer);
      const tags = extractTags(e.heading, rawAnswer, defaultTags);
      const difficulty = DIFFICULTY_MAP[category] || "medium";

      // Skip questions where answer is just a reference to another article
      const refPatterns = ["详见", "参考", "请看", "见笔主", "阅读以下"];
      const isRefOnly = refPatterns.some((p) => answer.full.replace("答案：", "").startsWith(p));
      if (isRefOnly) return null;

      return {
        category,
        difficulty,
        type: "short_answer",
        title: e.heading,
        content: cleanContent(generateContent(e.heading)),
        answer: answer.full,
        hints: answer.hints,
        tags,
        options: [],
      };
    })
    .filter(Boolean);
}

// Compact answer extraction: produce 答案 + 解析 (no duplicate 扩展延伸)
function extractStructuredAnswer(title, cleanedText) {
  const text = compactText(cleanedText);

  // Split into sentences (Chinese + English terminators)
  let sentences = text.split(/(?<=[。！？；;])/).map((s) => s.trim()).filter((s) => s.length > 0);
  if (sentences.length === 0) sentences = [text];

  // Heuristic: find the "core answer" — first few substantive sentences
  let answer = "";
  let analysis = "";

  if (sentences.length <= 2) {
    answer = text;
  } else {
    // Try to identify the definition/core answer (first 1-2 sentences that form a complete thought)
    let cutoff = 1;
    for (let i = 1; i < Math.min(3, sentences.length); i++) {
      // A sentence that starts a new subtopic or example often ends the "definition" section
      if (/^(例如|比如|此外|另外|值得注意的是|也就是说)/.test(sentences[i])) {
        break;
      }
      cutoff = i + 1;
    }
    answer = sentences.slice(0, cutoff).join("").trim();
    if (answer.length < 15 && sentences.length > 2) {
      answer = sentences.slice(0, 2).join("").trim();
    }
    analysis = sentences.slice(cutoff).join("").trim();
  }

  // Cap answer length at ~400 chars, keep whole words
  if (answer.length > 400) {
    const trimmed = answer.slice(0, 400);
    // Find last sentence boundary within limit
    const lastBoundary = Math.max(
      trimmed.lastIndexOf("。"),
      trimmed.lastIndexOf("！"),
      trimmed.lastIndexOf("？"),
      trimmed.lastIndexOf("；"),
    );
    answer = lastBoundary > 20
      ? trimmed.slice(0, lastBoundary + 1)
      : trimmed.replace(/\s+\S*$/, "") + "。";
  }

  // Cap analysis length at ~800 chars
  if (analysis.length > 800) {
    const trimmed = analysis.slice(0, 800);
    const lastBoundary = Math.max(
      trimmed.lastIndexOf("。"),
      trimmed.lastIndexOf("！"),
      trimmed.lastIndexOf("？"),
      trimmed.lastIndexOf("；"),
    );
    analysis = lastBoundary > 20
      ? trimmed.slice(0, lastBoundary + 1)
      : trimmed.replace(/\s+\S*$/, "") + "。";
  }

  // Build structured answer
  let full = `答案：${answer}`;
  if (analysis) {
    full += `\n\n解析：${analysis}`;
  }

  // Generate hints: find key concepts or distinction prompts
  const hintPatterns = text.match(/[：:]\s*([^。]{8,50})/g) || [];
  const hints = hintPatterns
    .map((h) => h.replace(/^[：:]\s*/, "").replace(/[。；;，]$/, "").trim())
    .filter((h) => h.length >= 6 && h.length <= 40 && !h.includes("http"))
    .slice(0, 2);

  return { full, hints };
}

// ─── File Operations ──────────────────────────────────────────────────────────

function readSeedFile(category) {
  const filePath = path.join(SEED_DIR, `${category}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`Seed file not found: ${filePath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, "utf-8").trim();
  return JSON.parse(content);
}

function appendToSeedFile(category, newEntries) {
  const filePath = path.join(SEED_DIR, `${category}.json`);
  const existing = readSeedFile(category);
  const total = existing.length + newEntries.length;

  const json = JSON.stringify([...existing, ...newEntries], null, 2);
  fs.writeFileSync(filePath, json + "\n", "utf-8");

  console.log(`✅ Appended ${newEntries.length} questions to ${filePath}`);
  console.log(`   Now ${total} questions in ${category}`);
}

function writePreview(newEntries, category) {
  const previewPath = path.join(SEED_DIR, `_preview_${category}.json`);
  fs.writeFileSync(previewPath, JSON.stringify(newEntries, null, 2), "utf-8");
  console.log(`📝 Preview written to ${previewPath}`);
  return previewPath;
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

function printUsage() {
  console.log(`
Usage:
  node scripts/import-javaguide.mjs fetch <category> [options]
  node scripts/import-javaguide.mjs file <path> <category> [options]

Categories: ${Object.keys(GUIDES).join(", ")}
  Or any existing seed name (e.g., java_basic, java_advanced)

Options:
  --dry-run   Preview only (default)
  --append    Append to seed file (requires confirmation unless --yes)
  --yes       Skip confirmation for append
  --limit N   Only process first N questions
  --offset N  Skip first N questions

Examples:
  node scripts/import-javaguide.mjs fetch java_basic
  node scripts/import-javaguide.mjs fetch java_collections --dry-run --limit 5
  node scripts/import-javaguide.mjs fetch java_concurrent --append --yes
  node scripts/import-javaguide.mjs file ./my-doc.md my_custom --append
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args[0] === "--help" || args[0] === "-h") {
    printUsage();
    process.exit(0);
  }

  const mode = args[0]; // "fetch" or "file"
  const target = args[1];
  const category = mode === "file" ? (args[2] || "java_basic") : target;
  const opts = {
    dryRun: args.includes("--dry-run"),
    append: args.includes("--append"),
    yes: args.includes("--yes"),
    limit: null,
    offset: 0,
  };

  // Parse --limit and --offset
  const limitIdx = args.indexOf("--limit");
  if (limitIdx !== -1 && args[limitIdx + 1]) {
    opts.limit = parseInt(args[limitIdx + 1], 10);
  }
  const offsetIdx = args.indexOf("--offset");
  if (offsetIdx !== -1 && args[offsetIdx + 1]) {
    opts.offset = parseInt(args[offsetIdx + 1], 10);
  }

  // Get markdown content
  let markdown;
  if (mode === "fetch") {
    const guidePath = GUIDES[target];
    if (!guidePath) {
      // Try as direct category name
      const actualCategory = target;
      const seedFiles = fs.readdirSync(SEED_DIR).filter(f => f.endsWith(".json") && !f.startsWith("_"));
      console.log(`Available seed files: ${seedFiles.map(f => f.replace(".json", "")).join(", ")}`);
      process.exit(1);
    }
    console.log(`📡 Fetching JavaGuide: ${guidePath} ...`);
    try {
      markdown = fetchViaGitHub(guidePath);
      console.log(`   Got ${(markdown.length / 1024).toFixed(0)}KB`);
    } catch (e) {
      console.error(`❌ Failed to fetch: ${e.message}`);
      console.log(`\nTip: Make sure 'gh' CLI is installed and authenticated: gh auth status`);
      process.exit(1);
    }
  } else {
    // Read local file
    const filePath = path.resolve(target);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }
    markdown = fs.readFileSync(filePath, "utf-8");
    console.log(`📄 Read local file: ${filePath}`);
  }

  // Parse
  console.log(`   Parsing questions (category: ${category}) ...`);
  let entries = parseQuestions(markdown, category);

  // Apply offset/limit
  if (opts.offset > 0) {
    entries = entries.slice(opts.offset);
  }
  if (opts.limit && opts.limit < entries.length) {
    entries = entries.slice(0, opts.limit);
  }

  console.log(`   Found ${entries.length} questions\n`);

  // Preview
  if (entries.length === 0) {
    console.log("⚠️  No questions found. The page may use a different heading format.");
    process.exit(0);
  }

  console.log("📋 Preview (first 3):");
  for (let i = 0; i < Math.min(3, entries.length); i++) {
    const e = entries[i];
    console.log(`  ${i + 1}. ${e.title}`);
    console.log(`     type=${e.type} | difficulty=${e.difficulty} | tags=[${e.tags.join(", ")}]`);
    console.log(`     content: ${e.content.substring(0, 60)}...`);
    console.log(`     answer: ${e.answer.substring(0, 80)}...\n`);
  }
  if (entries.length > 3) {
    console.log(`     ... and ${entries.length - 3} more`);
  }

  // Write preview file
  const previewPath = writePreview(entries, category);

  // Append?
  if (opts.append) {
    const confirm = opts.yes || process.env.NO_CONFIRM;
    if (!confirm) {
      console.log(`\n⚠️  About to append ${entries.length} questions to ${category}.json`);
      console.log(`   Run with --yes to skip this prompt, or use --dry-run to preview only.`);
      process.exit(0);
    }
    appendToSeedFile(category, entries);
    console.log(`\nNext steps:`);
    console.log(`  1. Review: nano ${previewPath}`);
    console.log(`  2. Rebuild data: npm run data (from frontend/)`);
    console.log(`  3. Rebuild app: npm run build`);
  } else {
    console.log(`\n💡 To append these questions to seed data:`);
    console.log(`  node scripts/import-javaguide.mjs ${mode} ${target} ${mode === "file" ? category : ""} --append --yes`);
    console.log(`\nThen rebuild:`);
    console.log(`  cd frontend && npm run data && npm run build`);
    console.log(`\nPreview saved to: ${previewPath}`);
  }
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
