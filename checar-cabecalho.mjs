/**
 * checar-cabecalho.mjs — O CABECALHO FECHA NO PLAY, E VOLTA QUANDO ELE PARA.
 *
 * Ele, em 25/10: "e se quando der o play fecha o menu de cima?" — e, perguntado
 * quando ele volta: "quando pausa por mais de 10 segundos ou o kadish parar
 * voltar para tela completa".
 *
 * O QUE ESTA CHECAGEM PERGUNTA, e por que cada pergunta existe:
 *
 *   1. Parado, os controles estao na tela. Sem isto, "fechou" poderia ser
 *      "nunca abriu" — e essa e a tela em que ele escolhe o Kadish.
 *   2. No play, os controles somem E a identidade/dedicatoria FICAM. Quem esta
 *      rezando precisa continuar sabendo por quem reza e qual Kadish diz.
 *   3. A identidade diz o MESMO que as fitas que ela substitui. E a pergunta de
 *      sempre deste projeto — duas contas para a mesma coisa acabam
 *      discordando —, e aqui ela e barata: o texto SAI das fitas.
 *   4. Tocar na identidade reabre. Se nao reabrisse, quem fechou ficaria sem
 *      caminho de volta no meio da reza.
 *   5. A ARMADILHA DOS 10 SEGUNDOS, e e a razao principal de este arquivo
 *      existir: o relogio e armado na PAUSA. Se ele nao for desarmado no play,
 *      quem pausa, pensa tres segundos e volta a rezar ve o cabecalho abrir
 *      sozinho no meio da reza, sete segundos depois, sem nada na tela
 *      explicando por que. Esta linha pausa 3s, toca, espera mais de 10s e
 *      exige que o cabecalho continue FECHADO.
 *   6. Pausa longa reabre, e o ↺ reabre na hora.
 *
 * As perguntas "esta na tela?" sao feitas pelo elementFromPoint, nunca pelo
 * atributo nem pela classe: foi medindo o atributo que a v59 foi ao ar com o
 * botao de idioma visivel e a checagem jurando que tinha sumido.
 *
 * SABE PASSAR E SABE FALHAR:
 *   node checar-cabecalho.mjs [base]
 *   node checar-cabecalho.mjs [base] --provar
 * O --provar acrescenta UMA RODADA: planta a versao ingenua do codigo por fora
 * (trocando o texto do engine.html no caminho, sem tocar no arquivo) e exige
 * que o cabecalho ABRA sozinho no meio da reza — isto e, que a pergunta da
 * linha 5 tenha com que reprovar. Ele nao substitui as sete linhas; elas
 * continuam tendo de ficar verdes. Uma checagem que nunca poderia reprovar nao
 * mede nada (o vigia do certificado, 13/09), e um --provar que dispensa o resto
 * da checagem e um --provar que esconde defeito.
 *
 * Uso: precisa do servidor-teste.mjs de pe (ele responde Range; o
 * `python3 -m http.server` nao, e sem Range o audio nao anda).
 * Sem os navegadores do Playwright baixados: CHROMIUM=/caminho/do/chrome
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.default || pw;

const BASE = (process.argv[2] && !process.argv[2].startsWith('--'))
  ? process.argv[2] : 'http://127.0.0.1:8896/tefila-kadish';
const PROVAR = process.argv.includes('--provar');
const ESPERA_REABRIR = 11500;   // o app reabre em 10000; a folga e do relogio

const nav = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});

const falhas = [];
const ok = (bom, oque, detalhe) => {
  console.log((bom ? 'OK   ' : 'FALHA') + '  ' + oque + (detalhe ? '\n        ' + detalhe : ''));
  if (!bom) falhas.push(oque);
};

// os controles que tem de sumir, e os dois que tem de ficar
// AS TRES PORTAS ESTAO NESTA LISTA, e e por falta delas que a primeira versao
// desta checagem deu VERDE com as tres na tela durante a reza. Eu so vi numa
// foto. A regra para isto nao voltar e a mesma de sempre: a lista do que tem de
// sumir e a lista INTEIRA, nao a dos que eu lembrei.
const CONTROLES = ['#traditionBadge', '#kadishTypeToggle', '#rezaToggle', '#treinoToggle',
                   '#settingsToggle', '#infoToggle', '#filtrosTexto',
                   '#learnStrip', '#learnOque', '#learnChabad'];
const FICAM = ['#identidadeRezando', '#mudoToggle'];

async function abrir(lg = 'pt', quebrado = false) {
  const p = await nav.newPage({ viewport: { width: 393, height: 852 } });
  if (quebrado) {
    // PLANTA A VERSAO INGENUA do "reabre depois de 10 segundos", POR FORA, sem
    // tocar no arquivo: um relogio armado na pausa que reabre o cabecalho
    // quando dispara, ponto. E assim que esse codigo sai escrito quando ninguem
    // pensou em quem pausa tres segundos e volta a rezar.
    //
    // SAO DUAS TROCAS, e isso e proposital. O app se defende em dois lugares —
    // desarma o relogio no play E pergunta de novo, na hora de disparar, se a
    // reza voltou. Tirar so o primeiro nao produz defeito nenhum (o segundo
    // segura), e foi o que aconteceu na primeira volta desta prova: o --provar
    // dizia "plantei e a checagem passou", e quem estava certo era o app. Para
    // PROVAR que a linha 5 mede algo, o defeito plantado tem de ser um defeito
    // de verdade.
    await p.route('**/engine.html*', async rota => {
      const r = await rota.fetch();
      let html = await r.text();
      const trocas = [
        ['function fecharCabecalho() {\n  cancelarReabertura();',
         'function fecharCabecalho() {\n  /* desarme retirado para a prova */'],
        ['    if (!state.isPlaying) document.body.classList.remove(\'cabecalho-fechado\');',
         '    document.body.classList.remove(\'cabecalho-fechado\');'],
      ];
      for (const [de, para] of trocas) {
        if (!html.includes(de)) {
          console.log('FALHA  --provar: nao achei no engine.html o trecho a quebrar:\n        ' + de.split('\n')[0]);
          process.exitCode = 1;
        }
        html = html.replace(de, para);
      }
      await rota.fulfill({ response: r, body: html });
    });
  }
  await p.goto(`${BASE}/engine.html?n=chabad&t=yatom&audio=mp3&lang=${lg}`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.SYNC && window.SYNC.ativo(), null, { timeout: 10000 });
  await p.waitForTimeout(700);
  return p;
}

// "esta na tela?" pelo ponto, que e o que o dedo encontra
const naTela = (p, sels) => p.evaluate((ss) => {
  const r = {};
  for (const s of ss) {
    const e = document.querySelector(s);
    if (!e) { r[s] = null; continue; }
    const b = e.getBoundingClientRect();
    if (b.width < 1 || b.height < 1) { r[s] = false; continue; }
    const topo = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    r[s] = !!(topo && (topo === e || e.contains(topo) || topo.contains(e)));
  }
  return r;
}, sels);

const fechado = (p) => p.evaluate(() => document.body.classList.contains('cabecalho-fechado'));
// "esta tocando?" pelo `state` NU, nunca por `window.state`. Um `const` no topo
// de um <script> classico entra no escopo lexical global — da para ler o nome,
// e NAO aparece como propriedade do window. Na primeira volta desta checagem eu
// perguntei `window.state` e ela acusou duas falhas que nao existiam: o app
// estava tocando e fechando o cabecalho direito. Mesma familia de erro de
// sempre aqui — a medida estava errada, nao o app.
const tocando = (p) => p.evaluate(() => { try { return !!state.isPlaying; } catch (e) { return null; } });

// ====================================================== 1. parado, esta aberto
{
  const p = await abrir();
  const antes = await naTela(p, [...CONTROLES, ...FICAM]);
  const faltando = CONTROLES.filter(s => antes[s] !== true);
  ok(faltando.length === 0 && !(await fechado(p)),
    'parado, os controles do alto estao na tela',
    faltando.length ? 'fora da tela: ' + faltando.join(' ') : '');

  // =================================================== 2. no play, os controles somem
  await p.click('#playBtn');
  await p.waitForTimeout(1200);
  const estaTocando = await tocando(p);
  const depois = await naTela(p, [...CONTROLES, ...FICAM]);
  const sobrou = CONTROLES.filter(s => depois[s] === true);
  ok(estaTocando && await fechado(p) && sobrou.length === 0,
    'no play o cabecalho fecha e os controles saem da tela',
    !estaTocando ? 'o audio nao comecou a tocar'
      : sobrou.length ? 'ficaram na tela: ' + sobrou.join(' ') : '');

  const ficaram = FICAM.filter(s => depois[s] !== true);
  const temDedicatoria = await p.evaluate(() => {
    const d = document.getElementById('dedicatoriaFixa');
    return !!(d && getComputedStyle(d).display !== 'none' && d.textContent.trim());
  });
  ok(ficaram.length === 0 && temDedicatoria,
    'e a identidade, o mudo e a dedicatoria FICAM',
    ficaram.length ? 'sairam: ' + ficaram.join(' ')
      : !temDedicatoria ? 'a dedicatoria/convite saiu da tela' : '');

  // ============================ 3. a identidade diz o mesmo que as fitas
  const mesmo = await p.evaluate(() => {
    const id = (document.getElementById('irTexto') || {}).textContent || '';
    const trad = (document.querySelector('.trad-switch .modo-op.active') || {}).textContent || '';
    const tit = (document.querySelector('.prayer-title') || {}).textContent || '';
    return { id: id.trim(), trad: trad.trim(), tit: tit.trim() };
  });
  const diz = mesmo.id.includes(mesmo.trad) && mesmo.id.includes(mesmo.tit);
  ok(diz && mesmo.trad && mesmo.tit,
    'a identidade fechada diz o mesmo que as fitas que ela substitui',
    diz ? mesmo.id : `identidade "${mesmo.id}" · tradicao "${mesmo.trad}" · titulo "${mesmo.tit}"`);

  // ========================================= 4. tocar na identidade reabre
  await p.click('#identidadeRezando');
  await p.waitForTimeout(300);
  const reaberto = await naTela(p, CONTROLES);
  const faltou = CONTROLES.filter(s => reaberto[s] !== true);
  ok(!(await fechado(p)) && faltou.length === 0 && await tocando(p),
    'tocar na identidade reabre o cabecalho, e a reza continua',
    faltou.length ? 'nao voltaram: ' + faltou.join(' ') : '');
  await p.close();
}

// ============== 5. A ARMADILHA: pausa curta + play nao pode reabrir sozinho
{
  const p = await abrir();
  await p.click('#playBtn');
  await p.waitForTimeout(1200);
  await p.click('#playBtn');                       // pausa
  await p.waitForTimeout(3000);                    // ele pensa tres segundos
  const aindaFechado = await fechado(p);
  await p.click('#playBtn');                       // e volta a rezar
  await p.waitForTimeout(800);
  await p.waitForTimeout(ESPERA_REABRIR);          // passam os 10 segundos
  const continuaFechado = await fechado(p);
  const continuaTocando = await tocando(p);
  ok(aindaFechado && continuaFechado,
    'pausa de 3s e volta a rezar: o cabecalho NAO abre sozinho depois dos 10s',
    `fechado na pausa curta: ${aindaFechado} · fechado 11s depois do play: ${continuaFechado} · tocando: ${continuaTocando}`);
  await p.close();
}

// ============================= 6. pausa longa reabre; o ↺ reabre na hora
{
  const p = await abrir();
  await p.click('#playBtn');
  await p.waitForTimeout(1200);
  await p.click('#playBtn');                       // pausa, e fica parado
  await p.waitForTimeout(ESPERA_REABRIR);
  const abriu = !(await fechado(p));
  const voltaram = await naTela(p, CONTROLES);
  const faltou = CONTROLES.filter(s => voltaram[s] !== true);
  ok(abriu && faltou.length === 0,
    'pausa de mais de 10 segundos: o cabecalho volta inteiro',
    faltou.length ? 'nao voltaram: ' + faltou.join(' ') : '');

  await p.click('#playBtn');
  await p.waitForTimeout(1000);
  const fechouDeNovo = await fechado(p);
  await p.click('#restartBtn');                    // o ↺: a reza parou
  await p.waitForTimeout(400);
  ok(fechouDeNovo && !(await fechado(p)),
    'o ↺ para a reza e o cabecalho volta na hora, sem esperar os 10s',
    `fechou no play: ${fechouDeNovo}`);
  await p.close();
}

// ============== 7. a identidade nas 8 linguas, e nenhuma em portugues
{
  const linguas = ['pt', 'en', 'es', 'fr', 'it', 'de', 'ru', 'he'];
  const textos = {};
  for (const lg of linguas) {
    const p = await abrir(lg);
    await p.click('#playBtn');
    await p.waitForTimeout(900);
    textos[lg] = await p.evaluate(() => ((document.getElementById('irTexto') || {}).textContent || '').trim());
    await p.close();
  }
  const vazias = linguas.filter(lg => !textos[lg]);
  // Fora do portugues o texto TEM de ser diferente do portugues — e o defeito
  // classico daqui: a chave que falta nao da erro, cai no portugues e ninguem
  // ve. A identidade nao traz texto novo (sai da fita e do .prayer-title, que
  // ja estao nas 8), e e exatamente por isso que isto tem de ser cobrado: se um
  // dia alguem a escrever a mao, esta linha pega.
  const emPortugues = linguas.filter(lg => lg !== 'pt' && textos[lg] === textos.pt);
  ok(vazias.length === 0 && emPortugues.length === 0,
    'a identidade fechada aparece nas 8 linguas, e nenhuma cai no portugues',
    vazias.length ? 'vazia em: ' + vazias.join(' ')
      : emPortugues.length ? 'em portugues: ' + emPortugues.join(' ')
      : linguas.map(lg => `${lg}=${textos[lg]}`).join(' | '));
}

// ===================== 8. a prova: ela sabe REPROVAR? (--provar)
// E uma rodada A MAIS, nunca a troca do veredito: com o --provar as sete linhas
// acima continuam tendo de ficar verdes, e esta oitava exige que a mesma
// pergunta fique VERMELHA contra a versao ingenua do codigo. Trocar o veredito
// seria deixar de medir o app para medir so a prova — e um --provar que
// dispensa as outras linhas e um --provar que esconde defeito.
if (PROVAR) {
  const p = await abrir('pt', true);   // com o defeito plantado
  await p.click('#playBtn');
  await p.waitForTimeout(1200);
  await p.click('#playBtn');                       // pausa
  await p.waitForTimeout(3000);                    // ele pensa tres segundos
  await p.click('#playBtn');                       // e volta a rezar
  await p.waitForTimeout(800);
  await p.waitForTimeout(ESPERA_REABRIR);
  const abriuSozinho = !(await fechado(p));
  const aindaTocando = await tocando(p);
  await p.close();
  ok(abriuSozinho && aindaTocando,
    '--provar: com o defeito plantado, o cabecalho ABRE sozinho no meio da reza (e a linha 5 o pegaria)',
    abriuSozinho ? '' : 'o defeito plantado nao produziu defeito: esta prova nao mede nada');
}

await nav.close();

console.log(falhas.length
  ? `\n${falhas.length} problema(s)`
  : '\nVERDE: o cabecalho fecha no play, volta quando ele para, e nao abre sozinho no meio da reza.');
process.exit(falhas.length ? 1 : 0);
