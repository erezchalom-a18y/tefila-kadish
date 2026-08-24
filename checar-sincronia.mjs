/**
 * checar-sincronia.mjs — a sincronia dos 8, num comando só.
 *
 * O Erez perguntou: "tem como acertar e testar tudo?". Isto e o "testar tudo".
 * Nao abre navegador, nao gasta nada, roda em segundos, e diz por Kadish o que
 * ainda esta torto — nas mesmas palavras que ele usa.
 *
 * As cinco contas, e por que cada uma existe:
 *
 *   fora da voz   — a palavra comeca longe de qualquer comeco de voz. E a
 *                   medida do medir-desvio.py, a que sempre valeu.
 *   partida       — o fim da palavra cai no MEIO de um bloco de voz. Ele ouve
 *                   so um pedaco: "so da para ouvir o 'ra' do raba".
 *   muda          — nao ha voz nenhuma dentro da palavra.
 *   engolindo     — dentro dela ha silencio grande e depois mais voz: esta
 *                   engolindo a seguinte. Foi o caso do veshirata.
 *   corrida       — a palavra tem tempo de menos para as silabas que tem. Foi
 *                   assim que apareceu o meshichêh com 0,10s.
 *
 * As quatro ultimas a MEDIDA nao ve, porque ela olha o COMECO de cada palavra
 * e nestas o errado e o fim ou a duracao.
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

const ALVOS = ['ashkenaz', 'chabad', 'sefard', 'sefaradi']
  .flatMap(n => ['yatom', 'derabanan'].map(t => `${n}_${t}`));

const TOLERANCIA = 0.15;      // igual ao sinal.py
const FOLGA_CORTE = 0.08;     // 2 quadros: nao acusar por um triz
const SILENCIO = 0.35;
const POR_SILABA_MIN = 0.16;  // abaixo disto a palavra nao cabe no tempo que tem
const PERTO_WHISPER = 0.5;

const VOGAIS = /[ֱ-ׇֻ]/g;
const silabas = h => Math.max(1, (String(h).match(VOGAIS) || []).length);

let whisper = {};
try { whisper = JSON.parse(readFileSync('fontes/whisper-tempos.json', 'utf8')).tempos || {}; } catch (e) {}

function olhar(alvo) {
  const s = JSON.parse(readFileSync(`sinal/${alvo}.json`, 'utf8'));
  const d = JSON.parse(readFileSync(`sync/${alvo}_sync.json`, 'utf8'));
  const ouvido = new Map((whisper[alvo] || []).map(e => [`${e.verso}|${e.hebrew}`, e.ouvido]));

  const achados = [];
  let n = 0, fora = 0;
  for (const v of d.versos) for (const p of v.palavras) {
    n++;
    const nome = p.transliteration_pt || p.hebrew;
    let dist = Infinity;
    for (const x of s.inicios_de_voz) dist = Math.min(dist, Math.abs(x - p.start));
    if (dist > TOLERANCIA) { fora++; achados.push({ v: v.n, nome, tipo: 'fora da voz',
      detalhe: `comeca ${dist.toFixed(2)}s longe do comeco de voz mais proximo` }); }

    const dentro = s.blocos.filter(([a, z]) => { const mid = (a + z) / 2; return mid >= p.start && mid < p.end; });
    const corta = s.blocos.find(([a, z]) => p.end > a + FOLGA_CORTE && p.end < z - FOLGA_CORTE);
    if (corta) achados.push({ v: v.n, nome, tipo: 'partida',
      detalhe: `acaba ${p.end.toFixed(2)} e a voz so para em ${corta[1].toFixed(2)}` });
    else if (!dentro.length) achados.push({ v: v.n, nome, tipo: 'muda',
      detalhe: `de ${p.start.toFixed(2)} a ${p.end.toFixed(2)} nao ha voz` });
    else for (let k = 1; k < dentro.length; k++)
      if (dentro[k][0] - dentro[k - 1][1] >= SILENCIO) {
        achados.push({ v: v.n, nome, tipo: 'engolindo',
          detalhe: `silencio ate ${dentro[k][0].toFixed(2)}, e ai o rabino fala de novo` });
        break;
      }

    const porSil = (p.end - p.start) / silabas(p.hebrew);
    if (porSil < POR_SILABA_MIN) achados.push({ v: v.n, nome, tipo: 'corrida',
      detalhe: `${(p.end - p.start).toFixed(2)}s para ${silabas(p.hebrew)} silaba(s)` });
  }

  // concordancia com o que o Whisper ouviu
  let cw = null;
  if (ouvido.size) {
    let perto = 0, soma = 0;
    for (const v of d.versos) for (const p of v.palavras) {
      const w = ouvido.get(`${v.n}|${p.hebrew}`);
      if (w === undefined) continue;
      const dd = Math.abs(p.start - w);
      soma += dd; if (dd <= PERTO_WHISPER) perto++;
    }
    cw = { perto, de: ouvido.size, erro: (soma / ouvido.size).toFixed(2) };
  }

  const conta = t => achados.filter(a => a.tipo === t).length;
  return { alvo, n, fora, partida: conta('partida'), muda: conta('muda'),
           engolindo: conta('engolindo'), corrida: conta('corrida'),
           total: achados.length - fora, cw, achados };
}

const so = process.argv[2];
const alvos = so ? [so] : ALVOS;
const faltando = alvos.filter(a => !existsSync(`sinal/${a}.json`));
if (faltando.length) {
  console.error(`sem o desenho da voz: ${faltando.join(', ')} — rode: python3 gerar-envelope.py`);
  process.exit(2);
}

const linhas = alvos.map(olhar);
console.log('nussach              palavras  fora da voz  partida  muda  engolindo  corrida | Whisper');
for (const r of linhas) {
  const w = r.cw ? `${String(r.cw.perto).padStart(3)}/${r.cw.de} (erro ${r.cw.erro}s)` : '—';
  console.log(
    r.alvo.padEnd(20) + String(r.n).padStart(8) + String(r.fora).padStart(13) +
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
