/**
 * testar-data-hebraica.mjs — a data hebraica no cadastro do falecido (29/10).
 *
 * Ele: "incluir a data hebraica como opcao, quando uma das duas data preenche,
 * ja preenche a outra, mas lembrar que o yortzeit e pela data hebraica".
 *
 * O que este teste cobra, no formulario de verdade (o mesmo do "Por quem" e
 * dos Ajustes):
 *   1. digitar a data civil preenche a hebraica;
 *   2. "depois do pôr do sol" passa a hebraica para o dia seguinte;
 *   3. escolher a data hebraica preenche a civil;
 *   4. quem deu a hebraica e responde "depois do pôr do sol": a hebraica fica,
 *      a civil volta um dia;
 *   5. o ano decide os Adar: bissexto tem Adar I e II; comum, so Adar;
 *   6. salvo, o yahrzeit sai da DATA HEBRAICA guardada;
 *   7. um cadastro antigo (sem data hebraica guardada) abre com ela calculada;
 *   8. sem erro na pagina.
 *
 * Uso: node servidor-teste.mjs 8896 . &
 *      node testar-data-hebraica.mjs [http://127.0.0.1:8896/tefila-kadish]
 */
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:8896/tefila-kadish';
const navegador = await pw.chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
);
let falhas = 0;
const confere = (nome, ok, detalhe = '') => {
  console.log((ok ? 'OK    ' : 'FALHA ') + nome + (detalhe ? '  — ' + detalhe : ''));
  if (!ok) falhas++;
};

const pag = await navegador.newPage();
const erros = [];
pag.on('pageerror', e => erros.push('pageerror: ' + e.message));
await pag.goto(`${BASE}/engine.html?n=chabad&t=yatom`);
await pag.waitForFunction(() => window.Hebraico && typeof abrirCadastro === 'function');
await pag.evaluate(() => { localStorage.clear(); });
await pag.reload();
await pag.waitForFunction(() => window.Hebraico && typeof abrirCadastro === 'function');

const heb = () => pag.evaluate(() => ({
  ano: +document.getElementById('setupHebAno').value,
  mes: +document.getElementById('setupHebMes').value,
  dia: +document.getElementById('setupHebDia').value,
  civil: document.getElementById('setupDeathDate').value,
}));
const esperado = (iso, mais) => pag.evaluate(([iso, mais]) => {
  const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + mais);
  return Hebraico.deData(d);
}, [iso, mais]);
const porDoSol = v => pag.evaluate(v => document.querySelector(`#setupPorDoSol button[data-value="${v}"]`).click(), v);
const escolher = (k, v) => pag.selectOption('#setupHeb' + k, String(v));

// 1. civil -> hebraica (a data da tela dele: 27/10/2026)
await pag.evaluate(() => abrirCadastro(null));
await pag.fill('#setupDeathDate', '2026-10-27');
await pag.dispatchEvent('#setupDeathDate', 'change');
let h = await heb(), e = await esperado('2026-10-27', 0);
confere('1. a data civil preenche a hebraica', h.ano === e.ano && h.mes === e.mes && h.dia === e.dia,
  `${h.dia}/${h.mes}/${h.ano}, esperado ${e.dia}/${e.mes}/${e.ano}`);

// 2. depois do pôr do sol: o dia hebraico seguinte
await porDoSol('depois');
h = await heb(); e = await esperado('2026-10-27', 1);
confere('2. "depois do pôr do sol" passa a hebraica para o dia seguinte',
  h.ano === e.ano && h.mes === e.mes && h.dia === e.dia && h.civil === '2026-10-27',
  `${h.dia}/${h.mes}/${h.ano}, civil ${h.civil}`);

// 3. hebraica -> civil: 10 de Tevet de 5780
await pag.evaluate(() => abrirCadastro(null));
await escolher('Ano', 5780); await escolher('Mes', 10); await escolher('Dia', 10);
h = await heb();
const civilTevet = await pag.evaluate(() => {
  const d = Hebraico.paraData({ ano: 5780, mes: 10, dia: 10 });
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
});
confere('3. a data hebraica preenche a civil', h.civil === civilTevet, `civil ${h.civil}, esperado ${civilTevet}`);

// 4. ... e o pôr do sol mexe na civil, nao na hebraica que ele deu
await porDoSol('depois');
h = await heb();
const civilMenosUm = await pag.evaluate(c => {
  const d = new Date(c + 'T12:00:00'); d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}, civilTevet);
confere('4. quem deu a hebraica: "depois do pôr do sol" volta a civil um dia, a hebraica fica',
  h.ano === 5780 && h.mes === 10 && h.dia === 10 && h.civil === civilMenosUm, `${h.dia}/${h.mes}/${h.ano}, civil ${h.civil}`);

// 5. os Adar
const meses = async ano => { await escolher('Ano', ano);
  return pag.evaluate(() => [...document.querySelectorAll('#setupHebMes option')].map(o => +o.value).filter(Boolean)); };
const bissexto = await meses(5784), comum = await meses(5785);
confere('5. ano bissexto tem Adar I e Adar II; ano comum, so Adar',
  bissexto.includes(12) && bissexto.includes(13) && comum.includes(12) && !comum.includes(13),
  `5784: ${bissexto.length} meses · 5785: ${comum.length} meses`);

// 6. salvo, o yahrzeit sai da data hebraica
await pag.evaluate(() => abrirCadastro(null));
await pag.fill('#setupName', 'Teste');
await escolher('Ano', 5780); await escolher('Mes', 10); await escolher('Dia', 10);
await porDoSol('depois');
await pag.evaluate(() => document.getElementById('setupSave').click());
const salvo = await pag.evaluate(() => {
  const m = carregarMemoriais().lista.find(x => x.name === 'Teste');
  const y = Yahrzeit.proximoYahrzeit(dataDaMorte(m), 'chabad', new Date(), 'pt');
  return { hebDate: m.hebDate, fonte: m.dataFonte, y: y && y.hebraico };
});
confere('6. salvo: a data hebraica fica guardada e o yahrzeit cai em 10 de Tevet',
  salvo.hebDate && salvo.hebDate.dia === 10 && salvo.hebDate.mes === 10 && salvo.fonte === 'hebraica' &&
  salvo.y && salvo.y.mes === 10 && salvo.y.dia === 10, JSON.stringify(salvo));

// 7. cadastro antigo, sem data hebraica guardada
await pag.evaluate(() => {
  const d = carregarMemoriais();
  d.lista.push({ id: 'antigo', name: 'Antigo', deathDate: '2020-03-15', aposPorDoSol: true });
  salvarMemoriais(d);
  abrirCadastro('antigo');
});
h = await heb(); e = await esperado('2020-03-15', 1);
confere('7. cadastro antigo abre com a data hebraica calculada (com o pôr do sol)',
  h.ano === e.ano && h.mes === e.mes && h.dia === e.dia, `${h.dia}/${h.mes}/${h.ano}`);
const antigo = await pag.evaluate(() => {
  const m = carregarMemoriais().lista.find(x => x.id === 'antigo');
  const d = dataDaMorte(m); return d.toISOString().slice(0, 10);
});
confere('   e, sem salvar de novo, o yahrzeit dele segue a conta de antes', antigo === '2020-03-16', antigo);

// 9. o cartao do yahrzeit (29/10, com o rabino)
const cartao = await pag.evaluate(() => {
  const d = carregarMemoriais();
  const ler = () => ({
    alto: document.getElementById('yzDate').textContent,
    periodo: document.getElementById('yzHebrew').textContent,
    vela: document.getElementById('yzVela').textContent,
    avisos: document.getElementById('yzAvisos').textContent,
  });
  renderYahrzeit({ deathDate: '2020-03-15' });                           // sem resposta
  const duvida = ler();
  renderYahrzeit({ deathDate: '2020-03-15', porDoSol: 'antes' });        // respondeu
  const certo = ler();
  renderYahrzeit(d.lista.find(x => x.name === 'Teste'));                  // deu a hebraica
  const hebraica = ler();
  return { duvida, certo, hebraica };
});
confere('9. o cartao: a data hebraica no alto, e o periodo da noite da vespera ate o dia',
  /Tevet/.test(cartao.hebraica.alto) && /^da noite de .+, até .+\d{4}$/.test(cartao.hebraica.periodo),
  `${cartao.hebraica.alto} | ${cartao.hebraica.periodo}`);
confere('   a vela, sem hora nem lugar', /🕯/.test(cartao.hebraica.vela) && !/\d{1,2}h\d{2}/.test(cartao.hebraica.vela),
  cartao.hebraica.vela);
confere('   "não temos certeza da data hebraica" so quando o cadastro nao responde',
  /certeza da data hebraica/.test(cartao.duvida.avisos) &&
  !/certeza da data hebraica/.test(cartao.certo.avisos) && !/certeza da data hebraica/.test(cartao.hebraica.avisos));

// 10. o exemplo do nome (29/10): em portugues, pelo costume do nussach
const exemplo = async n => {
  await pag.goto(`${BASE}/engine.html?n=${n}&t=yatom`);
  await pag.waitForFunction(() => window.SYNC && SYNC.ativo && SYNC.ativo(), null, { timeout: 15000 });
  await pag.evaluate(() => abrirCadastro(null));
  return pag.getAttribute('#setupName', 'placeholder');
};
const exSef = await exemplo('sefaradi'), exCha = await exemplo('chabad');
confere('10. o exemplo do nome: Sefaradi pela mae, os outros pelo pai, em portugues',
  exSef === 'Haim filho de Esther' && exCha === 'Haim filho de Ezra', `${exSef} · ${exCha}`);

confere('8. sem erro na pagina', erros.length === 0, erros.join(' | '));
await navegador.close();
console.log(falhas ? `\nVERMELHO: ${falhas} falha(s)` : '\nVERDE: as duas datas andam juntas, e o yahrzeit sai da hebraica');
process.exit(falhas ? 1 : 0);
