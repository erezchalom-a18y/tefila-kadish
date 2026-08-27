/**
 * checar-treino-fita.mjs — o Modo Treino medido NA FITA, tocando o audio.
 *
 * O Erez pediu: "acho que temos que fazer nova checagem para o modo treino em
 * fita continua". Os testes que existiam olhavam o app por dentro (o contador de
 * verso, o estado). Este olha o que o OUVIDO pega: grava a posicao do audio
 * quadro a quadro e responde tres perguntas, todas sobre a fita:
 *
 *   1. VAZOU  — o treino deixou soar alguma coisa DEPOIS do fim do passo?
 *               E o "be" do bealma: o verso 1 acaba em 4,380 e a palavra
 *               seguinte comeca em 4,380, o mesmo instante. Quem espera a voz
 *               cruzar a fronteira ja deixou o "be" escapar.
 *   2. BURACO — ao retomar, ficou algum pedaco da fita sem tocar?
 *               E o contrario: cortar cedo demais e comer o fim da palavra.
 *   3. FORA   — alguma parada caiu fora de uma fronteira de passo da fita?
 *
 * Tudo em segundos da fita, sem olhar variavel interna nenhuma. Se um dia o
 * app mudar por dentro, esta checagem continua valendo.
 *
 * ATENCAO ao servidor: so vale com Range (206). Sem isso todo seek cai no zero
 * e a medida vira ficcao. Use servidor-teste.mjs — a primeira linha reprova.
 *
 * Uso: node servidor-teste.mjs 8896 . &
 *      node checar-treino-fita.mjs [http://127.0.0.1:8896/tefila-kadish]
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';
const COMBINACOES = [
  ['chabad', 'derabanan'], ['chabad', 'yatom'],
  ['ashkenaz', 'derabanan'], ['sefard', 'yatom'], ['sefaradi', 'derabanan'],
];
const PARADAS = 4;              // quantas paradas medir por combinacao
// O treino ANTECIPA o fim do passo: ele para ANTES da fronteira, nao depois.
// Entao a conta certa nao e "vazou pouco", e "nao passou". A folga de 20 ms e
// so para o quadro em que a pausa acontece.
//
// Isto foi apertado de proposito em 26/08: com 80 ms de folga a checagem dava
// verde no codigo velho, porque num Chromium rapido o vazamento e de ~16 ms. No
// iPad ele e muito maior — o relogio ali anda de 250 em 250 ms — e era o "be" do
// bealma que o Erez ouvia. Uma checagem que so pega o defeito em aparelho lento
// nao pega defeito nenhum.
const TOLERANCIA_BURACO = 0.15;

const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
);
let falhas = 0;
const linha = (ok, txt) => { console.log((ok ? 'OK    ' : 'FALHA ') + txt); if (!ok) falhas++; };

// ---------- o servidor serve Range? ----------
{
  const pag = await navegador.newPage();
  await pag.goto(`${BASE}/engine.html?n=chabad&t=yatom&audio=mp3`);
  const ok = await pag.evaluate(async (base) => {
    try { return (await fetch(`${base}/tefila-audio/chabad/yatom.mp3`, { headers: { Range: 'bytes=0-99' } })).status === 206; }
    catch (e) { return false; }
  }, BASE);
  await pag.close();
  if (!ok) {
    console.log('FALHA o servidor nao responde Range (206) — sem isso o audio nao');
    console.log('      se move e esta checagem nao mede nada. node servidor-teste.mjs 8896 .');
    await navegador.close();
    process.exit(1);
  }
}

console.log('\nO Modo Treino, medido na fita, com o audio tocando:\n');

for (const [n, t] of COMBINACOES) {
  const pag = await navegador.newPage();
  const erros = [];
  pag.on('pageerror', e => erros.push(e.message));
  await pag.goto(`${BASE}/engine.html?n=${n}&t=${t}&audio=mp3`);
  await pag.waitForFunction(() => window.SYNC && window.SYNC.ativo && window.SYNC.ativo(), null, { timeout: 15000 });
  await pag.evaluate(() => { const m = document.getElementById('setupModal'); if (m) m.classList.remove('show'); });

  const r = await pag.evaluate(async (PARADAS) => {
    const a = document.getElementById('audioPlayer');
    const passos = SYNC.passos();
    state.modoTreino = true; state.repeatN = 1;     // so a pausa, sem repeticao
    document.body.classList.add('modo-treino');

    // grava a fita tocada: todo instante em que o audio esteve andando
    const tocado = [];
    let gravando = true;
    (function quadro() {
      if (!gravando) return;
      if (!a.paused) tocado.push(+a.currentTime.toFixed(3));
      requestAnimationFrame(quadro);
    })();

    const paradas = [];
    const espera = ms => new Promise(res => setTimeout(res, ms));
    for (let i = 0; i < PARADAS; i++) {
      const antes = tocado.length;
      document.getElementById('playBtn').click();
      const t0 = performance.now();
      while (performance.now() - t0 < 20000) {
        await espera(60);
        if (a.paused && tocado.length > antes + 5) break;
      }
      if (!a.paused) break;
      await espera(300);
      paradas.push({ parou: +a.currentTime.toFixed(3), ateAqui: tocado.length });
    }
    gravando = false;
    return { passos, paradas, tocado };
  }, PARADAS);

  // ---- as tres perguntas, so com os segundos ----
  const fronteiras = r.passos.map(p => p.end);
  const problemas = [];

  r.paradas.forEach((par, i) => {
    // a fronteira que esta parada devia respeitar
    const alvo = fronteiras.reduce((m, f) => Math.abs(f - par.parou) < Math.abs(m - par.parou) ? f : m, fronteiras[0]);

    // 1. VAZOU: soou alguma coisa depois do fim do passo?
    const trecho = r.tocado.slice(i === 0 ? 0 : r.paradas[i - 1].ateAqui, par.ateAqui);
    const maior = trecho.length ? Math.max(...trecho) : 0;
    const vazou = maior - alvo;
    if (vazou > 0.02)
      problemas.push(`parada ${i + 1}: vazou ${(vazou * 1000).toFixed(0)} ms depois de ${alvo}s (soou ate ${maior}s)`);

    // 2. FORA: a parada caiu perto de uma fronteira da fita?
    if (Math.abs(par.parou - alvo) > 0.35)
      problemas.push(`parada ${i + 1}: parou em ${par.parou}s, longe da fronteira ${alvo}s`);
  });

  // 3. BURACO: junta tudo o que tocou e procura pedaco da fita nao ouvido
  const ouvido = r.tocado.slice().sort((x, y) => x - y);
  let buracos = 0, maiorBuraco = 0;
  for (let i = 1; i < ouvido.length; i++) {
    const d = ouvido[i] - ouvido[i - 1];
    if (d > TOLERANCIA_BURACO) { buracos++; if (d > maiorBuraco) maiorBuraco = d; }
  }
  // o ultimo buraco e o resto da reza que nao chegamos a tocar: nao conta
  const buracosReais = Math.max(0, buracos - 1);

  const ok = problemas.length === 0 && buracosReais === 0 && erros.length === 0
             && r.paradas.length === PARADAS;
  linha(ok, `${n}/${t}: ${r.paradas.length} paradas | ` +
    `vazamento: ${problemas.filter(p => p.includes('vazou')).length} | ` +
    `buracos na fita: ${buracosReais}${maiorBuraco > TOLERANCIA_BURACO ? ` (maior ${(maiorBuraco * 1000).toFixed(0)} ms)` : ''}`);
  problemas.forEach(p => console.log('        ' + p));
  if (erros.length) console.log('        erro de pagina: ' + erros[0]);
  r.paradas.forEach((p, i) => console.log(`        parada ${i + 1}: ${p.parou}s`));
  await pag.close();
}

// ---------- entrar no treino recomeca no Yitgadal ----------
console.log('\nEntrar no Modo Treino volta para a primeira palavra:\n');
for (const [n, t] of COMBINACOES) {
  const pag = await navegador.newPage();
  await pag.goto(`${BASE}/engine.html?n=${n}&t=${t}&audio=mp3`);
  await pag.waitForFunction(() => window.SYNC && window.SYNC.ativo && window.SYNC.ativo(), null, { timeout: 15000 });
  await pag.evaluate(() => { const m = document.getElementById('setupModal'); if (m) m.classList.remove('show'); });
  const r = await pag.evaluate(async () => {
    const espera = ms => new Promise(res => setTimeout(res, ms));
    const a = document.getElementById('audioPlayer');
    const primeira = SYNC.passos()[0].start;
    // reza um pedaco, para bem longe do inicio
    document.getElementById('playBtn').click();
    await espera(4000);
    document.getElementById('playBtn').click();          // pausa
    const ondeEstava = +a.currentTime.toFixed(2);
    document.getElementById('treinoToggle').click();     // entra no treino
    await espera(1200);
    return { primeira, ondeEstava, agora: +a.currentTime.toFixed(2) };
  });
  linha(Math.abs(r.agora - r.primeira) < 0.25,
    `${n}/${t}: estava em ${r.ondeEstava}s, entrou no treino, foi para ${r.agora}s ` +
    `(a primeira palavra comeca em ${r.primeira}s)`);
  await pag.close();
}

// ---------- o treino segue sozinho enquanto ninguem interrompe ----------
// Pedido dele, 26/08: "a ideia e que o modo teste continue enquanto nao for
// interrompido". A pausa e para repetir o verso em voz alta, nao para tocar num
// botao — quem reza de pe, no minyan, com o sidur na mao, nao tem dedo sobrando.
console.log('\nUm toque no ▶ e o treino segue sozinho:\n');
for (const [n, t] of COMBINACOES) {
  const pag = await navegador.newPage();
  await pag.goto(`${BASE}/engine.html?n=${n}&t=${t}&audio=mp3`);
  await pag.waitForFunction(() => window.SYNC && window.SYNC.ativo && window.SYNC.ativo(), null, { timeout: 15000 });
  await pag.evaluate(() => { const m = document.getElementById('setupModal'); if (m) m.classList.remove('show'); });
  const r = await pag.evaluate(async () => {
    const espera = ms => new Promise(res => setTimeout(res, ms));
    const a = document.getElementById('audioPlayer');
    state.modoTreino = true; state.repeatN = 1;
    document.body.classList.add('modo-treino');
    const eventos = [];
    a.addEventListener('play', () => eventos.push({ e: 'toca', t: +a.currentTime.toFixed(2), ms: performance.now() }));
    a.addEventListener('pause', () => eventos.push({ e: 'para', t: +a.currentTime.toFixed(2), ms: performance.now() }));
    document.getElementById('playBtn').click();      // UM toque, e mais nenhum
    await espera(24000);
    const sil = [];
    for (let i = 0; i < eventos.length - 1; i++)
      if (eventos[i].e === 'para' && eventos[i + 1].e === 'toca')
        sil.push((eventos[i + 1].ms - eventos[i].ms) / 1000);
    return {
      paradas: eventos.filter(e => e.e === 'para').length,
      retomadas: eventos.filter(e => e.e === 'toca').length - 1,
      onde: eventos.filter(e => e.e === 'para').map(e => e.t),
      silencios: sil,
    };
  });
  const silencios = r.silencios || [];
  const maior = silencios.length ? Math.max(...silencios) : 0;
  // O silencio e para ele repetir o verso, nao para esperar. Passou de 2,5s,
  // soa como travada — foi o que ele disse: "esta levando alguns segundos para
  // comecar o proximo versiculo".
  linha(r.retomadas >= 2 && r.paradas >= 3 && maior <= 2.5,
    `${n}/${t}: ${r.paradas} paradas, ${r.retomadas} retomadas SOZINHAS, ` +
    `silencio ${silencios.map(x => x.toFixed(1) + 's').join(' ')} (maior ${maior.toFixed(1)}s)`);
  await pag.close();
}

// ---------- sair do treino para a reza: para e volta ao inicio ----------
// Pedido dele, 26/08: "quando muda para o modo reza no meio, deve parar e
// reiniciar como reza, esta repetindo". O "repetindo" era literal — o treino
// ligava a repeticao 2x e ninguem a desligava ao sair.
console.log('\nSair do Modo Treino para e volta ao inicio:\n');
for (const [n, t] of COMBINACOES) {
  const pag = await navegador.newPage();
  await pag.goto(`${BASE}/engine.html?n=${n}&t=${t}&audio=mp3`);
  await pag.waitForFunction(() => window.SYNC && window.SYNC.ativo && window.SYNC.ativo(), null, { timeout: 15000 });
  await pag.evaluate(() => { const m = document.getElementById('setupModal'); if (m) m.classList.remove('show'); });
  const r = await pag.evaluate(async () => {
    const espera = ms => new Promise(res => setTimeout(res, ms));
    const a = document.getElementById('audioPlayer');
    const primeira = SYNC.passos()[0].start;
    document.getElementById('treinoToggle').click();     // entra no treino
    await espera(600);
    document.getElementById('playBtn').click();
    await espera(6000);                                   // treina um pedaco
    document.getElementById('treinoToggle').click();      // volta para a reza
    await espera(1200);
    return {
      primeira, parado: a.paused, onde: +a.currentTime.toFixed(2),
      repeticao: state.repeatN, velocidade: state.speed,
      modo: state.modoTreino,
    };
  });
  linha(r.parado && Math.abs(r.onde - r.primeira) < 0.25 && r.repeticao === 0
        && r.velocidade === 1 && r.modo === false,
    `${n}/${t}: parado=${r.parado} em ${r.onde}s (inicio ${r.primeira}s) | ` +
    `repeticao=${r.repeticao} velocidade=${r.velocidade}x`);
  await pag.close();
}

await navegador.close();
console.log(falhas ? `\n${falhas} problema(s) no Modo Treino` : '\nVERDE: o Modo Treino nao vaza, nao deixa buraco, recomeca no inicio e segue sozinho');
process.exit(falhas ? 1 : 0);
