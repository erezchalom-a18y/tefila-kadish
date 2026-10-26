/**
 * checar-menu.mjs — a fileira de menus do pe, e O CAMINHO DE VOLTA AO KADISH.
 *
 * Nasceu em 25/10 a noite, de uma pergunta dele: "faltou no menu, ir para a
 * tela do kadish, nao?". Faltava, e o defeito era maior do que um item a menos.
 * Medido antes de consertar, num iPhone SE:
 *
 *   Ajustes rolado ate o fim        ->  o × do canto fica a -628px, FORA da tela
 *   tocando em "Por quem"           ->  o painel abre JA ROLADO (697px), e o ×
 *                                       nasce fora da tela nas tres telas
 *
 * Ou seja: a porta que a v65 criou levava a um painel de onde o unico caminho
 * de volta visivel era acertar uma faixa fina de fundo escuro no pe. Nenhuma
 * das checagens visitava esse caminho — nenhuma ROLAVA um painel.
 *
 * A PERGUNTA QUE IMPORTA e a terceira: **rolado ate o fim de cada painel, quem
 * esta no ponto do menu?** Ela e feita com elementFromPoint, nunca pelo
 * atributo nem pelo z-index escrito no CSS — e o que o DEDO encontra (a licao
 * da v60, quando o `hidden` foi ao ar sem esconder nada e a checagem deu verde).
 *
 * Reprova quando:
 *   - nao sao SEIS itens, ou algum nao tem rotulo proprio;
 *   - dois itens dizem a mesma coisa (foi o defeito do nome: "O Kadish" no menu
 *     abria o painel que EXPLICA o Kadish, e lia-se como a tela);
 *   - um rotulo fica abaixo de 12px, ou um item abaixo de 30px de altura, ou um
 *     rotulo quebra em duas linhas (ai o menu cresce e o Kadish encolhe);
 *   - com um painel aberto e ROLADO ATE O FIM, o menu nao esta no ponto;
 *   - tocar em "O Kadish" nao fecha o painel e nao devolve a tela da reza;
 *   - o item aceso nao e o do painel aberto, ou nao volta a ser o do Kadish;
 *   - a ultima linha do painel nasce escondida debaixo do menu;
 *   - alguma das 8 linguas quebra a fileira em duas linhas.
 *
 * `--provar` devolve o menu ao z-index 61 que estava no ar, POR FORA e sem
 * tocar no arquivo, e exige que a checagem fique VERMELHA. Uma checagem que so
 * sabe passar nao mede nada — e a mesma regra do vigia de 13/09, que so sabia
 * reprovar.  Isso e uma rodada A MAIS, nunca a troca do veredito.
 *
 * Uso: node checar-menu.mjs [http://127.0.0.1:8896/tefila-kadish] [--provar]
 * Sem os navegadores do Playwright baixados: CHROMIUM=/caminho/do/chrome
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const BASE = process.argv.find(a => a.startsWith('http')) || 'http://127.0.0.1:8896/tefila-kadish';
const PROVAR = process.argv.includes('--provar');
const nav = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const LINGUAS = ['pt', 'en', 'es', 'fr', 'it', 'de', 'ru', 'he'];
const ESPERADOS = ['mpRezar', 'mpPassos', 'mpPessoas', 'mpKadish', 'mpOnde', 'mpAjustes'];
/* as cinco portas e o painel que cada uma abre */
const PORTAS = [
  { id: 'mpPessoas', ov: 'settingsOverlay', nome: 'Por quem' },
  { id: 'mpAjustes', ov: 'settingsOverlay', nome: 'Ajustes' },
  { id: 'mpKadish',  ov: 'infoOverlay',     nome: 'O que e?' },
  { id: 'mpOnde',    ov: 'infoOverlay',     nome: 'Onde rezar' },
];

/* Planta o defeito POR FORA: o menu volta para debaixo dos paineis. */
async function abrir(ctx, url, plantarDefeito) {
  const p = await ctx.newPage();
  if (plantarDefeito) {
    await p.route('**/engine.html*', async rota => {
      const r = await rota.fetch();
      let html = await r.text();
      const antes = html;
      html = html.replace('bottom: 0; z-index: 320;', 'bottom: 0; z-index: 61;');
      if (html === antes) throw new Error('o --provar nao achou o z-index do menu para plantar o defeito');
      await rota.fulfill({ response: r, body: html });
    });
  }
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1600);
  /* o aviso de privacidade e o passo a passo cobrem o pe da tela: a pergunta
     aqui e sobre o menu, e quem reza ja respondeu os dois uma vez na vida */
  await p.evaluate(() => {
    try {
      localStorage.setItem('tefila_consent', '1');
      localStorage.setItem('tefila_passos_1025', '1');
    } catch (e) {}
    document.getElementById('consentBanner')?.classList.remove('show');
    document.getElementById('passosTira')?.remove();
    document.querySelector('.passos')?.remove();
  });
  await p.waitForTimeout(300);
  return p;
}

let MENU_PT = '';
const falhas = [];
const ok = (bom, oque) => {
  console.log((bom ? 'OK   ' : 'FALHA') + '  ' + oque);
  if (!bom) falhas.push(oque);
};

/* ---------- 1. os seis itens, as medidas e os rotulos ---------- */
{
  const p = await abrir(nav, `${BASE}/engine.html?lang=pt&audio=mp3`, PROVAR);
  const m = await p.evaluate(() => {
    const n = document.getElementById('menuPe');
    if (!n) return null;
    return {
      altura: Math.round(n.getBoundingClientRect().height),
      itens: [...n.children].map(c => {
        const s = c.lastElementChild, q = s.getBoundingClientRect(), b = c.getBoundingClientRect();
        return {
          id: c.id, rot: s.textContent.trim(),
          px: parseFloat(getComputedStyle(s).fontSize),
          alt: Math.round(b.height),
          linhas: Math.round(q.height / (parseFloat(getComputedStyle(s).lineHeight) || 14)),
          aceso: c.hasAttribute('aria-current'),
        };
      }),
    };
  });
  ok(!!m && m.itens.length === 6, `sao seis itens no menu: ${m ? m.itens.length : 'o menu nao existe'}`);
  if (m) {
    const ids = m.itens.map(i => i.id);
    ok(ESPERADOS.every(x => ids.includes(x)), `os seis ids esperados estao la: ${ids.join(' ')}`);
    const miudos = m.itens.filter(i => i.px < 12);
    ok(!miudos.length, `nenhum rotulo abaixo de 12px: ${miudos.map(i => i.rot + ' ' + i.px + 'px').join(', ') || 'ok (' + m.itens[0].px + 'px)'}`);
    const baixos = m.itens.filter(i => i.alt < 30);
    ok(!baixos.length, `nenhum item abaixo de 30px de altura: ${baixos.map(i => i.rot).join(', ') || 'ok (' + m.itens[0].alt + 'px)'}`);
    const vazios = m.itens.filter(i => !i.rot);
    ok(!vazios.length, `todo item tem rotulo escrito: ${vazios.length ? vazios.map(i => i.id).join(',') : 'ok'}`);
    /* dois itens nunca dizem a mesma coisa — era o defeito do nome */
    const rots = m.itens.map(i => i.rot.toLowerCase());
    const repetidos = rots.filter((r, i) => rots.indexOf(r) !== i);
    ok(!repetidos.length, `dois itens nao dizem a mesma coisa: ${repetidos.join(', ') || 'ok'}`);
    ok(m.itens.filter(i => i.aceso).length === 1 && m.itens.find(i => i.aceso).id === 'mpRezar',
      `na tela da reza o aceso e o do Kadish: ${m.itens.filter(i => i.aceso).map(i => i.id).join(',') || 'nenhum'}`);
  }
  await p.close();
}

/* ---------- 2. de dentro de cada painel, ROLADO ATE O FIM ---------- */
for (const porta of PORTAS) {
  const p = await abrir(nav, `${BASE}/engine.html?lang=pt&audio=mp3`, PROVAR);
  await p.click('#' + porta.id);
  await p.waitForTimeout(700);
  const r = await p.evaluate(({ ov }) => {
    const o = document.getElementById(ov);
    o.scrollTop = o.scrollHeight;                /* ate o fim, que e onde doia */
    const h = innerHeight, w = innerWidth;
    const quem = (x, y) => { const e = document.elementFromPoint(x, y); return e ? e.closest('.mp-item') : null; };
    const m = document.getElementById('menuPe');
    const q = m.getBoundingClientRect();
    /* o ponto do meio de cada item, que e onde o dedo cai */
    const nosPontos = [...m.children].map(c => {
      const b = c.getBoundingClientRect();
      const el = quem(Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2));
      return { id: c.id, achado: el ? el.id : 'nada' };
    });
    /* E A ULTIMA LINHA DE CONTEUDO, nunca a caixa do painel. Na primeira volta
       eu medi a caixa e ela acusou -11px nos tres paineis — mas a caixa termina
       no recheio do overlay, e o recheio de baixo do painel (que e onde mora a
       conta do --pe-menu) empurra o CONTEUDO para cima. Medir a caixa era medir
       a coisa errada, a familia de sempre deste projeto. O que o olho le e a
       ultima linha VISIVEL. */
    const painel = o.querySelector('.settings-panel, .info-panel');
    let fim = null;
    if (painel) {
      for (const f of painel.children) {
        const b = f.getBoundingClientRect();
        if (b.height === 0 || getComputedStyle(f).display === 'none') continue;
        fim = fim === null ? b.bottom : Math.max(fim, b.bottom);
      }
    }
    return {
      rolou: o.scrollTop,
      menuNaTela: q.height > 0 && q.top < h,
      nosPontos,
      aceso: [...m.children].filter(c => c.hasAttribute('aria-current')).map(c => c.id),
      fimDoPainelAcimaDoMenu: fim === null ? null : Math.round(fim) <= Math.round(q.top) + 1,
      folga: fim === null ? null : Math.round(q.top - fim),
    };
  }, { ov: porta.ov });
  const todosNoPonto = r.nosPontos.every(x => x.achado === x.id);
  ok(todosNoPonto, `"${porta.nome}" rolado ate o fim (${r.rolou}px): o menu esta no ponto do dedo${todosNoPonto ? '' : ' -> ' + JSON.stringify(r.nosPontos.filter(x => x.achado !== x.id))}`);
  ok(r.aceso.length === 1 && r.aceso[0] === porta.id,
    `"${porta.nome}": o item aceso e ele mesmo: ${r.aceso.join(',') || 'nenhum'}`);
  ok(r.fimDoPainelAcimaDoMenu === true,
    `"${porta.nome}": a ultima linha de conteudo nao fica debaixo do menu (folga ${r.folga}px)`);

  /* ---------- 3. tocar em "O Kadish" devolve a tela da reza ---------- */
  /* O TOQUE QUE NAO DA PARA DAR *E* O DEFEITO, e por isso ele e guardado em vez
     de derrubar a checagem: com o menu debaixo do painel o Playwright fica
     trinta segundos dizendo "settingsOverlay intercepts pointer events" e
     estoura — e uma checagem que morre no meio nao chega a dar veredito. */
  let tocou = true;
  try { await p.click('#mpRezar', { timeout: 4000 }); }
  catch (e) { tocou = false; }
  await p.waitForTimeout(600);
  const v = await p.evaluate(({ ov }) => {
    const o = document.getElementById(ov);
    const verso = document.querySelector('#main .verse');
    const q = verso ? verso.getBoundingClientRect() : null;
    const m = document.getElementById('menuPe');
    return {
      painelFechado: !o.classList.contains('show'),
      versoNaTela: !!(q && q.height > 0 && q.bottom > 0 && q.top < innerHeight),
      aceso: [...m.children].filter(c => c.hasAttribute('aria-current')).map(c => c.id),
    };
  }, { ov: porta.ov });
  ok(tocou && v.painelFechado && v.versoNaTela && v.aceso.length === 1 && v.aceso[0] === 'mpRezar',
    `de "${porta.nome}", tocar em "O Kadish" devolve a reza: ${JSON.stringify(Object.assign({ deu_para_tocar: tocou }, v))}`);
  await p.close();
}

/* ---------- 3b. NAO SOBRA VAO ENTRE A BARRA DO PLAY E O MENU ----------
   O Erez viu na primeira foto que eu mandei: "a parte de baixo parece mal
   desenhada e com texto estranho". Era um vao de 10px entre a barra (presa a
   um `bottom: 62px` escrito a mao) e o menu (que mede 52px), e por ele passava
   a transliteracao CORTADA AO MEIO. Nao basta perguntar se ha vao: a pergunta
   e QUEM aparece nele, porque um vao com o papel de fundo ninguem nota e um
   vao com texto picado e o que ele viu. */
for (const [rotulo, vp] of [
  ['iPhone SE em pe', { width: 375, height: 667 }],
  ['iPhone 15 em pe', { width: 393, height: 852 }],
  ['iPhone deitado',  { width: 667, height: 375 }],
  ['iPad em pe',      { width: 820, height: 1180 }],
  ['computador',      { width: 1440, height: 900 }],
]) {
  const p = await abrir(nav, `${BASE}/engine.html?lang=pt&audio=mp3`, PROVAR);
  await p.setViewportSize(vp);
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => {
    const bar = document.querySelector('.audio-bar');
    const menu = document.getElementById('menuPe');
    const rb = bar.getBoundingClientRect(), rm = menu.getBoundingClientRect();
    const temMenu = getComputedStyle(menu).display !== 'none' && rm.height > 0;
    /* sem menu (telefone deitado) o pe da tela e a propria janela */
    const vao = temMenu ? Math.round(rm.top - rb.bottom) : Math.round(innerHeight - rb.bottom);
    let noVao = '-';
    if (vao > 0) {
      const e = document.elementFromPoint(Math.round(innerWidth / 2), Math.round(rb.bottom + vao / 2));
      noVao = e ? (e.id || String(e.className).split(' ')[0] || e.tagName) : 'nada';
    }
    return { vao, menu: temMenu ? Math.round(rm.height) : 0, noVao };
  });
  ok(r.vao === 0,
    `${rotulo}: a barra do play senta no menu, sem vao (menu ${r.menu}px, vao ${r.vao}px${r.vao > 0 ? ', e nele aparece: ' + r.noVao : ''})`);
  await p.close();
}

/* ---------- 4. o menu e a UNICA saida, e o aceso segue voce ----------
   26/10 — ESTE BLOCO MUDOU DE PERGUNTA, e ficou mais exigente. Ele: "no menu
   onde rezar nao precisa sair da pagina clicando no X em cima a direita".
   Medido: havia um × em x=351 y=10 E a fileira do pe inteira respondendo ao
   dedo — duas saidas para a mesma tela. O × saiu.
   Antes aqui se cobrava "fechando pelo × o aceso volta ao Kadish". Fechar pelo
   PROPRIO item da casa faria a pergunta se responder sozinha, entao agora ela e
   outra e mede mais: ir de um destino DIRETO para outro (que e o que um menu
   existe para fazer) e cobrar que o aceso acompanhe — e so entao voltar a casa.
   E cobra que nao exista × nenhum: senao alguem repoe um e voltam as duas
   saidas. */
{
  const p = await abrir(nav, `${BASE}/engine.html?lang=pt&audio=mp3`, PROVAR);
  const semX = async (rotulo) => {
    const r = await p.evaluate(() => {
      const vis = (el) => {
        if (!el) return false;
        const b = el.getBoundingClientRect();
        return getComputedStyle(el).display !== 'none' && b.height > 0 && b.width > 0;
      };
      return [...document.querySelectorAll('.info-close, .setup-close')].filter(vis).length;
    });
    ok(r === 0, `${rotulo}: nao ha × na tela — a saida e o menu (achei ${r})`);
  };
  /* O TOQUE QUE NAO DA PARA DAR *E* O DEFEITO — a licao da v66, que eu repeti
     aqui: com o menu debaixo do painel (que e o que o --provar planta) o
     Playwright fica 30s dizendo "settingsOverlay intercepts pointer events" e
     ESTOURA, e uma checagem que morre no meio nao chega a dar veredito. */
  const tocar = async (sel, rotulo) => {
    try { await p.click(sel, { timeout: 4000 }); return true; }
    catch (e) { ok(false, `${rotulo}: nao deu para tocar em ${sel} — algo esta por cima do menu`); return false; }
  };
  await tocar('#mpAjustes', 'Ajustes'); await p.waitForTimeout(600);
  await semX('Ajustes');
  await tocar('#mpOnde', 'Onde rezar'); await p.waitForTimeout(900);
  await semX('Onde rezar');
  const meio = await p.evaluate(() => ({
    ajustesFechou: !document.getElementById('settingsOverlay').classList.contains('show'),
    infoAberto: document.getElementById('infoOverlay').classList.contains('show'),
    aceso: [...document.getElementById('menuPe').children].filter(c => c.hasAttribute('aria-current')).map(c => c.id),
  }));
  ok(meio.ajustesFechou && meio.infoAberto && meio.aceso.join() === 'mpOnde',
    `de um destino direto para outro, e o aceso acompanha: ${JSON.stringify(meio)}`);
  await tocar('#mpRezar', 'voltar ao Kadish'); await p.waitForTimeout(500);
  const fim = await p.evaluate(() => ({
    tudoFechado: !document.getElementById('settingsOverlay').classList.contains('show')
              && !document.getElementById('infoOverlay').classList.contains('show')
              && !document.getElementById('setupModal').classList.contains('show'),
    aceso: [...document.getElementById('menuPe').children].filter(c => c.hasAttribute('aria-current')).map(c => c.id),
  }));
  ok(fim.tudoFechado && fim.aceso.join() === 'mpRezar',
    `o item da casa fecha tudo e volta ao Kadish: ${JSON.stringify(fim)}`);
  await p.close();
}

/* ---------- 5. a fileira nas 8 linguas, numa linha so ---------- */
for (const lg of LINGUAS) {
  const p = await abrir(nav, `${BASE}/engine.html?lang=${lg}&audio=mp3`, PROVAR);
  const r = await p.evaluate(() => {
    const n = document.getElementById('menuPe');
    const its = [...n.children].map(c => {
      const s = c.lastElementChild, q = s.getBoundingClientRect();
      const lh = parseFloat(getComputedStyle(s).lineHeight) || 14;
      return { rot: s.textContent.trim(), linhas: Math.round(q.height / lh) };
    });
    return { altura: Math.round(n.getBoundingClientRect().height), quebrou: its.filter(i => i.linhas > 1).map(i => i.rot), rots: its.map(i => i.rot) };
  });
  /* regra 6 com dentes: fora do portugues os rotulos nao podem ser os do
     portugues — e assim que uma chave que falta cai no portugues sem nada
     acusar (o "Voz do dispositivo" de 01/09) */
  const emPortugues = lg !== 'pt' && r.rots.join('|') === MENU_PT;
  if (lg === 'pt') MENU_PT = r.rots.join('|');
  ok(!r.quebrou.length && !emPortugues,
    `${lg}: a fileira cabe numa linha (${r.altura}px)${r.quebrou.length ? ' -> QUEBRA: ' + r.quebrou.join(', ') : ''}${emPortugues ? ' -> ESTA EM PORTUGUES' : ''}`);
  await p.close();
}

await nav.close();

if (PROVAR) {
  /* o defeito plantado TEM de aparecer. Se a checagem ficar verde com o menu
     debaixo dos paineis, ela nao mede nada. */
  if (falhas.length) {
    console.log(`VERDE (prova): com o menu de volta ao z-index 61 a checagem acusa ${falhas.length} problema(s) — ela sabe reprovar`);
    process.exit(0);
  }
  console.log('FALHA (prova): o menu voltou para debaixo dos paineis e a checagem continuou verde — ela nao mede nada');
  process.exit(1);
}
console.log(falhas.length ? `${falhas.length} problema(s)` : 'VERDE: o menu fica por cima dos paineis, o caminho de volta ao Kadish esta sempre na tela e o aceso diz onde voce esta');
process.exit(falhas.length ? 1 : 0);
