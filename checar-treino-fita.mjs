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
  // O ALVO DE CADA PARADA MUDOU EM 28/08: e o fim da VOZ do verso, nao a
  // fronteira. Ver o comentario grande da secao "a parada cai no silencio", mais
  // abaixo: a fronteira esta colada no ataque da palavra seguinte nas 153, entao
  // parar nela e o defeito, nao o certo. `parar` vem de fim-da-voz.json.
  const fronteiras = r.passos.map(p => (typeof p.parar === 'number') ? p.parar : p.end);
  const problemas = [];

  r.paradas.forEach((par, i) => {
    // o ponto de parada que esta parada devia respeitar
    const alvo = fronteiras.reduce((m, f) => Math.abs(f - par.parou) < Math.abs(m - par.parou) ? f : m, fronteiras[0]);

    // 1. VAZOU: soou alguma coisa depois do fim do passo?
    const trecho = r.tocado.slice(i === 0 ? 0 : r.paradas[i - 1].ateAqui, par.ateAqui);
    const maior = trecho.length ? Math.max(...trecho) : 0;
    const vazou = maior - alvo;
    if (vazou > 0.02)
      problemas.push(`parada ${i + 1}: vazou ${(vazou * 1000).toFixed(0)} ms depois de ${alvo}s (soou ate ${maior}s)`);

    // 2. A AGULHA FICA ESTACIONADA NO COMECO DO PASSO SEGUINTE.
    //
    // Nao e o mesmo que a pergunta 1. Ali se mede ate onde SOOU; aqui, onde a
    // agulha FICOU depois de parar. O app, ao pausar, ja procura o comeco do
    // proximo verso com o audio calado — assim a busca acontece com calma
    // enquanto ele le a linha, e o ▶ entra limpo, sem repetir o rabinho do
    // verso que acabou.
    //
    // Ate 28/08 isto conferia se a agulha ficava perto da FRONTEIRA, e dava no
    // mesmo porque a fronteira era tambem o ponto de parada. Agora sao coisas
    // diferentes: para-se no fim da voz (~400 ms antes) e estaciona-se no comeco
    // do verso seguinte. Comparar a agulha com o ponto de parada acusaria um
    // defeito que nao existe.
    const inicioSeguinte = r.passos[i + 1] ? r.passos[i + 1].start : null;
    if (inicioSeguinte !== null && Math.abs(par.parou - inicioSeguinte) > 0.35)
      problemas.push(`parada ${i + 1}: a agulha ficou em ${par.parou}s, e nao no ` +
                     `comeco do verso seguinte (${inicioSeguinte}s)`);
  });

  // 3. BURACO: pedaco de fita nao ouvido — mas so conta se tinha VOZ dentro.
  //
  // Ate 28/08 esta conta olhava a fita e reprovava qualquer pedaco nao tocado.
  // Desde que a parada passou a acontecer no fim da VOZ e nao na fronteira, o
  // treino pula de proposito a respiracao do rabino no fim de cada verso — 400 a
  // 800 ms de silencio. Isso nao e buraco: e o que ele pediu, e nada se perde ao
  // ouvido. Buraco de verdade e trecho com VOZ que nunca soou, e e isso que se
  // pergunta agora, contra o sinal medido. A conta ficou mais exigente, nao menos.
  const ouvido = r.tocado.slice().sort((x, y) => x - y);
  let blocosDaVoz = null;
  try {
    const sig = JSON.parse((await import('node:fs')).readFileSync(`sinal/${n}_${t}.json`, 'utf8'));
    blocosDaVoz = sig.blocos.map(b => Array.isArray(b) ? b : [b.start, b.end]);
  } catch (e) {}
  let buracos = 0, maiorBuraco = 0;
  const ultimoOuvido = ouvido.length ? ouvido[ouvido.length - 1] : 0;
  for (let i = 1; i < ouvido.length; i++) {
    const de = ouvido[i - 1], ate = ouvido[i];
    if (ate - de <= TOLERANCIA_BURACO) continue;
    if (de >= ultimoOuvido - 0.01) continue;       // o resto da reza, que nem chegamos a tocar
    // tinha voz nesse buraco?
    const comVoz = !blocosDaVoz || blocosDaVoz.some(b => b[1] > de + 0.05 && b[0] < ate - 0.05);
    if (!comVoz) continue;
    buracos++; if (ate - de > maiorBuraco) maiorBuraco = ate - de;
  }
  const buracosReais = buracos;

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
  const menor = silencios.length ? Math.min(...silencios) : 0;
  // O SILENCIO TEM QUE SER SEMPRE O MESMO, e curto.
  //
  // Ele reclamou tres vezes desta pausa. Primeiro que era longa ("esta levando
  // alguns segundos para comecar o proximo versiculo"); eu encurtei para METADE
  // do verso, entre 0,5s e 2s, e ele voltou: "quando muda de frase ainda da uma
  // engasgada". Medindo quadro a quadro nao havia som repetido nem salto — o
  // que havia era silencio de tamanho DIFERENTE a cada verso: 2,00s, 1,32s,
  // 1,03s. O ouvido nao conta segundos, conta ritmo, e ritmo que muda a cada
  // compasso e exatamente o que se chama de engasgo.
  //
  // Por isso a conta aqui nao e so "e curto?": e "e sempre o mesmo?". A folga de
  // 150 ms e para o navegador, nao para o codigo — o valor sai de uma constante
  // (RESPIRO). Se alguem voltar a calcular o silencio a partir do verso, esta
  // linha fica vermelha antes de o Erez precisar ouvir de novo.
  const constante = silencios.length < 2 || (maior - menor) <= 0.15;
  linha(r.retomadas >= 2 && r.paradas >= 3 && maior <= 1.5 && constante,
    `${n}/${t}: ${r.paradas} paradas, ${r.retomadas} retomadas SOZINHAS, ` +
    `silencio ${silencios.map(x => x.toFixed(1) + 's').join(' ')} ` +
    `(maior ${maior.toFixed(1)}s · varia ${((maior - menor) * 1000).toFixed(0)}ms)`);
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
    document.getElementById('rezaToggle').click();        // volta para a reza
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

// ---------------------------------------------------------------------------
// A PARADA CAI DENTRO DO SILENCIO, LONGE DO ATAQUE SEGUINTE
// ---------------------------------------------------------------------------
// 28/08, no iPhone e no iPad: "no final da frase da para ouvir o comeco da outra
// (bea) antes de recomecar a frase. na segunda tambem (ve), na terceira tambem".
//
// Medido nas 153 fronteiras de verso dos 8: ha de 320 a 760 ms de silencio ANTES
// da fronteira e ZERO DEPOIS, nas 153. E assim por construcao — as palavras se
// encostam na fita, entao a ultima palavra do verso engole a respiracao do
// rabino e so acaba quando a proxima ja esta soando. "Parar no fim do verso" era
// parar no instante exato do ataque seguinte, com 20 ms de margem. Aqui no
// Chromium a pausa cai no milissegundo e nao se ouve nada; num aparelho de
// verdade escapa o ataque, e foi o que ele ouviu.
//
// A conta abaixo e contra a VOZ (sinal/*.json), nao contra a fronteira — a
// fronteira nao sabe onde o rabino calou. Duas coisas ao mesmo tempo: nao pode
// VAZAR (chegar ao ataque seguinte) e nao pode CORTAR (parar antes de a voz do
// verso acabar). Entre uma coisa e outra ha meio segundo de silencio, e e ali
// que a parada tem que cair.
console.log('\nA parada cai no silencio, longe do ataque seguinte:\n');
{
  const { readFileSync } = await import('node:fs');
  const MARGEM_MINIMA = 0.20;
  for (const [n, t] of COMBINACOES) {
    let blocos;
    try {
      const sig = JSON.parse(readFileSync(`sinal/${n}_${t}.json`, 'utf8'));
      blocos = sig.blocos.map(b => Array.isArray(b) ? b : [b.start, b.end]);
    } catch (e) { linha(false, `${n}/${t}: nao achei sinal/${n}_${t}.json`); continue; }

    const pag = await navegador.newPage();
    await pag.goto(`${BASE}/engine.html?n=${n}&t=${t}`);
    await pag.waitForFunction(() => window.SYNC && window.SYNC.ativo(), null, { timeout: 25000 });
    await pag.evaluate(() => { const m = document.getElementById('setupModal'); if (m) m.classList.remove('show'); });
    const r = await pag.evaluate(async () => {
      const a = document.getElementById('audioPlayer');
      document.getElementById('treinoToggle').click();
      await new Promise(r => setTimeout(r, 1200));
      state.repeatN = 0;
      document.getElementById('playBtn').click();
      const am = []; const t0 = performance.now();
      while (performance.now() - t0 < 16000) {
        await new Promise(r => setTimeout(r, 10));
        am.push({ t: a.currentTime, pausado: a.paused });
      }
      a.pause();
      return { am, passos: SYNC.passos() };
    });
    const paradas = [];
    for (let i = 1; i < r.am.length; i++)
      if (r.am[i].pausado && !r.am[i - 1].pausado) paradas.push(r.am[i - 1].t);

    let menorFolga = 9, piorCorte = -9, detalhe = '';
    paradas.forEach((p, i) => {
      const passo = r.passos[i];
      if (!passo) return;
      const proxima = blocos.find(b => b[0] >= passo.end - 0.02);
      const ultima = blocos.filter(b => b[1] <= passo.end + 0.02).pop();
      if (proxima) {
        const folga = proxima[0] - p;
        if (folga < menorFolga) { menorFolga = folga;
          detalhe = `verso ${i + 1}: parou a ${(folga * 1000).toFixed(0)} ms do ataque seguinte`; }
      }
      if (ultima) { const corte = ultima[1] - p; if (corte > piorCorte) piorCorte = corte; }
    });
    // 2 paradas bastam: o que se mede aqui e a FOLGA de cada parada, nao quantas
    // couberam nos 16 segundos. O ashkenaz_derabanan tem versos longos e so da
    // duas nesse tempo — exigir tres reprovava um caso que estava certo.
    const ok = paradas.length >= 2 && menorFolga >= MARGEM_MINIMA && piorCorte <= 0.02;
    linha(ok, `${n}/${t}: ${paradas.length} paradas · folga ate o ataque seguinte ` +
      `${(menorFolga * 1000).toFixed(0)} ms · corte no fim da voz ` +
      `${(Math.max(0, piorCorte) * 1000).toFixed(0)} ms` + (ok ? '' : `  ${detalhe}`));
    await pag.close();
  }
}

await navegador.close();
console.log(falhas ? `\n${falhas} problema(s) no Modo Treino` : '\nVERDE: o Modo Treino nao vaza, nao deixa buraco, recomeca no inicio e segue sozinho');
process.exit(falhas ? 1 : 0);
