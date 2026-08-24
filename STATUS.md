# STATUS — Kadish

Gerado por `gerar-status.py` no commit `876e1da`, de 24/08/2026 20:42.
Atualizado sozinho pelo GitHub Actions a cada push na main.

## As checagens

- **checar.mjs** — 🟢 VERDE · VERDE: os 8 passaram
- **checar-ritos.mjs** — 🟢 VERDE · VERDE: marcas de rito conferem nos 8

Verde não quer dizer pronto. Quer dizer que os defeitos que a gente já
sabe procurar não estão aí.

## As revisões automáticas

| Revisão | Último relatório | O que ela olha |
| --- | --- | --- |
| ChatGPT (glossário) | 24/08/2026 15:08 | as 42 entradas × 8 línguas, às cegas |
| Whisper (áudio) | 24/08/2026 15:07 | os 8 áudios contra os sync/*.json |

Nenhuma das duas altera arquivo nenhum. As duas são opinião de máquina.

## Os 8 nussachim

| Nussach | Palavras em cima da voz | Desvio que o sinal sugere | Mediana do Whisper | Palavras fora da voz | Versos na lista curta | Âncoras |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| ashkenaz_yatom | 59/75 (78.7%) | -0.14s | -0.72s | 12 | 2 | 5 |
| ashkenaz_derabanan | 90/118 (76.3%) | -0.14s | — | 26 | 2 | 0 |
| chabad_yatom | 70/80 (87.5%) | -0.04s | -1.04s | 10 | 0 | 21 |
| chabad_derabanan | 110/121 (90.9%) | -0.14s | — | 9 | 0 | 0 |
| sefard_yatom | 65/81 (80.2%) | -0.14s | — | 15 | 3 | 0 |
| sefard_derabanan | 108/124 (87.1%) | -0.14s | — | 13 | 3 | 0 |
| sefaradi_yatom | 77/91 (84.6%) | -0.14s | — | 14 | 2 | 0 |
| sefaradi_derabanan | 109/125 (87.2%) | -0.14s | — | 12 | 0 | 0 |
| **total** | | | | **111** | **12** | **29** |

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

