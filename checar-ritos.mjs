// Confere se cada texto tem as marcas estruturais do rito que ele diz ser.
import { readFileSync } from 'node:fs';

const norm = s => String(s).replace(/[֑-ׇ]/g, '').replace(/[^א-ת]/g, '');
const { regras } = JSON.parse(readFileSync('ritos.json', 'utf8'));

const ARQ = {
  ashkenaz_yatom:'texto-ashkenaz-yatom.md',   ashkenaz_derabanan:'texto-ashkenaz-derabanan.md',
  chabad_yatom:'texto-chabad-yatom.md',       chabad_derabanan:'texto-chabad-derabanan.md',
  sefard_yatom:'kadish_sefard_yatom.md',      sefard_derabanan:'kadish_sefard_derabanan_p79.md',
  sefaradi_yatom:'kadish_sefaradi_yatom_p530-532.md', sefaradi_derabanan:'kadish_sefaradi_derabanan_p29.md',
};

let falhas = 0;
for (const [id, arq] of Object.entries(ARQ)) {
  const [nusach, tipo] = id.split('_');
  let txt;
  try { txt = norm(readFileSync(`fontes/${arq}`, 'utf8')); }
  catch { console.log(`${id.padEnd(20)} fonte nao encontrada: fontes/${arq}`); falhas++; continue; }

  const problemas = [], avisos = [];
  for (const r of regras) {
    const tem = txt.includes(r.texto);
    let esperado = null;
    if (r.soNoTipo) esperado = (tipo === r.soNoTipo);
    else if (r.deveTer?.includes(nusach)) esperado = true;
    else if (r.naoDeveTer?.includes(nusach)) esperado = false;
    if (esperado === null || tem === esperado) continue;
    const m = `${esperado ? 'FALTA' : 'SOBRA'} ${r.rotulo} — ${r.porque}`;
    (r.obrigatorio ? problemas : avisos).push(m);
  }
  if (problemas.length) falhas++;
  console.log(`${id.padEnd(20)} ${problemas.length ? 'REPROVADO' : avisos.length ? 'passou c/ aviso' : 'ok'}`);
  for (const p of problemas) console.log(`    x ${p}`);
  for (const v of avisos)    console.log(`    ? ${v}`);
}
console.log(falhas ? `\nVERMELHO: ${falhas} de 8 com marca de rito errada` : '\nVERDE: marcas de rito conferem nos 8');
process.exit(falhas ? 1 : 0);
