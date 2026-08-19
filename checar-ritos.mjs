// Confere se cada texto tem as marcas estruturais do rito que ele diz ser.
// Le APENAS a tabela de versos de cada fonte — o resto do arquivo tem comentario
// ("este rito omite ויצמח"), e comentario nao e texto de reza.
import { readFileSync } from 'node:fs';

const norm = s => String(s).replace(/[֑-ׇ]/g, '').replace(/[^א-ת]/g, '');
const { regras } = JSON.parse(readFileSync('ritos.json', 'utf8'));

const ARQ = {
  ashkenaz_yatom: 'texto-ashkenaz-yatom.md',
  ashkenaz_derabanan: 'texto-ashkenaz-derabanan.md',
  chabad_yatom: 'texto-chabad-yatom.md',
  chabad_derabanan: 'texto-chabad-derabanan.md',
  sefard_yatom: 'kadish_sefard_yatom.md',
  sefard_derabanan: 'kadish_sefard_derabanan_p79.md',
  sefaradi_yatom: 'kadish_sefaradi_yatom_p530-532.md',
  sefaradi_derabanan: 'kadish_sefaradi_derabanan_p29.md',
};

// tira so os versos numerados da tabela de segmentacao
function versos(caminho) {
  const linhas = readFileSync(caminho, 'utf8').split(/\r?\n/);
  const i = linhas.findIndex(l => /^\|\s*(§|#)\s*\|/.test(l));
  if (i === -1) return null;
  const out = [];
  for (let k = i + 2; k < linhas.length; k++) {
    const l = linhas[k].trim();
    if (!l.startsWith('|')) break;
    const c = l.split('|').map(s => s.trim());
    if (!/^\d+$/.test(c[1])) break;
    out.push(c[2] || '');
  }
  return out.length ? out : null;
}

let falhas = 0, semTabela = 0;
for (const [id, arq] of Object.entries(ARQ)) {
  const [nusach, tipo] = id.split('_');
  let vs;
  try { vs = versos(`fontes/${arq}`); }
  catch { console.log(`${id.padEnd(20)} fonte nao encontrada: fontes/${arq}`); falhas++; continue; }
  if (!vs) { console.log(`${id.padEnd(20)} SEM TABELA DE VERSOS em fontes/${arq}`); semTabela++; falhas++; continue; }

  const txt = norm(vs.join(''));
  const problemas = [], avisos = [];
  for (const r of regras) {
    if (r.soTipo && tipo !== r.soTipo) continue;
    const tem = txt.includes(r.texto);
    let esperado = null;
    if (r.soNoTipo) esperado = (tipo === r.soNoTipo);
    else if (r.deveTer?.includes(nusach)) esperado = true;
    else if (r.naoDeveTer?.includes(nusach)) esperado = false;
    if (esperado === null || tem === esperado) continue;
    const m = `${esperado ? 'FALTA' : 'SOBRA'} ${r.rotulo}\n        ${r.porque}`;
    (r.obrigatorio ? problemas : avisos).push(m);
  }
  if (problemas.length) falhas++;
  console.log(`${id.padEnd(20)} ${vs.length}v  ${problemas.length ? 'REPROVADO' : avisos.length ? 'passou c/ aviso' : 'ok'}`);
  for (const p of problemas) console.log(`    x ${p}`);
  for (const v of avisos)    console.log(`    ? ${v}`);
}
console.log(falhas ? `\nVERMELHO: ${falhas} de 8 com marca de rito errada` : '\nVERDE: marcas de rito conferem nos 8');
process.exit(falhas ? 1 : 0);
