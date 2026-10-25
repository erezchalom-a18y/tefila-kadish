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
 *   - um aparelho novo nao abre SO COM A TRANSLITERACAO.
 *
 * 25/10 (v64) — A PERGUNTA DAS DUAS CONTAS VOLTOU, e por isso esta checagem
 * voltou a ser o que nasceu sendo. Ele pediu tres botoes no fluxo do texto
 * ("hebraico - transliterado - portugues"), entao ha outra vez DOIS lugares
 * que dizem quais camadas estao na tela: os filtros e as tres linhas do ⚙.
 * A pergunta que importa aqui e a de 02/09, na letra: **os dois dizem a mesma
 * coisa?** Agora ela e cobrada nos dois sentidos — tocar no filtro move o ⚙,
 * tocar no ⚙ move o filtro.
 *
 * E tres perguntas novas, todas de defeito que nao daria erro nenhum:
 *   - o ULTIMO filtro aceso nao pode apagar (um toque deixaria a tela em
 *     branco, e quem reza nao teria mais texto em que tocar para desfazer);
 *   - em ALEMAO a tela nao pode ficar sem texto: o alemao nao tem
 *     transliteracao propria e o padrao da v64 oculta as outras duas, entao as
 *     duas decisoes juntas deixariam quem le alemao sem uma linha;
 *   - a transliteracao SOZINHA tem de ser maior do que quando divide a tela —
 *     e dali que vem o "transliterado grande" que ele pediu, e nao de um
 *     estado "Destaque".
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
  // os tres filtros do fluxo do texto (v64): aceso/apagado e se estao travados
  const filtro = {}, travado = {}, naTela = {};
  for (const l of ['heb', 'tr', 'pt']) {
    const b = document.querySelector(`#filtrosTexto button[data-filtro="${l}"]`);
    filtro[l] = b ? b.classList.contains('active') : null;
    travado[l] = b ? b.getAttribute('aria-disabled') === 'true' : null;
    // "esta na tela?" pelo elementFromPoint, que e o que o dedo encontra — nao
    // pelo atributo, que foi o que deixou a v59 ir ao ar com o botao visivel
    if (b) { const r = b.getBoundingClientRect();
      const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      naTela[l] = !!(e && (e === b || b.contains(e)));
    } else naTela[l] = false;
  }
  const tr = document.querySelector('.translit');
  return { fitaNoAlto: !!document.getElementById('camadasSwitch'),
           linhasNoAjuste: document.querySelectorAll('.seg-control[data-layer]').length,
           temFiltros: document.querySelectorAll('#filtrosTexto button[data-filtro]').length,
           filtro, travado, naTela,
           pxTranslit: tr ? parseFloat(getComputedStyle(tr).fontSize) : null,
           est, rot, corpo };
});

const abrirAjustes = async (p) => { await p.click('#mpAjustes'); await p.waitForTimeout(300); };
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
  // OS FILTROS SAO LIDOS COM O PAINEL FECHADO, E O ⚙ COM ELE ABERTO. Nao e
  // arrumacao: com os Ajustes abertos o painel COBRE a tela e o
  // elementFromPoint devolve o painel, entao a pergunta "o filtro esta na
  // tela?" responderia NAO com os tres filtros perfeitamente visiveis
  // embaixo. E a armadilha de 14/09, escrita no CLAUDE.md na v60 — as duas
  // portas vivem em momentos diferentes e tem de ser medidas em momentos
  // diferentes. Na primeira volta desta linha eu a repeti, e ela acusou as 8
  // linguas de nao terem filtro nenhum.
  const rFiltros = await ler(p);
  await abrirAjustes(p);
  const rAjuste = await ler(p);
  const r = { ...rAjuste, naTela: rFiltros.naTela, temFiltros: rFiltros.temFiltros,
              filtro: rFiltros.filtro, travado: rFiltros.travado };
  if (lg === 'pt') rotPt = JSON.stringify(r.rot);
  const emPortugues = lg !== 'pt' && JSON.stringify(r.rot) === rotPt;
  // 25/10 — o PADRAO mudou por decisao dele: "de inicio sempre deve comecar
  // como somente transliterado grande (retire o hebraico e a traducao)".
  // Continua exigindo os TRES valores exatos, um por um: trocar o padrao sem
  // ele pedir fica vermelho aqui.
  //
  // O ALEMAO E DIFERENTE DE PROPOSITO, e exigir dele o mesmo estado seria
  // exigir a TELA EM BRANCO: o alemao nao tem transliteracao propria (decisao
  // dele em 21/08 — a portuguesa soaria outra palavra na boca de quem le
  // alemao), entao "so o transliterado" nao mostra nada ali. O app acende o
  // hebraico de volta, e esta linha cobra exatamente isso.
  const semTranslit = (lg === 'de');
  const padrao = semTranslit
    ? (r.est.heb === 'normal' && r.est.tr === 'normal' && r.est.pt === 'hidden')
    : (r.est.heb === 'hidden' && r.est.tr === 'normal' && r.est.pt === 'hidden');
  // e as tres camadas tem de estar na tela de verdade, nao so no atributo
  const filtrosOk = r.temFiltros === 3 && r.naTela.heb && r.naTela.pt
                    && (semTranslit ? !r.naTela.tr : r.naTela.tr);
  linha(r.linhasNoAjuste === 3 && !r.fitaNoAlto && !emPortugues && padrao && filtrosOk,
    `${lg}: as tres linhas no ⚙, os tres filtros na tela, nos rotulos da lingua, e abre so com o transliterado`,
    r.fitaNoAlto ? 'a fita do alto VOLTOU — ele mandou tirar em 04/09'
      : r.linhasNoAjuste !== 3 ? `so ${r.linhasNoAjuste} linha(s) no ⚙`
      : emPortugues ? 'os rotulos estao em portugues'
      : !padrao ? JSON.stringify(r.est)
      : `filtros: ${r.temFiltros} na pagina, na tela ${JSON.stringify(r.naTela)}`);
  // E A TELA NAO PODE FICAR SEM TEXTO EM LINGUA NENHUMA. Esta linha e a unica
  // que pega o encontro das duas decisoes acima, e ela nao da erro de console:
  // o app simplesmente nao mostraria nada, e so se descobriria no aparelho de
  // alguem.
  const temTexto = await p.evaluate(() => {
    const vis = s => { const e = document.querySelector(s);
      return !!(e && getComputedStyle(e).display !== 'none' && e.textContent.trim()); };
    return vis('.hebrew') || vis('.translit') || vis('.pt-merged');
  });
  linha(temTexto, `${lg}: ha ao menos uma linha de texto na tela`,
    temTexto ? '' : 'A TELA ESTA EM BRANCO');
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

// Aparelho novo: SO A TRANSLITERACAO, e grande.
//
// 25/10 — esta linha cobrava "a transliteracao em Destaque" (o padrao de 09/09)
// e passou a cobrar outra coisa, porque o PADRAO mudou por decisao dele: "de
// inicio sempre deve comecar como somente transliterado grande em fonte bonita
// e facil de ler (retire o hebraico e a traducao)".
// A checagem nao afrouxou — continua exigindo um estado EXATO, os tres valores
// um por um. E ganhou a segunda metade, que e a que interessa a quem reza: a
// transliteracao SOZINHA tem de ser MAIOR do que quando divide a tela. O
// "grande" dele vem de estar sozinha, nao de um estado "Destaque"; se alguem
// reescrever isso como focus-tr, a primeira metade continua passando e esta
// segunda ainda pega a diferenca.
await p.evaluate(() => { try { localStorage.removeItem('tefila_camadas'); } catch (e) {} });
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
const rNovo = await ler(p);
const novo = rNovo.corpo;
const pxSozinha = rNovo.pxTranslit;
linha(novo.heb === 'hidden' && novo.tr === 'normal' && novo.pt === 'hidden',
  'aparelho novo abre so com o transliterado', JSON.stringify(novo));

// acende o hebraico pelo FILTRO e mede de novo: dividindo a tela, ela encolhe
await p.evaluate(() => document.querySelector('#filtrosTexto button[data-filtro="heb"]')?.click());
await p.waitForTimeout(250);
const rDois = await ler(p);
linha(pxSozinha > rDois.pxTranslit + 2,
  'a transliteracao SOZINHA e maior do que quando divide a tela',
  `sozinha ${pxSozinha}px · com o hebraico ${rDois.pxTranslit}px`);
// e o filtro moveu o ⚙: UMA conta so, nao duas
linha(rDois.est.heb === 'normal' && rDois.corpo.heb === 'normal' && rDois.filtro.heb === true,
  'tocar no filtro move o ⚙ e o texto — os dois dizem a mesma coisa',
  `⚙=${rDois.est.heb} texto=${rDois.corpo.heb} filtro=${rDois.filtro.heb}`);

// e no sentido contrario: o ⚙ move o filtro
await abrirAjustes(p);
const rTres = await por(p, 'heb', 'hidden');
await p.click('#settingsClose'); await p.waitForTimeout(250);
const rQuatro = await ler(p);
linha(rQuatro.filtro.heb === false && rQuatro.corpo.heb === 'hidden',
  'o ⚙ move o filtro — e no sentido contrario tambem e uma conta so',
  `filtro=${rQuatro.filtro.heb} texto=${rQuatro.corpo.heb}`);

// O ULTIMO ACESO NAO APAGA. Sem isto um toque deixa a tela em branco e quem
// esta rezando nao tem mais texto em que tocar para desfazer.
const soTr = rQuatro.filtro.heb === false && rQuatro.filtro.pt === false && rQuatro.filtro.tr === true;
await p.evaluate(() => document.querySelector('#filtrosTexto button[data-filtro="tr"]')?.click());
await p.waitForTimeout(250);
const rCinco = await ler(p);
linha(soTr && rCinco.travado.tr === true && rCinco.filtro.tr === true && rCinco.corpo.tr === 'normal',
  'o ultimo filtro aceso nao apaga',
  `so o tr aceso antes: ${soTr} · travado ${rCinco.travado.tr} · depois do toque ${JSON.stringify(rCinco.corpo)}`);
await p.close();

// ---- a limpeza de uma vez so: o aparelho adota o PADRAO do app ----
// Nasceu em 04/09, para o aparelho que ficou com o Destaque do hebraico preso
// da fita antiga: a transliteracao encolhia e nada na tela dizia por que.
// Em 09/09 a marca mudou de nome porque o PADRAO mudou, e em 25/10 mudou outra
// vez pelo mesmo motivo: sem trocar a marca o aparelho dele nunca veria o
// padrao novo — padrao so vale para quem nunca escolheu, e ele JA escolheu
// alguma coisa em todos os aparelhos em que abriu o app. Ele testaria, veria a
// tela de ontem e diria "nada mudou", que ja aconteceu neste projeto.
// O alvo desta linha mudou junto: cobra que o aparelho chegue ao PADRAO DE
// HOJE. Se alguem tirar a limpeza, isto fica vermelho.
{
  const q = await navegador.newPage({ viewport: { width: 393, height: 852 } });
  await q.goto(`${BASE}/engine.html?n=ashkenaz&t=yatom&audio=mp3&lang=pt`, { waitUntil: 'domcontentloaded' });
  await q.waitForTimeout(800);
  await q.evaluate(() => { try {
    localStorage.removeItem('tefila_camadas_padrao_1025');
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
             hebOculto: document.body.classList.contains('heb-hidden'),
             ptOculto: document.body.classList.contains('pt-hidden'),
             tr: g('.translit'), pt: g('.pt-merged') };
  });
  // O aparelho entrou com o HEBRAICO em Destaque (o estado preso da fita antiga)
  // e tem de sair com o padrao de HOJE: so a transliteracao, inteira e opaca,
  // sem destaque nenhum. Cobrar "focus-tr" seria cobrar o padrao de 09/09, e
  // cobrar "nenhum foco" sozinho seria cobrar o de 04/09 — por isso as tres
  // coisas juntas: nenhum destaque, nada escondendo a transliteracao, e as
  // outras duas camadas fora.
  const limpou = !r.focoTr && !r.focoHeb && r.corpo.length === 0
                 && r.tr.op === '1' && r.hebOculto && r.ptOculto;
  linha(limpou, 'aparelho com Destaque preso da fita antiga adota o padrao do app',
    limpou ? '' : `corpo ${r.corpo} · heb oculto ${r.hebOculto} · pt oculto ${r.ptOculto} · translit ${JSON.stringify(r.tr)}`);
  // e a escolha NOVA dele continua sendo guardada
  await q.click('#mpAjustes'); await q.waitForTimeout(300);
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
console.log(falhas ? `\n${falhas} problema(s)`
  : '\nVERDE: os filtros e o ⚙ dizem a mesma coisa, e a fita nao voltou');
process.exit(falhas ? 1 : 0);
