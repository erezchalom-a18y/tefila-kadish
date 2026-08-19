import { readFileSync, readdirSync } from 'node:fs';
let falhas = 0;
const linha = (s) => console.log(s);
for (const f of readdirSync('sync').sort()) {
  const j = JSON.parse(readFileSync(`sync/${f}`, 'utf8'));
  const p = { heb: 0, tr: 0, td: 0 };
  for (const v of j.versos) {
    if (!v.hebrew || /^\[/.test(v.hebrew) || !/[א-ת]/.test(v.hebrew)) p.heb++;
    if (!v.transliteration_pt || /^\[/.test(v.transliteration_pt)) p.tr++;
    if (!v.translation_pt || /^\[/.test(v.translation_pt)) p.td++;
  }
  const okN = j.versos.length === j.total_versos;
  const fim = Math.abs(j.versos.at(-1).end - j.audio_duration) < 0.1;
  if (p.heb || !okN || !fim) falhas++;
  linha(`${f.padEnd(30)} versos ${String(j.total_versos).padStart(2)} | heb faltando ${p.heb} | translit ${p.tr} | trad ${p.td} | contagem ${okN?'ok':'ERRO'} | fim=audio ${fim?'ok':'ERRO'}`);
}
console.log(falhas ? `\nVERMELHO: ${falhas} arquivo(s) com hebraico ou estrutura errada` : '\nVERDE: hebraico e estrutura ok nos 8');
process.exit(falhas ? 1 : 0);
