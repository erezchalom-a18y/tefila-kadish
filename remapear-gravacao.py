#!/usr/bin/env python3
"""
remapear-gravacao.py — leva a sincronia de uma gravacao para OUTRA gravacao
do mesmo Kadish.

POR QUE EXISTE (02/09/2026)

O Erez regravou o audio do sefaradi (o chazan anunciava o nome do Kadish no
comeco; ele mandou cortar). Trocar o arquivo joga fora todos os tempos de
sync/*.json: a gravacao nova tem outro andamento. Mas as duas sao o MESMO
rabino dizendo as MESMAS palavras na mesma ordem — muda o ritmo, nao o texto.

Entao da para achar, so pelo SINAL, que instante da gravacao nova corresponde a
cada instante da velha: alinhamento temporal (DTW) sobre o envelope de energia,
o mesmo envelope do sinal.py, dos dois lados. Nenhum modelo opina aqui.

ISTO E PROVISORIO, E DE PROPOSITO. Ele so sabe ONDE ha voz — e um alinhamento
inteiro deslocado uma palavra passa nessa conta com nota maxima (foi o erro que
durou dias, em 24/08). A palavra final continua sendo:

    1. realinhar-por-conteudo.mjs, depois que o Whisper transcrever o audio novo
       (o workflow revisao-audio.yml roda sozinho no push que troca o audio);
    2. o ouvido do Erez, na fita continua do sincronia.html.

O QUE ELE NUNCA FAZ
- nao mexe em hebraico, transliteracao, glosa nem traducao — provado byte a byte;
- nao escreve em ancoras.json nem em cortes.json;
- RECUSA a rodar se ainda houver ancora do Erez para este Kadish: ancora e um
  segundo ouvido na gravacao VELHA e nao vale na nova. Aposentar antes, a mao,
  para _substituidas, com o motivo escrito.

Uso:
  python3 remapear-gravacao.py sefaradi_yatom velho.ogg           -> ensaio
  python3 remapear-gravacao.py sefaradi_yatom velho.ogg --confirmar
(o audio NOVO e o que ja esta em tefila-audio/; o velho vem de fora, guardado
antes da troca.)

Requer: pip install numpy soundfile
"""
import json
import sys
import numpy as np

import sinal

BANDA = 0.28      # o caminho do DTW nao se afasta mais que 28% da diagonal
ENCOSTO = 0.15    # encosta no inicio de voz mais proximo ate aqui
MIN_DUR = 0.20    # a mesma do realinhar-por-conteudo.mjs
EPS = 1e-6


def logenv(caminho):
    e, dt = sinal.envelope(caminho)
    x = 20 * np.log10(e / e.max())
    return (x - x.mean()) / (x.std() + 1e-9), dt


def mapa(velho, novo):
    """f(t na gravacao velha) -> t na gravacao nova, quadro a quadro."""
    a, dt = logenv(velho)
    b, _ = logenv(novo)
    n, m = len(a), len(b)
    largura = int(max(n, m) * BANDA)
    INF = np.float32(1e9)
    D = np.full((n, m), INF, dtype=np.float32)
    coluna = np.arange(m)
    for i in range(n):
        c = np.abs(a[i] - b).astype(np.float32)
        fora = np.abs(coluna - i * m / n) > largura
        if i == 0:
            D[0] = c
            D[0][fora] = INF
            continue
        # passo com inclinacao entre 1/2 e 2: nenhum predecessor esta na
        # PROPRIA linha, entao a linha inteira sai de uma vez em numpy.
        p1 = np.empty(m, np.float32); p1[0] = INF;   p1[1:] = D[i-1][:-1]
        p2 = np.empty(m, np.float32); p2[:2] = INF;  p2[2:] = D[i-1][:-2]
        p3 = np.full(m, INF, np.float32)
        if i >= 2:
            p3[0] = INF; p3[1:] = D[i-2][:-1]
        D[i] = np.minimum(np.minimum(p1, p2), p3) + c
        D[i][fora] = INF

    i, j = n - 1, m - 1
    dev = np.full(n, -1.0)
    while i > 0 and j > 0:
        dev[i] = j
        op = [(D[i-1][j-1], i-1, j-1)]
        if j >= 2: op.append((D[i-1][j-2], i-1, j-2))
        if i >= 2: op.append((D[i-2][j-1], i-2, j-1))
        _, i, j = min(op, key=lambda o: o[0])
    dev[i] = j
    idx = np.where(dev >= 0)[0]
    dev = np.interp(np.arange(n), idx, dev[idx])
    return np.arange(n) * dt, dev * dt


def texto(sync):
    """Tudo que NAO e tempo. Se isto mudar, o script errou."""
    return json.dumps([[v['n'], v['hebrew'], v.get('transliteration_pt'),
                        v.get('translations'),
                        [[p['i'], p['hebrew'], p.get('transliteration_pt'),
                          p.get('glosas'), p.get('transliteracoes')]
                         for p in v['palavras']]]
                       for v in sync['versos']], ensure_ascii=False, sort_keys=True)


def main():
    alvo = sys.argv[1]
    velho = sys.argv[2]
    confirmar = '--confirmar' in sys.argv
    audio_novo, caminho_sync = sinal.caminhos(alvo)

    ancoras = json.load(open('ancoras.json', encoding='utf-8')).get(alvo) or []
    if ancoras:
        print(f'RECUSADO: ainda ha {len(ancoras)} ancora(s) do Erez em {alvo}.')
        print('Elas foram ouvidas na gravacao VELHA e nao valem na nova.')
        print('Aposente-as para _substituidas, com o motivo, antes de remapear.')
        return 2

    sync = json.load(open(caminho_sync, encoding='utf-8'))
    antes_texto = texto(sync)

    energia, dt = sinal.envelope(audio_novo)
    dur = round(len(energia) * dt, 2)
    onsets = np.asarray(sinal.inicios_de_voz(energia, dt))
    tv, tn = mapa(velho, audio_novo)

    palavras = [p for v in sync['versos'] for p in v['palavras']]
    ini = np.interp([p['start'] for p in palavras], tv, tn)

    # encosta no inicio de voz mais proximo, quando ha um perto
    for k, t in enumerate(ini):
        d = np.abs(onsets - t)
        if len(d) and d.min() <= ENCOSTO:
            ini[k] = float(onsets[int(d.argmin())])

    fala_ini = float(onsets[0]) if len(onsets) else 0.0
    fala_fim = dur
    ini[0] = fala_ini
    # tempos subindo, e ninguem mais curto que MIN_DUR
    for k in range(1, len(ini)):
        ini[k] = max(ini[k], ini[k-1] + MIN_DUR)
    for k in range(len(ini) - 1, 0, -1):
        teto = (fala_fim if k == len(ini) - 1 else ini[k+1]) - MIN_DUR
        ini[k] = min(ini[k], teto)
    for k in range(1, len(ini)):
        ini[k] = max(ini[k], ini[k-1] + MIN_DUR)

    # grava: as palavras se encostam (o fim de cada uma e o comeco da seguinte)
    for k, p in enumerate(palavras):
        p['start'] = round(float(ini[k]), 2)
        p['end'] = round(float(ini[k+1] if k+1 < len(ini) else fala_fim), 2)
    for v in sync['versos']:
        v['start'] = v['palavras'][0]['start']
        v['end'] = v['palavras'][-1]['end']
    sync['audio_duration'] = dur
    sync['fala_inicio'] = round(fala_ini, 2)
    sync['fala_fim'] = dur
    sync['sync_status'] = ('remapeado da gravacao anterior pelo envelope (DTW) - '
                           'A CONFERIR DE OUVIDO na fita do sincronia.html')
    sync['palavras_status'] = sync['sync_status']

    # ---------- provas ----------
    falhas = []
    if texto(sync) != antes_texto:
        falhas.append('o texto mudou')
    ts = [p['start'] for p in palavras] + [palavras[-1]['end']]
    if any(b - a < MIN_DUR - EPS for a, b in zip(ts, ts[1:])):
        falhas.append('alguma palavra ficou mais curta que %.2fs' % MIN_DUR)
    if any(p['end'] != q['start'] for p, q in zip(palavras, palavras[1:])):
        falhas.append('as palavras deixaram de se encostar')
    if palavras[0]['start'] != sync['fala_inicio'] or palavras[-1]['end'] > dur + EPS:
        falhas.append('a fita nao cobre a fala do comeco ao fim')
    for v in sync['versos']:
        if v['start'] != v['palavras'][0]['start'] or v['end'] != v['palavras'][-1]['end']:
            falhas.append(f'o verso {v["n"]} nao e a soma das suas palavras')

    d = np.abs(np.array([p['start'] for p in palavras])[:, None] - onsets[None, :]).min(1)
    print(f'{alvo}: {len(palavras)} palavras · audio {dur:.2f}s · fala comeca {fala_ini:.2f}s')
    print(f'  em cima de um inicio de voz (<=0.15s): {(d <= 0.15).sum()}/{len(d)}'
          f'  · mediana {np.median(d):.3f}s · pior {d.max():.2f}s')
    if falhas:
        print('\nREPROVA, nada foi gravado:')
        for f in falhas:
            print('  -', f)
        return 1
    if not confirmar:
        print('\nensaio: nada gravado. Use --confirmar para gravar.')
        return 0
    with open(caminho_sync, 'w', encoding='utf-8') as f:
        json.dump(sync, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print(f'\ngravado {caminho_sync}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
