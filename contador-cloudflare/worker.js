/**
 * worker.js — o programinha do Cloudflare que soma os Kadishim de todo mundo.
 *
 * E a UNICA coisa do projeto que roda fora do GitHub Pages. Existe porque o
 * GitHub Pages so entrega arquivo: nao tem onde guardar contagem.
 *
 * O QUE ELE GUARDA, e so isso:
 *   pais · nussach · tipo · lingua · dia · quantos
 *
 * O que ele NAO guarda, de proposito: endereco de IP, identificador de
 * aparelho, nome, horario exato, nada que volte a uma pessoa. Duas pessoas do
 * mesmo pais, no mesmo dia, no mesmo nussach, sao o numero 2 — e nao ha como
 * separa-las depois. Num app de Kadish isso e o que importa: a pessoa esta de
 * luto, nao e hora de ser medida.
 *
 * O pais vem do proprio Cloudflare (request.cf.country), que ja sabe de onde
 * veio o pedido. Nao precisamos perguntar nada a ninguem nem instalar rastreador.
 *
 * DOIS CAMINHOS:
 *   POST /  {nussach, tipo, lingua}  -> soma 1. Devolve 204, sem corpo.
 *   GET  /                           -> devolve os totais, para a pagina mostrar.
 *
 * Ver COMO-LIGAR.md ao lado deste arquivo para o passo a passo.
 */

// So estes valores existem. Qualquer outra coisa e descartada sem somar.
const NUSSACHIM = ['ashkenaz', 'chabad', 'sefard', 'sefaradi'];
const TIPOS = ['yatom', 'derabanan'];
const LINGUAS = ['pt', 'en', 'es', 'fr', 'it', 'de', 'ru', 'he'];

// De onde o app e servido. Pedido que venha de outro lugar nao soma.
// Se um dia o endereco do app mudar, acrescente o novo aqui.
const ORIGENS = [
  'https://erezchalom-a18y.github.io',
];

function cabecalhos(origem) {
  const permitida = ORIGENS.includes(origem) ? origem : ORIGENS[0];
  return {
    'Access-Control-Allow-Origin': permitida,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

/** Data no formato AAAA-MM-DD, em UTC. Sem hora: hora identificaria demais. */
const hoje = () => new Date().toISOString().slice(0, 10);

async function somar(env, dados, pais) {
  const { nussach, tipo, lingua } = dados || {};
  if (!NUSSACHIM.includes(nussach)) return false;
  if (!TIPOS.includes(tipo)) return false;
  if (!LINGUAS.includes(lingua)) return false;

  // ON CONFLICT: soma atomica. Duas pessoas rezando ao mesmo tempo nao se
  // atropelam — foi por isso que escolhi D1 (SQLite) e nao KV.
  await env.DB.prepare(
    `INSERT INTO contagem (pais, nussach, tipo, lingua, dia, n)
     VALUES (?, ?, ?, ?, ?, 1)
     ON CONFLICT (pais, nussach, tipo, lingua, dia)
     DO UPDATE SET n = n + 1`
  ).bind(pais || 'XX', nussach, tipo, lingua, hoje()).run();
  return true;
}

async function totais(env) {
  const soma = async (coluna) => {
    const r = await env.DB.prepare(
      `SELECT ${coluna} AS chave, SUM(n) AS n FROM contagem
       GROUP BY ${coluna} ORDER BY n DESC`
    ).all();
    return (r.results || []).map(l => [l.chave, l.n]);
  };
  const geral = await env.DB.prepare(
    'SELECT SUM(n) AS n, MIN(dia) AS desde FROM contagem'
  ).first();

  return {
    total: (geral && geral.n) || 0,
    desde: (geral && geral.desde) || null,
    porPais: await soma('pais'),
    porLingua: await soma('lingua'),
    porNussach: await soma('nussach'),
    porTipo: await soma('tipo'),
  };
}

export default {
  async fetch(pedido, env) {
    const origem = pedido.headers.get('Origin') || '';
    const cab = cabecalhos(origem);

    if (pedido.method === 'OPTIONS') return new Response(null, { status: 204, headers: cab });

    if (pedido.method === 'GET') {
      try {
        const t = await totais(env);
        return new Response(JSON.stringify(t), {
          headers: { ...cab, 'Content-Type': 'application/json; charset=utf-8',
                     'Cache-Control': 'public, max-age=60' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ erro: 'nao consegui ler os totais' }),
          { status: 500, headers: { ...cab, 'Content-Type': 'application/json' } });
      }
    }

    if (pedido.method === 'POST') {
      // pedido que nao vem do app nao soma
      if (!ORIGENS.includes(origem)) return new Response(null, { status: 204, headers: cab });
      let dados = null;
      try { dados = await pedido.json(); } catch (e) { dados = null; }
      const pais = (pedido.cf && pedido.cf.country) || 'XX';
      try { await somar(env, dados, pais); } catch (e) { /* nunca atrapalhar quem reza */ }
      // 204 sempre: nao contamos para quem envia se somou ou nao
      return new Response(null, { status: 204, headers: cab });
    }

    return new Response(null, { status: 405, headers: cab });
  },
};
