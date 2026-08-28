#!/usr/bin/env python3
"""
medir-fim-da-voz.py — ONDE A VOZ DE CADA VERSO REALMENTE ACABA
==============================================================

28/08. O Erez, no iPhone e no iPad: "no final da frase da para ouvir o comeco da
outra (bea) antes de recomecar a frase. na segunda tambem (ve), na terceira
tambem (ve)".

Medido nas 153 fronteiras de verso dos 8 Kadishim, e o resultado nao tem
excecao:

    silencio ANTES da fronteira : 320 a 760 ms (mediana 600)
    silencio DEPOIS da fronteira: 0 ms, nas 153

A fronteira do verso esta COLADA no ataque da primeira palavra do verso seguinte.
E assim por construcao: as palavras se encostam na fita (o fim de uma e o comeco
da outra), entao a ultima palavra do verso engole todo o silencio da respiracao
do rabino e so termina quando a proxima comeca a soar.

Consequencia: parar "no fim do verso" e parar no instante exato em que a proxima
palavra comeca. Qualquer atraso do aparelho — o relogio grosso do iOS, o que ja
esta no buffer de saida, a pausa nao ser instantanea — e ele ouve o ataque da
palavra seguinte. No Chromium daqui a pausa cai no milissegundo e nada se ouve;
por isso as checagens ficavam verdes.

O conserto nao e apertar a conta: e parar onde a VOZ acaba, e nao onde a fita
troca de verso. Isso da 320 a 760 ms de folga contra qualquer atraso, e nao corta
nada — o rabino ja tinha calado.

Este script mede esse instante e escreve fim-da-voz.json. So LE sinal/ e sync/;
nao escreve em sync/, nem em ancoras.json, nem em cortes.json.

    python3 medir-fim-da-voz.py            → mostra
    python3 medir-fim-da-voz.py --gravar   → escreve fim-da-voz.json
"""
import json, io, glob, sys, statistics as st

MARGEM = 0.08   # depois do fim da voz, para nao comer o rabinho da ultima silaba

def main():
    gravar = '--gravar' in sys.argv
    saida = {}
    resumo = []
    for p in sorted(glob.glob('sync/*_sync.json')):
        nome = p.split('/')[-1].replace('_sync.json', '')
        d = json.load(io.open(p, encoding='utf-8'))
        try:
            sig = json.load(io.open(f'sinal/{nome}.json', encoding='utf-8'))
        except FileNotFoundError:
            print(f'{nome}: sem sinal/, pulando'); continue
        blocos = [(b['start'], b['end']) if isinstance(b, dict) else tuple(b)
                  for b in sig['blocos']]
        versos = d['versos']
        paradas = []
        folgas = []
        for i, v in enumerate(versos):
            fim = v['palavras'][-1]['end']
            ini = v['palavras'][0]['start']
            # a ultima voz que acaba dentro deste verso
            dentro = [b for b in blocos if b[1] <= fim + 0.02 and b[1] > ini]
            if not dentro:
                paradas.append(round(fim, 3)); folgas.append(0.0); continue
            fimDaVoz = dentro[-1][1]
            parada = min(fim, fimDaVoz + MARGEM)
            # nunca antes do comeco da ultima palavra: parar ali cortaria a palavra
            parada = max(parada, v['palavras'][-1]['start'] + 0.05)
            paradas.append(round(parada, 3))
            folgas.append(fim - parada)
        saida[nome] = paradas
        resumo.append((nome, len(paradas), st.median(folgas), min(folgas), max(folgas)))

    print(f"{'nussach':22} {'versos':>7} {'folga ganha (ms)':>30}")
    for nome, n, med, mn, mx in resumo:
        print(f'{nome:22} {n:7}   mediana {med*1000:6.0f}   menor {mn*1000:6.0f}   maior {mx*1000:6.0f}')
    todas = [f for _, _, m, _, _ in resumo for f in [m]]
    print(f'\nA parada passa a acontecer, na mediana, {st.median(todas)*1000:.0f} ms antes da '
          f'fronteira — dentro do silencio, sem cortar voz nenhuma.')

    if gravar:
        io.open('fim-da-voz.json', 'w', encoding='utf-8').write(json.dumps({
            '_leia': ('Onde a VOZ de cada verso realmente acaba, por nussach_tipo, na ordem dos '
                      'versos. O Modo Treino para AQUI, e nao na fronteira do verso — a fronteira '
                      'esta colada no ataque da palavra seguinte (medido: 0 ms de folga nas 153), '
                      'entao parar nela faz o aparelho deixar escapar o "bea" do bealma. '
                      'Escrito por medir-fim-da-voz.py a partir de sinal/ e sync/. '
                      'NAO e autoridade sobre nada: nao move palavra, nao vira ancora, so diz '
                      'onde o silencio comeca. Refazer quando um audio ou um sync mudar.'),
            'margem_apos_a_voz': MARGEM,
            'paradas': saida,
        }, ensure_ascii=False, indent=1) + '\n')
        print('\nfim-da-voz.json gravado.')

main()
