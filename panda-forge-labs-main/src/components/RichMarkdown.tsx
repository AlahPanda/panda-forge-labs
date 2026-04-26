/**
 * Rich Markdown renderer with custom AlahPanda extensions:
 *   - [badge:Label:Value]              → pill badge
 *   - > [!INFO|WARN|TIP|DANGER] text   → callout block
 *   - ::: grid 2|3 ... :::              → grid columns
 *   - YouTube URLs (own line)          → responsive iframe embed
 *   - Plus standard MD: # ## ###, **bold**, `code`, lists, code fences, links, images.
 */
import { useMemo } from 'react';

interface Props { markdown: string; className?: string; }

export default function RichMarkdown({ markdown, className = '' }: Props) {
  const html = useMemo(() => render(markdown ?? ''), [markdown]);
  if (!markdown?.trim()) return null;
  return (
    <article
      className={`prose-apl ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/* ---------- helpers ---------- */
function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function ytId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

function inline(s: string) {
  let out = escapeHtml(s);

  // Badges: [badge:Label:Value]
  out = out.replace(/\[badge:([^:\]]+):([^\]]+)\]/g, (_m, label, value) =>
    `<span class="apl-badge"><span class="apl-badge-l">${label}</span><span class="apl-badge-v">${value}</span></span>`
  );

  // Images ![alt](url) — must run before links
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, url) =>
    `<img src="${url}" alt="${alt}" loading="lazy" class="apl-img" />`
  );

  // Links
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) =>
    `<a href="${url}" target="_blank" rel="noreferrer">${text}</a>`
  );

  // Inline code, bold, italic
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');

  return out;
}

function calloutClass(kind: string) {
  const k = kind.toUpperCase();
  if (k === 'WARN' || k === 'WARNING') return 'apl-callout warn';
  if (k === 'DANGER' || k === 'ERROR') return 'apl-callout danger';
  if (k === 'TIP' || k === 'OK') return 'apl-callout tip';
  return 'apl-callout info';
}

function render(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;
  let inUl = false, inOl = false;
  const closeLists = () => {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };

  while (i < lines.length) {
    const line = lines[i];

    // Grid block: ::: grid 2 ... :::
    const gridOpen = /^:::\s*grid\s*(\d+)?/.exec(line);
    if (gridOpen) {
      closeLists();
      const cols = Math.min(Math.max(parseInt(gridOpen[1] ?? '2', 10) || 2, 1), 4);
      i++;
      const buf: string[] = [];
      while (i < lines.length && !/^:::\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; // skip closing :::
      // split by blank line into columns
      const blocks = buf.join('\n').split(/\n{2,}/).map((b) => render(b));
      out.push(`<div class="apl-grid cols-${cols}">${blocks.map(b => `<div>${b}</div>`).join('')}</div>`);
      continue;
    }

    // Code fence
    if (/^```/.test(line)) {
      closeLists();
      const lang = line.replace(/^```/, '').trim();
      i++;
      const buf: string[] = [];
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      out.push(`<pre><code${lang ? ` data-lang="${lang}"` : ''}>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }

    // Callout: > [!INFO] text   (single or multi-line)
    const callout = /^>\s*\[!(\w+)\]\s*(.*)$/.exec(line);
    if (callout) {
      closeLists();
      const cls = calloutClass(callout[1]);
      const buf = [callout[2]];
      i++;
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      out.push(`<blockquote class="${cls}">${inline(buf.join(' ').trim())}</blockquote>`);
      continue;
    }

    // YouTube on its own line
    const yt = ytId(line.trim());
    if (yt && !line.includes('](')) {
      closeLists();
      out.push(`<div class="apl-video"><iframe src="https://www.youtube.com/embed/${yt}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`);
      i++; continue;
    }

    // Headings
    const h3 = /^###\s+(.+)$/.exec(line);
    const h2 = /^##\s+(.+)$/.exec(line);
    const h1 = /^#\s+(.+)$/.exec(line);
    if (h3) { closeLists(); out.push(`<h3>${inline(h3[1])}</h3>`); i++; continue; }
    if (h2) { closeLists(); out.push(`<h2>${inline(h2[1])}</h2>`); i++; continue; }
    if (h1) { closeLists(); out.push(`<h1>${inline(h1[1])}</h1>`); i++; continue; }

    // HR
    if (/^---+\s*$/.test(line)) { closeLists(); out.push('<hr />'); i++; continue; }

    // Lists
    const ol = /^\d+\.\s+(.+)$/.exec(line);
    if (ol) { if (!inOl) { closeLists(); out.push('<ol>'); inOl = true; } out.push(`<li>${inline(ol[1])}</li>`); i++; continue; }
    const ul = /^[-*]\s+(.+)$/.exec(line);
    if (ul) { if (!inUl) { closeLists(); out.push('<ul>'); inUl = true; } out.push(`<li>${inline(ul[1])}</li>`); i++; continue; }

    // Blank
    if (!line.trim()) { closeLists(); i++; continue; }

    // Paragraph
    closeLists();
    const para = [line]; i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|```|[-*]\s|\d+\.\s|>|:::|---+\s*$)/.test(lines[i])) {
      para.push(lines[i]); i++;
    }
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  closeLists();
  return out.join('\n');
}
