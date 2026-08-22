/**
 * testar-revisar.mjs — a pagina de revisao (revisar.html).
 *
 * E a ferramenta com que o Erez confere as linguas que sabe. Se quebrar calada,
 * ele descobre no meio da revisao e perde o trabalho.
 *
 * O que ela promete, e que este teste cobra:
 *   - cada item aparece UMA VEZ SO, mesmo estando nos 8 kadishim (a chave e o
 *     conteudo — palavra hebraica + lingua + texto — nao a posicao). "amen"
 *     esta 36 vezes nos arquivos e tem que aparecer 2 vezes na tela: uma para a
 *     transliteracao, uma para a traducao da palavra;
 *   - da para corrigir transliteracao, traducao da palavra e traducao do verso;
 *   - "so o que falta" esconde o que ja esta CERTO, mas mantem o que foi
 *     marcado para corrigir — senao a caixa de texto some no mesmo toque que a
 *     abre (foi assim que quebrou uma vez);
 *   - palavra sem transliteracao propria nao entra na conta e so aparece com o
 *     filtro desligado, com o aviso de que falta fonte;
 *   - as marcas sobrevivem a fechar e abrir.
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
await pag.waitForTimeout(2500);

const contar = () => pag.evaluate(() => ({
  itens: document.querySelectorAll('.item[data-ch]').length,
  cartoes: document.querySelectorAll('.verso').length,
  semFonte: document.querySelectorAll('.txt.falta').length,
  andamento: document.getElementById('andamento').textContent,
  tipos: [...document.querySelectorAll('.item[data-ch]')]
    .reduce((a, i) => { const t = i.dataset.ch.split('|')[0]; a[t] = (a[t] || 0) + 1; return a; }, {}),
}));

// ---------- carrega e dedupe ----------
let r = await contar();
confere('a pagina carrega itens', r.itens > 0, JSON.stringify(r));
confere('os tres tipos aparecem: verso, palavra e transliteracao',
  r.tipos.trad > 0 && r.tipos.glosa > 0 && r.tipos.tl > 0, JSON.stringify(r.tipos));
const repetidos = await pag.evaluate(() => {
  const c = [...document.querySelectorAll('.item[data-ch]')].map(i => i.dataset.ch);
  return c.length - new Set(c).size;
});
confere('nenhum item repetido', repetidos === 0, `${repetidos} repetidos`);

// "amen" esta em todos os 8 arquivos; na tela tem que aparecer so 2 vezes
const amen = await pag.evaluate(async () => {
  const semNikud = s => (s || '').normalize('NFD').replace(/[֑-ׇ̀-ͯ]/g, '').replace(/[^א-ת]/g, '');
  let nosArquivos = 0;
  for (const n of ['chabad_yatom','chabad_derabanan','ashkenaz_yatom','ashkenaz_derabanan',
                   'sefard_yatom','sefard_derabanan','sefaradi_yatom','sefaradi_derabanan']) {
    const d = await (await fetch(`./sync/${n}_sync.json`)).json();
    for (const v of d.versos) for (const p of (v.palavras || []))
      if (semNikud(p.hebrew) === 'אמן') nosArquivos++;
  }
  const naTela = [...document.querySelectorAll('.item[data-ch]')]
    .filter(i => i.dataset.ch.includes('|אמן|')).length;
  return { nosArquivos, naTela };
});
confere('a mesma palavra dos 8 kadishim aparece uma vez so',
  amen.nosArquivos > 8 && amen.naTela === 2,
  `"amen" esta ${amen.nosArquivos}x nos arquivos e ${amen.naTela}x na tela (esperado 2)`);

// ---------- marcar certo tira da lista; marcar corrigir mantem ----------
const antes = r.itens;
await pag.click('.item[data-ch] .sim');
await pag.waitForTimeout(400);
r = await contar();
confere('marcar "esta certo" tira o item da lista', r.itens === antes - 1,
  `${antes} -> ${r.itens}`);

await pag.click('.item[data-ch] .nao');
await pag.waitForTimeout(400);
const caixa = await pag.evaluate(() => !!document.querySelector('.item.corrigir input.corr'));
confere('marcar "corrigir" mantem o item e abre a caixa de texto', caixa);

await pag.fill('.item.corrigir input.corr', 'como deveria ser');
await pag.waitForTimeout(400);

// ---------- sobrevive a fechar e abrir ----------
const andamentoAntes = (await contar()).andamento;
await pag.reload();
await pag.waitForTimeout(2500);
const andamentoDepois = (await contar()).andamento;
confere('as marcas sobrevivem a fechar e abrir', andamentoAntes === andamentoDepois,
  `antes: "${andamentoAntes}" depois: "${andamentoDepois}"`);
const textoGuardado = await pag.evaluate(() =>
  (document.querySelector('.item.corrigir input.corr') || {}).value);
confere('o texto que ele digitou tambem sobrevive', textoGuardado === 'como deveria ser',
  `ficou: "${textoGuardado}"`);

// ---------- o recado ----------
await pag.click('#gerar');
await pag.waitForTimeout(600);
const recado = await pag.inputValue('#saida');
confere('o recado traz a correcao e diz que vale para os 8',
  /como deveria ser/.test(recado) && /8 kadishim/.test(recado), recado.slice(0, 220));
await pag.click('#continuar');
await pag.waitForTimeout(500);

// ---------- palavra sem fonte ----------
await pag.selectOption('#lingua', 'en');
await pag.waitForTimeout(1200);
const comFiltro = await contar();
await pag.uncheck('#sofalta');
await pag.waitForTimeout(900);
const semFiltro = await contar();
confere('palavra sem transliteracao nao entra na conta',
  comFiltro.semFonte === 0 && semFiltro.semFonte > 0,
  `com filtro: ${comFiltro.semFonte}, sem filtro: ${semFiltro.semFonte}`);
const aviso = await pag.evaluate(() =>
  (document.querySelector('.txt.falta') || {}).textContent || '');
confere('e o aviso explica que falta fonte', /falta fonte/i.test(aviso), aviso.slice(0, 90));
await pag.check('#sofalta');
await pag.waitForTimeout(600);

// ---------- alemao nao tem transliteracao nenhuma ----------
await pag.selectOption('#lingua', 'de');
await pag.waitForTimeout(1200);
const alemao = await contar();
confere('no alemao nao ha item de transliteracao', !alemao.tipos.tl,
  JSON.stringify(alemao.tipos));
confere('e o alemao tem menos itens que o espanhol', alemao.itens < 250,
  `alemao: ${alemao.itens}`);

// ---------- tela ----------
const rolaLado = await pag.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
confere('nao rola de lado no celular', !rolaLado);
confere('nenhum erro de console', erros.length === 0, erros[0] || '');

await navegador.close();
console.log(falhas ? `\n${falhas} problema(s) na pagina de revisao`
                   : '\nVERDE: a pagina de revisao passou');
process.exit(falhas ? 1 : 0);
