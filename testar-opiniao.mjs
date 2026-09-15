/**
 * testar-opiniao.mjs — o "Sua opiniao" das Ajustes (15/09).
 *
 * Ele: "incluir nas configuracoes, um form curto, pedindo apenas poucos dados
 * para resposta".
 *
 * A secao inteira vive presa a UMA constante, o `ENDERECO_OPINIAO` do
 * engine.html. Vazia = nao existe. E ela esta vazia hoje, porque o destino
 * ainda nao foi criado — um botao de enviar sem destino e um botao que engole
 * a mensagem de alguem.
 *
 * ESTA CHECAGEM TEM DUAS METADES, e as duas importam:
 *
 *   SEM endereco  → o titulo e o formulario NAO estao na tela, e as chaves de
 *                   traducao continuam no HTML (esconder e por classe, nunca
 *                   apagando: apagar o HTML apagaria o testar-linguas.mjs
 *                   junto, calado).
 *   --provar      → com um endereco posto no caminho, a secao VOLTA e funciona.
 *                   Uma checagem que so sabe reprovar nao mede nada; esta sabe
 *                   passar E sabe falhar.
 *
 * E a pergunta "esta na tela?" e feita pelo elementFromPoint, nunca pelo
 * atributo: em 14/09 a v59 foi ao ar com o botao de idioma na tela e a checagem
 * jurando que tinha sumido, porque perguntou se o `hidden` estava posto. O que
 * vale e quem o dedo encontra.
 *
 * O QUE O --provar COBRA, alem de a secao voltar:
 *   · o botao tem os 30px de piso do projeto;
 *   · enviar sem escrever nada NAO manda pedido nenhum;
 *   · o que sai do aparelho e so a mensagem, o nome, o contato, a lingua e a
 *     versao — nunca identificador de aparelho, nunca hora;
 *   · com o destino respondendo ERRO, o app NAO diz "recebido" e NAO apaga o
 *     que a pessoa escreveu. Esta e a linha que mais importa do arquivo: um app
 *     que serve enlutados nao diz "enviado" o que nao sabe que chegou.
 *
 * Uso: node testar-opiniao.mjs [http://127.0.0.1:8898/tefila-kadish] [--provar]
 * Sem os navegadores do Playwright baixados: CHROMIUM=/caminho/do/chrome
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const BASE = process.argv[2] && !process.argv[2].startsWith('--')
  ? process.argv[2] : 'http://127.0.0.1:8898/tefila-kadish';
const PROVAR = process.argv.includes('--provar');
const DESTINO = 'https://destino-de-prova.invalido/opiniao';

const nav = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});

const falhas = [];
const ok = (bom, oque) => { console.log((bom ? 'OK   ' : 'FALHA') + '  ' + oque);
                            if (!bom) falhas.push(oque); };

const NA_TELA = `(el) => {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (r.height <= 0 || r.width <= 0) return false;
  if (getComputedStyle(el).visibility === 'hidden') return false;
  const no = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  return !!(no && (no === el || el.contains(no)));
}`;

// O painel de Ajustes esta FECHADO quando o app abre, e por isso nada dentro
// dele esta na tela. Medir sem abrir e a armadilha de 01/09 ("o
// testar-linguas.mjs nunca abria o painel de Ajustes"): a checagem daria OK
// sem olhar coisa nenhuma.
async function abrirAjustes(p) {
  await p.evaluate(() => { const g = document.getElementById('settingsToggle'); if (g) g.click(); });
  await p.waitForTimeout(450);
}

async function pagina(ctx, url, endereco) {
  const p = await ctx.newPage();
  if (endereco) {
    await p.route('**/engine.html*', async rota => {
      const r = await rota.fetch();
      const html = (await r.text()).replace("const ENDERECO_OPINIAO = '';",
                                            `const ENDERECO_OPINIAO = '${endereco}';`);
      await rota.fulfill({ response: r, body: html });
    });
  }
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  return p;
}

// O painel de Ajustes ROLA por dentro, e a secao da opiniao e a ULTIMA dele.
// Na primeira volta esta checagem reprovou dizendo que a secao nao tinha
// voltado — e ela estava la, abaixo da dobra: o elementFromPoint devolve nada
// para um ponto fora da janela. Medir sem rolar ate ela e perguntar a coisa
// errada, que e o erro que este projeto mais registra. Rolar primeiro e o que
// uma pessoa faz.
const naTela = async (p, id) => {
  await p.evaluate(id => {
    const el = document.getElementById(id);
    if (el && getComputedStyle(el).display !== 'none') el.scrollIntoView({ block: 'center' });
  }, id);
  await p.waitForTimeout(150);
  return p.evaluate(`(${NA_TELA})(document.getElementById('${id}'))`);
};

// ---------- 1: sem endereco, a secao nao existe na tela ----------
const ctx = await nav.newContext();
let p = await pagina(ctx, `${BASE}/engine.html`, null);
await abrirAjustes(p);
ok(!(await naTela(p, 'opiniaoTitulo')), 'sem endereco, o titulo "Sua opiniao" NAO esta na tela');
ok(!(await naTela(p, 'opiniaoRow')),    'sem endereco, o formulario NAO esta na tela');
ok(await p.evaluate(() => !!document.querySelector('[data-i18n="opiniao_title"]')),
   'as chaves de traducao continuam no HTML (escondidas, nao apagadas)');
await p.close();
await ctx.close();

// ---------- a prova: com endereco, a secao volta e funciona ----------
if (PROVAR) {
  console.log('\n--- prova: com ENDERECO_OPINIAO posto, a secao tem de voltar ---');
  const ctx2 = await nav.newContext();

  // O destino de mentira. `estado` decide se ele diz sim ou nao; `recebidos`
  // guarda o que saiu do aparelho, que e a unica forma de conferir o que o app
  // manda de verdade.
  let estado = 200;
  const recebidos = [];
  const p2 = await pagina(ctx2, `${BASE}/engine.html`, DESTINO);
  await p2.route(DESTINO, async rota => {
    recebidos.push(rota.request().postData());
    await rota.fulfill({ status: estado, contentType: 'text/plain',
                         headers: { 'Access-Control-Allow-Origin': '*' }, body: 'ok' });
  });

  await abrirAjustes(p2);
  ok(await naTela(p2, 'opiniaoTitulo'), 'com endereco, o titulo VOLTA para a tela');
  ok(await naTela(p2, 'opiniaoRow'),    'com endereco, o formulario VOLTA para a tela');

  const alturaBotao = await p2.evaluate(
    () => Math.round(document.getElementById('opEnviar').getBoundingClientRect().height));
  ok(alturaBotao >= 30, `o botao Enviar tem os 30px de piso do projeto (mediu ${alturaBotao}px)`);

  // enviar sem escrever nada nao pode mandar pedido nenhum
  await p2.click('#opEnviar');
  await p2.waitForTimeout(400);
  ok(recebidos.length === 0, 'enviar com a mensagem vazia NAO manda pedido nenhum');
  ok((await p2.textContent('#opRecado') || '').trim().length > 0,
     'e a tela diz por que nao mandou');

  // ---------- o destino responde ERRO ----------
  estado = 500;
  await p2.fill('#opMsg', 'o audio do verso 3 esta adiantado no meu iphone');
  await p2.fill('#opContato', 'fulano@exemplo.com');
  await p2.click('#opEnviar');
  await p2.waitForTimeout(900);
  const ptErro = await p2.evaluate(() => I18N.pt.opiniao_erro);
  const ptOk = await p2.evaluate(() => I18N.pt.opiniao_ok);
  let recado = (await p2.textContent('#opRecado') || '').trim();
  ok(recebidos.length === 1, 'com a mensagem escrita, o pedido SAI');
  ok(recado === ptErro, `o destino respondendo erro, a tela diz que NAO deu (disse "${recado}")`);
  ok(recado !== ptOk, 'e nunca diz "recebido" o que nao chegou');
  ok((await p2.inputValue('#opMsg')).length > 0,
     'e O TEXTO DELA CONTINUA NA TELA — nao se apaga o que nao foi enviado');

  // ---------- o destino responde SIM ----------
  estado = 200;
  await p2.click('#opEnviar');
  await p2.waitForTimeout(900);
  recado = (await p2.textContent('#opRecado') || '').trim();
  ok(recado === ptOk, `com o destino respondendo sim, a tela agradece (disse "${recado}")`);
  ok((await p2.inputValue('#opMsg')).length === 0, 'e os campos ficam limpos para a proxima');

  // ---------- o que saiu do aparelho ----------
  let corpo = {};
  try { corpo = JSON.parse(recebidos[recebidos.length - 1] || '{}'); } catch (e) {}
  const campos = Object.keys(corpo).sort().join(',');
  ok(campos === 'contato,lingua,mensagem,nome,versao',
     `so isto sai do aparelho: mensagem, nome, contato, lingua e versao (saiu "${campos}")`);
  ok(/verso 3/.test(corpo.mensagem || ''), 'e a mensagem que sai e a que ela escreveu');
  await p2.close();
  await ctx2.close();

  // ---------- regra 6: nas outras 7 o texto nao pode ser o portugues ----------
  const LINGUAS = ['en', 'es', 'fr', 'it', 'de', 'ru', 'he'];
  const ctx3 = await nav.newContext();
  const p3 = await pagina(ctx3, `${BASE}/engine.html?lang=pt`, DESTINO);
  const emPt = await p3.evaluate(() => ({
    t: I18N.pt.opiniao_title, i: I18N.pt.opiniao_intro }));
  await p3.close();
  for (const l of LINGUAS) {
    const pl = await pagina(ctx3, `${BASE}/engine.html?lang=${l}`, DESTINO);
    await abrirAjustes(pl);
    const naLingua = await pl.evaluate(() => ({
      titulo: (document.getElementById('opiniaoTitulo').textContent || '').trim(),
      intro: (document.querySelector('#opiniaoRow .op-intro').textContent || '').trim(),
      botao: (document.getElementById('opEnviar').textContent || '').trim(),
    }));
    // A PERGUNTA E FEITA NO TITULO E NA FRASE LONGA, nunca no botao. "Enviar"
    // em espanhol E "Enviar", e "Invia" em italiano quase; procurar palavra
    // portuguesa em palavra curta da FALSO POSITIVO — foi o que aconteceu em
    // 01/09, quando a primeira tentativa acusou 5 linguas e as 5 estavam
    // certas ("Normal" e "Normal" em ingles). Uma frase inteira nao colide por
    // acaso; uma palavra de seis letras colide.
    ok(naLingua.titulo && naLingua.titulo !== emPt.t &&
       naLingua.intro && naLingua.intro !== emPt.i && naLingua.botao.length > 0,
       `${l}: o formulario esta na lingua, e nao em portugues ("${naLingua.titulo}")`);
    await pl.close();
  }
  await ctx3.close();
}

await nav.close();
console.log(falhas.length
  ? `\nVERMELHO: ${falhas.length} problema(s).`
  : '\nVERDE: sem endereco a secao nao existe; com endereco ela funciona e nunca mente sobre o envio.');
process.exit(falhas.length ? 1 : 0);
