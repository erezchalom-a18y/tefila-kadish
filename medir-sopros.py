"""
medir-sopros.py — onde o rabino REALMENTE para entre uma palavra e outra.

O Modo Treino por palavra precisa saber onde pode cortar o audio. O sync/*.json
nao serve para isso: nele o fim de uma palavra e o inicio da seguinte sao o
mesmo numero, sempre — nao ha vao registrado. Quem sabe onde ha silencio de
verdade e o sinal.

Este script mede as 8 gravacoes e escreve sopros.json com as fronteiras que
NAO dao para cortar: aquelas em que o rabino emenda duas palavras num sopro so
("min kodam", "kol Yisrael"). Sao poucas, e sao justamente as que o aramaico
pronuncia junto — cortar ali soaria quebrado e ensinaria errado.

SO LE audio e sync/*.json. Escreve unicamente sopros.json. Nao toca em
sync/*.json, ancoras.json nem cortes.json.

Requer: pip install numpy soundfile

Uso:
  python3 medir-sopros.py            → mede e escreve sopros.json
  python3 medir-sopros.py --ensaio   → mede e mostra, sem escrever
"""
import glob
import json
import os
import sys

import numpy as np
import soundfile as sf

JANELA = 0.010          # 10 ms por quadro
LIMIAR_DB = -35.0       # abaixo disto e silencio de verdade nestas gravacoes
MEIA_JANELA = 0.06      # olha 60 ms para cada lado da fronteira
SILENCIO_MINIMO = 0.08  # menos que 80 ms de silencio nao e pausa, e emenda


def envelope_db(caminho):
    """Energia do arquivo inteiro, em dB relativos ao pico."""
    dados, taxa = sf.read(caminho, dtype='float32')
    if dados.ndim > 1:
        dados = dados.mean(axis=1)
    n = int(taxa * JANELA)
    quadros = len(dados) // n
    energia = np.sqrt((dados[:quadros * n].reshape(quadros, n) ** 2).mean(axis=1) + 1e-12)
    return 20 * np.log10(energia / energia.max())


def fundo_em(db, t):
    """Menor energia numa janela em torno de t. Baixo = tem silencio ali."""
    i0 = max(0, int((t - MEIA_JANELA) / JANELA))
    i1 = min(len(db), int((t + MEIA_JANELA) / JANELA) + 1)
    return float(db[i0:i1].min()) if i1 > i0 else 0.0


def duracao_do_silencio(db, t, busca=0.4):
    """Quantos segundos de silencio contiguo existem em torno de t."""
    centro = int(t / JANELA)
    if centro <= 0 or centro >= len(db):
        return 0.0
    j = int(busca / JANELA)
    a0 = max(0, centro - j)
    janela = db[a0:min(len(db), centro + j)]
    i = centro - a0
    if i >= len(janela):
        return 0.0
    if janela[i] >= LIMIAR_DB:
        quietos = np.where(janela < LIMIAR_DB)[0]
        if not len(quietos):
            return 0.0
        i = int(quietos[np.argmin(np.abs(quietos - i))])
        if abs(i - (centro - a0)) * JANELA > MEIA_JANELA:
            return 0.0
    a, b = i, i
    while a > 0 and janela[a - 1] < LIMIAR_DB:
        a -= 1
    while b < len(janela) - 1 and janela[b + 1] < LIMIAR_DB:
        b += 1
    return (b - a + 1) * JANELA


def caminho_audio(nussach, tipo):
    """O app serve .mp3 quando o aparelho nao toca .ogg; medimos o que ele toca."""
    for ext in ('mp3', 'ogg'):
        p = f'tefila-audio/{nussach}/{tipo}.{ext}'
        if os.path.exists(p):
            return p
    raise FileNotFoundError(f'sem audio para {nussach}/{tipo}')


def medir(nussach, tipo):
    dados = json.load(open(f'sync/{nussach}_{tipo}_sync.json', encoding='utf-8'))
    db = envelope_db(caminho_audio(nussach, tipo))
    colados, palavras, limpas = [], 0, 0
    for v in dados['versos']:
        ps = v.get('palavras') or []
        palavras += len(ps)
        for k in range(1, len(ps)):
            t = ps[k]['start']
            silencio = duracao_do_silencio(db, t) if fundo_em(db, t) < LIMIAR_DB else 0.0
            if silencio < SILENCIO_MINIMO:
                colados.append({
                    'v': v['n'], 'p': k,
                    'antes': ps[k - 1]['hebrew'], 'depois': ps[k]['hebrew'],
                    'silencio_ms': round(silencio * 1000),
                })
            else:
                limpas += 1
    return {'palavras': palavras, 'fronteiras_limpas': limpas, 'colados': colados}


def main():
    ensaio = '--ensaio' in sys.argv
    saida = {
        'gerado_por': 'medir-sopros.py',
        'o_que_e': ('fronteiras entre palavras onde o rabino NAO pausa — cortar ali '
                    'soa quebrado, entao o Modo Treino por palavra mantem as duas juntas'),
        'limiar_db': LIMIAR_DB,
        'silencio_minimo_s': SILENCIO_MINIMO,
        'combinacoes': {},
    }
    for arquivo in sorted(glob.glob('sync/*_sync.json')):
        nome = arquivo.split('/')[-1].replace('_sync.json', '')
        nussach, tipo = nome.rsplit('_', 1)
        r = medir(nussach, tipo)
        saida['combinacoes'][nome] = r
        passos = r['palavras'] - len(r['colados'])
        print(f"{nome:22} {r['palavras']:>4} palavras → {passos:>4} passos "
              f"({len(r['colados'])} fronteiras emendadas)")
        for c in r['colados'][:3]:
            print(f"{'':22}   emendado: \"{c['antes']} {c['depois']}\" (verso {c['v']}, {c['silencio_ms']} ms)")

    total_col = sum(len(c['colados']) for c in saida['combinacoes'].values())
    total_pal = sum(c['palavras'] for c in saida['combinacoes'].values())
    print(f"\ntotal: {total_pal} palavras, {total_col} fronteiras emendadas "
          f"({100 * total_col // total_pal}%)")

    if ensaio:
        print('\n--ensaio: nada foi escrito')
        return
    with open('sopros.json', 'w', encoding='utf-8') as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print('\nescrito: sopros.json')


if __name__ == '__main__':
    main()
