/**
 * gerar-cemiterio.mjs — o folheto da Chevra Kadisha, em cemiterio/.
 *
 * Ele, em 14/09: "gostaria de criar um folheto para ser distribuido no
 * cemiterio, incentivando a pessoa a falar o kadish pelo ente querido".
 *
 * A5 (148 x 210 mm), UMA face. Ver o cabecalho do cemiterio.html para o
 * porque de cada decisao — em resumo: o corpo do papel e TEXTO DELE, lido do
 * aprender.json, e nao texto meu.
 *
 * PROVA ANTES DE GRAVAR, e sao cinco. Qualquer falha e ele nao grava NADA:
 * escreve em provisorios e so renomeia no fim.
 *
 *   1. O QR e LIDO DE VOLTA de dentro do PDF, a 200 dpi, como uma impressora
 *      caseira faria, e tem de devolver exatamente o endereco do app. Um QR so
 *      se descobre quebrado com o papel ja distribuido — e ali ninguem avisa.
 *   2. UMA pagina. Ele pediu simples, e duas faces ja tinham sido demais.
 *   3. O tamanho exato: 148 x 210 mm.
 *   4. Nada passando da borda de baixo, nas DUAS faces. (A pergunta certa e
 *      "algum filho passa da borda?", nunca o scrollHeight — a face tem
 *      overflow:hidden, onde texto cortado aparece como se coubesse. Foi o
 *      erro de 11/09.)
 *   5. E A QUE MAIS IMPORTA: o texto dele saiu no papel PALAVRA POR PALAVRA
 *      como esta no aprender.json. Se um dia alguem "melhorar" uma frase dentro
 *      do HTML, esta linha fica vermelha. E a mesma guarda do
 *      testar-aprender.mjs, aplicada ao papel.
 *
 * Uso:
 *   node gerar-cemiterio.mjs            -> as 8 linguas
 *   node gerar-cemiterio.mjs pt         -> so o portugues
 *
 * Requer, alem do Playwright: pip install pypdfium2 zxing-cpp pillow
 */
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, unlinkSync, existsSync, renameSync, readFileSync } from 'node:fs';

const LINGUAS = ['pt', 'en', 'es', 'fr', 'it', 'de', 'ru', 'he'];
const ENDERECO = 'https://kadish.app/';
const PORTA = 8914;
const SECOES = [1];   // a mesma do cemiterio.html, por POSICAO

const pedidas = process.argv.slice(2).filter(x => LINGUAS.includes(x));
const alvo = pedidas.length ? pedidas : LINGUAS;

const dados = JSON.parse(readFileSync('aprender.json', 'utf8'));
const normal = s => s.replace(/\s+/g, ' ').trim();

const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const servidor = spawn('node', ['servidor-teste.mjs', String(PORTA)], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 1300));

mkdirSync('cemiterio', { recursive: true });
const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});

let falhas = 0;
const provisorios = [];
for (const lang of alvo) {
  const pag = await navegador.newPage({ viewport: { width: 700, height: 1100 } });
  const erros = [];
  pag.on('pageerror', e => erros.push(e.message));
  await pag.goto(`http://127.0.0.1:${PORTA}/tefila-kadish/cemiterio.html?lang=${lang}`,
                 { waitUntil: 'networkidle' });
  await pag.waitForFunction(() => document.body.dataset.pronto === '1', null, { timeout: 8000 })
           .catch(() => erros.push('a pagina nao terminou de montar'));
  await pag.waitForTimeout(400);

  const tmp = `cemiterio/.${lang}.tmp.pdf`;
  await pag.pdf({ path: tmp, width: '148mm', height: '210mm', printBackground: true });
  provisorios.push(tmp);

  const tela = await pag.evaluate(() => {
    const faces = [...document.querySelectorAll('.face')];
    const folga = faces.map(f => {
      const cr = f.getBoundingClientRect();
      const baixo = [...f.children].reduce((m, e) => Math.max(m, e.getBoundingClientRect().bottom), 0);
      return Math.round(cr.bottom - baixo);
    });
    return {
      folga,
      faces: faces.length,
      // innerText, NUNCA textContent. O corpo e desenhado em <p>, e o
      // textContent cola os paragrafos sem espaco nenhum
      // ("...significativo.Nao e apenas...") — entao a comparacao com o
      // aprender.json falhava por uma diferenca que nao existe no papel.
      // O innerText poe a quebra onde o bloco termina, que e o que o OLHO ve.
      texto: faces.map(f => f.innerText).join('\n'),
      temEndereco: document.body.textContent.includes('kadish.app'),
    };
  });
  await pag.close();

  let prova;
  try {
    prova = JSON.parse(execFileSync('python3', ['-c', `
import json, pypdfium2 as pdfium, zxingcpp
d = pdfium.PdfDocument(${JSON.stringify(tmp)})
img = d[0].render(scale=200/72).to_pil()
r = zxingcpp.read_barcode(img)
print(json.dumps({"paginas": len(d), "lido": r.text if r else None,
                  "mm": [round(x/72*25.4) for x in d[0].get_size()]}))
`], { encoding: 'utf8' }));
  } catch (e) { prova = { erro: String(e.stderr || e.message).split('\n').pop() }; }

  const problemas = [];
  if (erros.length) problemas.push('erro de console: ' + erros[0]);
  if (tela.faces !== 1) problemas.push(`${tela.faces} faces, tem de ser 1`);
  tela.folga.forEach((f, i) => {
    if (f < 0) problemas.push(`a face ${i + 1} passa ${-f}px da borda de baixo`);
  });
  if (!tela.temEndereco) problemas.push('o endereco kadish.app nao aparece');

  // A prova que existe por causa da regra 5: o texto DELE, palavra por palavra.
  const naTela = normal(tela.texto);
  for (const i of SECOES) {
    const s = dados.secoes[i];
    const corpo = s.corpo[lang] || s.corpo.pt;
    if (!naTela.includes(normal(corpo)))
      problemas.push(`a secao ${i} ("${s.titulo.pt}") NAO saiu igual ao aprender.json`);
    if (s.origem !== 'erez')
      problemas.push(`a secao ${i} deixou de ser texto dele (origem=${s.origem})`);
  }

  if (prova.erro) problemas.push('nao consegui ler o PDF: ' + prova.erro);
  else {
    if (prova.paginas !== 1) problemas.push(`${prova.paginas} paginas no PDF, tem de ser 1`);
    if (prova.lido !== ENDERECO) problemas.push(`o QR do PDF le "${prova.lido}"`);
    const [l, a] = prova.mm;
    if (l !== 148 || a !== 210) problemas.push(`o PDF mede ${l}x${a}mm, e sao 148x210`);
  }

  if (problemas.length) { falhas++; console.log('FALHA ' + lang); problemas.forEach(p => console.log('        ' + p)); }
  else console.log('OK    ' + lang);
}

await navegador.close();
servidor.kill();

if (falhas) {
  for (const t of provisorios) if (existsSync(t)) unlinkSync(t);
  console.log(`\nVERMELHO: ${falhas} folheto(s) com problema. Nao gravei nada.`);
  process.exit(1);
}
for (const t of provisorios) renameSync(t, t.replace(/\.(\w+)\.tmp\.pdf$/, 'kadish-cemiterio-$1.pdf').replace('/.', '/'));
console.log(`\nVERDE: ${provisorios.length} folheto(s) em cemiterio/, e o QR de cada um foi lido de dentro do PDF.`);
