#!/usr/bin/env python3
"""
converter-audio.py — gera o .mp3 ao lado de cada .ogg.

Por que: o Safari (iPad e Mac) NAO toca Ogg Vorbis. Sem um segundo formato, o
audio do rabino simplesmente nao carrega no iPad. Os .ogg continuam para os
navegadores que preferem Vorbis.

Por que MP3 e nao AAC/m4a: o Chromium de codigo aberto (o que temos para testar)
nao decodifica AAC, entao um .m4a nao poderia ser testado aqui — so no aparelho
do Erez, depois de subir. MP3 toca em tudo, inclusive no Safari, e da para provar
que funciona antes de entregar.

SO LE os .ogg e escreve os .m4a. Nao toca em sync/, ancoras.json ou cortes.json.

Depois de converter, prova que o tempo nao andou: compara a duracao e cruza o
envelope de energia dos dois arquivos. Qualquer deslocamento acima de 20 ms
reprova, porque a sincronia inteira depende do inicio ser o mesmo.

Uso:  pip install av numpy && python3 converter-audio.py
"""
import av, numpy as np, sys, os

NUSSACHIM = [(n, t) for n in ('ashkenaz', 'chabad', 'sefard', 'sefaradi')
                    for t in ('yatom', 'derabanan')]
LIMITE_DESLOCAMENTO = 0.020   # 20 ms
LIMITE_DURACAO = 0.050        # 50 ms

def converter(origem, destino):
    entrada = av.open(origem)
    dentro = entrada.streams.audio[0]
    saida = av.open(destino, 'w')
    fora = saida.add_stream('mp3', rate=dentro.rate)
    fora.bit_rate = 128000
    remuestra = av.audio.resampler.AudioResampler(
        format=fora.format, layout=fora.layout, rate=fora.rate)
    for quadro in entrada.decode(dentro):
        quadro.pts = None
        for q in remuestra.resample(quadro):
            for pacote in fora.encode(q):
                saida.mux(pacote)
    for pacote in fora.encode(None):
        saida.mux(pacote)
    saida.close(); entrada.close()

def envelope(caminho, janela=0.01):
    c = av.open(caminho)
    s = c.streams.audio[0]
    r = av.audio.resampler.AudioResampler(format='s16', layout='mono', rate=48000)
    pedacos = []
    for quadro in c.decode(s):
        for q in r.resample(quadro):
            pedacos.append(q.to_ndarray().reshape(-1))
    c.close()
    x = np.concatenate(pedacos).astype(np.float32) / 32768.0
    n = int(48000 * janela)
    q = len(x) // n
    return np.sqrt((x[:q*n].reshape(q, n) ** 2).mean(1) + 1e-12), len(x) / 48000.0

falhas = 0
print(f"{'nussach':22}{'ogg (s)':>9}{'mp3 (s)':>9}{'dif':>8}{'deslocamento':>14}{'KB':>8}")
for n, t in NUSSACHIM:
    ogg, mp3 = f'tefila-audio/{n}/{t}.ogg', f'tefila-audio/{n}/{t}.mp3'
    converter(ogg, mp3)
    ea, da = envelope(ogg)
    eb, db = envelope(mp3)
    m = min(len(ea), len(eb))
    a, b = ea[:m] - ea[:m].mean(), eb[:m] - eb[:m].mean()
    lag = (int(np.argmax(np.correlate(b, a, 'full'))) - (m - 1)) * 0.01
    kb = os.path.getsize(mp3) // 1024
    ruim = abs(lag) > LIMITE_DESLOCAMENTO or abs(db - da) > LIMITE_DURACAO
    if ruim: falhas += 1
    print(f'{n+"_"+t:22}{da:9.2f}{db:9.2f}{db-da:8.3f}{lag:+13.2f}s{kb:8}' + ('   REPROVA' if ruim else ''))

print('\nVERDE: nenhum audio deslocou' if not falhas else f'\nVERMELHO: {falhas} audio(s) deslocaram')
sys.exit(1 if falhas else 0)
