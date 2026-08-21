/**
 * aplicar-transliteracoes.mjs — poe nos sync/*.json a transliteracao por lingua.
 *
 * DE ONDE VEM
 * fontes/transliteracao-por-lingua.json, copiado verbatim dos documentos que o
 * Erez tinha no Drive (1/8/2026). Nada aqui e inventado pelo modelo: o script
 * so casa palavra com palavra.
 *
 * O QUE E POSSIVEL, E O QUE NAO E
 * O documento cobre SO o Kadish deRabanan e SO tres nussachim (Sefaradi,
 * Ashkenazi, Chabad). Entao:
 *   - os tres deRabanan saem direto do documento;
 *   - os tres Yatom saem por casamento do HEBRAICO com o deRabanan do mesmo
 *     nussach (o Yatom e quase um recorte do deRabanan);
 *   - o SEFARD (os dois) NAO tem fonte. Fica sem, e o relatorio diz isso.
 * O portugues nao e tocado: decisao do Erez.
 *
 * COMO CASA
 * O documento parte os versos diferente de nos (27 § contra 24). Por isso o
 * casamento e por PALAVRA, nao por verso: alinha as duas listas inteiras
 * (Needleman-Wunsch) e so aceita par com semelhanca boa. O alinhamento e feito
 * uma vez, com o ingles contra a nossa transliteracao portuguesa — as cinco
 * linguas tem exatamente a mesma contagem de palavras em todos os versos, o que
 * o script confere antes de comecar.
 *
 * O QUE NUNCA FAZ
 * nao mexe em tempo, hebraico, glosa, traducao nem em transliteration_pt;
 * nao escreve em ancoras.json nem em cortes.json; nao grava nada se qualquer
 * prova falhar.
 *
 * Uso:
 *   node aplicar-transliteracoes.mjs              -> ensaio
 *   node aplicar-transliteracoes.mjs --confirmar  -> grava
 */
import { readFileSync, writeFileSync } from 'node:fs';

const CONFIRMAR = process.argv.includes('--confirmar');
const FONTE = 'fontes/transliteracao-por-lingua.json';
const NUSSACHIM = ['sefaradi', 'ashkenaz', 'chabad'];
const SEM_FONTE = ['sefard_derabanan', 'sefard_yatom'];
const LIMIAR = 0.45;      // semelhanca minima para aceitar um par

const src = JSON.parse(readFileSync(FONTE, 'utf8'));
const LINGUAS = src.linguas;

const ler = f => JSON.parse(readFileSync(f, 'utf8'));
const gravar = (f, d) => writeFileSync(f, JSON.stringify(d, null, 2) + '\n', 'utf8');

/** Palavras de uma linha do documento. Virgula e hifen nao sao palavra. */
const palavrasDe = t => t.replace(/[,…]/g, ' ').replace(/-/g, ' ')
                         .split(/\s+/).filter(w => w && w !== '—');

/** Para comparar romanizacoes diferentes da mesma palavra. */
const simplificar = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z]/g, '');

/** Hebraico sem nikud, para casar Yatom com deRabanan. */
const semNikud = s => (s || '').normalize('NFD')
  .replace(/[֑-ׇ̀-ͯ]/g, '').replace(/[^א-ת]/g, '');

function semelhanca(a, b) {
  a = simplificar(a); b = simplificar(b);
  if (!a || !b) return 0;
  if (a === b) return 1;
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1,
                         d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
  return 1 - d[m][n] / Math.max(m, n);
}

/** Needleman-Wunsch. Devolve pares [iA, iB]; null de um lado = lacuna. */
function alinhar(A, B, sim) {
  const m = A.length, n = B.length, LACUNA = -0.6;
  const M = Array.from({ length: m + 1 }, () => new Float64Array(n + 1));
  for (let i = 1; i <= m; i++) M[i][0] = M[i-1][0] + LACUNA;
  for (let j = 1; j <= n; j++) M[0][j] = M[0][j-1] + LACUNA;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      M[i][j] = Math.max(M[i-1][j-1] + (sim(A[i-1], B[j-1]) - 0.35),
                         M[i-1][j] + LACUNA, M[i][j-1] + LACUNA);
  const pares = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && M[i][j] === M[i-1][j-1] + (sim(A[i-1], B[j-1]) - 0.35)) {
      pares.push([--i, --j]);
    } else if (i > 0 && M[i][j] === M[i-1][j] + LACUNA) { pares.push([--i, null]); }
    else { pares.push([null, --j]); }
  }
  return pares.reverse();
}

// ---------- prova previa: as 5 linguas tem a mesma forma ----------
for (const nussach of NUSSACHIM)
  for (let n = 1; n <= 27; n++) {
    const contas = LINGUAS.map(lg => {
      const t = src.versos[String(n)][nussach][lg];
      return t === '—' ? 0 : palavrasDe(t).length;
    });
    if (new Set(contas).size > 1)
      throw new Error(`${nussach} §${n}: as linguas do documento nao tem a mesma contagem`);
  }

/** Assinatura do que NAO pode mudar. */
const assinatura = d => JSON.stringify(d.versos.map(v => [
  v.n, v.start, v.end, v.hebrew, v.transliteration_pt, v.translation_pt, v.translations,
  (v.palavras || []).map(p => [p.hebrew, p.transliteration_pt, p.start, p.end, p.glosas]),
]));

const relatorio = [];
const relatorioExtra = [];
const paraGravar = {};
let totalPostas = 0, totalSem = 0;

// ---------- 1. os deRabanan, direto do documento ----------
const dicionarioPorNussach = {};
for (const nussach of NUSSACHIM) {
  const arquivo = `sync/${nussach}_derabanan_sync.json`;
  const antes = ler(arquivo);
  const depois = ler(arquivo);
  const nossas = depois.versos.flatMap(v => (v.palavras || []).map(p => p));

  const doc = [];
  for (let n = 1; n <= 27; n++) {
    const linha = src.versos[String(n)][nussach];
    if (linha.en === '—') continue;
    const porLingua = Object.fromEntries(LINGUAS.map(lg => [lg, palavrasDe(linha[lg])]));
    porLingua.en.forEach((_, k) =>
      doc.push(Object.fromEntries(LINGUAS.map(lg => [lg, porLingua[lg][k]]))));
  }

  const pares = alinhar(nossas.map(p => p.transliteration_pt || ''), doc.map(w => w.en), semelhanca);
  let postas = 0; const semPar = [];
  for (const [a, b] of pares) {
    if (a === null || b === null) { if (a !== null) semPar.push(nossas[a]); continue; }
    if (semelhanca(nossas[a].transliteration_pt || '', doc[b].en) < LIMIAR) {
      semPar.push(nossas[a]); continue;
    }
    nossas[a].transliteracoes = Object.fromEntries(LINGUAS.map(lg => [lg, doc[b][lg]]));
    postas++;
  }
  if (assinatura(antes) !== assinatura(depois))
    throw new Error(`${arquivo}: alguma coisa fora da transliteracao mudou`);

  relatorio.push({ arquivo, total: nossas.length, postas, semPar: semPar.map(p => p.transliteration_pt) });
  totalPostas += postas; totalSem += semPar.length;
  paraGravar[arquivo] = depois;

  // dicionario para o Yatom: hebraico em sequencia -> transliteracoes
  dicionarioPorNussach[nussach] = nossas.map(p => ({
    heb: semNikud(p.hebrew), pt: p.transliteration_pt || '', tl: p.transliteracoes || null }));
}

// ---------- 2. os Yatom, casando o hebraico com o deRabanan ----------
for (const nussach of NUSSACHIM) {
  const arquivo = `sync/${nussach}_yatom_sync.json`;
  const antes = ler(arquivo);
  const depois = ler(arquivo);
  const nossas = depois.versos.flatMap(v => (v.palavras || []).map(p => p));
  const base = dicionarioPorNussach[nussach];

  const pares = alinhar(nossas.map(p => semNikud(p.hebrew)), base.map(b => b.heb),
                        (x, y) => (x && x === y ? 1 : 0));
  let postas = 0, porEscrita = 0; const semPar = [];
  const sobraram = [];
  for (const [a, b] of pares) {
    if (a === null) continue;
    if (b === null || !base[b].tl || semNikud(nossas[a].hebrew) !== base[b].heb) {
      sobraram.push(a); continue;
    }
    nossas[a].transliteracoes = { ...base[b].tl };
    postas++;
  }
  // Segunda tentativa, so para o que sobrou: a mesma palavra aparece escrita
  // cheia num arquivo e defectiva no outro (עוֹשֶׂה x עֹשֶׂה), e ai o hebraico
  // sem nikud nao bate. Cai para a transliteracao portuguesa, que e nossa e
  // ja esta conferida — e so aceita quando TODAS as ocorrencias no deRabanan
  // concordam, para nao escolher por conta propria.
  for (const a of sobraram) {
    const chave = simplificar(nossas[a].transliteration_pt || '');
    const candidatos = base.filter(x => x.tl && simplificar(x.pt || '') === chave);
    const distintas = new Set(candidatos.map(x => JSON.stringify(x.tl)));
    if (chave && candidatos.length && distintas.size === 1) {
      nossas[a].transliteracoes = { ...candidatos[0].tl };
      postas++; porEscrita++;
    } else {
      semPar.push(nossas[a].transliteration_pt);
    }
  }
  if (porEscrita) relatorioExtra.push(
    `   ${arquivo.replace('sync/','').replace('_sync.json','')}: ${porEscrita} palavra(s) casada(s) pela transliteracao portuguesa (grafia hebraica diferente entre os dois arquivos)`);
  if (assinatura(antes) !== assinatura(depois))
    throw new Error(`${arquivo}: alguma coisa fora da transliteracao mudou`);

  relatorio.push({ arquivo, total: nossas.length, postas, semPar });
  totalPostas += postas; totalSem += semPar.length;
  paraGravar[arquivo] = depois;
}

// ---------- relatorio ----------
console.log('lingua(s) do documento:', LINGUAS.join(', '), '(o portugues fica como esta)\n');
for (const r of relatorio) {
  const pct = (r.postas / r.total * 100).toFixed(1);
  console.log(`${r.arquivo.replace('sync/','').replace('_sync.json','').padEnd(20)} ` +
              `${String(r.postas).padStart(3)}/${String(r.total).padEnd(3)} palavras (${pct}%)`);
  if (r.semPar.length) console.log('   sem par: ' + r.semPar.join(', '));
}
if (relatorioExtra.length) {
  console.log('\nsegunda tentativa:');
  relatorioExtra.forEach(l => console.log(l));
}
console.log('\nsem fonte nenhuma (o documento nao cobre):');
for (const f of SEM_FONTE) {
  const d = ler(`sync/${f}_sync.json`);
  const n = d.versos.reduce((a, v) => a + (v.palavras || []).length, 0);
  console.log(`   ${f.padEnd(20)} ${n} palavras — continuam so em portugues`);
}
console.log(`\ntotal: ${totalPostas} palavras ganharam as 5 linguas; ${totalSem} ficaram sem par.`);

if (!CONFIRMAR) {
  console.log('\nENSAIO — nada foi gravado. Para valer: node aplicar-transliteracoes.mjs --confirmar');
} else {
  for (const [f, d] of Object.entries(paraGravar)) { gravar(f, d); console.log('gravado:', f); }
}
