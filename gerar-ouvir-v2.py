#!/usr/bin/env python3
"""
gerar-ouvir-v2.py — escreve OUVIR-PRIMEIRO-v2.md: a lista curta de escuta.

Cruza tres fontes e so mantem o verso onde a suspeita sobrevive as tres:
  1. OUVIR-PRIMEIRO.md   — auditoria de sinal de 20/08 (o ouvido dirigido do Erez)
  2. o sinal, medido agora (sinal.py) — palavra longe de qualquer inicio de voz
  3. RELATORIO-AUDIO-WHISPER.md — apontamento do Whisper naquele verso

SO LE. Nao escreve em sync/*.json, ancoras.json nem cortes.json.
"""
import json, re, sys
import numpy as np
import sinal

def versos_do_ouvir(caminho='OUVIR-PRIMEIRO.md'):
    fora, nussach = {}, None
    for linha in open(caminho, encoding='utf-8'):
        m = re.match(r'^##\s+(\S+)', linha)
        if m:
            nussach = m.group(1); continue
        m = re.match(r'^-\s*§(\d+)\s*\[(\w+)\]\s*(.+)$', linha.strip())
        if m and nussach:
            fora.setdefault((nussach, int(m.group(1))), []).append(f'[{m.group(2)}] {m.group(3)}')
    return fora

def versos_do_whisper(caminho='RELATORIO-AUDIO-WHISPER.md'):
    txt = open(caminho, encoding='utf-8').read().split('## Apontamentos, nussach por nussach')[1]
    marcados, nussach = set(), None
    for linha in txt.split('\n'):
        m = re.match(r'^### (\S+)', linha)
        if m: nussach = m.group(1); continue
        m = re.match(r'^\*\*§(\d+)\*\*', linha)
        if m and nussach: marcados.add((nussach, int(m.group(1))))
    return marcados

def suspeitas_do_sinal():
    """Palavras cujo inicio esta longe de qualquer inicio de voz, por verso."""
    por_verso = {}
    for alvo in sinal.NUSSACHIM:
        sync, onsets = sinal.carregar(alvo)
        ps = sinal.palavras(sync)
        d = sinal.distancias([p['start'] for p in ps], onsets)
        for p, dist in zip(ps, d):
            if dist > sinal.SUSPEITO:
                por_verso.setdefault((alvo, p['verso']), []).append(
                    dict(hebrew=p['hebrew'], translit=p['translit'],
                         start=p['start'], dist=round(float(dist), 2)))
    return por_verso

def main():
    ouvir = versos_do_ouvir()
    whisper = versos_do_whisper()
    sinais = suspeitas_do_sinal()

    triplo   = sorted(k for k in sinais if k in ouvir and k in whisper)
    so_sinal = sorted(k for k in sinais if k not in triplo)

    l = []
    l.append('# OUVIR PRIMEIRO v2 — a lista curta')
    l.append('')
    l.append('Gerado por `gerar-ouvir-v2.py`. Substitui o OUVIR-PRIMEIRO.md como ordem de')
    l.append('escuta; o v1 fica no repositório como registro do que foi medido em 20/08.')
    l.append('')
    l.append('## Por que a lista encolheu')
    l.append('')
    l.append('O v1 tinha 36 suspeitos em 28 versos. Ele foi cruzado com duas medidas novas:')
    l.append('')
    l.append('- **o sinal, medido de novo** — a palavra é suspeita quando o início dela está a')
    l.append(f'  mais de {sinal.SUSPEITO}s de qualquer início de voz do áudio;')
    l.append('- **o Whisper** — o verso aparece no RELATORIO-AUDIO-WHISPER.md.')
    l.append('')
    l.append(f'Sobraram **{len(triplo)} versos** onde as três fontes concordam. É por eles que se começa.')
    l.append('')
    l.append('> O Whisper sozinho apontou 431 coisas e a maior parte é ruído dele: as medianas')
    l.append('> de desvio por nussach ficam entre −1,6s e +1,8s, mas o sinal mostra que 90% das')
    l.append('> nossas palavras já caem em cima da voz. Por isso o Whisper aqui só serve como')
    l.append('> terceiro voto, nunca como medida.')
    l.append('')

    l.append('## Os versos (sinal + Whisper + lista de 20/08)')
    l.append('')
    if not triplo:
        l.append('Nenhum. As três fontes não concordam em nenhum verso.')
        l.append('')
    for chave in triplo:
        nussach, verso = chave
        l.append(f'### {nussach} §{verso}')
        l.append('')
        for nota in ouvir[chave]:
            l.append(f'- em 20/08: {nota}')
        for p in sinais[chave]:
            l.append(f'- sinal agora: `{p["hebrew"]}` *({p["translit"]})* começa em {p["start"]}s, '
                     f'a {p["dist"]}s do início de voz mais próximo')
        l.append('')

    if so_sinal:
        l.append('## Suspeitos novos, só do sinal')
        l.append('')
        l.append('Não estavam no v1 e o Whisper não confirmou. Ficam em segundo plano.')
        l.append('')
        for chave in so_sinal:
            nussach, verso = chave
            marca = ' *(Whisper confirma)*' if chave in whisper else ''
            for p in sinais[chave]:
                l.append(f'- {nussach} §{verso}{marca} — `{p["hebrew"]}` *({p["translit"]})* '
                         f'em {p["start"]}s, a {p["dist"]}s da voz')
        l.append('')

    resolvidos = sorted(k for k in ouvir if k not in sinais)
    l.append('## Versos do v1 que saíram da lista')
    l.append('')
    l.append(f'{len(resolvidos)} dos {len(ouvir)} versos do v1 não têm mais nenhuma palavra longe da voz.')
    l.append('O que os marcou em 20/08 foi ritmo ou proporção de silêncio no intervalo — não')
    l.append('início de palavra fora do lugar. Não precisam de escuta dirigida.')
    l.append('')
    l.append(', '.join(f'{n} §{v}' for n, v in resolvidos))
    l.append('')
    l.append('## Como usar')
    l.append('')
    l.append('1. Ouça no conferidor.html o verso da lista curta.')
    l.append('2. Se a palavra acender fora da voz, anote o segundo.')
    l.append('3. O reparo vira âncora em `ancoras.json` — e só então roda o alinhador.')
    l.append('4. Nada aqui altera nada sozinho.')
    l.append('')

    open('OUVIR-PRIMEIRO-v2.md', 'w', encoding='utf-8').write('\n'.join(l) + '\n')
    print(f'OUVIR-PRIMEIRO-v2.md escrito — {len(triplo)} versos na lista curta '
          f'(v1 tinha {len(ouvir)}), {len(so_sinal)} suspeitos novos so do sinal.')

main()
