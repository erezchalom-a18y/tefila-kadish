/**
 * testar-portugues.mjs — o portugues do Erez, do jeito que ele decidiu, nos 8.
 *
 * Existe porque em 23/08 ele revisou os 272 itens em portugues, mandou 155
 * correcoes, e a pergunta seguinte foi "quero testar todos em portugues".
 * Conferir isso a mao sao 8 kadishim x 161 versos. Aqui e uma linha.
 *
 * NAO tem lista de palavras escrita a mao. Ele le os proprios recados em
 * revisoes/pt-*.txt e cobra o que ESTA ESCRITO LA:
 *   1. nenhum texto antigo sobrou em sync/*.json nem no glossario.json;
 *   2. o texto final dele esta la;
 *   3. abrindo os 8 num navegador com ?lang=pt, a tela mostra exatamente o que
 *      esta no arquivo — sem sobra do que ficou guardado no aparelho.
 * Assim a checagem nunca envelhece: quando ele revisar de novo, e so salvar o
 * recado novo em revisoes/ e ela ja cobra o novo.
 *
 * Um recado pode corrigir o que outro corrigiu (o "emenaa -> emenada ->
 * emanada" levou tres rodadas) e pode ate desdizer o anterior. Por isso os
 * recados se chamam -a, -b, -c: em ordem alfabetica tem que sair a ordem em
 * que ele decidiu. Se um dia alguem salvar um recado sem essa letra, ele vai
 * parar DEPOIS dos com letra no sort, e a conta sai errada.
 *
 * Uso: node servidor-teste.mjs 8899 . &
 *      node testar-portugues.mjs [http://127.0.0.1:8899/tefila-kadish]
 */
import { readFileSync, readdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';
const semNikud = s => String(s || '').normalize('NFD')
  .replace(/[֑-ׇ̀-ͯ]/g, '').replace(/[^א-ת]/g, '');
const TIPOS = { 'tradução do verso': 'trad', 'tradução da palavra': 'glosa', 'transliteração': 'tl' };

let problemas = 0;
const confere = (o, ok, det = '') => {
  console.log(`${ok ? 'OK  ' : 'FALHA'} ${o}${ok || !det ? '' : '\n        ' + det}`);
  if (!ok) problemas++;
};

// ---------- ler os recados, em ordem, encadeando ----------
const recados = readdirSync('revisoes').filter(f => /^pt-.*\.txt$/.test(f)).sort();
if (!recados.length) { console.error('nao ha recado nenhum em revisoes/'); process.exit(2); }

// Cada correcao e uma seta: de -> para. Elas nao sao uma fila:
//   - "shemei -> shemê" e "shmei -> shemê" sao DUAS grafias antigas indo para
//     a mesma nova;
//   - "emenaa -> emenada -> emanada" e uma corrente de tres;
//   - e o mesmo "de" pode aparecer duas vezes com destinos diferentes, quando
//     um recado mais novo corrige o que o anterior tinha dito (o "shmei" foi
//     para shemêh no primeiro e para shemê no segundo). Nesse caso vale o
//     ULTIMO — e por isso o nome dos arquivos importa, e eles se chamam -a,
//     -b, -c: em ordem alfabetica tem que sair a ordem em que ele decidiu.
// No fim, o que vale e o destino que nunca e origem de outra seta. Tem que ser
// um so: a mesma palavra escrita de dois jeitos e exatamente o que ele mandou
// nao existir.
const setas = new Map();   // tipo|heb -> Map(de -> para), o ultimo manda
for (const r of recados) {
  const t = readFileSync(`revisoes/${r}`, 'utf8');
  for (const b of t.split(/\n(?=tradução do verso —|tradução da palavra —|transliteração —)/)) {
    const m = b.match(/^(tradução do verso|tradução da palavra|transliteração) — (.+)\n\s*está: (.*)\n\s*deveria ser: (.*)$/m);
    if (!m) continue;
    const k = `${TIPOS[m[1]]}|${semNikud(m[2])}`;
    if (!setas.has(k)) setas.set(k, new Map());
    setas.get(k).set(m[3].trim(), m[4].trim());   // recado mais novo sobrescreve
  }
}
console.log(`${recados.length} recado(s) em revisoes/: ${recados.join(', ')}`);
console.log(`${setas.size} palavras/versos com decisao do Erez\n`);

const finais = new Map(), velhos = new Map(), duplos = [];
for (const [k, mapa] of setas) {
  const origens = new Set(mapa.keys());
  const pontas = [...new Set(mapa.values())].filter(p => !origens.has(p));
  // maiuscula de comeco de verso nao conta: Yehê e yehê sao a mesma grafia
  if (new Set(pontas.map(p => p.toLowerCase())).size > 1) duplos.push(`${k}: ${pontas.join(' / ')}`);
  finais.set(k, pontas);
  velhos.set(k, [...origens]);
}
confere('nenhuma palavra ficou com duas grafias decididas', duplos.length === 0, duplos.join('\n        '));

// ---------- 1 e 2: nos arquivos ----------
const ARQUIVOS = readdirSync('sync').filter(f => f.endsWith('_sync.json')).sort();
const sync = Object.fromEntries(ARQUIVOS.map(f => [f, JSON.parse(readFileSync(`sync/${f}`, 'utf8'))]));

// ---------- as decisoes ESCAPADAS (25/08) ----------
// Nem toda decisao dele vale nos 8. O hebraico do "Yitbarech ... veyitpaer" com
// tsere e so do ashkenaz e do chabad; as glosas de um verso valem so nele (o
// "kol" com a glosa "todas" esta em 29 lugares, e virar "todo o povo" em
// "leela min kol birchata" daria "acima de todo o povo das bencaos").
//
// O recado nao sabe dizer isso: ele casa por conteudo e por isso pega os 8.
// Entao essas decisoes moram em revisoes/decisoes-*.json, e aqui elas fazem
// duas coisas: sao COBRADAS no escopo delas, e o lugar onde valem fica de fora
// da varredura das setas — senao a seta antiga acusaria a decisao nova.
const decisoes = readdirSync('revisoes').filter(f => /^decisoes-.*\.json$/.test(f)).sort()
  .flatMap(f => JSON.parse(readFileSync(`revisoes/${f}`, 'utf8')).decisoes || []);
const fora = new Set();        // "arquivo|verso|indice|tipo" que a seta nao julga
const escapadas = [];          // o que cobrar, e onde
for (const d of decisoes) {
  if (d.tipo === 'verso_por_nussach')
    escapadas.push({ d, vale: f => d.nussachim.includes(f.split('_')[0]) });
  if (d.tipo === 'glosas_do_verso')
    escapadas.push({ d, vale: () => true });
}

const sobrou = [], faltou = [];
const vistos = new Set();
// marca o que as decisoes escapadas cobrem, para a seta nao julgar aquilo
for (const { d, vale } of escapadas) for (const f of ARQUIVOS) {
  if (!vale(f)) continue;
  for (const v of sync[f].versos) {
    if (semNikud(v.hebrew) !== d.chave) continue;
    if (d.tipo === 'verso_por_nussach') for (const p of (d.palavras || [])) fora.add(`${f}|${v.n}|${p.i}|tl`);
    if (d.tipo === 'glosas_do_verso') v.palavras.forEach((_, i) => fora.add(`${f}|${v.n}|${i}|glosa`));
  }
}

for (const f of ARQUIVOS) for (const v of sync[f].versos) {
  const kv = `trad|${semNikud(v.hebrew)}`;
  if (finais.has(kv)) {
    vistos.add(kv);
    if (velhos.get(kv).includes(v.translation_pt)) sobrou.push(`${f} §${v.n}: "${v.translation_pt}"`);
    if (!finais.get(kv).includes(v.translation_pt))
      faltou.push(`${f} §${v.n} verso: e "${v.translation_pt}", devia ser "${finais.get(kv).join(' / ')}"`);
  }
  v.palavras.forEach((p, iw) => {
    for (const [tipo, campo] of [['glosa', 'glosa_pt'], ['tl', 'transliteration_pt']]) {
      if (fora.has(`${f}|${v.n}|${iw}|${tipo}`)) continue;   // decisao escapada manda aqui
      const k = `${tipo}|${semNikud(p.hebrew)}`;
      if (!finais.has(k)) continue;
      vistos.add(k);
      if (velhos.get(k).includes(p[campo])) sobrou.push(`${f} §${v.n} ${p.hebrew}: "${p[campo]}"`);
      // maiuscula de comeco de verso e legitima: comparo sem ela
      if (!finais.get(k).some(x => x.toLowerCase() === p[campo].toLowerCase()))
        faltou.push(`${f} §${v.n} ${p.hebrew}: e "${p[campo]}", devia ser "${finais.get(k).join(' / ')}"`);
    }
  });
}

// e as escapadas sao cobradas onde valem
const escapouErrado = [];
for (const { d, vale } of escapadas) for (const f of ARQUIVOS) {
  if (!vale(f)) continue;
  for (const v of sync[f].versos) {
    if (semNikud(v.hebrew) !== d.chave) continue;
    if (d.tipo === 'verso_por_nussach') {
      if (d.hebrew && v.hebrew !== d.hebrew) escapouErrado.push(`${f} §${v.n}: o hebraico nao e o que ele decidiu`);
      if (d.transliteration_pt && v.transliteration_pt !== d.transliteration_pt)
        escapouErrado.push(`${f} §${v.n}: e "${v.transliteration_pt}", devia ser "${d.transliteration_pt}"`);
    }
    if (d.tipo === 'glosas_do_verso')
      v.palavras.forEach((p, i) => { if (p.glosa_pt !== d.glosas[i])
        escapouErrado.push(`${f} §${v.n} palavra ${i + 1}: e "${p.glosa_pt}", devia ser "${d.glosas[i]}"`); });
  }
}
// e o que NAO esta no escopo nao pode ter sido contaminado
for (const { d, vale } of escapadas) {
  if (d.tipo !== 'verso_por_nussach') continue;
  for (const f of ARQUIVOS) {
    if (vale(f)) continue;
    for (const v of sync[f].versos) {
      if (semNikud(v.hebrew) !== d.chave) continue;
      // fora do escopo, nada pode ter pegado a variante — nem o hebraico nem a
      // transliteracao. E o vazamento que nenhuma outra checagem enxerga.
      if (d.hebrew && v.hebrew === d.hebrew)
        escapouErrado.push(`${f} §${v.n}: pegou o hebraico do ashkenaz/chabad, e nao devia`);
      if (d.transliteration_pt && v.transliteration_pt === d.transliteration_pt)
        escapouErrado.push(`${f} §${v.n}: pegou a transliteracao do ashkenaz/chabad, e nao devia`);
    }
  }
}
confere(`as ${escapadas.length} decisao(oes) escapada(s) valem so onde ele mandou`,
  escapouErrado.length === 0, escapouErrado.slice(0, 6).join('\n        '));
confere('nenhum texto antigo sobrou nos sync/*.json', sobrou.length === 0, sobrou.slice(0, 6).join('\n        '));
confere('o texto decidido pelo Erez esta la', faltou.length === 0, faltou.slice(0, 6).join('\n        '));

// Uma decisao ESCAPADA tambem e "onde valer": ela cobre aquelas palavras
// naquele verso, e por isso elas ficam fora da varredura das setas. Sem isto,
// toda palavra coberta por uma decisao escapada era contada como seta orfa.
for (const { d } of escapadas) {
  if (d.tipo !== 'glosas_do_verso') continue;
  for (const f of ARQUIVOS) for (const v of sync[f].versos) {
    if (semNikud(v.hebrew) !== d.chave) continue;
    for (const p of v.palavras) vistos.add(`glosa|${semNikud(p.hebrew)}`);
  }
}
const orfaos = [...finais.keys()].filter(k => !vistos.has(k));
confere('toda decisao dele tem onde valer', orfaos.length === 0, orfaos.join(', '));

// o glossario nao pode discordar, senao o aplicar-glossario.mjs desfaz tudo
const gloss = JSON.parse(readFileSync('glossario.json', 'utf8'));
const discorda = [];
for (const [chave, e] of Object.entries(gloss.entradas)) {
  let v = null;
  for (const f of ARQUIVOS) { v = sync[f].versos.find(x => semNikud(x.hebrew) === chave); if (v) break; }
  if (!v) continue;
  if (e.translation_pt !== v.translation_pt) discorda.push(`${chave.slice(0, 18)}: traducao`);
  // com excecao por nussach, o glossario guarda a base e a variante; compara
  // com aquela que vale para o arquivo onde o verso foi achado
  const variantes = [e.transliteration_pt].concat(
    Object.values(e.por_nussach || {}).map(x => x.transliteration_pt));
  if (!variantes.includes(v.transliteration_pt)) discorda.push(`${chave.slice(0, 18)}: transliteracao`);
}
confere('o glossario concorda com os sync (senao seria desfeito na proxima rodada)',
  discorda.length === 0, discorda.slice(0, 6).join('\n        '));

// ---------- 3: os 8 na tela, em portugues ----------
const CHROMIUM = process.env.CHROMIUM;
const { chromium } = await import('playwright').then(m => m.default || m);
const nav = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});

for (const n of ['ashkenaz', 'chabad', 'sefard', 'sefaradi'])
  for (const t of ['yatom', 'derabanan']) {
    const pag = await nav.newPage({ viewport: { width: 900, height: 1000 } });
    const erros = [];
    pag.on('pageerror', e => erros.push(e.message));
    await pag.goto(`${BASE}/engine.html?n=${n}&t=${t}&lang=pt`);
    await pag.waitForTimeout(2600);
    const r = await pag.evaluate(() => ({
      lang: typeof state !== 'undefined' ? state.lang : '?',
      // SO o Kadish. Os quadros de explicacao citam "yehei shmei raba" de
      // proposito, e nao sao texto de reza — nao entram nesta conferencia.
      versos: [...document.querySelectorAll('.verse')].map(e => e.innerText),
    }));
    const d = sync[`${n}_${t}_sync.json`];
    // Cada .verse mostra tres linhas: hebraico, transliteracao, e as glosas
    // das palavras juntadas. A traducao do VERSO inteiro nao esta ali — ela e
    // conferida nos arquivos, mais acima. Aqui cobro o que a tela mostra.
    const erradas = [];
    d.versos.forEach((v, i) => {
      const linhas = (r.versos[i] || '').split('\n');
      const tl = v.palavras.map(p => p.transliteration_pt).join(' ');
      const gl = v.palavras.map(p => p.glosa_pt).join(' ');
      if (!linhas.includes(tl)) erradas.push(`§${v.n} transliteracao: tela "${linhas[1]}" x arquivo "${tl}"`);
      if (!linhas.includes(gl)) erradas.push(`§${v.n} glosas: tela "${linhas[2]}" x arquivo "${gl}"`);
    });
    const ok = r.lang === 'pt' && r.versos.length === d.versos.length &&
               erradas.length === 0 && erros.length === 0;
    confere(`${(n + '_' + t).padEnd(20)} ${String(r.versos.length).padStart(2)}v em portugues`, ok,
      [r.lang !== 'pt' ? `lingua saiu ${r.lang}` : '',
       r.versos.length !== d.versos.length ? `${r.versos.length} versos na tela, ${d.versos.length} no arquivo` : '',
       ...erradas.slice(0, 2),
       erros[0] || ''].filter(Boolean).join('; '));
    await pag.close();
  }
await nav.close();

console.log(problemas ? `\n${problemas} problema(s) no portugues` : '\nVERDE: o portugues do Erez esta nos 8, na tela e no arquivo');
process.exit(problemas ? 1 : 0);
