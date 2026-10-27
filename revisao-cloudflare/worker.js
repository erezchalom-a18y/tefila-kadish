/**
 * worker.js — o programinha do Cloudflare que recebe a revisão dos rabinos.
 *
 * 27/10. O Erez: "quero que ele possa alterar". O revisar.html só sabe LER: o
 * GitHub Pages entrega arquivo, não tem onde gravar. Este programinha é a ponte:
 * recebe o recado que o rabino montou e o guarda em revisoes/ no repositório.
 * Quem aplica é o GitHub Actions (.github/workflows/revisao-aplicar.yml), com o
 * aplicar-revisao.mjs e todas as provas dele. ESTE PROGRAMA NÃO MEXE EM TEXTO
 * NENHUM — só guarda o recado, exatamente como veio.
 *
 * UM CAMINHO:
 *   POST /  {lang, chave, recado}  -> grava revisoes/<lang>-<dia>-<hora>.txt
 *
 * A CHAVE. Cada língua tem a sua, guardada no segredo CHAVES do Cloudflare
 * (um JSON {"en": "...", "fr": "..."}), e vai no link do rabino como &k=. Sem a
 * chave certa, nada se grava. A chave de uma língua só serve para ela: quem tem
 * o link francês não consegue mandar um recado russo.
 *
 * O português NÃO passa por aqui: o Erez aplica os dele a mão, e os recados pt
 * têm a regra das letras (-a, -b…) que um nome com hora quebraria.
 *
 * Ver COMO-LIGAR.md ao lado deste arquivo para o passo a passo.
 */

const LINGUAS = ['en', 'es', 'fr', 'it', 'de', 'ru'];
const REPO = 'erezchalom-a18y/tefila-kadish';
const LIMITE = 200000;   // um recado das 297 entradas inteiras tem ~60 KB

// De onde o revisar.html é servido. Pedido de outro lugar não grava.
const ORIGENS = [
  'https://kadish.app',
  'https://www.kadish.app',
  'https://erezchalom-a18y.github.io',
  'https://tefila.vercel.app',
];

function cabecalhos(origem) {
  return {
    'Access-Control-Allow-Origin': ORIGENS.includes(origem) ? origem : ORIGENS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

const resposta = (status, texto, cab) =>
  new Response(texto, { status, headers: { ...cab, 'Content-Type': 'text/plain; charset=utf-8' } });

/** Compara sem atalho, para o tempo da resposta não ensinar a chave letra a letra. */
function iguais(a, b) {
  a = String(a || ''); b = String(b || '');
  let dif = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++)
    dif |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return dif === 0 && a.length > 0;
}

/** Base64 de texto UTF-8 (o hebraico do recado não cabe no btoa direto). */
function base64(texto) {
  const bytes = new TextEncoder().encode(texto);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000)
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export default {
  async fetch(request, env) {
    const origem = request.headers.get('Origin') || '';
    const cab = cabecalhos(origem);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cab });
    if (request.method !== 'POST') return resposta(405, 'só POST', cab);
    if (!ORIGENS.includes(origem)) return resposta(403, 'origem não permitida', cab);

    let dados;
    try { dados = await request.json(); } catch (e) { return resposta(400, 'pedido ilegível', cab); }
    const { lang, chave, recado } = dados || {};
    if (!LINGUAS.includes(lang)) return resposta(400, 'língua não aceita', cab);

    let chaves = {};
    try { chaves = JSON.parse(env.CHAVES || '{}'); } catch (e) { /* segredo mal escrito: ninguém passa */ }
    if (!iguais(chave, chaves[lang])) return resposta(403, 'chave errada', cab);

    if (typeof recado !== 'string' || recado.length > LIMITE) return resposta(400, 'recado grande demais', cab);
    // A etiqueta tem de ser a da chave: é por ela que o aplicador sabe a língua.
    if (!recado.startsWith(`#kadish-revisao lang=${lang}\n`)) return resposta(400, 'recado sem a etiqueta da língua', cab);

    // Nome com dia e hora (UTC): dois envios no mesmo dia não se atropelam, e a
    // ordem alfabética é a ordem em que chegaram.
    const agora = new Date().toISOString();
    const dia = agora.slice(0, 10), hora = agora.slice(11, 19).replace(/:/g, '');
    const caminho = `revisoes/${lang}-${dia}-${hora}.txt`;

    const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${caminho}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'kadish-revisao',
      },
      body: JSON.stringify({
        message: `Revisão de ${lang} enviada pelo revisor (${dia})`,
        content: base64(recado),
        branch: 'main',
      }),
    });
    if (!r.ok) return resposta(502, `o GitHub recusou (${r.status})`, cab);
    return resposta(200, caminho, cab);
  },
};
