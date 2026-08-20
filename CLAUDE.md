# Kadish — regras de operação

App de Kadish com áudio do rabino sincronizado palavra a palavra.
8 combinações: {ashkenaz, chabad, sefard, sefaradi} × {yatom, derabanan}.
Dados em sync/*.json; áudios cortados em tefila-audio/; originais em "audio completo/".
O dono é o Erez, não-técnico, opera do iPad. Fale simples, em português.

## Checagens (rodar antes e depois de qualquer mudança)

- node checar.mjs        → estrutura, contagem, ritmo. Tem que dar VERDE nos 8.
- node checar-ritos.mjs  → marcas de rito. Tem que dar VERDE nos 8.
- Nunca dar por concluído sem os dois verdes. Verde ≠ pronto: é "os defeitos
  conhecidos não estão aí".

## Regras invioláveis

1. ancoras.json = reparos DE OUVIDO do Erez. Nunca sobrescrever, nunca realinhar
   sem eles. alinhar-global.py os respeita por construção.
2. cortes.json = pontos de corte dos áudios, conferidos de ouvido. Nunca
   recalcular automaticamente (o automático errou 2 de 8).
3. Nunca apagar, pular ou afrouxar uma checagem para "passar".
4. Antes de pedir ao Erez para reouvir: baixar o raw.githubusercontent do arquivo
   e conferir que o número mudou. Três rodadas já foram perdidas por pular isso.
5. Texto litúrgico: a autoridade é o siddur impresso e o rabino, nunca o modelo.
   Fontes por nussach em fontes/LIVROS.md.

## O fluxo de correção de sincronia (o que funciona)

1. O Erez ouve no conferidor.html e reporta em linguagem natural, idealmente com
   o segundo: "tushbechata começa aos 51s".
2. Medir os blocos de voz do trecho (ffmpeg + envelope de energia; ver
   alinhar-global.py, função blocos_de_voz). O ouvido dele aponta, o sinal decide
   o número exato.
3. Registrar como âncora em ancoras.json ({verso, palavra, inicio, nota}).
4. Rodar: python3 alinhar-global.py   (requer: pip install numpy --break-system-packages;
   ffmpeg no PATH; os áudios de tefila-audio/).
5. node checar.mjs → verde. Commit + push. Verificar no raw. Só então avisar o Erez.

## Como o alinhamento funciona

alinhar-global.py detecta os blocos de voz do arquivo INTEIRO (o rabino articula
quase palavra por palavra) e distribui as palavras por programação dinâmica com
peso = sílabas (contadas pelo nikud). Testa duas granulações de bloco e fica com
a de ritmo mais plausível. Âncoras são restrições rígidas. Fronteiras de verso
derivam das palavras.

## Pendências de conteúdo (não são de código)

- Revisão do rabino: glossario.json (42 entradas × 8 línguas) e as regras de
  ritos.json. Documento pronto: revisao-rabino.html.
- Direitos: entradas origem=tehilat_hashem no glossario vieram de siddur
  publicado; decisão pendente. As 7 línguas além do pt são rascunho de IA
  (origem=claude) — precisam de revisão humana.
- Ouvir os 8 nussachim inteiros (lista dirigida: SUSPEITOS-PARA-OUVIR.txt).

## Nunca

- git push --force
- alterar checar.mjs/checar-ritos.mjs para silenciar um vermelho
- gravar arquivos de texto em UTF-16 (foi um `echo >>` do PowerShell em UTF-16
  no .gitignore que quebrou o repositório uma vez — todo texto em UTF-8)
