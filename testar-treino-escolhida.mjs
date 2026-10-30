/**
 * testar-treino-escolhida.mjs — no Modo Treino, a palavra tocada e onde o ▶ começa.
 *
 * 29/10. O Erez, com a tela do Chabad Yatom: "quando seleciono uma palavra no
 * meio do texto como vechayim, e nao clico no botao começar aqui, mas no botao
 * play, o audio recomeça do yitgadal (começo) deveria comecar na palavra
 * selecionada".
 *
 * Tocar na palavra so abria o balao do significado — nao guardava a palavra.
 * O ▶ retomava de onde o audio estava, e num app recem-aberto isso e o zero.
 *
 * O que este teste cobra, no Treino:
 *   1. tocar na palavra e apertar ▶ comeca NELA (como o "Começar aqui");
 *   2. tambem depois que o balao some sozinho (3,5 s);
 *   3. tocar de novo na mesma palavra (fechar o balao) desfaz a escolha;
 *   4. a escolha vale uma vez: pausar e apertar ▶ de novo RETOMA, nao volta a ela.
 * E, fora do Treino, nada mudou:
 *   5. no Modo Reza, tocar na palavra e apertar ▶ continua retomando de onde estava.
 *
 * Uso: node servidor-teste.mjs 8896 . &
 *      node testar-treino-escolhida.mjs [http://127.0.0.1:8896/tefila-kadish]
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';
const navegador = await pw.chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
);
let falhas = 0;
const confere = (nome, ok, detalhe = '') => {
  console.log((ok ? 'OK    ' : 'FALHA ') + nome + (detalhe ? '  — ' + detalhe : ''));
  if (!ok) falhas++;
};

async function abrir(treino) {
  const pag = await navegador.newPage();
  const erros = [];
  pag.on('pageerror', e => erros.push('pageerror: ' + e.message));
  await pag.goto(`${BASE}/engine.html?n=chabad&t=yatom&audio=mp3`);
  await pag.waitForFunction(() => window.SYNC && window.SYNC.ativo && window.SYNC.ativo(), null, { timeout: 15000 });
  await pag.evaluate(() => { const m = document.getElementById('setupModal'); if (m) m.classList.remove('show'); });
  if (treino) await pag.evaluate(() => irParaModo(true));
  await pag.waitForTimeout(800);
  return { pag, erros };
}

// A palavra da tela dele: "vechayim", no verso do "Yehê shelamá raba". Achada
// pelo hebraico nos dados, nao por numero escrito a mao.
const SYNC_JSON = await (await fetch(`${BASE}/sync/chabad_yatom_sync.json`)).json();
const semNikud = s => String(s || '').normalize('NFD').replace(/[֑-ׇ̀-ͯ]/g, '').replace(/[^א-ת]/g, '');
let alvo = null;
SYNC_JSON.versos.forEach((v, vi) => (v.palavras || []).forEach((p, wi) => {
  if (!alvo && semNikud(p.hebrew) === 'וחיים') alvo = { vi, wi, start: p.start, heb: p.hebrew };
}));
if (!alvo) { console.log('FALHA nao achei "vechayim" (וחיים) no chabad_yatom'); process.exit(1); }
console.log(`a palavra: ${alvo.heb} — verso ${alvo.vi}, palavra ${alvo.wi}, comeca em ${alvo.start.toFixed(2)}s\n`);

const tocarPalavra = (pag) => pag.evaluate(({ vi, wi }) =>
  document.querySelector(`.hebrew .word[data-vi="${vi}"][data-wi="${wi}"]`).click(), alvo);
const apertarPlay = (pag) => pag.evaluate(() => document.getElementById('playBtn').click());
const tempo = (pag) => pag.evaluate(() => +document.getElementById('audioPlayer').currentTime.toFixed(2));
// Comecou na palavra: depois de ~1,2 s tocando a .75x, o relogio esta logo depois dela.
const naPalavra = t => t >= alvo.start - 0.1 && t <= alvo.start + 3;

// 1. tocar e apertar ▶
{
  const { pag, erros } = await abrir(true);
  await tocarPalavra(pag);
  await pag.waitForTimeout(300);
  await apertarPlay(pag);
  await pag.waitForTimeout(1200);
  const t = await tempo(pag);
  confere('1. Treino: tocar em vechayim e apertar ▶ comeca nela', naPalavra(t), `audio em ${t}s, palavra em ${alvo.start.toFixed(2)}s`);

  // 4. pausa e ▶ de novo: retoma dali, nao pula de volta para a palavra
  await apertarPlay(pag);                 // pausa
  await pag.waitForTimeout(300);
  const tPausa = await tempo(pag);
  await apertarPlay(pag);                 // retoma
  await pag.waitForTimeout(600);
  const tRetoma = await tempo(pag);
  confere('4. a escolha vale uma vez: pausar e ▶ retoma de onde parou',
    tRetoma >= tPausa - 0.1, `parou em ${tPausa}s, retomou em ${tRetoma}s`);
  confere('   sem erro na pagina', erros.length === 0, erros.join(' | '));
  await pag.close();
}

// 2. o balao some sozinho antes do ▶
{
  const { pag } = await abrir(true);
  await tocarPalavra(pag);
  await pag.waitForTimeout(4000);
  const balao = await pag.evaluate(() => document.getElementById('popup').classList.contains('show'));
  await apertarPlay(pag);
  await pag.waitForTimeout(1200);
  const t = await tempo(pag);
  confere('2. tambem depois que o balao some sozinho', !balao && naPalavra(t), `balao aberto: ${balao}; audio em ${t}s`);
  await pag.close();
}

// 3. tocar duas vezes na mesma palavra fecha o balao e desfaz a escolha
{
  const { pag } = await abrir(true);
  await tocarPalavra(pag);
  await pag.waitForTimeout(300);
  await tocarPalavra(pag);
  await pag.waitForTimeout(300);
  await apertarPlay(pag);
  await pag.waitForTimeout(1200);
  const t = await tempo(pag);
  confere('3. fechar o balao (segundo toque) desfaz: o ▶ comeca do inicio', t < alvo.start - 1, `audio em ${t}s`);
  await pag.close();
}

// 5. Modo Reza: nada mudou
{
  const { pag } = await abrir(false);
  await tocarPalavra(pag);
  await pag.waitForTimeout(300);
  await apertarPlay(pag);
  await pag.waitForTimeout(1200);
  const t = await tempo(pag);
  confere('5. Modo Reza: tocar na palavra e ▶ continua comecando de onde estava', t < alvo.start - 1, `audio em ${t}s`);
  await pag.close();
}

await navegador.close();
console.log(falhas ? `\nVERMELHO: ${falhas} falha(s)` : '\nVERDE: no Treino, o ▶ comeca na palavra tocada');
process.exit(falhas ? 1 : 0);
