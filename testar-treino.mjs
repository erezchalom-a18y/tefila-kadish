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
 * ATENCAO ao servidor: este teste SO vale contra um servidor que responda a
 * pedidos Range. O `python3 -m http.server` nao responde, e sem isso o
 * navegador nao consegue mover o audio: todo seek cai no zero. Rodando assim,
 * o teste dava verde medindo uma ficcao — a repeticao "funcionava" porque o
 * audio voltava ao comeco de qualquer jeito. Use servidor-teste.mjs. O teste
 * confere isso na primeira linha e reprova se o servidor nao servir.
 *
 * Uso: node servidor-teste.mjs 8896 . &
 *      node testar-treino.mjs [http://127.0.0.1:8896/tefila-kadish]
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

// O servidor responde Range? Sem isso nada abaixo significa coisa alguma.
const temRange = await pag.evaluate(async (base) => {
  try {
    const r = await fetch(`${base}/tefila-audio/chabad/yatom.mp3`, { headers: { Range: 'bytes=0-99' } });
    return r.status === 206;
  } catch (e) { return false; }
}, BASE);
if (!temRange) {
  console.log('FALHA o servidor nao responde a pedidos Range (206).');
  console.log('      Sem isso o audio nao consegue ser movido e este teste nao');
  console.log('      mede nada. Use: node servidor-teste.mjs 8896 .');
  await navegador.close();
  process.exit(1);
}

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

// ---------- com repeticao 2x, SEM Modo Treino: repete e SEGUE sozinho ----------
// Aqui vale a pena atrasar o efeito do seek de proposito: no Safari do iPhone
// ele demora varios quadros, e era nesse intervalo que o destaque piscava a
// palavra do verso seguinte e a repeticao se perdia.
await pag.reload();
await pag.waitForTimeout(2500);
await pag.evaluate(() => {
  const a = document.getElementById('audioPlayer');
  const d = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'currentTime');
  Object.defineProperty(a, 'currentTime', {
    get() { return d.get.call(a); },
    set(v) { setTimeout(() => d.set.call(a, v), 400); },   // imita o Safari lento
    configurable: true,
  });
  state.modoTreino = false; state.repeatN = 2;
});
await pag.click('#playBtn').catch(() => {});
const trilha = await pag.evaluate(async () => {
  const out = []; const a = document.getElementById('audioPlayer'); let ant = '';
  const t0 = performance.now();
  while (performance.now() - t0 < 26000) {
    await new Promise(r => requestAnimationFrame(r));
    const el = document.querySelector('.word.active');
    const m = el ? `${el.dataset.vi}/${el.dataset.wi}` : '-';
    if (m !== ant) { out.push(m); ant = m; }
  }
  return out;
});
const versosNaOrdem = trilha.filter(m => m !== '-').map(m => Number(m.split('/')[0]));
// quantas vezes cada verso comecou (palavra 0)
const comecos = trilha.filter(m => m.endsWith('/0')).map(m => Number(m.split('/')[0]));
const vezesDoVerso0 = comecos.filter(v => v === 0).length;
const vezesDoVerso1 = comecos.filter(v => v === 1).length;
confere('com repeticao 2x, o verso 1 toca duas vezes', vezesDoVerso0 === 2,
  `tocou ${vezesDoVerso0} vez(es): ${trilha.join(' ')}`);
confere('com repeticao 2x, o verso 2 toca duas vezes', vezesDoVerso1 === 2,
  `tocou ${vezesDoVerso1} vez(es): ${trilha.join(' ')}`);
confere('depois das repeticoes, segue sozinho para o verso seguinte',
  versosNaOrdem.includes(2), trilha.join(' '));
// nunca pode acender um verso que ainda nao chegou
let piscou = null;
for (let i = 1; i < versosNaOrdem.length; i++)
  if (versosNaOrdem[i] > versosNaOrdem[i-1] + 1) piscou = `${versosNaOrdem[i-1]} -> ${versosNaOrdem[i]}`;
confere('o destaque nunca pula um verso', piscou === null, piscou || '');

// ---------- Modo Treino: o destaque nao pisca a palavra do verso seguinte ----------
await pag.reload();
await pag.waitForTimeout(2500);
await pag.evaluate(() => { state.modoTreino = true; state.repeatN = 1; });
await pag.click('#playBtn').catch(() => {});
const naPausa = await pag.evaluate(async () => {
  const a = document.getElementById('audioPlayer');
  const t0 = performance.now();
  while (performance.now() - t0 < 25000) {
    await new Promise(r => requestAnimationFrame(r));
    if (a.paused && a.currentTime > 1) {
      await new Promise(r => setTimeout(r, 700));         // deixa quadros correrem
      const el = document.querySelector('.word.active');
      return el ? `${el.dataset.vi}/${el.dataset.wi}` : '-';
    }
  }
  return null;
});
confere('parado no fim do verso, o destaque fica na ultima palavra do verso que acabou',
  naPausa === '0/3', `ficou em ${naPausa} (esperado 0/3, a ultima palavra do §1)`);

confere('nenhum erro de console', erros.length === 0, erros[0] || '');

await navegador.close();
console.log(falhas ? `\n${falhas} problema(s) no Modo Treino` : '\nVERDE: Modo Treino e repeticao passaram');
process.exit(falhas ? 1 : 0);
