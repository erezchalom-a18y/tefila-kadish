/**
 * testar-aprender.mjs — A PAGINA APRENDER, E O TEXTO QUE E DELE
 * =============================================================
 *
 * Em 03/09 o Erez escreveu o texto do "Por que dizemos o Kadish?" e pediu para
 * traduzi-lo nas outras 7. O portugues e DELE; as outras sete sao traducao de
 * maquina e ainda nao foram revistas por humano.
 *
 * Esta checagem existe por causa da regra 5 das inviolaveis — a autoridade e o
 * rabino e o Erez, nunca o modelo — e por causa da regra 6, que manda tudo
 * existir nas 8 linguas. Ela cobra tres coisas, e a primeira e a que importa:
 *
 *   1. o PORTUGUES do arquivo e igual, palavra por palavra, ao que ele mandou
 *      (guardado em fontes/aprender-pt-2026-09-03.txt). Se alguem "melhorar" o
 *      texto dele, isto fica vermelho.
 *   2. as 8 linguas existem em toda secao, e nenhuma e o portugues disfarcado.
 *   3. a pagina monta as 8 secoes nas 8 linguas, sem erro de console e sem
 *      rolar de lado.
 *
 * O aviso de rascunho na tela SAIU em 10/09, a pedido dele. A checagem nao
 * afrouxou por isso: o que ela cobrava era que a pagina montasse o aviso, e
 * isso deixou de existir. O campo revisado_pelo_rabino continua no arquivo e
 * continua conferido aqui — o registro do estado nao saiu, so a legenda.
 *
 *   node testar-aprender.mjs [http://127.0.0.1:8896/tefila-kadish]
 */
import { readFileSync } from 'node:fs';

const L = ['pt', 'en', 'es', 'fr', 'it', 'de', 'ru', 'he'];
let falhas = 0;
const confere = (rotulo, ok, detalhe) => {
  console.log(`${ok ? 'OK   ' : 'FALHA'} ${rotulo}${ok || !detalhe ? '' : `\n        ${detalhe}`}`);
  if (!ok) falhas++;
};

const d = JSON.parse(readFileSync('aprender.json', 'utf8'));
const secoes = d.secoes || [];
confere('o aprender.json tem secoes', secoes.length > 0, 'esta vazio');

// ---------- 1. o portugues e o dele, palavra por palavra ----------
//
// 04/09 — toda secao passou a declarar a sua ORIGEM, e isto e o que da dentes a
// regra 5 aqui. Ate hoje a pagina inteira era texto do Erez e a comparacao
// pegava tudo. Nesse dia ele mandou acrescentar um bloco que NAO e dele
// ("devemos incluir a necessidade do minian em destaque e que seja recitado de
// pe"), e havia dois jeitos de acomodar isso: afrouxar a comparacao — que e o
// que a regra 3 proibe — ou dizer, secao a secao, de quem e o texto.
// Entao: a comparacao palavra por palavra cobre as secoes `origem: "erez"`, e
// nenhuma secao pode existir sem declarar origem. Quem quiser mudar uma palavra
// do texto dele continua ficando vermelho; quem acrescentar um bloco novo tem
// de assumi-lo por escrito no arquivo.
const semOrigem = [];
secoes.forEach((s, i) => { if (!s.origem) semOrigem.push(`secao ${i + 1}`); });
confere('toda secao declara de quem e o texto', !semOrigem.length, semOrigem.join(', '));

const palavras = t => (String(t).normalize('NFC').match(/\S+/g) || []);
const doErez = secoes.filter(s => s.origem === 'erez');
confere('as secoes dele continuam la', doErez.length === 10, `sao ${doErez.length}, e nao 10`);

// 15/09 — ERA UM ARQUIVO SO, E PASSARAM A SER DOIS. Ele mandou a historia de
// Rabi Akiva (fontes/aprender-pt-2026-09-15.txt) e ela entrou como quatro
// secoes, DEPOIS da primeira. Colar os dois arquivos e comparar de ponta a
// ponta nao serve: a ordem da PAGINA nao e a ordem dos arquivos, e a
// comparacao acusaria uma diferenca que nao existe.
//
// Entao a conta mudou de forma, e NAO afrouxou: cada secao dele e casada com o
// SEU bloco no arquivo-fonte, pelo titulo, e comparada palavra por palavra.
// Alem disso ninguem pode sobrar de nenhum lado — nem secao na pagina sem
// bloco escrito, nem bloco escrito que sumiu da pagina. Antes uma secao podia
// ser reordenada sem ninguem ver; agora nao.
const FONTES = ['fontes/aprender-pt-2026-09-03.txt', 'fontes/aprender-pt-2026-09-15.txt'];
const titulos = new Set(doErez.map(s => s.titulo.pt));
const blocos = new Map();
for (const arq of FONTES) {
  let atual = null;
  for (const linha of readFileSync(arq, 'utf8').split('\n')) {
    const l = linha.trim();
    if (titulos.has(l)) { atual = l; blocos.set(l, [l]); }
    else if (atual && l) blocos.get(atual).push(l);
  }
}

const semBloco = doErez.filter(s => !blocos.has(s.titulo.pt)).map(s => s.titulo.pt);
confere('toda secao dele tem o texto guardado num arquivo-fonte',
        !semBloco.length, semBloco.join(' · '));
// 15/09 — a primeira versao desta linha perguntava se sobrava bloco sem secao,
// e ELA NUNCA PODERIA FICAR VERMELHA: os blocos sao recortados pelos titulos das
// proprias secoes, entao um bloco orfao simplesmente nao era recortado. Uma
// checagem que so sabe passar nao mede nada — e a mesma licao do vigia de 13/09,
// pelo avesso. A pergunta que SABE falhar e a do TOTAL: tudo o que esta escrito
// nos arquivos-fonte tem de aparecer na pagina, ate a ultima palavra.
const totalFonte = FONTES.reduce((n, a) => n + palavras(readFileSync(a, 'utf8')).length, 0);
const totalCasado = doErez.reduce(
  (n, s) => n + (blocos.has(s.titulo.pt) ? palavras(blocos.get(s.titulo.pt).join(' ')).length : 0), 0);
confere('nada do que ele escreveu ficou de fora da pagina', totalFonte === totalCasado,
        `os arquivos tem ${totalFonte} palavras e a pagina cobre ${totalCasado}`);

let ondeDifere = '';
let totalPalavras = 0;
for (const s of doErez) {
  const bloco = blocos.get(s.titulo.pt);
  if (!bloco) continue;
  const dele = palavras(bloco.join(' '));
  const nosso = palavras(s.titulo.pt + ' ' + s.corpo.pt);
  totalPalavras += dele.length;
  if (ondeDifere) continue;
  if (dele.length !== nosso.length || dele.some((p, i) => p !== nosso[i])) {
    const i = dele.findIndex((p, k) => p !== nosso[k]);
    ondeDifere = `em "${s.titulo.pt}", palavra ${i + 1}: ele escreveu "${dele[i]}", ` +
                 `o arquivo tem "${nosso[i]}" (ele ${dele.length}, arquivo ${nosso.length})`;
  }
}
confere(`o portugues e o dele, palavra por palavra (${totalPalavras} palavras)`,
        !ondeDifere, ondeDifere);

// ---------- 2. as 8 linguas ----------
const faltando = [], disfarcado = [];
secoes.forEach((s, i) => {
  for (const campo of ['titulo', 'corpo']) {
    for (const l of L) if (!String(s[campo]?.[l] || '').trim()) faltando.push(`secao ${i + 1} ${campo}: ${l}`);
  }
  for (const l of L.filter(x => x !== 'pt')) {
    if (s.corpo[l] === s.corpo.pt) disfarcado.push(`secao ${i + 1}: ${l}`);
    if (s.titulo[l] === s.titulo.pt) disfarcado.push(`secao ${i + 1} titulo: ${l}`);
  }
});
confere('as 8 linguas existem em toda secao', !faltando.length, faltando.join(', '));
confere('e nenhuma delas e o portugues disfarcado', !disfarcado.length, disfarcado.join(', '));

// as sete linguas continuam sem revisao humana, e o arquivo tem de dizer isso.
// O aviso na TELA saiu a pedido dele (10/09); o registro no arquivo fica.
confere('o arquivo continua marcado como nao revisado pelo rabino',
  d.revisado_pelo_rabino === false,
  'esta true — so um humano pode pos isso, e entao esta linha da checagem sai');

// ---------- 3. a pagina ----------
const BASE = process.argv[2];
if (!BASE) {
  console.log('     (sem endereco: nao abri a pagina num navegador)');
} else {
  const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
  const { chromium } = pw.default || pw;
  const nav = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const pag = await nav.newPage();
  const erros = [];
  pag.on('pageerror', e => erros.push(e.message));
  for (const l of L) {
    await pag.goto(`${BASE}/aprender.html?lang=${l}`, { waitUntil: 'networkidle' });
    await pag.waitForTimeout(400);
    const r = await pag.evaluate(() => ({
      secoes: document.querySelectorAll('#conteudo section').length,
      aviso: !!document.querySelector('#conteudo .aviso'),   // saiu em 10/09: tem de ser FALSO
      vazio: !!document.querySelector('#conteudo .vazio'),
      texto: document.getElementById('conteudo').textContent.length,
      rolaDeLado: document.documentElement.scrollWidth > window.innerWidth + 1,
    }));
    const ok = r.secoes === secoes.length && !r.aviso && !r.vazio && r.texto > 2000 && !r.rolaDeLado;
    console.log(`${ok ? 'OK   ' : 'FALHA'}    ${l}: ${r.secoes} secoes · ${r.texto} letras` +
      `${r.aviso ? ' · o aviso de rascunho VOLTOU a tela' : ''}` +
      `${r.rolaDeLado ? ' · ROLA DE LADO' : ''}`);
    if (!ok) falhas++;
  }
  confere('nenhum erro de console nas 8', !erros.length, erros[0]);
  await nav.close();
}

console.log(falhas ? `\n${falhas} problema(s) na pagina Aprender` : '\nVERDE: o texto dele esta inteiro, nas 8 linguas');
process.exit(falhas ? 1 : 0);
