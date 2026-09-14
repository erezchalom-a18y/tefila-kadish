/**
 * gerar-panfleto.mjs — os 8 panfletos em PDF, em panfleto/kadish-<lingua>.pdf.
 *
 * O panfleto e a folha A4 do display da sinagoga (panfleto.html). Ele imprime
 * direto do navegador; estes PDFs existem para o Erez baixar do iPad sem
 * precisar abrir nada.
 *
 * DUAS PROVAS antes de gravar, e as duas ja pegaram coisa:
 *
 *  1. O QR e LIDO DE DENTRO DO PDF, renderizado a 200 dpi como uma impressora
 *     caseira faria, e tem de devolver exatamente o endereco do app. Um QR so
 *     se descobre quebrado com a folha ja pendurada na parede — e ai ninguem
 *     avisa, as pessoas so nao entram.
 *  2. Uma pagina so, e o endereco escrito NAO pode voltar (ele mandou tirar em
 *     10/09; ver o cabecalho do panfleto.html).
 *
 * Qualquer falha e ele nao grava nada.
 *
 *   node gerar-panfleto.mjs                 → os 8
 *   node gerar-panfleto.mjs pt he           → so os pedidos
 *
 * Precisa do servidor-teste.mjs (ele o sobe sozinho) e do Chromium do
 * Playwright. Sem os navegadores baixados: CHROMIUM=/caminho/do/chrome
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const LINGUAS = ['pt', 'en', 'es', 'fr', 'it', 'de', 'ru', 'he'];
const ENDERECO = 'https://kadish.app/';   // 11/09 — o dominio dele
const PORTA = 8912;

const pedidas = process.argv.slice(2).filter(x => LINGUAS.includes(x));
const alvo = pedidas.length ? pedidas : LINGUAS;

const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;

const servidor = spawn('node', ['servidor-teste.mjs', String(PORTA)], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 1300));

mkdirSync('panfleto', { recursive: true });
const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});

let falhas = 0;
const provisorios = [];
for (const lang of alvo) {
  const pag = await navegador.newPage({ viewport: { width: 860, height: 1200 } });
  const erros = [];
  pag.on('pageerror', e => erros.push(e.message));
  await pag.goto(`http://127.0.0.1:${PORTA}/tefila-kadish/panfleto.html?lang=${lang}`,
                 { waitUntil: 'networkidle' });
  await pag.waitForTimeout(400);
  const tmp = `panfleto/.${lang}.tmp.pdf`;
  await pag.pdf({ path: tmp, format: 'A4', printBackground: true });
  provisorios.push(tmp);
  const tela = await pag.evaluate(() => ({
    // 14/09 — ela contava os 5 itens do "O que o app faz". Ele reescreveu o
    // miolo como UMA sequencia de oito passos, e aquela lista deixou de
    // existir no papel. A pergunta mudou de alvo, e NAO afrouxou: continua
    // exigindo um numero exato, e agora exige que os oito estejam TODOS na
    // folha (antes ela nem olhava os passos) e que a numeracao va de 1 a 8 sem
    // buraco — que e o que quebra quando alguem parte a lista em duas colunas
    // com um numero escrito a mao.
    passos: [...document.querySelectorAll('.miolo .passo b')].map(b => b.textContent).join(','),
    passosTexto: [...document.querySelectorAll('.miolo .passo span')]
                   .filter(e => e.textContent.trim()).length,
    endereco: /erezchalom|kadish\.app/.test(document.body.textContent),
    // A instrucao do icone (10/09). Ele cobrou, com razao, que "com esse qr
    // code nao instala o icone no iphone" — nenhum QR instala nada, e o papel
    // tem de ensinar os dois toques que a Apple exige.
    icone: (document.getElementById('qrIcone') || {}).textContent || '',
  }));
  await pag.close();

  // a prova: abrir o PDF, renderizar e LER o codigo com uma camera de software
  let prova;
  try {
    prova = JSON.parse(execFileSync('python3', ['-c', `
import json, pypdfium2 as pdfium, zxingcpp
d = pdfium.PdfDocument(${JSON.stringify(tmp)})
img = d[0].render(scale=200/72).to_pil()
r = zxingcpp.read_barcode(img)
print(json.dumps({"paginas": len(d), "lido": r.text if r else None}))
`], { encoding: 'utf8' }));
  } catch (e) {
    prova = { erro: String(e.stderr || e.message).split('\n').pop() };
  }

  const problemas = [];
  if (erros.length) problemas.push('erro de console: ' + erros[0]);
  if (tela.endereco) problemas.push('o endereco escrito VOLTOU (ele mandou tirar em 10/09)');
  const esperado = [...Array(8)].map((_, i) => i + 1).join(',');
  if (tela.passos !== esperado)
    problemas.push(`os passos sao "${tela.passos}", esperava "${esperado}"`);
  if (tela.passosTexto !== 8)
    problemas.push(`${tela.passosTexto} passos com texto, esperava 8`);
  if (!/iPhone/.test(tela.icone) || !/Android/.test(tela.icone) || tela.icone.length < 80)
    problemas.push('falta a instrucao de como deixar o icone na tela (iPhone e Android)');
  if (prova.erro) problemas.push('nao consegui ler o PDF: ' + prova.erro +
    ' (falta pip install pypdfium2 zxing-cpp pillow?)');
  else {
    if (prova.paginas !== 1) problemas.push(`${prova.paginas} paginas, tem de ser 1`);
    if (prova.lido !== ENDERECO) problemas.push(`o QR do PDF le "${prova.lido}", e nao o endereco do app`);
  }
  console.log(`${problemas.length ? 'FALHA' : 'OK   '} ${lang}` +
    (problemas.length ? '\n        ' + problemas.join('\n        ') : ''));
  if (problemas.length) falhas++;
}
await navegador.close();
servidor.kill();

if (falhas) {
  for (const t of provisorios) if (existsSync(t)) unlinkSync(t);
  console.log(`\nVERMELHO: ${falhas} panfleto(s) com problema. Nao gravei nada.`);
  process.exit(1);
}
// so agora os provisorios viram os definitivos
const { renameSync } = await import('node:fs');
for (const t of provisorios) renameSync(t, t.replace(/\.(\w+)\.tmp\.pdf$/, 'kadish-$1.pdf').replace('/.', '/'));
console.log(`\nVERDE: ${alvo.length} panfleto(s) em panfleto/, e o QR de cada um foi lido de dentro do PDF.`);
