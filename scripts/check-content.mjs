// 出典の参照や公式/考察のルールを検査する。違反があれば終了コード1。
import { readdirSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';

const errors = [];
const load = (dir) =>
  readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => ({ id: f.replace(/\.yaml$/, ''), file: `${dir}/${f}`, data: parse(readFileSync(`${dir}/${f}`, 'utf8')) }));

const phases = parse(readFileSync('src/data/phases.yaml', 'utf8'));
const phaseIds = new Set(phases.map((p) => p.id));
const songs = load('src/content/songs');
const songIds = new Set(songs.map((s) => s.id));
const events = load('src/content/events');

const checkRefs = (file, ids, defined, where) => {
  for (const id of ids ?? []) if (!defined.has(id)) errors.push(`${file}: ${where} が未定義の出典 "${id}" を参照`);
};

for (const s of songs) {
  const d = s.data;
  const srcIds = new Set((d.sources ?? []).map((x) => x.id));
  if (!d.basicSources?.length) errors.push(`${s.file}: basicSources がない`);
  if (!phaseIds.has(d.phase)) errors.push(`${s.file}: 不明な phase "${d.phase}"`);
  checkRefs(s.file, d.basicSources, srcIds, 'basicSources');
  for (const t of d.tieups ?? []) {
    if (!t.type || !t.work) errors.push(`${s.file}: タイアップに type と work が必要`);
    checkRefs(s.file, t.sources, srcIds, `タイアップ「${t.work}」`);
  }
  const c = d.credits ?? {};
  if (c.lyrics || c.music || c.arrangement) {
    if (!c.sources?.length || !c.evidence) errors.push(`${s.file}: クレジットに出典と evidence が必要`);
    checkRefs(s.file, c.sources, srcIds, 'credits');
  }
  if (d.mv && !/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/.test(d.mv)) errors.push(`${s.file}: mv は公式YouTubeの watch URL にする`);
  (d.background ?? []).forEach((b, i) => {
    const where = `background[${i}]`;
    checkRefs(s.file, b.sources, srcIds, where);
    if (b.kind === 'official') {
      if (!b.sources?.length) errors.push(`${s.file}: ${where} 公式の記述に出典がない`);
      if (!b.evidence) errors.push(`${s.file}: ${where} 公式の記述に根拠の一文(evidence)がない`);
    }
    if (b.kind === 'secondary' && (!b.sources?.length || !b.evidence)) errors.push(`${s.file}: ${where} 二次情報に出典と evidence が必要`);
    if (b.kind === 'interpretation' && !b.basis) errors.push(`${s.file}: ${where} 考察に根拠(basis)がない`);
  });
  if (d.status === 'reviewed' && !(d.background ?? []).length) errors.push(`${s.file}: reviewed なのに解説がない`);
}

for (const e of events) {
  if (!phaseIds.has(e.data.phase)) errors.push(`${e.file}: 不明な phase "${e.data.phase}"`);
  for (const id of e.data.relatedSongs ?? []) if (!songIds.has(id)) errors.push(`${e.file}: 存在しない曲 "${id}"`);
}

// メンバーページ: 出典IDの参照と evidence
const m = parse(readFileSync('src/data/members.yaml', 'utf8'));
const mSrc = new Set(m.sources.map((x) => x.id));
for (const f of [...m.band.facts, ...m.members.flatMap((x) => x.facts)]) {
  if (!f.sources?.length || !f.evidence) errors.push(`members.yaml: 「${f.text}」に出典と evidence が必要`);
  checkRefs('members.yaml', f.sources, mSrc, `「${f.text}」`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} 件の問題`);
  process.exit(1);
}
console.log(`OK: 曲 ${songs.length} / 出来事 ${events.length} / 時期 ${phases.length}`);
