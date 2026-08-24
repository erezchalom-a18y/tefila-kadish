/**
 * casar-ouvidas.mjs — casa NOSSA lista de palavras com a lista OUVIDA.
 *
 * Isto vivia dentro do realinhar-por-conteudo.mjs. Saiu para ca quando o
 * checar-sincronia.mjs precisou da mesma conta: a coluna "Whisper" dele lia o
 * fontes/whisper-tempos.json, que e um resumo tirado do RELATORIO — so as
 * palavras que o relatorio resolveu citar (25 num Kadish de 124), e sem
 * casamento nenhum: ele confia que o hebraico bate letra por letra. Onde o
 * Whisper ouve "עלמיה" e nos escrevemos "עָלְמַיָּא", ele simplesmente nao via.
 *
 * A transcricao crua (whisper/*.json) tem todas as palavras. Casando com ela,
 * a coluna passa a falar do Kadish inteiro — e as duas ferramentas passam a
 * medir a MESMA coisa, que era o combinado.
 *
 * O Whisper NAO e medida (ele erra em aramaico liturgico). Ele e a unica
 * testemunha do CONTEUDO: diz QUAL palavra soa em cada segundo. O numero exato
 * continua vindo do sinal.
 */
export const normalizar = s => String(s || '').normalize('NFD')
  .replace(/[֑-ׇ]/g, '').replace(/[^א-ת]/g, '');

export function semelhanca(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...new Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[m][n] / Math.max(m, n);
}

/** Needleman-Wunsch por semelhanca do hebraico — a mesma do revisar-audio-whisper.mjs. */
export function alinhar(nossas, ouv) {
  const m = nossas.length, n = ouv.length, BURACO = -0.5;
  const s = Array.from({ length: m + 1 }, () => new Float64Array(n + 1));
  for (let i = 1; i <= m; i++) s[i][0] = i * BURACO;
  for (let j = 1; j <= n; j++) s[0][j] = j * BURACO;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const par = s[i - 1][j - 1] + (2 * semelhanca(nossas[i - 1].norm, ouv[j - 1].norm) - 1);
    s[i][j] = Math.max(par, s[i - 1][j] + BURACO, s[i][j - 1] + BURACO);
  }
  const pares = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 &&
        s[i][j] === s[i - 1][j - 1] + (2 * semelhanca(nossas[i - 1].norm, ouv[j - 1].norm) - 1)) {
      pares.push({ i: i - 1, ouvida: ouv[j - 1] }); i--; j--;
    } else if (i > 0 && s[i][j] === s[i - 1][j] + BURACO) { pares.push({ i: i - 1, ouvida: null }); i--; }
    else j--;
  }
  return pares.reverse();
}

export const PARECIDO = 0.6;   // mesmo limiar do revisar-audio-whisper.mjs

/**
 * Devolve um vetor do tamanho de `palavras`: o instante OUVIDO de cada uma, ou
 * null quando o Whisper nao a reconheceu (orfa).
 */
export function casar(palavras, ouvidas) {
  const ns = palavras.map(p => ({ norm: normalizar(p.hebrew) }));
  const os = ouvidas.map(o => ({ ...o, norm: normalizar(o.hebrew) }));
  const alvo = new Array(palavras.length).fill(null);
  for (const par of alinhar(ns, os))
    if (par.ouvida && semelhanca(ns[par.i].norm, par.ouvida.norm) >= PARECIDO)
      alvo[par.i] = par.ouvida.start;
  return alvo;
}
