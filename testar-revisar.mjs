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
 *   - palavra sem transliteracao propria ENTRA na conta e da para escrever ali
 *     mesmo (o Erez e a fonte humana que faltava), ou deixar em portugues;
 *   - alemao e hebraico nao tem linha de transliteracao nenhuma, entao nao
 *     pedem nada disso — sem essa regra o alemao pedia 113 palavras a mao;
 *   - as marcas sobrevivem a fechar e abrir;
 *   - uma lingua guardada no aparelho por uma versao ANTERIOR da pagina nao
 *     pode quebrar nada. A primeira versao tinha "portugues" na lista; quando
 *     ele foi tirado, o seletor ficava vazio e a pagina dizia "falta fonte" nas
 *     113 palavras — inclusive no Yitgadal, que tem fonte. O Erez viu isso.
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
// Erro que ESTOURA dentro de um listener nao chega no evento 'console' do
// Playwright — chega em 'pageerror'. Sem esta linha o teste dava verde com a
// pagina quebrando: tocar em "Copiar" ou "Voltar a revisao" estourava, porque
// a tela do recado tambem tem .acoes e o clique caia no handler dos itens.
pag.on('pageerror', e => erros.push('pageerror: ' + e.message));
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

// A reclamacao do Erez em 23/08: "nao esta corrigindo — a palavra continua la,
// igual". Escrever a correcao tem que resolver o item, do mesmo jeito que o
// "Esta certo": o item sai da lista e o contador anda. Mas so ao SAIR da
// caixa; a cada tecla, nao — senao volta o defeito de ontem, de a caixa sumir
// debaixo do dedo.
const chCorrigido = await pag.evaluate(() =>
  document.querySelector('.item.corrigir').dataset.ch);
const naTela = () => pag.locator(`.item[data-ch="${chCorrigido.replace(/"/g, '\\"')}"]`).count();
const naListaAntes = await pag.locator('.item[data-ch]').count();

await pag.click('.item.corrigir input.corr');
await pag.type('.item.corrigir input.corr', 'X');   // uma tecla, ainda dentro da caixa
await pag.waitForTimeout(300);
confere('digitando, a caixa NAO some debaixo do dedo',
  await pag.locator('.item.corrigir input.corr').count() === 1);

await pag.fill('.item.corrigir input.corr', 'como deveria ser');
await pag.locator('.item.corrigir input.corr').blur();
await pag.waitForTimeout(500);
confere('escrever a correcao tira o item da lista, como o "esta certo"',
  await naTela() === 0);
confere('e a lista encolhe de verdade',
  await pag.locator('.item[data-ch]').count() === naListaAntes - 1,
  `antes: ${naListaAntes} depois: ${await pag.locator('.item[data-ch]').count()}`);

// Com o filtro desligado ele ve o item de novo, com a correcao e o "anotado".
await pag.uncheck('#sofalta');
await pag.waitForTimeout(500);
confere('desligando o filtro, o item volta com o aviso de anotado',
  await pag.locator('.item.corrigir .anotado').count() > 0);

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
await pag.click('#copiar');
await pag.waitForTimeout(300);
confere('o botao Copiar responde e nao estoura',
  (await pag.textContent('#copiar')).includes('Copiado'), await pag.textContent('#copiar'));
await pag.click('#continuar');
await pag.waitForTimeout(500);
confere('e o Voltar a revisao traz os itens de volta',
  (await pag.locator('.item[data-ch]').count()) > 0);

// ---------- palavra sem fonte: da para escrever ----------
await pag.selectOption('#lingua', 'en');
await pag.waitForTimeout(1300);
const ingles = await contar();
confere('as palavras sem fonte entram na conta',
  (ingles.tipos['tl-falta'] || 0) === 20,
  `${ingles.tipos['tl-falta'] || 0} na lista (esperado 20)`);

const semFonte = await pag.evaluate(() => {
  const i = [...document.querySelectorAll('.item[data-ch]')]
    .find(x => x.dataset.ch.startsWith('tl-falta'));
  return i ? i.dataset.ch : null;
});
confere('ha uma palavra sem fonte para escrever', !!semFonte);
await pag.evaluate(ch =>
  document.querySelector(`.item[data-ch="${CSS.escape(ch)}"] .nao`).click(), semFonte);
await pag.waitForTimeout(500);
await pag.evaluate(ch => {
  const e = document.querySelector(`.item[data-ch="${CSS.escape(ch)}"] input.corr`);
  e.value = 'escrito por mim'; e.dispatchEvent(new Event('input', { bubbles: true }));
}, semFonte);
await pag.waitForTimeout(400);
await pag.click('#gerar');
await pag.waitForTimeout(600);
const recado2 = await pag.inputValue('#saida');
confere('o recado separa o que ele escreveu do que ele corrigiu',
  /TRANSLITERAÇÕES QUE EU ESCREVI/.test(recado2) && /escrito por mim/.test(recado2),
  recado2.slice(0, 220));
await pag.click('#continuar');
await pag.waitForTimeout(500);

// ---------- alemao e hebraico: transliteracao nem aparece ----------
for (const lg of ['de', 'he']) {
  await pag.selectOption('#lingua', lg);
  await pag.waitForTimeout(1300);
  const r2 = await contar();
  confere(`em ${lg} a transliteracao nao e pedida`,
    !r2.tipos.tl && !r2.tipos['tl-falta'], JSON.stringify(r2.tipos));
}

// ---------- lingua velha guardada no aparelho ----------
await pag.evaluate(() => localStorage.setItem('revisar_lingua', 'klingon'));
await pag.reload();
await pag.waitForTimeout(2500);
const recuperado = await pag.evaluate(() => ({
  valor: document.getElementById('lingua').value,
  andamento: document.getElementById('andamento').textContent,
  falta: [...document.querySelectorAll('.item[data-ch]')]
    .filter(i => i.dataset.ch.startsWith('tl-falta')).length,
}));
confere('lingua invalida guardada no aparelho nao quebra a pagina',
  !!recuperado.valor && !/undefined/.test(recuperado.andamento) && recuperado.falta <= 20,
  JSON.stringify(recuperado));

// ---------- portugues ----------
await pag.selectOption('#lingua', 'pt');
await pag.waitForTimeout(1300);
const pt = await contar();
// Desde 23/08 o portugues TEM transliteracao para conferir, a pedido do Erez.
// E a original: nao existe "falta fonte" nela — toda palavra ja tem a sua.
confere('em portugues ha traducoes E transliteracao',
  pt.tipos.trad > 0 && pt.tipos.glosa > 0 && pt.tipos.tl > 0,
  JSON.stringify(pt.tipos));
confere('e nenhuma palavra em portugues aparece como "falta fonte"',
  !pt.tipos['tl-falta'], JSON.stringify(pt.tipos));
const linhasPt = await pag.evaluate(() =>
  document.querySelector('.item[data-ch]').querySelectorAll('.linha').length);
confere('e o cartao em portugues nao repete a mesma linha duas vezes', linhasPt === 1,
  `${linhasPt} linhas`);

// ---------- tela ----------
const rolaLado = await pag.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
confere('nao rola de lado no celular', !rolaLado);
confere('nenhum erro de console', erros.length === 0, erros[0] || '');

await navegador.close();
console.log(falhas ? `\n${falhas} problema(s) na pagina de revisao`
                   : '\nVERDE: a pagina de revisao passou');
process.exit(falhas ? 1 : 0);
