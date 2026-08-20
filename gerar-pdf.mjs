/**
 * gerar-pdf.mjs — os 8 folhetos imprimiveis, um por combinacao.
 *
 * Monta o folheto em HTML e manda o Chromium imprimir. O Chromium e quem sabe
 * hebraico: direcao da direita para a esquerda, nikud no lugar certo. Biblioteca
 * de PDF generica inverteria as letras e soltaria os pontos.
 *
 * SO LE os sync/*.json. Escreve apenas em folhetos/.
 *
 * Todo folheto sai marcado RASCUNHO — AGUARDANDO REVISAO RABINICA, em marca
 * d'agua repetida em toda pagina e em tarja no topo. Nao tire isso enquanto o
 * rabino nao tiver revisado: a regra 5 das invioláveis diz que a autoridade do
 * texto e o siddur e o rabino, nunca o modelo, e 7 das 8 linguas sao rascunho.
 *
 * Uso:  PLAYWRIGHT_PATH=/opt/node22/lib/node_modules/playwright/index.js \
 *         node gerar-pdf.mjs [lingua]      (lingua padrao: pt)
 */
import fs from 'node:fs';
import path from 'node:path';

const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;

const LINGUA = process.argv[2] || 'pt';
const SAIDA = 'folhetos';
const NUSSACHIM = ['ashkenaz', 'chabad', 'sefard', 'sefaradi'];
const TIPOS = ['yatom', 'derabanan'];
const NOME_TIPO = { yatom: 'Kadish Yatom (do enlutado)', derabanan: 'Kadish deRabanan' };
const NOME_LINGUA = { pt: 'português', en: 'inglês', es: 'espanhol', fr: 'francês',
                      it: 'italiano', de: 'alemão', ru: 'russo', he: 'hebraico moderno' };

const esc = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function traducao(v) {
  if (LINGUA === 'pt') return v.translation_pt || '';
  return (v.translations && v.translations[LINGUA]) || v.translation_pt || '';
}

function html(nussach, tipo, sync) {
  const versos = sync.versos.map(v => `
    <section class="v">
      <div class="n">§${v.n}</div>
      <div class="heb" dir="rtl" lang="he">${esc(v.hebrew)}</div>
      <div class="tl">${esc(v.transliteration_pt || '')}</div>
      <div class="tr"${LINGUA === 'he' ? ' dir="rtl" lang="he"' : ''}>${esc(traducao(v))}</div>
    </section>`).join('\n');

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${nussach} ${tipo}</title>
<style>
  @page { size: A4; margin: 18mm 16mm 16mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "FreeSerif", "Liberation Serif", serif; color: #16130e; }

  /* marca d'agua: position:fixed repete em toda pagina impressa no Chromium */
  .agua { position: fixed; inset: 0; z-index: 0; pointer-events: none;
          display: flex; flex-direction: column; justify-content: space-around;
          transform: rotate(-30deg); opacity: .05; }
  .agua span { font-size: 21pt; font-weight: 700; letter-spacing: .05em;
               text-align: center; white-space: nowrap; color: #a11; }

  .tarja { position: fixed; top: 0; left: 0; right: 0; z-index: 2;
           background: #a11; color: #fff; text-align: center;
           font-size: 8.5pt; font-weight: 700; letter-spacing: .08em;
           padding: 2.5mm 0; }

  .conteudo { position: relative; z-index: 1; padding-top: 8mm; }

  header { border-bottom: 1.2pt solid #a58a5c; padding-bottom: 4mm; margin-bottom: 6mm; }
  h1 { font-size: 19pt; margin: 0 0 1mm; }
  .sub { font-size: 10pt; color: #6b6153; }

  .v { break-inside: avoid; page-break-inside: avoid;
       padding: 2.4mm 0 2.6mm; border-bottom: .4pt solid #e2d9c6; }
  .n  { font-size: 7.5pt; color: #9a8f7d; margin-bottom: .6mm; }
  .heb { font-size: 21pt; line-height: 1.62; text-align: right; margin-bottom: 1.2mm; }
  .tl { font-size: 10.5pt; font-style: italic; color: #5d5445; margin-bottom: .6mm; }
  .tr { font-size: 11pt; line-height: 1.38; }

  footer { margin-top: 7mm; font-size: 8.5pt; color: #6b6153;
           border-top: .4pt solid #e2d9c6; padding-top: 3mm; }
</style></head>
<body>
  <div class="agua">${Array.from({ length: 5 },
      () => '<span>RASCUNHO · AGUARDANDO REVISÃO RABÍNICA</span>').join('')}</div>
  <div class="tarja">RASCUNHO — AGUARDANDO REVISÃO RABÍNICA — NÃO DISTRIBUIR</div>

  <div class="conteudo">
    <header>
      <h1>${NOME_TIPO[tipo]}</h1>
      <div class="sub">Nussach ${nussach} · texto, transliteração e tradução em ${NOME_LINGUA[LINGUA] || LINGUA}
        · ${sync.versos.length} versos</div>
    </header>
    ${versos}
    <footer>
      Este folheto é um <strong>rascunho</strong>. O texto hebraico segue o siddur
      indicado em <em>fontes/LIVROS.md</em>; a transliteração e a tradução ainda
      aguardam revisão do rabino. As traduções fora do português são rascunho de
      IA e não devem ser distribuídas sem revisão humana.
    </footer>
  </div>
</body></html>`;
}

fs.mkdirSync(SAIDA, { recursive: true });
const navegador = await chromium.launch();
const pag = await navegador.newPage();
let n = 0;

for (const nussach of NUSSACHIM) {
  for (const tipo of TIPOS) {
    const sync = JSON.parse(fs.readFileSync(`sync/${nussach}_${tipo}_sync.json`, 'utf8'));
    await pag.setContent(html(nussach, tipo, sync), { waitUntil: 'load' });
    const arquivo = path.join(SAIDA, `${nussach}_${tipo}${LINGUA === 'pt' ? '' : '_' + LINGUA}.pdf`);
    await pag.pdf({ path: arquivo, format: 'A4', printBackground: true });
    const kb = Math.round(fs.statSync(arquivo).size / 1024);
    console.log(`${arquivo}  ${sync.versos.length} versos  ${kb} KB`);
    n++;
  }
}
await navegador.close();
console.log(`\n${n} folhetos gerados em ${SAIDA}/ (língua: ${NOME_LINGUA[LINGUA] || LINGUA}).`);
