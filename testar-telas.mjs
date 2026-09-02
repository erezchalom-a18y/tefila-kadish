/**
 * testar-telas.mjs — abre o app em 7 tamanhos de tela, em pe e deitado, e
 * confere que da para ler e para tocar com o dedo.
 *
 * Existe porque o Erez viu que "o menu em cima esta desproporcional, textos com
 * fonte pequena comparados ao texto do Kadish". Estava: o menor texto do
 * cabecalho tinha 9,2px num iPhone SE, contra 26px do hebraico.
 *
 * Reprova quando, em qualquer tela E EM QUALQUER DOS DOIS MODOS:
 *   - algum texto visivel do cabecalho fica abaixo de MIN_FONTE;
 *   - algum botao do cabecalho fica com menos de MIN_TOQUE de altura;
 *   - a pagina rola de lado (nunca deve);
 *   - sobra menos de MIN_LEITURA da altura para o texto do Kadish.
 *
 * 02/09 — passou a ROLAR a pagina. Ate aqui nenhuma checagem rolava, e por
 * isso ninguem via que no celular a barra de cima NUNCA grudou: o
 * `overflow-x: hidden` em html/body a impedia de ser sticky, entao no
 * computador ela ficava e no iPhone ela ia embora e nao voltava. Mais um
 * caminho que nenhuma checagem visitava.
 *
 * 01/09 — ate aqui ele media SO o Modo Reza. Era mais um "caminho que nenhuma
 * checagem visitava": o Modo Treino mostra a faixa .prayer-meta, que a reza
 * esconde, e no iPhone deitado isso derrubava a sobra para 52% — abaixo do
 * piso de 60% — sem nada acusar. Agora cada tela e medida duas vezes: como ela
 * abre (reza) e depois de apertar o Treino, no mesmo carregamento.
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

  const medir = () => pag.evaluate(() => {
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
      treino: document.body.classList.contains('modo-treino'),
    };
  });

  // A barra de cima gruda? Rola 900px e pergunta onde ela esta. Um `overflow`
  // diferente de `visible` num ancestral mata o `position: sticky` sem dizer
  // nada — e foi assim por muito tempo no celular.
  const barraGruda = async () => {
    await pag.evaluate(() => window.scrollTo(0, 900));
    await pag.waitForTimeout(250);
    const r = await pag.evaluate(() => {
      const t = document.querySelector('.topbar');
      return { topo: Math.round(t.getBoundingClientRect().top), rolagem: Math.round(window.scrollY) };
    });
    await pag.evaluate(() => window.scrollTo(0, 0));
    await pag.waitForTimeout(150);
    // so vale a pergunta se a pagina rolou mesmo (numa tela alta pode nao rolar)
    return r.rolagem < 50 || r.topo >= -1;
  };

  const julgar = (r) => {
    const leitura = (r.janela - r.altTopo - r.altBaixo) / r.janela;
    const problemas = [];
    if (r.pequenas.length) problemas.push('texto miudo: ' + r.pequenas.join(', '));
    if (r.baixos.length) problemas.push('botao baixo demais: ' + r.baixos.join(', '));
    if (r.rolaLado) problemas.push('a pagina rola de lado');
    if (leitura < MIN_LEITURA) problemas.push(`so ${Math.round(leitura * 100)}% da tela sobra para o Kadish`);
    if (!r.hebraico) problemas.push('nao achei o texto hebraico');
    return { leitura, problemas };
  };

  const linha = (rotulo, r, j) =>
    `${j.problemas.length ? 'FALHA' : 'OK   '} ${(nome + ' · ' + rotulo).padEnd(30)} ${largura}x${altura} | ` +
    `hebraico ${r.hebraico}px | cabecalho ${r.altTopo}px | barra ${r.altBaixo}px | ` +
    `sobra ${Math.round(j.leitura * 100)}%` +
    (j.problemas.length ? '\n        ' + j.problemas.join('\n        ') : '');

  // como o app abre
  const reza = await medir();
  const jr = julgar(reza);
  if (jr.problemas.length) falhas++;
  console.log(linha('reza  ', reza, jr));

  // e depois de apertar o Treino, no MESMO carregamento
  await pag.click('#treinoToggle');
  await pag.waitForTimeout(600);
  const grudouNaReza = await barraGruda();
  if (!grudouNaReza) { falhas++; console.log(`FALHA ${nome} — a barra de cima nao gruda: rolou junto com o texto`); }

  const treino = await medir();
  if (!treino.treino) { falhas++; console.log(`FALHA ${nome} — apertar o Treino nao ligou o modo-treino`); }
  const jt = julgar(treino);
  if (jt.problemas.length) falhas++;
  console.log(linha('treino', treino, jt));

  await pag.close();
}

await navegador.close();
console.log(falhas ? `\n${falhas} medida(s) com problema` : '\nVERDE: as 7 telas passaram nos dois modos');
process.exit(falhas ? 1 : 0);
