/**
 * alinhar-glosas.mjs — AS PALAVRINHAS PASSAM A LER A FRASE, NAS 7 LINGUAS
 * =======================================================================
 *
 * 30/08. Ele: "gostaria que as evolucoes que fiz em portugues fossem feitas nas
 * traducoes nas outras linguas, como exaltado e santificado seja seu grande nome
 * (no ingles esta his name great)".
 *
 * Ele estava certo, e o defeito nao era onde parecia. A traducao do VERSO esta
 * certa nas 8 linguas — "Exalted and sanctified be His great Name". O que estava
 * errado eram as PALAVRINHAS, uma por palavra hebraica: em fila elas davam
 * "Exalted and sanctified His Name great", porque seguiam a ordem do hebraico e
 * nao a do ingles. Medido: 44 dos 47 versos em ingles, 43 em alemao, 41 em
 * espanhol e frances, 39 em italiano, 36 em russo, 15 em hebraico. Em portugues,
 * 5 — porque ele ja tinha arrumado.
 *
 * A REGRA QUE TORNA ISTO SEGURO, e ela e o coracao deste arquivo:
 *
 *     as glosas, juntas com espacos, tem de dar EXATAMENTE a frase que JA
 *     EXISTIA naquela lingua. Nao "quase". Exatamente.
 *
 * Com isso, nenhuma palavra nova pode entrar: o unico grau de liberdade e ONDE
 * CORTAR. E a regra 5 das inviolaveis continua de pe — a autoridade do texto
 * continua sendo quem escreveu a frase, nao quem a repartiu. Se um corte estiver
 * mal posto, o estrago e uma palavra acender uma posicao adiante ou atras; nunca
 * uma traducao inventada.
 *
 * (Ao escrever os cortes eu errei 46 de 329 na primeira volta — pus os pedacos
 * na ordem do hebraico, nao na da lingua. Foi esta conferencia que os pegou.)
 *
 * Escreve nos DOIS lugares, como manda a licao de 23/08: sync/*.json e
 * glossario.json. So no sync, a rodada seguinte do aplicar-glossario.mjs poderia
 * desfazer, sem aviso. (Hoje aquele script nao mexe em `glosas`, mas escrever
 * so metade e deixar uma armadilha armada para amanha.)
 *
 * PROVA ANTES DE GRAVAR — qualquer uma falhando, nao grava nada:
 *   · nenhum tempo mudou
 *   · nenhuma letra do hebraico mudou
 *   · o PORTUGUES nao foi tocado (nem glosa_pt, nem glosas.pt)
 *   · a traducao de cada VERSO nao mudou em lingua nenhuma
 *   · em cada verso e lingua, juntar as glosas da a traducao daquele verso
 *
 *   node alinhar-glosas.mjs              → ensaio, so mostra
 *   node alinhar-glosas.mjs --confirmar  → grava
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const GRAVAR = process.argv.includes('--confirmar');
const LINGUAS = ['en', 'es', 'fr', 'it', 'de', 'ru', 'he'];
const norm = s => String(s).replace(/[֑-ׇ]/g, '').replace(/[^א-ת]/g, '');
const junta = lista => lista.filter(x => x).join(' ').trim();

const fonte = JSON.parse(readFileSync('fontes/glosas-alinhadas.json', 'utf8')).versos;
const antesSync = {};
for (const f of readdirSync('sync').filter(x => x.endsWith('_sync.json')).sort())
  antesSync[f] = JSON.parse(readFileSync(`sync/${f}`, 'utf8'));
const antesGloss = JSON.parse(readFileSync('glossario.json', 'utf8'));

let mudancas = 0, semFonte = 0;
const problemas = [];
const relatorio = [];

// ---------- 1. muda uma copia ----------
const depoisSync = JSON.parse(JSON.stringify(antesSync));
const depoisGloss = JSON.parse(JSON.stringify(antesGloss));

for (const [f, j] of Object.entries(depoisSync)) {
  for (const v of j.versos) {
    const k = norm(v.hebrew);
    const e = fonte[k];
    if (!e) { semFonte++; problemas.push(`${f} §${v.n}: sem corte para "${v.hebrew}"`); continue; }
    for (const L of LINGUAS) {
      const ped = e.glosas[L];
      if (!ped) continue;
      if (ped.length !== v.palavras.length) {
        problemas.push(`${f} §${v.n} ${L}: ${ped.length} pedacos para ${v.palavras.length} palavras`);
        continue;
      }
      const frase = (v.translations || {})[L] || '';
      // A REGRA. Se nao bater, nao e reagrupamento: e texto novo. Recusa.
      if (junta(ped) !== String(frase).trim()) {
        problemas.push(`${f} §${v.n} ${L}: juntar as glosas nao da a frase\n` +
                       `        frase: ${frase}\n        junto: ${junta(ped)}`);
        continue;
      }
      v.palavras.forEach((p, i) => {
        p.glosas = p.glosas || {};
        if (p.glosas[L] !== ped[i]) {
          if (!relatorio.some(r => r.k === k && r.L === L))
            relatorio.push({ k, L, heb: v.hebrew, antes: v.palavras.map(x => (x.glosas || {})[L] || ''), depois: ped });
          p.glosas[L] = ped[i];
          mudancas++;
        }
      });
    }
  }
}
for (const [k, e] of Object.entries(depoisGloss.entradas)) {
  const f = fonte[k];
  if (!f) continue;
  e.glosas = e.glosas || {};
  for (const L of LINGUAS) if (f.glosas[L]) e.glosas[L] = f.glosas[L].slice();
}

// ---------- 2. prova ----------
const prova = [];
for (const [f, j] of Object.entries(depoisSync)) {
  const a = antesSync[f];
  if (j.versos.length !== a.versos.length) { prova.push(`${f}: mudou o numero de versos`); continue; }
  j.versos.forEach((v, i) => {
    const o = a.versos[i];
    if (v.hebrew !== o.hebrew) prova.push(`${f} §${v.n}: o HEBRAICO mudou`);
    if (v.translation_pt !== o.translation_pt) prova.push(`${f} §${v.n}: o PORTUGUES do verso mudou`);
    if (v.start !== o.start || v.end !== o.end) prova.push(`${f} §${v.n}: o TEMPO do verso mudou`);
    for (const L of LINGUAS)
      if (((v.translations || {})[L] || '') !== ((o.translations || {})[L] || ''))
        prova.push(`${f} §${v.n}: a traducao ${L} do verso mudou`);
    v.palavras.forEach((p, w) => {
      const q = o.palavras[w];
      if (!q) { prova.push(`${f} §${v.n}: mudou o numero de palavras`); return; }
      if (p.hebrew !== q.hebrew) prova.push(`${f} §${v.n} p${w}: o HEBRAICO da palavra mudou`);
      if (p.start !== q.start || p.end !== q.end) prova.push(`${f} §${v.n} p${w}: o TEMPO da palavra mudou`);
      if (p.glosa_pt !== q.glosa_pt) prova.push(`${f} §${v.n} p${w}: a glosa em PORTUGUES mudou`);
      if ((p.glosas || {}).pt !== (q.glosas || {}).pt) prova.push(`${f} §${v.n} p${w}: glosas.pt mudou`);
      if (p.transliteration_pt !== q.transliteration_pt) prova.push(`${f} §${v.n} p${w}: a transliteracao mudou`);
    });
  });
}

// ---------- 3. conta ----------
console.log(`versos com corte definido : ${Object.keys(fonte).length}`);
console.log(`glosas trocadas           : ${mudancas}`);
console.log(`versos afetados           : ${relatorio.length} (verso × lingua)\n`);

if (relatorio.length) {
  console.log('exemplos:');
  for (const r of relatorio.slice(0, 4)) {
    console.log(`  ${r.L}  ${r.heb}`);
    console.log(`     antes : ${r.antes.join(' | ')}`);
    console.log(`     depois: ${r.depois.join(' | ')}`);
  }
  console.log();
}
if (problemas.length) {
  console.log(`PROBLEMAS (${problemas.length}):`);
  problemas.slice(0, 12).forEach(p => console.log('  ' + p));
  console.log();
}
if (prova.length) {
  console.log(`A PROVA FALHOU (${prova.length}) — nao gravo nada:`);
  prova.slice(0, 12).forEach(p => console.log('  ' + p));
  process.exit(1);
}
console.log('prova: nenhum tempo, nenhum hebraico, nenhum portugues e nenhuma traducao de verso mudou.');

if (semFonte || problemas.length) {
  console.log('\nHa versos sem corte ou com corte que nao fecha. Nao gravo nada.');
  process.exit(1);
}
if (!GRAVAR) { console.log('\nEnsaio. Para gravar: node alinhar-glosas.mjs --confirmar'); process.exit(0); }

for (const [f, j] of Object.entries(depoisSync))
  writeFileSync(`sync/${f}`, JSON.stringify(j, null, 2) + '\n', 'utf8');
writeFileSync('glossario.json', JSON.stringify(depoisGloss, null, 2) + '\n', 'utf8');
console.log('\nGravado em sync/*.json e em glossario.json.');
