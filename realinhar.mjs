/**
 * realinhar.mjs — poe as palavras nos blocos de voz do rabino.
 *
 * POR QUE EXISTE
 * O Erez, depois de ver o desenho: "ainda trava no raba, acho que tem que
 * acertar o audio inteiro". Ele tinha razao, e o quadro no chabad_derabanan
 * era este:
 *
 *     Yitgadal     pega b1+b2   certo
 *     veyitkadash  pega b3      devia pegar b3+b4
 *     shemê        pega b4      devia pegar b5
 *     raba         pega b5      devia pegar b6
 *     bealma       pega b6      devia pegar b7
 *     verá         pega NADA    devia pegar b9
 *
 * Tudo deslocado um bloco a partir da segunda palavra. Ancora nao conserta
 * isso: seriam 120 ancoras num arquivo que e so o ouvido dele. E deslocar tudo
 * um bloco tambem nao, porque as palavras que ocupam DOIS blocos ficariam
 * erradas — medi, e nao melhora em Kadish nenhum.
 *
 * O CLAUDE.md descreve o alinhador original: "distribui as palavras por
 * programacao dinamica com peso = silabas (contadas pelo nikud)". Ele nunca foi
 * commitado. Este e ele de novo, e so isso: nao inventa tempo, so escolhe, para
 * cada palavra, em qual COMECO DE BLOCO ela entra. Todo tempo que sai daqui e
 * um instante em que o sinal viu a voz comecar.
 *
 * O QUE ELE NUNCA FAZ
 * - nao mexe em hebraico, transliteracao nem traducao — provado byte a byte;
 * - nao escreve em ancoras.json nem em cortes.json;
 * - nao desrespeita ancora: cada uma e restricao RIGIDA, e se alguma nao ficar
 *   valendo no fim, ele nao grava nada;
 * - nao grava se a conta de defeitos PIORAR. Realinhamento que piora nao e
 *   realinhamento, e estrago.
 *
 * O QUE ELE AINDA NAO RESOLVE — LEIA ANTES DE CONFIAR
 * Rodei no chabad_derabanan e ele zerou a conta: 24 defeitos -> 0, 100% das
 * palavras em cima da voz. E MESMO ASSIM estava errado. Duas provas:
 *   - deu ao "Yitgadal" so o bloco b1 (0,26s, tres silabas) e ao
 *     "veyitkadash" os blocos b2+b3, o que nao se sustenta;
 *   - nao mexeu no raba, que era a reclamacao do Erez.
 * Ou seja: a conta de defeitos NAO distingue o alinhamento certo do
 * deslocado. Ela so diz que cada palavra comeca num comeco de voz e tem voz
 * dentro — e um alinhamento deslocado por um bloco satisfaz isso igualzinho.
 * Por isso o resultado foi revertido, e por isso este script nao deve ser
 * usado para gravar enquanto nao tiver uma testemunha do CONTEUDO, e nao so
 * do ritmo: o Whisper diz QUAL palavra soa em cada segundo, e e isso que
 * falta entrar aqui.
 *
 * Uso:
 *   node realinhar.mjs chabad_derabanan              -> ensaio, so mostra
 *   node realinhar.mjs chabad_derabanan --confirmar  -> grava
 */
import { readFileSync, writeFileSync } from 'node:fs';

const ALVO = process.argv[2];
const CONFIRMAR = process.argv.includes('--confirmar');
if (!ALVO) { console.error('uso: node realinhar.mjs <nussach_tipo> [--confirmar]'); process.exit(2); }

const sinal = JSON.parse(readFileSync(`sinal/${ALVO}.json`, 'utf8'));
const sync = JSON.parse(readFileSync(`sync/${ALVO}_sync.json`, 'utf8'));
const antes = JSON.parse(JSON.stringify(sync));
const ancoras = (JSON.parse(readFileSync('ancoras.json', 'utf8'))[ALVO] || []);

// A TESTEMUNHA DO CONTEUDO.
// O sinal sabe ONDE ha voz; nao sabe QUAL palavra e. Por isso a primeira versao
// deste script zerou a conta e continuou errada — um alinhamento deslocado um
// bloco tem toda palavra em cima de voz, igualzinho. O Whisper diz qual palavra
// soa em cada segundo; ele erra em aramaico liturgico, entao aqui nao manda:
// so puxa. A pena so comeca depois de 0,35s de diferenca, e o sinal continua
// dando o numero exato (a palavra sempre entra num comeco de bloco).
let ouvido = new Map();   // indice da palavra -> segundo em que o Whisper ouviu
try {
  const w = JSON.parse(readFileSync('fontes/whisper-tempos.json', 'utf8')).tempos[ALVO] || [];
  for (const e of w) ouvido.set(`${e.verso}|${e.hebrew}`, e.ouvido);
} catch (err) { /* sem transcricao, o script segue so com o sinal */ }

// So valem os blocos DENTRO da fala. O corte do audio foi conferido de ouvido
// pelo Erez e esta no cortes.json; o arquivo declara fala_inicio e fala_fim.
// No sefaradi_yatom ha um bloco aos 0.16s — uma respiracao antes de comecar —
// e o realinhador pos a primeira palavra ali. O checar.mjs reprovou, com razao.
const FALA_INI = sync.fala_inicio ?? 0;
const INI = sinal.blocos.map(b => b[0]).filter(t => t >= FALA_INI - 0.15);
// O fim da fala e o que o PROPRIO arquivo declara (fala_fim), nao o fim do
// ultimo bloco de voz. O checar.mjs cobra isso, e com razao: o corte do audio
// foi conferido de ouvido pelo Erez e esta no cortes.json. Usar o ultimo bloco
// deixava o ultimo verso 0,15s curto e reprovava a checagem.
const FIM_AUDIO = sync.fala_fim ?? sync.audio_duration ?? Math.max(...sinal.blocos.map(b => b[1]));
const palavras = sync.versos.flatMap(v => v.palavras.map(p => ({ ...p, verso: v.n })));
const N = palavras.length, M = INI.length;

if (M < N) { console.error(`so ha ${M} blocos de voz para ${N} palavras — nao da para alinhar`); process.exit(1); }

// ---------- peso: silabas contadas pelo nikud ----------
// Cada vogal e uma silaba. O shva sozinho nao conta (na maior parte das vezes e
// mudo); onde a palavra ficaria com zero, vale 1.
const VOGAIS = /[ֱ-ׇֻ]/g;
const silabas = h => Math.max(1, (String(h).match(VOGAIS) || []).length);
const peso = palavras.map(p => silabas(p.hebrew));
const pesoTotal = peso.reduce((a, b) => a + b, 0);

// ---------- ancoras: restricao rigida ----------
// Cada ancora diz "a palavra P do verso V comeca em T". Aqui vira "a palavra de
// indice i tem que entrar no bloco cujo comeco e T".
const fixo = new Map();   // indice da palavra -> indice do bloco
const semBloco = [];
for (const a of ancoras) {
  const i = palavras.findIndex(p => p.verso === a.verso && p.i === a.palavra - 1);
  if (i < 0) continue;
  let j = -1, melhor = Infinity;
  INI.forEach((x, k) => { const d = Math.abs(x - a.inicio); if (d < melhor) { melhor = d; j = k; } });
  if (melhor > 0.05) { semBloco.push(`${a.nota || ''} (${a.inicio}s)`); continue; }
  fixo.set(i, j);
}

// ---------- programacao dinamica ----------
// Escolher, para cada palavra i, um bloco j(i), com j crescente. O custo de um
// trecho e o quanto o TEMPO dado a palavra foge do tempo que ela merece pelo
// peso em silabas. E so isso: nenhuma regra escrita a mao sobre esta ou aquela
// palavra.
const T0 = INI[0], T1 = FIM_AUDIO;
const duracaoJusta = i => (peso[i] / pesoTotal) * (T1 - T0);

// CUSTO ESTRUTURAL de uma palavra ocupar de INI[k] ate INI[j].
//
// Distribuir tempo por silaba nao basta. Rodei so com isso e o resultado
// reprovou no controle: no chabad_yatom, que o Erez ja conferiu de ouvido, ele
// queria mexer em 28 palavras e PIORAVA a conta de 2 para 5. Entao o que a
// gente mede entra no custo, e nao so no julgamento do fim:
//   - palavra sem bloco de voz nenhum dentro (muda) e quase sempre erro;
//   - palavra com silencio grande e depois mais voz esta engolindo a seguinte.
// Um pedaco de silencio no meio da palavra pode ser legitimo — o rabino
// respira —, entao a pena e alta mas nao infinita.
const PENA_MUDA = 6, PENA_ENGOLE = 4, PENA_CORRIDA = 5;
// Abaixo disto a palavra nao cabe no tempo que recebeu. Apareceu o meshichêh
// com 0,10s e o carív com 0,22s para duas silabas — a conta ficava boa em tudo
// o mais e a palavra passava correndo na tela.
const POR_SILABA_MIN = 0.16;
const PESO_WHISPER = 3, FOLGA_WHISPER = 0.35;
const SILENCIO_CUSTO = 0.35;
const estrutural = [];
for (let k = 0; k < M; k++) {
  const linha = new Float64Array(M).fill(0);
  for (let j = k + 1; j < M; j++) {
    const a = INI[k], z = INI[j];
    const dentro = sinal.blocos.filter(([x, y]) => { const mid = (x + y) / 2; return mid >= a && mid < z; });
    let c = 0;
    if (!dentro.length) c += PENA_MUDA;
    else for (let t = 1; t < dentro.length; t++)
      if (dentro[t][0] - dentro[t - 1][1] >= SILENCIO_CUSTO) { c += PENA_ENGOLE; break; }
    linha[j] = c;
  }
  estrutural.push(linha);
}

const INF = Infinity;
const custo = Array.from({ length: N }, () => new Float64Array(M).fill(INF));
const de = Array.from({ length: N }, () => new Int32Array(M).fill(-1));

// O que o Whisper diz sobre a palavra i comecar no bloco j
const ouvidoDe = i => ouvido.get(`${palavras[i].verso}|${palavras[i].hebrew}`);
const custoWhisper = (i, j) => {
  const w = ouvidoDe(i);
  if (w === undefined) return 0;
  return PESO_WHISPER * Math.max(0, Math.abs(INI[j] - w) - FOLGA_WHISPER);
};

const podeAqui = (i, j) => {
  const f = fixo.get(i);
  if (f !== undefined) return j === f;
  for (const [k, b] of fixo) {           // nao passar por cima de ancora vizinha
    if (k < i && j <= b) return false;
    if (k > i && j >= b) return false;
  }
  return true;
};

for (let j = 0; j < M; j++) if (podeAqui(0, j)) custo[0][j] = Math.abs(INI[j] - T0) + custoWhisper(0, j);

for (let i = 1; i < N; i++) {
  for (let j = i; j < M; j++) {
    if (!podeAqui(i, j)) continue;
    let melhor = INF, arg = -1;
    for (let k = i - 1; k < j; k++) {
      if (custo[i - 1][k] === INF) continue;
      const dur = INI[j] - INI[k];
      const corrida = (dur / peso[i - 1]) < POR_SILABA_MIN ? PENA_CORRIDA : 0;
      const c = custo[i - 1][k] + Math.abs(dur - duracaoJusta(i - 1)) + estrutural[k][j]
              + custoWhisper(i, j) + corrida;
      if (c < melhor) { melhor = c; arg = k; }
    }
    custo[i][j] = melhor; de[i][j] = arg;
  }
}

let fim = -1, melhorFim = INF;
for (let j = N - 1; j < M; j++) {
  const c = custo[N - 1][j] + Math.abs((T1 - INI[j]) - duracaoJusta(N - 1));
  if (c < melhorFim) { melhorFim = c; fim = j; }
}
if (fim < 0) { console.error('nao achei alinhamento possivel (as ancoras se contradizem?)'); process.exit(1); }

const escolha = new Int32Array(N);
for (let i = N - 1, j = fim; i >= 0; i--) { escolha[i] = j; j = de[i][j]; }

// ---------- medir antes e depois ----------
const M_CORTE = 0.08, SILENCIO = 0.35;
function defeitos(starts) {
  let c = 0, m = 0, e = 0, olhar = 0;
  for (let i = 0; i < N; i++) {
    const a = starts[i], z = i + 1 < N ? starts[i + 1] : FIM_AUDIO;
    let dist = INF;
    for (const x of sinal.inicios_de_voz) dist = Math.min(dist, Math.abs(x - a));
    if (dist > 0.15) olhar++;
    const dentro = sinal.blocos.filter(([x, y]) => { const mid = (x + y) / 2; return mid >= a && mid < z; });
    if (sinal.blocos.find(([x, y]) => z > x + M_CORTE && z < y - M_CORTE)) c++;
    else if (!dentro.length) m++;
    else { for (let k = 1; k < dentro.length; k++) if (dentro[k][0] - dentro[k - 1][1] >= SILENCIO) { e++; break; } }
  }
  return { olhar, partida: c, muda: m, engolindo: e, total: c + m + e };
}

const antesStarts = palavras.map(p => p.start);
const depoisStarts = Array.from(escolha, j => INI[j]);
const dA = defeitos(antesStarts), dD = defeitos(depoisStarts);

const mostra = d => `${String(d.olhar).padStart(3)} para olhar · ` +
  `${String(d.partida).padStart(2)} partidas · ${String(d.muda).padStart(2)} mudas · ` +
  `${String(d.engolindo).padStart(2)} engolindo`;
console.log(`${ALVO}   ${N} palavras, ${M} blocos de voz, ${fixo.size} ancora(s)`);
if (semBloco.length) console.log(`  ATENCAO: ${semBloco.length} ancora(s) nao caem em comeco de bloco: ${semBloco.join('; ')}`);
console.log(`  antes:  ${mostra(dA)}`);
console.log(`  depois: ${mostra(dD)}`);

const mexidas = depoisStarts.filter((t, i) => Math.abs(t - antesStarts[i]) > 0.02).length;
console.log(`  ${mexidas} de ${N} palavras mudam de lugar`);

// Concordancia com o Whisper: e a unica medida aqui que fala de CONTEUDO.
if (ouvido.size) {
  const perto = (starts) => {
    let n = 0, soma = 0, quantos = 0;
    for (let i = 0; i < N; i++) {
      const w = ouvidoDe(i); if (w === undefined) continue;
      quantos++; soma += Math.abs(starts[i] - w);
      if (Math.abs(starts[i] - w) <= 0.5) n++;
    }
    return { n, quantos, media: (soma / quantos).toFixed(2) };
  };
  const a = perto(antesStarts), b = perto(depoisStarts);
  console.log(`  concorda com o que o Whisper ouviu: ${a.n}/${a.quantos} -> ${b.n}/${b.quantos}` +
              `  (erro medio ${a.media}s -> ${b.media}s)`);
}

// ---------- olhar de perto, antes de acreditar ----------
// Numero bom nao e prova. A primeira versao zerou a conta e estava errada; o
// que a pegou foi olhar palavra por palavra no comeco do Kadish.
if (process.argv.includes('--ver')) {
  const quantos = Number((process.argv[process.argv.indexOf('--ver') + 1] || '10'));
  console.log('\n  palavra          era        fica       blocos que pega       Whisper');
  for (let i = 0; i < Math.min(quantos, N); i++) {
    const a = depoisStarts[i], z = i + 1 < N ? depoisStarts[i + 1] : FIM_AUDIO;
    const dentro = sinal.blocos
      .map((b, k) => [b, k]).filter(([b]) => { const mid = (b[0] + b[1]) / 2; return mid >= a && mid < z; })
      .map(([, k]) => 'b' + (k + 1));
    const w = ouvidoDe(i);
    console.log('  ' + (palavras[i].transliteration_pt || palavras[i].hebrew).padEnd(15) +
      antesStarts[i].toFixed(2).padStart(6) + '  ' + a.toFixed(2).padStart(8) + '     ' +
      (dentro.join(',') || 'NADA').padEnd(20) + (w === undefined ? '—' : w.toFixed(2)));
  }
  console.log('');
}

// ---------- escrever no objeto e provar ----------
let k = 0;
for (const v of sync.versos) {
  for (const p of v.palavras) { p.start = depoisStarts[k]; p.end = k + 1 < N ? depoisStarts[k + 1] : FIM_AUDIO; k++; }
  v.start = v.palavras[0].start;
  v.end = v.palavras[v.palavras.length - 1].end;
}

const falhas = [];
let i2 = 0;
for (const [vi, v] of sync.versos.entries()) {
  const va = antes.versos[vi];
  if (v.hebrew !== va.hebrew) falhas.push(`§${v.n}: mudou o hebraico do verso`);
  if (v.translation_pt !== va.translation_pt) falhas.push(`§${v.n}: mudou a traducao`);
  if (v.transliteration_pt !== va.transliteration_pt) falhas.push(`§${v.n}: mudou a transliteracao`);
  for (const [pi, p] of v.palavras.entries()) {
    const pa = va.palavras[pi];
    if (p.hebrew !== pa.hebrew) falhas.push(`§${v.n}: mudou o hebraico de uma palavra`);
    if (p.transliteration_pt !== pa.transliteration_pt) falhas.push(`§${v.n}: mudou a transliteracao de uma palavra`);
    if (p.glosa_pt !== pa.glosa_pt) falhas.push(`§${v.n}: mudou uma glosa`);
    if (p.start >= p.end) falhas.push(`§${v.n} ${p.transliteration_pt}: tempo nao sobe (${p.start} -> ${p.end})`);
    if (i2 > 0 && p.start < depoisStarts[i2 - 1]) falhas.push(`§${v.n}: tempo andou para tras`);
    i2++;
  }
}
for (const a of ancoras) {
  const v = sync.versos.find(x => x.n === a.verso);
  const p = v && v.palavras.find(x => x.i === a.palavra - 1);
  if (!p) continue;
  if (Math.abs(p.start - a.inicio) > 0.001)
    falhas.push(`ANCORA desrespeitada: §${a.verso} palavra ${a.palavra} devia comecar em ${a.inicio}, ficou em ${p.start}`);
}
if (dD.total > dA.total)
  falhas.push(`o realinhamento PIORA (${dA.total} -> ${dD.total} defeitos). Nao gravo.`);
// as mesmas duas bordas que o checar.mjs cobra
if (sync.fala_inicio != null && Math.abs(sync.versos[0].start - sync.fala_inicio) > 0.15)
  falhas.push(`o primeiro verso comeca em ${sync.versos[0].start}, e a fala comeca em ${sync.fala_inicio}`);
const fimDeclarado = sync.fala_fim ?? sync.audio_duration;
if (fimDeclarado != null && Math.abs(sync.versos.at(-1).end - fimDeclarado) > 0.15)
  falhas.push(`o ultimo verso acaba em ${sync.versos.at(-1).end}, e a fala acaba em ${fimDeclarado}`);

if (falhas.length) {
  console.log(`\nPROVAS FALHARAM (${falhas.length}) — nao gravo nada:`);
  [...new Set(falhas)].slice(0, 12).forEach(s => console.log('  ' + s));
  process.exit(1);
}
console.log('  provas: texto intacto, tempos sobem, todas as ancoras valendo, e a conta melhora.');

// NAO REALINHAR O QUE O OUVIDO DELE JA ARRUMOU.
//
// No chabad_yatom, que o Erez conferiu de ponta a ponta, este script quer mexer
// em 24 das 80 palavras para ganhar UM defeito. As 21 ancoras dele sao
// respeitadas, mas as outras 59 palavras ele tambem ouviu, uma a uma, e nao
// deixaram marca escrita. Trocar isso por um palpite de programa e perder o
// trabalho dele sem nem saber que perdeu.
//
// A regra: onde ha 5 ancoras ou mais, o Kadish ja passou pelo ouvido dele, e
// so entra realinhamento se ele mandar (--mesmo-com-ancoras).
// Conta as ancoras DELE (ancoras.length), nao as que casaram com um comeco de
// bloco (fixo.size). O ashkenaz_yatom tem 5 ancoras dele e escapou da trava
// porque duas nao caem exatamente num comeco de bloco — e o que decide se o
// Kadish ja passou pelo ouvido dele e quantas ele fez, nao quantas o meu
// casamento conseguiu aproveitar.
if (ancoras.length >= 5 && !process.argv.includes('--mesmo-com-ancoras')) {
  console.log(`\nPAREI: este Kadish tem ${ancoras.length} ancoras — o Erez ja o conferiu de ouvido.`);
  console.log('  Realinhar aqui troca o ouvido dele por conta de programa, inclusive nas');
  console.log('  palavras que ele ouviu e achou certas (essas nao viram ancora).');
  console.log('  Se ele mandar mesmo assim: --mesmo-com-ancoras');
  process.exit(0);
}

if (!CONFIRMAR) { console.log('\nENSAIO — nada foi gravado. Para valer: --confirmar'); process.exit(0); }
writeFileSync(`sync/${ALVO}_sync.json`, JSON.stringify(sync, null, 2) + '\n', 'utf8');
console.log(`\ngravado: sync/${ALVO}_sync.json`);
