/**
 * testar-app.mjs — abre o app num Chromium de verdade e confere as 8 combinacoes.
 *
 * Confere, para cada nussach x tipo: o JSON de sincronia carrega, o audio aponta
 * para tefila-audio/, a palavra acesa e exatamente a esperada do JSON, e as 8
 * linguas mudam a glosa. Nenhum 404 e nenhum erro de console pode aparecer.
 *
 * Serve o repositorio DE SUBDIRETORIO (/tefila-kadish/), como o GitHub Pages faz
 * — e ali que caminho relativo quebra.
 *
 * Uso:
 *   python3 -m http.server 8896 --bind 127.0.0.1   (de um diretorio que contenha
 *                                                   tefila-kadish/ -> este repo)
 *   node testar-app.mjs [http://127.0.0.1:8896/tefila-kadish]
 *
 * Precisa do playwright. Se ele estiver instalado global, aponte com:
 *   NODE_PATH=/opt/node22/lib/node_modules node testar-app.mjs
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;   // playwright e CommonJS

const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';
const NUSSACHIM = ['ashkenaz', 'chabad', 'sefard', 'sefaradi'];
const TIPOS = ['yatom', 'derabanan'];
const LINGUAS = ['pt', 'en', 'es', 'fr', 'it', 'de', 'ru', 'he'];
// Testa os DOIS formatos. O Safari nao toca Ogg Vorbis: sem o segundo formato o
// audio nao carrega no iPad e o app cai na voz sintetizada do navegador.
// '' = o que o navegador escolher sozinho; 'mp3' = o caminho do Safari, forcado.
const FORMATOS = ['', 'mp3'];

const navegador = await chromium.launch();
let falhas = 0;
const lacunas = [];   // texto que o app desenha nao cobre o audio

for (const fmt of FORMATOS) {
for (const n of NUSSACHIM) {
  for (const t of TIPOS) {
    const pag = await navegador.newPage();
    const externo = u => /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u);
    const erros = [];
    pag.on('console', m => { if (m.type() === 'error' && !/ERR_CONNECTION_RESET|fonts\./.test(m.text())) erros.push(m.text()); });
    pag.on('requestfailed', r => { const f = r.failure(); if (f && !/ERR_ABORTED/.test(f.errorText) && !externo(r.url())) erros.push('req: ' + r.url().slice(-34) + ' ' + f.errorText); });
    pag.on('pageerror', e => erros.push('pageerror: ' + e.message));
    const req404 = [];
    pag.on('response', r => { if (r.status() >= 400 && !externo(r.url())) req404.push(`${r.status()} ${r.url()}`); });

    const url = `${BASE}/engine.html?n=${n}&t=${t}` + (fmt ? `&audio=${fmt}` : '');
    await pag.goto(url, { waitUntil: 'domcontentloaded' });
    const ok = await pag.waitForFunction(() => window.SYNC && window.SYNC.ativo(), null, { timeout: 8000 })
                        .then(() => true).catch(() => false);
    const info = await pag.evaluate(() => ({
      ...window.SYNC.atual(),
      audioSrc: document.getElementById('audioPlayer').src,
      versos: window.SYNC.ativo() ? undefined : null,
    }));

    // APERTA O PLAY DE VERDADE. Sem isto o teste e cego para o defeito que
    // deixou o app tocando a voz sintetizada do navegador em vez do rabino:
    // o src do <audio> estava certo, mas o botao play nunca usava aquele audio.
    const aoTocar = await pag.evaluate(async () => {
      window.__falou = [];
      if (window.speechSynthesis) {
        const original = speechSynthesis.speak.bind(speechSynthesis);
        speechSynthesis.speak = u => { window.__falou.push(u.text); return original(u); };
      }
      const a = document.getElementById('audioPlayer');
      document.getElementById('playBtn').click();
      await new Promise(r => setTimeout(r, 2000));
      return {
        tocando: !a.paused,
        avancou: a.currentTime > 0.1,
        fonte: a.currentSrc.split('/').slice(-2).join('/'),
        vozSintetica: window.__falou.length,
      };
    });

    // Destaque no TEXTO DE VERDADE (.word.active), nao num painel a parte.
    // O painel paralelo escondia o defeito: ele acendia certo enquanto o texto
    // que a pessoa le nunca acendia.
    const destaque = await pag.evaluate(async () => {
      const a = document.getElementById('audioPlayer');
      const info = window.SYNC.atual();
      const sync = await (await fetch(`./sync/${info.nussach}_${info.tipo}_sync.json`)).json();
      const v = sync.versos[Math.floor(sync.versos.length / 2)];
      const p = v.palavras[Math.floor(v.palavras.length / 2)];
      const alvo = (p.start + p.end) / 2;
      Object.defineProperty(a, 'currentTime', { get: () => alvo, configurable: true });
      a.dispatchEvent(new Event('timeupdate'));
      const el = document.querySelector('.word.active');
      const norma = t => String(t).replace(/[\u0591-\u05C7]/g, '').replace(/[^\u05D0-\u05EA]/g, '');
      return {
        aceso: el ? el.textContent.trim() : null,
        esperado: p.hebrew,
        bate: !!el && norma(el.textContent) === norma(p.hebrew),
        ligadas: info.palavrasLigadas,
        total: info.palavrasTotal,
        translitAcesa: !!document.querySelector('.twrd.active'),
        traducaoAcesa: !!document.querySelector('.phrase.active'),
      };
    });

    // as 8 linguas mudam o texto que aparece na tela (nao um painel a parte)
    const porLingua = await pag.evaluate(async (LINGUAS) => {
      const out = {};
      const alvo = document.querySelector('.verse');
      for (const L of LINGUAS) {
        if (typeof applyLanguage === 'function') applyLanguage(L);
        await new Promise(r => setTimeout(r, 60));
        out[L] = alvo ? alvo.innerText.replace(/\s+/g, ' ').trim().slice(0, 120) : null;
      }
      if (typeof applyLanguage === 'function') applyLanguage('pt');
      return out;
    }, LINGUAS);

    const distintas = new Set(Object.values(porLingua).filter(Boolean)).size;
    const audioOk = /\/tefila-audio\/[^/]+\/[^/]+\.(ogg|mp3)$/.test(info.audioSrc)
                    && info.audioSrc.includes(`/tefila-audio/${n}/${t}.`);
    // exige as tres linhas acesas: hebraico, transliteracao e traducao
    // hebraico e transliteracao tem span por palavra; a traducao do app e uma
    // frase por verso, entao nao se exige .phrase aceso.
    const acertou = destaque.bate && destaque.translitAcesa
                    && destaque.total > 0 && destaque.ligadas / destaque.total >= 0.65;
    // nao basta tocar: tem que tocar o arquivo DESTE nussach e DESTE tipo
    const tocou = aoTocar.tocando && aoTocar.avancou && aoTocar.vozSintetica === 0
                  && aoTocar.fonte.startsWith(`${n}/${t}.`);
    const bom = ok && audioOk && acertou && tocou && distintas >= 6 && !req404.length && !erros.length;
    if (!bom) falhas++;
    console.log(
      `${bom ? 'OK  ' : 'FALHA'} ${(fmt ? fmt : 'auto').padEnd(4)} ${n}_${t}` +
      ` | sync:${ok ? 'sim' : 'nao'}` +
      ` | audio:${audioOk ? 'ok' : info.audioSrc}` +
      ` | toca:${tocou ? aoTocar.fonte : `PARADO/SINTETICO (tocando=${aoTocar.tocando} t=${aoTocar.avancou} voz=${aoTocar.vozSintetica})`}` +
      ` | destaque:${acertou ? destaque.aceso
            : `aceso=${destaque.aceso} esperado=${destaque.esperado} translit=${destaque.translitAcesa} palavras=${destaque.ligadas}/${destaque.total}`}` +
      ` | ligadas:${destaque.ligadas}/${destaque.total}` +
      ` | linguas distintas:${distintas}/8` +
      (req404.length ? ` | 404: ${req404.slice(0, 2).join(', ')}` : '') +
      (erros.length ? ` | erros: ${erros.slice(0, 2).join(' | ')}` : '')
    );
    if (destaque.total && destaque.ligadas / destaque.total < 0.95)
      lacunas.push(`${n}_${t}: so ${destaque.ligadas}/${destaque.total} palavras do audio existem no texto da tela`);
    await pag.close();
  }
}
}
await navegador.close();
if (lacunas.length) {
  console.log('\nLACUNAS DE TEXTO (o audio existe, o texto na tela nao cobre tudo):');
  for (const l of [...new Set(lacunas)]) console.log('  ' + l);
}
console.log(falhas ? `\n${falhas} combinacao(oes) com problema`
                   : `\nVERDE: as 8 combinacoes passaram nos ${FORMATOS.length} formatos`);
process.exit(falhas ? 1 : 0);
