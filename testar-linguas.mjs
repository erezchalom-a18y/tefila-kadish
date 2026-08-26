/**
 * testar-linguas.mjs — abre o app em cada uma das 8 linguas e confere que a
 * tela inteira mudou de lingua.
 *
 * Existe porque o app foi crescendo em portugues: o painel "Sobre esta reza",
 * os avisos do yahrzeit e varias mensagens ficaram so em portugues, e quem
 * usava em ingles, russo ou hebraico topava com portugues no meio.
 *
 * O que confere, por lingua:
 *   - o painel Sobre carrega e nao repete o texto portugues (menos em pt);
 *   - a dedicatoria, o convite e o cartao de yahrzeit vem na lingua certa;
 *   - o .ics do calendario sai na lingua certa;
 *   - nenhuma palavra tipicamente portuguesa sobra na tela.
 *
 * Uso: node testar-linguas.mjs [http://127.0.0.1:8896/tefila-kadish]
 * Sem os navegadores do Playwright baixados: CHROMIUM=/caminho/do/chrome
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';
const LINGUAS = ['pt', 'en', 'es', 'fr', 'it', 'de', 'ru', 'he'];

// Marcas que so o portugues tem. Palavra solta nao serve de teste: "enlutado",
// "idioma" e "comunidade" tambem sao espanhol, e "memoria" tambem e italiano.
// O til em a e o (ã, õ) nao existe em nenhuma das outras sete, e as expressoes
// abaixo sao inequivocamente portuguesas.
const PORTUGUES = /[ãõ]|\b(voc[êe]s?|d[oa]s? Enlutad[oa]|dos S[áa]bios|Desde quando|Por que|Preencha|Abra o arquivo|em p[ée]\b)/i;

const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
);
let falhas = 0;

for (const lg of LINGUAS) {
  const pag = await navegador.newPage();
  const erros = [];
  pag.on('console', m => {
    if (m.type() === 'error' && !/fonts\.|ERR_CONNECTION_RESET/.test(m.text())) erros.push(m.text());
  });
  await pag.goto(`${BASE}/engine.html?n=ashkenaz&t=yatom&audio=mp3`);
  await pag.waitForTimeout(2500);

  // poe uma dedicatoria, para o cartao de yahrzeit aparecer
  await pag.evaluate(l => {
    localStorage.setItem('tefila_memorial', JSON.stringify(
      { name: 'Itzhak Cohen', hebrew: 'יצחק', relation: 'pai', deathDate: '2020-12-03' }));
    applyLanguage(l);
    renderMemorial();
  }, lg);
  await pag.waitForTimeout(600);

  const r = await pag.evaluate(() => {
    const txt = el => (el && el.textContent || '').trim();
    document.getElementById('infoOverlay').classList.add('show');
    return {
      sobre:   txt(document.getElementById('infoCorpo')),
      dedic:   txt(document.querySelector('.dedicatoria, #dedicatoria')),
      yzHeb:   txt(document.getElementById('yzHebrew')),
      yzData:  txt(document.getElementById('yzDate')),
      yzAviso: txt(document.getElementById('yzAvisos')),
      ics:     (typeof Yahrzeit !== 'undefined')
                 ? Yahrzeit.gerarICS(new Date('2020-12-03T12:00:00'), 'chabad', 'Itzhak', 1, state.lang)
                 : '',
      corpo:   document.body.innerText
    };
  });

  const problemas = [];
  if (!r.sobre || r.sobre.length < 200) problemas.push('painel Sobre vazio ou curto');
  if (!r.yzHeb) problemas.push('cartao de yahrzeit sem data hebraica');
  if (!r.yzAviso) problemas.push('cartao de yahrzeit sem avisos');
  if (!/BEGIN:VCALENDAR/.test(r.ics)) problemas.push('ics nao gerou');
  if (lg !== 'pt') {
    for (const [onde, t] of [['Sobre', r.sobre], ['dedicatoria', r.dedic],
                             ['aviso do yahrzeit', r.yzAviso], ['ics', r.ics], ['tela', r.corpo]]) {
      const m = (t || '').match(PORTUGUES);
      if (m) problemas.push(`portugues em ${onde}: ...${(t || '').slice(Math.max(0, m.index - 45), m.index + 45).replace(/\s+/g, ' ')}...`);
    }
  }
  if (erros.length) problemas.push('erro de console: ' + erros[0].slice(0, 60));

  if (problemas.length) falhas++;
  console.log(`${problemas.length ? 'FALHA' : 'OK   '} ${lg} | sobre:${r.sobre.length}c | yz:${r.yzHeb || '-'} | ${r.yzData.slice(0, 34)}` +
              (problemas.length ? '\n        ' + problemas.join('\n        ') : ''));
  await pag.close();
}

await navegador.close();
console.log(falhas ? `\n${falhas} lingua(s) com problema` : '\nVERDE: as 8 linguas passaram');
process.exit(falhas ? 1 : 0);
