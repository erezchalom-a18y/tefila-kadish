"""
sinal.py — leitura do sinal de audio para auditar a sincronia.

SO LE AUDIO. Nenhuma funcao daqui escreve em sync/*.json, ancoras.json ou
cortes.json. O sinal decide o numero; o ouvido do Erez decide se vale mexer.

Nao depende de ffmpeg: soundfile abre o .ogg direto (pip install soundfile).
"""
import json
import numpy as np
import soundfile as sf

JANELA = 0.020        # 20 ms por quadro
TOLERANCIA = 0.15     # inicio "em cima" de um bloco de voz
SUSPEITO = 0.30       # acima disto a palavra esta longe de qualquer inicio de voz


def envelope(caminho):
    dados, taxa = sf.read(caminho, dtype='float32')
    if dados.ndim > 1:
        dados = dados.mean(axis=1)
    n = int(taxa * JANELA)
    quadros = len(dados) // n
    energia = np.sqrt((dados[:quadros * n].reshape(quadros, n) ** 2).mean(axis=1) + 1e-12)
    return energia, JANELA


def inicios_de_voz(energia, dt=JANELA):
    """Instantes em que o sinal cruza o limiar de voz para cima."""
    db = 20 * np.log10(energia / energia.max())
    piso = np.percentile(db, 20)
    limiar = piso + 0.35 * (0 - piso)
    voz = db > limiar
    for i in range(1, len(voz) - 1):          # fecha buraco de 1 quadro
        if voz[i - 1] and voz[i + 1]:
            voz[i] = True
    return (np.where(~voz[:-1] & voz[1:])[0] + 1) * dt


def caminhos(alvo):
    nussach, tipo = alvo.rsplit('_', 1)
    return f'tefila-audio/{nussach}/{tipo}.ogg', f'sync/{alvo}_sync.json'


def carregar(alvo):
    audio, caminho_sync = caminhos(alvo)
    sync = json.load(open(caminho_sync, encoding='utf-8'))
    energia, dt = envelope(audio)
    return sync, np.asarray(inicios_de_voz(energia, dt))


def palavras(sync):
    """Lista achatada de palavras com o verso a que pertencem."""
    return [dict(verso=v['n'], i=p['i'], hebrew=p['hebrew'],
                 translit=p.get('transliteration_pt', ''), start=p['start'], end=p['end'])
            for v in sync['versos'] for p in v.get('palavras', [])]


def distancias(inicios, onsets):
    """Para cada instante, a distancia ate o inicio de voz mais proximo."""
    inicios = np.asarray(inicios, dtype=float)
    if len(onsets) < 2:
        return np.full(len(inicios), np.inf)
    idx = np.clip(np.searchsorted(onsets, inicios), 1, len(onsets) - 1)
    return np.minimum(np.abs(onsets[idx] - inicios), np.abs(onsets[idx - 1] - inicios))


def acertos(inicios, onsets, lag=0.0, tol=TOLERANCIA):
    return int((distancias(np.asarray(inicios) + lag, onsets) <= tol).sum())


def melhor_desvio(inicios, onsets, busca=3.0, passo=0.02):
    """Deslocamento global que mais faz nossas palavras caírem em cima da voz."""
    melhor, pontos = 0.0, -1
    for lag in np.arange(-busca, busca + passo, passo):
        a = acertos(inicios, onsets, float(lag))
        if a > pontos:
            pontos, melhor = a, float(lag)
    return round(melhor, 2), pontos


NUSSACHIM = [f'{n}_{t}' for n in ('ashkenaz', 'chabad', 'sefard', 'sefaradi')
             for t in ('yatom', 'derabanan')]
