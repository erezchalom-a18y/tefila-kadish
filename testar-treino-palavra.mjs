/**
 * testar-treino-palavra.mjs — o Modo Treino PALAVRA A PALAVRA.
 *
 * Por que por palavra: as correcoes de ouvido do Erez estao nas PALAVRAS
 * (ancoras.json). As fronteiras de verso saem delas — conferido: os 8 arquivos
 * tem o inicio do verso igual ao inicio da 1a palavra e o fim igual ao fim da
 * ultima, com 0 ms de diferenca. Entao por verso o app usa so um de cada cinco
 * numeros que ele conferiu; por palavra, usa todos.
 *
 * A excecao medida: onde o rabino emenda duas palavras num sopro so, o passo
 * leva as duas juntas. Quem decide isso e sopros.json (medir-sopros.py), a
 * partir do silencio no proprio audio — nao e regra escrita a mao.
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
  await pag.goto(`${BASE}/engine.html?n=${n}&t=${t}&audio=mp3`);
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

// ---------- 2. os passos emendados sao os que sopros.json manda ----------
console.log('\n2. As emendas de sopro sao respeitadas — e so elas');
{
  const { pag } = await abrir('ashkenaz', 'derabanan');
  const r = await pag.evaluate(async () => {
    aplicarGranularidade('palavra');
    const passos = SYNC.passos();
    const at = SYNC.atual();
    const sp = await (await fetch('./sopros.json')).json();
    const c = sp.combinacoes[`${at.nussach}_${at.tipo}`];
    const d = await (await fetch(`./sync/${at.nussach}_${at.tipo}_sync.json`)).json();
    let palavras = 0;
    d.versos.forEach(v => palavras += (v.palavras || []).length);
    return { palavras, emendas: c.colados.length, nPassos: passos.length };
  });
  confere('passos = palavras menos emendas',
    r.nPassos === r.palavras - r.emendas,
    `${r.palavras} palavras - ${r.emendas} emendas = ${r.palavras - r.emendas}, mas deu ${r.nPassos}`);
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

// ---------- 6. o seletor existe nas 8 linguas ----------
console.log('\n6. O seletor por verso / por palavra nas 8 linguas');
{
  const { pag } = await abrir('chabad', 'yatom');
  const r = await pag.evaluate(() => {
    const out = {};
    for (const L of ['pt', 'en', 'es', 'fr', 'it', 'de', 'ru', 'he']) {
      applyLanguage(L);
      aplicarGranularidade('palavra');
      const bs = [...document.querySelectorAll('#treinoGran button')].map(b => b.textContent.trim());
      out[L] = { botoes: bs, banner: document.getElementById('treinoTexto').textContent.trim() };
    }
    return out;
  });
  const emPortugues = [];
  for (const [L, v] of Object.entries(r)) {
    const vazio = v.botoes.some(b => !b) || !v.banner;
    if (vazio) { confere(`${L}: tem texto`, false, JSON.stringify(v)); continue; }
    if (L !== 'pt' && (v.botoes[0] === r.pt.botoes[0] && v.botoes[1] === r.pt.botoes[1])) emPortugues.push(L);
    confere(`${L}: "${v.botoes.join(' | ')}"`, true);
  }
  confere('nenhuma lingua ficou em portugues', emPortugues.length === 0, emPortugues.join(', '));
  await pag.close();
}

await navegador.close();
console.log(`\n${falhas === 0 ? 'VERDE: o Modo Treino por palavra faz o que a tela promete' : 'VERMELHO: ' + falhas + ' falha(s)'}`);
process.exit(falhas ? 1 : 0);
