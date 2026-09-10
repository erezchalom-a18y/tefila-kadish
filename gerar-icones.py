#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gerar-icones.py — o icone do app, para quando ele vira um icone no telefone.
===========================================================================

Ele pediu (10/09): "queria um qr code que gerasse um icone no iphone/android
para acesso ao app".

A CORRECAO HONESTA, e ela e o comeco desta historia: **um QR so carrega um
endereco**. Nenhum codigo de barras instala nada — nem o da App Store. Quem faz
o icone aparecer e a PROPRIA PAGINA, e ela precisa de duas coisas:

  1. um cartao de identidade (manifest.webmanifest) dizendo o nome, a cor e
     QUAL desenho usar — e e esse desenho que sai daqui;
  2. um toque de quem chega: no iPhone, Compartilhar -> Adicionar a Tela de
     Inicio; no Android o proprio navegador oferece "Instalar".

O QR nao muda, e nao precisa mudar.

O DESENHO: a letra ק sobre o pergaminho do app, com o anel de latao. E a
primeira letra de קדיש, e o rotulo embaixo do icone ja diz "Kadish" — entao o
desenho nao precisa repetir a palavra; precisa ser reconhecivel a 48px no meio
de outros vinte icones.

Sai daqui, em icones/:
  icone-192.png · icone-512.png    os dois tamanhos que o Android pede
  icone-maskable-512.png           com folga nas bordas: o Android RECORTA o
                                   icone em circulo, e sem folga a letra perde
                                   as pontas
  apple-touch-icon.png (180)       o do iPhone. O iOS ignora o manifest para
                                   isto e le SO a etiqueta no HTML.

PROVAS antes de gravar, e a primeira nasceu de um erro meu:

  1. A FONTE TEM HEBRAICO MESMO? A primeira tentativa usou a DejaVu Serif Bold,
     que NAO tem, e o ק saiu como o retangulo vazio do "caractere ausente". Pior:
     o meu teste disse que estava tudo bem, porque eu medi a CAIXA do glifo — e
     a caixa vazia tambem tem caixa. So olhando o desenho e que se viu. Agora a
     prova compara o desenho do ק com o de um caractere que nao existe em fonte
     nenhuma; se forem iguais, e caixa vazia e o script para.
  2. Cada arquivo e REABERTO: tamanho certo, sem transparencia (o iOS pinta
     preto atras do transparente e o icone some) e com uma fatia de tinta
     plausivel — nem em branco, nem um borrao.

  python3 -m pip install pillow   (uma vez)
  python3 gerar-icones.py
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

PERGAMINHO = (244, 237, 224)   # --bg do app
LATAO      = (139, 106,  62)   # --brass
TINTA      = ( 42,  31,  21)   # --text
LETRA      = 'ק'
AUSENTE    = '￿'          # nao existe em fonte nenhuma

# DOIS DESENHOS, e a escolha e dele (10/09):
#   'estrela' — a que o app ja tem desde 21/08 (favicon.svg). Trocar um icone
#               que ja esta na tela de alguem e mudanca visivel; por isso este
#               e o PADRAO, e nada muda para quem ja tinha o app.
#   'letra'   — o ק de קדיש. Diz "Kadish" e nao "judaico", que e mais especifico
#               no meio de vinte icones. Entra se ele pedir.
# python3 gerar-icones.py letra

# FreeSerif tem hebraico de verdade, e e serifada como as letras do app.
FONTE = '/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf'
ALTERNATIVAS = [
    '/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
]

ARQUIVOS = [
    ('icones/icone-192.png',           192, 0.08),
    ('icones/icone-512.png',           512, 0.08),
    ('icones/icone-maskable-512.png',  512, 0.20),
    ('icones/apple-touch-icon.png',    180, 0.08),
]


def bitmap(caminho, ch, corpo=96):
    fonte = ImageFont.truetype(caminho, corpo)
    im = Image.new('L', (corpo * 2, corpo * 2), 0)
    ImageDraw.Draw(im).text((corpo // 4, corpo // 8), ch, font=fonte, fill=255)
    return im.tobytes()


def tem_hebraico(caminho):
    """O desenho do ק e o mesmo borrao do caractere ausente? Entao nao tem."""
    try:
        marca = bitmap(caminho, LETRA)
    except Exception:
        return False
    return any(marca) and marca != bitmap(caminho, AUSENTE)


def escolher_fonte():
    for c in ALTERNATIVAS:
        if os.path.exists(c) and tem_hebraico(c):
            return c
    return None


def desenhar_estrela(lado, folga):
    """A estrela do favicon.svg, redesenhada no tamanho pedido (nao ampliada:
       o apple-touch-icon.png tem 180px e esticar borra as pontas)."""
    S = lado * 4
    img = Image.new('RGB', (S, S), PERGAMINHO)
    d = ImageDraw.Draw(img)
    # as mesmas coordenadas do favicon.svg (viewBox 192), reescaladas
    k = S / 192.0
    util = 1 - 2 * folga
    def p(x, y):
        # encolhe para dentro da folga, mantendo o centro
        return (S / 2 + (x - 96) * k * util / 0.82,
                S / 2 + (y - 96) * k * util / 0.82)
    largura = max(2, int(11 * k * util / 0.82))
    for tri in ([(96, 34), (146, 122), (46, 122)],
                [(96, 158), (46, 70), (146, 70)]):
        d.line([p(*tri[0]), p(*tri[1]), p(*tri[2]), p(*tri[0])],
               fill=LATAO, width=largura, joint='curve')
    return img.resize((lado, lado), Image.LANCZOS)


def desenhar(fonte, lado, folga):
    """folga = margem do quadro. O Android recorta o icone em circulo."""
    S = lado * 4                       # desenha grande e reduz: bordas macias
    img = Image.new('RGB', (S, S), PERGAMINHO)
    d = ImageDraw.Draw(img)
    m = int(S * folga)
    d.ellipse([m, m, S - m, S - m], outline=LATAO, width=max(2, int(S * 0.018)))
    # centrada pela caixa REAL do glifo: o centro tipografico mente
    f = ImageFont.truetype(fonte, int((S - 2 * m) * 0.62))
    x0, y0, x1, y1 = d.textbbox((0, 0), LETRA, font=f)
    d.text(((S - (x1 - x0)) / 2 - x0, (S - (y1 - y0)) / 2 - y0),
           LETRA, font=f, fill=TINTA)
    return img.resize((lado, lado), Image.LANCZOS)


def main():
    desenho = (sys.argv[1] if len(sys.argv) > 1 else 'estrela').lower()
    if desenho not in ('estrela', 'letra'):
        print('use: python3 gerar-icones.py [estrela|letra]')
        return 2
    fonte = escolher_fonte() if desenho == 'letra' else None
    if desenho == 'letra' and not fonte:
        print('VERMELHO: nenhuma fonte com hebraico. O ק sairia como um '
              'retangulo vazio, e o icone iria para o telefone dele assim.')
        return 1
    print('desenho: %s%s' % (desenho, (' · fonte: %s' % fonte) if fonte else ''))

    os.makedirs('icones', exist_ok=True)
    falhas = 0
    for nome, lado, folga in ARQUIVOS:
        arte = desenhar(fonte, lado, folga) if desenho == 'letra' \
            else desenhar_estrela(lado, folga)
        arte.save(nome)
        im = Image.open(nome)                      # reabrir e conferir
        px = im.convert('RGB').load()
        passo = 4
        pontos = range(0, lado, passo)
        escuros = sum(1 for y in pontos for x in pontos if sum(px[x, y]) < 400)
        tinta = escuros / (len(pontos) ** 2) * 100

        problemas = []
        if im.size != (lado, lado):
            problemas.append('saiu %sx%s, esperava %s' % (im.size[0], im.size[1], lado))
        if 'A' in im.mode:
            problemas.append('tem transparencia (o iOS pinta preto atras)')
        if tinta < 3:
            problemas.append('quase sem tinta (%.1f%%) — o desenho saiu vazio?' % tinta)
        if tinta > 45:
            problemas.append('tinta demais (%.1f%%) — virou um borrao?' % tinta)

        print('%s %s · %spx · %.1f%% de tinta%s' % (
            'FALHA' if problemas else 'OK   ', nome, im.size[0], tinta,
            '\n        ' + '\n        '.join(problemas) if problemas else ''))
        falhas += bool(problemas)

    if falhas:
        print('\nVERMELHO: %d icone(s) com problema.' % falhas)
        return 1
    print('\nVERDE: os %d icones em icones/.' % len(ARQUIVOS))
    return 0


if __name__ == '__main__':
    sys.exit(main())
