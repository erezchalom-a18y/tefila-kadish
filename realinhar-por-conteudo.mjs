/**
 * realinhar-por-conteudo.mjs — casa NOSSA palavra com A PALAVRA OUVIDA.
 *
 * POR QUE ISTO EXISTE, E POR QUE O OUTRO NAO BASTOU
 *
 * O realinhar.mjs escolhe, para cada palavra, um comeco de bloco de voz, com
 * uma conta de ritmo (silabas, silencios, palavra corrida) e um empurrao do
 * Whisper. Ele levou os 8 Kadishim a 100% "em cima da voz" — e o Erez continuou
 * ouvindo palavra no verso errado:
 *
 *     "yishtabah continua falado na linha 8 e aparecendo na linha 9"
 *
 * Ele esta certo, e a razao e simples: TODAS as minhas contas so sabem ONDE ha
 * voz. Nenhuma sabe QUAL palavra e. Um alinhamento inteiro deslocado por uma
 * palavra passa em todas elas com nota maxima — cada palavra continua caindo
 * num comeco de voz, continua tendo voz dentro, continua com duracao plausivel.
 * Sao 100% de acerto num arquivo que esta errado do comeco ao fim.
 *
 * A unica testemunha do conteudo e a transcricao do Whisper: ela diz qual
 * palavra soa em cada segundo. Aqui ela nao empurra — ela MANDA:
 *
 *   1. Casa a nossa lista de palavras com a lista ouvida (Needleman-Wunsch por
 *      semelhanca do hebraico, a mesma do revisar-audio-whisper.mjs).
 *   2. Onde casou, a palavra vai para o comeco de bloco de voz mais proximo do
 *      instante em que ela foi OUVIDA. O Whisper diz qual e a palavra; o sinal
 *      da o numero exato. Cada um faz o que sabe.
 *   3. Onde nao casou (o Whisper erra em aramaico liturgico, e pula palavra),
 *      reparte os blocos que sobraram entre as palavras orfas, por silabas.
 *   4. Ancora do Erez continua sendo restricao RIGIDA e ganha de tudo.
 *
 * O QUE ELE NUNCA FAZ
 * - nao mexe em hebraico, transliteracao nem traducao — provado byte a byte;
 * - nao escreve em ancoras.json nem em cortes.json;
 * - nao grava se alguma ancora deixar de valer, se algum tempo deixar de subir,
 *   ou se a concordancia com o que o Whisper ouviu PIORAR.
 *
 * Uso:
 *   node realinhar-por-conteudo.mjs chabad_derabanan              -> ensaio
 *   node realinhar-por-conteudo.mjs chabad_derabanan --ver 12     -> palavra a palavra
 *   node realinhar-por-conteudo.mjs chabad_derabanan --confirmar  -> grava
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { normalizar, semelhanca, alinhar, PARECIDO } from './casar-ouvidas.mjs';

const ALVO = process.argv[2];
const CONFIRMAR = process.argv.includes('--confirmar');
if (!ALVO) { console.error('uso: node realinhar-por-conteudo.mjs <nussach_tipo> [--confirmar]'); process.exit(2); }
if (!existsSync(`whisper/${ALVO}.json`)) {
  console.error(`falta whisper/${ALVO}.json — a transcricao crua.`);
  console.error('Ela e escrita pelo workflow revisao-audio.yml (revisar-audio-whisper.mjs).');
  process.exit(2);
}

const sinal = JSON.parse(readFileSync(`sinal/${ALVO}.json`, 'utf8'));
const sync = JSON.parse(readFileSync(`sync/${ALVO}_sync.json`, 'utf8'));
const antes = JSON.parse(JSON.stringify(sync));
const ancoras = JSON.parse(readFileSync('ancoras.json', 'utf8'))[ALVO] || [];
const ouvidas = JSON.parse(readFileSync(`whisper/${ALVO}.json`, 'utf8')).palavras;

// as normas do casamento moram no casar-ouvidas.mjs — o checar-sincronia.mjs
// usa as mesmas, para as duas ferramentas medirem a mesma coisa.
// ---------- dados ----------
const FALA_INI = sync.fala_inicio ?? 0;
const FIM = sync.fala_fim ?? sync.audio_duration ?? Math.max(...sinal.blocos.map(b => b[1]));
const INI = sinal.blocos.map(b => b[0]).filter(t => t >= FALA_INI - 0.15);
const palavras = sync.versos.flatMap(v => v.palavras.map(p => ({ ...p, verso: v.n })));
palavras.forEach(p => { p.norm = normalizar(p.hebrew); });
ouvidas.forEach(o => { o.norm = normalizar(o.hebrew); });
const N = palavras.length;

const VOGAIS = /[ֱ-ׇ]/g;
const silabas = h => Math.max(1, (String(h).match(VOGAIS) || []).length);

// ---------- 1: o Whisper diz QUAL palavra ----------
const alvoDe = new Array(N).fill(null);   // instante ouvido, por palavra nossa
let casadas = 0;
for (const par of alinhar(palavras, ouvidas)) {
  if (par.ouvida && semelhanca(palavras[par.i].norm, par.ouvida.norm) >= PARECIDO) {
    alvoDe[par.i] = par.ouvida.start; casadas++;
  }
}

// ---------- 2: a ancora manda mais que tudo ----------
for (const a of ancoras) {
  const i = palavras.findIndex(p => p.verso === a.verso && p.i === a.palavra - 1);
  if (i >= 0) alvoDe[i] = a.inicio;
}

// ---------- 3: escolher o bloco ----------
// Cada palavra casada vai para o comeco de bloco mais proximo do que se ouviu.
// As orfas ficam entre as vizinhas casadas, repartidas por silabas — que e a
// unica coisa razoavel a fazer quando ninguem viu aquela palavra.
const escolha = new Int32Array(N).fill(-1);
const usado = new Set();
const maisProximo = (t, de, ate) => {
  let melhor = -1, dist = Infinity;
  for (let j = de; j <= ate; j++) {
    if (usado.has(j)) continue;
    const d = Math.abs(INI[j] - t);
    if (d < dist) { dist = d; melhor = j; }
  }
  return melhor;
};

// PALAVRAS COLADAS: nem toda palavra tem um comeco de bloco so seu.
//
// Este era o no. O rabino diz "Yehe sheme" colado, e o sinal ve UM bloco
// (25.12-26.26). Obrigando cada palavra a comecar num comeco de bloco, o sheme
// era empurrado para o bloco seguinte — e tudo depois dele escorregava uma
// palavra. Foi assim que o veyishtabach, falado aos 31.92, foi parar aos 33.34,
// e o Erez ouviu no verso 8 o que a tela mostrava no 9. Ele estava certo desde
// a primeira vez que reclamou.
//
// Quando ha bloco proprio, o sinal da o numero (ele e mais preciso que o
// Whisper). Quando NAO ha — porque a palavra divide o bloco com a vizinha — o
// numero do Whisper e o que existe, e e ele que vale. E o mesmo principio de
// sempre, so que agora sem forcar: cada um diz o que sabe.
//
// OUVIDA x ORFA — a regra que faltava (24/08)
//
// Uma palavra OUVIDA tem testemunha: o Whisper diz que ela soa naquele
// segundo. Uma palavra ORFA e um palpite nosso: o Whisper nao a reconheceu.
// Na primeira versao as duas disputavam os blocos em pe de igualdade, e o
// palpite ganhava — porque as orfas eram repartidas DEPOIS, por indice de
// bloco, sem olhar o tempo das vizinhas ouvidas.
//
// Deu nisto, no ashkenaz_derabanan: o Whisper partiu "almaya" em "al"+"maya" e
// por isso ela nao casou. Orfa, ela ficou com o comeco de voz dos 34.88 — que
// era o do "Yitbarech", ouvido aos 34.38. Como os tempos tem que subir, o
// Yitbarech foi empurrado para 34.98, e a "almaya" ficou com 0.10s de duracao.
// O verso inteiro comecou 0,6s tarde, e o Erez ouviu:
//
//     "linha 9 audio deveria comecar no itbarach e comeca no veishtabach,
//      o itbarech nao esta marcado, mas e ouvido na linha 8"
//
// Ele estava certo de novo. A mesma coisa acontecia em 21 palavras dos 8.
//
// Agora: as ouvidas escolhem primeiro; as orfas so podem ocupar o BURACO DE
// TEMPO que sobrou entre duas ouvidas, repartido por silabas. Palpite nunca
// empurra testemunha. E nenhuma palavra pode acabar com menos de MIN_DUR — se
// acabar, e artefato de atropelo e o script nao grava.
const COLADA = 0.25;    // acima disto, nao ha bloco proprio para esta palavra
const MIN_DUR = 0.20;   // palavra mais curta que isto nao e fala, e atropelo
const PERTO_ORFA = 0.35; // orfa so encosta num comeco de voz se estiver a isto

const ancorado = new Array(N).fill(false);
for (const a of ancoras) {
  const i = palavras.findIndex(p => p.verso === a.verso && p.i === a.palavra - 1);
  if (i >= 0) ancorado[i] = true;
}

let piso = 0, coladas = 0;
const tempo = new Array(N).fill(null);
for (let i = 0; i < N; i++) {
  if (alvoDe[i] === null) continue;
  // Ancora do Erez e ouvido dele: vale o numero exato que ele deu, sem encostar
  // em bloco nenhum. Encostar podia move-la ate 0.25s e ela deixaria de valer.
  if (ancorado[i]) { tempo[i] = alvoDe[i]; continue; }
  const teto = INI.length - (N - 1 - i);
  const j = maisProximo(alvoDe[i], piso, Math.max(piso, teto - 1));
  if (j >= 0 && Math.abs(INI[j] - alvoDe[i]) <= COLADA) {
    escolha[i] = j; usado.add(j); piso = j + 1; tempo[i] = INI[j];
  } else {
    // Sem bloco proprio: vale o instante ouvido, preso dentro da fala. O
    // Whisper costuma marcar a primeira palavra em 0.00, antes do corte do
    // audio — e o corte foi conferido de ouvido pelo Erez e esta no
    // cortes.json, entao ele manda.
    tempo[i] = Math.min(Math.max(alvoDe[i], FALA_INI), FIM - 0.2); coladas++;
  }
}

// ---------- 4: as orfas, dentro do buraco que as ouvidas deixaram ----------
let orfasN = 0;
for (let i = 0; i < N; i++) {
  if (tempo[i] !== null) continue;
  let a = i - 1; while (a >= 0 && tempo[a] === null) a--;
  let b = i + 1; while (b < N && tempo[b] === null) b++;
  const orfas = [];
  for (let k = a + 1; k < (b < N ? b : N); k++) orfas.push(k);
  orfasN += orfas.length;

  const de  = a >= 0 ? tempo[a] : FALA_INI;
  const ate = b < N  ? tempo[b] : FIM;
  // o buraco se reparte por silabas entre a palavra de tras (que tambem precisa
  // durar) e as orfas. Quando nao ha palavra de tras, a primeira orfa e o
  // comeco da fala — o corte do Erez manda.
  const pesos = (a >= 0 ? [silabas(palavras[a].hebrew)] : [0])
    .concat(orfas.map(k => silabas(palavras[k].hebrew)));
  const total = pesos.reduce((x, y) => x + y, 0) || 1;
  let acc = pesos[0];
  const ideal = orfas.map(k => { const t = de + (ate - de) * (acc / total); acc += silabas(palavras[k].hebrew); return t; });

  // e onde houver um comeco de voz livre pertinho do ideal, e ele que vale —
  // o sinal e mais preciso que qualquer reparticao nossa.
  let anterior = de;
  orfas.forEach((k, x) => {
    let t = a >= 0 ? ideal[x] : (x === 0 ? FALA_INI : ideal[x]);
    let melhor = -1, dist = Infinity;
    for (let j = 0; j < INI.length; j++) {
      if (usado.has(j)) continue;
      if (INI[j] <= anterior + 0.001 || INI[j] >= ate - 0.001) continue;
      const d = Math.abs(INI[j] - t);
      if (d < dist) { dist = d; melhor = j; }
    }
    if (melhor >= 0 && dist <= PERTO_ORFA) { t = INI[melhor]; usado.add(melhor); escolha[k] = melhor; }
    tempo[k] = t;
    anterior = t;
  });
  i = b - 1;
}

// o tempo final ja esta todo em tempo[]
const novo = tempo.map(t => +Number(t).toFixed(3));
// ---------- 5: encostar na voz ----------
// O instante do Whisper e grosso: ele marca a palavra no quadro dele, que pode
// cair no SILENCIO entre dois blocos de voz. Palavra nao comeca onde nao ha
// voz — quando o risco aparece, o rabino tem que estar falando.
//
// Aqui cada uma dessas encosta na voz: para a frente, no comeco do proximo
// bloco (o normal — o marcador chegou cedo, a voz dela ainda vem); e, quando o
// proximo bloco ja e da palavra seguinte, para tras, para dentro do bloco
// anterior, onde ela esta colada na vizinha. No maximo ENCOSTAR segundos, e
// nunca por cima de uma ancora do Erez nem da vizinha.
// A voz da palavra vem SEMPRE depois do marcador que caiu no silencio — o
// rabino ainda nao a disse. Por isso o alcance para a FRENTE e generoso e o
// alcance para TRAS e curto: encostar para tras poe a palavra no fim da voz da
// vizinha, e ele ouve a vizinha, nao ela.
//
// O Erez achou isto de ouvido: "algumas palavras cortam no meio como purkane,
// so vejo o audio de pur...". No chabad_yatom o purkane foi ouvido aos 11.20,
// no silencio; a voz dele abre aos 11.54, a 0.34s — um triz alem do alcance de
// 0.30 que eu tinha posto. Sem alcance para a frente, ele recuou para 11.08, o
// fio final do bloco do "veyatsmach" (10.68~11.10). Tocar a palavra dava o
// rabo do veyatsmach, silencio, e so entao o purkane.
const ENCOSTAR = 0.45;        // para a frente: ate aqui, a voz dela
const ENCOSTAR_TRAS = 0.12;   // para tras: so um fio, e so quando nao ha frente
// no fio final de um bloco a voz ja e da palavra de tras morrendo. Estar ali
// nao e estar na voz: o 'sheme' do ashkenaz_derabanan foi parar em 2.64, a
// 0.02s do fim do bloco do 'veyitkadash', quando a voz dele comeca em 3.08.
const SOBRA = 0.10;
const EPS = 1e-6;   // 3.08-2.78 da 0.30000000000000027, e recuava por isso
let encostadas = 0;
for (let i = 0; i < N; i++) {
  if (ancorado[i]) continue;
  const t = novo[i];
  // ja esta na voz? (o fio final do bloco nao conta — ali a voz e da de tras)
  if (sinal.blocos.some(([a, z]) => t >= a && z - t > Math.min(SOBRA, (z - a) / 2))) continue;
  const antesDe = i + 1 < N ? novo[i + 1] : FIM;
  const depoisDe = i > 0 ? novo[i - 1] : FALA_INI - 0.001;
  const seguinte = sinal.blocos.find(([a]) => a > t);
  const anterior = [...sinal.blocos].reverse().find(([a, z]) => z < t || (t >= a && z - t <= Math.min(SOBRA, (z - a) / 2)));
  let alvo = null;
  if (seguinte && seguinte[0] - t <= ENCOSTAR + EPS && seguinte[0] < antesDe && seguinte[0] > depoisDe)
    alvo = seguinte[0];
  else if (anterior && t - anterior[1] <= ENCOSTAR_TRAS + EPS) {
    const c = +(anterior[1] - 0.02).toFixed(3);
    if (c < antesDe && c > depoisDe) alvo = c;
  }
  if (alvo !== null) { novo[i] = +alvo.toFixed(3); encostadas++; }
}
if (encostadas) console.log(`  ${encostadas} palavra(s) caiam no silencio: encostadas na voz mais proxima`);

// os tempos tem que subir sempre, e nenhuma palavra pode ficar mais curta que
// MIN_DUR. Antes isto se tapava com um empurrao fixo de 0.10s — era o que
// fabricava as palavras de 0.10s. Agora ha duas situacoes, e elas sao
// diferentes:
//
//   a) ATROPELO GRANDE (uma palavra caiu depois da seguinte): erro de lugar.
//      Reparte-se o trecho entre as duas pontas firmes, por posicao.
//   b) PALAVRA COLADA (o 'di', o 'veal', o 'hu' — uma silaba so, engolida na
//      vizinha): o Whisper da o MESMO instante para as duas porque ha um
//      trecho de voz que e das duas. Nao ha erro de lugar; reparte-se o
//      pedacinho que falta entre as duas, meio a meio.
//
// Nenhum dos dois pode andar mais que TETO_REPARO com uma palavra. Se
// precisasse, nao e coladinha: e defeito, e a prova do MIN_DUR reprova.
const TETO_REPARO = 0.30;
// o reparo mira um fio acima do piso: mirando no piso exato, o arredondamento
// dos milesimos deixava a palavra em 0.199s e a propria prova reprovava.
const ALVO_DUR = MIN_DUR + 0.01;
const movido = new Array(N).fill(0);
for (let i = 1; i < N; i++) {
  if (novo[i] > novo[i - 1]) continue;
  let fim = i; while (fim + 1 < N && novo[fim + 1] <= novo[i - 1]) fim++;
  const de = novo[i - 1], ate = fim + 1 < N ? novo[fim + 1] : FIM;
  const qtd = fim - i + 2;   // a de tras tambem precisa de espaco
  for (let k = i; k <= fim; k++) novo[k] = +(de + (ate - de) * ((k - i + 1) / qtd)).toFixed(3);
}
for (let passe = 0; passe < 12; passe++) {
  let mexeu = false;
  for (let i = 1; i < N; i++) {
    const falta = ALVO_DUR - (novo[i] - novo[i - 1]);
    if (falta <= 0.0005) continue;
    const podeA = i - 1 > 0 && !ancorado[i - 1] && movido[i - 1] + falta / 2 <= TETO_REPARO;
    const podeB = i < N - 1 && !ancorado[i] && movido[i] + falta / 2 <= TETO_REPARO;
    let recua = 0, avanca = 0;
    if (podeA && podeB) { recua = falta / 2; avanca = falta / 2; }
    else if (podeA && movido[i - 1] + falta <= TETO_REPARO) recua = falta;
    else if (podeB && movido[i] + falta <= TETO_REPARO) avanca = falta;
    else continue;
    if (recua) { novo[i - 1] = +(novo[i - 1] - recua).toFixed(3); movido[i - 1] += recua; }
    if (avanca) { novo[i] = +(novo[i] + avanca).toFixed(3); movido[i] += avanca; }
    mexeu = true;
  }
  if (!mexeu) break;
}
if (coladas) console.log(`  ${coladas} palavra(s) sem bloco proprio (ditas coladas): vale o instante ouvido`);
if (orfasN) console.log(`  ${orfasN} palavra(s) que o Whisper nao reconheceu: repartidas no buraco entre as ouvidas`);

// ---------- medir ----------
const antesStarts = palavras.map(p => p.start);
function concorda(starts) {
  let perto = 0, soma = 0, n = 0;
  for (let i = 0; i < N; i++) {
    if (alvoDe[i] === null) continue;
    n++; const d = Math.abs(starts[i] - alvoDe[i]);
    soma += d; if (d <= 0.5) perto++;
  }
  return { perto, n, erro: (soma / (n || 1)).toFixed(2) };
}
const cA = concorda(antesStarts), cD = concorda(novo);
console.log(`${ALVO}   ${N} palavras · ${ouvidas.length} ouvidas · ${casadas} casadas · ${ancoras.length} ancora(s)`);
console.log(`  concorda com o que o Whisper ouviu: ${cA.perto}/${cA.n} -> ${cD.perto}/${cD.n}` +
            `   (erro medio ${cA.erro}s -> ${cD.erro}s)`);
console.log(`  ${novo.filter((t, i) => Math.abs(t - antesStarts[i]) > 0.02).length} de ${N} palavras mudam de lugar`);

if (process.argv.includes('--ver')) {
  const q = Number(process.argv[process.argv.indexOf('--ver') + 1] || '12');
  console.log('\n  palavra           era      fica    ouvida em');
  for (let i = 0; i < Math.min(q, N); i++)
    console.log('  ' + (palavras[i].transliteration_pt || palavras[i].hebrew).padEnd(16) +
      antesStarts[i].toFixed(2).padStart(6) + '  ' + novo[i].toFixed(2).padStart(7) + '  ' +
      (alvoDe[i] === null ? '   —' : alvoDe[i].toFixed(2).padStart(7)));
  console.log('');
}

// ---------- gravar e provar ----------
let k = 0;
for (const v of sync.versos) {
  for (const p of v.palavras) { p.start = novo[k]; p.end = k + 1 < N ? novo[k + 1] : FIM; k++; }
  v.start = v.palavras[0].start;
  v.end = v.palavras.at(-1).end;
}

const falhas = [];
antes.versos.forEach((va, vi) => {
  const v = sync.versos[vi];
  if (v.hebrew !== va.hebrew) falhas.push(`§${v.n}: mudou o hebraico do verso`);
  if (v.translation_pt !== va.translation_pt) falhas.push(`§${v.n}: mudou a traducao`);
  if (v.transliteration_pt !== va.transliteration_pt) falhas.push(`§${v.n}: mudou a transliteracao`);
  va.palavras.forEach((pa, pi) => {
    const p = v.palavras[pi];
    if (p.hebrew !== pa.hebrew) falhas.push(`§${v.n}: mudou o hebraico de uma palavra`);
    if (p.transliteration_pt !== pa.transliteration_pt) falhas.push(`§${v.n}: mudou uma transliteracao`);
    if (p.glosa_pt !== pa.glosa_pt) falhas.push(`§${v.n}: mudou uma glosa`);
    if (p.start >= p.end) falhas.push(`§${v.n} ${p.transliteration_pt}: tempo nao sobe`);
    else if (p.end - p.start < MIN_DUR)
      falhas.push(`§${v.n} ${p.transliteration_pt}: ficou com ${(p.end - p.start).toFixed(2)}s — palavra espremida (atropelo)`);
  });
});
for (const a of ancoras) {
  const v = sync.versos.find(x => x.n === a.verso);
  const p = v && v.palavras.find(x => x.i === a.palavra - 1);
  if (p && Math.abs(p.start - a.inicio) > 0.05)
    falhas.push(`ANCORA desrespeitada: §${a.verso} palavra ${a.palavra} devia comecar em ${a.inicio}, ficou em ${p.start}`);
}
if (sync.fala_inicio != null && Math.abs(sync.versos[0].start - sync.fala_inicio) > 0.15)
  falhas.push(`o primeiro verso comeca em ${sync.versos[0].start}, e a fala em ${sync.fala_inicio}`);
if (Math.abs(sync.versos.at(-1).end - FIM) > 0.15)
  falhas.push(`o ultimo verso acaba em ${sync.versos.at(-1).end}, e a fala em ${FIM}`);
if (cD.perto < cA.perto)
  falhas.push(`concorda MENOS com o Whisper que antes (${cA.perto} -> ${cD.perto}). Nao gravo.`);

if (falhas.length) {
  console.log(`\nPROVAS FALHARAM (${falhas.length}) — nao gravo nada:`);
  [...new Set(falhas)].slice(0, 12).forEach(s => console.log('  ' + s));
  process.exit(1);
}
console.log('  provas: texto intacto, tempos sobem, ancoras valendo, bordas da fala certas.');

if (!CONFIRMAR) { console.log('\nENSAIO — nada foi gravado. Para valer: --confirmar'); process.exit(0); }
writeFileSync(`sync/${ALVO}_sync.json`, JSON.stringify(sync, null, 2) + '\n', 'utf8');
console.log(`\ngravado: sync/${ALVO}_sync.json`);
