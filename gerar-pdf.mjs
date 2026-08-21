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
// A moldura do folheto (marca d'agua, titulo, rodape) sai na lingua do folheto.
// Sair em portugues num folheto alemao nao serve para nada: quem segura o papel
// precisa conseguir ler que aquilo e RASCUNHO e nao deve ser distribuido.
const T = {
  pt: { yatom:'Kadish Yatom (do enlutado)', derabanan:'Kadish deRabanan',
        agua:'RASCUNHO · AGUARDANDO REVISÃO RABÍNICA',
        tarja:'RASCUNHO — AGUARDANDO REVISÃO RABÍNICA — NÃO DISTRIBUIR',
        sub:(n,l,v)=>`Nussach ${n} · texto, transliteração e tradução em ${l} · ${v} versos`,
        nome:'português',
        rodape:'Este folheto é um <strong>rascunho</strong>. O texto hebraico segue o siddur indicado em <em>fontes/LIVROS.md</em>; a transliteração e a tradução ainda aguardam revisão do rabino. As traduções fora do português são rascunho de IA e não devem ser distribuídas sem revisão humana.' },
  en: { yatom:"Kaddish Yatom (Mourner's)", derabanan:'Kaddish deRabanan',
        agua:'DRAFT · AWAITING RABBINICAL REVIEW',
        tarja:'DRAFT — AWAITING RABBINICAL REVIEW — DO NOT DISTRIBUTE',
        sub:(n,l,v)=>`Nusach ${n} · text, transliteration and translation in ${l} · ${v} verses`,
        nome:'English',
        rodape:'This booklet is a <strong>draft</strong>. The Hebrew text follows the siddur listed in <em>fontes/LIVROS.md</em>; the transliteration and the translation still await the rabbi\u2019s review. Translations other than Portuguese are AI drafts and must not be distributed without human review.' },
  es: { yatom:'Kadish Yatom (del enlutado)', derabanan:'Kadish deRabanan',
        agua:'BORRADOR · PENDIENTE DE REVISIÓN RABÍNICA',
        tarja:'BORRADOR — PENDIENTE DE REVISIÓN RABÍNICA — NO DISTRIBUIR',
        sub:(n,l,v)=>`Nusaj ${n} · texto, transliteración y traducción en ${l} · ${v} versículos`,
        nome:'español',
        rodape:'Este folleto es un <strong>borrador</strong>. El texto hebreo sigue el sidur indicado en <em>fontes/LIVROS.md</em>; la transliteración y la traducción aún esperan la revisión del rabino. Las traducciones fuera del portugués son borrador de IA y no deben distribuirse sin revisión humana.' },
  fr: { yatom:"Kaddish Yatom (de l'endeuillé)", derabanan:'Kaddish deRabanan',
        agua:'BROUILLON · EN ATTENTE DE VALIDATION RABBINIQUE',
        tarja:'BROUILLON — EN ATTENTE DE VALIDATION RABBINIQUE — NE PAS DIFFUSER',
        sub:(n,l,v)=>`Noussah ${n} · texte, translittération et traduction en ${l} · ${v} versets`,
        nome:'français',
        rodape:'Ce livret est un <strong>brouillon</strong>. Le texte hébreu suit le siddour indiqué dans <em>fontes/LIVROS.md</em> ; la translittération et la traduction attendent encore la validation du rabbin. Les traductions autres que le portugais sont des brouillons produits par IA et ne doivent pas être diffusées sans relecture humaine.' },
  it: { yatom:'Kaddish Yatom (dei dolenti)', derabanan:'Kaddish deRabanan',
        agua:'BOZZA · IN ATTESA DI VERIFICA RABBINICA',
        tarja:'BOZZA — IN ATTESA DI VERIFICA RABBINICA — NON DISTRIBUIRE',
        sub:(n,l,v)=>`Nusach ${n} · testo, traslitterazione e traduzione in ${l} · ${v} versetti`,
        nome:'italiano',
        rodape:'Questo libretto è una <strong>bozza</strong>. Il testo ebraico segue il siddur indicato in <em>fontes/LIVROS.md</em>; la traslitterazione e la traduzione attendono ancora la verifica del rabbino. Le traduzioni diverse dal portoghese sono bozze prodotte da IA e non vanno distribuite senza revisione umana.' },
  de: { yatom:'Kaddisch Jatom (Trauerkaddisch)', derabanan:'Kaddisch deRabanan',
        agua:'ENTWURF · RABBINISCHE PRÜFUNG AUSSTEHEND',
        tarja:'ENTWURF — RABBINISCHE PRÜFUNG AUSSTEHEND — NICHT WEITERGEBEN',
        sub:(n,l,v)=>`Nussach ${n} · Text, Umschrift und Übersetzung auf ${l} · ${v} Verse`,
        nome:'Deutsch',
        rodape:'Dieses Heft ist ein <strong>Entwurf</strong>. Der hebräische Text folgt dem in <em>fontes/LIVROS.md</em> genannten Siddur; Umschrift und Übersetzung warten noch auf die Prüfung durch den Rabbiner. Übersetzungen außer der portugiesischen sind KI-Entwürfe und dürfen ohne menschliche Prüfung nicht weitergegeben werden.' },
  ru: { yatom:'Кадиш ятом (кадиш сироты)', derabanan:'Кадиш дерабанан',
        agua:'ЧЕРНОВИК · ОЖИДАЕТ РАВВИНСКОЙ ПРОВЕРКИ',
        tarja:'ЧЕРНОВИК — ОЖИДАЕТ РАВВИНСКОЙ ПРОВЕРКИ — НЕ РАСПРОСТРАНЯТЬ',
        sub:(n,l,v)=>`Нусах ${n} · текст, транслитерация и перевод на ${l} · стихов: ${v}`,
        nome:'русский',
        rodape:'Эта брошюра — <strong>черновик</strong>. Еврейский текст следует сидуру, указанному в <em>fontes/LIVROS.md</em>; транслитерация и перевод ещё ждут проверки раввина. Переводы, кроме португальского, — черновики, сделанные ИИ, и не должны распространяться без человеческой проверки.' },
  he: { yatom:'קדיש יתום', derabanan:'קדיש דרבנן',
        agua:'טיוטה · ממתין לבדיקה רבנית',
        tarja:'טיוטה — ממתין לבדיקה רבנית — לא להפצה',
        sub:(n,l,v)=>`נוסח ${n} · טקסט, תעתיק ותרגום ל${l} · ${v} פסוקים`,
        nome:'עברית',
        rodape:'החוברת הזאת היא <strong>טיוטה</strong>. הטקסט העברי הולך אחר הסידור המצוין ב-<em>fontes/LIVROS.md</em>; התעתיק והתרגום עדיין ממתינים לבדיקת הרב. התרגומים שאינם בפורטוגזית הם טיוטה של בינה מלאכותית ואין להפיץ אותם בלי בדיקה אנושית.' }
};
const t = T[LINGUA] || T.pt;

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
<html lang="${LINGUA}"${LINGUA === 'he' ? ' dir="rtl"' : ''}><head><meta charset="utf-8"><title>${nussach} ${tipo}</title>
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
      () => `<span>${esc(t.agua)}</span>`).join('')}</div>
  <div class="tarja">${esc(t.tarja)}</div>

  <div class="conteudo">
    <header>
      <h1>${esc(t[tipo])}</h1>
      <div class="sub">${esc(t.sub(nussach, t.nome, sync.versos.length))}</div>
    </header>
    ${versos}
    <footer>
      ${t.rodape}
    </footer>
  </div>
</body></html>`;
}

fs.mkdirSync(SAIDA, { recursive: true });
const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
);
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
console.log(`\n${n} folhetos gerados em ${SAIDA}/ (língua: ${t.nome}).`);
