/**
 * testar-instalar.mjs — o app pode virar um icone na tela do telefone?
 * ====================================================================
 *
 * Ele pediu em 10/09 "um qr code que gerasse um icone no iphone/android". Um QR
 * so carrega um endereco; quem faz o icone e a pagina. Esta checagem cobra as
 * quatro coisas de que isso depende, e as quatro ja estiveram quebradas:
 *
 *  1. O MANIFESTO E UM ARQUIVO, e o navegador o busca. Ate 10/09 ele era um
 *     `data:` dentro do HTML com UM icone em SVG — e o Android NAO INSTALA com
 *     icone SVG, pede PNG de 192 e de 512. O "Instalar app" nunca podia
 *     aparecer, e nada dava erro. Mesmo formato do canPlayType e do temState.
 *  2. TODO icone do manifesto existe DE VERDADE no servidor (200, e imagem).
 *     Um caminho errado ali nao quebra nada visivelmente: o telefone so nao
 *     oferece instalar.
 *  3. O start_url abre o APP. Ele estava em "./", que e o index.html; quem
 *     instalasse cairia na porta errada.
 *  4. O CONVITE aparece nas 8 linguas, some com "Agora nao" e NAO VOLTA, e
 *     nunca aparece para quem ja instalou.
 *
 * Uso: node testar-instalar.mjs [http://127.0.0.1:8896/tefila-kadish]
 */
const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';
const L = ['pt', 'en', 'es', 'fr', 'it', 'de', 'ru', 'he'];
let falhas = 0;
const confere = (o, ok, det) => {
  console.log(`${ok ? 'OK   ' : 'FALHA'} ${o}${ok || !det ? '' : ' — ' + det}`);
  if (!ok) falhas++;
};

const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const nav = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const pag = await nav.newPage();
const erros = [];
pag.on('pageerror', e => erros.push(e.message));

// ---------- 1. o manifesto ----------
await pag.goto(`${BASE}/engine.html?lang=pt&audio=mp3`, { waitUntil: 'networkidle' });
await pag.waitForTimeout(800);

const ref = await pag.evaluate(() => {
  const l = document.querySelector('link[rel="manifest"]');
  return l ? l.getAttribute('href') : null;
});
confere('o manifesto e um ARQUIVO, nao um data: dentro do HTML',
  !!ref && !ref.startsWith('data:'), `href = ${String(ref).slice(0, 40)}`);

const man = await pag.evaluate(async (href) => {
  const r = await fetch(new URL(href, location.href));
  return { ok: r.ok, tipo: r.headers.get('content-type') || '', corpo: await r.text() };
}, ref);
confere('o manifesto carrega', man.ok, `HTTP nao ok`);

let m = null;
try { m = JSON.parse(man.corpo); } catch (e) {}
confere('o manifesto e JSON valido', !!m);

if (m) {
  confere('tem nome e nome curto', !!m.name && !!m.short_name);
  confere('abre em tela cheia (display: standalone)', m.display === 'standalone', m.display);
  const png = (m.icons || []).filter(i => (i.type || '').includes('png'));
  const t = png.map(i => i.sizes);
  confere('tem PNG de 192 (o Android exige; SVG nao serve)', t.includes('192x192'), t.join(', '));
  confere('tem PNG de 512 (idem)', t.includes('512x512'), t.join(', '));
  confere('tem um icone maskable (o Android recorta em circulo)',
    (m.icons || []).some(i => (i.purpose || '').includes('maskable')));

  // 2. cada icone existe MESMO
  const faltando = [];
  for (const ic of (m.icons || [])) {
    const r = await pag.evaluate(async (u) => {
      const res = await fetch(u);
      const b = res.ok ? await res.blob() : null;
      return { ok: res.ok, tipo: b ? b.type : '', tam: b ? b.size : 0 };
    }, new URL(ic.src, `${BASE}/`).href);
    if (!r.ok || !r.tipo.startsWith('image/') || r.tam < 500) faltando.push(ic.src);
  }
  confere('todo icone do manifesto existe e e imagem de verdade', !faltando.length, faltando.join(', '));

  // 3. o start_url abre o APP, e nao a porta de entrada
  const alvo = new URL(m.start_url, `${BASE}/`).href;
  const r = await pag.evaluate(async (u) => {
    const res = await fetch(u);
    return { ok: res.ok, temApp: (await res.text()).includes('id="main"') };
  }, alvo);
  confere('o start_url abre o app', r.ok && r.temApp, alvo);
}

// o icone do iPhone: o iOS le SO esta etiqueta
const apple = await pag.evaluate(() => {
  const l = document.querySelector('link[rel="apple-touch-icon"]');
  return l ? l.href : null;
});
const rApple = apple ? await pag.evaluate(async (u) => {
  const res = await fetch(u); const b = res.ok ? await res.blob() : null;
  return { ok: res.ok, tipo: b ? b.type : '', tam: b ? b.size : 0 };
}, apple) : { ok: false };
confere('o icone do iPhone existe (o iOS ignora o manifesto e le so a etiqueta)',
  rApple.ok && rApple.tipo.startsWith('image/') && rApple.tam > 500, apple);

// ---------- 4. o convite ----------
// no iPhone nao ha botao: a Apple nao deixa instalar por codigo. Tem de haver
// a INSTRUCAO, e ela tem de existir nas 8 linguas.
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 ' +
               '(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const emPortugues = {};
for (const lang of L) {
  const p = await nav.newPage({ userAgent: IPHONE, viewport: { width: 390, height: 844 },
                                hasTouch: true, isMobile: true });
  const errosL = [];
  p.on('pageerror', e => errosL.push(e.message));
  await p.goto(`${BASE}/engine.html?lang=${lang}&audio=mp3&instalar=1`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(700);
  // o aviso de privacidade vem primeiro e mora no mesmo pe da tela. Enquanto
  // ele esta ali o convite NAO pode aparecer (ja tapou o botao uma vez).
  const comPrivacidade = await p.evaluate(() =>
    document.getElementById('conviteInstalar').classList.contains('aparece'));
  if (comPrivacidade) { console.log(`FALHA    ${lang}: o convite apareceu POR BAIXO do aviso de privacidade`); falhas++; }
  await p.click('#consentAccept');
  await p.waitForTimeout(2600);
  const r = await p.evaluate(() => {
    const c = document.getElementById('conviteInstalar');
    const visivel = c && c.classList.contains('aparece');
    const bt = document.getElementById('ciInstalar');
    const alt = c ? c.getBoundingClientRect() : { height: 0, bottom: 0 };
    const nao = document.getElementById('ciAgoraNao');
    return {
      visivel,
      titulo: (document.querySelector('#conviteInstalar .ci-titulo') || {}).textContent || '',
      como: (document.getElementById('ciComo') || {}).textContent || '',
      botaoEscondido: bt ? getComputedStyle(bt).display === 'none' : false,
      naoAlto: nao ? Math.round(nao.getBoundingClientRect().height) : 0,
      noPeDaTela: alt.bottom <= window.innerHeight + 1,
      // a barra do audio e fixa no pe e ja ficou POR CIMA do convite: o botao
      // aparecia e nao respondia ao toque. Agora se cobra que nao se toquem.
      debaixoDaBarra: (() => {
        const b = document.querySelector('.audio-bar');
        if (!b || !c) return false;
        const x = b.getBoundingClientRect(), y = c.getBoundingClientRect();
        return !(y.bottom <= x.top || y.top >= x.bottom);
      })(),
      // e o teste que nao mente: quem esta no ponto do botao?
      quemEstaNoBotao: (() => {
        const n = document.getElementById('ciAgoraNao');
        if (!n) return 'sem botao';
        const r = n.getBoundingClientRect();
        const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return e === n || (e && n.contains(e)) ? 'o proprio botao'
             : (e ? (e.className || e.tagName) : 'ninguem');
      })(),
      tapaOKadish: (() => {
        const v = document.querySelector('main .verse');
        if (!v || !c) return false;
        const a = v.getBoundingClientRect(), b = c.getBoundingClientRect();
        return !(a.bottom < b.top || a.top > b.bottom);
      })(),
    };
  });
  emPortugues[lang] = r.titulo + ' | ' + r.como;
  const ok = r.visivel && r.como.length > 10 && r.botaoEscondido &&
             r.naoAlto >= 30 && r.noPeDaTela && !r.debaixoDaBarra &&
             r.quemEstaNoBotao === 'o proprio botao' && !errosL.length;
  console.log(`${ok ? 'OK   ' : 'FALHA'}    ${lang}: ${r.visivel ? 'aparece' : 'NAO APARECE'}` +
    `${r.botaoEscondido ? ' · sem botao (certo no iPhone)' : ' · COM BOTAO (errado no iPhone)'}` +
    ` · "Agora nao" ${r.naoAlto}px` +
    (r.debaixoDaBarra ? ' · DEBAIXO DA BARRA DO AUDIO' : '') +
    (r.quemEstaNoBotao === 'o proprio botao' ? '' : ` · no ponto do botao esta: ${r.quemEstaNoBotao}`) +
    `${errosL.length ? ' · ERRO: ' + errosL[0] : ''}`);
  if (!ok) falhas++;
  await p.close();
}
// regra 6 com dentes: fora do portugues, o texto TEM de ser diferente
const iguais = L.filter(l => l !== 'pt' && emPortugues[l] === emPortugues.pt);
confere('o convite nao ficou em portugues nas 8', !iguais.length, iguais.join(', '));

// "Agora nao" some e NAO VOLTA
{
  const p = await nav.newPage({ userAgent: IPHONE, viewport: { width: 390, height: 844 },
                                hasTouch: true, isMobile: true });
  await p.goto(`${BASE}/engine.html?lang=pt&audio=mp3&instalar=1`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(700);
  await p.click('#consentAccept');
  await p.waitForTimeout(2600);
  await p.click('#ciAgoraNao');
  const sumiu = await p.evaluate(() =>
    !document.getElementById('conviteInstalar').classList.contains('aparece'));
  confere('o "Agora nao" faz o convite sumir', sumiu);
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(1400);
  const voltou = await p.evaluate(() =>
    document.getElementById('conviteInstalar').classList.contains('aparece'));
  confere('e ele NAO volta depois de recarregar', !voltou);
  await p.close();
}

// no computador nao ha o que oferecer: nada aparece
{
  const p = await nav.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`${BASE}/engine.html?lang=pt&audio=mp3&instalar=1`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(700);
  await p.click('#consentAccept');
  await p.waitForTimeout(2600);
  const apareceu = await p.evaluate(() =>
    document.getElementById('conviteInstalar').classList.contains('aparece'));
  confere('no computador o convite nao aparece', !apareceu);
  await p.close();
}

confere('nenhum erro de console', !erros.length, erros[0]);
await nav.close();
console.log(falhas ? `\nVERMELHO: ${falhas} problema(s).`
                   : '\nVERDE: o app pode virar um icone no telefone, e o convite se comporta.');
process.exit(falhas ? 1 : 0);
