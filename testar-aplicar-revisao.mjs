/**
 * testar-aplicar-revisao.mjs — o aplicador faz o que o Erez pediu em 27/10?
 *
 *   - a traducao da palavra corrigida muda nos 8 kadishim (onde o texto era o mesmo);
 *   - a transliteracao corrigida muda SO no Yatom e no DeRabanan do nussach dela;
 *   - a transliteracao escrita (onde nao havia fonte) entra so no nussach dela,
 *     e so onde faltava;
 *   - o "(não escrevi, mas está errado)" NAO vai parar no app;
 *   - nada alem disso muda.
 *
 * Roda numa COPIA dos dados, numa pasta temporaria: nunca toca em sync/ de verdade.
 * Os casos sao escolhidos dos proprios dados, nao escritos a mao — se os dados
 * mudarem, o teste acha outros.
 *
 * Uso: node testar-aplicar-revisao.mjs
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const LG = 'fr';
const semNikud = s => String(s || '').normalize('NFD').replace(/[֑-ׇ̀-ͯ]/g, '').replace(/[^א-ת]/g, '');
const nussachDe = f => f.split('_')[0];

const ARQUIVOS = readdirSync('sync').filter(f => f.endsWith('_sync.json')).sort();
const ler = dir => Object.fromEntries(ARQUIVOS.map(f => [f, JSON.parse(readFileSync(join(dir, 'sync', f), 'utf8'))]));
const antes = ler('.');
const palavras = dados => Object.entries(dados).flatMap(([f, d]) =>
  d.versos.flatMap(v => v.palavras.map((p, j) => ({ f, n: v.n, j, p }))));

// ---------- escolher os casos nos dados ----------
const todas = palavras(antes);
const porTexto = (campo) => {
  const m = new Map();
  for (const x of todas) {
    const t = (x.p[campo] || {})[LG];
    if (!t) continue;
    const k = `${semNikud(x.p.hebrew)}|${t}`;
    if (!m.has(k)) m.set(k, { heb: x.p.hebrew, t, arqs: new Set() });
    m.get(k).arqs.add(x.f);
  }
  return [...m.values()];
};
// glosa igual em mais de dois nussachim
const glosa = porTexto('glosas')
  .find(g => new Set([...g.arqs].map(nussachDe)).size >= 3);
// transliteracao igual em ashkenaz e em outro nussach
const tl = porTexto('transliteracoes')
  .find(g => g.arqs.has('ashkenaz_yatom_sync.json') &&
             [...g.arqs].some(f => nussachDe(f) !== 'ashkenaz'));
// palavra sem transliteracao francesa no sefaradi
const falta = todas.find(x => nussachDe(x.f) === 'sefaradi' && !(x.p.transliteracoes || {})[LG]);
// uma outra glosa, para o "(não escrevi...)"
const semTextoAlvo = porTexto('glosas').find(g => g !== glosa);
if (!glosa || !tl || !falta || !semTextoAlvo) {
  console.error('Nao achei nos dados os casos de que o teste precisa.'); process.exit(2);
}

const recado = [
  `#kadish-revisao lang=${LG}`,
  `Revisão de francês — 4 de 293 itens conferidos.`,
  `3 para corrigir · 1 transliterações escritas por mim`,
  `(cada item vale para os 8 kadishim)`,
  ``,
  `— PARA CORRIGIR —`,
  ``,
  `tradução da palavra — ${glosa.heb}\n   está: ${glosa.t}\n   deveria ser: ${glosa.t} [TESTE]`,
  ``,
  `transliteração · ashkenaz — ${tl.heb}\n   está: ${tl.t}\n   deveria ser: ${tl.t}-TESTE`,
  ``,
  `tradução da palavra — ${semTextoAlvo.heb}\n   está: ${semTextoAlvo.t}\n   deveria ser: (não escrevi, mas está errado)`,
  ``,
  `— TRANSLITERAÇÕES QUE EU ESCREVI (não tinham fonte) —`,
  ``,
  `${falta.p.hebrew} · sefaradi (pt: ${falta.p.transliteration_pt})\n   francês: escrita-TESTE`,
  ``,
].join('\n');

// ---------- rodar numa copia ----------
const tmp = mkdtempSync(join(tmpdir(), 'kadish-aplicar-'));
cpSync('sync', join(tmp, 'sync'), { recursive: true });
for (const f of ['glossario.json', 'ancoras.json', 'aplicar-revisao.mjs']) cpSync(f, join(tmp, f));
writeFileSync(join(tmp, 'recado.txt'), recado, 'utf8');
let saida = '';
try {
  saida = execFileSync(process.execPath, ['aplicar-revisao.mjs', 'recado.txt', '--confirmar'],
                       { cwd: tmp, encoding: 'utf8' });
} catch (e) { saida = (e.stdout || '') + (e.stderr || ''); }
const depois = ler(tmp);
rmSync(tmp, { recursive: true, force: true });

// ---------- conferir ----------
let falhou = 0;
const confere = (nome, ok, extra = '') => {
  console.log(`${ok ? 'OK   ' : 'FALHA'} ${nome}${extra ? '  — ' + extra : ''}`);
  if (!ok) falhou++;
};
const d = palavras(depois);
const par = (x) => d.find(y => y.f === x.f && y.n === x.n && y.j === x.j).p;

const glosaAntes = todas.filter(x => semNikud(x.p.hebrew) === semNikud(glosa.heb) && (x.p.glosas || {})[LG] === glosa.t);
confere(`a traducao da palavra mudou nos ${new Set(glosaAntes.map(x => x.f)).size} arquivos onde o texto era o mesmo`,
  glosaAntes.every(x => par(x).glosas[LG] === `${glosa.t} [TESTE]`));

const tlAntes = todas.filter(x => semNikud(x.p.hebrew) === semNikud(tl.heb) && (x.p.transliteracoes || {})[LG] === tl.t);
const tlAsh = tlAntes.filter(x => nussachDe(x.f) === 'ashkenaz');
const tlOutros = tlAntes.filter(x => nussachDe(x.f) !== 'ashkenaz');
confere(`a transliteracao mudou no Ashkenaz (${tlAsh.length} ocorrencias)`,
  tlAsh.length > 0 && tlAsh.every(x => par(x).transliteracoes[LG] === `${tl.t}-TESTE`));
confere(`e NAO mudou nos outros nussachim (${tlOutros.length} ocorrencias com o mesmo texto)`,
  tlOutros.length > 0 && tlOutros.every(x => par(x).transliteracoes[LG] === tl.t));

const faltaAntes = todas.filter(x => semNikud(x.p.hebrew) === semNikud(falta.p.hebrew) && !(x.p.transliteracoes || {})[LG]);
confere('a transliteracao escrita entrou no Sefaradi, onde faltava',
  faltaAntes.filter(x => nussachDe(x.f) === 'sefaradi').every(x => par(x).transliteracoes[LG] === 'escrita-TESTE'));
confere('e em nenhum outro nussach',
  faltaAntes.filter(x => nussachDe(x.f) !== 'sefaradi').every(x => !(par(x).transliteracoes || {})[LG]));

confere('o "(não escrevi, mas está errado)" nao foi parar no app',
  !d.some(x => /não escrevi/.test(JSON.stringify(x.p))));

// Nada alem do esperado: so palavras com aqueles tres hebraicos mudaram.
const esperados = new Set([glosa.heb, tl.heb, falta.p.hebrew].map(semNikud));
const mudadas = todas.filter(x => JSON.stringify(x.p) !== JSON.stringify(par(x)));
confere('nenhuma outra palavra mudou',
  mudadas.every(x => esperados.has(semNikud(x.p.hebrew))), `${mudadas.length} palavras mudaram`);
confere('o aplicador gravou', /gravado:/.test(saida), saida.split('\n').slice(-3).join(' | '));

console.log(falhou ? `\nVERMELHO: ${falhou} falha(s)` : '\nVERDE: o aplicador corrige onde deve e so onde deve');
process.exit(falhou ? 1 : 0);
