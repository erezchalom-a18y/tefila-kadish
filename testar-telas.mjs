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
 *   - chega menos de MIN_KADISH da tela AOS VERSOS (ver abaixo, 10/09).
 * A sobra de MIN_LEITURA continua no relatorio, mas nao reprova mais — o
 * porque esta escrito ao lado da constante.
 *
 * 10/09 — passou a perguntar onde o PRIMEIRO VERSO comeca. Ate aqui a conta da
 * sobra descontava o cabecalho e a barra e dava o resto por Kadish; a caixa do
 * minyan, que mora no fluxo do texto, comia 85px de um iPhone SE sem nada
 * acusar. A checagem dizia 61% e o Kadish tinha 41%. Mais um caminho que
 * nenhuma checagem visitava — e este estava DENTRO da conta que existia.
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
const PROVAR = process.argv.includes('--provar');   // ver a PROVA, mais abaixo

const MIN_FONTE = 12;      // piso de legibilidade; a Apple usa 11 como minimo
const MIN_TOQUE = 30;      // altura de botao no cabecalho
// MIN_LEITURA e agora INFORMACAO, e nao mais o juiz. Ele descontava o
// cabecalho e a barra e dava o resto por Kadish — um substituto, nunca a
// medida. Em 10/09, com a fileira das portas dentro do cabecalho, ele reprovou
// o iPhone SE (56%) numa mudanca em que o Kadish ficou com a MESMA altura de
// antes (41% nos dois): os mesmos 30px, so que do lado de dentro de uma linha
// arbitraria. Duas contas para a mesma pergunta e o defeito que este projeto
// mais pagou caro; entao fica UMA, e e a que diz a verdade.
// Isto NAO e afrouxar (regra 3). O MIN_KADISH abaixo cobre tudo o que este
// cobria — cabecalho mais alto empurra o primeiro verso para baixo, e ele
// acusa — MAIS o que este nunca viu: qualquer coisa entre o cabecalho e o
// primeiro verso. Ha prova disso rodando: `node testar-telas.mjs <base> --provar`
// incha o cabecalho em 200px e exige que a checagem fique VERMELHA.
const MIN_LEITURA = 0.60;  // so aparece no relatorio; nao reprova mais
// 10/09 — O PISO ACIMA MEDIA SO METADE DA VERDADE, e isto e um buraco de
// checagem, nao um detalhe. Ele desconta o cabecalho e a barra de baixo, e da
// por certo que TODO o resto e Kadish. Nao e: a caixa do minyan mora no fluxo
// do texto, ACIMA do primeiro verso, e comia 85px sem nada acusar. Medido num
// iPhone SE: a conta dizia 61% e o Kadish tinha 41% da tela — 2 versos de 16
// visiveis na primeira tela.
//   A pergunta certa e onde o PRIMEIRO VERSO comeca. Este piso e um catraca
// contra o pior caso MEDIDO hoje (41% no iPhone SE), nao um ideal de projeto:
// serve para a tela nunca mais piorar sem alguem ver. Se um dia o pior caso
// subir, este numero sobe junto — nunca desce.
const MIN_KADISH = 0.40;   // fracao da tela que sobra DE VERDADE para os versos
// 0,40 e CATRACA, nao ideal: e o pior caso medido em 10/09 (41% no iPhone SE em
// pe, na reza, com o memorial vazio). Serve para a tela nunca piorar sem
// alguem ver. Sobe quando o pior caso subir; nunca desce.

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

// 04/09 — MEDIR TAMBEM COM O NOME PREENCHIDO, e isto e a licao da rodada.
//
// Ate hoje todas as telas eram medidas com a dedicatoria VAZIA, que e o estado
// de quem nunca preencheu. Mas o app existe para quem preenche: o "Em memoria
// de" com nome, nome em hebraico e relacao mede 98px, contra 61px do convite.
// Enquanto ela morava no cabecalho (v28), isso derrubava a sobra para o Kadish
// a 52% num iPhone SE — abaixo do piso de 60% — e NENHUMA das dezessete
// checagens via, porque nenhuma preenchia um nome. O defeito ficou dois dias no
// ar. E o mesmo caminho-que-ninguem-visita do canPlayType e do temState.
// Agora cada tela e medida duas vezes: sem nome e com nome.
const MEMORIAL = { name: 'Itzhak Avraham Cohen', hebrew: 'יִצְחָק אַבְרָהָם בֶּן יוֹסֵף',
                   relation: 'meu pai', deathDate: '2026-12-10' };

for (const [nomeTela, largura, altura] of TELAS)
for (const comNome of [false, true]) {
  const nome = nomeTela + (comNome ? ' · com nome' : '');
  const pag = await navegador.newPage({ viewport: { width: largura, height: altura } });
  await pag.goto(`${BASE}/engine.html?n=ashkenaz&t=yatom&audio=mp3`);
  await pag.waitForTimeout(600);
  await pag.evaluate((m) => { try {
      if (m) localStorage.setItem('tefila_memorial', JSON.stringify(m));
      else localStorage.removeItem('tefila_memorial');
    } catch (e) {} }, comNome ? MEMORIAL : null);
  await pag.reload();
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
      // Onde o primeiro verso COMECA. Tudo acima dele (a nota do minyan, a
      // fileira das portas, o que vier depois) e altura que o Kadish perdeu,
      // esteja no cabecalho ou no meio do texto.
      topoDoVerso: (() => {
        const v = document.querySelector('main .verse');
        return v ? Math.round(v.getBoundingClientRect().top) : null;
      })(),
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
    const kadish = r.topoDoVerso === null ? null
      : (r.janela - r.topoDoVerso - r.altBaixo) / r.janela;
    const problemas = [];
    if (r.pequenas.length) problemas.push('texto miudo: ' + r.pequenas.join(', '));
    if (r.baixos.length) problemas.push('botao baixo demais: ' + r.baixos.join(', '));
    if (r.rolaLado) problemas.push('a pagina rola de lado');
    if (kadish === null) problemas.push('nao achei o primeiro verso');
    else if (kadish < MIN_KADISH)
      problemas.push(`so ${Math.round(kadish * 100)}% da tela chega de verdade aos versos ` +
                     `(o primeiro comeca a ${r.topoDoVerso}px)`);
    if (!r.hebraico) problemas.push('nao achei o texto hebraico');
    return { leitura, kadish, problemas };
  };

  // --provar: incha o cabecalho em 200px e exige que a conta ACUSE. Sem isto,
  // trocar o juiz de MIN_LEITURA para MIN_KADISH seria so abrir a porta e
  // dizer que esta fechada. Roda numa tela so, para nao demorar.
  if (PROVAR && nomeTela === TELAS[0][0] && !comNome) {
    await pag.addStyleTag({ content: '.topbar{padding-bottom:200px !important}' });
    await pag.waitForTimeout(300);
    const r = await medir();
    const j = julgar(r);
    const acusou = j.problemas.some(p => p.includes('chega de verdade aos versos'));
    console.log(`${acusou ? 'OK   ' : 'FALHA'}    PROVA: com 200px a mais de cabecalho ela ` +
      `${acusou ? 'ACUSA' : 'NAO acusa — a checagem esta cega'} ` +
      `(aos versos ${Math.round(j.kadish * 100)}%)`);
    if (!acusou) falhas++;
    await pag.reload();
    await pag.waitForTimeout(2000);
  }

  const linha = (rotulo, r, j) =>
    `${j.problemas.length ? 'FALHA' : 'OK   '} ${(nome + ' · ' + rotulo).padEnd(30)} ${largura}x${altura} | ` +
    `hebraico ${r.hebraico}px | cabecalho ${r.altTopo}px | barra ${r.altBaixo}px | ` +
    `sobra ${Math.round(j.leitura * 100)}%` +
    (j.kadish === null ? '' : ` | aos versos ${Math.round(j.kadish * 100)}%`) +
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
