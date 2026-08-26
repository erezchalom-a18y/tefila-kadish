/**
 * aplicar-recado.mjs — poe em ancoras.json o recado que o Erez monta na fita.
 *
 * POR QUE EXISTE
 *
 * Desde a fita continua (24/08) ele manda recados de 18, 36 correcoes de uma
 * vez. Conferir isso a mao, recado a recado, e onde o erro entra — e o que
 * entra aqui e o material mais precioso do projeto: o ouvido dele. Entao a
 * conferencia virou codigo, e ela e a mesma toda vez.
 *
 * O QUE ELE CONFERE, ANTES DE ESCREVER QUALQUER COISA
 *
 * 1. O "estava" de cada linha bate com o arquivo de agora. Se nao bater, ele
 *    estava vendo dados velhos (ja aconteceu tres vezes, pelo cache do GitHub
 *    Pages) e o recado inteiro e recusado — nao da para ancorar sobre numeros
 *    que ele nao viu.
 * 2. O nome da palavra bate com o do arquivo naquele verso e naquela posicao.
 * 3. Onde ele pos: em cima de um comeco de voz? dentro de um bloco (palavra
 *    colada, legitimo)? ou no silencio?
 *
 *    No silencio, vale a regra de sempre: o dedo dele aponta, o SINAL da o
 *    numero. Encosta no comeco de voz mais proximo ate ENCOSTO segundos, e o
 *    numero que ele deu fica gravado em inicio_que_ele_deu. Alem disso, nao
 *    encosta: fica onde ele pos, e o relatorio avisa.
 * 4. Se ja havia ancora naquela palavra, a nova ganha (a palavra mais recente
 *    dele e a que vale — foi assim no tushbechata, que ele desdisse), e a
 *    velha vai para _substituidas com o motivo. Nunca se perde.
 *
 * O QUE ELE NUNCA FAZ
 * - nao escreve em sync/ (quem faz isso e o aplicar-ancoras.py, depois);
 * - nao mexe em cortes.json;
 * - nao inventa ancora que ele nao pediu.
 *
 * Uso:
 *   node aplicar-recado.mjs recados/<arquivo>.txt              -> ensaio
 *   node aplicar-recado.mjs recados/<arquivo>.txt --confirmar  -> grava
 *   Depois: python3 aplicar-ancoras.py --confirmar
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ARQ = process.argv[2];
const CONFIRMAR = process.argv.includes('--confirmar');
if (!ARQ) { console.error('uso: node aplicar-recado.mjs <recado.txt> [--confirmar]'); process.exit(2); }

const ENCOSTO = 0.12;   // ate aqui o dedo dele encosta no comeco de voz
const texto = readFileSync(ARQ, 'utf8');

const mAlvo = texto.match(/\(([a-z]+_[a-z]+)\)/);
if (!mAlvo) { console.error('nao achei o nussach no cabecalho do recado (ex.: "(chabad_derabanan)")'); process.exit(2); }
const ALVO = mAlvo[1];
if (!existsSync(`sync/${ALVO}_sync.json`)) { console.error(`nao existe sync/${ALVO}_sync.json`); process.exit(2); }

const pedidos = [...texto.matchAll(
  /verso (\d+), palavra (\d+) \(([^)]*)\)\s*\n\s*estava: ([\d.]+)s\s*\n\s*ponha em: ([\d.]+)s/g)]
  .map(m => ({ verso: +m[1], palavra: +m[2], nome: m[3], era: +m[4], quer: +m[5] }));

const dito = (texto.match(/(\d+)\s+corre..o\(..s\)/) || [])[1];
if (dito !== undefined && Number(dito) !== pedidos.length)
  console.log(`  aviso: o recado diz ${dito} correcoes e eu li ${pedidos.length}`);
if (!pedidos.length) { console.error('nao li nenhuma correcao neste recado'); process.exit(2); }

const sync = JSON.parse(readFileSync(`sync/${ALVO}_sync.json`, 'utf8'));
const sinal = JSON.parse(readFileSync(`sinal/${ALVO}.json`, 'utf8'));
const ancoras = JSON.parse(readFileSync('ancoras.json', 'utf8'));

const falhas = [], linhas = [], novas = [];
for (const p of pedidos) {
  const v = sync.versos.find(x => x.n === p.verso);
  const w = v && v.palavras[p.palavra - 1];
  if (!w) { falhas.push(`§${p.verso} palavra ${p.palavra} nao existe`); continue; }
  if (w.transliteration_pt !== p.nome)
    falhas.push(`§${p.verso} p${p.palavra}: o recado diz "${p.nome}", o arquivo tem "${w.transliteration_pt}"`);
  // o "estava" e o que a pagina mostrou: ela arredonda em dois decimais
  if (Math.abs(Number(w.start.toFixed(2)) - p.era) > 0.005)
    falhas.push(`§${p.verso} p${p.palavra} (${p.nome}): ele viu "estava ${p.era}", ` +
      `o arquivo tem ${w.start.toFixed(2)} — ele estava com dados velhos`);

  // A PRIMEIRA PALAVRA nao pode comecar antes da primeira voz do arquivo: o
  // rabino ainda nao abriu a boca. Quando ele arrasta a primeira para tras, o
  // que ele esta dizendo e "ela comeca antes do que voces puseram" — e o comeco
  // possivel e a primeira voz. Foi o caso do Yitgadal do sefaradi_yatom: ele
  // pos em 0,03, e a primeira voz do arquivo abre aos 0,16.
  const primeiraVoz = Math.min(...sinal.inicios_de_voz);
  if (p.verso === 1 && p.palavra === 1 && p.quer < primeiraVoz) {
    const a = { verso: 1, palavra: 1, inicio: +primeiraVoz.toFixed(3),
      nota: `${p.nome} — recado do Erez (${ARQ}). Ele pos em ${p.quer.toFixed(2)}, antes de ` +
            `qualquer voz; a primeira voz do arquivo abre aos ${primeiraVoz.toFixed(2)} e e ali ` +
            `que a palavra pode comecar.`,
      inicio_que_ele_deu: p.quer };
    novas.push(a);
    linhas.push(`  §${String(p.verso).padStart(2)} p${String(p.palavra).padEnd(2)} ` +
      `${p.nome.padEnd(14)} ${p.era.toFixed(2)} -> ${primeiraVoz.toFixed(2)}   ` +
      `ele pos antes de haver voz; vale a primeira voz do arquivo`);
    continue;
  }
  const onset = sinal.inicios_de_voz.find(x => Math.abs(x - p.quer) < 0.021);
  const bloco = sinal.blocos.find(([a, z]) => p.quer >= a && p.quer <= z);
  let inicio = p.quer, comoFoi = 'em cima do comeco de voz', deu = null;
  if (onset !== undefined) inicio = onset;
  else if (bloco) comoFoi = `dentro do bloco ${bloco[0].toFixed(2)}~${bloco[1].toFixed(2)} (palavra colada)`;
  else {
    let melhor = null, dist = Infinity;
    for (const x of sinal.inicios_de_voz) { const d = Math.abs(x - p.quer); if (d < dist) { dist = d; melhor = x; } }
    if (melhor !== null && dist <= ENCOSTO) {
      deu = p.quer; inicio = melhor;
      comoFoi = `caiu no silencio; encostei na voz de ${melhor.toFixed(2)} (${dist.toFixed(2)}s adiante)`;
    } else {
      comoFoi = `caiu no SILENCIO e a voz mais proxima esta a ${dist.toFixed(2)}s — fica onde ele pos`;
    }
  }
  const a = { verso: p.verso, palavra: p.palavra, inicio: +inicio.toFixed(3),
              nota: `${p.nome} — recado do Erez (${ARQ}). ${comoFoi}.` };
  if (deu !== null) a.inicio_que_ele_deu = deu;
  novas.push(a);
  linhas.push(`  §${String(p.verso).padStart(2)} p${String(p.palavra).padEnd(2)} ` +
    `${p.nome.padEnd(14)} ${p.era.toFixed(2)} -> ${inicio.toFixed(2)}   ${comoFoi}`);
}

console.log(`recado: ${ARQ}\nnussach: ${ALVO} · ${pedidos.length} correcoes\n`);
linhas.forEach(l => console.log(l));

if (falhas.length) {
  console.log(`\nRECUSADO (${falhas.length}) — nao gravo nada:`);
  [...new Set(falhas)].forEach(s => console.log('  ' + s));
  process.exit(1);
}

const velhas = ancoras[ALVO] || [];
const saiu = velhas.filter(v => novas.some(n => n.verso === v.verso && n.palavra === v.palavra));
const ficam = velhas.filter(v => !novas.some(n => n.verso === v.verso && n.palavra === v.palavra));
if (saiu.length) {
  console.log(`\n  ${saiu.length} ancora(s) dele de antes que ESTE recado desdiz:`);
  saiu.forEach(v => console.log(`    §${v.verso} p${v.palavra} estava em ${v.inicio} — ${(v.nota || '').slice(0, 70)}`));
  console.log('  A palavra mais recente dele e a que vale. As velhas vao para _substituidas.');
}

console.log(`\n  ${ficam.length} ancora(s) antigas ficam · ${novas.length} novas · total ${ficam.length + novas.length}`);
if (!CONFIRMAR) { console.log('\nENSAIO — nada foi gravado. Para valer: --confirmar'); process.exit(0); }

ancoras._substituidas = (ancoras._substituidas || []).concat(saiu.map(v => ({
  ...v, nussach: ALVO, por_que_saiu: `O proprio Erez a desdisse no recado ${ARQ}.` })));
ancoras[ALVO] = ficam.concat(novas).sort((x, y) => x.verso - y.verso || x.palavra - y.palavra);
writeFileSync('ancoras.json', JSON.stringify(ancoras, null, 2) + '\n', 'utf8');
console.log(`\ngravado: ancoras.json. Agora rode: python3 aplicar-ancoras.py --confirmar`);
