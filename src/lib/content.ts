import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import YAML from 'yaml';

const projectRoot = process.cwd();
const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false
});

export interface LegacyPage {
  source: string;
  route: string;
  title: string;
  description: string;
  layout: string;
  html: string;
  data: Record<string, any>;
}

export interface IndexRow {
  cells: string[];
}

const textFile = (relativePath: string) =>
  fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

function walk(directory: string): string[] {
  const absolute = path.join(projectRoot, directory);
  if (!fs.existsSync(absolute)) return [];

  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(relative) : [relative];
  });
}

function normalizeLiquidAssets(value: string) {
  return value
    .replace(/\{\{\s*site\.baseurl\s*\|\s*append:\s*["']([^"']+)["']\s*\}\}/g, '$1')
    .replace(/\{\{\s*site\.baseurl\s*\}\}/g, '');
}

export function sanitizeLegacyHtml(value: string) {
  let html = normalizeLiquidAssets(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/\s(?:style|onclick|data-aos)=("[^"]*"|'[^']*')/gi, '')
    .replace(
      /<button\b[^>]*>\s*<a\b([^>]*)>([\s\S]*?)<\/a>\s*<\/button>/gi,
      '<a class="legacy-cta"$1>$2</a>'
    )
    .replace(/target=["']_blank["'](?!\s+rel=)/gi, 'target="_blank" rel="noreferrer"')
    .replace(/<img(?![^>]*\bloading=)([^>]*)>/gi, '<img loading="lazy" decoding="async"$1>');

  html = html.replace(/<([a-z][a-z0-9]*)([^>]*\sid=["'][^"']+-view["'][^>]*)>/gi, '<$1$2 data-tab-panel>');
  return html;
}

export function renderMarkdownInline(value: string) {
  return normalizeLiquidAssets(markdown.renderInline(value.trim()));
}

export function readLegacyFile(relativePath: string): LegacyPage {
  const raw = textFile(relativePath);
  const parsed = matter(raw);
  const isMarkdown = /\.(md|markdown)$/i.test(relativePath);
  const rendered = isMarkdown ? markdown.render(normalizeLiquidAssets(parsed.content)) : parsed.content;
  const fallbackRoute = `/${relativePath.replace(/\.(md|markdown|html)$/i, '').replace(/\/index$/, '')}/`;
  const route = String(parsed.data.permalink || fallbackRoute);

  return {
    source: relativePath,
    route,
    title: String(parsed.data.title || 'SCCC'),
    description: String(parsed.data.summary || parsed.data.description || `${parsed.data.title || 'SCCC'} 안내`),
    layout: String(parsed.data.layout || 'page'),
    html: sanitizeLegacyHtml(rendered),
    data: parsed.data
  };
}

export function getLegacyPages() {
  const detailFiles = ['content/study', 'content/recruit', 'content/contest']
    .flatMap(walk)
    .filter((file) => /\.(html|md|markdown)$/i.test(file))
    .filter((file) => !file.endsWith('/index.md'));

  return [...detailFiles, 'content/icpc-guide.md'].map(readLegacyFile);
}

export function getIndexRows(relativePath: string): IndexRow[] {
  const parsed = matter(textFile(relativePath));
  return parsed.content
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith('|'))
    .map((line) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()))
    .filter((cells) => !cells.every((cell) => /^:?-+:?$/.test(cell.replace(/\s/g, ''))))
    .slice(1)
    .map((cells) => ({ cells: cells.map(renderMarkdownInline) }));
}

export function getSolutions() {
  return walk('content/solutions')
    .filter((file) => /\.(md|markdown)$/i.test(file))
    .map((file) => {
      const page = readLegacyFile(file);
      const slug = path.basename(file).replace(/\.(md|markdown)$/i, '');
      return { ...page, route: `/solutions/${slug}/`, slug };
    })
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
}

export function readYaml<T = any>(relativePath: string): T {
  return YAML.parse(textFile(relativePath)) as T;
}

export function getAwardYears() {
  return walk('content/data/award')
    .filter((file) => /\/\d{4}\.yml$/.test(file))
    .map((file) => ({
      year: path.basename(file, '.yml'),
      contests: readYaml<any[]>(file) || []
    }))
    .sort((a, b) => Number(b.year) - Number(a.year));
}

export function getLeadershipTable() {
  const source = textFile('content/legacy/home.html');
  const match = source.match(/역대 SCCC 운영진 명단[\s\S]*?(<table>[\s\S]*?<\/table>)/i);
  return match ? sanitizeLegacyHtml(match[1]) : '';
}

export function getPageByRoute(route: string) {
  return getLegacyPages().find((page) => page.route.replace(/\/$/, '') === route.replace(/\/$/, ''));
}
