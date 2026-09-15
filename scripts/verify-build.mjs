import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function existsForUrl(url) {
  const clean = decodeURI(url.split(/[?#]/)[0]);
  const relative = clean.replace(/^\//, '');
  const direct = path.join(root, relative);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return true;
  if (fs.existsSync(path.join(direct, 'index.html'))) return true;
  return false;
}

const htmlFiles = walk(root).filter((file) => file.endsWith('.html'));
const failures = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('{{') || html.includes('{%')) {
    failures.push(`${path.relative(root, file)}: unresolved template syntax`);
  }

  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    const url = match[1];
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    if (!existsForUrl(url)) failures.push(`${path.relative(root, file)}: missing ${url}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Verified ${htmlFiles.length} HTML files and their internal assets.`);
