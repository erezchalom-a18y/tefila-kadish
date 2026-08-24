/**
 * testar-sincronia.mjs — a pagina que mostra a voz (sincronia.html).
 *
 * O que ela tem que garantir, e por que:
 *
 *  1. O desenho existe para os 8 e bate com o audio. Sem sinal/<alvo>.json a
 *     pagina nao desenha nada.
 *
 *  2. A CONTA DA PAGINA E A MESMA DA MEDIDA. Esta e a checagem que importa. Na
 *     primeira versao a pagina acusou 48 suspeitas num Kadish onde o
 *     medir-desvio.py via 6 — porque eu perguntava "caiu num silencio?" antes
 *     de olhar a distancia. Se ela acusar demais, o Erez vai arrastar palavra
 *     que estava certa, e o estrago vai para o ancoras.json, que e sagrado.
 *     Entao aqui a conta e refeita por fora, a partir de sync/ e sinal/, e tem
 *     que dar o mesmo numero que a tela mostra.
 *
 *  3. Arrastar funciona e nao grava em lugar nenhum: a pagina so monta um
 *     recado. A ancora entra depois, por script, com prova.
 *
 * Uso: node servidor-teste.mjs 8899 . &
 *      node testar-sincronia.mjs [http://127.0.0.1:8899/tefila-kadish]
 */
import { readFileSync, existsSync, statSync } from 'node:fs';

const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';
const TOLERANCIA = 0.15;
const ALVOS = ['ashkenaz', 'chabad', 'sefard', 'sefaradi']
  .flatMap(n => ['yatom', 'derabanan'].map(t => `${n}_${t}`));

let problemas = 0;
const confere = (o, ok, det = '') => {
  console.log(`${ok ? 'OK  ' : 'FALHA'} ${o}${ok || !det ? '' : '\n        ' + det}`);
  if (!ok) problemas++;
};

// ---------- 1: os desenhos ----------
const faltando = ALVOS.filter(a => !existsSync(`sinal/${a}.json`));
confere('o desenho da voz existe para os 8', faltando.length === 0,
  faltando.join(', ') + '  (rode: python3 gerar-envelope.py)');
if (faltando.length) process.exit(1);

const sinais = Object.fromEntries(ALVOS.map(a => [a, JSON.parse(readFileSync(`sinal/${a}.json`, 'utf8'))]));
const sync = Object.fromEntries(ALVOS.map(a => [a, JSON.parse(readFileSync(`sync/${a}_sync.json`, 'utf8'))]));

const ruins = [];
for (const a of ALVOS) {
  const s = sinais[a], j = sync[a];
  const fim = Math.max(...j.versos.map(v => v.end));
  if (Math.abs(s.linha.length * s.passo - s.duracao) > 1)
    ruins.push(`${a}: o desenho tem ${(s.linha.length * s.passo).toFixed(1)}s e o audio ${s.duracao}s`);
  if (fim > s.duracao + 0.5) ruins.push(`${a}: o ultimo verso acaba aos ${fim}s, depois do audio (${s.duracao}s)`);
  if (!s.blocos.length || !s.inicios_de_voz.length) ruins.push(`${a}: sem blocos de voz`);
  if (statSync(`sinal/${a}.json`).size > 60 * 1024) ruins.push(`${a}: o desenho passou de 60 kB — pesado para o iPad`);
}
confere('cada desenho cobre o audio inteiro e e leve', ruins.length === 0, ruins.join('\n        '));

// ---------- a conta, feita por fora ----------
// Mesma regra do medir-desvio.py: o que vale e a distancia da palavra ate o
// comeco de voz mais proximo. Nada de silencio — isso e so explicacao, depois.
//
// A excecao de 24/08: palavra que comeca com a VOZ JA CORRENDO nao conta. O
// rabino diz "Yehe sheme" num folego so; o sinal ve um bloco; a segunda comeca
// no meio dele, e esta certa ali. Antes o alinhador empurrava toda palavra para
// um comeco de bloco — e era esse empurrao que jogava o Kadish inteiro uma
// palavra para a frente. Sem a excecao, esta conta acusaria 55 palavras num
// Kadish que acabou de ficar certo. A mesma excecao esta no sincronia.html
// (coladaNaDeTras) e no checar-sincronia.mjs.
const SOBRA = 0.10;   // no fio final do bloco a voz ja e da palavra de tras
function suspeitas(alvo) {
  const s = sinais[alvo];
  let n = 0;
  for (const v of sync[alvo].versos) for (const p of (v.palavras || [])) {
    let d = Infinity;
    for (const x of s.inicios_de_voz) { const dd = Math.abs(x - p.start); if (dd < d) d = dd; }
    if (d <= TOLERANCIA) continue;
    if (s.blocos.some(([a, z]) => p.start >= a && p.start <= z - SOBRA)) continue;
    n++;
  }
  return n;
}

// A marca publicada (versao.json) TEM que ser a mesma que veio dentro da
// pagina. Se sairem de sincronia, a pagina avisa "ha versao nova" para sempre,
// ou — pior — deixa de avisar quando devia. Este e o guarda de que eu nao
// esqueci de mexer nos dois.
const marcaPublicada = JSON.parse(readFileSync('versao.json', 'utf8')).marca;
const marcaDaPagina = (readFileSync('sincronia.html', 'utf8')
  .match(/const DADOS = '([^']+)'/) || [])[1];
confere('a marca do versao.json e a mesma do sincronia.html',
  marcaPublicada === marcaDaPagina,
  `versao.json: "${marcaPublicada}"  sincronia.html: "${marcaDaPagina}"`);

// ---------- 3: a pagina ----------
const CHROMIUM = process.env.CHROMIUM;
const { chromium } = await import('playwright').then(m => m.default || m);
const nav = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});
const pag = await nav.newPage({ viewport: { width: 820, height: 1180 }, hasTouch: true });
const erros = [];
pag.on('pageerror', e => erros.push('pageerror: ' + e.message));
pag.on('console', m => { if (m.type() === 'error' && !/fonts\.|ERR_CONNECTION_RESET/.test(m.text())) erros.push(m.text()); });

await pag.goto(`${BASE}/sincronia.html`);
await pag.waitForTimeout(2500);
confere('a pagina abre e desenha', await pag.locator('canvas').count() > 0);

// O pedido dos dados leva a marca no endereco. Sem isso o GitHub Pages devolve
// o JSON de ontem e o Erez fica vendo defeito que ja foi consertado — foi o que
// aconteceu com o raba: pagina nova, dados velhos.
const pedidos = [];
pag.on('request', r => { if (/\/(sync|sinal)\//.test(r.url())) pedidos.push(r.url()); });
await pag.selectOption('#alvo', 'sefard_yatom');
await pag.waitForTimeout(1400);
confere('o pedido dos dados leva a marca, para furar o cache do GitHub',
  pedidos.length > 0 && pedidos.every(u => /[?&]d=/.test(u)),
  pedidos.slice(0, 2).join('\n        ') || '(nenhum pedido)');
confere('e a marca aparece na tela, para dar para comparar',
  /dados \S+/.test(await pag.textContent('#andamento')), await pag.textContent('#andamento'));

// Marca nova apaga o que ele arrastou: aquilo foi decidido sobre outros numeros.
await pag.evaluate(() => {
  localStorage.setItem('sinc_dados', 'marca-de-ontem');
  localStorage.setItem('sinc_mex_sefard_yatom', JSON.stringify({ '1|0': 99.9 }));
});
await pag.reload();
await pag.waitForTimeout(2200);
confere('marca nova joga fora o que foi arrastado sobre dados velhos',
  (await pag.evaluate(() => localStorage.getItem('sinc_mex_sefard_yatom'))) === null,
  await pag.evaluate(() => localStorage.getItem('sinc_mex_sefard_yatom')));

for (const a of ALVOS) {
  await pag.selectOption('#alvo', a);
  await pag.waitForTimeout(1400);
  const txt = await pag.textContent('#andamento');
  const naTela = Number((txt.match(/·\s*(\d+) para olhar/) || [])[1]);
  const porFora = suspeitas(a);
  confere(`${a.padEnd(20)} ${String(porFora).padStart(3)} suspeitas — a tela diz o mesmo`,
    naTela === porFora, `tela: "${txt}"`);
}

// Sobra de sessao anterior NAO pode virar correcao. Foi assim que o Erez
// mandou um recado inteiro de 70 linhas dizendo "estava 27.66s, ponha em
// 27.66s": ele arrastou, eu apliquei as ancoras, o arquivo alcancou aqueles
// numeros — e o que estava guardado no aparelho continuou contando.
await pag.selectOption('#alvo', 'chabad_yatom');
await pag.waitForTimeout(1200);
await pag.evaluate(() => {
  // planta no aparelho exatamente o que o arquivo ja diz, e um encostao de 0,02s
  const ps = palavras().slice(0, 5);
  const m = {};
  ps.forEach((p, k) => { m[`${p.verso}|${p.i}`] = k === 0 ? p.start + 0.02 : p.start; });
  localStorage.setItem('sinc_mex_chabad_yatom', JSON.stringify(m));
});
await pag.reload();
await pag.waitForTimeout(2200);
const sobra = await pag.textContent('#contagem');
confere('sobra do aparelho igual ao arquivo nao conta como correcao',
  sobra === 'nada arrastado ainda', `contagem: "${sobra}"`);
await pag.click('#gerar');
await pag.waitForTimeout(500);
const recadoVazio = await pag.inputValue('#saida');
confere('e o recado nao lista "estava X, ponha em X"',
  /Nada a mudar/.test(recadoVazio) && !/ponha em/.test(recadoVazio),
  recadoVazio.slice(0, 160));
await pag.click('#continuar');
await pag.waitForTimeout(600);
confere('a velharia e apagada do aparelho, nao so escondida',
  (await pag.evaluate(() =>
    Object.keys(JSON.parse(localStorage.getItem('sinc_mex_chabad_yatom') || '{}')).length)) === 0);

// O ARRASTO DELE NAO PODE PASSAR POR LEITURA DO ARQUIVO.
// Tres vezes o Erez leu como defeito do arquivo o que era arrasto dele — a
// ultima com 9 arrastos na tela, dizendo "veytpaer e falado no verso 8", e o
// arquivo estava certo. A pagina tem que gritar isso.
await pag.selectOption('#alvo', 'chabad_derabanan');
await pag.waitForTimeout(1400);
await pag.evaluate(() => {
  const p = palavras()[0];
  const m = {}; m[`${p.verso}|${p.i}`] = p.start + 3;
  localStorage.setItem('sinc_mex_chabad_derabanan', JSON.stringify(m));
});
await pag.reload(); await pag.waitForTimeout(2200);
confere('com arrasto na tela, a pagina avisa em letra grande',
  (await pag.locator('#desfazerTudo').count()) === 1 &&
  /Você arrastou 1 palavra/.test(await pag.locator('#corpo').innerText()));
confere('e oferece ver o arquivo sem os arrastos',
  (await pag.locator('#verArquivo').count()) === 1);
await pag.locator('#verArquivo').click();
await pag.waitForTimeout(700);
confere('"ver o arquivo" tira o aviso e mostra o arquivo',
  (await pag.locator('#desfazerTudo').count()) === 0);
await pag.reload(); await pag.waitForTimeout(2200);
confere('e o que ele arrastou nao se perdeu ao ver o arquivo',
  (await pag.locator('#desfazerTudo').count()) === 1);
await pag.locator('#desfazerTudo').click();
await pag.waitForTimeout(700);
confere('"desfazer tudo" limpa mesmo',
  (await pag.locator('#desfazerTudo').count()) === 0 &&
  Object.keys(JSON.parse(await pag.evaluate(() =>
    localStorage.getItem('sinc_mex_chabad_derabanan') || '{}'))).length === 0);

// A pista que achou o tushbechata: palavra que engole a seguinte.
// O veshirata ia de 50.52 a 53.22 e tinha, la dentro, 0,84s de silencio e
// depois o bloco 52.30-53.14 — que era o tushbechata inteiro. O Erez ouviu
// ("so da para ouvir o ultimo A") e o sinal confirmou. Aqui a regra e cobrada
// em cima de palavras inventadas, para nao depender de defeito que um dia sera
// consertado — o chabad_yatom ja nao tem nenhum.
await pag.selectOption('#alvo', 'chabad_yatom');
await pag.waitForTimeout(1400);
const engolir = await pag.evaluate(() => {
  const b = desenho.blocos;
  // acha um par de blocos com um silencio grande entre eles
  let par = null;
  for (let k = 1; k < b.length; k++) if (b[k][0] - b[k - 1][1] >= 0.5) { par = [b[k - 1], b[k]]; break; }
  if (!par) return { semPar: true };
  const engole = { verso: -1, i: 0, start: par[0][0] - 0.02, end: par[1][1] + 0.02 };
  const certa  = { verso: -1, i: 1, start: par[0][0] - 0.02, end: par[0][1] + 0.02 };
  return { engole: !!engolindo(engole), certa: !!engolindo(certa),
           silencio: +(par[1][0] - par[0][1]).toFixed(2) };
});
confere('acusa a palavra que engole a seguinte',
  engolir.engole === true, JSON.stringify(engolir));
confere('e nao acusa a palavra que cobre so a propria voz',
  engolir.certa === false, JSON.stringify(engolir));

// A pista que o Erez deu tres vezes: "so da para ouvir o 'ra' do raba".
// O VERSO acaba no MEIO de um bloco de voz — a ultima palavra dele sai cortada.
//
// Desde 24/08 isto se mede no fim do VERSO, nao no fim de cada palavra: e o
// verso que ele toca no app, e as queixas dele sempre foram de verso. Medindo
// palavra a palavra, todo par que o rabino diz colado ("Yehe sheme", um bloco
// de voz so) aparecia como partido, porque o fim da primeira cai dentro da voz
// por construcao. Por isso o teste agora usa um verso de verdade e confere as
// duas pontas: acusa quando e a ULTIMA palavra do verso, e nao acusa quando e
// uma do meio.
const cortar = await pag.evaluate(() => {
  const b = desenho.blocos.find(([a, z]) => z - a > 0.4);
  const v = sync.versos.find(x => x.palavras.length > 2);
  const ultima = v.palavras[v.palavras.length - 1].i;
  const doMeio = v.palavras[1].i;
  const fimNoMeio = { verso: v.n, i: ultima, start: b[0], end: (b[0] + b[1]) / 2 };
  const inteira   = { verso: v.n, i: ultima, start: b[0], end: b[1] + 0.05 };
  const colada    = { verso: v.n, i: doMeio, start: b[0], end: (b[0] + b[1]) / 2 };
  return { meio: !!cortada(fimNoMeio), inteira: !!cortada(inteira),
           colada: !!cortada(colada),
           semVoz: muda({ verso: v.n, i: ultima, start: b[1] + 0.02, end: b[1] + 0.06 }) };
});
confere('acusa o verso que acaba no meio da voz (o "ra" do raba)',
  cortar.meio === true, JSON.stringify(cortar));
confere('e nao acusa o verso que pega o bloco inteiro',
  cortar.inteira === false, JSON.stringify(cortar));
confere('e nao acusa palavra do MEIO do verso que acaba dentro da voz (colada)',
  cortar.colada === false, JSON.stringify(cortar));
confere('acusa a palavra sem voz nenhuma dentro',
  cortar.semVoz === true, JSON.stringify(cortar));

// arrastar
await pag.selectOption('#alvo', 'chabad_yatom');
await pag.waitForTimeout(1400);
const cv = pag.locator('canvas').first();
const cx = await cv.boundingBox();
const antesTxt = await pag.textContent('#contagem');
// Mirar no meio do desenho nao serve: ali pode nao haver risco nenhum, e a
// pagina so pega o arrasto perto de um. Entao pergunto a ela onde esta o
// primeiro risco deste verso e ponho o dedo em cima dele.
const fracao = await pag.evaluate(() => {
  const c = document.querySelector('canvas');
  const p = c._ps[0];
  return (p.start - c._t0) / (c._t1 - c._t0);
});
const xRisco = cx.x + cx.width * fracao;
await pag.mouse.move(xRisco, cx.y + cx.height / 2);
await pag.mouse.down();
await pag.mouse.move(xRisco + 30, cx.y + cx.height / 2, { steps: 6 });
await pag.mouse.up();
await pag.waitForTimeout(500);
const depoisTxt = await pag.textContent('#contagem');
confere('arrastar um risco conta como correcao', depoisTxt !== antesTxt,
  `antes: "${antesTxt}" depois: "${depoisTxt}"`);

// Um cutucao de nada NAO pode contar como correcao. Foi assim que 49 das 71
// "correcoes" da primeira rodada do Erez nasceram: o risco encosta sozinho no
// comeco de voz mais proximo, e so encostar o dedo ja mexia 0,02s. Ninguem
// escuta 0,02s, e cada uma viraria uma ancora a toa.
const antesCutucao = await pag.textContent('#contagem');
await pag.mouse.move(xRisco + 200, cx.y + cx.height / 2);
const xOutro = await pag.evaluate(() => {
  const c = document.querySelector('canvas');
  const p = c._ps[1] || c._ps[0];
  return (p.start - c._t0) / (c._t1 - c._t0);
});
await pag.mouse.move(cx.x + cx.width * xOutro, cx.y + cx.height / 2);
await pag.mouse.down();
await pag.mouse.move(cx.x + cx.width * xOutro + 2, cx.y + cx.height / 2, { steps: 2 });
await pag.mouse.up();
await pag.waitForTimeout(400);
confere('um cutucao de nada NAO vira correcao',
  (await pag.textContent('#contagem')) === antesCutucao,
  `antes: "${antesCutucao}" depois: "${await pag.textContent('#contagem')}"`);

// empurrar o verso inteiro: um gesto para dizer "este verso esta um bloco fora"
await pag.evaluate(() => localStorage.clear());
await pag.reload(); await pag.waitForTimeout(2200);
// Desde a fita continua (24/08) uma faixa do desenho e de TEMPO, nao de verso:
// ela pode conter palavras de dois versos, ou meio verso. Entao o numero de
// palavras do verso empurrado vem do proprio verso, nao do primeiro desenho.
const versoEmpurrado = await pag.evaluate(() =>
  document.querySelectorAll('button[data-empurrar]')[1].dataset.empurrar);
const nPalavras = await pag.evaluate(n =>
  sync.versos.find(v => String(v.n) === n).palavras.length, versoEmpurrado);
await pag.locator('button[data-empurrar]').nth(1).click();   // um bloco a frente
await pag.waitForTimeout(700);
const movidas = await pag.evaluate(() =>
  Object.keys(JSON.parse(localStorage.getItem('sinc_mex_chabad_yatom') || '{}')).length);
confere('empurrar o verso move todas as palavras dele de uma vez',
  movidas === nPalavras, `${movidas} de ${nPalavras} palavras`);
const tempos = await pag.evaluate(() =>
  Object.values(JSON.parse(localStorage.getItem('sinc_mex_chabad_yatom') || '{}')));
confere('e nenhuma palavra fica no mesmo segundo que a vizinha',
  new Set(tempos).size === tempos.length, JSON.stringify(tempos));
// O desfazer TEM que ser o do mesmo verso: depois do empurrao aparecem versos
// novos na lista (ficaram com palavra partida), e o primeiro botao da tela ja
// nao e o deste verso. O teste caiu nessa uma vez.
await pag.locator(`button[data-devolver="${versoEmpurrado}"]`).click();
await pag.waitForTimeout(500);
confere('e o desfazer devolve o verso inteiro',
  (await pag.evaluate(() =>
    Object.keys(JSON.parse(localStorage.getItem('sinc_mex_chabad_yatom') || '{}')).length)) === 0);

// refaz um arrasto de verdade, para as checagens seguintes terem o que ver.
// A caixa do desenho e medida DE NOVO: entre um passo e outro a pagina cresce e
// encolhe (o aviso de arrasto, a lista do que olhar), e mirar na medida velha
// punha o dedo fora do desenho. O teste passava sem arrastar nada, e so o
// recado, la na frente, denunciava: "0 correcoes".
// Voltar ao topo ANTES de medir: os botoes de verso agora ficam no fim da
// pagina, e clicar num deles rola a tela. A caixa do primeiro desenho vinha
// com y negativo — fora da janela — e o dedo caia no nada.
await pag.evaluate(() => scrollTo(0, 0));
await pag.waitForTimeout(300);
const cx2 = await pag.locator('canvas').first().boundingBox();
const fracao2 = await pag.evaluate(() => {
  const c = document.querySelector('canvas');
  const p = c._ps[0];
  return (p.start - c._t0) / (c._t1 - c._t0);
});
const xRisco2 = cx2.x + cx2.width * fracao2;
await pag.mouse.move(xRisco2, cx2.y + cx2.height / 2);
await pag.mouse.down();
await pag.mouse.move(xRisco2 + 30, cx2.y + cx2.height / 2, { steps: 6 });
await pag.mouse.up();
await pag.waitForTimeout(500);
const depoisTxt2 = await pag.textContent('#contagem');
confere('o arrasto refeito realmente pegou',
  depoisTxt2 !== 'nada arrastado ainda', `contagem: "${depoisTxt2}"`);

// sobrevive a recarregar
await pag.reload();
await pag.waitForTimeout(2200);
confere('o que ele arrastou sobrevive a fechar e abrir',
  (await pag.textContent('#contagem')) === depoisTxt2,
  `ficou: "${await pag.textContent('#contagem')}"`);

// o recado
await pag.click('#gerar');
await pag.waitForTimeout(500);
const recado = await pag.inputValue('#saida');
confere('o recado traz o segundo antigo e o novo',
  /estava: /.test(recado) && /ponha em: /.test(recado), recado.slice(0, 200));
await pag.click('#copiar');
await pag.waitForTimeout(250);
confere('o botao Copiar responde e nao estoura',
  (await pag.textContent('#copiar')).includes('Copiado'));
await pag.click('#continuar');
await pag.waitForTimeout(600);
confere('e o Voltar traz os versos de volta', await pag.locator('canvas').count() > 0);

// a regra de ouro: a pagina NAO escreve nos dados
const tocouArquivo = await pag.evaluate(() =>
  Object.keys(localStorage).filter(k => k.startsWith('sinc_')).length > 0);
confere('a pagina so guarda no aparelho (nada vai para sync/ nem para as ancoras)', tocouArquivo);

// Com a marca publicada diferente, a pagina TEM que avisar. E o que salva o
// Erez de ficar olhando uma tela de ontem sem saber.
await pag.route('**/versao.json*', r =>
  r.fulfill({ contentType: 'application/json', body: '{"marca":"marca-mais-nova"}' }));
await pag.reload();
await pag.waitForTimeout(2400);
confere('avisa quando ha versao mais nova publicada',
  (await pag.locator('#atualizar').count()) === 1);
await pag.locator('#atualizar').click();
await pag.waitForTimeout(2400);
confere('e o botao leva para um endereco que o cache nao tem',
  /[?&]v=marca-mais-nova/.test(pag.url()), pag.url());
await pag.unroute('**/versao.json*');
await pag.goto(`${BASE}/sincronia.html`);
await pag.waitForTimeout(2400);
confere('com a marca igual, nao avisa nada',
  (await pag.locator('#atualizar').count()) === 0);

confere('nao rola de lado', !(await pag.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
confere('nenhum erro de console', erros.length === 0, erros[0] || '');

await nav.close();
console.log(problemas ? `\n${problemas} problema(s) na pagina de sincronia`
                      : '\nVERDE: a pagina de sincronia passou');
process.exit(problemas ? 1 : 0);
