#!/usr/bin/env node
/**
 * revisar-audio-whisper.mjs — revisao AUDITIVA da sincronia por Whisper.
 *
 * REGRAS DESTE SCRIPT (nao afrouxar):
 *  - Transcreve os 8 audios de tefila-audio/ pela API de transcricao da OpenAI,
 *    lingua hebraico, com timestamp por palavra.
 *  - Compara com os nossos sync/*.json em dois eixos:
 *      1. palavra ouvida que nao esta no texto, e palavra do texto que nao foi ouvida;
 *      2. inicio de palavra divergindo mais de LIMIAR segundos (padrao 0,6s).
 *  - Saida: RELATORIO-AUDIO-WHISPER.md, agrupado por nussach e verso, em portugues.
 *  - NUNCA altera os sync/*.json nem ancoras.json. As ancoras do Erez sao
 *    inviolaveis: o Whisper e uma opiniao, o ouvido dele decide.
 *  - Uma rodada por mudanca. Nunca em loop.
 *
 * Uso:  node revisar-audio-whisper.mjs           (precisa de OPENAI_API_KEY)
 *       node revisar-audio-whisper.mjs --ensaio  (sem API: transcricao simulada
 *                                                 a partir dos nossos proprios
 *                                                 JSONs, com defeitos plantados)
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const ARQ_RELATORIO = 'RELATORIO-AUDIO-WHISPER.md';
const ARQ_OUVIR = 'OUVIR-PRIMEIRO.md';
const MODELO = process.env.WHISPER_MODEL || 'whisper-1';
const LIMIAR = Number(process.env.LIMIAR_SEGUNDOS || 0.6);
const ENSAIO = process.argv.includes('--ensaio');

const NUSSACHIM = [];
for (const n of ['ashkenaz', 'chabad', 'sefard', 'sefaradi'])
  for (const t of ['yatom', 'derabanan'])
    NUSSACHIM.push({ id: `${n}_${t}`, audio: `tefila-audio/${n}/${t}.ogg`, sync: `sync/${n}_${t}_sync.json` });

// ------------------------------------------------- normalizacao do hebraico

// Tira nikud/teamim, maqaf e pontuacao; unifica letras finais. Serve so para
// COMPARAR — o texto do repositorio nunca e alterado.
const FINAIS = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
function normalizar(s) {
  return String(s)
    .replace(/[֑-ׇ]/g, '')
    .replace(/[^א-ת]/g, '')
    .replace(/[ךםןףץ]/g, c => FINAIS[c]);
}

function distancia(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m || !n) return m || n;
  let ant = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const atual = [i];
    for (let j = 1; j <= n; j++) {
      atual[j] = Math.min(ant[j] + 1, atual[j - 1] + 1, ant[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    ant = atual;
  }
  return ant[n];
}

function semelhanca(a, b) {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  return 1 - distancia(a, b) / Math.max(a.length, b.length);
}

const PARECIDO = 0.6; // abaixo disto nao e a mesma palavra

// -------------------------------------------------------------- alinhamento

// Needleman-Wunsch sobre as duas listas de palavras. Devolve pares alinhados,
// com null de um lado quando a palavra nao tem correspondente.
function alinhar(nossas, ouvidas) {
  const m = nossas.length, n = ouvidas.length;
  const BURACO = -0.5;
  const s = Array.from({ length: m + 1 }, () => new Float64Array(n + 1));
  for (let i = 1; i <= m; i++) s[i][0] = i * BURACO;
  for (let j = 1; j <= n; j++) s[0][j] = j * BURACO;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const par = s[i - 1][j - 1] + (2 * semelhanca(nossas[i - 1].norm, ouvidas[j - 1].norm) - 1);
      s[i][j] = Math.max(par, s[i - 1][j] + BURACO, s[i][j - 1] + BURACO);
    }
  }
  const pares = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 &&
        s[i][j] === s[i - 1][j - 1] + (2 * semelhanca(nossas[i - 1].norm, ouvidas[j - 1].norm) - 1)) {
      pares.push({ nossa: nossas[i - 1], ouvida: ouvidas[j - 1] }); i--; j--;
    } else if (i > 0 && s[i][j] === s[i - 1][j] + BURACO) {
      pares.push({ nossa: nossas[i - 1], ouvida: null }); i--;
    } else {
      pares.push({ nossa: null, ouvida: ouvidas[j - 1] }); j--;
    }
  }
  return pares.reverse();
}

// ------------------------------------------------------------------ OpenAI

const espera = ms => new Promise(r => setTimeout(r, ms));

async function transcrever(caminhoAudio) {
  const dados = fs.readFileSync(caminhoAudio);
  let ultimoErro = '';
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    const form = new FormData();
    form.append('file', new Blob([dados], { type: 'audio/ogg' }), caminhoAudio.split('/').pop());
    form.append('model', MODELO);
    form.append('language', 'he');
    form.append('response_format', 'verbose_json');
    form.append('timestamp_granularities[]', 'word');

    let r;
    try {
      r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: form,
      });
    } catch (e) {
      ultimoErro = `rede: ${e.message}`; await espera(3000 * tentativa); continue;
    }

    if (r.ok) {
      const corpo = await r.json();
      if (!Array.isArray(corpo.words))
        throw new Error(`o modelo "${MODELO}" nao devolveu timestamp por palavra. Use WHISPER_MODEL=whisper-1.`);
      return corpo.words.map(w => ({ hebrew: w.word, start: w.start, end: w.end, norm: normalizar(w.word) }))
                        .filter(w => w.norm);
    }

    const detalhe = (await r.text()).slice(0, 400);
    if ([400, 401, 403, 404].includes(r.status))
      throw new Error(`OpenAI HTTP ${r.status} com o modelo "${MODELO}": ${detalhe}`);
    ultimoErro = `HTTP ${r.status}: ${detalhe}`;
    await espera(3000 * tentativa);
  }
  throw new Error(`transcricao falhou depois de 3 tentativas — ${ultimoErro}`);
}

// Transcricao simulada: parte do nosso proprio texto e planta defeitos, para
// testar alinhamento e relatorio sem gastar API.
function transcricaoDeEnsaio(nossas) {
  const saida = [];
  nossas.forEach((p, k) => {
    if (k % 23 === 11) return;                       // palavra "nao ouvida"
    const desvio = k % 17 === 3 ? 1.4 : 0.05;        // inicio divergente
    saida.push({ hebrew: p.hebrew, start: +(p.start + desvio).toFixed(2), end: p.end, norm: p.norm });
    if (k % 31 === 9) saida.push({ hebrew: 'אמן', start: +(p.end + 0.05).toFixed(2), end: p.end + 0.3, norm: normalizar('אמן') });
  });
  return saida;
}

// ---------------------------------------------------------------- comparacao

function palavrasDoSync(sync) {
  const lista = [];
  for (const v of sync.versos)
    for (const p of v.palavras || [])
      lista.push({ verso: v.n, i: p.i, hebrew: p.hebrew, translit: p.transliteration_pt || '',
                   start: p.start, end: p.end, norm: normalizar(p.hebrew) });
  return lista;
}

function versoDoInstante(sync, t) {
  const v = sync.versos.find(v => t >= v.start && t < v.end);
  return v ? v.n : null;
}

function comparar(nussach, sync, ouvidas) {
  const nossas = palavrasDoSync(sync);
  const pares = alinhar(nossas, ouvidas);
  const achados = [];

  for (const par of pares) {
    const { nossa, ouvida } = par;
    if (nossa && ouvida && semelhanca(nossa.norm, ouvida.norm) >= PARECIDO) {
      const desvio = +(ouvida.start - nossa.start).toFixed(2);
      if (Math.abs(desvio) > LIMIAR) {
        achados.push({ verso: nossa.verso, eixo: 'tempo', palavra: nossa.hebrew, translit: nossa.translit,
                       nosso: nossa.start, ouvido: ouvida.start, desvio });
      }
      continue;
    }
    // par sem semelhanca suficiente conta como as duas faltas separadas
    if (nossa)
      achados.push({ verso: nossa.verso, eixo: 'nao_ouvida', palavra: nossa.hebrew,
                     translit: nossa.translit, nosso: nossa.start });
    if (ouvida)
      achados.push({ verso: versoDoInstante(sync, ouvida.start), eixo: 'nao_no_texto',
                     palavra: ouvida.hebrew, ouvido: ouvida.start });
  }

  achados.sort((a, b) => (a.verso ?? 999) - (b.verso ?? 999) || (a.nosso ?? a.ouvido) - (b.nosso ?? b.ouvido));
  return { nussach, achados, nPalavras: nossas.length, nOuvidas: ouvidas.length };
}

// --------------------------------------------- cruzamento com OUVIR-PRIMEIRO

// Le OUVIR-PRIMEIRO.md. Uma linha = um suspeito; varios suspeitos podem cair
// no mesmo verso, entao contamos as duas coisas.
function suspeitosDoOuvirPrimeiro() {
  if (!fs.existsSync(ARQ_OUVIR)) return null;
  const versos = new Set();
  let linhas = 0, nussach = null;
  for (const linha of fs.readFileSync(ARQ_OUVIR, 'utf8').split('\n')) {
    const cab = linha.match(/^##\s+(\S+)/);
    if (cab) { nussach = cab[1]; continue; }
    const item = linha.match(/^-\s*§(\d+)/);
    if (item && nussach) { linhas++; versos.add(`${nussach} §${item[1]}`); }
  }
  return { versos, linhas, tem: c => versos.has(c) };
}

// ------------------------------------------------------------------ relatorio

const ROTULO = { tempo: 'começa em hora diferente', nao_ouvida: 'está no texto, não foi ouvida',
                 nao_no_texto: 'foi ouvida, não está no texto' };

function commitAtual() {
  try { return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(); }
  catch { return '(desconhecido)'; }
}

function relatorio(resultados, suspeitos) {
  const agora = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const todos = resultados.flatMap(r => r.achados.map(a => ({ ...a, nussach: r.nussach })));
  const l = [];

  l.push('# Relatório da revisão auditiva (Whisper)');
  l.push('');
  l.push(`Gerado em ${agora} por ${ENSAIO ? '**ENSAIO — sem API**' : `\`${MODELO}\``}, sobre o commit \`${commitAtual()}\`.`);
  l.push('');
  l.push('> **O Whisper não decide nada.** Ele não alterou nenhum `sync/*.json` e nunca');
  l.push('> vai alterar. As âncoras do Erez são invioláveis: a máquina aponta, o ouvido');
  l.push('> dele decide, e o siddur e o rabino mandam no texto.');
  l.push('');

  l.push('## Como ler');
  l.push('');
  l.push('Os 8 áudios foram transcritos em hebraico com marcação de tempo por palavra.');
  l.push('A transcrição foi alinhada com o nosso texto e comparada em dois eixos:');
  l.push('');
  l.push('1. **palavra fora do lugar** — ouvida mas não está no texto, ou está no texto');
  l.push('   mas não foi ouvida;');
  l.push(`2. **hora errada** — o começo da palavra difere mais de ${LIMIAR}s do nosso.`);
  l.push('');
  l.push('O Whisper erra em hebraico litúrgico: ele não conhece bem o aramaico do Kadish,');
  l.push('confunde palavra curta com respiração e às vezes junta duas palavras numa só.');
  l.push('Trate cada linha como *vale a pena ouvir este trecho*, nunca como *está errado*.');
  l.push('');

  l.push('## Resumo');
  l.push('');
  l.push('| Nussach | Palavras nossas | Palavras ouvidas | Apontamentos |');
  l.push('| --- | ---: | ---: | ---: |');
  for (const r of resultados)
    l.push(`| ${r.nussach} | ${r.nPalavras} | ${r.nOuvidas} | ${r.achados.length} |`);
  l.push(`| **total** | | | **${todos.length}** |`);
  l.push('');
  l.push('Por eixo:');
  l.push('');
  for (const eixo of ['tempo', 'nao_ouvida', 'nao_no_texto'])
    l.push(`- ${ROTULO[eixo]}: **${todos.filter(a => a.eixo === eixo).length}**`);
  l.push('');

  if (suspeitos) {
    const coincidem = todos.filter(a => a.verso != null && suspeitos.tem(`${a.nussach} §${a.verso}`));
    const versosCoincidentes = new Set(coincidem.map(a => `${a.nussach} §${a.verso}`));
    l.push('## Cruzamento com OUVIR-PRIMEIRO.md');
    l.push('');
    l.push(`A auditoria de sinal de 20/08 listou ${suspeitos.linhas} suspeitos, espalhados por`);
    l.push(`${suspeitos.versos.size} versos diferentes.`);
    l.push('');
    l.push(`Dos ${todos.length} apontamentos do Whisper, **${coincidem.length}** caem em versos que já`);
    l.push(`estavam naquela lista — cobrindo **${versosCoincidentes.size}** dos ${suspeitos.versos.size} versos suspeitos.`);
    l.push('');
    l.push('Onde os dois métodos concordam, a chance de haver defeito real é bem maior:');
    l.push('comece a ouvir por aqui.');
    l.push('');
    if (versosCoincidentes.size) {
      for (const chave of [...versosCoincidentes].sort())
        l.push(`- ${chave}`);
      l.push('');
    }
  }

  l.push('## Apontamentos, nussach por nussach');
  l.push('');
  for (const r of resultados) {
    l.push(`### ${r.nussach}`);
    l.push('');
    if (!r.achados.length) { l.push('Nada a apontar.'); l.push(''); continue; }
    const porVerso = new Map();
    for (const a of r.achados) {
      const chave = a.verso ?? 'fora de verso';
      if (!porVerso.has(chave)) porVerso.set(chave, []);
      porVerso.get(chave).push(a);
    }
    for (const [verso, achados] of porVerso) {
      const marca = suspeitos && suspeitos.tem(`${r.nussach} §${verso}`) ? ' — **já está no OUVIR-PRIMEIRO**' : '';
      l.push(`**§${verso}**${marca}`);
      l.push('');
      for (const a of achados) {
        if (a.eixo === 'tempo')
          l.push(`- \`${a.palavra}\` *(${a.translit})* — nós: ${a.nosso}s · ouvido: ${a.ouvido}s · diferença ${a.desvio > 0 ? '+' : ''}${a.desvio}s`);
        else if (a.eixo === 'nao_ouvida')
          l.push(`- \`${a.palavra}\` *(${a.translit})* — no texto em ${a.nosso}s, o Whisper não ouviu`);
        else
          l.push(`- \`${a.palavra}\` — o Whisper ouviu em ${a.ouvido}s, não existe no nosso texto`);
      }
      l.push('');
    }
  }

  l.push('## O que fazer com isto');
  l.push('');
  l.push('1. Comece pelos versos do cruzamento acima — são os que os dois métodos marcaram.');
  l.push('2. Ouça o verso no conferidor.html. Se a palavra acender fora da voz, anote o segundo.');
  l.push('3. O reparo vira âncora em `ancoras.json`, e só então roda o alinhador.');
  l.push('4. Este relatório nunca altera nada. Quem altera é uma pessoa.');
  l.push('');
  return l.join('\n') + '\n';
}

// ------------------------------------------------------------------ execucao

async function principal() {
  if (!ENSAIO && !process.env.OPENAI_API_KEY) {
    console.error('Falta OPENAI_API_KEY. (Para testar sem API: --ensaio)');
    process.exit(1);
  }

  const resultados = [];
  for (const n of NUSSACHIM) {
    const sync = JSON.parse(fs.readFileSync(n.sync, 'utf8'));
    const nossas = palavrasDoSync(sync);
    process.stdout.write(`${n.id}: `);
    const ouvidas = ENSAIO ? transcricaoDeEnsaio(nossas) : await transcrever(n.audio);
    const r = comparar(n.id, sync, ouvidas);
    console.log(`${nossas.length} palavras nossas, ${ouvidas.length} ouvidas, ${r.achados.length} apontamentos`);
    resultados.push({ ...r, ouvidas });
  }

  const suspeitos = suspeitosDoOuvirPrimeiro();
  // GUARDAR A TRANSCRICAO CRUA. O relatorio so lista as palavras em que o
  // Whisper discordou de nos por mais de 0,6s — e com isso da para EMPURRAR o
  // alinhamento, mas nao para faze-lo do zero. Com a transcricao inteira, cada
  // palavra tem o segundo em que ela soa, e o alinhamento passa a ser decidido
  // por CONTEUDO. Foi o que faltou nas rodadas de 23 e 24/08, em que o Erez
  // ouvia palavra no verso errado e as minhas contas diziam 100%.
  //
  // Isto NAO altera sync/ nem as ancoras: e so a transcricao guardada.
  if (!ENSAIO) {
    fs.mkdirSync('whisper', { recursive: true });
    for (const r of resultados) {
      if (!r.ouvidas) continue;
      fs.writeFileSync(`whisper/${r.nussach}.json`, JSON.stringify({
        _leia: 'Transcricao crua do Whisper, palavra a palavra com o segundo em que soa. ' +
          'NAO e medida e NAO decide nada: o Whisper erra em aramaico liturgico. Serve para o ' +
          'realinhar.mjs saber QUAL palavra soa em cada trecho — que e o que o sinal nao sabe.',
        modelo: MODELO,
        palavras: r.ouvidas.map(w => ({ hebrew: w.hebrew, start: +w.start.toFixed(3), end: +w.end.toFixed(3) })),
      }, null, 1) + '\n');
    }
  }

  fs.writeFileSync(ARQ_RELATORIO, relatorio(resultados, suspeitos));

  const total = resultados.reduce((a, r) => a + r.achados.length, 0);
  console.log(`\n${ARQ_RELATORIO} escrito — ${total} apontamentos nos 8 nussachim.`);
  // Sai 0 mesmo com apontamentos: isto e leitura humana, nao reprovacao de build.
}

principal().catch(e => { console.error(String(e.message || e)); process.exit(1); });
