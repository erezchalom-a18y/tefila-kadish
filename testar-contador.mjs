/**
 * testar-contador.mjs — prova o programinha do Cloudflare sem gastar nada.
 *
 * O worker.js roda no Cloudflare, sobre um banco D1 (que e SQLite). Aqui ele
 * roda no seu computador, sobre o SQLite que vem dentro do proprio Node, com
 * um adaptador que imita a interface do D1. E o mesmo SQL, o mesmo codigo — so
 * o lugar muda.
 *
 * Confere:
 *   - soma de verdade, e soma ATOMICA (100 pedidos ao mesmo tempo = 100);
 *   - o pais vem do Cloudflare e e guardado;
 *   - lixo e recusado (nussach inventado, lingua inventada, corpo torto);
 *   - pedido de fora do app nao soma;
 *   - os totais saem certos, por pais, lingua, nussach e tipo;
 *   - o banco NAO guarda IP, aparelho nem hora.
 *
 * Uso: node testar-contador.mjs
 */
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

const worker = (await import('./contador-cloudflare/worker.js')).default;
const APP = 'https://erezchalom-a18y.github.io';

/** Adaptador minimo que faz o SQLite do Node parecer o D1 do Cloudflare. */
function bancoDeMentira() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync('contador-cloudflare/schema.sql', 'utf8'));
  return {
    db,
    prepare(sql) {
      let args = [];
      const st = () => db.prepare(sql);
      const api = {
        bind(...a) { args = a; return api; },
        async run() { return { success: true, ...st().run(...args) }; },
        async all() { return { results: st().all(...args) }; },
        async first() { return st().get(...args) ?? null; },
      };
      return api;
    },
  };
}

const pedido = (metodo, corpo, { origem = APP, pais = 'BR' } = {}) => {
  const r = new Request('https://contador.exemplo/', {
    method: metodo,
    headers: origem ? { Origin: origem, 'Content-Type': 'application/json' } : {},
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  Object.defineProperty(r, 'cf', { value: { country: pais } });
  return r;
};

let falhas = 0;
const confere = (nome, condicao, detalhe = '') => {
  if (condicao) { console.log('OK    ' + nome); }
  else { falhas++; console.log('FALHA ' + nome + (detalhe ? '\n        ' + detalhe : '')); }
};

const env = { DB: bancoDeMentira() };
const kadish = (n, t, l, pais) => worker.fetch(pedido('POST', { nussach: n, tipo: t, lingua: l }, { pais }), env);
const ler = async () => (await (await worker.fetch(pedido('GET'), env)).json());

// --- soma simples
await kadish('chabad', 'yatom', 'pt', 'BR');
await kadish('chabad', 'yatom', 'pt', 'BR');
await kadish('ashkenaz', 'derabanan', 'he', 'IL');
let t = await ler();
confere('soma tres Kadishim', t.total === 3, 'deu ' + t.total);
confere('separa por pais', JSON.stringify(t.porPais) === '[["BR",2],["IL",1]]', JSON.stringify(t.porPais));
confere('separa por lingua', JSON.stringify(t.porLingua) === '[["pt",2],["he",1]]', JSON.stringify(t.porLingua));
confere('separa por nussach', JSON.stringify(t.porNussach) === '[["chabad",2],["ashkenaz",1]]', JSON.stringify(t.porNussach));
confere('separa por tipo', JSON.stringify(t.porTipo) === '[["yatom",2],["derabanan",1]]', JSON.stringify(t.porTipo));

// --- lixo nao soma
const antes = (await ler()).total;
await worker.fetch(pedido('POST', { nussach: 'inventado', tipo: 'yatom', lingua: 'pt' }), env);
await worker.fetch(pedido('POST', { nussach: 'chabad', tipo: 'qualquer', lingua: 'pt' }), env);
await worker.fetch(pedido('POST', { nussach: 'chabad', tipo: 'yatom', lingua: 'klingon' }), env);
await worker.fetch(pedido('POST', { nussach: 'chabad' }), env);
await worker.fetch(pedido('POST', 'isto nao e um objeto'), env);
await worker.fetch(pedido('POST', undefined), env);
confere('lixo nao soma', (await ler()).total === antes, 'passou de ' + antes + ' para ' + (await ler()).total);

// --- pedido de fora do app nao soma
await worker.fetch(pedido('POST', { nussach: 'chabad', tipo: 'yatom', lingua: 'pt' },
                          { origem: 'https://site-qualquer.example' }), env);
await worker.fetch(pedido('POST', { nussach: 'chabad', tipo: 'yatom', lingua: 'pt' }, { origem: '' }), env);
confere('pedido de fora do app nao soma', (await ler()).total === antes);

// --- soma atomica: 100 ao mesmo tempo
const env2 = { DB: bancoDeMentira() };
await Promise.all(Array.from({ length: 100 }, () =>
  worker.fetch(pedido('POST', { nussach: 'sefard', tipo: 'yatom', lingua: 'fr' }, { pais: 'FR' }), env2)));
const t2 = await (await worker.fetch(pedido('GET'), env2)).json();
confere('100 ao mesmo tempo dao 100', t2.total === 100, 'deu ' + t2.total);

// --- o que o banco guarda
const colunas = env.DB.db.prepare("SELECT name FROM pragma_table_info('contagem')").all().map(c => c.name);
confere('nao guarda IP, aparelho nem hora',
  !colunas.some(c => /^(ip|agente|aparelho|hora|horario|usuario|nome|sessao|user_agent)$/i.test(c)),
  'colunas: ' + colunas.join(', '));
confere('guarda so o que foi prometido',
  JSON.stringify(colunas) === '["pais","nussach","tipo","lingua","dia","n"]', colunas.join(', '));
const dias = env.DB.db.prepare('SELECT DISTINCT dia FROM contagem').all().map(l => l.dia);
confere('o dia nao tem hora', dias.every(d => /^\d{4}-\d{2}-\d{2}$/.test(d)), dias.join(', '));

// --- respostas e cabecalhos
const r204 = await kadish('chabad', 'yatom', 'pt', 'BR');
confere('POST devolve 204 sem corpo', r204.status === 204);
const rGet = await worker.fetch(pedido('GET'), env);
confere('GET libera o app a ler', rGet.headers.get('Access-Control-Allow-Origin') === APP);
const rOpt = await worker.fetch(pedido('OPTIONS'), env);
confere('OPTIONS responde 204', rOpt.status === 204);
const rPut = await worker.fetch(pedido('PUT', {}), env);
confere('metodo estranho e recusado', rPut.status === 405);

// --- banco fora do ar nao derruba nada
const quebrado = { DB: { prepare() { throw new Error('banco fora do ar'); } } };
const rQuebrado = await worker.fetch(pedido('POST', { nussach: 'chabad', tipo: 'yatom', lingua: 'pt' }), quebrado);
confere('banco fora do ar: POST ainda responde', rQuebrado.status === 204);
const gQuebrado = await worker.fetch(pedido('GET'), quebrado);
confere('banco fora do ar: GET devolve erro limpo', gQuebrado.status === 500);

// --- o SQL do passo a passo tem que ser o mesmo do schema.sql
// O Erez vai COLAR o bloco do COMO-LIGAR.md no Cloudflare. Se um dia o
// schema.sql mudar e o guia nao, ele monta a tabela errada e nada funciona —
// sem mensagem de erro nenhuma. Este guarda existe so para isso.
const semComentario = t => t.replace(/--[^\n]*/g, '').replace(/\s+/g, ' ').trim();
const guia = readFileSync('contador-cloudflare/COMO-LIGAR.md', 'utf8');
const noGuia = (guia.match(/```sql\n([\s\S]*?)```/) || [])[1] || '';
confere('o SQL do passo a passo e o mesmo do schema.sql',
  semComentario(noGuia) === semComentario(readFileSync('contador-cloudflare/schema.sql', 'utf8')),
  'o COMO-LIGAR.md e o schema.sql sairam de sincronia');

// --- o app nao envia nada enquanto o endereco estiver vazio
const js = readFileSync('contador.js', 'utf8');
const endereco = (js.match(/const ENDERECO_GERAL = '([^']*)'/) || [])[1];
console.log(endereco
  ? `      (o envio para o geral esta LIGADO: ${endereco})`
  : '      (o envio para o geral esta desligado: nada sai do aparelho)');

console.log(falhas ? `\n${falhas} problema(s)` : '\nVERDE: o contador geral passou em tudo');
process.exit(falhas ? 1 : 0);
