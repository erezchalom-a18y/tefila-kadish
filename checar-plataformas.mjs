/**
 * checar-plataformas.mjs — O MESMO KADISH EM APARELHOS DIFERENTES
 * ===============================================================
 *
 * 28/08. O Erez abriu o app no iPad, com a versao certa na tela, e o Modo
 * Treino continuava errado: "comeca no veyitkadash, falando bealma, e depois
 * veyitkadash". Aqui as doze checagens estavam verdes.
 *
 * Estavam verdes e nao valiam nada para aquela pergunta: TODAS medem o mesmo
 * navegador — um Chromium de servidor, onde pedir 0,18s poe o audio em 0,18s ao
 * milissegundo e o relogio anda de 19 em 19 ms. O aparelho dele nao e assim, e
 * nenhuma delas jamais teria como perceber.
 *
 * Este arquivo mede o app com o navegador ESTRAGADO DE PROPOSITO, de cinco
 * jeitos que aparelhos de verdade estragam:
 *
 *   relogio grosso   o currentTime so entrega multiplos de 250 ms (iOS)
 *   busca lenta      currentTime = x so tem efeito 400 ms depois (Safari)
 *   busca desviada   pede-se x e cai em x+d (MP3 sem indice, WebKit)
 *   retomada lenta   play() demora a soar depois de um pause()
 *   quadro raro      a tela so atualiza 30 vezes por segundo (aparelho fraco)
 *
 * E cobra tres coisas, as mesmas em todos:
 *   1. a voz COMECA na primeira palavra (nao no meio dela, nao depois dela)
 *   2. a voz nao VAZA para o verso seguinte antes da pausa
 *   3. a palavra ACESA e a palavra que esta SOANDO — medida pelo relogio real
 *      do audio, nao pelo que o app acha
 *
 * A terceira e a que importa: e a queixa dele, na letra dele, e e a unica que
 * sabe distinguir "o app esta certo" de "o app esta convencido de que esta".
 *
 * O QUE ISTO NAO PROVA — e importante, para ninguem se enganar com um verde:
 *
 * Rodei os cinco perfis contra o relato de 28/08 e NENHUM o reproduziu. Nem o
 * codigo de antes dos consertos falha aqui. Ou seja: este arquivo NAO e a prova
 * de que o iPad dele esta consertado, e eu nao vou dizer que esta.
 *
 * O que ele e: uma rede contra a classe de defeito, para que a proxima vez que
 * alguem escrever "aqui a posicao e EXATA: fomos nos que pedimos" — como estava
 * escrito no irPara ate hoje — haja pelo menos um lugar onde essa suposicao e
 * posta a prova num aparelho que nao a cumpre.
 *
 * Para saber o que o aparelho DELE faz existe o diagnostico.html: ele abre no
 * iPad, aperta um botao e me manda os numeros. Sem isso, qualquer conserto meu
 * e chute — e chute ja custou tres rodadas dele.
 *
 *   node checar-plataformas.mjs            → os perfis todos
 *   node checar-plataformas.mjs "iOS"      → so os que casam com o nome
 *
 * Precisa do servidor: node servidor-teste.mjs 8896
 */
const BASE = process.env.BASE || 'http://127.0.0.1:8896/tefila-kadish';
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;

// Perfis. `grosso` em segundos, `atraso`/`atrasoPlay` em ms, `desvio` em segundos.
const PERFIS = [
  { nome: 'computador (Chrome/Edge)',   grosso: 0,    atraso: 0,   desvio: 0,    atrasoPlay: 0,   quadros: 60 },
  { nome: 'Android (Chrome)',           grosso: 0.05, atraso: 80,  desvio: 0.02, atrasoPlay: 40,  quadros: 60 },
  { nome: 'Android antigo, tela lenta', grosso: 0.10, atraso: 250, desvio: 0.04, atrasoPlay: 120, quadros: 30 },
  { nome: 'iPad / iPhone (WebKit)',     grosso: 0.25, atraso: 400, desvio: 0.12, atrasoPlay: 150, quadros: 60 },
  { nome: 'iPad no pior dia',           grosso: 0.25, atraso: 600, desvio: 0.35, atrasoPlay: 250, quadros: 30 },
];

const alvo = process.argv[2];
const perfis = alvo ? PERFIS.filter(p => p.nome.toLowerCase().includes(alvo.toLowerCase())) : PERFIS;
if (!perfis.length) { console.log(`Nenhum perfil casa com "${alvo}".`); process.exit(1); }

// Os 8 dao 40 corridas; por padrao roda 2 nussachim, e --todos abre os 8.
const COMBIS = process.argv.includes('--todos')
  ? [['ashkenaz','yatom'],['ashkenaz','derabanan'],['chabad','yatom'],['chabad','derabanan'],
     ['sefard','yatom'],['sefard','derabanan'],['sefaradi','yatom'],['sefaradi','derabanan']]
  : [['chabad','derabanan'], ['ashkenaz','yatom']];

const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
let falhas = 0;
const linha = (ok, txt, detalhe) => {
  if (!ok) falhas++;
  console.log(`${ok ? 'OK   ' : 'FALHA'} ${txt}`);
  if (!ok && detalhe) console.log(`        ${detalhe}`);
};

for (const perfil of perfis) {
  console.log(`\n=== ${perfil.nome} ===`);
  console.log(`    relogio ${perfil.grosso * 1000}ms · busca ${perfil.atraso}ms e desviada ` +
              `${perfil.desvio * 1000}ms · play ${perfil.atrasoPlay}ms · ${perfil.quadros}fps`);

  for (const [n, t] of COMBIS) {
    const pag = await navegador.newPage();
    const erros = [];
    pag.on('pageerror', e => erros.push(e.message));
    pag.on('console', m => { if (m.type() === 'error' && !/fonts\.|ERR_CONNECTION/.test(m.text())) erros.push(m.text()); });
    await pag.goto(`${BASE}/engine.html?n=${n}&t=${t}&audio=mp3`);
    await pag.waitForFunction(() => window.SYNC && window.SYNC.ativo(), null, { timeout: 25000 });
    await pag.evaluate(() => { const m = document.getElementById('setupModal'); if (m) m.classList.remove('show'); });

    // ---- estraga o navegador ----
    await pag.evaluate((p) => {
      const a = document.getElementById('audioPlayer');
      const d = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'currentTime');
      window.__real = () => d.get.call(a);          // a verdade, so para a medida
      Object.defineProperty(a, 'currentTime', {
        get() { const v = d.get.call(a); return p.grosso ? Math.floor(v / p.grosso) * p.grosso : v; },
        set(v) {
          // O desvio e o do APARELHO: ele empurra para a frente o que se pede.
          // Nao pode passar do fim nem ir abaixo de zero, como no aparelho real.
          const dur = a.duration || 1e9;
          const real = Math.min(Math.max(0, v + p.desvio), dur - 0.02);
          if (p.atraso) setTimeout(() => d.set.call(a, real), p.atraso);
          else d.set.call(a, real);
        },
        configurable: true,
      });
      if (p.atrasoPlay) {
        const play0 = a.play.bind(a);
        a.play = () => new Promise(ok => setTimeout(() => ok(play0()), p.atrasoPlay));
      }
    }, perfil);

    const r = await pag.evaluate(async (p) => {
      const a = document.getElementById('audioPlayer');
      const passos = SYNC.passos();
      const fita = SYNC.fita ? SYNC.fita() : null;
      document.getElementById('treinoToggle').click();
      await new Promise(r => setTimeout(r, 1200 + p.atraso));
      document.getElementById('playBtn').click();

      const amostras = [];
      const t0 = performance.now();
      const intervalo = 1000 / p.quadros;
      let ultimo = 0;
      while (performance.now() - t0 < 12000) {
        await new Promise(r => setTimeout(r, intervalo));
        if (performance.now() - ultimo < intervalo - 1) continue;
        ultimo = performance.now();
        const aceso = document.querySelector('.word.active');
        amostras.push({
          real: window.__real(), pausado: a.paused,
          vi: aceso ? +aceso.dataset.vi : null, wi: aceso ? +aceso.dataset.wi : null,
        });
      }
      a.pause();
      return { amostras, passos: passos.slice(0, 3), fita: fita ? fita.slice(0, 40) : null,
               primeira: passos[0] };
    }, perfil);

    const tocando = r.amostras.filter(s => !s.pausado);
    const nome = `${perfil.nome} · ${n}/${t}`;

    // ---- 1. a voz comeca na PRIMEIRA palavra ----
    // Tolerancia: meia palavra. Comecar 40ms adiantado nao se ouve; comecar
    // depois do meio da primeira palavra e comer o Yitgadal, que e a queixa.
    const p0 = r.primeira;
    // A voz tem que sair DENTRO da primeira palavra. Nao "perto dela": dentro.
    // Sair depois do fim dela e comer o Yitgadal, que e a queixa dele.
    const primeira = r.fita ? r.fita[0] : { start: p0.start, end: p0.start + 0.4 };
    const comecou = tocando.length ? tocando[0].real : null;
    linha(comecou !== null && comecou >= primeira.start - 0.05 && comecou < primeira.end,
      `${nome}: a voz começa na primeira palavra`,
      `começou em ${comecou === null ? '(nunca tocou)' : comecou.toFixed(3) + 's'}; ` +
      `a primeira palavra vai de ${primeira.start}s a ${primeira.end}s`);

    // ---- 2. nao vaza para o verso seguinte ----
    let vazou = null;
    for (let i = 1; i < r.amostras.length; i++) {
      if (r.amostras[i].pausado && !r.amostras[i - 1].pausado) { vazou = r.amostras[i - 1].real; break; }
    }
    // Uma leitura de quadro pode cair depois do corte sem que se ouca nada; a
    // folga e UM quadro do perfil, nunca mais que isso.
    const folga = 1 / perfil.quadros + 0.02;
    linha(vazou === null || vazou <= p0.end + folga,
      `${nome}: a voz não vaza para o verso seguinte`,
      `parou em ${vazou === null ? '(não parou)' : vazou.toFixed(3) + 's'}; o verso 1 acaba em ${p0.end}s`);

    // ---- 3. a palavra ACESA e a que esta SOANDO ----
    // E a coluna que importa, a mesma ideia do "verso errado" do
    // checar-sincronia.mjs: as outras so sabem ONDE a voz esta; esta sabe QUAL
    // palavra o aparelho esta tocando enquanto a tela acende outra.
    let erradas = 0, exemplo = null;
    if (r.fita) {
      for (const s of tocando) {
        if (s.vi === null || Number.isNaN(s.vi)) continue;
        const soando = r.fita.find(w => s.real >= w.start && s.real < w.end);
        if (!soando) continue;                       // silencio entre palavras
        if (soando.k !== s.vi || soando.wi !== s.wi) {
          erradas++;
          if (!exemplo) exemplo = `aos ${s.real.toFixed(2)}s soa ${soando.k}/${soando.wi} ` +
                                  `e a tela acende ${s.vi}/${s.wi}`;
        }
      }
    }
    const proporcao = tocando.length ? erradas / tocando.length : 0;
    // 4%, e nao 12%. Estava em 12% enquanto o destaque lia o relogio CRU do
    // audio, que no iOS e um piso e fica ate um salto inteiro atrasado — no
    // perfil "iPad no pior dia" isso dava 13% de quadros em que a tela acendia
    // uma palavra e o audio tocava outra. Desde 28/08 o destaque le a mesma
    // conta de relogio de parede que o resto do app, e a medida caiu para 1%.
    // O limite acompanha: aceitar 12% seria guardar lugar para o defeito voltar.
    linha(proporcao <= 0.04,
      `${nome}: a palavra acesa é a que está soando`,
      `${erradas} de ${tocando.length} quadros discordam (${(proporcao * 100).toFixed(0)}%)` +
      (exemplo ? ` · ex.: ${exemplo}` : ''));

    if (erros.length) linha(false, `${nome}: sem erro de console`, erros[0]);
    await pag.close();
  }
}

// ---------------------------------------------------------------------------
// O ARQUIVO DURA O QUE A FITA DIZ?
// ---------------------------------------------------------------------------
// Esta e a checagem que faltava, e a falta dela custou dias ao Erez.
//
// A medida que ele mandou do iPad tinha esta linha:
//     buscas no OGG (duracao 111.35145833333333)
// O arquivo dura 121,603s. O aparelho decodificava o Ogg com uma linha do tempo
// 10,25 SEGUNDOS mais curta — 9,21% adiantado. Nao era a busca (0 ms de erro),
// nao era o relogio, nao era o Modo Treino: era o audio correndo depressa.
// No fim do verso 1 ja eram 403 ms de adianto, que e o "bealma" que ele ouvia;
// no verso 6, 1,8 segundo.
//
// A sincronia inteira e uma regra de tres contra o relogio do arquivo. Se esse
// relogio esta errado, nada em cima dele pode estar certo — e o app nao tinha
// como saber, porque nunca perguntou. Agora pergunta, e aqui se confere que ele
// pergunta: calado no arquivo certo, e avisando no arquivo torto.
console.log('\n=== o arquivo dura o que a fita diz? ===');
for (const torto of [false, true]) {
  const pag = await navegador.newPage();
  if (torto) await pag.addInitScript(() => {
    const dd = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'duration');
    Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
      get() { const v = dd.get.call(this); return isFinite(v) ? v * 0.9157 : v; },
      configurable: true });
  });
  await pag.goto(`${BASE}/engine.html?n=chabad&t=derabanan`);
  await pag.waitForFunction(() => window.SYNC && window.SYNC.ativo(), null, { timeout: 25000 });
  await pag.evaluate(() => { const m = document.getElementById('setupModal'); if (m) m.classList.remove('show'); });
  await pag.waitForTimeout(3000);
  const avisou = await pag.evaluate(() => !!window.__avisouDuracao);
  linha(avisou === torto,
    torto ? 'áudio com a base de tempo errada: o app AVISA'
          : 'áudio certo: o app fica calado (não assusta quem reza)',
    `avisou = ${avisou}`);
  await pag.close();
}

await navegador.close();
console.log(falhas
  ? `\n${falhas} problema(s) — o app NAO se comporta igual em todo aparelho`
  : `\nVERDE: o app se comporta igual nos ${perfis.length} perfis de aparelho`);
process.exit(falhas ? 1 : 0);
