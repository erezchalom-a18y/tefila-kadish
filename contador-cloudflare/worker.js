/**
 * worker.js — o programinha do Cloudflare que soma os Kadishim de todo mundo.
 *
 * E a UNICA coisa do projeto que roda fora do GitHub Pages. Existe porque o
 * GitHub Pages so entrega arquivo: nao tem onde guardar contagem.
 *
 * O QUE ELE GUARDA, e so isso:
 *   pais · nussach · tipo · lingua · dia · quantos
 *   e, numa tabela separada, pais · cidade · quantos — SEM DIA
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
 * A CIDADE (15/09) tambem vem do Cloudflare, e mora numa tabela propria SEM O
 * DIA. Nao e arrumacao, e privacidade: "cidade X, dia 15/09, 1 Kadish" e quase
 * um nome numa cidade pequena — quem sabe que alguem daquela comunidade esta de
 * luto fecha a conta sozinho. Sem o dia, a linha diz apenas "ja rezaram daqui".
 * Pelo mesmo motivo nao ha nussach nem lingua ali: cruzar tres coisas numa
 * cidade pequena volta a apontar para uma pessoa.
 *
 * Quando o Cloudflare nao souber a cidade, a linha simplesmente nao entra — e
 * isso e visivel (a lista fica vazia), nunca um erro calado.
 *
 * DOIS CAMINHOS:
 *   POST /  {nussach, tipo, lingua}  -> soma 1 (e 1 na cidade). Devolve 204.
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
  'https://kadish.app',
  'https://www.kadish.app',
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

async function somar(env, dados, pais, cidade) {
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

  // A cidade e opcional de proposito: sem ela o Kadish continua contando no
  // total e no pais. Uma linha a menos aqui nunca pode custar a contagem.
  if (cidade) {
    await env.DB.prepare(
      `INSERT INTO cidades (pais, cidade, n) VALUES (?, ?, 1)
       ON CONFLICT (pais, cidade) DO UPDATE SET n = n + 1`
    ).bind(pais || 'XX', cidade).run();
  }
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

  // As cidades saem da tabela propria. Vem so o nome e quantos — nunca o dia.
  const cid = await env.DB.prepare(
    'SELECT pais, cidade, n FROM cidades ORDER BY n DESC, cidade ASC'
  ).all();

  return {
    total: (geral && geral.n) || 0,
    desde: (geral && geral.desde) || null,
    porCidade: (cid.results || []).map(l => [l.cidade, l.pais, l.n]),
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
      // A cidade pode nao vir; quando nao vier, nao se inventa nada.
      const cidade = (pedido.cf && pedido.cf.city) || '';
      try { await somar(env, dados, pais, cidade); } catch (e) { /* nunca atrapalhar quem reza */ }
      // 204 sempre: nao contamos para quem envia se somou ou nao
      return new Response(null, { status: 204, headers: cab });
    }

    return new Response(null, { status: 405, headers: cab });
  },
};
