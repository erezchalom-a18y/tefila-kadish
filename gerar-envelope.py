"""
gerar-envelope.py — desenha a voz do rabino num arquivo pequeno, para o iPad.

Por que existe: o Erez pediu (23/08) um jeito de SABER O MOTIVO das diferencas
de sincronia, nao so de ouvir que esta errado. O motivo fica obvio quando se ve
a voz e as palavras no mesmo desenho: da para ver a palavra caida dentro de um
silencio, ou tres palavras espremidas num bloco so.

Calcular isso no navegador daria: baixar o .ogg inteiro e decodificar. No iPad
dele isso e lento e gasta dados. Entao o desenho e feito aqui, uma vez, e vira
um JSON de poucos kB que a pagina so le.

SO LE AUDIO. Nao escreve em sync/*.json, ancoras.json nem cortes.json — usa o
sinal.py, que ja tem essa regra.

Requer: pip install numpy soundfile

Uso:  python3 gerar-envelope.py            -> escreve sinal/*.json para os 8
      python3 gerar-envelope.py chabad_yatom
"""
import json
import os
import sys

import numpy as np

import sinal

# 25 quadros por segundo no desenho. O envelope do sinal.py tem 50 (janela de
# 20ms); metade disso ainda mostra cada silaba e deixa o arquivo na metade.
PASSO = 0.040
PASTA = 'sinal'

ALVOS = [f'{n}_{t}' for n in ('ashkenaz', 'chabad', 'sefard', 'sefaradi')
         for t in ('yatom', 'derabanan')]


def desenhar(alvo):
    caminho_audio, caminho_sync = sinal.caminhos(alvo)
    energia, dt = sinal.envelope(caminho_audio)
    onsets = sinal.inicios_de_voz(energia, dt)

    # reamostra para PASSO segundos, pegando o pico de cada intervalo — pico e
    # nao media, senao uma silaba curta desaparece do desenho
    passo_quadros = max(1, int(round(PASSO / dt)))
    sobra = len(energia) % passo_quadros
    e = energia[:len(energia) - sobra] if sobra else energia
    picos = e.reshape(-1, passo_quadros).max(axis=1)

    # em dB, normalizado, e depois 0..100 inteiro: o desenho nao precisa de mais
    db = 20 * np.log10(picos / picos.max() + 1e-12)
    piso = np.percentile(db, 5)
    alt = np.clip((db - piso) / (0 - piso), 0, 1)
    linha = np.round(alt * 100).astype(int).tolist()

    # Os blocos de voz: onde o rabino esta realmente falando. O limiar tem de
    # ser O MESMO do sinal.inicios_de_voz — se o desenho e a medida usarem
    # regras diferentes, o desenho mente para o Erez, e ele ia arrastar
    # palavra que estava certa. Por isso a conta e refeita aqui igualzinha,
    # sobre o envelope cheio, e so depois virada em segundos.
    db_cheio = 20 * np.log10(energia / energia.max())
    piso_cheio = np.percentile(db_cheio, 20)
    voz = db_cheio > piso_cheio + 0.35 * (0 - piso_cheio)
    for i in range(1, len(voz) - 1):                 # fecha buraco de 1 quadro
        if voz[i - 1] and voz[i + 1]:
            voz[i] = True

    blocos = []
    ini = None
    for i, a in enumerate(voz):
        if a and ini is None:
            ini = i
        elif not a and ini is not None:
            if (i - ini) * dt >= 0.06:               # ignora estalo
                blocos.append([round(ini * dt, 3), round(i * dt, 3)])
            ini = None
    if ini is not None:
        blocos.append([round(ini * dt, 3), round(len(voz) * dt, 3)])

    return {
        'alvo': alvo,
        'passo': PASSO,
        'duracao': round(len(energia) * dt, 3),
        'linha': linha,
        'blocos': blocos,
        'inicios_de_voz': [round(float(x), 3) for x in onsets],
        '_leia': ('linha = altura da voz, um numero 0..100 a cada "passo" segundos. '
                  'blocos = [inicio, fim] de cada trecho em que ele esta falando. '
                  'inicios_de_voz = os instantes que o sinal.py considera comeco de '
                  'palavra; sao a medida que vale, nao o Whisper.'),
    }


def main():
    alvos = [sys.argv[1]] if len(sys.argv) > 1 else ALVOS
    os.makedirs(PASTA, exist_ok=True)
    for alvo in alvos:
        d = desenhar(alvo)
        caminho = f'{PASTA}/{alvo}.json'
        with open(caminho, 'w', encoding='utf-8') as f:
            json.dump(d, f, separators=(',', ':'))
            f.write('\n')
        kb = os.path.getsize(caminho) / 1024
        print(f'{alvo:22} {d["duracao"]:6.1f}s  {len(d["blocos"]):3} blocos de voz  '
              f'{len(d["inicios_de_voz"]):3} inicios  {kb:5.1f} kB')


if __name__ == '__main__':
    main()
