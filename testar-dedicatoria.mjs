/**
 * testar-dedicatoria.mjs — a dedicatoria e o convite que a substitui quando
 * esta vazia.
 *
 * Existe porque em 01/09 o Erez pediu: "em memoria de (clique aqui para
 * incluir), bem discreto". Antes o convite era uma caixa tracejada no FIM do
 * texto: quem nunca rolou ate la nunca soube que a dedicatoria existia. Agora
 * ele ocupa a VAGA da dedicatoria, antes do primeiro verso, com o mesmo rotulo.
 *
 * Reprova quando:
 *   - o convite nao aparece com o memorial vazio, ou aparece em portugues
 *     numa das 8 linguas (rotulo de DEDICATORIA + acao de CONVITE);
 *   - ele nao esta acima do texto, na vaga do .topbar;
 *   - ele NAO acompanha a rolagem (02/09: a vaga mora no .topbar, que e sticky —
 *     "o em memoria deve descer junto com a rolagem quando o kadish rola");
 *   - ele aparece no Modo Treino, ou nao volta ao sair dele (02/09, pedido dele);
 *   - aparecem os DOIS ao mesmo tempo, ou dois de um deles (foi assim que a
 *     versao antiga podia empilhar ao trocar de lingua);
 *   - com nome preenchido o convite nao some;
 *   - apagando o nome, o convite nao volta.
 *
 * Uso: node testar-dedicatoria.mjs [http://127.0.0.1:8896/tefila-kadish]
 * Sem os navegadores do Playwright baixados: CHROMIUM=/caminho/do/chrome
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';
const nav = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
);
const linguas = ['pt','en','es','fr','it','de','ru','he'];
let ruim = 0;
let textoPt = '';
// 02/09 — a vaga saiu do #main e passou para dentro do .topbar, que e sticky.
// Por isso a busca e no documento inteiro, e nao mais dentro do main.
const ler = (p) => p.evaluate(() => {
  const vaga = document.getElementById('dedicatoriaFixa');
  const conv = document.querySelector('.convite-dedicar');
  const ded = document.querySelector('.dedicatoria');
  const primeiro = document.querySelector('#main .verse');
  const el = conv || ded;
  const r = el ? el.getBoundingClientRect() : null;
  return {
    convites: document.querySelectorAll('.convite-dedicar').length,
    dedicatorias: document.querySelectorAll('.dedicatoria').length,
    texto: el ? el.textContent.trim().replace(/\s+/g,' ') : '',
    antesDoVerso: el && primeiro ? (el.compareDocumentPosition(primeiro) & 4) === 4 : null,
    alturaConv: conv ? Math.round(conv.getBoundingClientRect().height) : 0,
    naVagaDoTopo: !!(vaga && el && vaga.contains(el)),
    visivel: !!(r && r.height > 0 && r.bottom > 0 && r.top < innerHeight),
  };
});
// A — sem nome: o convite aparece, nas 8, no lugar da dedicatoria
for (const lg of linguas) {
  const p = await nav.newPage({ viewport: { width: 375, height: 667 } });
  await p.goto(`${BASE}/engine.html?n=ashkenaz&t=yatom&audio=mp3&lang=${lg}`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  const r = await ler(p);
  if (lg === 'pt') textoPt = r.texto;
  // regra 6 com dentes: fora do portugues, o texto tem de ser OUTRO. Sem isto a
  // checagem passaria com o convite em portugues nas 8, que e o defeito classico
  // deste projeto (o applyI18n ignora em silencio a chave que falta).
  const emPortugues = lg !== 'pt' && r.texto === textoPt;
  const ok = r.convites === 1 && r.dedicatorias === 0 && r.antesDoVerso === true
    && r.texto.length > 6 && !emPortugues;
  if (!ok) ruim++;
  console.log((ok?'OK   ':'FALHA') + ` vazio ${lg}: ${JSON.stringify(r)}`);
  await p.close();
}
// B — com nome: some o convite e fica a dedicatoria; e trocar de lingua nao duplica
{
  const p = await nav.newPage({ viewport: { width: 375, height: 667 } });
  await p.goto(`${BASE}/engine.html?n=ashkenaz&t=yatom&audio=mp3&lang=pt`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(800);
  await p.evaluate(() => localStorage.setItem('tefila_memorial', JSON.stringify({ name: 'Moshe ben Avraham', hebrew: '', relation: 'meu pai' })));
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  let r = await ler(p);
  let ok = r.convites === 0 && r.dedicatorias === 1 && r.antesDoVerso === true && r.texto.includes('Moshe');
  if (!ok) ruim++;
  console.log((ok?'OK   ':'FALHA') + ` com nome: ${JSON.stringify(r)}`);
  // trocar de lingua tres vezes seguidas
  for (const lg of ['en','he','pt']) {
    await p.evaluate((l) => { if (typeof setLanguage === 'function') setLanguage(l); else if (typeof applyLanguage === 'function') applyLanguage(l); }, lg);
    await p.waitForTimeout(400);
  }
  r = await ler(p);
  ok = r.convites === 0 && r.dedicatorias === 1;
  if (!ok) ruim++;
  console.log((ok?'OK   ':'FALHA') + ` depois de 3 trocas de lingua: ${JSON.stringify(r)}`);
  // e apagando o nome, o convite volta
  await p.evaluate(() => localStorage.removeItem('tefila_memorial'));
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  r = await ler(p);
  ok = r.convites === 1 && r.dedicatorias === 0;
  if (!ok) ruim++;
  console.log((ok?'OK   ':'FALHA') + ` sem nome de novo: ${JSON.stringify(r)}`);

  // C — ele DESCE JUNTO com a rolagem (02/09). Antes disto ele saia da tela com
  // 400px de rolagem e nao voltava mais.
  await p.evaluate(() => window.scrollTo(0, 900));
  await p.waitForTimeout(300);
  r = await ler(p);
  ok = r.visivel && r.naVagaDoTopo;
  if (!ok) ruim++;
  console.log((ok?'OK   ':'FALHA') + ` depois de rolar 900px continua na tela: ${JSON.stringify({visivel:r.visivel, naVaga:r.naVagaDoTopo})}`);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(200);

  // D — e NAO aparece no Modo Treino, mas volta ao sair dele
  await p.click('#treinoToggle');
  await p.waitForTimeout(700);
  r = await ler(p);
  ok = !r.visivel;
  if (!ok) ruim++;
  console.log((ok?'OK   ':'FALHA') + ` no Modo Treino nao aparece: ${JSON.stringify({visivel:r.visivel})}`);
  await p.click('#rezaToggle');
  await p.waitForTimeout(700);
  r = await ler(p);
  ok = r.visivel;
  if (!ok) ruim++;
  console.log((ok?'OK   ':'FALHA') + ` e volta ao sair do Modo Treino: ${JSON.stringify({visivel:r.visivel})}`);

  await p.close();
}
await nav.close();
console.log(ruim ? `${ruim} problema(s)` : 'VERDE: o convite ocupa a vaga da dedicatoria, desce junto com o Kadish, e sai do Treino');
process.exit(ruim ? 1 : 0);
