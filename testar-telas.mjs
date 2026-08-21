/**
 * testar-telas.mjs — abre o app em 7 tamanhos de tela, em pe e deitado, e
 * confere que da para ler e para tocar com o dedo.
 *
 * Existe porque o Erez viu que "o menu em cima esta desproporcional, textos com
 * fonte pequena comparados ao texto do Kadish". Estava: o menor texto do
 * cabecalho tinha 9,2px num iPhone SE, contra 26px do hebraico.
 *
 * Reprova quando, em qualquer tela:
 *   - algum texto visivel do cabecalho fica abaixo de MIN_FONTE;
 *   - algum botao do cabecalho fica com menos de MIN_TOQUE de altura;
 *   - a pagina rola de lado (nunca deve);
 *   - sobra menos de MIN_LEITURA da altura para o texto do Kadish.
 *
 * Uso: node testar-telas.mjs [http://127.0.0.1:8896/tefila-kadish]
 * Sem os navegadores do Playwright baixados: CHROMIUM=/caminho/do/chrome
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';

const MIN_FONTE = 12;      // piso de legibilidade; a Apple usa 11 como minimo
const MIN_TOQUE = 30;      // altura de botao no cabecalho
const MIN_LEITURA = 0.60;  // fracao da altura que sobra para o Kadish

const TELAS = [
  ['iPhone SE em pe',    375,  667], ['iPhone SE deitado',  667, 375],
  ['iPhone 15 em pe',    393,  852], ['iPhone 15 deitado',  852, 393],
  ['iPad em pe',         820, 1180], ['iPad deitado',      1180, 820],
  ['computador',        1440,  900],
];

const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
);
let falhas = 0;

for (const [nome, largura, altura] of TELAS) {
  const pag = await navegador.newPage({ viewport: { width: largura, height: altura } });
  await pag.goto(`${BASE}/engine.html?n=ashkenaz&t=yatom&audio=mp3`);
  await pag.waitForTimeout(2000);

  const r = await pag.evaluate(() => {
    const topo = document.querySelector('.topbar');
    const heb = document.querySelector('.verse .w, .verse .word, .verse [data-wi]');
    const pequenas = [], baixos = [];
    for (const el of topo.querySelectorAll('*')) {
      const caixa = el.getBoundingClientRect();
      const txt = (el.textContent || '').trim();
      if (!caixa.height || !txt) continue;
      if (!el.children.length) {
        const f = parseFloat(getComputedStyle(el).fontSize);
        if (f < 12) pequenas.push(`${txt.slice(0, 14)} ${f.toFixed(1)}px`);
      }
      if (el.tagName === 'BUTTON' && caixa.height < 30 && !el.closest('.learn-strip'))
        baixos.push(`${txt.slice(0, 14)} ${Math.round(caixa.height)}px`);
    }
    return {
      pequenas, baixos,
      hebraico: heb ? parseFloat(getComputedStyle(heb).fontSize) : 0,
      altTopo: Math.round(topo.getBoundingClientRect().height),
      // A barra de baixo tambem come altura. Ficava de fora desta conta, entao
      // a garantia de "sobra X% para o Kadish" media so metade do problema.
      altBaixo: (() => {
        const b = document.querySelector('.audio-bar');
        if (!b) return 0;
        const r = b.getBoundingClientRect();
        return getComputedStyle(b).display === 'none' ? 0 : Math.round(r.height);
      })(),
      janela: innerHeight,
      rolaLado: document.documentElement.scrollWidth > innerWidth + 1,
    };
  });

  const leitura = (r.janela - r.altTopo - r.altBaixo) / r.janela;
  const problemas = [];
  if (r.pequenas.length) problemas.push('texto miudo: ' + r.pequenas.join(', '));
  if (r.baixos.length) problemas.push('botao baixo demais: ' + r.baixos.join(', '));
  if (r.rolaLado) problemas.push('a pagina rola de lado');
  if (leitura < MIN_LEITURA) problemas.push(`so ${Math.round(leitura * 100)}% da tela sobra para o Kadish`);
  if (!r.hebraico) problemas.push('nao achei o texto hebraico');

  if (problemas.length) falhas++;
  console.log(`${problemas.length ? 'FALHA' : 'OK   '} ${nome.padEnd(19)} ${largura}x${altura} | ` +
              `hebraico ${r.hebraico}px | cabecalho ${r.altTopo}px | barra ${r.altBaixo}px | ` +
              `sobra ${Math.round(leitura * 100)}%` +
              (problemas.length ? '\n        ' + problemas.join('\n        ') : ''));
  await pag.close();
}

await navegador.close();
console.log(falhas ? `\n${falhas} tela(s) com problema` : '\nVERDE: as 7 telas passaram');
process.exit(falhas ? 1 : 0);
