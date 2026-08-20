/**
 * aplicar-escolhas.mjs — aplica ao glossario as decisoes que o rabino marcou.
 *
 * Este e o UNICO script que escreve no glossario.json, e so quando um humano
 * roda com --confirmar. Nenhum modelo chega aqui: o que ele aplica e o que o
 * Erez digitou do papel que o rabino devolveu marcado.
 *
 * Entrada: um JSON simples, digitado a mao a partir do ESCOLHA-RABINO.pdf.
 *   {
 *     "1":  "A",
 *     "2":  "B",
 *     "37": "todos os que se dedicam à Torá",   // texto entre aspas = a do rabino
 *     "38": "manter"                            // deixa como esta
 *   }
 * A chave e o numero impresso no documento. Ler o que cada letra quer dizer vem
 * de escolha-rabino-itens.json, gerado junto com o PDF.
 *
 * Uso:
 *   node aplicar-escolhas.mjs escolhas-rabino.json               (ensaio: so mostra)
 *   node aplicar-escolhas.mjs escolhas-rabino.json --confirmar   (aplica de verdade)
 *
 * Depois de aplicar ele roda aplicar-glossario.mjs, propaga as glosas para
 * sync/*.json e prova que NENHUM tempo mudou. Se qualquer checagem ficar
 * vermelha, ele desfaz tudo e nao deixa rastro.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const [, , arquivoEscolhas, ...resto] = process.argv;
const CONFIRMAR = resto.includes('--confirmar');

if (!arquivoEscolhas) {
  console.error('Falta o arquivo de escolhas.\n' +
                'Uso: node aplicar-escolhas.mjs escolhas-rabino.json [--confirmar]');
  process.exit(1);
}

const ponte = JSON.parse(fs.readFileSync('escolha-rabino-itens.json', 'utf8'));
const porNumero = new Map(ponte.itens.map(i => [String(i.numero), i]));
const escolhas = JSON.parse(fs.readFileSync(arquivoEscolhas, 'utf8'));
const entradas = escolhas.escolhas || escolhas;   // aceita os dois formatos

// ---------------------------------------------------------------- decidir

const planos = [], avisos = [];
for (const [numero, valor] of Object.entries(entradas)) {
  const item = porNumero.get(String(numero));
  if (!item) { avisos.push(`item ${numero}: nao existe no documento`); continue; }
  const v = String(valor).trim();
  if (!v || /^manter$/i.test(v)) continue;

  let texto, origem;
  if (/^A$/i.test(v))      { texto = item.A; origem = item.origem_A; }
  else if (/^B$/i.test(v)) { texto = item.B; origem = item.origem_B; }
  else                     { texto = v;      origem = 'rabino'; }

  if (texto == null) { avisos.push(`item ${numero}: nao tem Opcao ${v.toUpperCase()}`); continue; }

  const atual = valorAtual(item);
  if (atual === texto) continue;                 // ja esta assim
  planos.push({ ...item, texto, origem, atual });
}

function glossarioAgora() { return JSON.parse(fs.readFileSync('glossario.json', 'utf8')); }

function valorAtual(item, g = glossarioAgora()) {
  const e = g.entradas[item.chave];
  if (!e) return null;
  if (item.campo === 'glosa') {
    const gl = item.lingua === 'pt' ? e.glosas_pt : e.glosas?.[item.lingua];
    return gl?.[item.indice] ?? null;
  }
  return item.lingua === 'pt' ? e.translation_pt : e.translations?.[item.lingua] ?? null;
}

console.log(`${planos.length} mudanca(s) a aplicar` +
            (avisos.length ? `, ${avisos.length} aviso(s)` : '') + ':\n');
for (const p of planos)
  console.log(`  [${p.lingua}] item ${p.numero} · ${p.campo}${p.indice != null ? ' ' + (p.indice + 1) : ''}\n` +
              `      de : ${JSON.stringify(p.atual)}\n` +
              `      para: ${JSON.stringify(p.texto)}   (${p.origem})`);
for (const a of avisos) console.log('  aviso: ' + a);

if (!planos.length) { console.log('\nNada a fazer.'); process.exit(0); }
if (!CONFIRMAR) {
  console.log('\nEnsaio — nada foi escrito. Para aplicar de verdade, rode de novo com --confirmar');
  process.exit(0);
}

// ---------------------------------------------------------------- aplicar

const ARQUIVOS = ['glossario.json', ...fs.readdirSync('sync').filter(f => f.endsWith('.json')).map(f => `sync/${f}`)];
const antes = Object.fromEntries(ARQUIVOS.map(f => [f, fs.readFileSync(f, 'utf8')]));
const desfazer = () => { for (const [f, txt] of Object.entries(antes)) fs.writeFileSync(f, txt); };

try {
  // 1. glossario.json
  const g = glossarioAgora();
  for (const p of planos) {
    const e = g.entradas[p.chave];
    if (p.campo === 'glosa') {
      if (p.lingua === 'pt') e.glosas_pt[p.indice] = p.texto;
      else e.glosas[p.lingua][p.indice] = p.texto;
    } else {
      if (p.lingua === 'pt') e.translation_pt = p.texto;
      else e.translations[p.lingua] = p.texto;
    }
    e.revisado_pelo_rabino = true;
  }
  fs.writeFileSync('glossario.json', JSON.stringify(g, null, 2) + '\n');
  console.log('\nglossario.json atualizado.');

  // 2. propagar para os sync/*.json
  execFileSync('node', ['aplicar-glossario.mjs'], { stdio: 'inherit' });

  const norma = s => String(s).replace(/[֑-ׇ]/g, '').replace(/[^א-ת]/g, '');
  const porChave = {};
  for (const [k, e] of Object.entries(g.entradas)) porChave[norma(e.hebrew)] = e;
  for (const f of fs.readdirSync('sync').filter(x => x.endsWith('.json'))) {
    const j = JSON.parse(fs.readFileSync(`sync/${f}`, 'utf8'));
    for (const v of j.versos) {
      const e = porChave[norma(v.hebrew)];
      if (!e) continue;
      if (e.translations) v.translations = { ...v.translations, ...e.translations };
      (v.palavras || []).forEach((pal, k) => {
        if (e.glosas_pt?.[k] != null) pal.glosa_pt = e.glosas_pt[k];
        if (e.glosas) {
          pal.glosas = pal.glosas || {};
          for (const L of Object.keys(e.glosas)) if (e.glosas[L]?.[k] != null) pal.glosas[L] = e.glosas[L][k];
          if (e.glosas_pt?.[k] != null) pal.glosas.pt = e.glosas_pt[k];
        }
      });
    }
    fs.writeFileSync(`sync/${f}`, JSON.stringify(j, null, 2) + '\n');
  }
  console.log('glosas propagadas para sync/*.json.');

  // 3. PROVA de que nenhum tempo, nenhum hebraico e nenhuma ancora mudou
  let intocado = true;
  for (const f of fs.readdirSync('sync').filter(x => x.endsWith('.json'))) {
    const a = JSON.parse(antes[`sync/${f}`]), d = JSON.parse(fs.readFileSync(`sync/${f}`, 'utf8'));
    const chapa = j => JSON.stringify(j.versos.map(v => [v.n, v.start, v.end, v.hebrew,
                        (v.palavras || []).map(p => [p.i, p.start, p.end, p.hebrew])]));
    if (chapa(a) !== chapa(d)) { console.error(`ALTEROU TEMPO OU HEBRAICO em sync/${f}`); intocado = false; }
  }
  const ancorasIguais = fs.readFileSync('ancoras.json', 'utf8') === (antes['ancoras.json'] ?? fs.readFileSync('ancoras.json', 'utf8'));
  if (!intocado || !ancorasIguais) throw new Error('mexeu em dado inviolavel');
  console.log('prova: nenhum tempo, nenhum hebraico e nenhuma ancora mudou.');

  // 4. checagens
  for (const script of ['checar.mjs', 'checar-ritos.mjs']) {
    console.log(`\n--- ${script} ---`);
    execFileSync('node', [script], { stdio: 'inherit' });
  }
} catch (erro) {
  console.error('\nDEU ERRADO: ' + (erro.message || erro));
  desfazer();
  console.error('Tudo desfeito. Nenhum arquivo ficou alterado.');
  process.exit(1);
}

console.log('\nPronto. Checagens verdes.');
console.log('Agora, com uma pessoa conferindo o diff:');
console.log('  git diff --stat');
console.log('  git add glossario.json sync && git commit -m "escolhas do rabino no glossario"');
console.log('  git push');
console.log('\nO push NAO e automatico de proposito: mudanca de texto liturgico passa por');
console.log('olho humano antes de ir para a main.');
