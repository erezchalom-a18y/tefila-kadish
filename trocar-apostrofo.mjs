/**
 * trocar-apostrofo.mjs — troca o apostrofo da transliteracao portuguesa por "er",
 * conforme decisao do Erez: v'shirata -> vershirata.
 *
 * ONDE TROCA: so onde o apostrofo representa um sheva na — isto e, quando vem
 * depois de CONSOANTE. Ali ele marca a vogal curta, e virar "er" e a decisao.
 *
 * ONDE NAO TROCA: quando o apostrofo vem depois de VOGAL, ele nao e sheva —
 * ele separa duas vogais que nao podem se juntar (ve'imru, ya'aseh, ba'agala).
 * Trocar ali produziria "veerimru" e "yaeraseh", que ninguem consegue ler.
 * Esses casos ficam como estao e sao listados no fim, para decisao a parte.
 *
 * Mexe na transliteracao em tres lugares: glossario.json, o verso nos sync/*.json
 * e as palavras dentro de cada verso. NUNCA mexe em tempo, em hebraico, em
 * traducao, em glosa, em ancoras ou em cortes — e prova isso antes de terminar.
 *
 * Uso:  node trocar-apostrofo.mjs              (ensaio: so mostra)
 *       node trocar-apostrofo.mjs --confirmar  (aplica)
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const CONFIRMAR = process.argv.includes('--confirmar');
const VOGAIS = 'aeiouáàâãéêíóôõúAEIOUÁÀÂÃÉÊÍÓÔÕÚ';

/** Troca so os apostrofos de sheva. Devolve [novoTexto, trocados, mantidos]. */
function trocar(txt) {
  if (!txt || !txt.includes("'")) return [txt, 0, 0];
  let saida = '', trocados = 0, mantidos = 0;
  for (let i = 0; i < txt.length; i++) {
    if (txt[i] !== "'") { saida += txt[i]; continue; }
    const anterior = i > 0 ? txt[i - 1] : '';
    if (anterior && VOGAIS.includes(anterior)) { saida += "'"; mantidos++; }  // separador
    else { saida += 'er'; trocados++; }                                        // sheva
  }
  return [saida, trocados, mantidos];
}

const arquivosSync = fs.readdirSync('sync').filter(f => f.endsWith('.json')).map(f => `sync/${f}`);
const TODOS = ['glossario.json', ...arquivosSync];
const antes = Object.fromEntries(TODOS.map(f => [f, fs.readFileSync(f, 'utf8')]));

let trocados = 0, mantidos = 0;
const amostra = [], separadores = new Set();

function processa(obj, campo) {
  const [novo, t, m] = trocar(obj[campo]);
  if (t) {
    if (amostra.length < 25 && obj[campo] !== novo) amostra.push([obj[campo], novo]);
    obj[campo] = novo;
    trocados += t;
  }
  if (m) {
    mantidos += m;
    for (const p of String(obj[campo]).split(/\s+/)) if (p.includes("'")) separadores.add(p);
  }
}

// 1. glossario.json
const g = JSON.parse(antes['glossario.json']);
for (const e of Object.values(g.entradas)) processa(e, 'transliteration_pt');

// 2. sync: verso e palavra
const syncs = {};
for (const f of arquivosSync) {
  const j = JSON.parse(antes[f]);
  for (const v of j.versos) {
    processa(v, 'transliteration_pt');
    for (const p of v.palavras || []) processa(p, 'transliteration_pt');
  }
  syncs[f] = j;
}

console.log(`apostrofos trocados por "er" (sheva):        ${trocados}`);
console.log(`apostrofos mantidos (separam duas vogais):   ${mantidos}\n`);
console.log('exemplos do que muda:');
for (const [a, b] of amostra.slice(0, 12)) console.log(`   ${a}\n     -> ${b}`);
console.log('\npalavras que continuam com apostrofo (nao sao sheva):');
console.log('   ' + [...separadores].sort().join(', '));

if (!CONFIRMAR) {
  console.log('\nEnsaio — nada foi escrito. Para aplicar, rode com --confirmar');
  process.exit(0);
}

const desfazer = () => { for (const [f, txt] of Object.entries(antes)) fs.writeFileSync(f, txt); };

try {
  fs.writeFileSync('glossario.json', JSON.stringify(g, null, 2) + '\n');
  for (const [f, j] of Object.entries(syncs)) fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n');

  // PROVA: so a transliteracao pode ter mudado
  for (const f of arquivosSync) {
    const a = JSON.parse(antes[f]), d = JSON.parse(fs.readFileSync(f, 'utf8'));
    const chapa = j => JSON.stringify(j.versos.map(v => [v.n, v.start, v.end, v.hebrew,
      v.translation_pt, v.translations,
      (v.palavras || []).map(p => [p.i, p.start, p.end, p.hebrew, p.glosa_pt, p.glosas])]));
    if (chapa(a) !== chapa(d)) throw new Error(`mudou algo alem da transliteracao em ${f}`);
  }
  const gA = JSON.parse(antes['glossario.json']), gD = JSON.parse(fs.readFileSync('glossario.json', 'utf8'));
  const chapaG = x => JSON.stringify(Object.entries(x.entradas).map(([k, e]) =>
    [k, e.hebrew, e.translation_pt, e.translations, e.glosas_pt, e.glosas, e.origem]));
  if (chapaG(gA) !== chapaG(gD)) throw new Error('mudou algo alem da transliteracao no glossario');
  console.log('\nprova: nenhum tempo, hebraico, traducao ou glosa mudou.');

  for (const s of ['checar.mjs', 'checar-ritos.mjs']) {
    const r = execFileSync('node', [s], { encoding: 'utf8' });
    console.log(`${s}: ${r.trim().split('\n').pop()}`);
  }
} catch (erro) {
  console.error('\nDEU ERRADO: ' + (erro.message || erro));
  desfazer();
  console.error('Tudo desfeito.');
  process.exit(1);
}
console.log('\nPronto.');
