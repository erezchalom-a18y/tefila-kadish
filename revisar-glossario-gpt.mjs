#!/usr/bin/env node
/**
 * revisar-glossario-gpt.mjs — revisao CEGA do glossario por ChatGPT.
 *
 * REGRAS DESTE SCRIPT (nao afrouxar):
 *  1. Revisa APENAS glossario.json (42 entradas x 8 linguas). Nunca toca em
 *     sincronia, audio ou codigo.
 *  2. As cegas: cada chamada manda so o hebraico, a transliteracao e o texto
 *     de UMA lingua. O revisor nao sabe quem escreveu nem ve as outras linguas.
 *  3. Rubrica fixa por entrada e lingua: erro de sentido, palavra errada,
 *     gramatica da lingua-alvo. Resposta: "ok" ou o problema com citacao literal.
 *  4. Proibido cota de defeitos: o prompt manda dizer que esta correto quando
 *     estiver correto.
 *  5. Saida: RELATORIO-REVISAO-GPT.md, legivel para humanos.
 *  6. O ChatGPT NUNCA altera arquivo nenhum. Este script so escreve o relatorio
 *     — nenhuma outra escrita em disco e permitida aqui.
 *  7. Modelo barato, uma rodada por mudanca, nunca em loop.
 *
 * Uso:  node revisar-glossario-gpt.mjs            (precisa de OPENAI_API_KEY)
 *       node revisar-glossario-gpt.mjs --ensaio   (sem API, so testa o encanamento)
 *       node revisar-glossario-gpt.mjs --exemplo de  (mostra o prompt exato de uma lingua)
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const ARQ_GLOSSARIO = 'glossario.json';
const ARQ_RELATORIO = 'RELATORIO-REVISAO-GPT.md';
const MODELO = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const CONCORRENCIA = Number(process.env.REVISAO_CONCORRENCIA || 6);
const ENSAIO = process.argv.includes('--ensaio');

const LINGUAS = [
  { cod: 'pt', nome: 'portugues',  rotulo: 'português' },
  { cod: 'en', nome: 'ingles',     rotulo: 'inglês' },
  { cod: 'es', nome: 'espanhol',   rotulo: 'espanhol' },
  { cod: 'fr', nome: 'frances',    rotulo: 'francês' },
  { cod: 'it', nome: 'italiano',   rotulo: 'italiano' },
  { cod: 'de', nome: 'alemao',     rotulo: 'alemão' },
  { cod: 'ru', nome: 'russo',      rotulo: 'russo' },
  { cod: 'he', nome: 'hebraico moderno', rotulo: 'hebraico moderno' },
];

// ---------------------------------------------------------------- material

function material(entrada, cod) {
  const traducao = cod === 'pt' ? entrada.translation_pt : entrada.translations?.[cod];
  const glosas   = cod === 'pt' ? entrada.glosas_pt      : entrada.glosas?.[cod];
  return {
    hebraico: entrada.hebrew,
    transliteracao: entrada.transliteration_pt || '',
    palavras: entrada.hebrew.split(/\s+/),
    traducao: traducao || '',
    glosas: Array.isArray(glosas) ? glosas : [],
  };
}

const SISTEMA = [
  'Voce e um revisor de traducoes liturgicas judaicas (Kadish).',
  'Voce recebe um texto que ja existe e avalia se esta correto. Voce NAO sabe',
  'quem o escreveu, e isso nao importa para o seu julgamento.',
  '',
  'NAO existe cota de defeitos. A maior parte do material tende a estar correta.',
  'Se estiver correto, diga que esta correto. Nunca invente um problema para',
  'preencher a resposta, nunca aponte preferencia de estilo como se fosse erro.',
  'So aponte o que um falante nativo culto consideraria errado.',
].join('\n');

function prompt(m, lingua) {
  const linhas = m.palavras.map((p, i) => `${i + 1}. ${p}  =  "${m.glosas[i] ?? ''}"`);
  return [
    `LINGUA-ALVO: ${lingua.rotulo}`,
    '',
    `HEBRAICO: ${m.hebraico}`,
    `TRANSLITERACAO (apoio para ler o hebraico; NAO esta sob revisao): ${m.transliteracao}`,
    '',
    'TRADUCAO CORRIDA PROPOSTA:',
    `"${m.traducao}"`,
    '',
    'GLOSA PALAVRA A PALAVRA PROPOSTA (palavra hebraica = glosa proposta):',
    ...linhas,
    '',
    'RUBRICA — aplique estes tres criterios, nesta ordem:',
    '1. erro de sentido: a traducao ou a glosa diz algo diferente do hebraico.',
    '2. palavra errada: o sentido geral esta certo, mas a palavra escolhida e',
    '   impropria para o registro liturgico ou para o termo hebraico.',
    `3. gramatica da lingua-alvo: concordancia, caso, genero, ortografia,`,
    `   artigo, preposicao — erros de ${lingua.rotulo} propriamente dito.`,
    '',
    'RESPONDA SO COM JSON, neste formato:',
    '{"veredito":"ok"} — se nao houver nenhum problema;',
    'ou',
    '{"veredito":"problema","achados":[',
    '  {"onde":"traducao" ou "glosa N",',
    '   "tipo":"sentido" ou "palavra" ou "gramatica",',
    '   "citacao":"<trecho copiado LITERALMENTE do texto acima>",',
    '   "problema":"<uma frase explicando>",',
    '   "sugestao":"<o que estaria certo, se souber>"}',
    ']}',
    '',
    'A "citacao" precisa ser copia literal de um trecho da traducao ou da glosa',
    'acima — nao parafraseie, nao traduza, nao corrija ao citar.',
    'Se estiver tudo correto, responda exatamente {"veredito":"ok"}.',
  ].join('\n');
}

// ---------------------------------------------------------------- OpenAI

const espera = ms => new Promise(r => setTimeout(r, ms));

async function chamarOpenAI(textoUsuario) {
  let ultimoErro = '';
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    let resposta;
    try {
      resposta = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODELO,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SISTEMA },
            { role: 'user', content: textoUsuario },
          ],
        }),
      });
    } catch (e) {
      ultimoErro = `rede: ${e.message}`;
      await espera(2000 * tentativa);
      continue;
    }

    if (resposta.ok) {
      const corpo = await resposta.json();
      const conteudo = corpo.choices?.[0]?.message?.content ?? '';
      try {
        return JSON.parse(conteudo);
      } catch {
        ultimoErro = `resposta nao era JSON: ${conteudo.slice(0, 200)}`;
        await espera(1000 * tentativa);
        continue;
      }
    }

    const detalhe = (await resposta.text()).slice(0, 400);
    // 400/401/404 nao melhoram repetindo: chave, modelo ou formato errados.
    if ([400, 401, 403, 404].includes(resposta.status)) {
      throw new Error(
        `OpenAI HTTP ${resposta.status} com o modelo "${MODELO}": ${detalhe}\n` +
        'Se o modelo nao existir mais, rode com OPENAI_MODEL=<outro modelo barato>.'
      );
    }
    ultimoErro = `HTTP ${resposta.status}: ${detalhe}`;
    await espera(2000 * tentativa);
  }
  throw new Error(`OpenAI falhou depois de 3 tentativas — ${ultimoErro}`);
}

// Resposta falsa para --ensaio: exercita relatorio, contagem e o guarda de citacao.
function respostaDeEnsaio(m, indice) {
  if (indice % 37 === 5 && m.glosas.length) {
    return { veredito: 'problema', achados: [
      { onde: 'glosa 1', tipo: 'palavra', citacao: m.glosas[0],
        problema: 'exemplo de ensaio — citacao literal, deve passar no guarda.',
        sugestao: '(ensaio)' },
    ]};
  }
  if (indice % 53 === 7) {
    return { veredito: 'problema', achados: [
      { onde: 'traducao', tipo: 'sentido', citacao: 'texto que nao existe no material',
        problema: 'exemplo de ensaio — citacao inventada, deve ser descartada.',
        sugestao: '(ensaio)' },
    ]};
  }
  return { veredito: 'ok' };
}

// ---------------------------------------------------------------- execucao

async function emLotes(itens, n, fn) {
  const saida = new Array(itens.length);
  let proximo = 0;
  const trabalhadores = Array.from({ length: Math.min(n, itens.length) }, async () => {
    for (;;) {
      const i = proximo++;
      if (i >= itens.length) return;
      saida[i] = await fn(itens[i], i);
    }
  });
  await Promise.all(trabalhadores);
  return saida;
}

function normalizar(s) {
  return String(s).toLowerCase().replace(/[\s"'‚„“”«»(),.;:!?]/g, '');
}

// Guarda contra citacao inventada: a citacao tem que estar mesmo no material.
function citacaoConfere(citacao, m) {
  if (!citacao) return false;
  const alvo = normalizar(citacao);
  if (!alvo) return false;
  const fontes = [m.traducao, ...m.glosas].map(normalizar);
  return fontes.some(f => f.includes(alvo));
}

function commitAtual() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return '(desconhecido)';
  }
}

async function principal() {
  if (!ENSAIO && !process.argv.includes('--exemplo') && !process.env.OPENAI_API_KEY) {
    console.error('Falta OPENAI_API_KEY. (Para testar sem API: --ensaio)');
    process.exit(1);
  }

  const glossario = JSON.parse(fs.readFileSync(ARQ_GLOSSARIO, 'utf8'));
  const entradas = Object.entries(glossario.entradas);

  // --exemplo: imprime um prompt inteiro e sai. Serve para auditar a cegueira:
  // o que aparecer aqui e tudo o que o ChatGPT ve.
  if (process.argv.includes('--exemplo')) {
    const [, entrada] = entradas[0];
    const lingua = LINGUAS.find(x => x.cod === (process.argv[process.argv.indexOf('--exemplo') + 1] || 'de')) || LINGUAS[5];
    console.log('--- system ---\n' + SISTEMA + '\n--- user ---\n' + prompt(material(entrada, lingua.cod), lingua));
    return;
  }

  const tarefas = [];
  for (const [chave, entrada] of entradas)
    for (const lingua of LINGUAS)
      tarefas.push({ chave, entrada, lingua, m: material(entrada, lingua.cod) });

  console.log(`Revisao cega: ${entradas.length} entradas x ${LINGUAS.length} linguas = ${tarefas.length} revisoes`);
  console.log(ENSAIO ? 'MODO ENSAIO (nenhuma chamada a API)' : `modelo: ${MODELO}, concorrencia: ${CONCORRENCIA}`);

  let feitas = 0;
  const resultados = await emLotes(tarefas, ENSAIO ? tarefas.length : CONCORRENCIA, async (t, i) => {
    const bruto = ENSAIO ? respostaDeEnsaio(t.m, i) : await chamarOpenAI(prompt(t.m, t.lingua));
    feitas++;
    if (feitas % 25 === 0 || feitas === tarefas.length) console.log(`  ${feitas}/${tarefas.length}`);

    const achados = [], descartados = [];
    if (bruto?.veredito === 'problema') {
      for (const a of bruto.achados || []) {
        (citacaoConfere(a.citacao, t.m) ? achados : descartados).push(a);
      }
    }
    return { ...t, achados, descartados };
  });

  fs.writeFileSync(ARQ_RELATORIO, relatorio(resultados, entradas.length));
  const marcadas = resultados.filter(r => r.achados.length).length;
  console.log(`\n${ARQ_RELATORIO} escrito — ${marcadas} de ${tarefas.length} revisoes com apontamento.`);
  // Sai 0 mesmo com apontamentos: apontamento nao e falha de build; e leitura humana.
}

// ---------------------------------------------------------------- relatorio

function relatorio(resultados, nEntradas) {
  const agora = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const comApontamento = resultados.filter(r => r.achados.length);
  const descartados = resultados.filter(r => r.descartados.length);
  const l = [];

  l.push('# Relatório da revisão cega do glossário');
  l.push('');
  l.push(`Gerado em ${agora} por ChatGPT (\`${ENSAIO ? 'ENSAIO — sem API' : MODELO}\`), sobre o commit \`${commitAtual()}\`.`);
  l.push('');
  l.push('> **Isto é uma opinião automática, não uma decisão.** O ChatGPT não alterou');
  l.push('> nenhum arquivo e não tem autoridade sobre o texto. Toda mudança é decisão');
  l.push('> humana, e a autoridade final é o rabino.');
  l.push('');

  l.push('## Como foi feito');
  l.push('');
  l.push(`${nEntradas} entradas × ${LINGUAS.length} línguas = **${resultados.length} revisões independentes**.`);
  l.push('');
  l.push('Cada revisão viu apenas o hebraico, a transliteração e o texto daquela');
  l.push('única língua. O revisor não soube quem escreveu, não viu as outras línguas,');
  l.push('e não recebeu nenhuma cota de defeitos — foi instruído a dizer que está');
  l.push('correto quando estiver correto.');
  l.push('');
  l.push('Rubrica aplicada em cada entrada e língua: **erro de sentido**, **palavra');
  l.push('errada**, **gramática da língua-alvo**. Toda queixa exige citação literal;');
  l.push('citação que não confere com o texto real foi descartada automaticamente.');
  l.push('');

  l.push('## Resumo');
  l.push('');
  l.push('| Língua | Entradas com apontamento | Entradas ok |');
  l.push('| --- | ---: | ---: |');
  for (const lingua of LINGUAS) {
    const daLingua = resultados.filter(r => r.lingua.cod === lingua.cod);
    const marcadas = daLingua.filter(r => r.achados.length).length;
    l.push(`| ${lingua.rotulo} | ${marcadas} | ${daLingua.length - marcadas} |`);
  }
  l.push(`| **total** | **${comApontamento.length}** | **${resultados.length - comApontamento.length}** |`);
  l.push('');

  if (!comApontamento.length) {
    l.push('## Apontamentos');
    l.push('');
    l.push('Nenhum. O revisor considerou todas as entradas corretas nas 8 línguas.');
    l.push('');
  } else {
    l.push('## Apontamentos, língua por língua');
    l.push('');
    for (const lingua of LINGUAS) {
      const daLingua = comApontamento.filter(r => r.lingua.cod === lingua.cod);
      if (!daLingua.length) continue;
      l.push(`### ${lingua.rotulo} — ${daLingua.length} entrada(s)`);
      l.push('');
      for (const r of daLingua) {
        l.push(`#### ${r.m.hebraico}`);
        l.push('');
        l.push(`*${r.m.transliteracao}*`);
        l.push('');
        l.push(`Texto em ${lingua.rotulo}: **${r.m.traducao}**`);
        l.push('');
        for (const a of r.achados) {
          l.push(`- **${a.onde || '?'}** · *${a.tipo || '?'}*`);
          l.push(`  - trecho citado: \`${String(a.citacao).replace(/`/g, "'")}\``);
          l.push(`  - problema: ${a.problema || '(sem explicação)'}`);
          if (a.sugestao) l.push(`  - sugestão do revisor: ${a.sugestao}`);
        }
        l.push('');
      }
    }
  }

  if (descartados.length) {
    l.push('## Descartados pelo guarda de citação');
    l.push('');
    l.push('Estas queixas foram jogadas fora porque o trecho citado não existe no');
    l.push('texto revisado — sinal de que o revisor inventou a citação. Ficam');
    l.push('registradas só para você saber que existiram.');
    l.push('');
    for (const r of descartados)
      for (const a of r.descartados)
        l.push(`- ${r.lingua.rotulo} · ${r.m.hebraico} — citou \`${String(a.citacao).replace(/`/g, "'")}\``);
    l.push('');
  }

  l.push('## O que fazer com isto');
  l.push('');
  l.push('1. Leia os apontamentos acima como perguntas, não como correções.');
  l.push('2. Leve ao rabino os que fizerem sentido.');
  l.push('3. Só uma pessoa altera `glossario.json`. Este relatório nunca altera.');
  l.push('');
  return l.join('\n') + '\n';
}

principal().catch(e => { console.error(String(e.message || e)); process.exit(1); });
