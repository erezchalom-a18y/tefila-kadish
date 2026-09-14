/**
 * gerar-display.mjs — os cartoes de 10 x 15 cm, em display/kadish-<forma>-<lingua>.pdf
 *
 * O cartao de mesa (display.html) e irmao do panfleto A4: mesmas palavras, vindas
 * do mesmo textos-impressos.js, outra distancia de leitura. Ele (11/09) pediu as
 * tres formas curtas e depois as completas: "achei que ficou muito curto, favor
 * incluir as explicacoes e mais features".
 *
 *   A  o codigo e mais nada
 *   B  o codigo e tres passos
 *   C  o Kadish em hebraico, depois o codigo
 *   D  COMPLETA — tudo o que a folha A4 diz, em duas colunas
 *   E  COMPLETA com o hebraico
 *   R  PARA O RABINO (14/09) — outro leitor, nao a D com uma linha a mais
 *   S  DISCRETA (14/09) — o conteudo do A4 num 10x15, com a voz mais baixa
 *
 * PROVAS antes de gravar, e sao as mesmas do panfleto mais uma:
 *   1. o QR e LIDO DE DENTRO DO PDF, a 200 dpi, e tem de devolver o endereco.
 *   2. uma pagina so, no tamanho exato de 100 x 150 mm.
 *   3. NADA TRANSBORDA o cartao — e a pergunta e "algum filho passa da borda de
 *      baixo?", nao "o scrollHeight cresceu?". O cartao tem overflow:hidden, e
 *      naquela conta um texto cortado aparece como se coubesse. Eu cai nessa na
 *      primeira volta.
 *   4. a nota do minyan nao sai DUAS VEZES. Tambem cai nessa: o rodape pegou o
 *      campo `nota` em vez do `rodape`, e a frase do minyan saiu na caixa e no
 *      pe do mesmo cartao. Nenhuma medida viu; a foto viu.
 *   5. na forma R, os quatro nussachim aparecem e a nota do minyan NAO — e o
 *      que separa o cartao do rabino do cartao de quem reza. Sem esta prova,
 *      um dia alguem "unifica" as formas e a R vira a D calada.
 *
 * Qualquer falha e ele NAO grava nada.
 *
 *   node gerar-display.mjs              → as 7 formas, nas 8 linguas
 *   node gerar-display.mjs R pt         → so o cartao do rabino, em portugues
 */
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, unlinkSync, renameSync } from 'node:fs';

const FORMAS = ['A', 'B', 'C', 'D', 'E', 'R', 'S', 'M'];
const LINGUAS = ['pt', 'en', 'es', 'fr', 'it', 'de', 'ru', 'he'];
const ENDERECO = 'https://kadish.app/';
const PORTA = 8965;

const args = process.argv.slice(2);
const formas = args.filter(x => FORMAS.includes(x.toUpperCase())).map(x => x.toUpperCase());
const linguas = args.filter(x => LINGUAS.includes(x));
const alvoF = formas.length ? formas : FORMAS;
const alvoL = linguas.length ? linguas : LINGUAS;

const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const servidor = spawn('node', ['servidor-teste.mjs', String(PORTA)], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 1400));
mkdirSync('display', { recursive: true });
const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});

let falhas = 0;
const provisorios = [];
for (const f of alvoF) {
  for (const lang of alvoL) {
    const pag = await navegador.newPage({ viewport: { width: 460, height: 900 } });
    const erros = [];
    pag.on('pageerror', e => erros.push(e.message));
    await pag.goto(`http://127.0.0.1:${PORTA}/tefila-kadish/display.html?f=${f}&lang=${lang}`,
                   { waitUntil: 'networkidle' });
    await pag.waitForTimeout(350);
    const tmp = `display/.${f}-${lang}.tmp.pdf`;
    await pag.pdf({ path: tmp, width: '100mm', height: '150mm', printBackground: true,
                    margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    provisorios.push(tmp);

    const tela = await pag.evaluate(() => {
      const c = document.querySelector('.cartao');
      const cr = c.getBoundingClientRect();
      const filhos = [...c.querySelectorAll('*')].filter(e => e.getBoundingClientRect().height > 0);
      const maisBaixo = Math.max(...filhos.map(e => e.getBoundingClientRect().bottom));
      const nota = (document.querySelector('.nota-minyan, .nota-calada') || {}).textContent || '';
      const rodape = (document.querySelector('.rodape') || {}).textContent || '';
      return {
        folga: Math.round(cr.bottom - maisBaixo),
        repetiu: !!(nota && rodape && nota.trim().slice(0, 25) === rodape.trim().slice(0, 25)),
        temEndereco: c.textContent.includes('kadish.app'),
        temRitos: !!document.querySelector('.oito .ritos'),
        temNotaMinyan: !!document.querySelector('.nota-minyan'),
        temNotaCalada: !!document.querySelector('.nota-calada'),
        temHebraico: !!document.querySelector('.heb'),
        itens: document.querySelectorAll('.lista li').length,
      };
    });
    await pag.close();

    let prova;
    try {
      prova = JSON.parse(execFileSync('python3', ['-c', `
import json, pypdfium2 as pdfium, zxingcpp
d = pdfium.PdfDocument(${JSON.stringify(tmp)})
p = d[0]
img = p.render(scale=200/72).to_pil()
r = zxingcpp.read_barcode(img)
print(json.dumps({"paginas": len(d), "lido": r.text if r else None,
                  "mm": [round(x/72*25.4) for x in p.get_size()]}))
`], { encoding: 'utf8' }));
    } catch (e) { prova = { erro: String(e.stderr || e.message).split('\n').pop() }; }

    const problemas = [];
    if (erros.length) problemas.push('erro de console: ' + erros[0]);
    if (tela.folga < 0) problemas.push(`o conteudo passa ${-tela.folga}px da borda de baixo`);
    if (tela.repetiu) problemas.push('a nota do minyan saiu DUAS VEZES (caixa e rodape)');
    if (!tela.temEndereco) problemas.push('o endereco kadish.app nao aparece');
    // A forma R e do RABINO: ela existe para responder "tem o meu nussach?", e
    // nao para repetir a nota do minyan, que ele nao precisa que lhe expliquem.
    if (f === 'R' && !tela.temRitos) problemas.push('a forma R perdeu os oito Kadishim');
    if (f === 'R' && tela.temNotaMinyan) problemas.push('a forma R voltou a trazer a nota do minyan');
    // A forma M vai para a MAO DO ENLUTADO, no cemiterio. As tres provas dela
    // guardam as tres decisoes que a fazem ser ela, e nao a D com menos linhas.
    // Sem isto, um dia alguem "unifica" as formas e a M vira outra coisa calada.
    if (f === 'M' && !(tela.temNotaMinyan || tela.temNotaCalada))
      problemas.push('a forma M perdeu a nota do minyan — e ela e para quem pode tentar rezar sozinho');
    if (f === 'M' && tela.temHebraico)
      problemas.push('a forma M ganhou o Kadish em hebraico — cartao de bolso e dobrado, e isso e do rabino');
    if (f === 'M' && tela.itens !== 3)
      problemas.push(`a forma M tem ${tela.itens} itens, e sao TRES — ninguem no cemiterio le mais`);
    if (prova.erro) problemas.push('nao consegui ler o PDF: ' + prova.erro);
    else {
      if (prova.paginas !== 1) problemas.push(`${prova.paginas} paginas, tem de ser 1`);
      if (prova.lido !== ENDERECO) problemas.push(`o QR do PDF le "${prova.lido}"`);
      const [l, a] = prova.mm;
      if (l !== 100 || a !== 150) problemas.push(`saiu ${l}x${a}mm, esperava 100x150`);
    }
    console.log(`${problemas.length ? 'FALHA' : 'OK   '} ${f}/${lang}` +
      (problemas.length ? '\n        ' + problemas.join('\n        ') : ''));
    if (problemas.length) falhas++;
  }
}
await navegador.close();
servidor.kill();

if (falhas) {
  for (const t of provisorios) if (existsSync(t)) unlinkSync(t);
  console.log(`\nVERMELHO: ${falhas} cartao(oes) com problema. Nao gravei nada.`);
  process.exit(1);
}
for (const t of provisorios) {
  renameSync(t, t.replace(/\/\.(\w)-(\w\w)\.tmp\.pdf$/, '/kadish-$1-$2.pdf'));
}
console.log(`\nVERDE: ${provisorios.length} cartao(oes) em display/, ` +
            `e o QR de cada um foi lido de dentro do PDF.`);
