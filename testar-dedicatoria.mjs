/**
 * testar-dedicatoria.mjs — a dedicatoria e o convite que a substitui quando
 * esta vazia.
 *
 * Existe porque em 01/09 o Erez pediu: "em memoria de (clique aqui para
 * incluir), bem discreto". Antes o convite era uma caixa tracejada no FIM do
 * texto: quem nunca rolou ate la nunca soube que a dedicatoria existia. Agora
 * ele ocupa a VAGA da dedicatoria, antes do primeiro verso, com o mesmo rotulo.
 *
 * Reprova quando:
 *   - o convite nao aparece com o memorial vazio, ou aparece em portugues
 *     numa das 8 linguas (rotulo de DEDICATORIA + acao de CONVITE);
 *   - ele nao esta acima do texto, na vaga do .topbar;
 *   - ele NAO acompanha a rolagem (02/09: a vaga mora no .topbar, que e sticky —
 *     "o em memoria deve descer junto com a rolagem quando o kadish rola");
 *   - ele aparece no Modo Treino, ou nao volta ao sair dele (02/09, pedido dele);
 *   - aparecem os DOIS ao mesmo tempo, ou dois de um deles (foi assim que a
 *     versao antiga podia empilhar ao trocar de lingua);
 *   - com nome preenchido o convite nao some;
 *   - apagando o nome, o convite nao volta.
 *
 * Uso: node testar-dedicatoria.mjs [http://127.0.0.1:8896/tefila-kadish]
 * Sem os navegadores do Playwright baixados: CHROMIUM=/caminho/do/chrome
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;
const BASE = process.argv.find(a => a.startsWith('http')) || 'http://127.0.0.1:8896/tefila-kadish';
// --provar devolve ao body o degrade que estava no ar ate 26/10 e EXIGE vermelho.
// Nao toca no arquivo: troca o texto na resposta do servidor, no caminho.
const PROVAR = process.argv.includes('--provar');
const DEGRADE_DE_VOLTA = `background-image:
      radial-gradient(at 20% 0%, rgba(184, 147, 92, 0.10) 0%, transparent 55%),
      radial-gradient(at 80% 100%, rgba(139, 106, 62, 0.08) 0%, transparent 55%);`;
async function plantarODegrade(p) {
  if (!PROVAR) return;
  await p.route('**/engine.html*', async (rota) => {
    const r = await rota.fetch();
    let html = await r.text();
    if (!html.includes('background-image: none;')) throw new Error('--provar: nao achei o "background-image: none" para trocar');
    html = html.replace('background-image: none;', DEGRADE_DE_VOLTA);
    await rota.fulfill({ response: r, body: html });
  });
}
const nav = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
);
const linguas = ['pt','en','es','fr','it','de','ru','he'];
let ruim = 0;
let textoPt = '';
// 02/09 — a vaga saiu do #main e passou para dentro do .topbar, que e sticky.
// Por isso a busca e no documento inteiro, e nao mais dentro do main.
const ler = (p) => p.evaluate(() => {
  const vaga = document.getElementById('dedicatoriaFixa');
  const conv = document.querySelector('.convite-dedicar');
  const ded = document.querySelector('.dedicatoria');
  const primeiro = document.querySelector('#main .verse');
  const el = conv || ded;
  const r = el ? el.getBoundingClientRect() : null;
  return {
    convites: document.querySelectorAll('.convite-dedicar').length,
    dedicatorias: document.querySelectorAll('.dedicatoria').length,
    texto: el ? el.textContent.trim().replace(/\s+/g,' ') : '',
    antesDoVerso: el && primeiro ? (el.compareDocumentPosition(primeiro) & 4) === 4 : null,
    alturaConv: conv ? Math.round(conv.getBoundingClientRect().height) : 0,
    naVagaDoTopo: !!(el && el.closest(".topbar")),
    visivel: !!(r && r.height > 0 && r.bottom > 0 && r.top < innerHeight),
  };
});
// A — sem nome: o convite aparece, nas 8, no lugar da dedicatoria
for (const lg of linguas) {
  const p = await nav.newPage({ viewport: { width: 375, height: 667 } });
  await p.goto(`${BASE}/engine.html?n=ashkenaz&t=yatom&audio=mp3&lang=${lg}`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  const r = await ler(p);
  if (lg === 'pt') textoPt = r.texto;
  // regra 6 com dentes: fora do portugues, o texto tem de ser OUTRO. Sem isto a
  // checagem passaria com o convite em portugues nas 8, que e o defeito classico
  // deste projeto (o applyI18n ignora em silencio a chave que falta).
  const emPortugues = lg !== 'pt' && r.texto === textoPt;
  const ok = r.convites === 1 && r.dedicatorias === 0 && r.antesDoVerso === true
    && r.texto.length > 6 && !emPortugues;
  if (!ok) ruim++;
  console.log((ok?'OK   ':'FALHA') + ` vazio ${lg}: ${JSON.stringify(r)}`);
  await p.close();
}
// B — com nome: some o convite e fica a dedicatoria; e trocar de lingua nao duplica
{
  const p = await nav.newPage({ viewport: { width: 375, height: 667 } });
  await p.goto(`${BASE}/engine.html?n=ashkenaz&t=yatom&audio=mp3&lang=pt`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(800);
  await p.evaluate(() => localStorage.setItem('tefila_memorial', JSON.stringify({ name: 'Moshe ben Avraham', hebrew: '', relation: 'meu pai' })));
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  let r = await ler(p);
  let ok = r.convites === 0 && r.dedicatorias === 1 && r.antesDoVerso === true && r.texto.includes('Moshe');
  if (!ok) ruim++;
  console.log((ok?'OK   ':'FALHA') + ` com nome: ${JSON.stringify(r)}`);
  // trocar de lingua tres vezes seguidas
  for (const lg of ['en','he','pt']) {
    await p.evaluate((l) => { if (typeof setLanguage === 'function') setLanguage(l); else if (typeof applyLanguage === 'function') applyLanguage(l); }, lg);
    await p.waitForTimeout(400);
  }
  r = await ler(p);
  ok = r.convites === 0 && r.dedicatorias === 1;
  if (!ok) ruim++;
  console.log((ok?'OK   ':'FALHA') + ` depois de 3 trocas de lingua: ${JSON.stringify(r)}`);
  // E apagando a pessoa, o convite volta.
  //
  // 09/09 — esta linha mudou, e para MAIS forte. Ela apagava a chave
  // 'tefila_memorial' por fora e recarregava. Isso deixou de valer quando o
  // cadastro passou a caber varias pessoas ('tefila_memoriais'), e a checagem
  // ficou vermelha — com razao: estava olhando o lugar de ontem. O conserto
  // NAO foi apontar para a chave nova; foi passar a apagar pelo CAMINHO DO APP,
  // que e o botao ✕ da lista dentro do ⚙. Assim ela prova o que interessa —
  // que quem tira a pessoa ve o convite voltar — em vez de provar que uma chave
  // de localStorage sumiu. Se amanha o armazenamento mudar de novo, esta linha
  // continua valendo.
  await p.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('tefila_memoriais') || '{"lista":[]}');
    if (d.lista.length) removerPessoa(d.lista[0].id);
  });
  await p.waitForTimeout(600);
  r = await ler(p);
  ok = r.convites === 1 && r.dedicatorias === 0;
  if (!ok) ruim++;
  console.log((ok?'OK   ':'FALHA') + ` sem nome de novo (apagando pelo ✕ do app): ${JSON.stringify(r)}`);

  // E a prova de que a checagem sabe FALHAR: com uma pessoa cadastrada de novo,
  // o convite tem de sumir outra vez. Sem isto, um bug que nunca mostrasse a
  // dedicatoria passaria verde nas duas linhas acima.
  await p.evaluate(() => saveMemorial({ name: 'Sara Levi', hebrew: '', relation: '' }));
  await p.evaluate(() => { atualizarDedicatoria(); });
  await p.waitForTimeout(400);
  r = await ler(p);
  ok = r.convites === 0 && r.dedicatorias === 1 && r.texto.includes('Sara');
  if (!ok) ruim++;
  console.log((ok?'OK   ':'FALHA') + ` e cadastrando outra pessoa o convite some: ${JSON.stringify(r)}`);
  // volta ao estado sem ninguem, que e o que as proximas etapas esperam
  await p.evaluate(() => { localStorage.removeItem('tefila_memoriais'); localStorage.removeItem('tefila_memorial'); });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);

  // C — ela FICA PARADA NO ALTO ACOMPANHANDO A LEITURA (04/09, v42).
  //
  // Esta pergunta ja mudou tres vezes, e as duas ultimas sao OPOSTAS uma da
  // outra. Vale escrever por que, senao alguem "conserta" isto de volta:
  //   ate 01/09  ela saia da tela com 400px de rolagem e nao voltava mais
  //   02/09      ele pediu que "descesse junto com a rolagem" e a v28 a pos
  //              dentro do .topbar, que e sticky
  //   04/09      medi que ali ela custava 98px e derrubava a sobra do iPhone SE
  //              para 52%, contra o piso de 60%; ele escolheu tira-la do
  //              cabecalho, e a v41 a devolveu ao fluxo do texto
  //   04/09      vendo a v41 ele disse que nao era isso: "a dedicatoria fica
  //              parada no alto acompanhando a leitura". As duas leituras de
  //              "rolar junto com o Kadish" eram opostas e eu tinha escolhido a
  //              errada sozinho.
  // Entao hoje a pergunta e: ela CONTINUA na tela depois de rolar? E o piso de
  // 60% continua de pe? O piso quem mede e o testar-telas.mjs; aqui se mede o
  // que o olho dele ve.
  r = await ler(p);
  const aoAbrir = r.visivel;
  await p.evaluate(() => window.scrollTo(0, 900));
  await p.waitForTimeout(300);
  const rolado = await ler(p);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(300);
  ok = aoAbrir && rolado.visivel && rolado.naVagaDoTopo;
  if (!ok) ruim++;
  console.log((ok?'OK   ':'FALHA') + ` fica parada no alto acompanhando a leitura: ${JSON.stringify(
    { aoAbrir, continua_apos_rolar: rolado.visivel, no_alto: rolado.naVagaDoTopo })}`);

  // E o outro lado da mesma regra, que e o que impede o piso de cair: numa tela
  // BAIXA (telefone deitado, 375px de altura) ela NAO pode grudar no cabecalho.
  // Ali o cabecalho ja come 78px e a barra de baixo 66px; 84px de dedicatoria
  // levariam a sobra para 39%. Numa tela baixa ela volta a ser a primeira linha
  // do texto — aparece ao abrir e sobe com o Kadish.
  await p.setViewportSize({ width: 667, height: 375 });
  await p.waitForTimeout(500);
  const deitado = await ler(p);
  await p.evaluate(() => window.scrollTo(0, 900));
  await p.waitForTimeout(300);
  const deitadoRolado = await ler(p);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(300);
  ok = deitado.visivel && !deitado.naVagaDoTopo && !deitadoRolado.visivel;
  if (!ok) ruim++;
  console.log((ok?'OK   ':'FALHA') + ` deitado no telefone ela nao gruda no cabecalho: ${JSON.stringify(
    { aoAbrir: deitado.visivel, no_alto: deitado.naVagaDoTopo, some_ao_rolar: !deitadoRolado.visivel })}`);
  await p.setViewportSize({ width: 375, height: 667 });
  await p.waitForTimeout(500);

  // D — e NAO aparece no Modo Treino, mas volta ao sair dele
  await p.click('#treinoToggle');
  await p.waitForTimeout(700);
  r = await ler(p);
  ok = !r.visivel;
  if (!ok) ruim++;
  console.log((ok?'OK   ':'FALHA') + ` no Modo Treino nao aparece: ${JSON.stringify({visivel:r.visivel})}`);
  await p.click('#treinoToggle')  /* 25/10: um botao so; sair do treino e toca-lo de novo */;
  await p.waitForTimeout(700);
  r = await ler(p);
  ok = r.visivel;
  if (!ok) ruim++;
  console.log((ok?'OK   ':'FALHA') + ` e volta ao sair do Modo Treino: ${JSON.stringify({visivel:r.visivel})}`);

  await p.close();
}

// ---- E — A COR DA LEITURA E UMA COR SO (26/10) ----
// A pergunta que importa: O PIXEL DA DEDICATORIA E O MESMO PIXEL DO KADISH?
// Ela nasceu de uma foto dele. O body tinha o --bg-leitura mais dois degrades
// quentes por cima; a dedicatoria pintava o --bg-leitura chapado. Mesma cor
// escrita, DUAS cores na tela: a faixa do "Em memoria de" dava rgb(237,226,207)
// e o Kadish logo abaixo dela rgb(232,220,198) — mais clara exatamente na
// emenda, que e onde o olho compara.
// A medida e no PIXEL da foto, nunca na variavel do CSS: a variavel estava
// certa o tempo todo — foi o degrade por cima dela que mentiu. E a licao da
// caixa do glifo (10/09) e do `hidden` que nao escondia (v60).
// Duas amostras tem de ficar de fora, e as duas me enganaram antes de acertar:
// a barra do play (que pinta --bg-elevated) e os 28px acima dela, onde cai a
// sombra `0 -4px 24px` da propria barra.
{
  const p = await nav.newPage({ viewport: { width: 393, height: 852 } });
  await plantarODegrade(p);
  await p.goto(`${BASE}/engine.html?n=ashkenaz&t=yatom&audio=mp3&lang=pt`, { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => {
    localStorage.setItem('tefila_consent', '1');
    localStorage.setItem('tefila_passos_1025', '1');
    localStorage.setItem('tefila_memorial', JSON.stringify({ name: 'Itzhak Avraham Cohen' }));
  });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2000);
  for (const tema of ['pergaminho', 'claro', 'escuro', 'contraste']) {
    await p.evaluate((t) => {
      document.body.classList.remove('theme-claro', 'theme-escuro', 'theme-contraste');
      if (t !== 'pergaminho') document.body.classList.add('theme-' + t);
    }, tema);
    await p.waitForTimeout(250);
    const png = (await p.screenshot({ type: 'png' })).toString('base64');
    const r = await p.evaluate(async (b64) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const x = c.getContext('2d'); x.drawImage(img, 0, 0);
      const hex = (px, py) => { const d = x.getImageData(px, py, 1, 1).data;
        return '#' + [d[0], d[1], d[2]].map(n => n.toString(16).padStart(2, '0')).join(''); };
      const ded = document.querySelector('.dedicatoria, .convite-dedicar');
      const main = document.getElementById('main');
      const versos = [...document.querySelectorAll('#main .verse')];
      if (!ded || !main || !versos.length) return { erro: 'nao achei a dedicatoria ou os versos' };
      const rd = ded.getBoundingClientRect();
      // O PONTO SO VALE SE FOR MESMO O FUNDO DA LEITURA. Escolher pontos no olho
      // me deu dois falsos: um caiu dentro da barra do play (que pinta
      // --bg-elevated) e outro nos 28px de sombra `0 -4px 24px` dela. Quem
      // responde quem esta ali e o elementFromPoint, que e o que o dedo
      // encontra — a mesma pergunta do convite de instalar (10/09) e do menu.
      const valeONome = (el) => el && (el === main || el === document.body ||
        el.classList.contains('verse') || el.closest('#main'));
      const pontos = [];
      for (const v of versos.slice(0, 6)) {
        const r = v.getBoundingClientRect();
        for (const px of [6, 196, 386]) {
          const py = Math.round(r.top - 4);          // a frestinha acima do verso
          if (py < 0 || py > innerHeight - 1) continue;
          if (!valeONome(document.elementFromPoint(px, py))) continue;
          pontos.push(hex(px, py));
        }
      }
      return {
        alto: hex(8, 30),
        dedicatoria: hex(8, Math.round(rd.top + rd.height / 2)),
        quantos: pontos.length,
        pontos,
      };
    }, png);
    if (r.erro) { ruim++; console.log('FALHA a cor da leitura em ' + tema + ': ' + r.erro); continue; }
    // uma checagem que nao conseguiu amostrar nada nao esta verde: esta cega.
    if (r.quantos < 4) { ruim++; console.log(`FALHA so ${r.quantos} ponto(s) de fundo em ${tema} — a medida nao diz nada`); continue; }
    const todos = [r.dedicatoria, ...r.pontos];
    const umaCor = todos.every(v => v === todos[0]);
    if (!umaCor) ruim++;
    console.log((umaCor ? 'OK   ' : 'FALHA') + ` a dedicatoria e o Kadish sao o mesmo pixel (${tema}): ` +
      JSON.stringify({ dedicatoria: r.dedicatoria, kadish: [...new Set(r.pontos)] }));
    // E a fronteira com os CONTROLES tem de ser VISIVEL — foi o pedido dele na
    // v68 ("em memoria de tem que estar ja no fundo mais escuro"). O tema de
    // Alto contraste fica de fora POR DECISAO escrita no CSS: ali o branco puro
    // e o ponto, e a leitura nao se tinge.
    if (tema !== 'contraste') {
      const separa = r.alto !== r.dedicatoria;
      if (!separa) ruim++;
      console.log((separa ? 'OK   ' : 'FALHA') + ` o alto e a leitura sao tons diferentes (${tema}): ` +
        JSON.stringify({ alto: r.alto, leitura: r.dedicatoria }));
    }
  }
  await p.close();
}

await nav.close();
if (PROVAR) {
  console.log(ruim
    ? `\nPROVA OK: com o degrade de volta ela acusa ${ruim} problema(s) — ela sabe reprovar`
    : '\nPROVA FALHOU: o degrade voltou e ela nao viu nada');
  process.exit(ruim ? 0 : 1);
}
console.log(ruim ? `${ruim} problema(s)` : 'VERDE: o convite ocupa a vaga da dedicatoria, ela acompanha a leitura no alto, sai do Treino, e a cor da leitura e UMA cor');
process.exit(ruim ? 1 : 0);
