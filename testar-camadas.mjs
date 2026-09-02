/**
 * testar-camadas.mjs — a fita das camadas no alto (hebraico · transliteracao ·
 * traducao) e as tres linhas do ⚙ que dizem a mesma coisa.
 *
 * Existe porque este projeto ja pagou caro por DUAS CONTAS PARA A MESMA
 * PERGUNTA — o "esta mudo?" de 01/09, as duas contas do fim do passo do treino
 * em 28/08. A fita do alto e o ⚙ mostram o mesmo estado; se um dia se
 * contradisserem, e aqui que fica vermelho.
 *
 * Reprova quando:
 *   - a fita nao esta na tela, ou nao tem as tres etiquetas;
 *   - numa tela CURTA (<=700px de altura) ela nao sai — ali ela nao cabe junto
 *     com a dedicatoria, e a escolha e explicita: fica a reza, sai o ajuste;
 *   - numa tela curta o ⚙ nao continua com as tres linhas (o ajuste nao pode
 *     sumir, so mudar de lugar);
 *   - o rotulo de uma lingua e igual ao do portugues (regra 6);
 *   - o ciclo nao e Normal → Destaque → Ocultar → Normal;
 *   - o corpo da pagina nao acompanha (heb-hidden / focus-heb);
 *   - o ⚙ discorda da fita depois de um toque, ou a fita discorda do ⚙;
 *   - duas camadas ficam em destaque ao mesmo tempo;
 *   - a escolha nao sobrevive a recarregar a pagina;
 *   - um aparelho novo nao abre com as tres em Normal.
 *
 * Uso: node testar-camadas.mjs [http://127.0.0.1:8896/tefila-kadish]
 * Sem os navegadores do Playwright baixados: CHROMIUM=/caminho/do/chrome
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';

const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
);
let falhas = 0;
const linha = (ok, texto, detalhe) => {
  if (!ok) falhas++;
  console.log(`${ok ? 'OK   ' : 'FALHA'} ${texto}${detalhe ? '\n        ' + detalhe : ''}`);
};

const ler = (p) => p.evaluate(() => {
  const fita = document.getElementById('camadasSwitch');
  const est = {};
  const rot = {};
  const seg = {};
  for (const l of ['heb', 'tr', 'pt']) {
    const e = fita && fita.querySelector(`.camada-op[data-camada="${l}"]`);
    est[l] = e ? e.dataset.estado : null;
    rot[l] = e ? e.textContent.trim() : null;
    const s = document.querySelector(`.seg-control[data-layer="${l}"] button.active`);
    seg[l] = s ? s.dataset.state : null;
  }
  const corpo = {};
  for (const l of ['heb', 'tr', 'pt'])
    corpo[l] = document.body.classList.contains(`${l}-hidden`) ? 'hidden'
             : document.body.classList.contains(`focus-${l}`) ? 'focus' : 'normal';
  return { existe: !!fita, est, rot, seg, corpo };
});

// ---------------------------------------------------------------- as 8 linguas
const linguas = ['pt', 'en', 'es', 'fr', 'it', 'de', 'ru', 'he'];
let rotPt = null;
for (const lg of linguas) {
  const p = await navegador.newPage({ viewport: { width: 393, height: 852 } });
  await p.goto(`${BASE}/engine.html?n=ashkenaz&t=yatom&audio=mp3&lang=${lg}`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  const r = await ler(p);
  if (lg === 'pt') rotPt = JSON.stringify(r.rot);
  // regra 6 com dentes: fora do portugues, os rotulos TEM de ser outros.
  const emPortugues = lg !== 'pt' && JSON.stringify(r.rot) === rotPt;
  const tresNormais = ['heb', 'tr', 'pt'].every(l => r.est[l] === 'normal');
  linha(r.existe && !emPortugues && tresNormais,
    `${lg}: a fita esta na tela, nos rotulos da lingua, e abre com as tres em Normal`,
    !r.existe ? 'a fita nao existe' : emPortugues ? 'os rotulos estao em portugues'
      : !tresNormais ? JSON.stringify(r.est) : '');
  await p.close();
}

// ------------------------------------------------------------------ o resto
const p = await navegador.newPage({ viewport: { width: 393, height: 852 } });
await p.goto(`${BASE}/engine.html?n=ashkenaz&t=yatom&audio=mp3&lang=pt`, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
const tocar = async (l) => {
  await p.click(`.camada-op[data-camada="${l}"]`);
  await p.waitForTimeout(150);
  return ler(p);
};

// o ciclo pedido por ele: Normal -> Destaque -> Ocultar -> Normal
const esperado = ['focus', 'hidden', 'normal'];
for (const quero of esperado) {
  const r = await tocar('heb');
  const combina = r.est.heb === quero && r.corpo.heb === quero && r.seg.heb === quero;
  linha(combina, `um toque leva o hebraico a "${quero}" — na fita, no texto e no ⚙`,
    combina ? '' : `fita=${r.est.heb} texto=${r.corpo.heb} ajustes=${r.seg.heb}`);
}

// so UMA em destaque de cada vez
await tocar('heb');                       // hebraico em destaque
const r2 = await tocar('tr');             // transliteracao entra em destaque
linha(r2.est.tr === 'focus' && r2.est.heb === 'normal' && r2.corpo.heb === 'normal',
  'quando a transliteracao entra em destaque, o hebraico volta a Normal',
  JSON.stringify(r2.est));

// o ⚙ manda na fita tambem — e a mesma conta nos dois sentidos
await p.click('#settingsToggle');
await p.waitForTimeout(300);
await p.click('.seg-control[data-layer="pt"] button[data-state="hidden"]');
await p.waitForTimeout(200);
const r3 = await ler(p);
linha(r3.est.pt === 'hidden' && r3.corpo.pt === 'hidden',
  'mexer no ⚙ muda a fita do alto (uma conta so, nos dois sentidos)',
  JSON.stringify({ fita: r3.est.pt, texto: r3.corpo.pt }));
await p.click('#settingsClose');
await p.waitForTimeout(200);

// a escolha sobrevive a recarregar: sem isto, quem nao le hebraico teria de
// ocultar o hebraico toda vez que abrisse o app
const antes = (await ler(p)).est;
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
const depois = (await ler(p)).est;
linha(JSON.stringify(antes) === JSON.stringify(depois),
  'a escolha continua la depois de recarregar a pagina',
  `antes ${JSON.stringify(antes)} · depois ${JSON.stringify(depois)}`);

// aparelho novo: as tres em Normal
await p.evaluate(() => { try { localStorage.removeItem('tefila_camadas'); } catch (e) {} });
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
const novo = (await ler(p)).est;
linha(['heb', 'tr', 'pt'].every(l => novo[l] === 'normal'),
  'aparelho novo abre com as tres em Normal', JSON.stringify(novo));

await p.close();

// ---- tela curta: a fita sai, mas o ajuste continua inteiro no ⚙ ----
{
  const q = await navegador.newPage({ viewport: { width: 375, height: 667 } });
  await q.goto(`${BASE}/engine.html?n=ashkenaz&t=yatom&audio=mp3&lang=pt`, { waitUntil: 'domcontentloaded' });
  await q.waitForTimeout(1200);
  const r = await q.evaluate(() => {
    const f = document.getElementById('camadasSwitch');
    return {
      fitaVisivel: !!(f && getComputedStyle(f).display !== 'none'),
      linhasNoAjuste: document.querySelectorAll('.seg-control[data-layer]').length,
    };
  });
  linha(!r.fitaVisivel && r.linhasNoAjuste === 3,
    'numa tela curta a fita sai e as tres linhas continuam no ⚙', JSON.stringify(r));
  await q.close();
}

await navegador.close();
console.log(falhas ? `\n${falhas} problema(s)` : '\nVERDE: a fita das camadas e o ⚙ dizem a mesma coisa');
process.exit(falhas ? 1 : 0);
