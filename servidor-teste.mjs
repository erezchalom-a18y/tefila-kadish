/**
 * servidor-teste.mjs — servidor estatico para os testes, COM suporte a Range.
 *
 * Por que existe: o `python3 -m http.server` nao responde a pedidos Range. Sem
 * isso o navegador nao consegue mover o audio para um ponto qualquer — todo
 * seek cai no zero. Os testes de Modo Treino e repeticao rodaram assim por um
 * tempo e davam verde medindo uma ficcao: a repeticao "funcionava" porque o
 * audio voltava para o comeco de qualquer jeito.
 *
 * O GitHub Pages responde Range. Entao o teste tem que responder tambem, senao
 * nao esta testando o app que as pessoas usam.
 *
 * Uso:
 *   node servidor-teste.mjs [porta] [pasta]
 * Serve a pasta DE DENTRO de /tefila-kadish/, como o GitHub Pages faz.
 */
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const PORTA = Number(process.argv[2] || 8896);
const RAIZ = process.argv[3] || process.cwd();
const PREFIXO = '/tefila-kadish';

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4',
  '.pdf': 'application/pdf', '.md': 'text/markdown; charset=utf-8',
};

createServer((pedido, resposta) => {
  let caminho = decodeURIComponent(pedido.url.split('?')[0]);
  if (caminho.startsWith(PREFIXO)) caminho = caminho.slice(PREFIXO.length);
  if (caminho.endsWith('/')) caminho += 'index.html';
  const arquivo = join(RAIZ, normalize(caminho).replace(/^(\.\.[/\\])+/, ''));

  let info;
  try { info = statSync(arquivo); if (info.isDirectory()) throw new Error('dir'); }
  catch { resposta.writeHead(404).end('nao achei'); return; }

  const tipo = TIPOS[extname(arquivo).toLowerCase()] || 'application/octet-stream';
  const faixa = pedido.headers.range;

  if (faixa) {
    const m = /bytes=(\d*)-(\d*)/.exec(faixa);
    let inicio = m && m[1] ? Number(m[1]) : 0;
    let fim = m && m[2] ? Number(m[2]) : info.size - 1;
    if (inicio >= info.size) {
      resposta.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end();
      return;
    }
    fim = Math.min(fim, info.size - 1);
    resposta.writeHead(206, {
      'Content-Type': tipo,
      'Content-Range': `bytes ${inicio}-${fim}/${info.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': fim - inicio + 1,
      'Cache-Control': 'no-store',
    });
    createReadStream(arquivo, { start: inicio, end: fim }).pipe(resposta);
    return;
  }

  resposta.writeHead(200, {
    'Content-Type': tipo, 'Content-Length': info.size,
    'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store',
  });
  createReadStream(arquivo).pipe(resposta);
}).listen(PORTA, '127.0.0.1', () => {
  console.log(`servindo ${RAIZ} em http://127.0.0.1:${PORTA}${PREFIXO}/ (com Range)`);
});
