# Kadish — regras de operação

App de Kadish com áudio do rabino sincronizado palavra a palavra.
8 combinações: {ashkenaz, chabad, sefard, sefaradi} × {yatom, derabanan}.
Dados em sync/*.json; áudios cortados em tefila-audio/; originais em "audio completo/".
O dono é o Erez, não-técnico, opera do iPad. Fale simples, em português.

## Checagens (rodar antes e depois de qualquer mudança)

- node checar.mjs         → estrutura, contagem, ritmo. Tem que dar VERDE nos 8.
- node checar-ritos.mjs   → marcas de rito. Tem que dar VERDE nos 8.
- node testar-app.mjs     → o app num Chromium: 8 combinações × 2 formatos.
- node testar-linguas.mjs → a tela inteira nas 8 línguas. VERDE nas 8.
- node testar-telas.mjs   → 7 tamanhos de tela, em pé e deitado. VERDE nas 7.
- node testar-treino.mjs  → Modo Treino e repetição, verso a verso.
- node testar-revisar.mjs → a página de revisão das línguas (revisar.html).
- node testar-contador.mjs → o contador geral do Cloudflare, sem gastar nada.
- node testar-portugues.mjs → o português que o Erez decidiu, nos 8, na tela e
  no arquivo. Não tem lista escrita à mão: lê os recados dele em revisoes/pt-*.txt.
- node testar-sincronia.mjs → a página que mostra a voz (sincronia.html). A
  checagem que importa ali: a conta da página tem que dar o MESMO número de
  suspeitas que a medida do sinal. Se ela acusar demais, o Erez arrasta palavra
  que estava certa e o estrago vai para ancoras.json.
- Nunca dar por concluído sem os dois verdes. Verde ≠ pronto: é "os defeitos
  conhecidos não estão aí".
- As dez rodam sozinhas no GitHub Actions (.github/workflows/checagens.yml) a
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
6. Tudo que aparece na tela existe nas 8 línguas (pt, en, es, fr, it, de, ru, he).
   Texto novo nunca vai escrito direto no HTML: entra em tabela (I18N, SOBRE,
   DEDICATORIA, CONVITE em engine.html; TEXTOS em yahrzeit.js; T em aprender.html
   e em gerar-pdf.mjs), e testar-linguas.mjs confere.
7. Transliteração: o PORTUGUÊS é a original e serve de apoio às outras. Ficou
   anos sem se mexer por decisão do Erez; em 23/08 ele mudou de ideia e pediu
   para conferi-la também, e ela entrou na revisão em revisar.html. Continua
   valendo que só ele decide o que muda ali — o modelo nunca reescreve.
   As outras línguas vêm de fonte humana — os .docx dele, copiados
   verbatim para fontes/transliteracao-por-lingua.json — e entram por
   aplicar-transliteracoes.mjs, nunca escritas pelo modelo. Onde não há fonte
   (sefard inteiro, alemão, e um trecho do sefaradi), a palavra cai para o
   português. Ver TRANSLITERACAO-POR-LINGUA.md, inclusive a pergunta aberta do
   yisgadal x yitgadal, que é do rabino e do ouvido do Erez.

## O fluxo de correção de sincronia (o que funciona)

Desde 23/08 o passo 1 mudou. Ele disse: "queria um sistema mais fácil, pois
difícil saber o motivo das diferenças de sincronia". Agora existe o
**sincronia.html**, que DESENHA a voz do rabino com as palavras em cima. O
motivo de quase toda diferença é um destes três, e os três ficam visíveis:
a palavra caiu num silêncio; várias palavras foram espremidas num bloco de voz
só (ele disse coladas, e o corte entre elas foi calculado); ou a palavra está
perto de um começo de voz mas não em cima dele. Ele arrasta o risco para o
lugar, e a página monta o recado — ela não escreve em lugar nenhum.

O desenho vem pronto de sinal/*.json, escrito por gerar-envelope.py. Rodar de
novo quando um áudio mudar. O limiar de voz ali TEM que ser o mesmo do
sinal.py: na primeira versão não era, e a página acusou 48 suspeitas num Kadish
onde a medida via 6 — ele ia arrastar palavra que estava certa.

1. O Erez abre o sincronia.html, vê o motivo, ouve só aquela palavra e arrasta.
   (Ou, como antes, ouve no conferidor.html e reporta o segundo em texto.)
2. O arrasto encosta sozinho no começo de voz mais próximo quando está a menos
   de 0,06s. O dedo dele aponta; o sinal decide o número exato.
3. Registrar como âncora em ancoras.json ({verso, palavra, inicio, nota}).
4. Rodar: python3 aplicar-ancoras.py --confirmar
   (alinhar-global.py é citado aqui desde o começo mas NUNCA foi commitado —
   vivia fora do repositório. aplicar-ancoras.py não é ele: em vez de
   realinhar o arquivo inteiro, só põe cada âncora no lugar e encosta nela a
   fronteira vizinha. Prova, antes de gravar, que nenhum texto mudou, que os
   tempos continuam subindo e que toda âncora ficou valendo; qualquer falha e
   ele não grava nada. Rodá-lo sobre as 5 âncoras antigas não muda um byte —
   é a prova de que ele é fiel ao que o alinhador tinha feito.)
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

## Ferramentas de medição e de produção

Requerem: pip install numpy soundfile (o áudio é lido direto do .ogg, sem ffmpeg).
Para as que imprimem, também playwright + Chromium.

- sinal.py — módulo. Envelope de energia e inícios de bloco de voz. Só lê áudio.
- medir-desvio.py — a sincronia contra O SINAL, por nussach. É a medida que vale.
  O Whisper NÃO é medida: quando ele discorda do sinal, quem erra é ele.
- gerar-ouvir-v2.py — escreve OUVIR-PRIMEIRO-v2.md, a lista curta de escuta: só
  os versos onde a lista de 20/08, o sinal medido agora e o Whisper concordam.
- gerar-status.py — escreve STATUS.md e metricas-sinal.json. Determinístico de
  propósito (usa a data do último commit, nunca a hora atual), senão o CI entra
  em laço. Rodado sozinho por .github/workflows/status.yml a cada push na main.
- testar-app.mjs — abre o app num Chromium e confere as 8 combinações servindo
  DE SUBDIRETÓRIO, como o GitHub Pages faz. É ali que caminho relativo quebra.
  Sem os navegadores do Playwright baixados: CHROMIUM=/caminho/do/chrome.
- testar-linguas.mjs — abre o app nas 8 línguas e confere que não sobrou
  português na tela, no cartão de yahrzeit nem no arquivo de calendário.
- testar-treino.mjs — o Modo Treino pausa no fim de cada verso, o ▶ retoma de
  onde parou, e a repetição toca o verso o número de vezes pedido. Já quebrou
  duas vezes; existe para não quebrar uma terceira.
- servidor-teste.mjs — servidor estático para os testes, COM suporte a Range.
  Tem que ser ele, não o `python3 -m http.server`: aquele não responde Range, e
  sem Range o navegador não consegue mover o áudio — todo seek cai no zero. O
  testar-treino.mjs chegou a dar verde medindo essa ficção. Ele agora confere o
  servidor na primeira linha e reprova se não servir.
- testar-telas.mjs — 7 tamanhos (iPhone, iPad, computador), em pé e deitado.
  Reprova se algum texto do cabeçalho ficar abaixo de 12px, se um botão ficar
  com menos de 30px de altura, se a página rolar de lado, ou se sobrar menos de
  60% da altura para o Kadish.
- gerar-pdf.mjs — os 8 folhetos imprimíveis, em folhetos/. Sempre com marca
  d'água RASCUNHO — AGUARDANDO REVISÃO RABÍNICA, na língua do folheto. Não tire
  enquanto o rabino não tiver revisado. node gerar-pdf.mjs de → folhetos em
  alemão, com sufixo _de no nome. Os commitados são os de português, que são os
  que vão ao rabino.
- gerar-escolha-rabino.mjs — ESCOLHA-RABINO.pdf/.html e escolha-rabino-itens.json.
- aplicar-ancoras.py — põe em sync/*.json as âncoras de ancoras.json e prova que
  nada mais mudou. Substitui o alinhar-global.py, que nunca foi commitado.
- aplicar-transliteracoes.mjs — põe a transliteração por língua vinda de
  fontes/transliteracao-por-lingua.json. Casa palavra a palavra (o documento
  divide os versos diferente de nós) e só grava se nenhum tempo, hebraico ou
  glosa tiver mudado.

Todas só leem dados. Nenhuma escreve em sync/, ancoras.json, cortes.json ou
glossario.json.

## O caminho da decisão do rabino

1. gerar-escolha-rabino.mjs monta o ESCOLHA-RABINO.pdf a partir do glossário e do
   RELATORIO-REVISAO-GPT.md: só as entradas contestadas, uma por bloco, com as
   duas versões como Opção A e Opção B em ordem embaralhada e sem dizer a origem.
   Só forma par quando o revisor escreveu mesmo uma alternativa comparável —
   nunca inventar uma Opção B para completar simetria.
2. O rabino marca no papel.
3. O Erez digita as escolhas num JSON: {"12":"A","13":"B","37":"texto dele"}.
   O número é o impresso no documento.
4. node aplicar-escolhas.mjs escolhas.json          → ensaio, só mostra
   node aplicar-escolhas.mjs escolhas.json --confirmar → aplica

Dois scripts escrevem no glossario.json, e só com --confirmar: este e o
aplicar-revisao.mjs. Eram um só até 23/08; o segundo entrou quando o Erez
mandou o resultado da revisão do português. Não dava para escrever só em
sync/: o aplicar-glossario.mjs reescreve o texto do verso a partir do
glossário, e a correção dele seria desfeita na rodada seguinte, sem aviso.
A intenção da regra continua de pé — nenhum MODELO escreve texto litúrgico;
os dois scripts só copiam o que um humano decidiu.

aplicar-escolhas.mjs Ele aplica, roda aplicar-glossario.mjs, propaga as glosas para
sync/*.json, PROVA que nenhum tempo, nenhum hebraico e nenhuma âncora mudou, e
roda as duas checagens. Qualquer coisa vermelha e ele desfaz tudo. Não faz push:
mudança de texto litúrgico passa por olho humano antes da main.

## A revisão das línguas pelo Erez

revisar.html. É onde ele confere as línguas que sabe.

A unidade de revisão é o CONTEÚDO, não a posição: a chave de um item é a
palavra hebraica (sem nikud) + a língua + o texto atual. Por isso o mesmo item
aparece uma vez só, mesmo estando nos 8 kadishim — e o que ele marcar vale para
todos. "Amen" está 36 vezes nos arquivos e aparece 2 vezes na tela (uma para a
transliteração, uma para a tradução da palavra).

Isso encolhe o trabalho: 6.520 palavras nos 8 arquivos viram **270 itens por
língua** (272 em português, 155 em alemão e hebraico, que não têm
transliteração ali).

O português também está na lista: o Erez é a autoridade nele e as traduções
portuguesas ainda são rascunho. Desde 23/08 a transliteração portuguesa entra
junto, a pedido dele — antes ficava de fora. Ali não existe "falta fonte": a
transliteração portuguesa é a original, toda palavra já tem a sua.

Três coisas são revisáveis: a tradução do verso, a tradução da palavra e a
transliteração.

A glosa de uma palavra NÃO é uma-para-uma com a frase (regra dele, 23/08): ela
pode cobrir duas ou mais palavras. "uvizmán" fica "e em" e "kariv" fica
"breve", que juntas dão "e em breve". Nunca criar checagem que cobre 1:1 ali —
eu tentei uma como pista e ela acusou 45 falsos.

O que ele manda de volta entra por **aplicar-revisao.mjs**:
  node aplicar-revisao.mjs revisoes/pt-2026-08-23.txt              → ensaio
  node aplicar-revisao.mjs revisoes/pt-2026-08-23.txt --confirmar  → aplica
Casa por conteúdo (mesma chave da página), escreve em sync/*.json E no
glossário, e PROVA antes de gravar que nenhum tempo, nenhum hebraico, nenhuma
âncora e nenhuma das outras 7 línguas mudou. O recado fica commitado em
revisoes/ como registro. O que ele precisa decidir antes de entrar fica em
revisoes/<arquivo>-adiados.json, com o motivo escrito.

Os recados se chamam pt-<data>-a.txt, -b, -c… A LETRA IMPORTA: um recado pode
desdizer o anterior (o "emenaa → emenada → emanada" levou três rodadas), e o
testar-portugues.mjs lê os arquivos em ordem alfabética para saber qual é a
última palavra dele. Um recado salvo sem letra vai parar no fim do sort e a
conta sai errada.

O app aceita ?lang=pt no endereço, e isso manda mais que a língua guardada no
aparelho. Existe só para poder testar: sem isso, um link não garante a língua.
Quem reza nunca vê — a língua continua vindo do aparelho.

As 20 palavras sem fonte (vesava, vishua…) ENTRAM na conta, por decisão do Erez
(21/08): ele mesmo é a fonte humana que faltava. Ali os botões são outros —
"Escrever" ou "Deixar em português" — e o recado separa o que ele escreveu do
que ele corrigiu, para a origem ficar registrada. Alemão e hebraico não têm
linha de transliteração no app e por isso não pedem nada disso; sem essa regra,
o alemão pedia as 113 palavras a mão.

"Só o que falta" (ligado por padrão) esconde o que já está resolvido — o que
ficou certo, e a palavra que ele decidiu deixar em português. O que espera
texto continua na tela; escondê-lo tirava a caixa no mesmo toque que a abria.

Tudo fica no aparelho (localStorage), por língua. No fim, o botão monta um
recado em português para ele copiar e mandar.

A página SÓ LÊ os sync/*.json. Não escreve em lugar nenhum — mudança de texto
continua passando por decisão humana, e o glossário só muda por
aplicar-escolhas.mjs.

## O contador de Kadishim

contador.js + contador.html. A conta de cada aparelho já funciona: fica no
localStorage, não sai do aparelho, não identifica ninguém, e um Kadish só conta
quando o áudio passa de 90% do último verso. Não aparece nada na tela de quem
reza — quem vê é o Erez, em contador.html.

O total geral (por país, por língua) precisa de serviço fora do GitHub Pages.
O Erez decidiu por Cloudflare (21/08). Está tudo pronto em contador-cloudflare/:
worker.js (o programinha), schema.sql (a tabela) e COMO-LIGAR.md (passo a passo
pelo navegador, do iPad). Falta ele criar a conta e passar o endereço.

O envio continua DESLIGADO: enquanto ENDERECO_GERAL em contador.js for string
vazia, nada sai do aparelho. Ligar é só pôr o endereço ali.

node testar-contador.mjs → roda o worker sobre o SQLite do próprio Node, com um
adaptador que imita o D1. Prova soma atômica, recusa de lixo, e que o banco não
guarda IP nem hora. Também confere que o SQL do COMO-LIGAR.md é o mesmo do
schema.sql — se saírem de sincronia, o Erez monta a tabela errada e nada
funciona, sem mensagem de erro. Não gasta nada; roda em segundos.

O worker guarda SÓ: país · nussach · tipo · língua · dia · quantos. Nunca
acrescentar IP, identificador de aparelho, hora ou qualquer coisa que volte a
uma pessoa — é a razão de ter sido escolhido em vez do Google Analytics.

## Pendências de conteúdo (não são de código)

- Revisão do rabino: glossario.json (42 entradas × 8 línguas) e as regras de
  ritos.json. O documento que vai ao rabino é o ESCOLHA-RABINO.pdf.
  (O CLAUDE.md citava revisao-rabino.html; esse arquivo nunca existiu no
  repositório — mesmo caso do alinhar-global.py.)
- Direitos: entradas origem=tehilat_hashem no glossario vieram de siddur
  publicado; decisão pendente. As 7 línguas além do pt são rascunho de IA
  (origem=claude) — precisam de revisão humana.
- Ouvir os 12 versos de OUVIR-PRIMEIRO-v2.md — a lista curta, onde a auditoria
  de 20/08, o sinal e o Whisper concordam. O OUVIR-PRIMEIRO.md (v1, 36 suspeitos
  em 28 versos) fica como registro do que foi medido.
- Levar o ESCOLHA-RABINO.pdf ao rabino (170 itens, 60 páginas).

## Nunca

- git push --force
- alterar checar.mjs/checar-ritos.mjs para silenciar um vermelho
- deixar o ChatGPT (ou qualquer modelo) escrever direto no glossario.json
- deixar o Whisper (ou qualquer modelo) escrever nos sync/*.json ou nas âncoras
- afrouxar o prompt da revisão cega para produzir mais apontamentos
- gravar arquivos de texto em UTF-16 (foi um `echo >>` do PowerShell em UTF-16
  no .gitignore que quebrou o repositório uma vez — todo texto em UTF-8)
