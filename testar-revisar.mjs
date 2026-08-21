/**
 * testar-revisar.mjs — a pagina de revisao (revisar.html).
 *
 * E a ferramenta com que o Erez confere as linguas que ele sabe. Se ela quebrar
 * calada, ele descobre no meio da revisao e perde o trabalho — por isso existe
 * este teste.
 *
 * Confere, nas 8 combinacoes e nas 8 linguas:
 *   - os versos carregam e mostram hebraico, as duas transliteracoes e as duas
 *     traducoes;
 *   - palavra sem transliteracao propria naquela lingua sai marcada (borda
 *     tracejada), para ele nao "corrigir" o que so falta fonte;
 *   - marcar certo/corrigir sobrevive a fechar e abrir (fica no aparelho);
 *   - o recado gerado no fim traz o que foi marcado;
 *   - nao rola de lado no celular.
 *
 * Uso: node servidor-teste.mjs 8896 . &
 *      node testar-revisar.mjs [http://127.0.0.1:8896/tefila-kadish]
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';

const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
);
let falhas = 0;
const confere = (nome, ok, detalhe = '') => {
  console.log((ok ? 'OK    ' : 'FALHA ') + nome + (ok || !detalhe ? '' : '\n        ' + detalhe));
  if (!ok) falhas++;
};

const pag = await navegador.newPage({ viewport: { width: 393, height: 852 } });
const erros = [];
pag.on('console', m => {
  if (m.type() === 'error' && !/fonts\.|ERR_CONNECTION_RESET/.test(m.text())) erros.push(m.text());
});
await pag.goto(`${BASE}/revisar.html`);
await pag.waitForTimeout(1200);

// ---------- carrega todas as combinacoes e linguas ----------
const ARQUIVOS = ['ashkenaz_yatom', 'ashkenaz_derabanan', 'chabad_yatom', 'chabad_derabanan',
                  'sefard_yatom', 'sefard_derabanan', 'sefaradi_yatom', 'sefaradi_derabanan'];
const LINGUAS = ['pt', 'en', 'es', 'fr', 'it', 'de', 'ru', 'he'];
const vazios = [];
for (const arq of ARQUIVOS) {
  await pag.selectOption('#qual', arq);
  await pag.waitForTimeout(500);
  const n = await pag.evaluate(() => document.querySelectorAll('.verso').length);
  if (!n) vazios.push(arq);
}
confere('as 8 combinacoes carregam versos', vazios.length === 0, 'vazias: ' + vazios.join(', '));

await pag.selectOption('#qual', 'chabad_yatom');
const semTraducao = [];
for (const lg of LINGUAS) {
  await pag.selectOption('#lingua', lg);
  await pag.waitForTimeout(450);
  const r = await pag.evaluate(() => {
    const v = document.querySelector('.verso');
    const vals = [...v.querySelectorAll('.val')].map(e => e.textContent.trim());
    return { vals, heb: v.querySelector('.heb').textContent.trim() };
  });
  if (!r.heb || r.vals.some(x => !x)) semTraducao.push(lg);
}
confere('as 8 linguas mostram hebraico e os textos', semTraducao.length === 0,
  'faltou em: ' + semTraducao.join(', '));

// ---------- palavra sem fonte sai marcada ----------
await pag.selectOption('#qual', 'sefaradi_yatom');
await pag.selectOption('#lingua', 'en');
await pag.waitForTimeout(600);
const marcadas = await pag.evaluate(() => document.querySelectorAll('.pal.semfonte').length);
confere('palavras sem transliteracao propria saem marcadas', marcadas > 0,
  `nenhuma marcada (o sefaradi em ingles tem 15)`);
const aviso = await pag.evaluate(() => document.querySelectorAll('.legenda').length);
confere('e o aviso explica o que a marca quer dizer', aviso > 0);

// no alemao nao ha transliteracao nenhuma
await pag.selectOption('#lingua', 'de');
await pag.waitForTimeout(500);
const alemao = await pag.evaluate(() =>
  !!document.querySelector('.verso .val.falta'));
confere('no alemao a pagina diz que nao ha transliteracao', alemao);

// ---------- marcar e lembrar ----------
await pag.selectOption('#qual', 'chabad_yatom');
await pag.selectOption('#lingua', 'es');
await pag.waitForTimeout(600);
await pag.click('#v1 button.sim');
await pag.waitForTimeout(300);
await pag.click('#v2 button.nao');
await pag.waitForTimeout(300);
await pag.fill('#v2 textarea', 'texto de teste');
await pag.waitForTimeout(300);
const antes = await pag.textContent('#andamento');
await pag.reload();
await pag.waitForTimeout(1200);
const depois = await pag.textContent('#andamento');
confere('as marcas sobrevivem a fechar e abrir', antes === depois && /2 de/.test(depois),
  `antes: "${antes}" depois: "${depois}"`);

// ---------- o recado ----------
await pag.click('#gerar');
await pag.waitForTimeout(600);
const recado = await pag.inputValue('#saida');
confere('o recado traz o verso corrigido e o texto escrito',
  /§2/.test(recado) && /texto de teste/.test(recado), recado.slice(0, 200));

// ---------- tela ----------
const rolaLado = await pag.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
confere('nao rola de lado no celular', !rolaLado);
confere('nenhum erro de console', erros.length === 0, erros[0] || '');

await navegador.close();
console.log(falhas ? `\n${falhas} problema(s) na pagina de revisao`
                   : '\nVERDE: a pagina de revisao passou');
process.exit(falhas ? 1 : 0);
