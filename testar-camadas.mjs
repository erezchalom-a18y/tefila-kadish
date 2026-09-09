/**
 * testar-camadas.mjs — as tres camadas (hebraico · transliteracao · traducao)
 * dentro do ⚙, e o texto que tem de acompanhar.
 *
 * HISTORIA, porque ela explica o que esta checagem pergunta hoje:
 * ela nasceu em 02/09 com a v27, quando as camadas ganharam uma FITA no alto da
 * tela alem das tres linhas do ⚙. A pergunta era "os dois dizem a mesma coisa?",
 * porque este projeto ja pagou caro por DUAS CONTAS PARA A MESMA PERGUNTA — o
 * "esta mudo?" de 01/09, as duas contas do fim do passo do treino em 28/08.
 *
 * Em 04/09 ele mandou tirar a fita: "gostaria de reverter o que fizemos
 * incluindo a segunda linha com hebraico traducao e transcricao, mantendo
 * exatamente igual estava antes, inclusive fontes". Com uma conta so, a pergunta
 * das duas contas deixou de existir — e a checagem NAO foi apagada por isso:
 * mudou de pergunta, e ficou mais exigente numa coisa nova (que a fita nao volte
 * sozinha).
 *
 * Reprova quando:
 *   - a fita do alto VOLTAR (ele mandou tirar; se alguem a repuser sem ele
 *     pedir, isto fica vermelho antes de chegar ao aparelho dele);
 *   - o ⚙ nao tem as tres linhas, em qualquer tela;
 *   - o rotulo de uma lingua e igual ao do portugues (regra 6);
 *   - tocar no ⚙ nao muda o texto (heb-hidden / focus-heb no corpo da pagina);
 *   - duas camadas ficam em destaque ao mesmo tempo;
 *   - a escolha nao sobrevive a recarregar a pagina;
 *   - um aparelho novo nao abre com a transliteracao em Destaque.
 *
 * Uso: node testar-camadas.mjs [http://127.0.0.1:8896/tefila-kadish]
 * Sem os navegadores do Playwright baixados: CHROMIUM=/caminho/do/chrome
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';
const CAMADAS = ['heb', 'tr', 'pt'];

const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
);
let falhas = 0;
const linha = (ok, texto, detalhe) => {
  if (!ok) falhas++;
  console.log(`${ok ? 'OK   ' : 'FALHA'} ${texto}${detalhe ? '\n        ' + detalhe : ''}`);
};

const ler = (p) => p.evaluate(() => {
  const est = {}, rot = {}, corpo = {};
  for (const l of ['heb', 'tr', 'pt']) {
    const s = document.querySelector(`.seg-control[data-layer="${l}"] button.active`);
    est[l] = s ? s.dataset.state : null;
    const r = document.querySelector(`.seg-control[data-layer="${l}"]`);
    const rotulo = r && r.closest('.settings-row');
    rot[l] = rotulo ? (rotulo.querySelector('.settings-row-label') || {}).textContent?.trim() : null;
    corpo[l] = document.body.classList.contains(`${l}-hidden`) ? 'hidden'
             : document.body.classList.contains(`focus-${l}`) ? 'focus' : 'normal';
  }
  return { fitaNoAlto: !!document.getElementById('camadasSwitch'),
           linhasNoAjuste: document.querySelectorAll('.seg-control[data-layer]').length, est, rot, corpo };
});

const abrirAjustes = async (p) => { await p.click('#settingsToggle'); await p.waitForTimeout(300); };
const por = async (p, l, estado) => {
  await p.click(`.seg-control[data-layer="${l}"] button[data-state="${estado}"]`);
  await p.waitForTimeout(200);
  return ler(p);
};

// ---------------------------------------------------------------- as 8 linguas
const linguas = ['pt', 'en', 'es', 'fr', 'it', 'de', 'ru', 'he'];
let rotPt = null;
for (const lg of linguas) {
  const p = await navegador.newPage({ viewport: { width: 393, height: 852 } });
  await p.goto(`${BASE}/engine.html?n=ashkenaz&t=yatom&audio=mp3&lang=${lg}`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  await abrirAjustes(p);
  const r = await ler(p);
  if (lg === 'pt') rotPt = JSON.stringify(r.rot);
  const emPortugues = lg !== 'pt' && JSON.stringify(r.rot) === rotPt;
  // 09/09 — o PADRAO mudou por decisao dele ("deixar como padrao do app a
  // transliteracao em destaque"), entao esta linha cobra outro estado. Ela nao
  // afrouxou: continua exigindo os TRES valores exatos, um por um. Trocar o
  // padrao sem ele pedir continua ficando vermelho aqui.
  const padrao = r.est.heb === 'normal' && r.est.tr === 'focus' && r.est.pt === 'normal';
  linha(r.linhasNoAjuste === 3 && !r.fitaNoAlto && !emPortugues && padrao,
    `${lg}: as tres linhas estao no ⚙, nos rotulos da lingua, e a transliteracao abre em Destaque`,
    r.fitaNoAlto ? 'a fita do alto VOLTOU — ele mandou tirar em 04/09'
      : r.linhasNoAjuste !== 3 ? `so ${r.linhasNoAjuste} linha(s) no ⚙`
      : emPortugues ? 'os rotulos estao em portugues'
      : !padrao ? JSON.stringify(r.est) : '');
  await p.close();
}

// ------------------------------------------------------------------ o resto
const p = await navegador.newPage({ viewport: { width: 393, height: 852 } });
await p.goto(`${BASE}/engine.html?n=ashkenaz&t=yatom&audio=mp3&lang=pt`, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
await abrirAjustes(p);

// cada estado do ⚙ tem de chegar ao TEXTO — e a mesma conta, nao duas
for (const quero of ['focus', 'hidden', 'normal']) {
  const r = await por(p, 'heb', quero);
  const combina = r.est.heb === quero && r.corpo.heb === quero;
  linha(combina, `o ⚙ leva o hebraico a "${quero}", e o texto acompanha`,
    combina ? '' : `ajustes=${r.est.heb} texto=${r.corpo.heb}`);
}

// so UMA em destaque de cada vez
await por(p, 'heb', 'focus');
const r2 = await por(p, 'tr', 'focus');
linha(r2.est.tr === 'focus' && r2.est.heb === 'normal' && r2.corpo.heb === 'normal',
  'quando a transliteracao entra em destaque, o hebraico volta a Normal',
  JSON.stringify(r2.est));

await p.click('#settingsClose');
await p.waitForTimeout(200);

// a escolha sobrevive a recarregar: sem isto, quem nao le hebraico teria de
// ocultar o hebraico toda vez que abrisse o app
const antes = (await ler(p)).corpo;
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
const depois = (await ler(p)).corpo;
linha(JSON.stringify(antes) === JSON.stringify(depois),
  'a escolha continua la depois de recarregar a pagina',
  `antes ${JSON.stringify(antes)} · depois ${JSON.stringify(depois)}`);

// Aparelho novo: TRANSLITERACAO em Destaque, as outras duas em Normal.
//
// 09/09 — esta linha cobrava "as tres em Normal" e passou a cobrar outra coisa,
// porque o PADRAO mudou por decisao dele: "deixar como padrao do app a
// transliteracao em destaque". O argumento dele e mais forte que o meu: a
// transliteracao e a linha que a BOCA le, e num app cujo trabalho e fazer
// alguem conseguir dizer o Kadish ela e o texto principal.
// A checagem nao afrouxou — continua exigindo um estado EXATO, e continua
// exigindo que so uma camada esteja em destaque. Se alguem trocar o padrao sem
// ele pedir, isto fica vermelho antes de chegar ao aparelho dele.
await p.evaluate(() => { try { localStorage.removeItem('tefila_camadas'); } catch (e) {} });
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
const novo = (await ler(p)).corpo;
linha(novo.heb === 'normal' && novo.tr === 'focus' && novo.pt === 'normal',
  'aparelho novo abre com a transliteracao em Destaque', JSON.stringify(novo));
await p.close();

// ---- a limpeza de uma vez so: o aparelho adota o PADRAO do app ----
// Nasceu em 04/09, para o aparelho que ficou com o Destaque do hebraico preso
// da fita antiga: a transliteracao encolhia e nada na tela dizia por que.
// Em 09/09 a marca mudou de nome porque o PADRAO mudou (transliteracao em
// Destaque), e sem trocar a marca o aparelho dele nunca veria o padrao novo —
// padrao so vale para quem nunca escolheu. O alvo desta linha mudou junto: o
// que se cobra e que o aparelho chegue ao PADRAO, e nao mais que fique tudo em
// Normal. Se alguem tirar a limpeza, isto fica vermelho.
{
  const q = await navegador.newPage({ viewport: { width: 393, height: 852 } });
  await q.goto(`${BASE}/engine.html?n=ashkenaz&t=yatom&audio=mp3&lang=pt`, { waitUntil: 'domcontentloaded' });
  await q.waitForTimeout(800);
  await q.evaluate(() => { try {
    localStorage.removeItem('tefila_camadas_padrao_0909');
    localStorage.setItem('tefila_camadas', JSON.stringify({ heb: 'focus', tr: 'normal', pt: 'normal' }));
  } catch (e) {} });
  await q.reload({ waitUntil: 'domcontentloaded' });
  await q.waitForTimeout(1500);
  const r = await q.evaluate(() => {
    const g = s => { const e = document.querySelector(s); if (!e) return null;
      const c = getComputedStyle(e); return { px: c.fontSize, op: c.opacity }; };
    return { corpo: document.body.className.match(/focus-\w+/g) || [],
             focoTr: document.body.classList.contains('focus-tr'),
             focoHeb: document.body.classList.contains('focus-heb'),
             tr: g('.translit'), pt: g('.pt-merged') };
  });
  // O aparelho entrou com o HEBRAICO em Destaque (o estado preso da fita antiga)
  // e tem de sair com a TRANSLITERACAO em Destaque, que e o padrao de hoje: a
  // transliteracao inteira e opaca, o hebraico esmaecido. Cobrar "nenhum foco"
  // seria cobrar o padrao de ontem.
  const limpou = r.focoTr && !r.focoHeb && r.tr.op === '1';
  linha(limpou, 'aparelho com Destaque preso da fita antiga adota o padrao do app',
    limpou ? '' : `corpo ${r.corpo} · translit ${JSON.stringify(r.tr)} · traducao ${JSON.stringify(r.pt)}`);
  // e a escolha NOVA dele continua sendo guardada
  await q.click('#settingsToggle'); await q.waitForTimeout(300);
  await q.evaluate(() => document.querySelector('.seg-control[data-layer="tr"] button[data-state="focus"]')?.click());
  await q.waitForTimeout(200);
  await q.reload({ waitUntil: 'domcontentloaded' });
  await q.waitForTimeout(1400);
  const guardou = await q.evaluate(() => document.body.classList.contains('focus-tr'));
  linha(guardou, 'e a escolha que ele fizer DEPOIS continua sendo guardada');
  await q.close();
}

// ---- tela pequena: o ajuste continua inteiro, e a fita continua fora ----
{
  const q = await navegador.newPage({ viewport: { width: 375, height: 667 } });
  await q.goto(`${BASE}/engine.html?n=ashkenaz&t=yatom&audio=mp3&lang=pt`, { waitUntil: 'domcontentloaded' });
  await q.waitForTimeout(1200);
  const r = await ler(q);
  linha(!r.fitaNoAlto && r.linhasNoAjuste === 3,
    'no celular a fita continua fora e as tres linhas continuam no ⚙', JSON.stringify(r.linhasNoAjuste));
  await q.close();
}

await navegador.close();
console.log(falhas ? `\n${falhas} problema(s)` : '\nVERDE: as tres camadas respondem no ⚙, e a fita nao voltou');
process.exit(falhas ? 1 : 0);
