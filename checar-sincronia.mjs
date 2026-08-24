/**
 * checar-sincronia.mjs — a sincronia dos 8, num comando só.
 *
 * O Erez perguntou: "tem como acertar e testar tudo?". Isto e o "testar tudo".
 * Nao abre navegador, nao gasta nada, roda em segundos, e diz por Kadish o que
 * ainda esta torto — nas mesmas palavras que ele usa.
 *
 * As cinco contas, e por que cada uma existe:
 *
 *   fora da voz   — a palavra comeca no SILENCIO: nem num comeco de voz, nem
 *                   dentro de um bloco de voz que a vizinha de tras ja ocupe.
 *                   E a medida do medir-desvio.py, corrigida em 24/08 (abaixo).
 *   colada        — comeca DENTRO da voz, no meio de um bloco que ela divide
 *                   com a palavra de tras. Nao e defeito: e o rabino dizendo
 *                   duas palavras num folego so ("Yehe sheme"). So se conta
 *                   para ele saber quantas sao.
 *   partida       — o fim do VERSO cai no MEIO de um bloco de voz. E o verso
 *                   que ele toca no app; se ele acaba no meio da voz, a palavra
 *                   sai cortada: "so da para ouvir o 'ra' do raba".
 *   muda          — nao ha voz nenhuma dentro da palavra (nenhum pedaco de
 *                   bloco cai dentro dela).
 *   engolindo     — dentro dela ha silencio grande e depois mais voz: esta
 *                   engolindo a seguinte. Foi o caso do veshirata.
 *   corrida       — a palavra tem tempo de menos para as silabas que tem. Foi
 *                   assim que apareceu o meshichêh com 0,10s.
 *   verso errado  — a palavra e OUVIDA num verso e mostrada noutro. E a queixa
 *                   do Erez, na letra dele: "yishtabah continua falado na linha
 *                   8 e aparecendi na linha 9". Unica conta aqui que sabe QUAL
 *                   palavra soa quando; as outras so sabem onde ha voz.
 *
 * As quatro ultimas a MEDIDA nao ve, porque ela olha o COMECO de cada palavra
 * e nestas o errado e o fim ou a duracao.
 *
 * O CONSERTO DE 24/08 — por que "fora da voz" mudou de pergunta
 *
 * Ela perguntava: a palavra comeca em cima de um COMECO de voz? Enquanto o
 * alinhador empurrava toda palavra para um comeco de bloco, a resposta era
 * sempre sim — e era esse o defeito. O rabino diz "Yehe sheme" colado, o sinal
 * ve UM bloco, e obrigar as duas a comecar num comeco de bloco escorregava o
 * Kadish inteiro uma palavra. Corrigido isso, as palavras coladas passaram a
 * comecar no MEIO do bloco (que e onde elas soam mesmo), e esta conta acusou
 * 71 defeitos num Kadish que acabara de ficar certo.
 *
 * Nao se afrouxou nada: a pergunta e que estava errada. Comecar dentro da voz,
 * grudada na de tras, e o certo. Comecar no SILENCIO continua sendo defeito e
 * continua contando.
 *
 * "partida" e "muda" tinham o mesmo vicio, pela mesma razao. A "partida" olhava
 * o fim de CADA PALAVRA: com duas palavras num bloco so, o fim da primeira cai
 * dentro da voz por construcao, e ela acusava todo par colado. Mas o que o Erez
 * toca no app e o VERSO — e a queixa dele sempre foi de verso ("o raba ainda
 * para no meio", "o chirute para no chir'u"). Agora ela olha o fim do verso,
 * que e onde o corte se ouve de verdade.
 *
 * A "muda" perguntava se o MEIO de algum bloco caia dentro da palavra. Uma
 * palavra curta dentro de um bloco grande nao contem o meio dele — e era dada
 * como muda tendo voz do comeco ao fim. Agora ela pergunta o que importa: ha
 * algum pedaco de voz dentro dela?
 *
 * E ainda: quanto o resultado concorda com o que o Whisper OUVIU. Essa e a
 * unica conta aqui que fala de CONTEUDO — qual palavra soa em cada segundo. As
 * outras so falam de ritmo, e ritmo nao distingue o alinhamento certo do
 * deslocado um bloco inteiro. Foi assim que uma versao do realinhador zerou
 * tudo e continuou errada.
 *
 * Uso: node checar-sincronia.mjs
 *      node checar-sincronia.mjs chabad_derabanan   (so um, com detalhe)
 */
import { readFileSync, existsSync } from 'node:fs';
import { casar } from './casar-ouvidas.mjs';

const ALVOS = ['ashkenaz', 'chabad', 'sefard', 'sefaradi']
  .flatMap(n => ['yatom', 'derabanan'].map(t => `${n}_${t}`));

const TOLERANCIA = 0.15;      // igual ao sinal.py
const FOLGA_CORTE = 0.08;     // 2 quadros: nao acusar por um triz
const SILENCIO = 0.35;
// So conta como voz, para medir buraco, um pedaco de verdade. Nas pontas da
// palavra sobra sempre um fio do bloco da vizinha colada — dois centesimos de
// voz — e era ele que fabricava buraco onde nao havia: o "veyitkadash" do
// ashkenaz_derabanan tinha um fio de 0.02s em 1.06 e por causa dele o intervalo
// ate 1.64 virava "silencio", quando o rabino so estava dizendo a palavra
// silaba por silaba, do jeito dele.
const VOZ_MINIMA = 0.10;
const POR_SILABA_MIN = 0.16;  // abaixo disto a palavra nao cabe no tempo que tem
const PERTO_WHISPER = 0.5;
// O Whisper marca em quadros mais grossos que o envelope: um verso que comeca
// 0,1s depois do instante ouvido nao se ouve errado. So conta como verso errado
// a partir daqui — e nunca numa palavra que o Erez ancorou de ouvido, porque
// ali quem decide e ele (regra 1). No chabad_yatom o Whisper corta o "amen" do
// verso 7 e comeca o "Yehe" 1,04s cedo; a ancora dele, de 23/08, esta certa e o
// desenho da voz confirma: o amen e o bloco 26.24~26.66, o Yehe e o 27.66.
const VERSO_ERRADO = 0.35;

const VOGAIS = /[ֱ-ׇֻ]/g;
const silabas = h => Math.max(1, (String(h).match(VOGAIS) || []).length);

// a transcricao CRUA (whisper/*.json) tem todas as palavras e e casada pelo
// casar-ouvidas.mjs — a mesma conta do realinhador. O fontes/whisper-tempos.json
// e um resumo tirado do relatorio (so as palavras que ele citou, e so quando o
// hebraico batia letra por letra); fica de reserva para quando a crua faltar.
const todasAncoras = JSON.parse(readFileSync('ancoras.json', 'utf8'));
let resumo = {};
try { resumo = JSON.parse(readFileSync('fontes/whisper-tempos.json', 'utf8')).tempos || {}; } catch (e) {}
function ouvidasDe(alvo) {
  if (existsSync(`whisper/${alvo}.json`))
    return JSON.parse(readFileSync(`whisper/${alvo}.json`, 'utf8')).palavras;
  return null;
}

function olhar(alvo) {
  const s = JSON.parse(readFileSync(`sinal/${alvo}.json`, 'utf8'));
  const d = JSON.parse(readFileSync(`sync/${alvo}_sync.json`, 'utf8'));
  const ouvidas = ouvidasDe(alvo);
  const ouvido = new Map((resumo[alvo] || []).map(e => [`${e.verso}|${e.hebrew}`, e.ouvido]));

  const achados = [];
  let n = 0, fora = 0, coladas = 0;
  for (const v of d.versos) for (const p of v.palavras) {
    n++;
    const nome = p.transliteration_pt || p.hebrew;
    let dist = Infinity;
    for (const x of s.inicios_de_voz) dist = Math.min(dist, Math.abs(x - p.start));
    if (dist > TOLERANCIA) {
      // a pergunta certa e simples: quando o risco desta palavra aparece, o
      // rabino esta falando? Se o instante cai DENTRO de um bloco de voz, esta
      // — ela so nao inaugurou o bloco porque veio colada na de tras. Se cai no
      // silencio, ai sim ha o que olhar.
      const b = s.blocos.find(([a, z]) => p.start >= a && p.start <= z);
      if (b) { coladas++; achados.push({ v: v.n, nome, tipo: 'colada',
        detalhe: `comeca com a voz ja correndo (o bloco abriu em ${b[0].toFixed(2)})` }); }
      else { fora++; achados.push({ v: v.n, nome, tipo: 'fora da voz',
        detalhe: `comeca no silencio, a ${dist.toFixed(2)}s do comeco de voz mais proximo` }); }
    }

    // os pedacos de voz que caem DENTRO desta palavra, recortados nela
    const pedacos = s.blocos
      .filter(([a, z]) => z > p.start && a < p.end)
      .map(([a, z]) => [Math.max(a, p.start), Math.min(z, p.end)])
      .filter(([a, z]) => z - a > 0.01);
    const reais = pedacos.filter(([a, z]) => z - a >= VOZ_MINIMA);
    if (!pedacos.length) achados.push({ v: v.n, nome, tipo: 'muda',
      detalhe: `de ${p.start.toFixed(2)} a ${p.end.toFixed(2)} nao ha voz` });
    else for (let k = 1; k < reais.length; k++)
      if (reais[k][0] - reais[k - 1][1] >= SILENCIO) {
        achados.push({ v: v.n, nome, tipo: 'engolindo',
          detalhe: `silencio de ${reais[k - 1][1].toFixed(2)} a ${reais[k][0].toFixed(2)}, e ai o rabino fala de novo` });
        break;
      }

    const porSil = (p.end - p.start) / silabas(p.hebrew);
    if (porSil < POR_SILABA_MIN) achados.push({ v: v.n, nome, tipo: 'corrida',
      detalhe: `${(p.end - p.start).toFixed(2)}s para ${silabas(p.hebrew)} silaba(s)` });
  }

  // partida: o fim do VERSO no meio da voz. E o verso que ele toca.
  for (const v of d.versos) {
    const corta = s.blocos.find(([a, z]) => v.end > a + FOLGA_CORTE && v.end < z - FOLGA_CORTE);
    if (corta) achados.push({ v: v.n, nome: v.palavras.at(-1).transliteration_pt || '(fim)',
      tipo: 'partida', detalhe: `o verso acaba em ${v.end.toFixed(2)} e a voz so para em ${corta[1].toFixed(2)}` });
  }

  // concordancia com o que o Whisper OUVIU — a unica conta de CONTEUDO aqui
  let cw = null;
  if (ouvidas) {
    const todas = d.versos.flatMap(v => v.palavras);
    const alvos = casar(todas, ouvidas);
    let perto = 0, soma = 0, de = 0;
    todas.forEach((p, i) => {
      if (alvos[i] === null) return;
      de++; const dd = Math.abs(p.start - alvos[i]);
      soma += dd; if (dd <= PERTO_WHISPER) perto++;
    });
    if (de) cw = { perto, de, erro: (soma / de).toFixed(2) };
  } else if (ouvido.size) {
    let perto = 0, soma = 0;
    for (const v of d.versos) for (const p of v.palavras) {
      const w = ouvido.get(`${v.n}|${p.hebrew}`);
      if (w === undefined) continue;
      const dd = Math.abs(p.start - w);
      soma += dd; if (dd <= PERTO_WHISPER) perto++;
    }
    cw = { perto, de: ouvido.size, erro: (soma / ouvido.size).toFixed(2) };
  }

  // verso errado: a palavra e ouvida dentro de outro verso
  let errado = 0;
  if (ouvidas) {
    const ancoras = (todasAncoras[alvo] || []).map(a => `${a.verso}|${a.palavra}`);
    const todas = d.versos.flatMap(v => v.palavras.map(p => ({ ...p, verso: v.n })));
    const alvos = casar(todas, ouvidas);
    todas.forEach((p, i) => {
      if (alvos[i] === null) return;
      if (ancoras.includes(`${p.verso}|${p.i + 1}`)) return;
      if (Math.abs(p.start - alvos[i]) < VERSO_ERRADO) return;
      const v = d.versos.find(v => alvos[i] >= v.start && alvos[i] < v.end);
      if (v && v.n !== p.verso) {
        errado++;
        achados.push({ v: p.verso, nome: p.transliteration_pt || p.hebrew, tipo: 'verso errado',
          detalhe: `mostrada no verso ${p.verso}, mas soa aos ${alvos[i].toFixed(2)}, dentro do verso ${v.n}` });
      }
    });
  }

  const conta = t => achados.filter(a => a.tipo === t).length;
  return { alvo, n, fora, coladas, errado, partida: conta('partida'), muda: conta('muda'),
           engolindo: conta('engolindo'), corrida: conta('corrida'),
           total: achados.length - fora - coladas, cw, achados };
}

const so = process.argv[2];
const alvos = so ? [so] : ALVOS;
const faltando = alvos.filter(a => !existsSync(`sinal/${a}.json`));
if (faltando.length) {
  console.error(`sem o desenho da voz: ${faltando.join(', ')} — rode: python3 gerar-envelope.py`);
  process.exit(2);
}

const linhas = alvos.map(olhar);
console.log('nussach              palavras  verso errado  fora da voz  colada  partida  muda  engolindo  corrida | Whisper');
for (const r of linhas) {
  const w = r.cw ? `${String(r.cw.perto).padStart(3)}/${r.cw.de} (erro ${r.cw.erro}s)` : '—';
  console.log(
    r.alvo.padEnd(20) + String(r.n).padStart(8) + String(r.errado).padStart(14) + String(r.fora).padStart(13) +
    String(r.coladas).padStart(8) +
    String(r.partida).padStart(9) + String(r.muda).padStart(6) +
    String(r.engolindo).padStart(11) + String(r.corrida).padStart(9) + ' | ' + w);
}

if (so) {
  console.log('');
  for (const a of linhas[0].achados)
    console.log(`  §${String(a.v).padStart(2)} ${a.nome.padEnd(14)}${a.tipo.padEnd(12)}${a.detalhe}`);
}

const soma = linhas.reduce((s, r) => s + r.fora + r.total, 0);
console.log(soma
  ? `\n${soma} coisa(s) para olhar no total. Detalhe de um: node checar-sincronia.mjs <nussach_tipo>`
  : '\nVERDE: a sincronia dos 8 esta limpa pelas cinco contas.');
process.exit(0);
