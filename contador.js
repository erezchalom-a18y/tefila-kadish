/**
 * contador.js — conta quantos Kadishim foram ditos.
 *
 * Oculto para quem reza: nao aparece nada na tela do app. Quem ve e o Erez, em
 * contador.html (ou em engine.html?contador=1, que imprime no console).
 *
 * DUAS PARTES, e so a primeira funciona hoje:
 *
 * 1. LOCAL — fica no proprio aparelho (localStorage). Nao sai dali, nao passa
 *    por servidor nenhum, nao identifica ninguem. Funciona ja, offline, sem
 *    depender de nada. Conta por nussach, por tipo, por lingua e por dia.
 *
 * 2. GERAL (total, por pais, por lingua) — precisa de um servico fora do
 *    GitHub Pages, que so serve arquivo e nao guarda nada. Esta pronto aqui,
 *    desligado: enquanto ENDERECO_GERAL for string vazia, nada e enviado.
 *    Ver RELATORIO-CONTADOR.md para as opcoes e o que cada uma custa.
 *
 * Um Kadish so e contado quando a pessoa chega ao FIM: o audio precisa passar
 * de 90% do ultimo verso. Abrir o app e fechar nao conta. Ouvir de novo o mesmo
 * Kadish conta de novo — sao dois Kadishim ditos.
 */
(function (raiz) {
  const CHAVE = 'tefila_contador';
  const ENDERECO_GERAL = '';   // vazio = nao envia nada para lugar nenhum

  function ler() {
    try {
      const cru = localStorage.getItem(CHAVE);
      const d = cru ? JSON.parse(cru) : null;
      return (d && typeof d === 'object') ? d : vazio();
    } catch (e) { return vazio(); }
  }
  const vazio = () => ({ total: 0, nussach: {}, tipo: {}, lingua: {}, dia: {}, primeiro: null, ultimo: null });

  function gravar(d) {
    try { localStorage.setItem(CHAVE, JSON.stringify(d)); } catch (e) {}
  }

  const conta = (obj, k) => { if (k) obj[k] = (obj[k] || 0) + 1; };

  /** Registra um Kadish dito ate o fim. */
  function registrar({ nussach, tipo, lingua, quando }) {
    const d = ler();
    const agora = quando || new Date().toISOString();
    d.total++;
    conta(d.nussach, nussach);
    conta(d.tipo, tipo);
    conta(d.lingua, lingua);
    conta(d.dia, agora.slice(0, 10));
    if (!d.primeiro) d.primeiro = agora;
    d.ultimo = agora;
    gravar(d);
    enviar({ nussach, tipo, lingua });
    return d;
  }

  /** So envia se alguem tiver posto um endereco. Falha em silencio de proposito:
   *  o contador nunca pode atrapalhar quem esta rezando. */
  function enviar(dados) {
    if (!ENDERECO_GERAL) return;
    try {
      const corpo = JSON.stringify(dados);
      if (navigator.sendBeacon) navigator.sendBeacon(ENDERECO_GERAL, corpo);
      else fetch(ENDERECO_GERAL, { method: 'POST', body: corpo, keepalive: true }).catch(() => {});
    } catch (e) {}
  }

  /**
   * Liga o contador a um elemento de audio e a lista de versos do sync.
   * Conta quando o audio passa de 90% do ultimo verso, uma vez por passagem.
   */
  function vigiar(audio, versos, contexto) {
    if (!audio || !versos || !versos.length) return;
    const fim = versos[versos.length - 1].end;
    const gatilho = versos[0].start + (fim - versos[0].start) * 0.9;
    let jaContou = false;
    const olhar = () => {
      if (audio.currentTime < gatilho) { jaContou = false; return; }   // voltou: pode contar de novo
      if (jaContou) return;
      jaContou = true;
      registrar(contexto());
    };
    audio.addEventListener('timeupdate', olhar);
    audio.addEventListener('ended', olhar);
  }

  function resumo() {
    const d = ler();
    const ordena = o => Object.entries(o).sort((a, b) => b[1] - a[1]);
    return {
      total: d.total,
      porNussach: ordena(d.nussach),
      porTipo: ordena(d.tipo),
      porLingua: ordena(d.lingua),
      dias: Object.keys(d.dia).length,
      primeiro: d.primeiro,
      ultimo: d.ultimo,
      geralLigado: !!ENDERECO_GERAL,
    };
  }

  function zerar() { try { localStorage.removeItem(CHAVE); } catch (e) {} }

  raiz.Contador = { registrar, vigiar, resumo, ler, zerar, ENDERECO_GERAL };
})(typeof window !== 'undefined' ? window : globalThis);

if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.Contador;
