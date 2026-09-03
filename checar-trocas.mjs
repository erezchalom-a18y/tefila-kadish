/**
 * checar-trocas.mjs — TROCAR DE KADISH E DE MODO NO MEIO DA REZA
 * ==============================================================
 *
 * 30/08. Ele: "ao passar de um kadish para outro ou de reza para treino da erro,
 * de sincronia, etc".
 *
 * Nenhuma das quinze checagens trocava de nada com o app rodando: todas abriam
 * um Kadish, mediam, e fechavam. Por isso passou despercebido que TROCAR O TIPO
 * DE KADISH NUNCA FUNCIONOU — o ouvinte chamava `temState()`, que mora dentro do
 * modulo SYNC e nunca esteve visivel ali; cada toque lancava
 * "temState is not defined" dentro de um setTimeout, morria calado, e o
 * SYNC.trocar() logo depois nunca rodava. O rotulo do botao trocava e o audio e
 * o texto ficavam no Kadish anterior.
 *
 * A pergunta aqui e sempre a mesma, e e a unica que importa: depois da troca, a
 * palavra ACESA e a que esta SOANDO? Medida contra a fita, quadro a quadro.
 *
 * Roda oito trocas em sequencia, sem recarregar a pagina — de proposito: os
 * defeitos deste tipo sao de ESTADO QUE SOBRA, e estado que sobra so aparece
 * quando se troca varias vezes seguidas.
 *
 * O conserto vive FORA do modulo SYNC, de proposito: ele foi feito depois de o
 * Erez ter aprovado a sincronia e ter pedido que ela so mudasse com autorizacao
 * dele (regra 0 das inviolaveis). Trocar de Kadish e trabalho dos BOTOES, nao da
 * sincronia — quem reposiciona e o SYNC.voltarAoInicio(), que ja existia e ja era
 * usado pelo Modo Treino desde 26/08. A trava-sincronia.mjs continua verde.
 *
 *   node checar-trocas.mjs
 *   GROSSO=0.25 node checar-trocas.mjs   → com o relogio grosso do iOS
 *
 * Precisa do servidor: node servidor-teste.mjs 8896
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const GROSSO = Number(process.env.GROSSO || 0);
const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';
const nav = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const pag = await nav.newPage();
const erros = []; pag.on('pageerror', e => erros.push(e.message));
pag.on('console', m => { if (m.type()==='error' && !/fonts\.|ERR_/.test(m.text())) erros.push(m.text()); });
await pag.goto(`${BASE}/engine.html?n=chabad&t=yatom`);
await pag.waitForFunction(() => window.SYNC && window.SYNC.ativo(), null, { timeout: 25000 });
await pag.evaluate(() => { const m=document.getElementById('setupModal'); if(m)m.classList.remove('show'); });
if (GROSSO) await pag.evaluate((g) => {
  const a = document.getElementById('audioPlayer');
  const d = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'currentTime');
  window.__real = () => d.get.call(a);
  Object.defineProperty(a,'currentTime',{
    get(){ return Math.floor(d.get.call(a)/g)*g; }, set(v){ d.set.call(a,v); }, configurable:true });
}, GROSSO);

const medir = async (rotulo) => {
  const r = await pag.evaluate(async () => {
    const a = document.getElementById('audioPlayer');
    const real = window.__real || (() => a.currentTime);
    const fita = SYNC.fita();
    const am = []; const t0 = performance.now();
    while (performance.now() - t0 < 3500) {
      await new Promise(r => setTimeout(r, 16));
      const ac = document.querySelector('.word.active');
      if (!a.paused && ac) am.push({ t: real(), k: +ac.dataset.vi, wi: +ac.dataset.wi });
    }
    return { am, fita, src: a.src.split('/').slice(-2).join('/'), tocando: !a.paused };
  });
  let erradas = 0, exemplo = null, piorErro = 0;
  for (const s of r.am) {
    const soa = r.fita.find(w => s.t >= w.start && s.t < w.end);
    if (!soa) continue;
    if (soa.k !== s.k || soa.wi !== s.wi) {
      erradas++;
      const acesa = r.fita.find(w => w.k === s.k && w.wi === s.wi);
      const err = acesa ? Math.abs(acesa.start - soa.start) : 99;
      if (err > piorErro) { piorErro = err;
        exemplo = `aos ${s.t.toFixed(2)}s soa ${soa.k}/${soa.wi} e acende ${s.k}/${s.wi} (${(err*1000).toFixed(0)} ms fora)`; }
    }
  }
  const pct = r.am.length ? erradas/r.am.length*100 : -1;
  const ok = r.am.length > 30 && pct <= 5;
  console.log(`${ok ? 'OK   ' : 'FALHA'} ${rotulo.padEnd(46)} ${r.src.padEnd(22)} ` +
    `${r.am.length} quadros · ${pct < 0 ? 'NAO TOCOU' : pct.toFixed(0)+'% errados'}` +
    (exemplo ? `\n        ${exemplo}` : ''));
  return ok;
};

const espera = ms => pag.waitForTimeout(ms);
let falhas = 0;
const passo = async (rotulo, fn) => { await fn(); await espera(1500); if (!(await medir(rotulo))) falhas++; };

await pag.click('#playBtn'); await espera(2500);
if (!(await medir('rezando, sem trocar nada'))) falhas++;

await passo('trocou o TIPO: yatom -> derabanan', () => pag.click('#kadishDerabananToggle'));
await passo('trocou a TRADICAO: chabad -> sefard', () => pag.click('#traditionBadge [data-trad="sefard"]'));
await passo('trocou o TIPO de novo: derabanan -> yatom', () => pag.click('#kadishTypeToggle'));
await passo('trocou a TRADICAO: sefard -> ashkenazi', () => pag.click('#traditionBadge [data-trad="ashkenazi"]'));
await passo('reza -> TREINO', () => pag.click('#treinoToggle'));
// so aperta o play se estiver parado — apertar com o audio tocando e PAUSAR
const tocarSeParado = async () => {
  const parado = await pag.evaluate(() => document.getElementById('audioPlayer').paused);
  if (parado) await pag.click('#playBtn');
};
await passo('treino -> REZA', async () => { await pag.click('#rezaToggle'); await espera(300); await tocarSeParado(); });
await passo('trocou o Kadish JA no treino', async () => {
  await pag.click('#treinoToggle'); await espera(900);
  await pag.click('#traditionBadge [data-trad="chabad"]'); await espera(1200);
  await tocarSeParado();
});
await passo('trocou o TIPO ja no treino', async () => {
  await pag.click('#kadishDerabananToggle'); await espera(1200);
  await tocarSeParado();
});

// ---------- 03/09: TROCAR PELO ENGRENAGEM ----------
// Havia DOIS caminhos para trocar de tradicao, e so um era medido. O de cima
// passa pelo trocarKadish (cala, troca, volta ao inicio, retoma se estava
// tocando); o de dentro do engrenagem chamava o SYNC.trocar cru, e por isso
// parava o audio. Agora os dois chamam a mesma funcao, e este passo cobra isso.
await passo('trocou a TRADICAO pelo ⚙, tocando', async () => {
  await pag.click('#rezaToggle').catch(() => {}); await espera(400);
  await tocarSeParado(); await espera(800);
  await pag.click('#settingsBtn').catch(() => {}); await espera(500);
  await pag.evaluate(() => document
    .querySelector('.seg-control[data-setting="tradition"] button[data-value="sefaradi"]')?.click());
  await espera(2000);
  const parou = await pag.evaluate(() => document.getElementById('audioPlayer').paused);
  if (parou) { console.log('        (o ⚙ PAROU o audio — o botao do alto nao para)'); falhas++; }
  await pag.click('#settingsPanel .close, #settingsClose').catch(() => {});
  await espera(300);
});

// ---------- 03/09: A PORTA DA FRENTE, E VOLTAR AO APP ----------
// O defeito que o Erez achou: ele escolhia Sefaradi, saia e voltava, e a tela
// dizia "Sefaradi" com o audio e o texto do Chabad. O index.html mandava sempre
// para ?n=chabad, e no engine.html o ?n= da URL manda mais que a escolha
// guardada no aparelho. O rotulo lia o aparelho; o audio lia a URL.
//
// NENHUMA checagem entrava pela porta da frente (todas iam direto ao
// engine.html com ?n= e ?t=) e NENHUMA recarregava a pagina. E o mesmo
// caminho-que-ninguem-visita do canPlayType e do temState.
const olhar = () => pag.evaluate(() => ({
  rotulo: document.querySelector('#traditionBadge .modo-op.active')?.dataset.trad,
  tipo: document.querySelector('.tipo-switch .modo-op.active')?.dataset.tipo,
  audio: (document.getElementById('audioPlayer')?.src || '').split('/tefila-audio/')[1] || '',
  versos: document.querySelectorAll('.verse').length,
}));
for (const [trad, pasta, tipo] of [['sefaradi', 'sefaradi', 'yatom'],
                                   ['ashkenazi', 'ashkenaz', 'derabanan']]) {
  await pag.goto(`${BASE}/engine.html`);
  await pag.waitForFunction(() => window.SYNC && window.SYNC.ativo(), null, { timeout: 25000 });
  await pag.evaluate(() => { const m = document.getElementById('setupModal'); if (m) m.classList.remove('show'); });
  await pag.click(`#traditionBadge [data-trad="${trad}"]`); await espera(1500);
  await pag.click(tipo === 'derabanan' ? '#kadishDerabananToggle' : '#kadishTypeToggle'); await espera(1500);
  const antes = await olhar();
  // sai e volta PELA PORTA DA FRENTE, como ele faz
  await pag.goto(`${BASE}/index.html`);
  await pag.waitForFunction(() => window.SYNC && window.SYNC.ativo(), null, { timeout: 25000 });
  await espera(1200);
  const dep = await olhar();
  const bate = dep.rotulo === trad && dep.audio === `${pasta}/${tipo}.mp3`
            && dep.versos === antes.versos;
  console.log(`${bate ? 'OK   ' : 'FALHA'} voltando pela porta da frente em ${trad}/${tipo}: ` +
    `rotulo=${dep.rotulo} audio=${dep.audio} versos=${dep.versos}`);
  if (!bate) { falhas++; console.log(`        antes de sair era ${antes.audio} com ${antes.versos} versos`); }
}

if (erros.length) { console.log(`FALHA erro de console: ${erros[0]}`); falhas++; }
console.log(falhas ? `\n${falhas} problema(s) nas trocas` : '\nVERDE: as trocas nao dessincronizam');
await nav.close();
process.exit(falhas ? 1 : 0);
