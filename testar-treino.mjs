/**
 * testar-treino.mjs — o Modo Treino e a repeticao, verso a verso.
 *
 * Existe porque isto ja quebrou duas vezes, e as duas o Erez descobriu usando:
 *   1. a logica vivia no caminho do cronometro estimado, que saiu de cena
 *      quando a sincronia real entrou — parou de repetir;
 *   2. a pausa era feita direto no elemento de audio, entao o app continuava
 *      achando que estava tocando e o botao ▶ nao voltava a tocar; e o ▶
 *      recomecava do zero em vez de retomar — "trava depois da primeira vez".
 *
 * Confere, no chabad_yatom:
 *   - o Modo Treino pausa no FIM DE CADA VERSO, e nao sempre no mesmo lugar;
 *   - depois da pausa, o ▶ RETOMA (nao recomeca do primeiro verso);
 *   - com repeticao 2x, cada verso toca duas vezes antes da pausa;
 *   - o app fica sabendo que pausou (senao o botao vira um clique morto).
 *
 * Uso: node testar-treino.mjs [http://127.0.0.1:8896/tefila-kadish]
 * Sem os navegadores do Playwright baixados: CHROMIUM=/caminho/do/chrome
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';

const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
);
const pag = await navegador.newPage();
const erros = [];
pag.on('console', m => {
  if (m.type() === 'error' && !/fonts\.|ERR_CONNECTION_RESET/.test(m.text())) erros.push(m.text());
});
await pag.goto(`${BASE}/engine.html?n=chabad&t=yatom&audio=mp3`);
await pag.waitForTimeout(2500);

const audio = () => pag.evaluate(() => {
  const a = document.getElementById('audioPlayer');
  return { t: +a.currentTime.toFixed(2), pausado: a.paused, appTocando: state.isPlaying };
});
const esperarPausa = async (ms) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    await pag.waitForTimeout(200);
    const a = await audio();
    if (a.pausado) return a;
  }
  return null;
};

const versos = await pag.evaluate(async () => {
  const d = await (await fetch('./sync/chabad_yatom_sync.json')).json();
  return d.versos.map(v => ({ n: v.n, start: v.start, end: v.end }));
});

let falhas = 0;
const confere = (nome, ok, detalhe = '') => {
  console.log((ok ? 'OK    ' : 'FALHA ') + nome + (ok || !detalhe ? '' : '\n        ' + detalhe));
  if (!ok) falhas++;
};

// ---------- Modo Treino sem repeticao: pausa no fim de cada verso ----------
await pag.evaluate(() => { state.modoTreino = true; state.repeatN = 1; });
const pausas = [];
for (let i = 0; i < 4; i++) {
  await pag.click('#playBtn').catch(() => {});
  await pag.waitForTimeout(500);
  const retomou = (await audio()).t;
  const p = await esperarPausa(25000);
  if (!p) break;
  pausas.push({ retomou, parou: p.t, app: p.appTocando });
}
confere('pausa em quatro versos seguidos', pausas.length === 4,
  `pausou ${pausas.length} vez(es)`);
confere('cada pausa e num verso diferente',
  new Set(pausas.map(p => p.parou)).size === pausas.length,
  pausas.map(p => p.parou + 's').join(', '));
confere('o ▶ retoma, nao recomeca do inicio',
  pausas.slice(1).every(p => p.retomou > 1),
  pausas.map(p => `retomou em ${p.retomou}s`).join(' · '));
confere('o app sabe que pausou (o botao ▶ funciona)',
  pausas.every(p => p.app === false));
const nasFronteiras = pausas.every(p =>
  versos.some(v => Math.abs(v.end - p.parou) < 0.25));
confere('cada pausa cai no fim de um verso', nasFronteiras,
  pausas.map(p => p.parou + 's').join(', '));

// ---------- com repeticao 2x: o verso toca duas vezes ----------
await pag.reload();
await pag.waitForTimeout(2500);
await pag.evaluate(() => { state.modoTreino = true; state.repeatN = 2; });
await pag.click('#playBtn').catch(() => {});
let voltas = 0, ant = 0;
const t0 = Date.now();
while (Date.now() - t0 < 30000) {
  await pag.waitForTimeout(150);
  const a = await audio();
  if (a.t + 0.5 < ant) voltas++;              // rebobinou: e uma repeticao
  ant = a.t;
  if (a.pausado && a.t > 1) break;
}
confere('com repeticao 2x, o verso volta uma vez antes de pausar', voltas === 1,
  `voltou ${voltas} vez(es)`);

confere('nenhum erro de console', erros.length === 0, erros[0] || '');

await navegador.close();
console.log(falhas ? `\n${falhas} problema(s) no Modo Treino` : '\nVERDE: Modo Treino e repeticao passaram');
process.exit(falhas ? 1 : 0);
