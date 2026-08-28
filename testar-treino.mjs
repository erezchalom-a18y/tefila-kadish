/**
 * testar-treino.mjs — o Modo Treino e a repeticao, verso a verso.
 *
 * Existe porque isto ja quebrou duas vezes, e as duas o Erez descobriu usando:
 *   1. a logica vivia no caminho do cronometro estimado, que saiu de cena
 *      quando a sincronia real entrou — parou de repetir;
 *   2. a pausa era feita direto no elemento de audio, entao o app continuava
 *      achando que estava tocando e o botao ▶ nao voltava a tocar; e o ▶
 *      recomecava do zero em vez de retomar — "trava depois da primeira vez".
 *
 * Confere, no chabad_yatom:
 *   - o Modo Treino pausa no FIM DE CADA VERSO, e nao sempre no mesmo lugar;
 *   - depois da pausa, o ▶ RETOMA (nao recomeca do primeiro verso);
 *   - com repeticao 2x, cada verso toca duas vezes antes da pausa;
 *   - o app fica sabendo que pausou (senao o botao vira um clique morto).
 *
 * ATENCAO ao servidor: este teste SO vale contra um servidor que responda a
 * pedidos Range. O `python3 -m http.server` nao responde, e sem isso o
 * navegador nao consegue mover o audio: todo seek cai no zero. Rodando assim,
 * o teste dava verde medindo uma ficcao — a repeticao "funcionava" porque o
 * audio voltava ao comeco de qualquer jeito. Use servidor-teste.mjs. O teste
 * confere isso na primeira linha e reprova se o servidor nao servir.
 *
 * Uso: node servidor-teste.mjs 8896 . &
 *      node testar-treino.mjs [http://127.0.0.1:8896/tefila-kadish]
 * Sem os navegadores do Playwright baixados: CHROMIUM=/caminho/do/chrome
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';

const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
);
const pag = await navegador.newPage();
const erros = [];
pag.on('console', m => {
  if (m.type() === 'error' && !/fonts\.|ERR_CONNECTION_RESET/.test(m.text())) erros.push(m.text());
});
await pag.goto(`${BASE}/engine.html?n=chabad&t=yatom&audio=mp3`);
await pag.waitForTimeout(2500);

// O servidor responde Range? Sem isso nada abaixo significa coisa alguma.
const temRange = await pag.evaluate(async (base) => {
  try {
    const r = await fetch(`${base}/tefila-audio/chabad/yatom.mp3`, { headers: { Range: 'bytes=0-99' } });
    return r.status === 206;
  } catch (e) { return false; }
}, BASE);
if (!temRange) {
  console.log('FALHA o servidor nao responde a pedidos Range (206).');
  console.log('      Sem isso o audio nao consegue ser movido e este teste nao');
  console.log('      mede nada. Use: node servidor-teste.mjs 8896 .');
  await navegador.close();
  process.exit(1);
}

const audio = () => pag.evaluate(() => {
  const a = document.getElementById('audioPlayer');
  return { t: +a.currentTime.toFixed(2), pausado: a.paused, appTocando: state.isPlaying };
});
const esperarPausa = async (ms) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    await pag.waitForTimeout(200);
    const a = await audio();
    if (a.pausado) return a;
  }
  return null;
};

const versos = await pag.evaluate(async () => {
  const d = await (await fetch('./sync/chabad_yatom_sync.json')).json();
  return d.versos.map(v => ({ n: v.n, start: v.start, end: v.end }));
});

let falhas = 0;
const confere = (nome, ok, detalhe = '') => {
  console.log((ok ? 'OK    ' : 'FALHA ') + nome + (ok || !detalhe ? '' : '\n        ' + detalhe));
  if (!ok) falhas++;
};

// ---------- Modo Treino sem repeticao: pausa no fim de cada verso ----------
await pag.evaluate(() => { state.modoTreino = true; state.repeatN = 1; });
const pausas = [];
for (let i = 0; i < 4; i++) {
  await pag.click('#playBtn').catch(() => {});
  await pag.waitForTimeout(500);
  const retomou = (await audio()).t;
  const p = await esperarPausa(25000);
  if (!p) break;
  pausas.push({ retomou, parou: p.t, app: p.appTocando });
}
confere('pausa em quatro versos seguidos', pausas.length === 4,
  `pausou ${pausas.length} vez(es)`);
confere('cada pausa e num verso diferente',
  new Set(pausas.map(p => p.parou)).size === pausas.length,
  pausas.map(p => p.parou + 's').join(', '));
confere('o ▶ retoma, nao recomeca do inicio',
  pausas.slice(1).every(p => p.retomou > 1),
  pausas.map(p => `retomou em ${p.retomou}s`).join(' · '));
confere('o app sabe que pausou (o botao ▶ funciona)',
  pausas.every(p => p.app === false));
const nasFronteiras = pausas.every(p =>
  versos.some(v => Math.abs(v.end - p.parou) < 0.25));
confere('cada pausa cai no fim de um verso', nasFronteiras,
  pausas.map(p => p.parou + 's').join(', '));

// ---------- com repeticao 2x, SEM Modo Treino: repete e SEGUE sozinho ----------
// Aqui vale a pena atrasar o efeito do seek de proposito: no Safari do iPhone
// ele demora varios quadros, e era nesse intervalo que o destaque piscava a
// palavra do verso seguinte e a repeticao se perdia.
await pag.reload();
await pag.waitForTimeout(2500);
await pag.evaluate(() => {
  const a = document.getElementById('audioPlayer');
  const d = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'currentTime');
  Object.defineProperty(a, 'currentTime', {
    get() { return d.get.call(a); },
    set(v) { setTimeout(() => d.set.call(a, v), 400); },   // imita o Safari lento
    configurable: true,
  });
  state.modoTreino = false; state.repeatN = 2;
});
await pag.click('#playBtn').catch(() => {});
const trilha = await pag.evaluate(async () => {
  const out = []; const a = document.getElementById('audioPlayer'); let ant = '';
  const t0 = performance.now();
  while (performance.now() - t0 < 26000) {
    await new Promise(r => requestAnimationFrame(r));
    const el = document.querySelector('.word.active');
    const m = el ? `${el.dataset.vi}/${el.dataset.wi}` : '-';
    if (m !== ant) { out.push(m); ant = m; }
  }
  return out;
});
const versosNaOrdem = trilha.filter(m => m !== '-').map(m => Number(m.split('/')[0]));
// quantas vezes cada verso comecou (palavra 0)
const comecos = trilha.filter(m => m.endsWith('/0')).map(m => Number(m.split('/')[0]));
const vezesDoVerso0 = comecos.filter(v => v === 0).length;
const vezesDoVerso1 = comecos.filter(v => v === 1).length;
confere('com repeticao 2x, o verso 1 toca duas vezes', vezesDoVerso0 === 2,
  `tocou ${vezesDoVerso0} vez(es): ${trilha.join(' ')}`);
confere('com repeticao 2x, o verso 2 toca duas vezes', vezesDoVerso1 === 2,
  `tocou ${vezesDoVerso1} vez(es): ${trilha.join(' ')}`);
confere('depois das repeticoes, segue sozinho para o verso seguinte',
  versosNaOrdem.includes(2), trilha.join(' '));
// nunca pode acender um verso que ainda nao chegou
let piscou = null;
for (let i = 1; i < versosNaOrdem.length; i++)
  if (versosNaOrdem[i] > versosNaOrdem[i-1] + 1) piscou = `${versosNaOrdem[i-1]} -> ${versosNaOrdem[i]}`;
confere('o destaque nunca pula um verso', piscou === null, piscou || '');

// ---------- Modo Treino: o destaque nao pisca a palavra do verso seguinte ----------
await pag.reload();
await pag.waitForTimeout(2500);
await pag.evaluate(() => { state.modoTreino = true; state.repeatN = 1; });
await pag.click('#playBtn').catch(() => {});
const naPausa = await pag.evaluate(async () => {
  const a = document.getElementById('audioPlayer');
  const t0 = performance.now();
  while (performance.now() - t0 < 25000) {
    await new Promise(r => requestAnimationFrame(r));
    if (a.paused && a.currentTime > 1) {
      await new Promise(r => setTimeout(r, 700));         // deixa quadros correrem
      const el = document.querySelector('.word.active');
      return el ? `${el.dataset.vi}/${el.dataset.wi}` : '-';
    }
  }
  return null;
});
confere('parado no fim do verso, o destaque fica na ultima palavra do verso que acabou',
  naPausa === '0/3', `ficou em ${naPausa} (esperado 0/3, a ultima palavra do §1)`);

// ---------- COMECAR EM QUALQUER PALAVRA (25/08) ----------
// O pedido dele: "tanto no modo reza ou no modo treino, deveria permitir
// comecar de qualquer palavra, hoje so comeca na primeira". O que quebra
// facil aqui nao e o audio (o relogio anda), e o CONTADOR DE VERSO do Modo
// Treino: caindo no meio do Kadish sem re-armar, o verso seguinte era lido
// como "acabou um verso" e a pausa vinha na hora errada.
for (const treino of [false, true]) {
  await pag.reload();
  await pag.waitForTimeout(2500);
  await pag.evaluate(t => { state.modoTreino = t; state.repeatN = 1; }, treino);
  const nome = treino ? 'Modo Treino' : 'Modo Reza';

  // o balao da palavra tem o botao, e ele existe na lingua da tela
  const alvo = await pag.evaluate(() => {
    const w = document.querySelector('.word[data-vi="2"][data-wi="1"]') ||
              document.querySelector('.word[data-vi="1"][data-wi="1"]');
    if (!w) return null;
    w.click();
    const b = document.getElementById('popupComecar');
    return { temBotao: !!b, texto: b ? b.textContent.trim() : '',
             vi: Number(w.dataset.vi), wi: Number(w.dataset.wi) };
  });
  confere(`${nome}: tocar numa palavra oferece "comecar aqui"`,
    !!(alvo && alvo.temBotao && alvo.texto), JSON.stringify(alvo));

  const r = await pag.evaluate(async () => {
    const a = document.getElementById('audioPlayer');
    const vi = popup._currentVi, wi = popup._currentWi;
    document.getElementById('popupComecar').click();
    await new Promise(r => setTimeout(r, 900));
    return { vi, wi, agora: a.currentTime, tocando: !a.paused,
             aceso: (document.querySelector('.word.active') || {}).dataset,
             espiada: SYNC.espiar() };
  });
  confere(`${nome}: o audio pula para a palavra e toca`,
    r.tocando && r.agora > 1, `currentTime ${r.agora}, tocando ${r.tocando}`);
  confere(`${nome}: o destaque vai junto, e no verso da palavra`,
    r.aceso && Number(r.aceso.vi) === alvo.vi,
    `aceso em ${r.aceso ? r.aceso.vi + '/' + r.aceso.wi : '-'}, pedido ${alvo.vi}/${alvo.wi}`);
  confere(`${nome}: o contador de verso re-arma no verso onde ele entrou`,
    r.espiada.versoAnterior === alvo.vi,
    `versoAnterior ${r.espiada.versoAnterior}, esperado ${alvo.vi}`);
}

// e no Modo Treino a pausa seguinte tem que ser a do FIM daquele verso, nao
// uma pausa imediata por o contador achar que um verso acabou
await pag.reload();
await pag.waitForTimeout(2500);
await pag.evaluate(() => { state.modoTreino = true; state.repeatN = 1; });
const pausou = await pag.evaluate(async () => {
  const w = document.querySelector('.word[data-vi="2"][data-wi="1"]');
  w.click();
  document.getElementById('popupComecar').click();
  const a = document.getElementById('audioPlayer');
  const t0 = performance.now();
  const entrou = a.currentTime;
  while (performance.now() - t0 < 25000) {
    await new Promise(r => requestAnimationFrame(r));
    if (a.paused && a.currentTime > entrou + 0.3) {
      const el = document.querySelector('.word.active');
      return { vi: el ? Number(el.dataset.vi) : null, andou: a.currentTime - entrou };
    }
  }
  return null;
});
confere('Modo Treino: comecando no meio, a pausa vem no fim daquele verso',
  pausou && pausou.vi === 2 && pausou.andou > 0.3,
  JSON.stringify(pausou));

// ---------- os dois defeitos de 26/08, com a busca LENTA de proposito ----------
// O Erez, no chabad_derabanan: "na segunda [rodada] ja pega no audio um pequeno
// pedaco da segunda (be) e vai para a segunda palavra da segunda frase"; e
// "quando clico para comecar de uma palavra comeca na proxima".
//
// Os dois vinham da mesma coisa: a busca no audio nao e instantanea, e ninguem
// conferia. Enquanto a agulha andava o rabino continuava falando (o "be" que
// escapava), e o play() logo depois do "Comecar aqui" lia o currentTime ANTIGO
// — num app recem-aberto isso e 0 — e zerava o pulo.
//
// Aqui o atraso e imitado de proposito: 400 ms, como no Safari do iPhone.
await pag.goto(`${BASE}/engine.html?n=chabad&t=derabanan&audio=mp3`);
await pag.waitForTimeout(2500);
await pag.evaluate(() => {
  const a = document.getElementById('audioPlayer');
  const d = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'currentTime');
  window.__pedidos = [];
  Object.defineProperty(a, 'currentTime', {
    get() { return d.get.call(a); },
    set(v) { window.__pedidos.push(+v.toFixed(3)); setTimeout(() => d.set.call(a, v), 400); },
    configurable: true,
  });
});

// 1. a repeticao nao pode deixar a voz vazar para o verso seguinte
const vazou = await pag.evaluate(async () => {
  state.modoTreino = true; state.repeatN = 2;
  const a = document.getElementById('audioPlayer');
  const d = await (await fetch('./sync/chabad_derabanan_sync.json')).json();
  const fimV1 = d.versos[0].end;                       // 4.38
  document.getElementById('playBtn').click();
  let maior = 0, anterior = 0;
  const t0 = performance.now();
  while (performance.now() - t0 < 14000) {
    await new Promise(r => requestAnimationFrame(r));
    if (!a.paused && a.currentTime > maior) maior = a.currentTime;
    // Para no primeiro REBOBINAR. Antes parava so quando ja tinha passado do
    // fim do verso — o que hoje nao acontece mais, e o teste seguia medindo o
    // verso 2, que o treino ja toca sozinho. Media o conserto como se fosse o
    // defeito.
    if (anterior > 1 && a.currentTime < anterior - 0.5) break;
    anterior = a.currentTime;
  }
  return { fimV1, maiorTocado: +maior.toFixed(2) };
});
confere('a repeticao nao deixa a voz passar do fim do verso',
  vazou.maiorTocado <= vazou.fimV1 + 0.25,
  `tocou ate ${vazou.maiorTocado}s, e o verso acaba em ${vazou.fimV1}s ` +
  `(o excesso e o "pequeno pedaco da segunda" que ele ouviu)`);

// 2. "Comecar aqui" num app recem-aberto nao pode cair no zero
await pag.goto(`${BASE}/engine.html?n=chabad&t=derabanan&audio=mp3`);
await pag.waitForTimeout(2500);
await pag.evaluate(() => {
  const a = document.getElementById('audioPlayer');
  const d = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'currentTime');
  Object.defineProperty(a, 'currentTime', {
    get() { return d.get.call(a); },
    set(v) { setTimeout(() => d.set.call(a, v), 400); },
    configurable: true,
  });
});
const comecou = await pag.evaluate(async () => {
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const d = await (await fetch('./sync/chabad_derabanan_sync.json')).json();
  const alvo = d.versos[1].palavras[0];                // bealma, 4.38 - 5.16
  const w = document.querySelector('.word[data-vi="1"][data-wi="0"]');
  w.click();
  document.getElementById('popupComecar').click();
  await espera(1200);
  const a = document.getElementById('audioPlayer');
  return { t: +a.currentTime.toFixed(2), inicio: alvo.start, fim: alvo.end,
           proxima: d.versos[1].palavras[1].start };
});
confere('"Comecar aqui" cai DENTRO da palavra pedida, nao no zero nem na seguinte',
  comecou.t >= comecou.inicio - 0.1 && comecou.t < comecou.proxima,
  `parou em ${comecou.t}s; a palavra vai de ${comecou.inicio}s a ${comecou.fim}s ` +
  `e a seguinte comeca em ${comecou.proxima}s`);

// ---------- a versao tem que estar visivel nos ajustes ----------
// Existe porque o Erez disse "nada mudou" e nem ele nem eu tinhamos como saber
// qual codigo o iPad dele estava rodando. Sem esta linha na tela, todo relato
// dele fica ambiguo entre "o conserto nao funciona" e "o aparelho tem a copia
// de ontem".
// A versao tem que estar NO ALTO DA TELA, sem abrir nada. Ela ja esteve so
// dentro dos Ajustes e o Erez nao a achou duas vezes — escondida, nao servia.
const versao = await pag.evaluate(() => {
  const topo = document.getElementById('versaoTopo');
  const rt = topo && topo.getBoundingClientRect();
  document.getElementById('settingsToggle').click();
  const el = document.getElementById('settingsVersao');
  const r = el && el.getBoundingClientRect();
  return {
    topo: topo ? topo.textContent.trim() : null,
    topoVisivel: !!(rt && rt.width > 0 && rt.height > 0 && rt.top >= 0 && rt.top < 300),
    ajustes: el ? el.textContent.trim() : null,
    ajustesVisivel: !!(r && r.width > 0 && r.height > 0),
  };
});
confere('a versao aparece NO ALTO da tela, sem abrir nada',
  !!versao.topo && versao.topoVisivel, JSON.stringify(versao));
confere('a versao tambem aparece nos ajustes, com a data',
  !!versao.ajustes && versao.ajustesVisivel && /\d{4}-\d{2}-\d{2}/.test(versao.ajustes),
  JSON.stringify(versao));
if (versao) console.log(`        (no alto: "${versao.topo}" · nos ajustes: "${versao.ajustes}")`);

// E o numero da tela tem que ser o MESMO que esta publicado no versao.json.
// Se o arquivo estiver na frente da constante, todo aparelho recarrega uma vez
// a cada visita; se estiver atras, a atualizacao automatica nunca dispara e o
// iPad dele fica preso de novo — que e o defeito que este mecanismo existe para
// consertar. Os dois so servem juntos.
//
// O versao.json carrega DUAS marcas: "versao" (o app) e "marca" (os dados de
// sincronia, que o sincronia.html le). Em 26/08 eu reescrevi o arquivo so com a
// primeira e apaguei a segunda sem perceber. Por isso a conferencia aqui olha as
// duas: uma some calada.
const pubJson = JSON.parse((await import('node:fs')).readFileSync('versao.json', 'utf8'));
const constante = (await import('node:fs')).readFileSync('engine.html', 'utf8')
  .match(/const VERSAO = '([^']+)'/);
confere('a versao do engine.html e a mesma publicada no versao.json',
  !!constante && constante[1] === pubJson.versao,
  `engine.html: "${constante ? constante[1] : '(nao achei)'}"  versao.json: "${pubJson.versao}"`);
confere('o versao.json nao perdeu a marca dos dados de sincronia',
  typeof pubJson.marca === 'string' && pubJson.marca.length > 0,
  `marca: ${JSON.stringify(pubJson.marca)}`);
confere('o que aparece no alto da tela sai da constante, nao de um numero a mao',
  !!constante && versao.topo === 'v' + constante[1].split('·').pop().trim(),
  `no alto: "${versao.topo}"  constante: "${constante ? constante[1] : ''}"`);

// ---------- 27/08: o que o botao "Modo Treino" liga e desliga ----------
// Ele pediu: "no modo treino entra sem repeticao, deve entrar com 3 repeticoes
// por frase como padrao". Isto anda junto com a respiracao entre repeticoes
// (checar-treino-fita.mjs): repetir sem respirar foi o que fez a repeticao 2x
// ser desligada em 26/08, e voltar a liga-la sem ela traz o engasgo de volta.
//
// E tem que DESLIGAR ao sair: o "esta repetindo" dele foi literal — o treino
// ligava a repeticao e ninguem a desligava, entao a reza seguia repetindo.
const rep = await pag.evaluate(async () => {
  const seg = () => new Promise(r => setTimeout(r, 250));
  // Dois botoes desde 27/08: um entra no treino, o outro volta para a reza.
  const btTreino = document.getElementById('treinoToggle');
  const btReza = document.getElementById('rezaToggle');
  const cont = document.getElementById('repCount');
  // garante que comeca fora do treino e sem repeticao
  if (state.modoTreino) { btReza.click(); await seg(); }
  state.repeatN = 0; state.repeatRemaining = 0; state.repeatRestante = undefined;
  btTreino.click(); await seg();
  const dentro = { n: state.repeatN, rotulo: cont.textContent.trim(),
                   visivel: getComputedStyle(cont).display !== 'none',
                   velocidade: state.speed };
  btReza.click(); await seg();
  const fora = { n: state.repeatN, visivel: getComputedStyle(cont).display !== 'none',
                 velocidade: state.speed, tocando: !document.getElementById('audioPlayer').paused };
  return { dentro, fora };
});
confere('entrar no Modo Treino liga 3 repeticoes por verso',
  rep.dentro.n === 3 && rep.dentro.rotulo === '3×' && rep.dentro.visivel,
  JSON.stringify(rep.dentro));
confere('e o botao de repeticao mostra isso na tela, sem abrir nada',
  rep.dentro.visivel && rep.dentro.rotulo === '3×', JSON.stringify(rep.dentro));
confere('sair do Modo Treino desliga a repeticao e volta a 1x',
  rep.fora.n === 0 && !rep.fora.visivel && rep.fora.velocidade === 1 && !rep.fora.tocando,
  JSON.stringify(rep.fora));

// ---------- 27/08: o que o Modo Treino MOSTRA ----------
// "acho que nao precisa da traducao no modo treino e o hebraico e opcional (nas
// configuracoes)". A transliteracao nunca sai: e ela que a boca le.
const camadas = await pag.evaluate(async () => {
  const seg = () => new Promise(r => setTimeout(r, 200));
  const visivel = sel => { const e = document.querySelector(sel);
    return !!e && getComputedStyle(e).display !== 'none'; };
  const btTreino = document.getElementById('treinoToggle');
  const btReza = document.getElementById('rezaToggle');
  if (!state.modoTreino) { btTreino.click(); await seg(); }
  const olhar = () => ({ heb: visivel('.hebrew'), tr: visivel('.translit'), pt: visivel('.pt-merged') });
  aplicarCamadasDoTreino('heb-tr');     await seg(); const padrao = olhar();
  aplicarCamadasDoTreino('so-translit');await seg(); const so = olhar();
  aplicarCamadasDoTreino('tudo');       await seg(); const tudo = olhar();
  aplicarCamadasDoTreino('heb-tr');     await seg();
  btReza.click(); await seg();          // sai do treino
  const naReza = olhar();
  return { padrao, so, tudo, naReza };
});
confere('no Modo Treino a traducao sai e o hebraico fica (padrao)',
  camadas.padrao.heb && camadas.padrao.tr && !camadas.padrao.pt, JSON.stringify(camadas.padrao));
confere('"So transliteracao" tira tambem o hebraico',
  !camadas.so.heb && camadas.so.tr && !camadas.so.pt, JSON.stringify(camadas.so));
confere('"Tudo" traz a traducao de volta',
  camadas.tudo.heb && camadas.tudo.tr && camadas.tudo.pt, JSON.stringify(camadas.tudo));
confere('e a REZA nao muda por causa desse ajuste',
  camadas.naReza.heb && camadas.naReza.tr && camadas.naReza.pt, JSON.stringify(camadas.naReza));

// ---------- 27/08: o que ele mandou tirar da tela ----------
// "esta escrito modo treino - pausa apos cada verso (desnecessario na minha
// opiniao)" e "em pe em minian de 10 e em voz audivel e desnecessario tambem".
const tirados = await pag.evaluate(() => ({
  faixa: !!document.querySelector('.treino-banner'),
  pictos: document.querySelectorAll('.picto').length,
}));
confere('a faixa "Modo Treino · pausa apos cada verso" saiu da tela',
  tirados.faixa === false, JSON.stringify(tirados));
confere('os pictogramas "em pe · minyan · voz audivel" sairam da tela',
  tirados.pictos === 0, JSON.stringify(tirados));

// ---------- 27/08: os DOIS modos aparecem sem apertar nada ----------
// "ele so aparece quando clicado e o usuario nao sabe de sua existencia."
// Um botao so, escrito "Modo Reza", nao dizia se aquilo era o estado ou o
// destino — e de nenhuma das duas leituras saia que existe um Modo Treino.
// Agora sao dois, sempre visiveis, e o aceso e onde voce esta.
const dois = await pag.evaluate(async () => {
  const seg = () => new Promise(r => setTimeout(r, 250));
  const rz = document.getElementById('rezaToggle');
  const tr = document.getElementById('treinoToggle');
  const ver = () => ({
    rezaVisivel: !!rz && rz.getBoundingClientRect().width > 0,
    treinoVisivel: !!tr && tr.getBoundingClientRect().width > 0,
    rezaTexto: rz ? rz.textContent.trim() : null,
    treinoTexto: tr ? tr.textContent.trim() : null,
    rezaAceso: !!rz && rz.classList.contains('active'),
    treinoAceso: !!tr && tr.classList.contains('active'),
    alturaTreino: tr ? Math.round(tr.getBoundingClientRect().height) : 0,
  });
  if (state.modoTreino) { rz.click(); await seg(); }
  const naReza = ver();
  tr.click(); await seg();
  const noTreino = ver();
  // tocar no que JA esta aceso nao pode fazer nada: e o toque mais provavel de
  // todos, o de quem so quer conferir onde esta, e reiniciaria a reza.
  const ondeEstava = document.getElementById('audioPlayer').currentTime;
  const repAntes = state.repeatN;
  tr.click(); await seg();
  const inerte = { aindaTreino: state.modoTreino, rep: state.repeatN === repAntes,
                   mexeu: Math.abs(document.getElementById('audioPlayer').currentTime - ondeEstava) > 0.3 };
  rz.click(); await seg();
  return { naReza, noTreino, inerte };
});
confere('os dois modos aparecem na barra ao mesmo tempo, sem apertar nada',
  dois.naReza.rezaVisivel && dois.naReza.treinoVisivel,
  JSON.stringify(dois.naReza));
confere('cada um tem o seu nome, e nao um nome que troca',
  !!dois.naReza.rezaTexto && !!dois.naReza.treinoTexto &&
  dois.naReza.rezaTexto === dois.noTreino.rezaTexto &&
  dois.naReza.treinoTexto === dois.noTreino.treinoTexto,
  `reza:"${dois.naReza.rezaTexto}" treino:"${dois.naReza.treinoTexto}"`);
confere('na reza o aceso e o Reza; no treino e o Treino',
  dois.naReza.rezaAceso && !dois.naReza.treinoAceso &&
  dois.noTreino.treinoAceso && !dois.noTreino.rezaAceso,
  JSON.stringify({ naReza: dois.naReza, noTreino: dois.noTreino }));
confere('o botao do modo tem pelo menos 30px de altura (dedo de quem reza em pe)',
  dois.naReza.alturaTreino >= 30, `${dois.naReza.alturaTreino}px`);
confere('tocar no modo em que ele JA esta nao faz nada',
  dois.inerte.aindaTreino && dois.inerte.rep && !dois.inerte.mexeu,
  JSON.stringify(dois.inerte));

confere('nenhum erro de console', erros.length === 0, erros[0] || '');

await navegador.close();
console.log(falhas ? `\n${falhas} problema(s) no Modo Treino` : '\nVERDE: Modo Treino e repeticao passaram');
process.exit(falhas ? 1 : 0);
