/**
 * extrair-whisper.mjs — tira do relatorio do Whisper os tempos que ele ouviu.
 *
 * O RELATORIO-AUDIO-WHISPER.md e escrito para humano ler. Isto le aquele texto
 * e guarda, em JSON, so o que o realinhador precisa: para cada palavra, o
 * segundo em que o Whisper a ouviu.
 *
 * POR QUE E UM CICLO
 * O relatorio so lista as palavras em que o Whisper discordou de nos por mais
 * de 0,6s. Entao, cada vez que o alinhamento melhora, o relatorio seguinte tem
 * MENOS entradas — e as que sobram sao exatamente as que ainda estao erradas.
 * O caminho e:
 *
 *   1. node extrair-whisper.mjs          (le o relatorio de agora)
 *   2. node realinhar.mjs <alvo> --confirmar
 *   3. commit + push  ->  o workflow refaz o relatorio com o alinhamento novo
 *   4. de volta ao 1, ate parar de melhorar
 *
 * Foi assim que se descobriu que os versos 4 e 5 do chabad_derabanan
 * continuavam um bloco adiantados: eu tinha realinhado usando o relatorio
 * VELHO, e o novo mostrou "vikarev ouvido aos 11.56s" onde nos diziamos 10.38.
 *
 * O Whisper nao decide nada: ele so PUXA o alinhador na direcao certa, e o
 * sinal continua dando o numero exato (toda palavra entra num comeco de bloco
 * de voz). Ele erra em aramaico liturgico; por isso a pena e branda e ha folga.
 *
 * Uso: node extrair-whisper.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const RELATORIO = 'RELATORIO-AUDIO-WHISPER.md';
const SAIDA = 'fontes/whisper-tempos.json';

const linhas = readFileSync(RELATORIO, 'utf8').split('\n');
let alvo = null, verso = null;
const tempos = {};

for (const l of linhas) {
  let m;
  if ((m = l.match(/^### (\w+)$/))) { alvo = m[1]; tempos[alvo] = tempos[alvo] || []; verso = null; continue; }
  if ((m = l.match(/^\*\*§(\d+)\*\*$/))) { verso = Number(m[1]); continue; }
  if (!alvo || verso === null) continue;
  // - `HEBRAICO` *(translit)* — nós: X s · ouvido: Y s · diferença ...
  if ((m = l.match(/^- `([^`]+)` \*\(([^)]*)\)\* — nós: ([\d.]+)s · ouvido: ([\d.]+)s/))) {
    tempos[alvo].push({ verso, hebrew: m[1], tl: m[2], nosso: +m[3], ouvido: +Number(m[4]).toFixed(3) });
  }
}

mkdirSync('fontes', { recursive: true });
writeFileSync(SAIDA, JSON.stringify({
  _leia: 'Tempos que o Whisper OUVIU, extraidos do RELATORIO-AUDIO-WHISPER.md por ' +
    'extrair-whisper.mjs. So aparecem as palavras em que ele discordou de nos por mais de ' +
    '0,6s — as outras o relatorio nao lista, e para essas o nosso tempo ja estava perto do ' +
    'dele. NAO e medida: e testemunha do CONTEUDO (que palavra soa em cada segundo), que e ' +
    'justamente o que o sinal nao sabe dizer. Refazer sempre que o relatorio mudar.',
  de_qual_relatorio: linhas.find(l => /^_Gerado/.test(l)) || '(sem data no relatorio)',
  tempos,
}, null, 2) + '\n');

for (const [a, v] of Object.entries(tempos))
  console.log(`  ${a.padEnd(20)} ${String(v.length).padStart(3)} palavras com tempo ouvido`);
console.log(`\ngravado: ${SAIDA}`);
