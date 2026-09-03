/**
 * aplicar-decisoes.mjs — poe no texto as decisoes ESCOPADAS do Erez.
 *
 * POR QUE NAO SERVE O aplicar-revisao.mjs
 *
 * Aquele casa por CONTEUDO: a chave e o hebraico + a lingua + o texto atual.
 * Por isso o que ele decide vale nos 8 de uma vez, que e o certo quase sempre.
 *
 * Em 25/08 apareceram duas decisoes que NAO valem nos 8:
 *
 *   * o hebraico do "Yitbarech veyishtabach veyitpaer" com tsere, que ele quis
 *     so no ashkenaz e no chabad — os nussachim divergem de verdade nessa
 *     palavra, e os sidurim tambem;
 *   * as palavrinhas de UM verso, sem mexer nas mesmas palavras nos outros.
 *     O "kol" com a glosa "todas" esta em 29 lugares; virar "todo o povo" em
 *     "leela min kol birchata" daria "acima de todo o povo das bencaos".
 *
 * Entao existe este, que le um arquivo de decisoes escrito a mao (por humano,
 * a partir do que ele mandou) e aplica cada uma no escopo que ela pede.
 *
 * O QUE ELE PROVA, ANTES DE GRAVAR
 * - nenhum tempo mudou, em nenhuma palavra e em nenhum verso;
 * - nenhuma ancora deixou de valer;
 * - nenhuma das outras 7 linguas mudou;
 * - o hebraico so mudou onde a decisao mandou, e so no nikud (as letras sao
 *   as mesmas — se uma letra mudasse, seria outro texto, e isso e do rabino);
 * - o verso e a soma das suas palavras (hebraico e transliteracao).
 * Qualquer falha e ele nao grava nada.
 *
 * NUNCA escreve em ancoras.json nem em cortes.json.
 *
 * Uso:
 *   node aplicar-decisoes.mjs revisoes/decisoes-2026-08-25.json              -> ensaio
 *   node aplicar-decisoes.mjs revisoes/decisoes-2026-08-25.json --confirmar  -> grava
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const ARQ = process.argv[2];
const CONFIRMAR = process.argv.includes('--confirmar');
if (!ARQ) { console.error('uso: node aplicar-decisoes.mjs <decisoes.json> [--confirmar]'); process.exit(2); }

const norm = s => String(s || '').replace(/[֑-ׇ]/g, '').replace(/[^א-ת]/g, '');
const letras = s => String(s || '').replace(/[֑-ׇ]/g, '');
const { decisoes } = JSON.parse(readFileSync(ARQ, 'utf8'));
const glossario = JSON.parse(readFileSync('glossario.json', 'utf8'));
const ancoras = JSON.parse(readFileSync('ancoras.json', 'utf8'));

const arquivos = readdirSync('sync').filter(f => f.endsWith('_sync.json')).sort();
const antes = Object.fromEntries(arquivos.map(f => [f, JSON.parse(readFileSync(`sync/${f}`, 'utf8'))]));
const agora = Object.fromEntries(arquivos.map(f => [f, JSON.parse(readFileSync(`sync/${f}`, 'utf8'))]));
const gAntes = JSON.stringify(glossario);

const conta = {};
const nota = (k) => { conta[k] = (conta[k] || 0) + 1; };

// TODA decisao tem que achar onde valer. Uma chave que nao casa com verso
// nenhum e um erro de digitacao que passa em SILENCIO — foi o que aconteceu
// com o verso 9 em 25/08: escrevi ויתרוממ com mem comum onde o arquivo tem
// ויתרומם com mem FINAL, e a decisao simplesmente nao aconteceu. Tudo deu
// verde e a glosa continuou errada na tela dele.
const achou = new Set();
// onde uma decisao mandou mexer na transliteracao de outra lingua; a prova
// la embaixo cobra que nada tenha mudado FORA desta lista.
const mexidas = new Set();

for (const d of decisoes) {
  if (d.tipo === 'verso_por_nussach') {
    for (const f of arquivos) {
      const nussach = f.split('_')[0];
      if (!d.nussachim.includes(nussach)) continue;
      for (const v of agora[f].versos) {
        if (norm(v.hebrew) !== d.chave) continue;
        achou.add(d.id);
        // ha decisao que muda so a transliteracao (o venechemata do ashkenaz e
        // do chabad); nesse caso o hebraico nao vem no arquivo e nao se toca.
        if (d.hebrew) v.hebrew = d.hebrew;
        if (d.transliteration_pt) v.transliteration_pt = d.transliteration_pt;
        for (const p of d.palavras) {
          const w = v.palavras[p.i];
          if (!w) continue;
          if (p.hebrew) w.hebrew = p.hebrew;
          if (p.transliteration_pt) w.transliteration_pt = p.transliteration_pt;
          // 04/09 — a transliteracao das OUTRAS linguas tambem pode ser escopada.
          // Ela vem do documento humano dele (fontes/transliteracao-por-lingua.json),
          // que e um so para os 8 e por isso nao sabe separar por nussach. Quando o
          // hebraico diverge entre nussachim — o tsere do ashkenaz e do chabad contra
          // o patach do sefard e do sefaradi — o documento traz a mesma forma nos oito,
          // e a linha em portugues passa a discordar da linha em ingles na mesma tela.
          // Ele mandou consertar: "no ingles deve estar igual porque segue o hebraico".
          if (p.transliteracoes) {
            w.transliteracoes = w.transliteracoes || {};
            for (const [lg, txt] of Object.entries(p.transliteracoes)) {
              w.transliteracoes[lg] = txt;
              mexidas.add(`${f}|${v.n}|${p.i}|${lg}`);
            }
            nota('§ transliteracao por nussach nas outras linguas');
          }
        }
        nota(`§ hebraico por nussach (${nussach})`);
      }
    }
    // o glossario guarda UM texto por chave (a chave ignora o nikud), entao a
    // versao do ashkenaz/chabad entra como excecao por nussach. Sem isto, a
    // proxima rodada do aplicar-glossario.mjs desfaria a transliteracao dele.
    const e = glossario.entradas[d.chave];
    if (e) {
      e.por_nussach = e.por_nussach || {};
      for (const n of d.nussachim)
        e.por_nussach[n] = { hebrew: d.hebrew, transliteration_pt: d.transliteration_pt };
      nota('§ excecao por nussach no glossario');
    }
  }

  if (d.tipo === 'traducao_do_verso') {
    for (const f of arquivos) for (const v of agora[f].versos) {
      if (norm(v.hebrew) !== d.chave) continue;
      achou.add(d.id);
      v.translation_pt = d.translation_pt; nota('§ traducao do verso');
    }
    const e = glossario.entradas[d.chave];
    if (e) { e.translation_pt = d.translation_pt; nota('§ traducao no glossario'); }
  }

  if (d.tipo === 'transliteracao_de_palavra') {
    for (const f of arquivos) for (const v of agora[f].versos) {
      let mexeu = false;
      for (const w of v.palavras) {
        if (norm(w.hebrew) !== d.hebrew_sem_nikud) continue;
        achou.add(d.id);
        if (w.transliteration_pt !== d.de) continue;
        w.transliteration_pt = d.para; mexeu = true; nota('palavra: transliteracao');
      }
      if (mexeu) {
        v.transliteration_pt = v.palavras.map(w => w.transliteration_pt).join(' ');
        const e = glossario.entradas[norm(v.hebrew)];
        if (e) e.transliteration_pt = v.transliteration_pt;
      }
    }
  }

  if (d.tipo === 'glosas_do_verso') {
    for (const f of arquivos) for (const v of agora[f].versos) {
      if (norm(v.hebrew) !== d.chave) continue;
      achou.add(d.id);
      if (v.palavras.length !== d.glosas.length) {
        console.error(`  !! ${f} §${v.n}: ${v.palavras.length} palavras e ${d.glosas.length} glosas`);
        process.exit(1);
      }
      v.palavras.forEach((w, i) => { if (w.glosa_pt !== d.glosas[i]) { w.glosa_pt = d.glosas[i];
        if (w.glosas) w.glosas.pt = d.glosas[i]; nota('palavra: glosa'); } });
      const e = glossario.entradas[d.chave];
      if (e && Array.isArray(e.glosas_pt)) e.glosas_pt = d.glosas.slice();
    }
  }

  if (d.tipo === 'grafia_no_portugues') { achou.add(d.id);
    const re = new RegExp(d.de, 'g');
    const troca = s => (typeof s === 'string' ? s.replace(re, d.para) : s);
    for (const f of arquivos) for (const v of agora[f].versos) {
      const t1 = troca(v.translation_pt), t2 = troca(v.transliteration_pt);
      if (t1 !== v.translation_pt) { v.translation_pt = t1; nota('§ traducao: grafia'); }
      if (t2 !== v.transliteration_pt) { v.transliteration_pt = t2; nota('§ transliteracao: grafia'); }
      for (const w of v.palavras) {
        const g = troca(w.glosa_pt), l = troca(w.transliteration_pt);
        if (g !== w.glosa_pt) { w.glosa_pt = g; if (w.glosas) w.glosas.pt = g; nota('palavra: glosa (grafia)'); }
        if (l !== w.transliteration_pt) { w.transliteration_pt = l; nota('palavra: transliteracao (grafia)'); }
      }
    }
    for (const k of Object.keys(glossario.entradas)) {
      const e = glossario.entradas[k];
      e.translation_pt = troca(e.translation_pt);
      e.transliteration_pt = troca(e.transliteration_pt);
      if (Array.isArray(e.glosas_pt)) e.glosas_pt = e.glosas_pt.map(troca);
      if (e.por_nussach) for (const n of Object.keys(e.por_nussach))
        e.por_nussach[n].transliteration_pt = troca(e.por_nussach[n].transliteration_pt);
    }
  }
}

// ---------- provas ----------
const falhas = [];
for (const d of decisoes)
  if (!achou.has(d.id)) falhas.push(`a decisao "${d.id}" nao achou onde valer — a chave nao casa com verso nenhum`);
for (const f of arquivos) {
  const a = antes[f], b = agora[f];
  if (a.versos.length !== b.versos.length) { falhas.push(`${f}: mudou o numero de versos`); continue; }
  a.versos.forEach((va, i) => {
    const vb = b.versos[i];
    if (va.start !== vb.start || va.end !== vb.end) falhas.push(`${f} §${va.n}: mudou o tempo do verso`);
    if (letras(va.hebrew) !== letras(vb.hebrew))
      falhas.push(`${f} §${va.n}: mudou LETRA do hebraico (so o nikud pode mudar)`);
    if (va.palavras.length !== vb.palavras.length) { falhas.push(`${f} §${va.n}: mudou o numero de palavras`); return; }
    va.palavras.forEach((pa, j) => {
      const pb = vb.palavras[j];
      if (pa.start !== pb.start || pa.end !== pb.end) falhas.push(`${f} §${va.n}: mudou o tempo de uma palavra`);
      if (letras(pa.hebrew) !== letras(pb.hebrew)) falhas.push(`${f} §${va.n}: mudou LETRA de uma palavra`);
      for (const lg of ['en', 'es', 'fr', 'it', 'de', 'ru', 'he'])
        if (pa.glosas && pb.glosas && pa.glosas[lg] !== pb.glosas[lg])
          falhas.push(`${f} §${va.n}: mudou a glosa em ${lg} — so o portugues pode mudar`);
      // a transliteracao das outras linguas so pode mudar onde uma decisao MANDOU,
      // e o lugar exato fica registrado em `mexidas` quando ela e aplicada
      for (const lg of ['en', 'es', 'fr', 'it', 'ru']) {
        const x = (pa.transliteracoes || {})[lg], y = (pb.transliteracoes || {})[lg];
        if (x !== y && !mexidas.has(`${f}|${va.n}|${j}|${lg}`))
          falhas.push(`${f} §${va.n} palavra ${j + 1}: mudou a transliteracao em ${lg} sem decisao que mandasse`);
      }
    });
    const somaHeb = vb.palavras.map(p => p.hebrew).join(' ');
    if (somaHeb !== vb.hebrew) falhas.push(`${f} §${va.n}: o verso nao e a soma das palavras (hebraico)`);
    const somaTl = vb.palavras.map(p => p.transliteration_pt).join(' ');
    if (somaTl !== vb.transliteration_pt) falhas.push(`${f} §${va.n}: o verso nao e a soma das palavras (transliteracao)`);
  });
  for (const anc of (ancoras[f.replace('_sync.json', '')] || [])) {
    const v = b.versos.find(x => x.n === anc.verso);
    const p = v && v.palavras[anc.palavra - 1];
    if (p && Math.abs(p.start - anc.inicio) > 0.05) falhas.push(`${f}: a ancora §${anc.verso} p${anc.palavra} deixou de valer`);
  }
}

console.log(`decisoes: ${ARQ}\n`);
for (const k of Object.keys(conta).sort()) console.log(`  ${String(conta[k]).padStart(3)} × ${k}`);
console.log(`\n  glossario.json ${gAntes === JSON.stringify(glossario) ? 'nao mudou' : 'mudou junto (senao a proxima rodada desfaria)'}`);

if (falhas.length) {
  console.log(`\nPROVAS FALHARAM (${falhas.length}) — nao gravo nada:`);
  [...new Set(falhas)].slice(0, 15).forEach(s => console.log('  ' + s));
  process.exit(1);
}
console.log('  provas: nenhum tempo mudou, nenhuma letra do hebraico mudou, as 7 outras linguas');
console.log('          intactas, as ancoras valendo, e cada verso e a soma das suas palavras.');

if (!CONFIRMAR) { console.log('\nENSAIO — nada foi gravado. Para valer: --confirmar'); process.exit(0); }
for (const f of arquivos) writeFileSync(`sync/${f}`, JSON.stringify(agora[f], null, 2) + '\n', 'utf8');
writeFileSync('glossario.json', JSON.stringify(glossario, null, 2) + '\n', 'utf8');
console.log('\ngravado: sync/*.json e glossario.json');
