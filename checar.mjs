// Checagem dos 8 arquivos de sincronia. Verde = pronto para conferir de ouvido.
import { readFileSync, readdirSync } from 'node:fs';

const cons = h => (String(h).match(/[א-ת]/g) || []).length;
let falhas = 0;

for (const f of readdirSync('sync').filter(x => x.endsWith('.json')).sort()) {
  const j = JSON.parse(readFileSync(`sync/${f}`, 'utf8'));
  const erros = [];

  let semHeb = 0, semTl = 0, semTd = 0;
  for (const v of j.versos) {
    if (!v.hebrew || /^\[/.test(v.hebrew) || !/[א-ת]/.test(v.hebrew)) semHeb++;
    if (!v.transliteration_pt || /^\[/.test(v.transliteration_pt)) semTl++;
    if (!v.translation_pt || /^\[/.test(v.translation_pt)) semTd++;
  }
  if (semHeb) erros.push(`${semHeb} sem hebraico`);
  if (j.versos.length !== j.total_versos) erros.push('contagem nao bate');
  if (Math.abs(j.versos.at(-1).end - j.audio_duration) > 0.15) erros.push('ultimo verso nao termina no fim do audio');
  for (let k = 1; k < j.versos.length; k++)
    if (Math.abs(j.versos[k].start - j.versos[k-1].end) > 0.01) { erros.push(`buraco/sobreposicao no §${k+1}`); break; }

  // ritmo: segundos por consoante nao pode variar demais entre versos
  let susp = 0;
  if (!semHeb) {
    const t = j.versos.map(v => (v.end - v.start) / Math.max(1, cons(v.hebrew)));
    const med = [...t].sort((a,b)=>a-b)[Math.floor(t.length/2)] || 1;
    susp = t.filter(x => x/med < 0.75 || x/med > 1.35).length;
    if (susp / t.length > 0.25) erros.push(`ritmo implausivel em ${susp} versos`);
  }

  if (erros.length) falhas++;
  console.log(
    f.replace('_sync.json','').padEnd(20),
    `${String(j.total_versos).padStart(2)}v`,
    `heb:${semHeb ? 'FALTA '+semHeb : 'ok'}`.padEnd(12),
    `translit:${semTl ? 'falta '+semTl : 'ok'}`.padEnd(15),
    `trad:${semTd ? 'falta '+semTd : 'ok'}`.padEnd(11),
    `ritmo suspeito:${susp}`.padEnd(18),
    erros.length ? '<<< ' + erros.join('; ') : ''
  );
}
console.log(falhas ? `\nVERMELHO: ${falhas} de 8 com problema` : '\nVERDE: os 8 passaram');
process.exit(falhas ? 1 : 0);
