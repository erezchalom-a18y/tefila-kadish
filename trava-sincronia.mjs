/**
 * trava-sincronia.mjs — A SINCRONIA SO MUDA COM AUTORIZACAO DELE
 * ==============================================================
 *
 * 30/08. Depois de eu subir tres mudancas de comportamento em dois dias e
 * quebrar o que estava bom, ele disse:
 *
 *   "voltou ao normal, esta perfeito. salve as sincronizacoes do audio com o
 *    texto tanto no modo reza como treino e so altere com minha autorizacao"
 *
 * Promessa nao vale nada aqui — eu ja quebrei isto sem perceber. Entao a
 * promessa vira TRAVA: este arquivo guarda a impressao digital do que ele
 * aprovou, e a checagem fica VERMELHA se alguem mexer.
 *
 * Guarda duas coisas, e as duas sao exatas (nao ha tolerancia, nao ha "quase"):
 *
 *   1. OS NUMEROS — todo start e todo end de toda palavra dos 8 Kadishim. E a
 *      sincronia em si: 815 palavras, 1.630 numeros. Inclui as 159 correcoes de
 *      ouvido dele de 24/08.
 *   2. O CODIGO QUE OS USA — o modulo SYNC inteiro do engine.html, que e quem
 *      decide qual palavra acende, onde o Modo Treino para e como o relogio e
 *      contado. Mexer numa linha dali muda a impressao digital.
 *
 * Isto NAO impede mudanca. Impede mudanca CALADA. Quando ele autorizar, roda-se
 *   node trava-sincronia.mjs --regravar "o que ele autorizou"
 * e o motivo fica gravado no historico do arquivo, junto com a data.
 *
 *   node trava-sincronia.mjs             → confere (é o que roda nas checagens)
 *   node trava-sincronia.mjs --regravar "motivo"  → grava um estado novo
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const ARQ = 'trava-sincronia.json';
const digerir = s => createHash('sha256').update(s).digest('hex').slice(0, 16);

// ---------- 1. os numeros ----------
const numeros = {};
let palavras = 0;
for (const f of readdirSync('sync').filter(x => x.endsWith('_sync.json')).sort()) {
  const j = JSON.parse(readFileSync(`sync/${f}`, 'utf8'));
  const linha = [];
  for (const v of j.versos) for (const p of v.palavras) {
    linha.push(`${p.start}:${p.end}`); palavras++;
  }
  numeros[f.replace('_sync.json', '')] = { palavras: linha.length, marca: digerir(linha.join('|')) };
}

// ---------- 2. o codigo que os usa ----------
// So o modulo SYNC. O resto do engine.html (botoes, cores, idiomas) pode mudar a
// vontade — nao e disso que ele esta falando.
const html = readFileSync('engine.html', 'utf8');
const ini = html.indexOf('window.SYNC = (function () {');
if (ini < 0) { console.log('FALHA nao achei o modulo SYNC no engine.html'); process.exit(1); }
const fim = html.indexOf('\n  })();', ini);
if (fim < 0) { console.log('FALHA nao achei o fim do modulo SYNC'); process.exit(1); }
const modulo = html.slice(ini, fim);
const codigo = { linhas: modulo.split('\n').length, marca: digerir(modulo) };

// ---------- 3. o ponto de parada do Modo Treino ----------
const paradas = existsSync('fim-da-voz.json')
  ? { marca: digerir(JSON.stringify(JSON.parse(readFileSync('fim-da-voz.json', 'utf8')).paradas)) }
  : { marca: '(sem arquivo)' };

const agora = { numeros, codigo, paradas, palavras };

// ---------- regravar ----------
if (process.argv.includes('--regravar')) {
  const motivo = process.argv[process.argv.indexOf('--regravar') + 1];
  if (!motivo || motivo.startsWith('--')) {
    console.log('Diga o motivo: node trava-sincronia.mjs --regravar "o que ele autorizou"');
    process.exit(1);
  }
  const velho = existsSync(ARQ) ? JSON.parse(readFileSync(ARQ, 'utf8')) : { historico: [] };
  const novo = {
    _leia: ('A sincronia que o Erez aprovou. Confira com: node trava-sincronia.mjs\n'
      + 'So se regrava com autorizacao DELE, e o motivo fica no historico abaixo.\n'
      + 'Guarda os tempos de todas as palavras dos 8 e o codigo do modulo SYNC.'),
    gravado_em: new Date().toISOString().slice(0, 10),
    ...agora,
    historico: [...(velho.historico || []), { data: new Date().toISOString().slice(0, 10), motivo }],
  };
  writeFileSync(ARQ, JSON.stringify(novo, null, 1) + '\n', 'utf8');
  console.log(`Gravado. ${palavras} palavras nos 8, modulo SYNC com ${codigo.linhas} linhas.`);
  console.log(`Motivo: ${motivo}`);
  process.exit(0);
}

// ---------- conferir ----------
if (!existsSync(ARQ)) {
  console.log(`FALHA nao existe ${ARQ}. Grave o estado bom com --regravar "motivo".`);
  process.exit(1);
}
const guardado = JSON.parse(readFileSync(ARQ, 'utf8'));
let falhas = 0;
const linha = (ok, txt) => { console.log((ok ? 'OK    ' : 'FALHA ') + txt); if (!ok) falhas++; };

console.log(`a sincronia guardada e de ${guardado.gravado_em}\n`);
for (const [n, v] of Object.entries(numeros)) {
  const g = guardado.numeros[n];
  if (!g) { linha(false, `${n}: nao estava na trava`); continue; }
  linha(g.marca === v.marca && g.palavras === v.palavras,
    `${n}: ${v.palavras} palavras${g.marca === v.marca ? '' : ' — OS TEMPOS MUDARAM'}`);
}
linha(guardado.codigo.marca === codigo.marca,
  `o modulo SYNC do engine.html${guardado.codigo.marca === codigo.marca ? '' :
    ` — MUDOU (${guardado.codigo.linhas} → ${codigo.linhas} linhas)`}`);
linha(guardado.paradas.marca === paradas.marca,
  `onde o Modo Treino para${guardado.paradas.marca === paradas.marca ? '' : ' — MUDOU'}`);

if (falhas) {
  console.log(`\n${falhas} coisa(s) da sincronia mudaram desde ${guardado.gravado_em}.`);
  console.log('Ele pediu, em 30/08, que isto so mude com autorizacao dele.');
  console.log('Se ele autorizou: node trava-sincronia.mjs --regravar "o que ele autorizou"');
  process.exit(1);
}
console.log('\nVERDE: a sincronia e a mesma que ele aprovou.');
