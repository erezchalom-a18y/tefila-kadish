/**
 * gerar-escolha-rabino.mjs — monta escolha-rabino.html a partir de
 * glossario.json + RELATORIO-REVISAO-GPT.md.
 *
 * So le. Escreve apenas escolha-rabino.html.
 *
 * Regra que manda aqui: NUNCA inventar uma alternativa. A opcao que nao e a
 * nossa tem que ser texto que o revisor de fato escreveu. Onde o revisor
 * reclamou mas nao propos nada, o item aparece sem par A/B — com a nossa versao
 * e a objecao dele — porque forjar uma alternativa para mostrar ao rabino seria
 * pior do que nao mostrar nada.
 */
import fs from 'node:fs';

const LING = { 'português': 'pt', 'inglês': 'en', 'espanhol': 'es', 'francês': 'fr',
               'italiano': 'it', 'alemão': 'de', 'russo': 'ru', 'hebraico moderno': 'he' };
const NOME = { pt: 'Português', en: 'Inglês', es: 'Espanhol', fr: 'Francês',
               it: 'Italiano', de: 'Alemão', ru: 'Russo', he: 'Hebraico moderno' };
const ORDEM = ['pt', 'he', 'en', 'es', 'fr', 'it', 'de', 'ru'];   // pt e he primeiro

const norma = s => String(s).replace(/[֑-ׇ]/g, '').replace(/[^א-ת]/g, '');

// ---------------------------------------------------- ler o relatorio

function lerAchados(caminho = 'RELATORIO-REVISAO-GPT.md') {
  const txt = fs.readFileSync(caminho, 'utf8');
  const sec = txt.split('## Apontamentos, língua por língua')[1];
  if (!sec) return [];
  const corpo = sec.split('\n## ')[0];
  const achados = [];
  let lingua = null, hebraico = null, translit = null, nosso = null, a = null;
  for (const linha of corpo.split('\n')) {
    let m;
    if ((m = linha.match(/^### (.+?) — /))) { lingua = LING[m[1]] || null; continue; }
    if ((m = linha.match(/^#### (.+)$/))) { hebraico = m[1].trim(); translit = null; nosso = null; continue; }
    if ((m = linha.match(/^\*(.+)\*$/))) { translit = m[1].trim(); continue; }
    if ((m = linha.match(/^Texto em .+?: \*\*(.+)\*\*$/))) { nosso = m[1].trim(); continue; }
    if ((m = linha.match(/^- \*\*(.+?)\*\* · \*(.+?)\*$/))) {
      a = { lingua, hebraico, translit, textoNosso: nosso, onde: m[1].trim(), tipo: m[2].trim() };
      achados.push(a); continue;
    }
    if (!a) continue;
    if ((m = linha.match(/^  - trecho citado: `(.+?)`/))) { a.citacao = m[1]; continue; }
    if ((m = linha.match(/^  - problema: (.+)$/))) { a.problema = m[1].trim(); continue; }
    if ((m = linha.match(/^  - sugestão do revisor: (.+)$/))) { a.sugestao = m[1].trim(); continue; }
  }
  return achados.filter(x => x.lingua && x.hebraico);
}

// a alternativa e o que estiver entre aspas dentro da sugestao do revisor
const ASPAS = /['‘’"“”«»]([^'‘’"“”«»]{2,80})['‘’"“”«»]/g;
function alternativaDe(a) {
  if (!a.sugestao) return null;
  const achadas = [...a.sugestao.matchAll(ASPAS)].map(x => x[1].trim()).filter(Boolean);
  if (!achadas.length) return null;
  return achadas.sort((x, y) => y.length - x.length)[0];
}

// embaralhar de forma estavel: mesma entrada gera sempre a mesma ordem, para o
// rabino poder fechar e reabrir a pagina sem as opcoes trocarem de lugar
function semente(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 2;
}

// ---------------------------------------------------- montar os itens

const glossario = JSON.parse(fs.readFileSync('glossario.json', 'utf8'));
const porHebraico = {};
for (const [chave, e] of Object.entries(glossario.entradas)) porHebraico[norma(e.hebrew)] = { chave, ...e };

const achados = lerAchados();
const itens = [];
let semPar = 0, semEntrada = 0;

for (const a of achados) {
  const e = porHebraico[norma(a.hebraico)];
  if (!e) { semEntrada++; continue; }

  const glosas = a.lingua === 'pt' ? e.glosas_pt : (e.glosas && e.glosas[a.lingua]);
  const traducao = a.lingua === 'pt' ? e.translation_pt : (e.translations && e.translations[a.lingua]);
  const palavras = e.hebrew.split(/\s+/);

  const mg = a.onde.match(/glosa\s*(\d+)/i);
  let campo, indice = null, nosso, palavraHebraica = null;
  if (mg) {
    indice = Number(mg[1]) - 1;
    if (!glosas || indice < 0 || indice >= glosas.length) continue;
    campo = 'glosa'; nosso = glosas[indice]; palavraHebraica = palavras[indice] || null;
  } else {
    campo = 'traducao'; nosso = traducao;
  }
  if (!nosso) continue;

  // Um par so vale se as duas opcoes forem comparaveis. Fragmento contra frase
  // inteira nao e escolha cega: o comprimento sozinho ja entrega qual e a nossa.
  let alt = alternativaDe(a);
  if (alt) {
    const n = String(nosso).trim(), x = alt.trim();
    if (x === n) alt = null;
    else if (campo === 'traducao') {
      if (x.length < 0.6 * n.length) {
        // o revisor propos so um trecho: encaixa no lugar do que ele citou, para
        // a alternativa virar uma frase inteira comparavel com a nossa
        alt = (a.citacao && n.includes(a.citacao) && a.citacao !== n)
          ? n.replace(a.citacao, x) : null;
      }
    } else if (x.length > 3 * Math.max(4, n.length)) {
      alt = null;   // veio prosa, nao uma glosa
    }
    if (alt && alt.trim() === n) alt = null;

    // A alternativa tem que ser da mesma escrita que a nossa. O revisor as vezes
    // "sugere" a propria palavra hebraica de origem, ou deixa vazar prosa da
    // explicacao. Nada disso e uma opcao que se possa por na frente do rabino.
    if (alt) {
      const heb = t => /[֑-ׇא-ת]/.test(t);
      if (heb(alt) !== heb(nosso)) alt = null;                       // trocou de alfabeto
      else if (palavraHebraica && norma(alt) === norma(palavraHebraica)) alt = null;  // e a origem
      else if (/[()\[\]]|significa|traduz|correto seria|deveria/i.test(alt)) alt = null;  // prosa
      else if (alt.trim().split(/\s+/).length > 14) alt = null;      // virou paragrafo
    }
  }
  const temPar = !!alt;
  if (!temPar) semPar++;

  const id = `${e.chave}|${a.lingua}|${campo}|${indice ?? ''}`;
  const inverte = temPar && semente(id) === 1;

  itens.push({
    id,
    lingua: a.lingua,
    chave: e.chave,
    hebraico: e.hebrew,
    translit: e.transliteration_pt || a.translit || '',
    campo, indice,
    palavraHebraica,
    contexto: campo === 'glosa' ? traducao : null,
    problema: a.problema || '',
    tipo: a.tipo,
    // A e B ja embaralhados; o HTML nunca diz qual e qual
    A: temPar ? (inverte ? alt : nosso) : nosso,
    B: temPar ? (inverte ? nosso : alt) : null,
    // guardado so para o aplicar-escolhas saber o que e o que; nunca aparece na tela
    _nosso: nosso,
    _revisor: temPar ? alt : null,
  });
}

// juntar itens repetidos (mesmo id) mantendo o primeiro
const vistos = new Set();
const unicos = itens.filter(i => (vistos.has(i.id) ? false : (vistos.add(i.id), true)));
// escolhas cegas de verdade primeiro; depois as que so tem a nossa versao
unicos.sort((x, y) => ORDEM.indexOf(x.lingua) - ORDEM.indexOf(y.lingua) ||
                      (x.B ? 0 : 1) - (y.B ? 0 : 1) ||
                      x.chave.localeCompare(y.chave) || (x.indice ?? -1) - (y.indice ?? -1));

const porLingua = {};
for (const i of unicos) porLingua[i.lingua] = (porLingua[i.lingua] || 0) + 1;


// ---------------------------------------------------- o documento impresso

const comPar = unicos.filter(i => i.B);
const semAlternativa = unicos.filter(i => !i.B);
const dataBR = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

const e = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const rtl = l => (l === 'he' ? ' dir="rtl" lang="he"' : '');

function alvoDe(i) {
  if (i.campo !== 'glosa') return 'Tradução do verso inteiro';
  const p = i.palavraHebraica ? `<span class="pal">${e(i.palavraHebraica)}</span>` : `palavra nº ${i.indice + 1}`;
  return `Palavra ${p}${i.contexto ? ` &middot; no verso: “${e(i.contexto)}”` : ''}`;
}

function bloco(i, n) {
  return `
  <article class="item">
    <div class="cab"><span class="num">${n}</span>${alvoDe(i)}</div>
    <div class="heb" dir="rtl" lang="he">${e(i.hebraico)}</div>
    <div class="tl">${e(i.translit)}</div>
    <div class="opcoes">
      <div class="op"><span class="cx"></span><span class="rot">Opção A</span>
        <div class="txt"${rtl(i.lingua)}>${e(i.A)}</div></div>
      <div class="op"><span class="cx"></span><span class="rot">Opção B</span>
        <div class="txt"${rtl(i.lingua)}>${e(i.B)}</div></div>
    </div>
    <div class="outra"><span class="cx"></span>Outra: <span class="linha"></span></div>
  </article>`;
}

function blocoSemPar(i, n) {
  return `
  <article class="item">
    <div class="cab"><span class="num">${n}</span>${alvoDe(i)}</div>
    <div class="heb" dir="rtl" lang="he">${e(i.hebraico)}</div>
    <div class="tl">${e(i.translit)}</div>
    <div class="opcoes uma">
      <div class="op"><span class="cx"></span><span class="rot">A nossa versão — manter</span>
        <div class="txt"${rtl(i.lingua)}>${e(i.A)}</div></div>
    </div>
    <div class="obs"><b>O revisor objetou:</b> ${e(i.problema)}</div>
    <div class="outra"><span class="cx"></span>Outra: <span class="linha"></span></div>
  </article>`;
}

let contador = 0;   // numeracao continua nas duas secoes: item 112 e so um item
function secoes(itens, montar) {
  let saida = '';
  for (const l of ORDEM) {
    const meus = itens.filter(x => x.lingua === l);
    if (!meus.length) continue;
    saida += `<h2 class="lingua">${NOME[l]}<span class="qt">${meus.length} ${meus.length === 1 ? 'item' : 'itens'}</span></h2>`;
    for (const i of meus) { i.numero = ++contador; saida += montar(i, i.numero); }
  }
  return saida;
}

const doc = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>Escolha do rabino — glossário do Kadish</title>
<style>
  @page { size: A4; margin: 16mm 15mm 18mm; }
  @page :first { margin-top: 34mm; }
  * { box-sizing: border-box; }
  body { margin:0; font-family:"FreeSerif","Liberation Serif",serif; color:#17140f; font-size:11.5pt; }

  .rodape { position: fixed; bottom: 0; left: 0; right: 0; font-size: 8.5pt;
            color: #7a7264; border-top: .4pt solid #ddd3c0; padding-top: 2mm;
            display: flex; justify-content: space-between; }

  .capa { break-after: page; page-break-after: always; text-align: center; padding-top: 12mm; }
  .capa h1 { font-size: 25pt; margin: 0 0 3mm; }
  .capa .quem { font-size: 13pt; color: #6b6153; margin-bottom: 16mm; }
  .capa .ordem { font-size: 15pt; line-height: 1.6; border: 1.4pt solid #8b6a3e;
                 border-radius: 4mm; padding: 8mm 10mm; margin: 0 6mm 14mm; }
  .capa .como { text-align: left; font-size: 11pt; line-height: 1.6; margin: 0 6mm;
                color: #4a4438; }
  .capa .como li { margin-bottom: 2.5mm; }
  .capa .aviso { margin: 14mm 6mm 0; font-size: 10.5pt; color: #8a3a1a;
                 border-top: .5pt solid #e0d6c3; padding-top: 5mm; }

  h2.lingua { font-size: 15pt; margin: 9mm 0 4mm; padding-bottom: 1.6mm;
              border-bottom: 1.2pt solid #8b6a3e; break-after: avoid; page-break-after: avoid; }
  h2.lingua .qt { float: right; font-size: 10pt; font-weight: 400; color: #7a7264; }
  h2.lingua:first-of-type { margin-top: 0; }

  .item { break-inside: avoid; page-break-inside: avoid; border: .5pt solid #ddd3c0;
          border-radius: 2.5mm; padding: 4mm 5mm 4.5mm; margin-bottom: 4.5mm; }
  .cab { font-size: 9.5pt; color: #6b6153; margin-bottom: 2mm; }
  .cab .num { display:inline-block; min-width: 7mm; font-weight: 700; color: #8b6a3e; }
  .cab .pal { font-size: 12pt; }
  .heb { font-size: 20pt; line-height: 1.6; text-align: right; margin-bottom: 1.5mm; }
  .tl { font-size: 10.5pt; font-style: italic; color: #5d5445; margin-bottom: 3.5mm; }

  .opcoes { display: flex; gap: 4mm; }
  .opcoes .op { flex: 1 1 0; border: .5pt solid #cfc4ad; border-radius: 2mm; padding: 3mm 3.5mm; }
  .opcoes.uma .op { flex: 0 1 auto; min-width: 60%; }
  .op .cx { display:inline-block; width: 4.2mm; height: 4.2mm; border: 1pt solid #4a4438;
            border-radius: .8mm; vertical-align: -.8mm; margin-right: 2mm; }
  .op .rot { font-size: 9pt; letter-spacing: .07em; text-transform: uppercase; color: #6b6153; }
  .op .txt { font-size: 13pt; line-height: 1.42; margin-top: 2mm; }

  .obs { font-size: 10pt; color: #4a4438; background: #f6f1e6; border-radius: 2mm;
         padding: 2.5mm 3mm; margin-top: 3mm; }
  .outra { margin-top: 3.5mm; font-size: 11pt; }
  .outra .cx { display:inline-block; width: 4.2mm; height: 4.2mm; border: 1pt solid #4a4438;
               border-radius: .8mm; vertical-align: -.8mm; margin-right: 2mm; }
  .outra .linha { display: inline-block; width: 62%; border-bottom: .6pt solid #9a9081;
                  height: 4mm; vertical-align: -1mm; }
  .nota { font-size: 10.5pt; color: #4a4438; background: #f6f1e6; border-left: 2pt solid #8b6a3e;
          padding: 3.5mm 4mm; margin: 0 0 5mm; line-height: 1.5; }
</style></head>
<body>
<div class="rodape">
  <span>Glossário do Kadish — escolha do rabino</span>
  <span>rascunho — decisão final é desta revisão · ${dataBR}</span>
</div>

<section class="capa">
  <h1>Glossário do Kadish</h1>
  <div class="quem">Pontos levantados por uma revisão independente, para decisão do rabino</div>

  <div class="ordem"><strong>Assinale a tradução preferida em cada item, ou escreva a sua.</strong></div>

  <ul class="como">
    <li>São <strong>${unicos.length} itens</strong>, agrupados por língua. Comece pelo português e pelo hebraico moderno.</li>
    <li>Em ${comPar.length} deles há duas versões, <strong>A</strong> e <strong>B</strong>. Qual é a nossa e qual é a do
        revisor <strong>não está dito de propósito</strong>, e a ordem foi embaralhada, para que a escolha
        não seja influenciada.</li>
    <li>Nos outros ${semAlternativa.length}, o revisor apontou um problema mas não propôs outra versão.
        Ali aparece só a nossa, com a objeção dele: manter, ou escrever outra.</li>
    <li>Onde nenhuma servir, use a linha <strong>Outra</strong>.</li>
    <li>O hebraico do Kadish <strong>não está em questão</strong> — ele vem do siddur. O que se decide
        aqui é a tradução.</li>
  </ul>

  <div class="aviso">
    Este documento é um rascunho e nada foi aplicado. Nenhuma marcação feita aqui
    altera o texto sozinha: as decisões são digitadas depois por uma pessoa.
  </div>
</section>

<div class="nota">
  A transliteração não aparece como opção porque não foi submetida a esta revisão —
  ela entrou apenas como apoio para ler o hebraico. Se o rabino quiser revisá-la,
  isso é uma rodada à parte.
</div>

${secoes(comPar, bloco)}

${semAlternativa.length ? `<h2 class="lingua" style="margin-top:10mm">Objeções sem alternativa proposta<span class="qt">${semAlternativa.length} itens</span></h2>
<div class="nota">Nestes o revisor reclamou mas não escreveu outra versão. Não inventamos
uma Opção B: ou a nossa fica, ou o rabino escreve a dele.</div>
${secoes(semAlternativa, blocoSemPar)}` : ''}

</body></html>`;

fs.writeFileSync('ESCOLHA-RABINO.html', doc);

// PDF pelo Chromium, que e quem sabe hebraico (direcao e nikud)
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const navegador = await chromium.launch();
const pag = await navegador.newPage();
await pag.setContent(doc, { waitUntil: 'load' });
await pag.pdf({ path: 'ESCOLHA-RABINO.pdf', format: 'A4', printBackground: true });
await navegador.close();

// ponte entre o papel e o glossario: numero do item -> o que cada letra quer dizer.
// O rabino nunca ve este arquivo; ele existe para o aplicar-escolhas.mjs saber
// qual texto e a Opcao A e qual e a B de cada item.
fs.writeFileSync('escolha-rabino-itens.json', JSON.stringify({
  _leia: 'Gerado por gerar-escolha-rabino.mjs. Diz, para cada numero impresso no ' +
         'ESCOLHA-RABINO.pdf, qual texto e a Opcao A e qual e a Opcao B, e onde no ' +
         'glossario.json cada um se aplica. Use com aplicar-escolhas.mjs.',
  itens: unicos.map(i => ({
    numero: i.numero, lingua: i.lingua, chave: i.chave, hebraico: i.hebraico,
    campo: i.campo, indice: i.indice,
    A: i.A, B: i.B,
    origem_A: i.A === i._nosso ? 'nossa' : 'revisor',
    origem_B: i.B == null ? null : (i.B === i._nosso ? 'nossa' : 'revisor'),
  })),
}, null, 2) + '\n');

console.log(`ESCOLHA-RABINO.html e .pdf escritos — ${unicos.length} itens ` +
            `(${comPar.length} com opção A/B real, ${semAlternativa.length} sem alternativa do revisor).`);
console.log('por língua:', ORDEM.filter(l => porLingua[l]).map(l => `${l}:${porLingua[l]}`).join('  '));
