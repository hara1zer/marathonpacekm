import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
function livePages(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.')) return [];
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return livePages(full);
    return entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}
const paths = livePages(root);
let productMentions = 0;
for (const path of paths) {
  const html = readFileSync(path, 'utf8');
  const relative = path.slice(root.length + 1).replaceAll('\\', '/');
  assert.doesNotMatch(html, /https?:\/\/amzn\.to\/|href=["'][^"']*amazon\.[^"']*[?&]tag=|data-affiliate-product=|As an Amazon Associate I earn from qualifying purchases/i, 'expired shopping links in ' + relative);
  assert.doesNotMatch(html, /Some links on this page are affiliate links|The following shopping links are affiliates|These links are affiliates|MarathonPaceKM may earn a small commission/i, 'outdated disclosure in ' + relative);
  if (html.includes('Maurten Gel 100') || html.includes('Norwegian Singles by James Copeland')) productMentions++;
}
assert.ok(paths.length >= 100, 'Expected to scan the full set of public pages, not just selected files');
assert.ok(productMentions >= 2, 'Product examples and explanatory text should remain available');
for (const page of ['privacy/index.html', 'editorial-policy/index.html']) {
  const text = readFileSync(join(root, page), 'utf8');
  assert.match(text, /no active Amazon Associates account/i, 'current account status must be stated on ' + page);
}
console.log('Inactive Amazon links and disclosures removed from ' + paths.length + ' public HTML files; useful product examples retained.');
