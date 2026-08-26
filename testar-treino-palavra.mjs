/**
 * testar-treino-palavra.mjs — o Modo Treino PALAVRA A PALAVRA.
 *
 * Por que por palavra: as correcoes de ouvido do Erez estao nas PALAVRAS
 * (ancoras.json). As fronteiras de verso saem delas — conferido: os 8 arquivos
 * tem o inicio do verso igual ao inicio da 1a palavra e o fim igual ao fim da
 * ultima, com 0 ms de diferenca. Entao por verso o app usa so um de cada cinco
 * numeros que ele conferiu; por palavra, usa todos.
 *
 * SEM excecao: cada palavra e um passo. Houve uma tentativa de emendar
 * automaticamente as que o rabino diz num sopro so, medindo o silencio; foi
 * retirada porque descartava 102 fronteiras que ele tinha conferido a ouvido, e
 * a regra 1 das invioláveis diz que medicao nao passa por cima do ouvido dele.
 *
 * ATENCAO ao servidor: so vale contra um que responda Range. Sem isso todo
 * seek cai no zero e o teste mede ficcao. Use servidor-teste.mjs; a primeira
 * checagem aqui reprova se o servidor nao servir.
 *
 * Uso: node servidor-teste.mjs 8896 . &
 *      node testar-treino-palavra.mjs [http://127.0.0.1:8896/tefila-kadish]
 * Sem os navegadores do Playwright: CHROMIUM=/caminho/do/chrome
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';
const NUSSACHIM = ['ashkenaz', 'chabad', 'sefard', 'sefaradi'];
const TIPOS = ['yatom', 'derabanan'];

const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
);
let falhas = 0;
const confere = (nome, ok, detalhe = '') => {
  console.log((ok ? 'OK    ' : 'FALHA ') + nome + (ok || !detalhe ? '' : '\n        ' + detalhe));
  if (!ok) falhas++;
};

async function abrir(n = 'ashkenaz', t = 'derabanan') {
  const pag = await navegador.newPage();
  const erros = [];
  pag.on('pageerror', e => erros.push('pageerror: ' + e.message));
  pag.on('console', m => {
    if (m.type() === 'error' && !/fonts\.|ERR_CONNECTION_RESET|Failed to load resource/.test(m.text()))
      erros.push(m.text());
  });
  pag.on('response', r => {
    if (r.status() >= 400 && !/favicon\.ico|fonts\./.test(r.url())) erros.push(`HTTP ${r.status()} ${r.url()}`);
  });
  // ?treino=palavra: desde 26/08 o botao na tela saiu (o Erez pediu so por verso
  // por enquanto) e este e o caminho para exercitar o modo por palavra.
  await pag.goto(`${BASE}/engine.html?n=${n}&t=${t}&audio=mp3&treino=palavra`);
  await pag.waitForFunction(() => window.SYNC && window.SYNC.ativo && window.SYNC.ativo(), null, { timeout: 15000 });
  await pag.evaluate(() => { const m = document.getElementById('setupModal'); if (m) m.classList.remove('show'); });
  return { pag, erros };
}

// ---------- 0. o servidor serve Range? ----------
{
  const { pag } = await abrir();
  const temRange = await pag.evaluate(async (base) => {
    try {
      const r = await fetch(`${base}/tefila-audio/chabad/yatom.mp3`, { headers: { Range: 'bytes=0-99' } });
      return r.status === 206;
    } catch (e) { return false; }
  }, BASE);
  if (!temRange) {
    console.log('FALHA o servidor nao responde Range (206). Sem isso todo seek cai no zero');
    console.log('      e nada abaixo mede coisa alguma. Use: node servidor-teste.mjs 8896 .');
    await navegador.close();
    process.exit(1);
  }
  await pag.close();
}

// ---------- 1. os passos saem das palavras que ele conferiu ----------
console.log('\n1. Os passos por palavra saem dos numeros conferidos de ouvido');
for (const n of NUSSACHIM) for (const t of TIPOS) {
  const { pag, erros } = await abrir(n, t);
  const r = await pag.evaluate(async () => {
    aplicarGranularidade('palavra');
    const passos = SYNC.passos();
    const d = await (await fetch(`./sync/${SYNC.atual().nussach}_${SYNC.atual().tipo}_sync.json`)).json();
    const inicios = new Set(), fins = new Set();
    let palavras = 0;
    d.versos.forEach(v => (v.palavras || []).forEach(p => {
      palavras++; inicios.add(p.start.toFixed(3)); fins.add(p.end.toFixed(3));
    }));
    return {
      palavras, nPassos: passos.length,
      inicioForaDaLista: passos.filter(p => !inicios.has(p.start.toFixed(3))).length,
      fimForaDaLista: passos.filter(p => !fins.has(p.end.toFixed(3))).length,
      crescente: passos.every((p, i) => i === 0 || p.start >= passos[i - 1].end - 0.001),
      cobreTudo: Math.abs(passos[0].start - d.versos[0].palavras[0].start) < 0.001,
    };
  });
  confere(`${n}/${t}: ${r.nPassos} passos para ${r.palavras} palavras`,
    r.inicioForaDaLista === 0 && r.fimForaDaLista === 0 && r.crescente && r.cobreTudo,
    `inicios fora da lista: ${r.inicioForaDaLista}, fins fora: ${r.fimForaDaLista}, ` +
    `crescente: ${r.crescente}, comeca na 1a palavra: ${r.cobreTudo}`);
  confere(`${n}/${t}: sem erro de console`, erros.length === 0, erros[0] || '');
  await pag.close();
}

// ---------- 2. uma palavra = um passo, sem excecao ----------
// Este teste existe para impedir que a emenda automatica volte. Ela descartava
// 102 fronteiras conferidas de ouvido, e isso e proibido pela regra 1.
console.log('\n2. Cada palavra e um passo — nenhuma fronteira dele e descartada');
for (const n of NUSSACHIM) for (const t of TIPOS) {
  const { pag } = await abrir(n, t);
  const r = await pag.evaluate(async () => {
    aplicarGranularidade('palavra');
    const passos = SYNC.passos();
    const at = SYNC.atual();
    const d = await (await fetch(`./sync/${at.nussach}_${at.tipo}_sync.json`)).json();
    const palavras = [];
    d.versos.forEach(v => (v.palavras || []).forEach(p => palavras.push(p)));
    const faltando = palavras.filter(p =>
      !passos.some(x => Math.abs(x.start - p.start) < 0.001 && Math.abs(x.end - p.end) < 0.001));
    return { nPalavras: palavras.length, nPassos: passos.length, faltando: faltando.map(p => p.hebrew) };
  });
  confere(`${n}/${t}: ${r.nPassos} passos para ${r.nPalavras} palavras`,
    r.nPassos === r.nPalavras && r.faltando.length === 0,
    r.faltando.length ? `ficaram de fora: ${r.faltando.slice(0, 5).join(', ')}` : '');
  await pag.close();
}

// ---------- 3. pausa DE VERDADE em cada palavra, tocando o mp3 ----------
console.log('\n3. Tocando o audio: pausa palavra a palavra, no tempo medido');
{
  const { pag } = await abrir('ashkenaz', 'derabanan');
  await pag.evaluate(() => {
    aplicarGranularidade('palavra');
    state.modoTreino = true; state.repeatN = 1;
    document.body.classList.add('modo-treino');
  });
  const passos = await pag.evaluate(() => SYNC.passos().map(p => [+p.start.toFixed(2), +p.end.toFixed(2)]));
  const audio = () => pag.evaluate(() => {
    const a = document.getElementById('audioPlayer');
    return { t: +a.currentTime.toFixed(2), pausado: a.paused, app: state.isPlaying };
  });
  const esperarPausa = async (ms) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      await pag.waitForTimeout(150);
      const a = await audio();
      if (a.pausado) return a;
    }
    return null;
  };
  const paradas = [];
  for (let i = 0; i < 6; i++) {
    await pag.click('#playBtn').catch(() => {});
    await pag.waitForTimeout(400);
    const retomou = (await audio()).t;
    const p = await esperarPausa(15000);
    if (!p) break;
    paradas.push({ retomou, parou: p.t, app: p.app });
  }
  paradas.forEach((p, i) => console.log(`        parada ${i + 1}: retomou em ${p.retomou}s, parou em ${p.parou}s`));
  confere('pausou seis vezes seguidas', paradas.length === 6, `pausou ${paradas.length}`);
  confere('cada pausa num lugar diferente',
    new Set(paradas.map(p => p.parou)).size === paradas.length,
    paradas.map(p => p.parou).join(', '));
  confere('as pausas andam sempre para a frente',
    paradas.every((p, i) => i === 0 || p.parou > paradas[i - 1].parou),
    paradas.map(p => p.parou).join(' -> '));
  confere('o ▶ retoma de onde parou, nao do inicio',
    paradas.slice(1).every(p => p.retomou > 0.5),
    paradas.map(p => p.retomou).join(', '));
  confere('o app sabe que pausou (o ▶ nao vira clique morto)',
    paradas.every(p => p.app === false));
  const naFronteira = paradas.every(p => passos.some(([, fim]) => Math.abs(fim - p.parou) < 0.35));
  confere('cada pausa cai no fim de um PASSO medido', naFronteira,
    paradas.map(p => p.parou).join(', '));
  // por palavra as pausas sao muito mais frequentes que por verso
  const versos = await pag.evaluate(async () => {
    const at = SYNC.atual();
    const d = await (await fetch(`./sync/${at.nussach}_${at.tipo}_sync.json`)).json();
    return d.versos.length;
  });
  confere('sao mais passos que versos', passos.length > versos * 3,
    `${passos.length} passos para ${versos} versos`);
  await pag.close();
}

// ---------- 4. trocar de granularidade no meio nao desarruma ----------
console.log('\n4. Trocar verso <-> palavra no meio da reza');
{
  const { pag } = await abrir('chabad', 'yatom');
  const r = await pag.evaluate(async () => {
    const espera = ms => new Promise(res => setTimeout(res, ms));
    aplicarGranularidade('verso');
    const porVerso = SYNC.passos().length;
    state.modoTreino = true; state.repeatN = 1;
    document.getElementById('playBtn').click();
    await espera(2500);
    aplicarGranularidade('palavra');            // troca COM O AUDIO ANDANDO
    const porPalavra = SYNC.passos().length;
    const esp = SYNC.espiar();
    const a = document.getElementById('audioPlayer');
    return { porVerso, porPalavra, tocando: !a.paused, t: +a.currentTime.toFixed(2),
             contadorArmado: esp.versoAnterior, passoAqui: esp.passos };
  });
  confere('a troca refaz os passos', r.porPalavra > r.porVerso,
    `${r.porVerso} por verso -> ${r.porPalavra} por palavra`);
  confere('o audio nao para nem volta ao inicio', r.tocando && r.t > 1,
    `tocando=${r.tocando} t=${r.t}s`);
  confere('o contador re-arma no passo onde a voz esta', r.contadorArmado >= 0,
    `contador=${r.contadorArmado}`);
  await pag.close();
}

// ---------- 5. o texto da tela continua acendendo por VERSO ----------
console.log('\n5. O destaque continua na palavra certa, no verso certo');
{
  const { pag, erros } = await abrir('chabad', 'yatom');
  const r = await pag.evaluate(async () => {
    const espera = ms => new Promise(res => setTimeout(res, ms));
    aplicarGranularidade('palavra');
    const at = SYNC.atual();
    const d = await (await fetch(`./sync/${at.nussach}_${at.tipo}_sync.json`)).json();
    const a = document.getElementById('audioPlayer');
    const conferidas = [];
    // tres palavras espalhadas pela reza
    for (const [vi, wi] of [[1, 0], [4, 1], [8, 0]]) {
      const p = d.versos[vi].palavras[wi];
      a.currentTime = (p.start + p.end) / 2;
      await espera(500);
      const el = document.querySelector('.word.active');
      conferidas.push({
        esperava: `${vi}/${wi}`,
        acendeu: el ? `${el.dataset.vi}/${el.dataset.wi}` : 'nada',
      });
    }
    return conferidas;
  });
  r.forEach(c => confere(`destaque em ${c.esperava}`, c.esperava === c.acendeu, `acendeu ${c.acendeu}`));
  confere('sem erro de console', erros.length === 0, erros[0] || '');
  await pag.close();
}

// ---------- 6. a faixa do Modo Treino fala as 8 linguas ----------
// O botao "por verso | por palavra" saiu da tela em 26/08 (o Erez pediu so por
// verso por enquanto). O que sobrou na faixa e o aviso, e ele tem que existir
// nas 8 — a regra 6 do CLAUDE.md vale para todo texto de tela.
console.log('\n6. A faixa do Modo Treino nas 8 linguas');
{
  const { pag } = await abrir('chabad', 'yatom');
  const r = await pag.evaluate(() => {
    const out = {};
    for (const L of ['pt', 'en', 'es', 'fr', 'it', 'de', 'ru', 'he']) {
      applyLanguage(L);
      out[L] = document.getElementById('treinoTexto').textContent.trim();
    }
    return out;
  });
  for (const [L, txt] of Object.entries(r)) confere(`${L}: "${txt}"`, !!txt);
  const iguaisAoPt = Object.entries(r).filter(([L, t]) => L !== 'pt' && t === r.pt).map(([L]) => L);
  confere('nenhuma lingua ficou em portugues', iguaisAoPt.length === 0, iguaisAoPt.join(', '));
  await pag.close();
}


await navegador.close();
console.log(`\n${falhas === 0 ? 'VERDE: o Modo Treino por palavra faz o que a tela promete' : 'VERMELHO: ' + falhas + ' falha(s)'}`);
process.exit(falhas ? 1 : 0);
