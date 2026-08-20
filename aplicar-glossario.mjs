// Aplica glossario.json aos 8 JSONs de sincronia.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
const norm = s => String(s).replace(/[֑-ׇ]/g, '').replace(/[^א-ת]/g, '');
const { entradas } = JSON.parse(readFileSync('glossario.json', 'utf8'));

let semTexto = [];
for (const f of readdirSync('sync').filter(x => x.endsWith('.json')).sort()) {
  const j = JSON.parse(readFileSync(`sync/${f}`, 'utf8'));
  let doSiddur = 0, redigido = 0, falta = 0;
  j.versos = j.versos.map(v => {
    const e = entradas[norm(v.hebrew)];
    if (!e) { falta++; semTexto.push(`${f.replace('_sync.json','')} §${v.n}: ${v.hebrew}`); return v; }
    if (e.origem === 'tehilat_hashem') doSiddur++; else redigido++;
    return { ...v, transliteration_pt: e.transliteration_pt, translation_pt: e.translation_pt, origem_texto: e.origem };
  });
  // tira a nota anterior antes de escrever a nova, senao cada rodada duplica a linha
  j.texto_status = (j.texto_status || '')
      .replace(/; transliteracao e traducao PENDENTES/, '')
      .replace(/; translit\/traducao:[^;]*$/, '') +
    `; translit/traducao: ${doSiddur} do siddur Tehilat Hashem (rever direitos), ${redigido} redigidas por Claude (rever com o rabino)`;
  writeFileSync(`sync/${f}`, JSON.stringify(j, null, 2) + '\n', 'utf8');
  console.log(`${f.replace('_sync.json','').padEnd(20)} ${String(j.versos.length).padStart(2)}v  siddur ${String(doSiddur).padStart(2)}  redigido ${String(redigido).padStart(2)}  ${falta ? 'SEM TEXTO ' + falta : ''}`);
}
if (semTexto.length) { console.log('\nfaltou:'); semTexto.forEach(s => console.log('  ' + s)); }
