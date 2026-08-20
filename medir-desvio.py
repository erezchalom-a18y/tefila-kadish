#!/usr/bin/env python3
"""
medir-desvio.py — mede a sincronia contra O SINAL do audio (nao contra o Whisper).

SO LE. Imprime, por nussach: quantas das nossas palavras ja caem em cima de um
inicio de voz, qual deslocamento global melhoraria isso, e quanto melhoraria.

Uso:  python3 medir-desvio.py [nussach ...]
      python3 medir-desvio.py --json
"""
import json, sys
import sinal

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    alvos = args or sinal.NUSSACHIM
    linhas, resumo = [], []
    for alvo in alvos:
        sync, onsets = sinal.carregar(alvo)
        inicios = [p['start'] for p in sinal.palavras(sync)]
        em_zero = sinal.acertos(inicios, onsets)
        desvio, no_desvio = sinal.melhor_desvio(inicios, onsets)
        d = sinal.distancias(inicios, onsets)
        suspeitas = int((d > sinal.SUSPEITO).sum())
        resumo.append(dict(nussach=alvo, palavras=len(inicios), acertos_em_zero=em_zero,
                           pct=round(100 * em_zero / len(inicios), 1), desvio=desvio,
                           acertos_no_desvio=no_desvio, ganho=no_desvio - em_zero,
                           palavras_suspeitas=suspeitas))
        linhas.append(f'{alvo:22}{len(inicios):8} {em_zero:>6} ({100*em_zero/len(inicios):4.1f}%) '
                      f'{desvio:+7.2f} {no_desvio:>7} {no_desvio-em_zero:+6} {suspeitas:>8}')
    if '--json' in sys.argv:
        print(json.dumps(resumo, ensure_ascii=False, indent=2))
        return
    print(f"{'nussach':22}{'palavras':>8} {'em cima da voz':>15} {'desvio':>7} {'com ele':>7} {'ganho':>6} {'suspeitas':>9}")
    print('\n'.join(linhas))

main()
