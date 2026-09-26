// 公式の記述に付けた根拠の一文（evidence）が、出典ページの本文に実在するかを確かめる。
// ネットワークを使うので CI では動かさず、手元で `npm run verify-evidence [ファイル...]` として使う。
import { readdirSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';

const dir = 'src/content/songs';
const files = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(dir).map((f) => `${dir}/${f}`);
const norm = (s) => s.normalize('NFKC').replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, '').replace(/[\s「」『』“”"'’‘、。,.!！?？・…―—\-–〜～()（）]/g, '').toLowerCase();
const cache = new Map();
async function page(url) {
  if (!cache.has(url)) {
    cache.set(url, fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } })
      .then(async (r) => {
        if (!r.ok) return null;
        // Shift_JIS などのページもあるので、宣言された文字コードで読む
        const buf = Buffer.from(await r.arrayBuffer());
        const head = buf.subarray(0, 2048).toString('latin1');
        const cs = (r.headers.get('content-type')?.match(/charset=([\w-]+)/i) ?? head.match(/charset=["']?([\w-]+)/i))?.[1] ?? 'utf-8';
        return new TextDecoder(cs.toLowerCase().replace('x-sjis', 'shift_jis')).decode(buf);
      })
      .then((t) => (t ? norm(t) : null))
      .catch(() => null));
  }
  return cache.get(url);
}

let ok = 0, missing = 0, unreachable = 0;
for (const file of files) {
  const d = parse(readFileSync(file, 'utf8'));
  if (d.status !== 'reviewed') continue;
  for (const b of d.background ?? []) {
    if (b.kind === 'interpretation' || !b.evidence) continue;
    const urls = b.sources.map((id) => d.sources.find((s) => s.id === id)?.url).filter(Boolean);
    const texts = await Promise.all(urls.map(page));
    if (texts.every((t) => t === null)) { unreachable++; console.log(`取得できず  ${file}: ${urls.join(' ')}`); continue; }
    if (texts.some((t) => t?.includes(norm(b.evidence)))) ok++;
    else { missing++; console.log(`見つからない ${file}: ${b.evidence}`); }
  }
}
console.log(`\n一致 ${ok} / 見つからない ${missing} / 取得できず ${unreachable}`);
process.exit(missing ? 1 : 0);
