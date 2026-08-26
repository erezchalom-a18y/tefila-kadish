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
// O documento nao tem o Sefard. O Erez decidiu (21/08): "Sefard, em outras
// linguas use a transliteracao dos outros nussachim como base, e muito
// parecido". Entao o Sefard sai do casamento pelo HEBRAICO com os outros tres,
// palavra por palavra — e so quando a palavra hebraica e a mesma.
const EMPRESTADOS = ['sefard_derabanan', 'sefard_yatom'];

/**
 * De qual COLUNA do documento sai cada nussach.
 *
 * O documento tem tres colunas: Sefaradi, Ashkenazi e Chabad. As colunas
 * Ashkenazi e Chabad usam a pronuncia europeia tradicional — "Yisgadal" no
 * lugar de "Yitgadal", "beis" no lugar de "beit", "rabo" no lugar de "raba".
 *
 * O Erez ouviu a gravacao em 21/08 e confirmou: o rabino diz "yit-gadal".
 * Como a transliteracao existe para a pessoa ler JUNTO com o audio, uma que
 * diga "Yisgadal" atrapalha em vez de ajudar. Entao os tres nussachim saem da
 * coluna Sefaradi, que e a que traz a pronuncia que se ouve na gravacao.
 *
 * O que isso NAO faz: nao inventa pronuncia nenhuma. Onde o texto do ashkenaz
 * ou do chabad e realmente diferente do sefaradi (e ha lugares assim), as
 * palavras simplesmente nao casam e continuam em portugues — o relatorio conta
 * quantas. Preferi perder cobertura a inventar.
 */
const COLUNA = { sefaradi: 'sefaradi', ashkenaz: 'sefaradi', chabad: 'sefaradi' };

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
      const t = src.versos[String(n)][COLUNA[nussach]][lg];
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
  // Apaga o que uma rodada anterior tenha posto. Sem isto, uma palavra que
  // deixou de casar ficaria com a transliteracao velha para sempre.
  for (const p of nossas) delete p.transliteracoes;

  const doc = [];
  for (let n = 1; n <= 27; n++) {
    const linha = src.versos[String(n)][COLUNA[nussach]];
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

/**
 * Casa uma lista de palavras nossas contra um dicionario de referencia, pelo
 * hebraico sem nikud; o que sobrar tenta de novo pela transliteracao
 * portuguesa (a mesma palavra aparece escrita cheia num arquivo e defectiva
 * noutro, e ai o hebraico nao bate).
 */
function casarComBase(nossas, base) {
  const pares = alinhar(nossas.map(p => semNikud(p.hebrew)), base.map(b => b.heb),
                        (x, y) => (x && x === y ? 1 : 0));
  let postas = 0, porEscrita = 0; const sobraram = [];
  for (const [a, b] of pares) {
    if (a === null) continue;
    if (nossas[a].transliteracoes) { postas++; continue; }        // ja tem
    if (b === null || !base[b].tl || semNikud(nossas[a].hebrew) !== base[b].heb) {
      sobraram.push(a); continue;
    }
    nossas[a].transliteracoes = { ...base[b].tl };
    postas++;
  }
  const semPar = [];
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
  return { postas, porEscrita, semPar };
}

// ---------- 2. os Yatom, casando o hebraico com o deRabanan ----------
for (const nussach of NUSSACHIM) {
  const arquivo = `sync/${nussach}_yatom_sync.json`;
  const antes = ler(arquivo);
  const depois = ler(arquivo);
  const nossas = depois.versos.flatMap(v => (v.palavras || []).map(p => p));
  for (const p of nossas) delete p.transliteracoes;

  const r = casarComBase(nossas, dicionarioPorNussach[nussach]);
  if (assinatura(antes) !== assinatura(depois))
    throw new Error(`${arquivo}: alguma coisa fora da transliteracao mudou`);
  if (r.porEscrita) relatorioExtra.push(
    `   ${arquivo.replace('sync/','').replace('_sync.json','')}: ${r.porEscrita} palavra(s) pela transliteracao portuguesa (grafia hebraica diferente)`);

  relatorio.push({ arquivo, total: nossas.length, postas: r.postas, semPar: r.semPar });
  totalPostas += r.postas; totalSem += r.semPar.length;
  paraGravar[arquivo] = depois;
  dicionarioPorNussach[nussach + '_yatom'] = nossas.map(p => ({
    heb: semNikud(p.hebrew), pt: p.transliteration_pt || '', tl: p.transliteracoes || null }));
}

// ---------- 3. o que sobrou: completar de um nussach com os outros ----------
// Vale para o Sefard, que nao esta no documento, e para os trechos do Sefaradi
// que o documento nao traz. O criterio e o mesmo: so casa palavra hebraica
// igual. Onde nem isso existe, fica em portugues.
const TODOS = [
  'sefaradi_derabanan', 'ashkenaz_derabanan', 'chabad_derabanan',
  'sefaradi_yatom', 'ashkenaz_yatom', 'chabad_yatom',
  'sefard_derabanan', 'sefard_yatom',
];
const emprestimo = [];

// banco unico com tudo o que ja tem transliteracao, para servir de emprestimo
const banco = [];
for (const [f, d] of Object.entries(paraGravar))
  for (const v of d.versos) for (const p of (v.palavras || []))
    if (p.transliteracoes) banco.push({ heb: semNikud(p.hebrew),
      pt: p.transliteration_pt || '', tl: p.transliteracoes });

for (const nome of TODOS) {
  const arquivo = `sync/${nome}_sync.json`;
  const jaFeito = paraGravar[arquivo];
  const antes = ler(arquivo);
  const depois = jaFeito || ler(arquivo);
  const nossas = depois.versos.flatMap(v => (v.palavras || []).map(p => p));
  const faltavam = nossas.filter(p => !p.transliteracoes).length;
  if (!faltavam) continue;

  const r = casarComBase(nossas, banco);
  const ganhou = nossas.filter(p => p.transliteracoes).length - (nossas.length - faltavam);
  if (assinatura(jaFeito ? antes : antes) !== assinatura(depois) && !jaFeito)
    throw new Error(`${arquivo}: alguma coisa fora da transliteracao mudou`);
  if (ganhou > 0) {
    emprestimo.push(`   ${nome.padEnd(20)} +${ganhou} palavra(s) emprestadas dos outros nussachim ` +
                    `(faltavam ${faltavam}, sobram ${r.semPar.length})`);
    totalPostas += ganhou; totalSem -= ganhou;
    const linha = relatorio.find(x => x.arquivo === arquivo);
    if (linha) { linha.postas += ganhou; linha.semPar = r.semPar; }
    else relatorio.push({ arquivo, total: nossas.length,
                          postas: nossas.length - r.semPar.length, semPar: r.semPar });
  }
  paraGravar[arquivo] = depois;
}

// ---------- relatorio ----------
console.log('lingua(s) do documento:', LINGUAS.join(', '), '(o portugues fica como esta)');
console.log('coluna usada por nussach:',
  NUSSACHIM.map(n => `${n} <- ${COLUNA[n]}`).join(' \u00b7 '), '\n');

// A conta sai dos dados, nao de somas pelo caminho: e mais dificil de errar.
let totalPalavras = 0, totalComLingua = 0;
for (const nome of TODOS) {
  const arquivo = `sync/${nome}_sync.json`;
  const d = paraGravar[arquivo] || ler(arquivo);
  const ps = d.versos.flatMap(v => (v.palavras || []).map(p => p));
  const com = ps.filter(p => p.transliteracoes);
  const sem = ps.filter(p => !p.transliteracoes).map(p => p.transliteration_pt);
  totalPalavras += ps.length; totalComLingua += com.length;
  console.log(`${nome.padEnd(20)} ${String(com.length).padStart(3)}/${String(ps.length).padEnd(3)} ` +
              `palavras (${(com.length / ps.length * 100).toFixed(1)}%)`);
  if (sem.length) console.log('   sem fonte: ' + sem.join(', '));
}

if (relatorioExtra.length) {
  console.log('\nsegunda tentativa (grafia hebraica diferente entre arquivos):');
  relatorioExtra.forEach(l => console.log(l));
}
if (emprestimo.length) {
  console.log('\nemprestado dos outros nussachim (palavra hebraica igual):');
  emprestimo.forEach(l => console.log(l));
}
console.log(`\ntotal: ${totalComLingua} de ${totalPalavras} palavras com as 5 linguas ` +
            `(${(totalComLingua / totalPalavras * 100).toFixed(1)}%).`);

if (!CONFIRMAR) {
  console.log('\nENSAIO — nada foi gravado. Para valer: node aplicar-transliteracoes.mjs --confirmar');
} else {
  for (const [f, d] of Object.entries(paraGravar)) { gravar(f, d); console.log('gravado:', f); }
}
