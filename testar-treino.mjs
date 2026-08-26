/**
 * testar-treino.mjs — prova, num Chromium de verdade, que o Modo Treino faz o
 * que a tela promete: toca a gravacao do rabino, pausa no fim de cada verso,
 * repete o verso, retoma no lugar certo e destaca a palavra medida.
 *
 * Cada teste aqui nasceu de um defeito real encontrado na auditoria de 26/08.
 * Se um deles ficar vermelho, o defeito voltou.
 *
 * O relogio do audio e falso (anda 10x) para o teste nao levar 20 minutos.
 * Quem confere o destaque contra o audio DE VERDADE e o ouvido do Erez; aqui
 * so se confere que o app usa os tempos de sync/*.json e nao uma estimativa.
 *
 * Uso:
 *   python3 -m http.server 8896 --bind 127.0.0.1   (de um diretorio que contenha
 *                                                   tefila-kadish/ -> este repo)
 *   node testar-treino.mjs [http://127.0.0.1:8896/tefila-kadish]
 *
 * Precisa do playwright. Se ele estiver instalado global, aponte com:
 *   NODE_PATH=/opt/node22/lib/node_modules node testar-treino.mjs
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;   // playwright e CommonJS

const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';
const NUSSACHIM = ['ashkenaz', 'chabad', 'sefard', 'sefaradi'];
const TIPOS = ['yatom', 'derabanan'];

const navegador = await chromium.launch();
let falhas = 0;
const ok = (cond, msg) => { console.log(`   ${cond ? 'ok  ' : 'FALHA'} ${msg}`); if (!cond) falhas++; };

/**
 * Abre uma combinacao com o relogio do audio sob controle do teste.
 * Nada toca de verdade: o .ogg nao e decodificado, so o tempo anda.
 */
async function abrir(n = 'chabad', t = 'yatom') {
  const pag = await navegador.newPage();
  await pag.addInitScript(() => { try { localStorage.setItem('tefila_setup_dismissed', '1'); } catch (e) {} });
  const erros = [];
  const externo = u => /fonts\.googleapis\.com|fonts\.gstatic\.com|favicon\.ico/.test(u);
  pag.on('pageerror', e => erros.push('pageerror: ' + e.message));
  pag.on('console', m => {
    const txt = m.text();
    if (m.type() !== 'error') return;
    if (/fonts\.|ERR_CONNECTION_RESET|ERR_ABORTED/.test(txt)) return;
    // a mensagem de 404 do Chromium vem sem URL; o 404 que importa e pego por resposta
    if (/Failed to load resource/.test(txt)) return;
    erros.push(txt);
  });
  pag.on('response', r => { if (r.status() >= 400 && !externo(r.url())) erros.push(`HTTP ${r.status()} ${r.url()}`); });

  await pag.goto(`${BASE}/engine.html?n=${n}&t=${t}`, { waitUntil: 'domcontentloaded' });
  await pag.waitForFunction(() => window.SYNC && window.SYNC.ativo(), null, { timeout: 10000 });
  await pag.evaluate(() => {
    document.getElementById('setupModal').classList.remove('show');
    const a = document.getElementById('audioPlayer');
    window.__t = 0; window.__rodando = false; window.__playChamado = 0; window.__tts = 0;
    window.__seeks = [];   // toda vez que o app reposiciona o audio, fica registrado aqui
    Object.defineProperty(a, 'currentTime', {
      get: () => window.__t,
      set: v => { window.__seeks.push(+v.toFixed(3)); window.__t = v; },
      configurable: true,
    });
    Object.defineProperty(a, 'duration', { get: () => window.__dur || 60, configurable: true });
    Object.defineProperty(a, 'readyState', { get: () => 4, configurable: true });
    Object.defineProperty(a, 'paused', { get: () => !window.__rodando, configurable: true });
    a.play = function () { window.__playChamado++; window.__rodando = true; this.dispatchEvent(new Event('play')); return Promise.resolve(); };
    a.pause = function () { window.__rodando = false; this.dispatchEvent(new Event('pause')); };
    window.speechSynthesis.speak = () => { window.__tts++; };
    const vs = window.SYNC.versos();
    window.__dur = vs[vs.length - 1].end + 1;
    setInterval(() => {
      if (!window.__rodando) return;
      window.__t += 0.05 * 10 * (a.playbackRate || 1);
      if (window.__t >= window.__dur) { window.__t = window.__dur; window.__rodando = false; a.dispatchEvent(new Event('ended')); }
      a.dispatchEvent(new Event('timeupdate'));
    }, 50);
  });
  return { pag, erros };
}
const desligarRepeticao = async pag => {
  for (let i = 0; i < 4 && await pag.evaluate(() => state.repeatN) !== 0; i++) await pag.click('#repeatBtn');
};

// ------------------------------------------------------------------
console.log('\n1. Toca a gravacao do rabino, nao a voz sintetica do navegador');
{
  const { pag, erros } = await abrir();
  ok(await pag.evaluate(() => typeof window.state) === 'object', 'window.state existe — a ponte com a sincronia');
  ok(await pag.evaluate(() => !!state.fullPrayerAudio), 'state.fullPrayerAudio aponta para tefila-audio/');
  await pag.click('#playBtn');
  await pag.waitForTimeout(700);
  const d = await pag.evaluate(() => ({ play: window.__playChamado, tts: window.__tts, t: window.__t }));
  ok(d.play > 0, 'audioPlayer.play() foi chamado');
  ok(d.tts === 0, 'nenhuma palavra foi lida pela voz do navegador');
  ok(d.t > 0, 'o tempo do audio anda');
  ok(erros.length === 0, 'sem erro de console' + (erros.length ? ': ' + erros[0] : ''));
  await pag.close();
}

// ------------------------------------------------------------------
console.log('\n2. Barra de progresso e relogio andam durante a reza');
{
  const { pag } = await abrir();
  await pag.click('#playBtn');
  await pag.waitForTimeout(900);
  const r = await pag.evaluate(() => ({
    largura: document.getElementById('progressFill').style.width,
    relogio: document.getElementById('timeDisplay').textContent,
  }));
  ok(parseFloat(r.largura) > 0, `a barra saiu do zero (${r.largura})`);
  ok(r.relogio !== '0:00', `o relogio anda (${r.relogio})`);
  await pag.close();
}

// ------------------------------------------------------------------
console.log('\n3. Modo Treino pausa no fim de cada verso, no tempo medido');
{
  const { pag } = await abrir();
  await pag.click('#treinoToggle');
  const vel = await pag.evaluate(() => ({ speed: state.speed, rate: document.getElementById('audioPlayer').playbackRate }));
  ok(vel.speed === 0.75 && vel.rate === 0.75, `a velocidade .75x chegou no audio (playbackRate=${vel.rate})`);
  await desligarRepeticao(pag);

  await pag.click('#playBtn');
  const paradas = [];
  for (let i = 0; i < 5; i++) {
    await pag.waitForFunction(() => !state.isPlaying, null, { timeout: 20000 }).catch(() => {});
    paradas.push(await pag.evaluate(() => ({
      t: +window.__t.toFixed(2),
      txt: document.getElementById('nowReading').textContent,
      retomarEm: state.retomarEm,
      fins: window.SYNC.versos().map(v => +v.end.toFixed(2)),
      inicios: window.SYNC.versos().map(v => +v.start.toFixed(2)),
    })));
    await pag.click('#playBtn');
    await pag.waitForTimeout(120);
  }
  paradas.forEach((s, i) => console.log(`        pausa ${i + 1}: t=${s.t}s  retoma em ${s.retomarEm}s  "${s.txt}"`));
  ok(paradas.every(s => /Pausado/.test(s.txt)), 'toda parada anuncia "Pausado · toque ▶ para o proximo verso"');
  ok(paradas.every((s, i) => typeof s.retomarEm === 'number' && (i === 0 || s.retomarEm > paradas[i - 1].retomarEm)),
    'cada pausa aponta para o verso seguinte, sempre adiante');
  ok(paradas.every(s => s.inicios.some(x => Math.abs(x - s.retomarEm) < 0.001)),
    'o ponto de retomada e exatamente um INICIO DE VERSO de sync/*.json');
  // a folga abaixo e do relogio falso (0,5-0,75s por passo); no app o passo e 60ms
  ok(paradas.every(s => s.fins.some(f => s.t >= f && s.t - f < 0.8)),
    'cada pausa cai logo depois de um FIM DE VERSO medido do audio');
  await pag.close();
}

// ------------------------------------------------------------------
console.log('\n4. Retomar continua do verso certo, nao volta ao inicio da reza');
{
  const { pag } = await abrir();
  await pag.click('#treinoToggle');
  await desligarRepeticao(pag);
  await pag.click('#playBtn');
  await pag.waitForFunction(() => !state.isPlaying, null, { timeout: 20000 });
  const alvo = await pag.evaluate(() => state.retomarEm);
  await pag.evaluate(() => { window.__seeks = []; });
  await pag.click('#playBtn');
  await pag.waitForTimeout(150);
  // o relogio falso anda rapido demais para comparar posicao; o que vale e PARA ONDE
  // o app reposicionou o audio ao retomar
  const seeks = await pag.evaluate(() => window.__seeks);
  ok(seeks.length > 0 && Math.abs(seeks[0] - alvo) < 0.001,
    `ao retomar, o app posicionou o audio em ${seeks[0]}s — o inicio do proximo verso (${alvo}s)`);
  ok(await pag.evaluate(() => state.isPlaying), 'e voltou a tocar');
  await pag.close();
}

// ------------------------------------------------------------------
console.log('\n5. Repeticao volta ao inicio do MESMO verso');
{
  const { pag } = await abrir();
  await pag.click('#treinoToggle');
  ok(await pag.evaluate(() => state.repeatN) === 2, 'o Modo Treino liga repeticao 2x');
  await pag.click('#playBtn');
  const r = await pag.evaluate(async () => {
    const espera = ms => new Promise(res => setTimeout(res, ms));
    let anterior = 0;
    for (let i = 0; i < 200; i++) {
      await espera(30);
      if (window.__t < anterior - 0.3) return { voltou: true, para: +window.__t.toFixed(2) };
      anterior = window.__t;
    }
    return { voltou: false, para: +window.__t.toFixed(2) };
  });
  const inicios = await pag.evaluate(() => window.SYNC.versos().map(v => +v.start.toFixed(2)));
  ok(r.voltou, `o audio voltou para tras para repetir (para ${r.para}s)`);
  ok(inicios.some(x => Math.abs(x - r.para) < 0.001), 'voltou exatamente para um inicio de verso medido');
  await pag.close();
}

// ------------------------------------------------------------------
console.log('\n6. Sair do Modo Treino devolve velocidade e repeticao');
{
  const { pag } = await abrir();
  await pag.click('#treinoToggle');
  await pag.click('#treinoToggle');
  const r = await pag.evaluate(() => ({
    speed: state.speed, rate: document.getElementById('audioPlayer').playbackRate,
    repeatN: state.repeatN, botao: document.querySelector('#speedToggle button.active').dataset.speed,
    repCount: document.getElementById('repCount').style.display,
  }));
  ok(r.speed === 1 && r.rate === 1, 'velocidade de volta em 1x, no state e no audio');
  ok(r.repeatN === 0 && r.repCount === 'none', 'repeticao desligada');
  ok(r.botao === '1', 'o botao 1x esta aceso');
  await pag.close();
}

// ------------------------------------------------------------------
console.log('\n7. Play antes do sync carregar nao monta dois destacadores');
{
  const pag = await navegador.newPage();
  await pag.addInitScript(() => { try { localStorage.setItem('tefila_setup_dismissed', '1'); } catch (e) {} });
  await pag.route('**/sync/*_sync.json', async rota => { await new Promise(r => setTimeout(r, 2500)); await rota.continue(); });
  await pag.goto(`${BASE}/engine.html?n=chabad&t=yatom`, { waitUntil: 'domcontentloaded' });
  await pag.evaluate(() => {
    document.getElementById('setupModal').classList.remove('show');
    const a = document.getElementById('audioPlayer');
    window.__t = 0; window.__rodando = false; window.__tts = 0;
    Object.defineProperty(a, 'currentTime', { get: () => window.__t, set: v => { window.__t = v; }, configurable: true });
    Object.defineProperty(a, 'readyState', { get: () => 4, configurable: true });
    a.play = function () { window.__rodando = true; this.dispatchEvent(new Event('play')); return Promise.resolve(); };
    a.pause = function () { window.__rodando = false; };
    window.speechSynthesis.speak = () => { window.__tts++; };
  });
  await pag.click('#playBtn');
  await pag.waitForTimeout(600);
  const durante = await pag.evaluate(() => ({ timers: state.wordTimers.length, tts: window.__tts }));
  await pag.waitForFunction(() => window.SYNC && window.SYNC.ativo(), null, { timeout: 8000 });
  await pag.waitForTimeout(600);
  const depois = await pag.evaluate(() => ({ timers: state.wordTimers.length, rodando: window.__rodando }));
  ok(durante.timers === 0 && durante.tts === 0, `nada de destaque estimado enquanto o sync baixava (${durante.timers} temporizadores)`);
  ok(depois.timers === 0, `nenhum temporizador estimado sobrou (${depois.timers})`);
  ok(depois.rodando === true, 'assim que o sync chegou, a gravacao comecou');
  await pag.close();
}

// ------------------------------------------------------------------
console.log('\n8. Trocar a tradicao troca o audio E o texto medido — nas 4');
for (const n of NUSSACHIM) {
  const { pag } = await abrir('chabad', 'yatom');
  const r = await pag.evaluate(async alvo => {
    document.querySelector(`[data-setting="tradition"] button[data-value="${alvo}"]`).click();
    await new Promise(res => setTimeout(res, 900));
    return {
      sync: window.SYNC.atual().nussach,
      audio: document.getElementById('audioPlayer').src.split('/').slice(-2).join('/'),
      tradition: state.tradition,
      cracha: document.getElementById('traditionBadge').textContent,
    };
  }, n);
  ok(r.sync === n && r.audio.startsWith(n + '/') && r.tradition === n,
    `${n}: sync=${r.sync} audio=${r.audio} cracha=${r.cracha}`);
  await pag.close();
}

// ------------------------------------------------------------------
console.log('\n9. Destaque palavra a palavra bate com sync/*.json — 8 combinacoes');
for (const n of NUSSACHIM) for (const t of TIPOS) {
  const { pag, erros } = await abrir(n, t);
  const r = await pag.evaluate(() => {
    const a = document.getElementById('audioPlayer');
    let total = 0, errados = 0, primeiro = null;
    for (const v of window.SYNC.versos()) for (const p of (v.palavras || [])) {
      window.__t = (p.start + p.end) / 2;
      a.dispatchEvent(new Event('timeupdate'));
      total++;
      const el = document.querySelector('#verso-sync-display .sync-hebrew .sync-w.agora');
      if (!el || el.textContent !== p.hebrew) {
        errados++;
        if (!primeiro) primeiro = `esperava "${p.hebrew}", acendeu "${el ? el.textContent : 'nada'}"`;
      }
    }
    return { total, errados, primeiro };
  });
  ok(r.errados === 0, `${n}/${t}: ${r.total} palavras conferidas, ${r.errados} erradas ${r.primeiro || ''}`);
  ok(erros.length === 0, `${n}/${t}: sem erro de console` + (erros.length ? ' — ' + erros[0] : ''));
  await pag.close();
}

// ------------------------------------------------------------------
console.log('\n10. Nos vaos e no fim, nenhuma palavra fica acesa presa');
{
  const { pag } = await abrir();
  const r = await pag.evaluate(() => {
    const a = document.getElementById('audioPlayer');
    const vs = window.SYNC.versos();
    const acesa = () => document.querySelectorAll('#verso-sync-display .sync-w.agora').length;
    const p = vs[0].palavras[0];
    window.__t = (p.start + p.end) / 2; a.dispatchEvent(new Event('timeupdate'));
    const durante = acesa();
    window.__t = 0; a.dispatchEvent(new Event('timeupdate'));       // silencio do comeco
    const antes = acesa();
    window.__t = (p.start + p.end) / 2; a.dispatchEvent(new Event('timeupdate'));
    window.__t = vs[vs.length - 1].end + 5; a.dispatchEvent(new Event('timeupdate'));   // depois do fim
    return { durante, antes, depois: acesa() };
  });
  ok(r.durante > 0, 'dentro de uma palavra, ela acende');
  ok(r.antes === 0, 'no silencio antes do primeiro verso, nada fica aceso');
  ok(r.depois === 0, 'passado o fim da reza, nada fica aceso');

  const f = await abrir();
  await f.pag.evaluate(() => { const vs = window.SYNC.versos(); window.__t = vs[vs.length - 1].end - 0.2; });
  await f.pag.click('#playBtn');
  await f.pag.waitForFunction(() => !state.isPlaying, null, { timeout: 20000 }).catch(() => {});
  await f.pag.waitForTimeout(300);
  const fim = await f.pag.evaluate(() => ({
    txt: document.getElementById('nowReading').textContent,
    aceso: document.querySelectorAll('#verso-sync-display .sync-w.agora').length,
    relogio: state.relogioSync,
  }));
  ok(/Conclu/.test(fim.txt), `o fim e anunciado ("${fim.txt}")`);
  ok(fim.aceso === 0, 'nenhuma palavra acesa depois do Amen');
  ok(fim.relogio === null, 'o relogio interno foi desligado');
  await f.pag.close();
  await pag.close();
}

await navegador.close();
console.log(`\n${falhas === 0 ? 'VERDE: o Modo Treino faz o que a tela promete' : 'VERMELHO: ' + falhas + ' falha(s)'}`);
process.exit(falhas ? 1 : 0);
