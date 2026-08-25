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
    // EXCECAO POR NUSSACH (25/08). A chave do glossario ignora o nikud, entao
    // dois nussachim com o mesmo texto e nikud diferente caem na mesma entrada.
    // O Erez decidiu que o "Yitbarech ... veyitpaer" leva tsere no ashkenaz e
    // no chabad, e patach no sefard e no sefaradi. Sem isto, esta rodada
    // desfaria a transliteracao dele na rodada seguinte, sem aviso.
    const so = e.por_nussach && e.por_nussach[j.nusach];
    return { ...v,
      transliteration_pt: (so && so.transliteration_pt) || e.transliteration_pt,
      translation_pt: e.translation_pt, origem_texto: e.origem };
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
