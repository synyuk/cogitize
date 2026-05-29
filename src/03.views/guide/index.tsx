import fs from "fs";
import path from "path";

const readmeContent = () => {
  const filePath = path.join(process.cwd(), "README.md");
  return fs.readFileSync(filePath, "utf-8");
};

const escapeHtml = (value: string) => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

const formatInline = (value: string) => {
  const inlineCodes: string[] = [];

  let formatted = value.replace(/`([^`]+)`/g, (_, code: string) => {
    const token = `__GUIDE_INLINE_CODE_${inlineCodes.length}__`;
    inlineCodes.push(
      `<code class="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800">${escapeHtml(code)}</code>`,
    );
    return token;
  });

  formatted = escapeHtml(formatted)
    .replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="font-semibold text-slate-950">$1</strong>',
    )
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" class="font-medium text-sky-700 underline decoration-sky-300 underline-offset-4 transition hover:text-sky-900" target="_blank" rel="noreferrer">$1</a>',
    );

  inlineCodes.forEach((code, index) => {
    formatted = formatted.replace(`__GUIDE_INLINE_CODE_${index}__`, code);
  });

  return formatted;
};

const buildTable = (rows: string[]) => {
  if (rows.length < 2) {
    return rows
      .map(
        (row) =>
          `<p class="text-base leading-7 text-slate-700">${formatInline(row)}</p>`,
      )
      .join("");
  }

  const normalizeCells = (row: string) => {
    return row
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());
  };

  const [headerRow, , ...bodyRows] = rows;
  const headers = normalizeCells(headerRow);
  const body = bodyRows.map(normalizeCells);

  return `
    <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse text-left text-sm text-slate-700">
          <thead class="bg-slate-950 text-slate-50">
            <tr>
              ${headers
                .map(
                  (cell) =>
                    `<th class="px-4 py-3 font-semibold">${formatInline(cell)}</th>`,
                )
                .join("")}
            </tr>
          </thead>
          <tbody>
            ${body
              .map(
                (cells) => `
                  <tr class="border-t border-slate-200 bg-white/90">
                    ${cells
                      .map(
                        (cell) =>
                          `<td class="px-4 py-3 align-top">${formatInline(cell)}</td>`,
                      )
                      .join("")}
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

const parseMarkdown = (raw: string) => {
  const lines = raw.split(/\r?\n/);
  const html: string[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let tableRows: string[] = [];
  let codeFence: { language: string; lines: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) {
      return;
    }

    html.push(
      `<p class="text-base leading-8 text-slate-700 sm:text-lg">${formatInline(paragraph.join(" "))}</p>`,
    );
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    html.push(`
      <ul class="space-y-3 rounded-3xl border border-slate-200 bg-white/80 p-5 text-base leading-7 text-slate-700 shadow-sm">
        ${listItems.join("")}
      </ul>
    `);
    listItems = [];
  };

  const flushTable = () => {
    if (tableRows.length === 0) {
      return;
    }

    html.push(buildTable(tableRows));
    tableRows = [];
  };

  const flushCode = () => {
    if (!codeFence) {
      return;
    }

    const language = codeFence.language || "text";
    const code = escapeHtml(codeFence.lines.join("\n"));

    html.push(`
      <figure class="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <figcaption class="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
          <span>Code block</span>
          <span>${escapeHtml(language)}</span>
        </figcaption>
        <pre class="overflow-x-auto p-5 text-sm leading-7 text-slate-100"><code data-language="${escapeHtml(language)}" class="font-mono">${code}</code></pre>
      </figure>
    `);

    codeFence = null;
  };

  const flushBlocks = () => {
    flushParagraph();
    flushList();
    flushTable();
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (codeFence) {
      if (trimmed.startsWith("```")) {
        flushCode();
      } else {
        codeFence.lines.push(line);
      }
      return;
    }

    const codeFenceMatch = trimmed.match(/^```(\w+)?$/);
    if (codeFenceMatch) {
      flushBlocks();
      codeFence = { language: codeFenceMatch[1] ?? "", lines: [] };
      return;
    }

    if (trimmed === "") {
      flushBlocks();
      return;
    }

    if (/^---+$/.test(trimmed)) {
      flushBlocks();
      html.push('<hr class="border-none h-px bg-slate-200" />');
      return;
    }

    if (/^\|.*\|$/.test(trimmed)) {
      flushParagraph();
      flushList();
      tableRows.push(trimmed);
      return;
    }

    if (/^\|?(\s*:?-+:?\s*\|)+\s*$/.test(trimmed)) {
      tableRows.push(trimmed);
      return;
    }

    const checklistMatch = trimmed.match(/^- \[([ x])\] (.+)$/i);
    if (checklistMatch) {
      flushParagraph();
      flushTable();
      const checked = checklistMatch[1].toLowerCase() === "x";
      listItems.push(`
        <li class="flex items-start gap-3">
          <span class="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white text-transparent"}">
            <span class="text-[10px]">✓</span>
          </span>
          <span>${formatInline(checklistMatch[2])}</span>
        </li>
      `);
      return;
    }

    const listMatch = trimmed.match(/^- (.+)$/);
    if (listMatch) {
      flushParagraph();
      flushTable();
      listItems.push(`
        <li class="flex items-start gap-3">
          <span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-500"></span>
          <span>${formatInline(listMatch[1])}</span>
        </li>
      `);
      return;
    }

    const blockquoteMatch = trimmed.match(/^>\s+(.+)$/);
    if (blockquoteMatch) {
      flushBlocks();
      html.push(`
        <blockquote class="rounded-3xl border-l-4 border-amber-400 bg-amber-50 px-5 py-4 text-base leading-7 text-slate-700 shadow-sm">
          ${formatInline(blockquoteMatch[1])}
        </blockquote>
      `);
      return;
    }

    const heading3Match = trimmed.match(/^###\s+(.+)$/);
    if (heading3Match) {
      flushBlocks();
      html.push(
        `<h3 class="text-2xl font-semibold tracking-tight text-slate-950">${formatInline(heading3Match[1])}</h3>`,
      );
      return;
    }

    const heading2Match = trimmed.match(/^##\s+(.+)$/);
    if (heading2Match) {
      flushBlocks();
      html.push(
        `<h2 class="pt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">${formatInline(heading2Match[1])}</h2>`,
      );
      return;
    }

    const heading1Match = trimmed.match(/^#\s+(.+)$/);
    if (heading1Match) {
      flushBlocks();
      html.push(
        `<h1 class="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">${formatInline(heading1Match[1])}</h1>`,
      );
      return;
    }

    paragraph.push(trimmed);
  });

  flushBlocks();
  flushCode();

  return html.join("\n");
};

const GuideView = () => {
  const raw = readmeContent();
  const html = parseMarkdown(raw);

  return (
    <section className="min-h-dvh bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.10),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-12 sm:px-6 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex rounded-full border border-slate-900/10 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
            Guide page
          </span>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Test assignment guide
            </h1>
          </div>
        </div>

        <article className="overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="border-b border-slate-200 bg-slate-950 px-6 py-4 text-sm font-medium text-slate-200">
            README.md presentation
          </div>
          <div
            className="space-y-6 px-5 py-6 sm:px-8 sm:py-8"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </div>
    </section>
  );
};

export default GuideView;
