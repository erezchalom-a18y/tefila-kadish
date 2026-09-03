/**
 * testar-yahrzeit.mjs — O CALENDARIO HEBRAICO E A DATA DO YAHRZEIT
 * ================================================================
 *
 * Ate 03/09 NADA conferia isto, e e o coracao do "Em memoria de": o
 * hebraico.js converte a data e o yahrzeit.js decide em que dia cai o
 * yahrzeit, por nussach. O testar-linguas.mjs so olhava se o cartao estava
 * traduzido — nunca se o NUMERO estava certo.
 *
 * Foi assim que um defeito real passou: em ano de DOIS Adar o nomeMes chamava
 * o mes 12 de "Adar" e o mes 13 de "Adar I". A data saia certa e o nome saia
 * errado — e o nome e exatamente o que distingue o costume ashkenazi (Adar I)
 * do sefaradi (Adar II). A tela desmentia a explicacao que dava ao lado.
 *
 * Nao usa navegador nem internet: o app tem de funcionar offline, na sinagoga,
 * e a conta e a mesma aqui e la.
 *
 *   node testar-yahrzeit.mjs
 */
globalThis.window = globalThis;
const H = (await import('./hebraico.js')).default || globalThis.Hebraico;
await import('./yahrzeit.js');
const Y = globalThis.Yahrzeit;

let falhas = 0;
const confere = (rotulo, ok, detalhe) => {
  console.log(`${ok ? 'OK   ' : 'FALHA'} ${rotulo}${ok || !detalhe ? '' : `\n        ${detalhe}`}`);
  if (!ok) falhas++;
};

// ---------- 1. a conversao, contra datas que qualquer calendario confirma ----------
const CONHECIDAS = [
  ['Rosh Hashana 5784', [2023, 9, 16], [5784, 7, 1]],
  ['Pessach 5784',      [2024, 4, 23], [5784, 1, 15]],
  ['Rosh Hashana 5785', [2024, 10, 3], [5785, 7, 1]],
  ['Pessach 5785',      [2025, 4, 13], [5785, 1, 15]],
  ['Rosh Hashana 5786', [2025, 9, 23], [5786, 7, 1]],
  ['Yom Kipur 5786',    [2025, 10, 2], [5786, 7, 10]],
  ['Chanuca 5786',      [2025, 12, 15], [5786, 9, 25]],
];
const erradas = [];
for (const [nome, [ga, gm, gd], [ha, hm, hd]] of CONHECIDAS) {
  const h = H.deData(new Date(ga, gm - 1, gd));
  if (h.ano !== ha || h.mes !== hm || h.dia !== hd)
    erradas.push(`${nome}: deu ${h.dia}/${h.mes}/${h.ano}, devia ser ${hd}/${hm}/${ha}`);
}
confere(`as ${CONHECIDAS.length} datas conhecidas convertem certo`, !erradas.length, erradas.join('\n        '));

// ida e volta, dia a dia, por dez anos
let volta = 0;
for (let abs = H.absolutoDeGregoriano(2020, 1, 1); abs <= H.absolutoDeGregoriano(2030, 1, 1); abs++) {
  const h = H.hebraicoDeAbsoluto(abs);
  if (H.absolutoDeHebraico(h.ano, h.mes, h.dia) !== abs) volta++;
}
confere('ida e volta bate nos 3.654 dias de 2020 a 2030', volta === 0, `${volta} dias nao voltaram`);

// ---------- 2. o NOME do mes, que e onde estava o defeito ----------
const nomes = [];
for (const a of [5784, 5785, 5786, 5787, 5788]) {
  const bis = H.ehBissexto(a);
  const m12 = H.nomeMes(a, 12, 'pt');
  if (bis) {
    if (m12 !== 'Adar I') nomes.push(`${a} e bissexto e chamou o mes 12 de "${m12}", devia ser "Adar I"`);
    const m13 = H.nomeMes(a, 13, 'pt');
    if (m13 !== 'Adar II') nomes.push(`${a} e bissexto e chamou o mes 13 de "${m13}", devia ser "Adar II"`);
  } else if (m12 !== 'Adar') {
    nomes.push(`${a} e comum e chamou o mes 12 de "${m12}", devia ser "Adar"`);
  }
}
// e nas 8 linguas o nome nunca pode sair vazio nem repetido entre os dois Adar
for (const l of ['pt', 'en', 'es', 'fr', 'it', 'de', 'ru', 'he']) {
  const a = H.nomeMes(5784, 12, l), b = H.nomeMes(5784, 13, l);
  if (!a || !b) nomes.push(`${l}: nome de mes vazio`);
  if (a === b) nomes.push(`${l}: os dois Adar tem o mesmo nome ("${a}")`);
}
confere('os dois Adar tem o nome certo, nas 8 linguas', !nomes.length, nomes.join('\n        '));

// ---------- 3. a REGRA DO NUSSACH: em qual Adar cai o yahrzeit ----------
// Falecido em 1 de Adar de 5783 (ano COMUM). O ano 5784 tem dois Adar.
// Ashkenazi (ashkenaz, chabad, sefard) marca no Adar I; sefaradi no Adar II.
const morteAdar = new Date(2023, 1, 22);          // 22/02/2023 = 1 Adar 5783
const deAdar = {};
for (const n of ['ashkenaz', 'chabad', 'sefard', 'sefaradi'])
  deAdar[n] = Y.proximoYahrzeit(morteAdar, n, new Date(2024, 0, 1), 'pt');
const mesDe = n => deAdar[n].hebraico.mes;
confere('em ano de dois Adar, ashkenaz/chabad/sefard marcam no Adar I',
  mesDe('ashkenaz') === 12 && mesDe('chabad') === 12 && mesDe('sefard') === 12,
  `deram mes ${mesDe('ashkenaz')}/${mesDe('chabad')}/${mesDe('sefard')}`);
confere('em ano de dois Adar, o sefaradi marca no Adar II',
  mesDe('sefaradi') === 13, `deu mes ${mesDe('sefaradi')}`);
confere('e as duas datas sao MESMO diferentes (senao a regra nao faz nada)',
  deAdar.ashkenaz.data.getTime() !== deAdar.sefaradi.data.getTime(),
  'as duas caem no mesmo dia');
confere('o rotulo diz qual Adar e',
  /Adar I\b/.test(deAdar.ashkenaz.rotulo) && /Adar II/.test(deAdar.sefaradi.rotulo),
  `ashkenaz: "${deAdar.ashkenaz.rotulo}" · sefaradi: "${deAdar.sefaradi.rotulo}"`);
confere('e cada um avisa que ha duas escolas',
  deAdar.ashkenaz.avisos.some(a => /Adar/.test(a)) && deAdar.sefaradi.avisos.some(a => /Adar/.test(a)));

// ---------- 4. o dia 30 num mes que naquele ano so tem 29 ----------
// Cheshvan e Kislev tem 29 ou 30 dias conforme o ano.
let puxou = null;
for (let a = 5780; a < 5800 && !puxou; a++) {
  if (H.diasNoMes(a, 8) !== 30) continue;                       // morreu em 30 de Cheshvan
  const d = H.paraData({ ano: a, mes: 8, dia: 30 });
  for (let b = a + 1; b < a + 6; b++) {
    if (H.diasNoMes(b, 8) === 30) continue;
    const y = Y.proximoYahrzeit(d, 'chabad', H.paraData({ ano: b, mes: 7, dia: 1 }), 'pt');
    if (y && y.hebraico.ano === b) { puxou = { d, y, b }; break; }
  }
}
confere('quem morreu no dia 30 de um mes que noutro ano so tem 29 e puxado para o 29',
  !!puxou && puxou.y.hebraico.dia === 29 && puxou.y.avisos.some(a => /puxada|moved|corri|spost|verschoben|перенес|הוסט|déplacé/i.test(a)),
  puxou ? `caiu no dia ${puxou.y.hebraico.dia} e os avisos foram: ${puxou.y.avisos.length}` : 'nao achei um ano assim');

// ---------- 5. o aviso do anoitecer aparece SEMPRE ----------
// Enquanto o app nao perguntar se foi antes ou depois do por do sol, a duvida
// tem de estar escrita na tela. E a regra deste projeto: a maquina calcula, o
// rabino decide, e o que e duvida aparece como duvida.
const semHora = Y.proximoYahrzeit(new Date(2026, 11, 10), 'sefaradi', new Date(2027, 0, 1), 'pt');
confere('o aviso do anoitecer aparece sempre, porque ninguem perguntou a hora',
  semHora.avisos.some(a => /anoitecer/i.test(a)));

// ---------- 6. o arquivo de calendario ----------
const ics = Y.gerarICS(new Date(2026, 11, 10), 'sefaradi', 'Itzhak ben Yosef', 20, 'pt');
const eventos = (ics.match(/BEGIN:VEVENT/g) || []).length;
const alarmes = (ics.match(/BEGIN:VALARM/g) || []).length;
confere('o .ics traz 20 anos de yahrzeit', eventos === 20, `traz ${eventos}`);
confere('com quatro avisos em cada um', alarmes === eventos * 4, `${alarmes} avisos para ${eventos} eventos`);
confere('e o nome da pessoa em cada evento', (ics.match(/Itzhak ben Yosef/g) || []).length === eventos);
confere('e cada linha termina em CRLF, como o formato exige', !/[^\r]\n/.test(ics));
// as datas do .ics nao podem repetir: um yahrzeit por ano
const dias = (ics.match(/DTSTART;VALUE=DATE:(\d{8})/g) || []).map(s => s.slice(-8));
confere('sem dois yahrzeits no mesmo dia', new Set(dias).size === dias.length);

// ---------- 7. as 8 linguas do cartao ----------
const semTexto = [];
for (const l of ['pt', 'en', 'es', 'fr', 'it', 'de', 'ru', 'he']) {
  const y = Y.proximoYahrzeit(morteAdar, 'sefaradi', new Date(2024, 0, 1), l);
  if (!y || !y.rotulo || !y.avisos.length) { semTexto.push(l); continue; }
  if (l !== 'pt' && y.avisos.some(a => /confirme com seu rabino/.test(a))) semTexto.push(`${l} (sobrou portugues)`);
}
confere('o rotulo e os avisos saem nas 8 linguas, sem portugues sobrando', !semTexto.length, semTexto.join(', '));

console.log(falhas ? `\n${falhas} problema(s) no yahrzeit` : '\nVERDE: o calendario hebraico e a data do yahrzeit conferem');
process.exit(falhas ? 1 : 0);
