/**
 * testar-so-portugues.mjs — a chave do lancamento so no Brasil (14/09).
 *
 * Ele: "decidimos lancar somente em portugues a 1 versao", para "finalizar as
 * traducoes e transliteracoes e testar primeiro no brasil e trazer mudancas
 * vindas dos usuarios".
 *
 * A chave e `SO_PORTUGUES` no engine.html. NAO e um app separado, e esta
 * checagem existe para que continuar assim seja barato: as 7 linguas voltam,
 * e enquanto nao voltam elas continuam TESTADAS pelo caminho do ?lang=.
 *
 * Reprova quando:
 *   1. abrir o app sem ?lang= nao da portugues;
 *   2. uma das duas portas da lingua continua a VISTA (a do alto e a dos
 *      Ajustes) — sao duas, e esquecer uma e o defeito classico deste projeto;
 *   3. um aparelho que tinha OUTRA lingua guardada continua nela. Esta e a
 *      sutil: sem ela, quem tinha escolhido ingles semanas atras abriria o
 *      "lancamento so em portugues" em ingles, e nada acusaria;
 *   4. o ?lang= parou de funcionar — seria a morte silenciosa das checagens
 *      das outras 7 linguas, que e por onde elas passam;
 *   5. as chaves de traducao sumiram do HTML (esconder e com `hidden`, nunca
 *      apagando: o testar-linguas.mjs confere as chaves, e apagar o HTML
 *      apagaria a checagem junto).
 *
 * E ela SABE PASSAR e SABE FALHAR — as duas metades sao provadas por
 * `node testar-so-portugues.mjs <base> --provar`, que desliga a chave e exige
 * que as portas VOLTEM. Uma checagem que so sabe reprovar nao mede nada.
 *
 * Uso: node testar-so-portugues.mjs [http://127.0.0.1:8898/tefila-kadish]
 * Sem os navegadores do Playwright baixados: CHROMIUM=/caminho/do/chrome
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const BASE = process.argv[2] || 'http://127.0.0.1:8898/tefila-kadish';
const PROVAR = process.argv.includes('--provar');
const nav = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});

const falhas = [];
const ok = (bom, oque) => { console.log((bom ? 'OK   ' : 'FALHA') + '  ' + oque);
                            if (!bom) falhas.push(oque); };

// Desligar a chave POR FORA, sem tocar no arquivo: o app le a constante uma vez
// no carregamento, entao a prova troca o texto do engine.html no caminho.
async function pagina(ctx, url, desligarChave) {
  const p = await ctx.newPage();
  if (desligarChave) {
    await p.route('**/engine.html*', async rota => {
      const r = await rota.fetch();
      const html = (await r.text()).replace('const SO_PORTUGUES = true;',
                                            'const SO_PORTUGUES = false;');
      await rota.fulfill({ response: r, body: html });
    });
  }
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  return p;
}

// QUAL LINGUA O APP ESTA MOSTRANDO? Na primeira volta eu perguntei ao
// `documentElement.lang` — e ele e "pt-BR" ESCRITO NO HTML, fixo, em qualquer
// lingua. A checagem acusou tres falhas que nao existiam, e a prova de que o
// app estava certo estava na linha ao lado: o titulo vinha "Mourner's Kaddish".
// A pergunta certa nao e a uma variavel nem a um atributo: e AO QUE ESTA NA
// TELA. O titulo da reza tem um texto proprio em cada uma das 8, entao ele
// responde sozinho — e responde pelo caminho de quem reza, nao pelo de dentro.
const TITULOS = { pt:'Kadish do Enlutado', en:"Mourner's Kaddish",
                  es:'Kadish del Enlutado', fr:"Kaddish de l'Endeuillé",
                  it:'Kaddish dei Dolenti', de:'Trauerkaddisch',
                  ru:'Кадиш сироты', he:'קדיש יתום' };

const estado = async p => {
  const t = await p.evaluate(() => {
    const alto = document.getElementById('langToggle');
    const linha = document.querySelector('[data-setting="language"]');
    const vis = el => !!(el && !el.hidden && !(el.closest('[hidden]')) &&
                         el.getBoundingClientRect().height > 0);
    return {
      portaDoAlto: vis(alto),
      portaDosAjustes: vis(linha),
      // as chaves TEM de continuar no HTML, mesmo escondidas
      chaveNoHtml: !!document.querySelector('[data-i18n="language_label"]'),
      titulo: ((document.querySelector('.prayer-title') || {}).textContent || '').trim(),
    };
  });
  const achou = Object.keys(TITULOS).find(k => TITULOS[k] === t.titulo);
  return { ...t, lingua: achou || ('?: ' + t.titulo) };
};

// ---------- 1 a 3: a chave ligada ----------
const ctx = await nav.newContext();
let p = await pagina(ctx, `${BASE}/engine.html`, false);
let e = await estado(p);
ok(e.lingua === 'pt', `sem ?lang= o app abre em portugues (deu "${e.lingua}")`);
ok(!e.portaDoAlto, 'a porta da lingua do ALTO nao aparece');
ok(!e.portaDosAjustes, 'a porta da lingua dos AJUSTES nao aparece');
ok(e.chaveNoHtml, 'a chave de traducao continua no HTML (escondida, nao apagada)');
await p.close();

// 3 — o aparelho que ja tinha outra lingua guardada
await ctx.addInitScript(() => { try { localStorage.setItem('tefila_lang', 'en'); } catch (x) {} });
p = await pagina(ctx, `${BASE}/engine.html`, false);
e = await estado(p);
ok(e.lingua === 'pt',
   `aparelho com "en" guardado abre em portugues assim mesmo (deu "${e.lingua}")`);
ok(!e.portaDoAlto && !e.portaDosAjustes, 'e as duas portas continuam escondidas nele');
await p.close();
await ctx.close();

// ---------- 4: o ?lang= continua sendo o caminho das checagens ----------
const ctx2 = await nav.newContext();
p = await pagina(ctx2, `${BASE}/engine.html?lang=en`, false);
e = await estado(p);
ok(e.lingua === 'en', `?lang=en continua funcionando (deu "${e.lingua}")`);
ok(/Kaddish/i.test(e.titulo), `e a tela vem mesmo em ingles ("${e.titulo}")`);
await p.close();
await ctx2.close();

// ---------- a prova: desligando a chave, as portas VOLTAM ----------
if (PROVAR) {
  console.log('\n--- prova: com SO_PORTUGUES = false as portas tem de voltar ---');
  const ctx3 = await nav.newContext();
  const p3 = await pagina(ctx3, `${BASE}/engine.html`, true);
  const e3 = await estado(p3);
  ok(e3.portaDoAlto, 'a porta do alto VOLTA com a chave desligada');
  ok(e3.portaDosAjustes, 'a porta dos Ajustes VOLTA com a chave desligada');
  await p3.close(); await ctx3.close();
}

await nav.close();
console.log(falhas.length
  ? `\nVERMELHO: ${falhas.length} problema(s).`
  : '\nVERDE: o app abre so em portugues, as duas portas somem, e o ?lang= continua aberto para as checagens.');
process.exit(falhas.length ? 1 : 0);
