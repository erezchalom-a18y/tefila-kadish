# STATUS — Kadish

Gerado por `gerar-status.py` no commit `4eb77ce`, de 21/08/2026 19:18.
Atualizado sozinho pelo GitHub Actions a cada push na main.

## As checagens

- **checar.mjs** — 🟢 VERDE · VERDE: os 8 passaram
- **checar-ritos.mjs** — 🟢 VERDE · VERDE: marcas de rito conferem nos 8

Verde não quer dizer pronto. Quer dizer que os defeitos que a gente já
sabe procurar não estão aí.

## As revisões automáticas

| Revisão | Último relatório | O que ela olha |
| --- | --- | --- |
| ChatGPT (glossário) | 20/08/2026 14:59 | as 42 entradas × 8 línguas, às cegas |
| Whisper (áudio) | 21/08/2026 16:25 | os 8 áudios contra os sync/*.json |

Nenhuma das duas altera arquivo nenhum. As duas são opinião de máquina.

## Os 8 nussachim

| Nussach | Palavras em cima da voz | Desvio que o sinal sugere | Mediana do Whisper | Palavras fora da voz | Versos na lista curta | Âncoras |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| ashkenaz_yatom | 69/75 (92.0%) | -0.10s | -1.14s | 3 | 2 | 5 |
| ashkenaz_derabanan | 108/118 (91.5%) | -0.04s | -1.59s | 6 | 2 | 0 |
| chabad_yatom | 74/80 (92.5%) | -0.08s | -0.06s | 1 | 0 | 2 |
| chabad_derabanan | 110/121 (90.9%) | -0.10s | +1.75s | 4 | 0 | 0 |
| sefard_yatom | 69/81 (85.2%) | -0.06s | +0.75s | 7 | 3 | 0 |
| sefard_derabanan | 112/124 (90.3%) | -0.10s | +0.62s | 5 | 3 | 0 |
| sefaradi_yatom | 83/91 (91.2%) | -0.12s | -0.66s | 6 | 2 | 0 |
| sefaradi_derabanan | 116/125 (92.8%) | -0.12s | -0.66s | 4 | 0 | 0 |
| **total** | | | | **36** | **12** | **7** |

Como ler cada coluna:

- **em cima da voz** — quantas das nossas palavras começam a menos de
  0.15s de um início de voz do áudio. É a medida que vale.
- **desvio que o sinal sugere** — quanto um deslocamento global melhoraria.
  Perto de zero significa que não há nada sistemático para consertar.
- **mediana do Whisper** — o que o Whisper acha do desvio. Está aqui só para
  comparação: quando ela discorda muito da coluna anterior, quem erra é o
  Whisper, não nós. Nunca use esta coluna para corrigir nada.
- **palavras fora da voz** — começam a mais de 0.3s de qualquer voz.
- **versos na lista curta** — o que sobrou no OUVIR-PRIMEIRO-v2.md.
- **âncoras** — reparos de ouvido do Erez já registrados em ancoras.json.

## O que depende de gente

1. **Ouvir os 12 versos da lista curta** (OUVIR-PRIMEIRO-v2.md). Para cada um:
   ouvir no conferidor, e se a palavra acender fora da voz, dizer o segundo.
   O reparo vira âncora — e só então roda o alinhador.
2. **Revisão do rabino**: o glossário (42 entradas × 8 línguas) e as regras de
   ritos.json. Documento pronto: revisao-rabino.html.
3. **Direitos**: as entradas `origem=tehilat_hashem` no glossário vieram de
   siddur publicado. Decisão pendente.
4. **As 7 línguas além do português** são rascunho de IA e precisam de revisão
   humana antes de qualquer distribuição.

## O que a máquina nunca faz sozinha

Alterar `ancoras.json`, `cortes.json`, `sync/*.json` ou qualquer texto
litúrgico. Aplicar sugestão de modelo ao `glossario.json`. Quem decide texto
é o rabino; quem decide sincronia é o ouvido do Erez.

