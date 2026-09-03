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
 *   3. a pagina monta as secoes e mostra o aviso de rascunho enquanto
 *      revisado_pelo_rabino for false.
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
const palavras = t => (String(t).normalize('NFC').match(/\S+/g) || []);
const dele = palavras(readFileSync('fontes/aprender-pt-2026-09-03.txt', 'utf8'));
const nosso = palavras(secoes.map(s => s.titulo.pt + ' ' + s.corpo.pt).join(' '));
let ondeDifere = '';
if (dele.length !== nosso.length || dele.some((p, i) => p !== nosso[i])) {
  const i = dele.findIndex((p, k) => p !== nosso[k]);
  ondeDifere = `na palavra ${i + 1}: ele escreveu "${dele[i]}", o arquivo tem "${nosso[i]}"` +
               ` (ele ${dele.length} palavras, arquivo ${nosso.length})`;
}
confere(`o portugues e o dele, palavra por palavra (${dele.length} palavras)`, !ondeDifere, ondeDifere);

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

// enquanto humano nenhum reviu as sete, a pagina TEM de avisar
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
      aviso: !!document.querySelector('#conteudo .aviso'),
      vazio: !!document.querySelector('#conteudo .vazio'),
      texto: document.getElementById('conteudo').textContent.length,
      rolaDeLado: document.documentElement.scrollWidth > window.innerWidth + 1,
    }));
    const ok = r.secoes === secoes.length && r.aviso && !r.vazio && r.texto > 2000 && !r.rolaDeLado;
    console.log(`${ok ? 'OK   ' : 'FALHA'}    ${l}: ${r.secoes} secoes · ${r.texto} letras` +
      `${r.aviso ? ' · avisa que e rascunho' : ' · SEM o aviso de rascunho'}` +
      `${r.rolaDeLado ? ' · ROLA DE LADO' : ''}`);
    if (!ok) falhas++;
  }
  confere('nenhum erro de console nas 8', !erros.length, erros[0]);
  await nav.close();
}

console.log(falhas ? `\n${falhas} problema(s) na pagina Aprender` : '\nVERDE: o texto dele esta inteiro, nas 8 linguas');
process.exit(falhas ? 1 : 0);
