#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
aplicar-ancoras.py — poe em sync/*.json os reparos de ouvido do Erez.

POR QUE ESTE ARQUIVO EXISTE
O CLAUDE.md cita alinhar-global.py, que reali nha o arquivo inteiro por
programacao dinamica. Esse script nunca foi commitado — vivia fora do
repositorio — e nao da para reproduzi-lo fielmente. Este aqui NAO e ele:
faz muito menos, de proposito.

O QUE ELE FAZ
Cada ancora diz "a palavra P do verso V comeca em T". Ele poe exatamente esse
T, e encosta nele a fronteira vizinha (o fim da palavra anterior, e as bordas
do verso quando a ancora e na primeira ou na ultima palavra). Nada mais se
move: nenhuma outra palavra, nenhum hebraico, nenhuma glosa.

O QUE ELE NUNCA FAZ
- nao inventa ancora, nao recalcula nada de ouvido nem por modelo;
- nao escreve em ancoras.json (esse arquivo e do Erez, so ele acrescenta);
- nao escreve em cortes.json;
- nao mexe em hebraico, transliteracao nem traducao;
- nao grava nada se qualquer prova abaixo falhar — ou aplica tudo, ou nada.

PROVAS, depois de aplicar e antes de gravar
- a quantidade de versos e de palavras nao mudou;
- hebraico, transliteracao e glosas sao byte a byte os mesmos;
- os tempos sobem sempre (start < end, e cada palavra depois da anterior);
- cada ancora esta valendo no arquivo final;
- nenhum tempo fora da vizinhanca de uma ancora mudou.

Uso:
  python3 aplicar-ancoras.py              -> ensaio: so mostra o que mudaria
  python3 aplicar-ancoras.py --confirmar  -> grava
"""
import json
import sys
from copy import deepcopy

CONFIRMAR = '--confirmar' in sys.argv
FOLGA = 0.01          # duracao minima que uma palavra pode ficar


def carregar(caminho):
    with open(caminho, encoding='utf-8') as f:
        return json.load(f)


def gravar(caminho, dados):
    with open(caminho, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)
        f.write('\n')


def assinatura_texto(d):
    """Tudo o que NAO pode mudar: as palavras em si."""
    return [
        (v['n'], v.get('hebrew'), v.get('transliteration_pt'), v.get('translation_pt'),
         json.dumps(v.get('translations'), ensure_ascii=False, sort_keys=True),
         [(p.get('hebrew'), p.get('transliteration_pt'),
           json.dumps(p.get('glosas'), ensure_ascii=False, sort_keys=True))
          for p in v.get('palavras', [])])
        for v in d['versos']
    ]


def aplicar_uma(d, anc):
    """Poe uma ancora. Devolve a lista de mudancas feitas."""
    v = next((v for v in d['versos'] if v['n'] == anc['verso']), None)
    if v is None:
        raise SystemExit(f"  ancora aponta para o verso {anc['verso']}, que nao existe")
    ps = v.get('palavras', [])
    i = anc['palavra'] - 1                      # a ancora e contada a partir de 1
    if not (0 <= i < len(ps)):
        raise SystemExit(f"  ancora aponta para a palavra {anc['palavra']} do verso "
                         f"{anc['verso']}, que so tem {len(ps)}")
    t = float(anc['inicio'])
    mudancas = []

    def poe(alvo, campo, valor, quem):
        antes = alvo.get(campo)
        if antes is None or abs(antes - valor) < 1e-9:
            return
        alvo[campo] = round(valor, 2)
        mudancas.append(f"{quem}: {antes:.2f} -> {valor:.2f}")

    poe(ps[i], 'start', t, f"§{v['n']} palavra {anc['palavra']} ({ps[i].get('transliteration_pt','')}) inicio")
    if i > 0:
        poe(ps[i - 1], 'end', t, f"§{v['n']} palavra {anc['palavra']-1} ({ps[i-1].get('transliteration_pt','')}) fim")
    else:
        poe(v, 'start', t, f"§{v['n']} inicio do verso")
        anterior = next((x for x in d['versos'] if x['n'] == v['n'] - 1), None)
        if anterior is not None:
            poe(anterior, 'end', t, f"§{anterior['n']} fim do verso")
            if anterior.get('palavras'):
                poe(anterior['palavras'][-1], 'end', t,
                    f"§{anterior['n']} ultima palavra ({anterior['palavras'][-1].get('transliteration_pt','')}) fim")
    return mudancas


def conferir(nome, antes, depois, ancoras):
    problemas = []
    if len(antes['versos']) != len(depois['versos']):
        problemas.append('mudou a quantidade de versos')
    if assinatura_texto(antes) != assinatura_texto(depois):
        problemas.append('mudou texto (hebraico, transliteracao ou traducao)')

    ultimo = -1.0
    for v in depois['versos']:
        for p in v.get('palavras', []):
            if p['end'] - p['start'] < FOLGA:
                problemas.append(f"§{v['n']} '{p.get('transliteration_pt','')}' ficou com "
                                 f"{p['end']-p['start']:.2f}s")
            if p['start'] < ultimo - 1e-9:
                problemas.append(f"§{v['n']} '{p.get('transliteration_pt','')}' comeca antes "
                                 f"da palavra anterior ({p['start']:.2f} < {ultimo:.2f})")
            ultimo = max(ultimo, p['start'])
        if v['end'] <= v['start']:
            problemas.append(f"§{v['n']} termina antes de comecar")

    for a in ancoras:
        v = next((v for v in depois['versos'] if v['n'] == a['verso']), None)
        p = v['palavras'][a['palavra'] - 1]
        if abs(p['start'] - float(a['inicio'])) > 1e-6:
            problemas.append(f"a ancora §{a['verso']}/{a['palavra']} nao ficou valendo")
    return problemas


def main():
    ancoras = carregar('ancoras.json')
    total_mudancas = 0
    para_gravar = {}

    for nome, lista in ancoras.items():
        if nome.startswith('_'):
            continue
        caminho = f'sync/{nome}_sync.json'
        antes = carregar(caminho)
        depois = deepcopy(antes)
        print(f'=== {nome} ({len(lista)} ancora(s)) ===')
        mudancas = []
        for a in sorted(lista, key=lambda x: (x['verso'], x['palavra'])):
            mudancas += aplicar_uma(depois, a)
        problemas = conferir(nome, antes, depois, lista)
        if problemas:
            print('  VERMELHO — nada foi gravado:')
            for p in problemas:
                print('   ', p)
            raise SystemExit(1)
        if not mudancas:
            print('  ja estava tudo no lugar; nada a fazer')
        else:
            for m in mudancas:
                print('  ', m)
            total_mudancas += len(mudancas)
            para_gravar[caminho] = depois

    print()
    if not total_mudancas:
        print('Nada mudou. Os sync/*.json ja respeitam todas as ancoras.')
        return
    if not CONFIRMAR:
        print(f'{total_mudancas} mudanca(s) — ENSAIO, nada foi gravado.')
        print('Para valer: python3 aplicar-ancoras.py --confirmar')
        return
    for caminho, dados in para_gravar.items():
        gravar(caminho, dados)
        print('gravado:', caminho)


main()
