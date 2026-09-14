/**
 * gerar-qr.mjs — o QR do app, para imprimir e pendurar.
 * =====================================================
 *
 * Ele pediu (10/09): "gerar o qr code tanto para ios como android para baixar
 * o app". A resposta honesta e que **um QR so serve os dois**: nao ha app na
 * Apple Store nem na Play Store, e o que existe e um ENDERECO na web. Um
 * endereco e um endereco — o iPhone e o Android leem o mesmo codigo e abrem a
 * mesma pagina. Dois QRs diferentes seriam dois caminhos para o mesmo lugar, e
 * este projeto ja pagou caro por ter dois caminhos onde deveria haver um.
 *
 * O que sai daqui: qr/kadish.svg (para imprimir, nao perde nitidez em tamanho
 * nenhum) e qr/kadish.png (para mandar por mensagem).
 *
 * Correcao de erro: nivel H, o mais alto. Ele vai para um display de sinagoga —
 * papel amassa, pega poeira e reflexo, e o H aguenta ate 30% do codigo
 * estragado. Um QR bonito que nao le nao serve para nada.
 *
 *   python3 -m pip install segno   (uma vez)
 *   node gerar-qr.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';

// 11/09 — O ENDERECO E O kadish.app, comprado por ele hoje. O antigo
// (erezchalom-a18y.github.io/tefila-kadish) continua funcionando: o GitHub o
// redireciona sozinho, entao quem ja tem o link ou ja pos o icone na tela nao
// se perde. Mas o QR aponta para o NOVO, que e o que vai para a parede.
const ENDERECO = 'https://kadish.app/';

mkdirSync('qr', { recursive: true });
execFileSync('python3', ['-c', `
import segno
q = segno.make(${JSON.stringify(ENDERECO)}, error='h')
# 14/09 — O SVG SAI SEM FUNDO PROPRIO (light=None), e isso e uma conta so.
# Ele vai colado DENTRO dos nossos papeis, e quem decide a cor do papel e o
# papel. Enquanto o SVG carregava um #f4ede0 desenhado por dentro, mudar o
# fundo do cartao deixava o codigo como um quadrado mais claro no meio —
# duas contas para a mesma cor, que e o defeito que este projeto mais pagou.
q.save('qr/kadish.svg', scale=12, border=3, dark='#2a1f15', light=None)
# O PNG FICA COM FUNDO, e nao e incoerencia: ele e uma imagem solta, sem papel
# nenhum por tras. Um QR transparente solto vira codigo preto sobre fundo preto
# no primeiro visualizador de tema escuro. Cada um responde a SUA pergunta.
q.save('qr/kadish.png', scale=14, border=3, dark='#2a1f15', light='#f4ede0')
print('versao do QR:', q.version, '· correcao:', q.error)
`], { stdio: 'inherit' });

const svg = readFileSync('qr/kadish.svg', 'utf8');
if (!svg.includes('<svg')) { console.error('FALHA: o SVG saiu vazio'); process.exit(1); }

// E AGORA A PROVA QUE IMPORTA: o codigo e LIDO de volta, como uma camera faria,
// e o que sai tem de ser o endereco exato. Sem isto, um QR errado seria
// impresso, emoldurado e pendurado numa sinagoga, e o defeito so apareceria com
// alguem apontando o telefone e nao acontecendo nada. Gerar sem ler de volta e
// o mesmo que dizer "deve estar certo".
//   python3 -m pip install zxing-cpp pillow
const lido = execFileSync('python3', ['-c', `
import sys
try:
    import zxingcpp
    from PIL import Image
except ImportError:
    sys.stderr.write('FALTA O LEITOR: python3 -m pip install zxing-cpp pillow\\n')
    sys.exit(2)
r = zxingcpp.read_barcodes(Image.open('qr/kadish.png'))
print(r[0].text if r else '')
`], { encoding: 'utf8' }).trim();

if (lido !== ENDERECO) {
  console.error(`FALHA: o QR foi lido como ${JSON.stringify(lido)} e devia ser ${JSON.stringify(ENDERECO)}`);
  process.exit(1);
}
console.log('lido de volta pela camera:', lido);
console.log('qr/kadish.svg e qr/kadish.png ·', ENDERECO);
