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
- As duas rodam sozinhas no GitHub Actions (.github/workflows/checagens.yml) a
  cada push na main e em todo pull request. Qualquer vermelho reprova o
  workflow. Isso não substitui rodar antes de commitar — só impede que um
  vermelho passe despercebido.

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

## Revisão cega do glossário por ChatGPT

revisar-glossario-gpt.mjs + .github/workflows/revisao-glossario.yml. É uma
segunda opinião automática sobre o glossário, para o rabino não ser o único par
de olhos. Regras, todas invioláveis:

1. Revisa APENAS o glossário (42 entradas × 8 línguas). Nunca sincronia, nunca
   áudio, nunca código.
2. Às cegas: cada chamada manda só o hebraico, a transliteração e o texto de UMA
   língua. O revisor não sabe quem escreveu (o campo `origem` nunca é enviado) e
   não vê as outras línguas. Auditar com:
   node revisar-glossario-gpt.mjs --exemplo de   (mostra o prompt exato)
3. Rubrica fixa por entrada e língua: erro de sentido, palavra errada, gramática
   da língua-alvo. Resposta: "ok" ou o problema com citação literal. A citação
   vale se vier do texto traduzido OU da palavra hebraica de origem (apontar pelo
   hebraico é jeito legítimo de dizer qual glosa está errada, e o relatório marca
   quando foi assim). Só é descartada quando não existe em nenhum dos dois.
   Nunca afrouxar mais que isso: se o revisor estiver citando errado, o conserto
   é no prompt, não no guarda.
4. Proibido cota de defeitos. O prompt manda dizer que está correto quando
   estiver correto. Nunca reescrever o prompt para "achar mais coisa".
5. Saída: RELATORIO-REVISAO-GPT.md, commitado, escrito para humano ler.
6. O ChatGPT nunca altera arquivo nenhum. O script só escreve o relatório.
   Mudança de texto é decisão humana; a autoridade final é o rabino (regra 5 das
   invioláveis continua valendo).
7. Modelo barato (OPENAI_MODEL, padrão gpt-4o-mini), uma rodada por mudança do
   glossario.json, nunca em loop. O commit do relatório não mexe no
   glossario.json, então não se re-dispara.

Apontamento do ChatGPT não é defeito comprovado: é pergunta para levar ao
rabino. O workflow passa mesmo com apontamentos — de propósito.

Testar sem gastar API: node revisar-glossario-gpt.mjs --ensaio

## Revisão auditiva do áudio por Whisper

revisar-audio-whisper.mjs + .github/workflows/revisao-audio.yml. Roda quando
sync/*.json ou os áudios de tefila-audio/ mudam. Regras, todas invioláveis:

1. Transcreve os 8 áudios pela API de transcrição da OpenAI, língua hebraico,
   com timestamp por palavra (WHISPER_MODEL, padrão whisper-1 — é o que devolve
   tempo por palavra).
2. Compara com os nossos sync/*.json em dois eixos: palavra ouvida que não está
   no texto / palavra do texto que não foi ouvida; e início de palavra divergindo
   mais de LIMIAR_SEGUNDOS (padrão 0,6s).
3. Saída: RELATORIO-AUDIO-WHISPER.md, commitado, agrupado por nussach e verso,
   em português simples. Cruza com OUVIR-PRIMEIRO.md e destaca onde os dois
   métodos concordam — é por aí que se começa a ouvir.
4. NUNCA altera sync/*.json, ancoras.json nem cortes.json. O workflow confere
   isso num passo próprio e reprova se algum desses arquivos foi tocado.
5. Uma rodada por mudança, nunca em loop. O commit do relatório não toca em
   sync/ nem em tefila-audio/, então não se re-dispara.

O Whisper erra em aramaico litúrgico: confunde palavra curta com respiração e
junta palavras. Apontamento dele é "vale a pena ouvir este trecho", nunca "está
errado". Continua valendo a regra 1 das invioláveis: o reparo vira âncora só
depois que o Erez ouviu e deu o segundo.

Testar sem gastar API: node revisar-audio-whisper.mjs --ensaio
(a transcrição é simulada a partir dos nossos próprios JSONs, com defeitos
plantados, para conferir alinhamento e relatório.)

## Pendências de conteúdo (não são de código)

- Revisão do rabino: glossario.json (42 entradas × 8 línguas) e as regras de
  ritos.json. Documento pronto: revisao-rabino.html.
- Direitos: entradas origem=tehilat_hashem no glossario vieram de siddur
  publicado; decisão pendente. As 7 línguas além do pt são rascunho de IA
  (origem=claude) — precisam de revisão humana.
- Ouvir os 8 nussachim inteiros. Lista dirigida: OUVIR-PRIMEIRO.md (36
  suspeitos em 28 versos, auditoria de sinal de 20/08), cruzada
  automaticamente com o RELATORIO-AUDIO-WHISPER.md.

## Nunca

- git push --force
- alterar checar.mjs/checar-ritos.mjs para silenciar um vermelho
- deixar o ChatGPT (ou qualquer modelo) escrever direto no glossario.json
- deixar o Whisper (ou qualquer modelo) escrever nos sync/*.json ou nas âncoras
- afrouxar o prompt da revisão cega para produzir mais apontamentos
- gravar arquivos de texto em UTF-16 (foi um `echo >>` do PowerShell em UTF-16
  no .gitignore que quebrou o repositório uma vez — todo texto em UTF-8)
