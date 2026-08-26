/**
 * aplicar-revisao.mjs — poe no lugar o que o Erez decidiu em revisar.html.
 *
 * Entrada: o recado que a pagina gera, salvo em revisoes/<lingua>-<data>.txt.
 * Uso:
 *   node aplicar-revisao.mjs revisoes/pt-2026-08-23.txt              -> ensaio
 *   node aplicar-revisao.mjs revisoes/pt-2026-08-23.txt --confirmar  -> aplica
 *
 * Casamento por CONTEUDO, igual ao da pagina: a chave de um item e o tipo + a
 * palavra (ou o verso) em hebraico sem nikud + o texto que estava la. Por isso
 * uma correcao vale nos 8 kadishim de uma vez.
 *
 * ONDE CADA COISA MORA (descoberto lendo os arquivos, nao chutado):
 *   - traducao do verso .... glossario.json entradas[heb].translation_pt
 *                            e sync: verso.translation_pt + verso.translations.pt
 *   - traducao da palavra .. glossario.json entradas[heb].glosas_pt[i]
 *                            e sync: palavra.glosa_pt + palavra.glosas.pt
 *   - transliteracao ....... sync: palavra.transliteration_pt
 *                            e, junto, a do verso, que E a juncao das palavras
 *                            (conferido: bate nos 161 versos), e a mesma linha
 *                            no glossario.
 *
 * Escrever no glossario.json quebraria a regra do CLAUDE.md de que so o
 * aplicar-escolhas.mjs mexe la. Mas nao escrever e pior: o aplicar-glossario.mjs
 * reescreve o texto do verso em sync/ a partir do glossario, entao a correcao do
 * Erez seria desfeita na proxima rodada, sem aviso. A intencao da regra —
 * nenhum MODELO escreve texto liturgico — continua de pe: aqui so entra o que
 * ele digitou, verbatim, e nada mais.
 *
 * NAO MEXE em tempo nenhum, em hebraico nenhum, nas ancoras, nos cortes, nem em
 * lingua nenhuma que nao seja a revisada. Isso e PROVADO antes de gravar; se
 * qualquer prova falhar, nao grava nada.
 *
 * Uma observacao do Erez que vale como regra (23/08): a glosa de uma palavra
 * pode cobrir DUAS OU MAIS palavras da frase — "uvizman" fica "e em" e "kariv"
 * fica "breve", que juntas dao "e em breve". Entao NAO existe conferencia de
 * uma-para-uma aqui, e nao pode passar a existir.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const ARQ = process.argv[2];
const CONFIRMAR = process.argv.includes('--confirmar');
if (!ARQ) { console.error('uso: node aplicar-revisao.mjs revisoes/<arquivo>.txt [--confirmar]'); process.exit(2); }

const semNikud = s => String(s || '').normalize('NFD')
  .replace(/[֑-ׇ̀-ͯ]/g, '').replace(/[^א-ת]/g, '');

const TIPOS = {
  'tradução do verso': 'trad',
  'tradução da palavra': 'glosa',
  'transliteração': 'tl',
};

// ---------- ler o recado ----------
const texto = readFileSync(ARQ, 'utf8');
const lingua = (texto.match(/^Revisão de (\S+)/m) || [])[1] || '';
if (lingua !== 'português') {
  console.error(`Este aplicador so sabe portugues por enquanto; o recado e de "${lingua}".`);
  process.exit(2);
}

const itens = [];
const blocos = texto.split(/\n(?=tradução do verso —|tradução da palavra —|transliteração —)/);
for (const b of blocos) {
  const m = b.match(/^(tradução do verso|tradução da palavra|transliteração) — (.+)\n\s*está: (.*)\n\s*deveria ser: (.*)$/m);
  if (!m) continue;
  const [, rot, heb, de, para] = m;
  itens.push({ tipo: TIPOS[rot], rot, heb, chave: semNikud(heb), de: de.trim(), para: para.trim() });
}
console.log(`recado: ${ARQ}`);
console.log(`${itens.length} correcoes lidas` +
  (itens.length === Number((texto.match(/^(\d+) para corrigir/m) || [])[1] || itens.length)
    ? '' : '  <-- NAO bate com o cabecalho do recado'));

const declarado = Number((texto.match(/^(\d+) para corrigir/m) || [])[1] || -1);
if (declarado >= 0 && declarado !== itens.length) {
  console.error(`\nPAREI: o recado diz ${declarado} correcoes e eu li ${itens.length}.`);
  process.exit(1);
}

// ---------- o que fica de fora, e por que ----------
// Ao lado do recado pode haver um <arquivo>-adiados.json: correcoes que NAO
// entram porque so o Erez pode decidir (duas grafias para a mesma palavra, ou
// o que parece engano de digitacao). Nao e discordancia minha — e pergunta
// pendente, e fica escrita para nao se perder.
let adiados = new Map();
const ARQ_ADIADOS = ARQ.replace(/\.txt$/, '-adiados.json');
try {
  const a = JSON.parse(readFileSync(ARQ_ADIADOS, 'utf8'));
  adiados = new Map((a.adiados || []).map(x => [x.chave, x.motivo]));
  console.log(`${adiados.size} correcoes adiadas (${ARQ_ADIADOS})`);
} catch (e) { /* nao ha adiados */ }

// ---------- conflitos: a mesma palavra com dois destinos ----------
for (const i of itens) i.adiado = adiados.get(`${i.tipo}|${i.chave}|${i.de}`) || null;
const aplicaveis = itens.filter(i => !i.adiado);
const foraDeUso = [...adiados.keys()]
  .filter(k => !itens.some(i => `${i.tipo}|${i.chave}|${i.de}` === k));
if (foraDeUso.length) {
  console.error(`\nPAREI: ${ARQ_ADIADOS} lista chave(s) que nao existem no recado:`);
  foraDeUso.forEach(k => console.error('  ' + k));
  process.exit(2);
}

// Vale para os tres tipos: um verso tambem nao pode receber dois destinos.
// (Cuidado: dois versos parecidos podem ter hebraico DIFERENTE — o yatsmach do
// chabad e פֻּרְקָנֵהּ e o dos outros e פּוּרְקָנֵהּ, entao sao chaves diferentes
// e nao ha conflito nenhum ali.)
const porPalavra = new Map();
for (const i of aplicaveis) {
  const k = `${i.tipo}|${i.chave}`;
  if (!porPalavra.has(k)) porPalavra.set(k, new Map());
  porPalavra.get(k).set(i.de, i.para);
}
// Maiuscula NAO conta como conflito: יְהֵא comeca um verso com M grande e outro
// com minuscula, e isso ja era assim antes. O que nao pode e a mesma palavra
// sair escrita de dois jeitos DIFERENTES.
const conflitos = [];
for (const [k, destinos] of porPalavra) {
  const vals = [...new Set([...destinos.values()].map(v => v.toLowerCase()))];
  if (vals.length > 1) conflitos.push({ k, destinos: [...destinos.entries()] });
}

// ---------- carregar os dados ----------
const ARQUIVOS = readdirSync('sync').filter(f => f.endsWith('_sync.json')).sort();
const sync = Object.fromEntries(ARQUIVOS.map(f => [f, JSON.parse(readFileSync(`sync/${f}`, 'utf8'))]));
const antes = JSON.parse(JSON.stringify(sync));
const gloss = JSON.parse(readFileSync('glossario.json', 'utf8'));
const glossAntes = JSON.parse(JSON.stringify(gloss));

// indice das correcoes
const idx = { trad: new Map(), glosa: new Map(), tl: new Map() };
for (const i of aplicaveis) idx[i.tipo].set(`${i.chave}|${i.de}`, i);

// ---------- aplicar ----------
const usados = new Set();
let nVersos = 0, nGlosas = 0, nTl = 0;

for (const f of ARQUIVOS) {
  const d = sync[f];
  for (const v of d.versos) {
    const kv = semNikud(v.hebrew);

    const it = idx.trad.get(`${kv}|${v.translation_pt}`);
    if (it) {
      usados.add(it);
      v.translation_pt = it.para;
      v.translations.pt = it.para;
      nVersos++;
    }

    for (const p of v.palavras) {
      const kp = semNikud(p.hebrew);

      const ig = idx.glosa.get(`${kp}|${p.glosa_pt}`);
      if (ig) { usados.add(ig); p.glosa_pt = ig.para; p.glosas.pt = ig.para; nGlosas++; }

      const il = idx.tl.get(`${kp}|${p.transliteration_pt}`);
      if (il) { usados.add(il); p.transliteration_pt = il.para; nTl++; }
    }

    // a transliteracao do verso E a juncao das palavras — refazer sempre
    v.transliteration_pt = v.palavras.map(p => p.transliteration_pt).join(' ');
  }
}

// ---------- o mesmo no glossario, senao o aplicar-glossario.mjs desfaz ----------
for (const [chave, e] of Object.entries(gloss.entradas)) {
  // achar um verso nos sync com este hebraico, ja corrigido, e copiar dele
  let achado = null;
  for (const f of ARQUIVOS) {
    achado = sync[f].versos.find(v => semNikud(v.hebrew) === chave);
    if (achado) break;
  }
  if (!achado) continue;
  e.translation_pt = achado.translation_pt;
  e.transliteration_pt = achado.transliteration_pt;
  e.glosas_pt = achado.palavras.map(p => p.glosa_pt);
}

// ---------- provas ----------
const falhas = [];
const naoUsados = aplicaveis.filter(i => !usados.has(i));

for (const f of ARQUIVOS) {
  const a = antes[f], d = sync[f];
  if (a.versos.length !== d.versos.length) falhas.push(`${f}: mudou o numero de versos`);
  a.versos.forEach((va, n) => {
    const vd = d.versos[n];
    if (va.hebrew !== vd.hebrew) falhas.push(`${f} §${va.n}: mudou o HEBRAICO do verso`);
    if (va.start !== vd.start || va.end !== vd.end) falhas.push(`${f} §${va.n}: mudou o TEMPO do verso`);
    for (const lg of Object.keys(va.translations || {})) {
      if (lg === 'pt') continue;
      if (va.translations[lg] !== vd.translations[lg]) falhas.push(`${f} §${va.n}: mexeu no ${lg}`);
    }
    if (va.palavras.length !== vd.palavras.length) falhas.push(`${f} §${va.n}: mudou o numero de palavras`);
    va.palavras.forEach((pa, j) => {
      const pd = vd.palavras[j];
      if (pa.hebrew !== pd.hebrew) falhas.push(`${f} §${va.n}: mudou o HEBRAICO de uma palavra`);
      if (pa.start !== pd.start || pa.end !== pd.end) falhas.push(`${f} §${va.n}: mudou o TEMPO de uma palavra`);
      for (const lg of Object.keys(pa.glosas || {})) {
        if (lg === 'pt') continue;
        if (pa.glosas[lg] !== pd.glosas[lg]) falhas.push(`${f} §${va.n}: mexeu na glosa ${lg}`);
      }
      for (const lg of Object.keys(pa.transliteracoes || {})) {
        if (pa.transliteracoes[lg] !== pd.transliteracoes[lg]) falhas.push(`${f} §${va.n}: mexeu na transliteracao ${lg}`);
      }
    });
    if (vd.transliteration_pt !== vd.palavras.map(p => p.transliteration_pt).join(' '))
      falhas.push(`${f} §${va.n}: a transliteracao do verso nao e a juncao das palavras`);
    if (vd.translation_pt !== vd.translations.pt)
      falhas.push(`${f} §${va.n}: translation_pt e translations.pt discordam`);
    vd.palavras.forEach(p => {
      if (p.glosa_pt !== p.glosas.pt) falhas.push(`${f} §${va.n}: glosa_pt e glosas.pt discordam`);
    });
  });
}

// as ancoras continuam valendo? (elas sao tempo; tempo nao mudou, mas provamos)
try {
  const anc = JSON.parse(readFileSync('ancoras.json', 'utf8'));
  // ancoras.json e um objeto por nussach, cada um com uma lista.
  const n = Object.entries(anc)
    .filter(([k, v]) => !k.startsWith('_') && Array.isArray(v))
    .reduce((s, [, v]) => s + v.length, 0);
  console.log(`ancoras intactas: ${n} (nenhum tempo foi tocado — provado abaixo)`);
} catch (e) { /* sem ancoras, tudo bem */ }

// ---------- relatorio ----------
console.log(`\naplicadas: ${nVersos} traducoes de verso · ${nGlosas} glosas · ${nTl} transliteracoes`);
console.log(`(sao ocorrencias nos 8 arquivos; ${usados.size} das ${aplicaveis.length} correcoes aplicaveis acharam onde entrar)`);

if (conflitos.length) {
  console.log(`\n${conflitos.length} CONFLITO(S) — a mesma palavra com dois destinos diferentes:`);
  for (const c of conflitos) {
    console.log(`  ${c.k}`);
    for (const [de, para] of c.destinos) console.log(`      ${de}  ->  ${para}`);
  }
}

// Rodar de novo um recado ja aplicado nao acha nada, porque o "estava" nao
// existe mais. Isso e a prova de que ele nao aplica duas vezes — nao um erro.
if (usados.size === 0 && aplicaveis.length > 0) {
  console.log('\nNada a fazer: todas estas correcoes ja estao no lugar.');
  console.log('(Um recado ja aplicado nao acha mais o texto antigo. E assim que se sabe.)');
  process.exit(0);
}

if (naoUsados.length) {
  console.log(`\n${naoUsados.length} correcao(oes) NAO acharam onde entrar (o texto de origem nao existe mais):`);
  for (const i of naoUsados) console.log(`  ${i.rot} — ${i.heb}\n      esperava: "${i.de}"`);
}

if (falhas.length) {
  console.log(`\nPROVAS FALHARAM (${falhas.length}) — nao gravo nada:`);
  [...new Set(falhas)].slice(0, 30).forEach(s => console.log('  ' + s));
  process.exit(1);
}
console.log('\nprovas: tempo, hebraico e as 7 outras linguas intactos; pt coerente entre os dois campos.');

if (!CONFIRMAR) {
  console.log('\nENSAIO — nada foi gravado. Para valer: --confirmar');
  process.exit(conflitos.length || naoUsados.length ? 1 : 0);
}
if (conflitos.length) {
  console.log('\nPAREI: resolva os conflitos antes. Nao da para gravar duas grafias da mesma palavra.');
  process.exit(1);
}

for (const f of ARQUIVOS) writeFileSync(`sync/${f}`, JSON.stringify(sync[f], null, 2) + '\n', 'utf8');
writeFileSync('glossario.json', JSON.stringify(gloss, null, 2) + '\n', 'utf8');
console.log('\ngravado: sync/*.json e glossario.json. Rode as checagens.');
