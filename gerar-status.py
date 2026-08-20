#!/usr/bin/env python3
"""
gerar-status.py — escreve STATUS.md: a tela que o Erez le em 30 segundos.

SO LE dados. Escreve apenas STATUS.md e metricas-sinal.json.

Determinismo de proposito: nada aqui usa a hora atual. A data que aparece no
STATUS.md e a do ultimo commit. Assim, entrada igual gera saida igual, e o CI
nao fica commitando STATUS.md a cada push (o que viraria laco).
"""
import json, re, subprocess, sys, os
import numpy as np
import sinal

def git(*args, padrao=''):
    try:
        return subprocess.run(['git', *args], capture_output=True, text=True, check=True).stdout.strip()
    except Exception:
        return padrao

def checagem(script):
    r = subprocess.run(['node', script], capture_output=True, text=True)
    return r.returncode == 0, (r.stdout.strip().split('\n') or [''])[-1]

def medir():
    saida = {}
    for alvo in sinal.NUSSACHIM:
        sync, onsets = sinal.carregar(alvo)
        ps = sinal.palavras(sync)
        inicios = [p['start'] for p in ps]
        d = sinal.distancias(inicios, onsets)
        desvio, no_desvio = sinal.melhor_desvio(inicios, onsets)
        em_zero = sinal.acertos(inicios, onsets)
        saida[alvo] = dict(
            palavras=len(ps),
            em_cima_da_voz=em_zero,
            pct=round(100 * em_zero / len(ps), 1),
            desvio_global=desvio,
            ganho_do_desvio=no_desvio - em_zero,
            mediana_distancia=round(float(np.median(d)), 3),
            palavras_fora=int((d > sinal.SUSPEITO).sum()),
        )
    return saida

def medianas_whisper(caminho='RELATORIO-AUDIO-WHISPER.md'):
    if not os.path.exists(caminho): return {}
    txt = open(caminho, encoding='utf-8').read()
    if '## Apontamentos, nussach por nussach' not in txt: return {}
    txt = txt.split('## Apontamentos, nussach por nussach')[1]
    por, atual = {}, None
    for linha in txt.split('\n'):
        m = re.match(r'^### (\S+)', linha)
        if m: atual = m.group(1); por.setdefault(atual, []); continue
        m = re.search(r'diferença ([+-]?[\d.]+)s', linha)
        if m and atual: por[atual].append(float(m.group(1)))
    return {k: (round(float(np.median(v)), 2) if v else None) for k, v in por.items()}

def lista_curta(caminho='OUVIR-PRIMEIRO-v2.md'):
    if not os.path.exists(caminho): return {}
    txt = open(caminho, encoding='utf-8').read()
    if '## Os versos' not in txt: return {}
    bloco = txt.split('## Os versos', 1)[1]
    corte = re.search(r'^## ', bloco, re.M)   # so cabecalho de nivel 2 encerra a secao
    bloco = bloco[:corte.start()] if corte else bloco
    por = {}
    for m in re.finditer(r'^### (\S+) §(\d+)', bloco, re.M):
        por.setdefault(m.group(1), []).append(int(m.group(2)))
    return por

def ancoras(caminho='ancoras.json'):
    d = json.load(open(caminho, encoding='utf-8'))
    return {k: len(v) for k, v in d.items() if isinstance(v, list)}

def data_do_arquivo(caminho):
    if not os.path.exists(caminho): return '—'
    return git('log', '-1', '--format=%cd', '--date=format:%d/%m/%Y %H:%M', '--', caminho, padrao='—') or '—'

def main():
    metricas = medir()
    json.dump(metricas, open('metricas-sinal.json', 'w', encoding='utf-8'),
              ensure_ascii=False, indent=2)
    open('metricas-sinal.json', 'a', encoding='utf-8').write('\n')

    ok1, msg1 = checagem('checar.mjs')
    ok2, msg2 = checagem('checar-ritos.mjs')
    whisper = medianas_whisper()
    curta = lista_curta()
    anc = ancoras()
    commit = git('rev-parse', '--short', 'HEAD', padrao='(local)')
    data = git('log', '-1', '--format=%cd', '--date=format:%d/%m/%Y %H:%M', padrao='—')

    l = []
    l.append('# STATUS — Kadish')
    l.append('')
    l.append(f'Gerado por `gerar-status.py` no commit `{commit}`, de {data}.')
    l.append('Atualizado sozinho pelo GitHub Actions a cada push na main.')
    l.append('')

    l.append('## As checagens')
    l.append('')
    l.append(f"- **checar.mjs** — {'🟢 VERDE' if ok1 else '🔴 VERMELHO'} · {msg1}")
    l.append(f"- **checar-ritos.mjs** — {'🟢 VERDE' if ok2 else '🔴 VERMELHO'} · {msg2}")
    l.append('')
    l.append('Verde não quer dizer pronto. Quer dizer que os defeitos que a gente já')
    l.append('sabe procurar não estão aí.')
    l.append('')

    l.append('## As revisões automáticas')
    l.append('')
    l.append('| Revisão | Último relatório | O que ela olha |')
    l.append('| --- | --- | --- |')
    l.append(f'| ChatGPT (glossário) | {data_do_arquivo("RELATORIO-REVISAO-GPT.md")} | as 42 entradas × 8 línguas, às cegas |')
    l.append(f'| Whisper (áudio) | {data_do_arquivo("RELATORIO-AUDIO-WHISPER.md")} | os 8 áudios contra os sync/*.json |')
    l.append('')
    l.append('Nenhuma das duas altera arquivo nenhum. As duas são opinião de máquina.')
    l.append('')

    l.append('## Os 8 nussachim')
    l.append('')
    l.append('| Nussach | Palavras em cima da voz | Desvio que o sinal sugere | Mediana do Whisper | Palavras fora da voz | Versos na lista curta | Âncoras |')
    l.append('| --- | ---: | ---: | ---: | ---: | ---: | ---: |')
    for alvo in sinal.NUSSACHIM:
        m = metricas[alvo]
        w = whisper.get(alvo)
        versos = curta.get(alvo, [])
        l.append(f'| {alvo} | {m["em_cima_da_voz"]}/{m["palavras"]} ({m["pct"]}%) | '
                 f'{m["desvio_global"]:+.2f}s | {f"{w:+.2f}s" if w is not None else "—"} | '
                 f'{m["palavras_fora"]} | {len(versos)} | {anc.get(alvo, 0)} |')
    total_fora = sum(m['palavras_fora'] for m in metricas.values())
    total_curta = sum(len(v) for v in curta.values())
    total_anc = sum(anc.values())
    l.append(f'| **total** | | | | **{total_fora}** | **{total_curta}** | **{total_anc}** |')
    l.append('')
    l.append('Como ler cada coluna:')
    l.append('')
    l.append('- **em cima da voz** — quantas das nossas palavras começam a menos de')
    l.append(f'  {sinal.TOLERANCIA}s de um início de voz do áudio. É a medida que vale.')
    l.append('- **desvio que o sinal sugere** — quanto um deslocamento global melhoraria.')
    l.append('  Perto de zero significa que não há nada sistemático para consertar.')
    l.append('- **mediana do Whisper** — o que o Whisper acha do desvio. Está aqui só para')
    l.append('  comparação: quando ela discorda muito da coluna anterior, quem erra é o')
    l.append('  Whisper, não nós. Nunca use esta coluna para corrigir nada.')
    l.append(f'- **palavras fora da voz** — começam a mais de {sinal.SUSPEITO}s de qualquer voz.')
    l.append('- **versos na lista curta** — o que sobrou no OUVIR-PRIMEIRO-v2.md.')
    l.append('- **âncoras** — reparos de ouvido do Erez já registrados em ancoras.json.')
    l.append('')

    l.append('## O que depende de gente')
    l.append('')
    l.append(f'1. **Ouvir os {total_curta} versos da lista curta** (OUVIR-PRIMEIRO-v2.md). Para cada um:')
    l.append('   ouvir no conferidor, e se a palavra acender fora da voz, dizer o segundo.')
    l.append('   O reparo vira âncora — e só então roda o alinhador.')
    l.append('2. **Revisão do rabino**: o glossário (42 entradas × 8 línguas) e as regras de')
    l.append('   ritos.json. Documento pronto: revisao-rabino.html.')
    l.append('3. **Direitos**: as entradas `origem=tehilat_hashem` no glossário vieram de')
    l.append('   siddur publicado. Decisão pendente.')
    l.append('4. **As 7 línguas além do português** são rascunho de IA e precisam de revisão')
    l.append('   humana antes de qualquer distribuição.')
    l.append('')
    l.append('## O que a máquina nunca faz sozinha')
    l.append('')
    l.append('Alterar `ancoras.json`, `cortes.json`, `sync/*.json` ou qualquer texto')
    l.append('litúrgico. Aplicar sugestão de modelo ao `glossario.json`. Quem decide texto')
    l.append('é o rabino; quem decide sincronia é o ouvido do Erez.')
    l.append('')

    open('STATUS.md', 'w', encoding='utf-8').write('\n'.join(l) + '\n')
    print(f'STATUS.md escrito — checagens {"verdes" if ok1 and ok2 else "COM VERMELHO"}, '
          f'{total_fora} palavras fora da voz, {total_curta} versos na lista curta, {total_anc} ancoras.')
    return 0 if (ok1 and ok2) else 1

sys.exit(main())
