/**
 * testar-revisao-worker.mjs — o programinha da revisão (revisao-cloudflare/worker.js)
 * faz só o que deve, sem sair do computador: o GitHub é de mentira, aqui dentro.
 *
 *   - com a chave certa, grava revisoes/<lingua>-<dia>-<hora>.txt, com o recado intacto;
 *   - chave errada, chave de OUTRA língua, origem estranha, recado sem etiqueta,
 *     português — nada se grava.
 *
 * Uso: node testar-revisao-worker.mjs
 */
import worker from './revisao-cloudflare/worker.js';

const env = { CHAVES: JSON.stringify({ fr: 'chave-fr', ru: 'chave-ru' }), GITHUB_TOKEN: 'token-de-teste' };
const gravados = [];
globalThis.fetch = async (url, op) => {
  gravados.push({ url, corpo: JSON.parse(op.body), auth: op.headers.Authorization });
  return new Response('{}', { status: 201 });
};

const RECADO = '#kadish-revisao lang=fr\nRevisão de francês — 1 de 293\n\ntradução da palavra — יְהֵא\n   está: Que\n   deveria ser: Qu’il soit\n';
const pedir = (dados, origem = 'https://kadish.app') => worker.fetch(new Request('https://x.workers.dev/', {
  method: 'POST', headers: { Origin: origem, 'Content-Type': 'application/json' },
  body: JSON.stringify(dados) }), env);

let falhou = 0;
const confere = (nome, ok, extra = '') => {
  console.log(`${ok ? 'OK   ' : 'FALHA'} ${nome}${extra ? '  — ' + extra : ''}`);
  if (!ok) falhou++;
};

let r = await pedir({ lang: 'fr', chave: 'chave-fr', recado: RECADO });
const g = gravados[0];
const conteudo = g ? Buffer.from(g.corpo.content, 'base64').toString('utf8') : '';
confere('chave certa: grava', r.status === 200 && gravados.length === 1, `status ${r.status}`);
confere('no lugar certo', g && /\/contents\/revisoes\/fr-\d{4}-\d\d-\d\d-\d{6}\.txt$/.test(g.url), g && g.url);
confere('na main', g && g.corpo.branch === 'main');
confere('o recado chega intacto, com o hebraico', conteudo === RECADO);
confere('com o token do segredo', g && g.auth === 'Bearer token-de-teste');

const recusas = [
  ['chave errada', { lang: 'fr', chave: 'outra', recado: RECADO }],
  ['sem chave', { lang: 'fr', recado: RECADO }],
  ['a chave russa mandando francês', { lang: 'fr', chave: 'chave-ru', recado: RECADO }],
  ['recado com a etiqueta de outra língua', { lang: 'ru', chave: 'chave-ru', recado: RECADO }],
  ['português', { lang: 'pt', chave: 'chave-fr', recado: RECADO.replace('lang=fr', 'lang=pt') }],
  ['recado grande demais', { lang: 'fr', chave: 'chave-fr', recado: RECADO + 'x'.repeat(300000) }],
];
for (const [nome, dados] of recusas) {
  const antes = gravados.length;
  r = await pedir(dados);
  confere(`${nome}: recusa e não grava`, r.status >= 400 && gravados.length === antes, `status ${r.status}`);
}
{
  const antes = gravados.length;
  r = await pedir({ lang: 'fr', chave: 'chave-fr', recado: RECADO }, 'https://site-estranho.com');
  confere('origem estranha: recusa e não grava', r.status === 403 && gravados.length === antes);
}
{
  const antes = gravados.length;
  r = await worker.fetch(new Request('https://x.workers.dev/', { method: 'GET', headers: { Origin: 'https://kadish.app' } }), env);
  confere('GET não grava', r.status === 405 && gravados.length === antes);
}

console.log(falhou ? `\nVERMELHO: ${falhou} falha(s)` : '\nVERDE: o programinha da revisão só grava com a chave certa');
process.exit(falhou ? 1 : 0);
