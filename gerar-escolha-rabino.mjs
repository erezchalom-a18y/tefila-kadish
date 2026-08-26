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
// pt, transliteracao e he primeiro
const ORDEM = ['pt', 'tl', 'he', 'en', 'es', 'fr', 'it', 'de', 'ru'];
NOME.tl = 'Transliteração';

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

// achados da transliteracao: relatorio proprio, rubrica propria, uma so "lingua"
function lerAchadosTranslit(caminho = 'RELATORIO-TRANSLITERACAO-GPT.md') {
  if (!fs.existsSync(caminho)) return [];
  const txt = fs.readFileSync(caminho, 'utf8');
  const sec = txt.split('## Apontamentos, língua por língua')[1];
  if (!sec) return [];
  const corpo = sec.split('\n## ')[0];
  const achados = [];
  let hebraico = null, atual = null, a = null;
  for (const linha of corpo.split('\n')) {
    let m;
    if ((m = linha.match(/^#### (.+)$/))) { hebraico = m[1].trim(); atual = null; continue; }
    if ((m = linha.match(/^Transliteração: \*\*(.+)\*\*$/))) { atual = m[1].trim(); continue; }
    if ((m = linha.match(/^- \*\*(.+?)\*\* · \*(.+?)\*$/))) {
      a = { lingua: 'tl', hebraico, textoNosso: atual, onde: 'transliteracao', tipo: m[2].trim() };
      achados.push(a); continue;
    }
    if (!a) continue;
    if ((m = linha.match(/^  - trecho citado: `(.+?)`/))) { a.citacao = m[1]; continue; }
    if ((m = linha.match(/^  - problema: (.+)$/))) { a.problema = m[1].trim(); continue; }
    if ((m = linha.match(/^  - sugestão do revisor: (.+)$/))) { a.sugestao = m[1].trim(); continue; }
  }
  return achados.filter(x => x.hebraico && x.textoNosso);
}

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

// itens de transliteracao
for (const a of lerAchadosTranslit()) {
  const ent = porHebraico[norma(a.hebraico)];
  if (!ent) { semEntrada++; continue; }
  const nosso = ent.transliteration_pt;
  if (!nosso) continue;

  let alt = alternativaDe(a);
  if (alt) {
    const n = nosso.trim(), x = alt.trim();
    // a sugestao tem que ser a transliteracao INTEIRA corrigida, nao um pedaco
    // nem prosa da explicacao, e nao pode vir em hebraico
    if (x === n) alt = null;
    else if (/[֑-ׇא-ת]/.test(x)) alt = null;
    else if (/[()\[\]]|significa|correto seria|deveria|pronunc/i.test(x)) alt = null;
    else if (x.length < 0.6 * n.length || x.length > 1.6 * n.length) alt = null;
  }
  if (!alt) semPar++;

  const id = `${ent.chave}|tl|transliteracao|`;
  const inverte = !!alt && semente(id) === 1;
  itens.push({
    id, lingua: 'tl', chave: ent.chave, hebraico: ent.hebrew,
    translit: nosso, campo: 'transliteracao', indice: null, palavraHebraica: null,
    contexto: ent.translation_pt || null,
    problema: a.problema || '', tipo: a.tipo,
    A: alt ? (inverte ? alt : nosso) : nosso,
    B: alt ? (inverte ? nosso : alt) : null,
    _nosso: nosso, _revisor: alt || null,
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

// Numeracao continua sobre TODOS os itens, antes de separar por lingua: assim o
// numero 112 e o numero 112 em qualquer caderno, e ditar nunca fica ambiguo.
unicos.forEach((i, k) => { i.numero = k + 1; });

const dataBR = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
const e = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const rtl = l => (l === 'he' ? ' dir="rtl" lang="he"' : '');

// Muitos pares diferem por uma letra ou uma palavra só. Sem marcar, o rabino le
// duas linhas que parecem iguais e nao ve a escolha. Aqui a parte que difere sai
// grifada nos DOIS lados — o que nao entrega origem nenhuma, so torna visivel o
// que ja estava la.
function grifarDiferenca(a, b) {
  const pa = String(a).split(/(\s+)/), pb = String(b).split(/(\s+)/);
  // prefixo e sufixo iguais; o miolo e o que difere
  let ini = 0;
  while (ini < pa.length && ini < pb.length && pa[ini] === pb[ini]) ini++;
  let fim = 0;
  while (fim < pa.length - ini && fim < pb.length - ini &&
         pa[pa.length - 1 - fim] === pb[pb.length - 1 - fim]) fim++;
  const marcar = partes => {
    const antes = partes.slice(0, ini).join('');
    const meio  = partes.slice(ini, partes.length - fim).join('');
    const dep   = partes.slice(partes.length - fim).join('');
    return e(antes) + (meio ? `<mark>${e(meio)}</mark>` : '') + e(dep);
  };
  if (ini > 0 || fim > 0) return [marcar(pa), marcar(pb)];

  // Nenhuma palavra em comum ("todo" x "todas"): compara letra a letra.
  const ca = [...String(a)], cb = [...String(b)];
  let ci = 0;
  while (ci < ca.length && ci < cb.length && ca[ci] === cb[ci]) ci++;
  let cf = 0;
  while (cf < ca.length - ci && cf < cb.length - ci &&
         ca[ca.length - 1 - cf] === cb[cb.length - 1 - cf]) cf++;
  if (ci === 0 && cf === 0) return [e(a), e(b)];   // nada em comum: grifar tudo nao ajuda
  const marcarLetras = c => e(c.slice(0, ci).join('')) +
    (c.length - cf > ci ? `<mark>${e(c.slice(ci, c.length - cf).join(''))}</mark>` : '') +
    e(c.slice(c.length - cf).join(''));
  return [marcarLetras(ca), marcarLetras(cb)];
}

function bloco(i) {
  // Hebraico em cima; transliteracao e traducao embaixo dele.
  //
  // A traducao do verso so aparece quando o que esta em jogo e UMA PALAVRA.
  // Quando o que esta em jogo e a traducao do verso inteiro, mostra-la aqui
  // entregaria qual das duas opcoes e a nossa — e a cegueira acabaria.
  // A transliteracao so aparece em cima quando NAO e ela que esta em jogo —
  // senao entregaria qual das duas opcoes e a nossa.
  const cabecaTl = i.campo === 'transliteracao' ? '' : `<div class="tl">${e(i.translit)}</div>`;
  const mostrarTraducao = (i.campo === 'glosa' || i.campo === 'transliteracao') && i.contexto;
  const contexto = mostrarTraducao ? `<div class="trad">${e(i.contexto)}</div>` : '';
  const emJogo = i.campo === 'glosa'
    ? `Em questão: a palavra <span class="pal">${e(i.palavraHebraica || ('nº ' + (i.indice + 1)))}</span>`
    : i.campo === 'transliteracao'
      ? 'Em questão: como se lê este verso em voz alta'
      : 'Em questão: a tradução do verso inteiro';

  const op = (rot, html) => `<div class="op"><span class="cx"></span><span class="rot">${rot}</span>
        <div class="txt"${rtl(i.lingua)}>${html}</div></div>`;

  const [htmlA, htmlB] = i.B ? grifarDiferenca(i.A, i.B) : [e(i.A), null];
  const opcoes = i.B
    ? `<div class="opcoes">${op('Opção A', htmlA)}${op('Opção B', htmlB)}</div>`
    : `<div class="opcoes uma">${op('A versão atual — manter', htmlA)}</div>
       <div class="obs"><b>O revisor objetou:</b> ${e(i.problema)}</div>`;

  return `
  <article class="item">
    <div class="cab"><span class="num">${i.numero}</span>${emJogo}</div>
    <div class="heb" dir="rtl" lang="he">${e(i.hebraico)}</div>
    ${cabecaTl}
    ${contexto}
    ${opcoes}
    <div class="outra"><span class="cx"></span>${i.campo === 'transliteracao' ? 'Outra transliteração' : 'Outra tradução'} — escreva aqui:
      <div class="linha"></div></div>
  </article>`;
}

const ESTILO = `
  @page { size: A4; margin: 16mm 15mm 24mm; }
  @page :first { margin-top: 30mm; }
  * { box-sizing: border-box; }
  body { margin:0; font-family:"FreeSerif","Liberation Serif",serif; color:#17140f; font-size:11.5pt; }
  /* o rodape fica no pe da area de impressao; a margem de baixo do @page e
     folgada para o ultimo item da pagina nao escorregar por cima dele */
  .rodape { position: fixed; bottom: 0; left: 0; right: 0; font-size: 8.5pt; color:#7a7264;
            border-top:.4pt solid #ddd3c0; padding-top:2mm; display:flex; justify-content:space-between; }
  .capa { break-after: page; page-break-after: always; text-align:center; padding-top:10mm; }
  .capa h1 { font-size:26pt; margin:0 0 2mm; }
  .capa .lingua { font-size:17pt; color:#8b6a3e; font-weight:700; margin-bottom:3mm; }
  .capa .quem { font-size:12.5pt; color:#6b6153; margin-bottom:14mm; }
  .capa .ordem { font-size:15pt; line-height:1.6; border:1.4pt solid #8b6a3e; border-radius:4mm;
                 padding:8mm 10mm; margin:0 6mm 12mm; }
  .capa .como { text-align:left; font-size:11pt; line-height:1.6; margin:0 6mm; color:#4a4438; }
  .capa .como li { margin-bottom:2.5mm; }
  .capa .aviso { margin:12mm 6mm 0; font-size:10.5pt; color:#8a3a1a;
                 border-top:.5pt solid #e0d6c3; padding-top:5mm; }
  h2.secao { font-size:14pt; margin:8mm 0 4mm; padding-bottom:1.6mm; border-bottom:1.2pt solid #8b6a3e;
             break-after: avoid; page-break-after: avoid; }
  h2.secao .qt { float:right; font-size:10pt; font-weight:400; color:#7a7264; }
  h2.secao:first-of-type { margin-top:0; }
  .item { break-inside: avoid; page-break-inside: avoid; border:.5pt solid #ddd3c0;
          border-radius:2.5mm; padding:4mm 5mm 4.5mm; margin-bottom:4.5mm; }
  .cab { font-size:9.5pt; color:#6b6153; margin-bottom:2mm; }
  .cab .num { display:inline-block; min-width:8mm; font-weight:700; color:#8b6a3e; }
  .cab .pal { font-size:12.5pt; }
  .heb { font-size:21pt; line-height:1.62; text-align:right; margin-bottom:1.5mm; }
  .tl { font-size:11pt; font-style:italic; color:#5d5445; margin-bottom:1.2mm; }
  .trad { font-size:11pt; color:#4a4438; margin-bottom:3.5mm; }
  .opcoes { display:flex; gap:4mm; }
  .opcoes .op { flex:1 1 0; border:.5pt solid #cfc4ad; border-radius:2mm; padding:3mm 3.5mm; }
  .opcoes.uma .op { flex:0 1 auto; min-width:62%; }
  .op .cx { display:inline-block; width:4.4mm; height:4.4mm; border:1pt solid #4a4438;
            border-radius:.8mm; vertical-align:-.9mm; margin-right:2mm; }
  .op .rot { font-size:9pt; letter-spacing:.07em; text-transform:uppercase; color:#6b6153; }
  .op .txt { font-size:13.5pt; line-height:1.42; margin-top:2mm; }
  .obs { font-size:10pt; color:#4a4438; background:#f6f1e6; border-radius:2mm;
         padding:2.5mm 3mm; margin-top:3mm; }
  .outra { margin-top:3.5mm; font-size:11.5pt; }
  .outra .cx { display:inline-block; width:4.4mm; height:4.4mm; border:1pt solid #4a4438;
               border-radius:.8mm; vertical-align:-.9mm; margin-right:2mm; }
  .outra .linha { border-bottom:.6pt solid #9a9081; height:7mm; margin-top:1mm; }
  .nota { font-size:10.5pt; color:#4a4438; background:#f6f1e6; border-left:2pt solid #8b6a3e;
          padding:3.5mm 4mm; margin:0 0 5mm; line-height:1.5; }`;

function documento(itens, rotuloLingua) {
  const pares = itens.filter(i => i.B);
  const sozinhos = itens.filter(i => !i.B);
  const secao = (lista, titulo) => lista.length
    ? `<h2 class="secao">${titulo}<span class="qt">${lista.length} ${lista.length === 1 ? 'item' : 'itens'}</span></h2>`
      + lista.map(bloco).join('')
    : '';

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>Escolha do rabino${rotuloLingua ? ' — ' + rotuloLingua : ''}</title>
<style>${ESTILO}</style></head>
<body>
<div class="rodape">
  <span>Glossário do Kadish${rotuloLingua ? ' — ' + rotuloLingua : ''}</span>
  <span>rascunho — decisão final é desta revisão · ${dataBR}</span>
</div>

<section class="capa">
  <h1>Glossário do Kadish</h1>
  ${rotuloLingua ? `<div class="lingua">${rotuloLingua}</div>` : ''}
  <div class="quem">Pontos levantados por uma revisão independente, para decisão do rabino</div>
  <div class="ordem"><strong>Assinale a tradução preferida em cada item, ou escreva a sua.</strong></div>
  <ul class="como">
    <li>São <strong>${itens.length} ${itens.length === 1 ? 'item' : 'itens'}</strong>${rotuloLingua ? ' nesta língua' : ''}.</li>
    ${pares.length ? `<li>Em ${pares.length} deles há duas versões, <strong>A</strong> e <strong>B</strong>.
        Qual é a nossa e qual é a do revisor <strong>não está dito de propósito</strong>, e a ordem foi
        embaralhada, para que a escolha não seja influenciada.</li>` : ''}
    ${sozinhos.length ? `<li>Nos outros ${sozinhos.length}, o revisor apontou um problema mas não propôs
        outra versão. Ali aparece só a atual, com a objeção dele: manter, ou escrever outra.</li>` : ''}
    <li>Onde nenhuma servir, use a linha <strong>Outra</strong>.</li>
    <li>O hebraico do Kadish <strong>não está em questão</strong> — ele vem do siddur. O que se decide
        aqui é a tradução.</li>
    <li>Os números são os mesmos em todos os cadernos: o item 112 é o item 112 em qualquer um.</li>
  </ul>
  <div class="aviso">
    Este documento é um rascunho e nada foi aplicado. Nenhuma marcação feita aqui altera
    o texto sozinha: as decisões são digitadas depois por uma pessoa.
  </div>
</section>

${rotuloLingua === 'Transliteração' ? `<div class="nota">
  Aqui o que se decide é <strong>como o verso se lê em voz alta</strong>, não o que ele
  significa. A tradução aparece só para situar. A transliteração foi revisada numa
  rodada própria, com rubrica de som, nikud e coerência.
</div>` : `<div class="nota">
  A transliteração aparece só como apoio para ler o hebraico. Ela tem caderno próprio
  — o que se decide aqui é a tradução.
</div>`}

${secao(pares, 'Duas versões — assinale uma')}
${sozinhos.length ? `${secao(sozinhos, 'Objeções sem alternativa proposta')}` : ''}
</body></html>`;
}

// ---------------------------------------------------- escrever

const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
// Em maquina sem os navegadores do Playwright baixados (o container remoto ja
// traz um Chromium pronto), da para apontar o executavel por variavel de
// ambiente, como no gerar-pdf.mjs e nos testes:
//   CHROMIUM=/caminho/do/chrome node gerar-escolha-rabino.mjs
const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
);
const pag = await navegador.newPage();

async function escrever(nomeBase, itens, rotulo) {
  const doc = documento(itens, rotulo);
  fs.writeFileSync(`${nomeBase}.html`, doc);
  await pag.setContent(doc, { waitUntil: 'load' });
  await pag.pdf({ path: `${nomeBase}.pdf`, format: 'A4', printBackground: true });
  return itens.length;
}

fs.mkdirSync('escolha-rabino', { recursive: true });

// um caderno por lingua, portugues e hebraico moderno primeiro
const linhas = [];
for (const l of ORDEM) {
  const meus = unicos.filter(i => i.lingua === l);
  if (!meus.length) continue;
  const base = `escolha-rabino/ESCOLHA-RABINO-${l}`;
  await escrever(base, meus, NOME[l]);
  const paginas = await pag.evaluate(() => 0).then(() => null);
  linhas.push({ lingua: NOME[l], arquivo: `${base}.pdf`, itens: meus.length,
                pares: meus.filter(i => i.B).length });
}

// e o caderno completo, com tudo, para arquivo
await escrever('ESCOLHA-RABINO', unicos, null);

await navegador.close();

// ponte entre o papel e o glossario; o rabino nunca ve este arquivo
fs.writeFileSync('escolha-rabino-itens.json', JSON.stringify({
  _leia: 'Gerado por gerar-escolha-rabino.mjs. Diz, para cada numero impresso nos ' +
         'documentos de escolha, qual texto e a Opcao A e qual e a Opcao B, e onde no ' +
         'glossario.json cada um se aplica. Use com aplicar-escolhas.mjs.',
  itens: unicos.map(i => ({
    numero: i.numero, lingua: i.lingua, chave: i.chave, hebraico: i.hebraico,
    campo: i.campo, indice: i.indice, A: i.A, B: i.B,
    origem_A: i.A === i._nosso ? 'nossa' : 'revisor',
    origem_B: i.B == null ? null : (i.B === i._nosso ? 'nossa' : 'revisor'),
  })),
}, null, 2) + '\n');

console.log('cadernos por língua:');
for (const r of linhas)
  console.log(`  ${r.lingua.padEnd(18)} ${String(r.itens).padStart(3)} itens ` +
              `(${r.pares} com A/B)  ->  ${r.arquivo}`);
console.log(`\ncompleto: ESCOLHA-RABINO.pdf — ${unicos.length} itens ` +
            `(${unicos.filter(i => i.B).length} com A/B).`);
