# Kadish — regras de operação

App de Kadish com áudio do rabino sincronizado palavra a palavra.
8 combinações: {ashkenaz, chabad, sefard, sefaradi} × {yatom, derabanan}.
Dados em sync/*.json; áudios cortados em tefila-audio/; originais em "audio completo/".
O dono é o Erez, não-técnico, opera do iPad. Fale simples, em português.

## Checagens (rodar antes e depois de qualquer mudança)

- node checar.mjs         → estrutura, contagem, ritmo. Tem que dar VERDE nos 8.
- node checar-ritos.mjs   → marcas de rito. Tem que dar VERDE nos 8.
- node testar-app.mjs     → o app num Chromium: 8 combinações × 2 formatos.
- node testar-linguas.mjs → a tela inteira nas 8 línguas. VERDE nas 8. Desde
  01/09 confere também que **toda chave data-i18n da tela existe nas 8 tabelas** —
  o applyI18n ignora em silêncio a chave que falta, e o português do HTML fica
  na tela sem nada acusar. Foi assim que "Voz do dispositivo" e "Silencioso"
  ficaram em português nas 8 desde sempre.
- node testar-camadas.mjs → a fita das camadas no alto e as três linhas do ⚙.
  A pergunta que importa: **os dois dizem a mesma coisa?** Este projeto já pagou
  caro por duas contas para a mesma pergunta. Confere também o ciclo
  Normal → Destaque → Ocultar, que só uma camada fica em destaque, que a escolha
  sobrevive a recarregar, e que aparelho novo abre com as três em Normal.
- node testar-dedicatoria.mjs → o "Em memória de" e o convite que o substitui
  quando está vazio: aparece nas 8 línguas (e não em português nas 8), fica
  antes do primeiro verso, nunca aparecem os dois, some ao preencher o nome e
  volta ao apagá-lo.
- node testar-telas.mjs   → 7 tamanhos de tela, em pé e deitado, **nos DOIS modos**
  (reza e treino, no mesmo carregamento). VERDE nas 14 medidas. Desde 01/09 ele
  aperta o Treino: media só a reza, e por isso ninguém via que no iPhone deitado
  o treino deixava só 52% da tela para o Kadish — abaixo do piso de 60%.
  Desde 02/09 ele também **ROLA a página 900px e cobra que a barra de cima
  fique**. Nenhuma checagem rolava, e foi por isso que a barra nunca ter grudado
  no celular passou despercebido por semanas.
- node testar-treino.mjs  → Modo Treino e repetição, verso a verso.
- node testar-revisar.mjs → a página de revisão das línguas (revisar.html).
- node testar-contador.mjs → o contador geral do Cloudflare, sem gastar nada.
- node testar-portugues.mjs → o português que o Erez decidiu, nos 8, na tela e
  no arquivo. Não tem lista escrita à mão: lê os recados dele em revisoes/pt-*.txt.
- node checar-sincronia.mjs → a sincronia dos 8 num comando só, sem navegador:
  verso errado · fora da voz · colada · partida · muda · engolindo · corrida, e
  quanto concorda com o que o Whisper ouviu. É o "testar tudo" que o Erez pediu.
  A coluna que MAIS importa é a primeira, e ela é de 24/08: **verso errado** =
  a palavra é ouvida num verso e mostrada noutro. É a queixa dele, na letra
  dele: "yishtabah continua falado na linha 8 e aparecendi na linha 9". As
  outras seis só sabem ONDE há voz; essa é a única que sabe QUAL palavra soa.
  Tem que dar ZERO nos 8. Em 24/08 dava 83.
  Um apontamento sobrevive de propósito, e é o Whisper errando: no
  sefard_derabanan ele corta o "amên" do verso 7 aos 26,50 e começa o "Yehê"
  ali. O sinal diz outra coisa — o bloco do amên vai de 26,16 a 26,54 e a voz
  seguinte só abre aos 27,76, que é onde o Yehê está. É o mesmo caso do
  chabad_yatom, onde o Erez ancorou de ouvido e provou o ponto. Não afrouxei a
  conta para zerar isso: a coluna acusa, e quem julga é o ouvido dele. Se a
  transcrição for refeita, este número pode ir e voltar entre 0 e 1.
- node medir-fim-da-voz.py → escreve fim-da-voz.json: onde a VOZ de cada verso
  acaba. Rodar de novo se um áudio ou um sync mudar. Só lê sinal/ e sync/.
- node trava-sincronia.mjs → a sincronia é a mesma que ele aprovou? Confere os
  tempos de todas as palavras dos 8 E o módulo SYNC do engine.html. É a regra 0
  das invioláveis com dentes. VERMELHO = alguém mexeu na sincronia sem ele.
- node checar-trocas.mjs → trocar de Kadish e de modo NO MEIO da reza, oito
  trocas seguidas sem recarregar a página. Nenhuma outra checagem trocava de nada
  com o app rodando, e foi por isso que "trocar o tipo de Kadish" ficou quebrado
  sem ninguém ver. GROSSO=0.25 roda com o relógio grosso do iOS.
  O conserto entrou na v19, **saiu na v20** (a v19 dessincronizou o aparelho dele
  e ele mandou voltar) e **voltou na v22**, agora escrito FORA do módulo SYNC:
  trocar de Kadish é trabalho dos BOTÕES, e quem reposiciona é o
  `SYNC.voltarAoInicio()`, que já existia. A `trava-sincronia.mjs` fica verde.
- node checar-plataformas.mjs → o app com o navegador ESTRAGADO DE PROPÓSITO, de
  cinco jeitos que aparelhos de verdade estragam: relógio grosso (250ms, iOS),
  busca lenta (400ms), busca desviada, retomada lenta, tela de 30fps. Cobra três
  coisas: a voz começa DENTRO da primeira palavra, não vaza para o verso
  seguinte, e a palavra acesa é a que está soando (medida pelo relógio real).
  **Não prova que o iPad dele está consertado** — rodei os cinco perfis contra o
  relato de 28/08 e nenhum o reproduziu. Ler o cabeçalho do arquivo antes de
  confiar num verde dele.
- node testar-sincronia.mjs → a página que mostra a voz (sincronia.html). A
  checagem que importa ali: a conta da página tem que dar o MESMO número de
  suspeitas que a medida do sinal. Se ela acusar demais, o Erez arrasta palavra
  que estava certa e o estrago vai para ancoras.json.
- Nunca dar por concluído sem os dois verdes. Verde ≠ pronto: é "os defeitos
  conhecidos não estão aí".
- As onze rodam sozinhas no GitHub Actions (.github/workflows/checagens.yml) a
  cada push na main e em todo pull request. Qualquer vermelho reprova o
  workflow. Isso não substitui rodar antes de commitar — só impede que um
  vermelho passe despercebido.

## Regras invioláveis

0. **A SINCRONIA SÓ MUDA COM AUTORIZAÇÃO DELE.** Em 30/08, depois de eu subir
   três mudanças de comportamento em dois dias e quebrar o que estava bom, ele
   disse: *"voltou ao normal, está perfeito. salve as sincronizações do áudio com
   o texto tanto no modo reza como treino e só altere com minha autorização"*.
   Promessa não vale — eu já quebrei isto sem perceber. Por isso existe a
   **trava-sincronia.mjs**, que guarda a impressão digital do que ele aprovou:
   os 1.630 números de tempo das 815 palavras dos 8, o módulo SYNC inteiro do
   engine.html (1.068 linhas), e onde o Modo Treino para. Ela fica VERMELHA se
   qualquer um deles mudar — provado com um centésimo de segundo numa palavra e
   com uma linha de código. Ela não impede mudança; impede mudança CALADA.
   Quando ele autorizar: `node trava-sincronia.mjs --regravar "o que ele
   autorizou"`, e o motivo fica no histórico do arquivo.

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
novo quando um áudio mudar. O limiar de voz ali TEM que ser o mesmo do sinal.py:
na primeira versão não era, e a página acusou 48 suspeitas num Kadish onde a
medida via 6 — ele ia arrastar palavra que estava certa.

**Ao mexer em sync/ ou em sinal/, mudar a constante DADOS no sincronia.html.**
Ela vai no endereço pedido (?d=...) e aparece na tela. Sem isso o GitHub Pages
devolve o JSON de ontem e o Erez continua vendo defeito já consertado — o
Ctrl+Shift+R do navegador não fura aquele cache. Aconteceu com o raba do
chabad_derabanan: página nova, dados velhos, e ele reclamando com razão. Marca
nova também joga fora o que ele tinha arrastado, que foi decidido sobre outros
números.

Além dos três motivos acima, a página acusa três coisas que a MEDIDA não vê —
porque o medir-desvio.py olha o COMEÇO de cada palavra, e nestas o errado é o
fim: palavra **partida ao meio** (acaba no meio de um bloco de voz; ele ouve só
um pedaço), palavra **muda** (não há voz nenhuma dentro dela) e palavra
**engolindo** (dentro dela há silêncio grande e depois mais voz). O Erez achou
as três de ouvido antes de existir detector: "só dá para ouvir o último A do
tushbechata", "só dá para ouvir o 'ra' do raba", "o chirute para no chir'u".
Elas têm conta própria e NÃO entram em "para olhar", que continua sendo a mesma
da medida — a página nunca pode acusar mais que o sinal.

**Uma linha só, e o fio final do bloco (24/08, à noite).** A primeira tentativa
cortou a fita em faixas de 10s "só para caber no papel" — e ainda cortava: uma
palavra na emenda aparecia pela metade. Ele viu em minutos: *"algumas palavras
cortam no meio como purkane, só vejo o áudio de pur..."*. Agora é UM desenho do
começo ao fim, que rola de lado por dentro (a página não rola). Há checagem
disso no testar-sincronia.mjs, para não voltar atrás.

O mesmo recado apontou um defeito de dados, e grave: **encostar a palavra para
TRÁS punha o marcador no fio final da voz da vizinha.** O purkanêh do
chabad_yatom foi ouvido aos 11,20 (no silêncio); a voz dele abre aos 11,54, a
0,34s — um triz além do alcance de 0,30 que eu tinha posto. Sem alcance para a
frente, ele recuou para 11,08, os últimos 0,02s do bloco do veyatsmách. Tocar a
palavra dava o rabo do veyatsmách, silêncio, e só então o purkanêh. Eram 234
palavras assim nos 8. A voz de uma palavra vem SEMPRE depois do marcador que
caiu no silêncio — o rabino ainda não a disse. Então o alcance para a frente
passou a 0,45s e o de trás a 0,12s.

E a regra do "está na voz" deixou de ser um número fixo: no fio final do bloco a
voz já é da palavra de trás morrendo, mas muitos blocos deste rabino são mais
curtos que 0,10s (ele articula sílaba a sílaba), e um corte fixo condenaria o
bloco inteiro. Vale o menor entre 0,10s e METADE do bloco. A regra está escrita
igual em três lugares — checar-sincronia.mjs, sincronia.html (coladaNaDeTras) e
o realinhador.

O "verso errado" também ganhou limiar por palavra: o maior entre 0,35s e a
DURAÇÃO da palavra. Roçar a fronteira do verso não é trocar de linha; trocar de
palavra é o marcador andar mais do que a própria palavra dura. Não afrouxou: o
arquivo quebrado de 24/08 de manhã continua acusando 43, e o de agora dá zero.

**A fita contínua também na página (24/08).** Ela desenhava UM quadro por verso,
cada um com a sua janela e a sua escala. Duas consequências, e ele bateu nas
duas: uma palavra que SOA no verso de cima aparecia no quadro do verso de baixo,
e ali não havia como arrastá-la para trás — aquele instante nem existia naquela
janela; e dois versos seguidos não se encaixavam, então a fronteira entre eles
era invisível. Ele disse: "quero que a sincronia seja feita não por linha, mas
de forma contínua, assim não ocorrerão os erros relatados". Agora a tela é UMA
fita do Kadish inteiro, cortada em faixas de 10s só para caber no papel, na
mesma escala do começo ao fim. A fronteira de verso virou o que ela é: um risco
tracejado com o número. Qualquer palavra pode ir para qualquer lugar, inclusive
para dentro do verso vizinho. O "só o suspeito" deixou de esconder faixas
(esconder é o oposto de contínuo) e passou a mandar na LISTA do alto, que leva
até cada palavra. Os controles por verso (ouvir · empurrar · desfazer) saíram
de dentro do desenho e viraram uma lista no fim.

1. O Erez abre o sincronia.html, vê o motivo, ouve só aquela palavra e arrasta.
   (Ou, como antes, ouve no conferidor.html e reporta o segundo em texto.)
2. O arrasto encosta sozinho no começo de voz mais próximo quando está a menos
   de 0,06s. O dedo dele aponta; o sinal decide o número exato.
3. Registrar como âncora: **node aplicar-recado.mjs recados/<arquivo>.txt**
   (ensaio; --confirmar grava). Ele lê o recado que a página monta e faz, toda
   vez, a mesma conferência: o "estava" de cada linha tem que bater com o
   arquivo de agora — se não bater, ele estava vendo dados velhos e o recado
   inteiro é recusado; o nome da palavra tem que bater; e onde ele pôs é
   classificado (em cima da voz · dentro de um bloco, que é palavra colada ·
   no silêncio). No silêncio vale a regra de sempre: encosta no começo de voz
   até 0,12s e grava o número dele em inicio_que_ele_deu. Se já havia âncora
   naquela palavra, a nova ganha — a palavra mais recente dele é a que vale —
   e a velha vai para _substituidas com o motivo. Foi assim com o tushbechata
   do ashkenaz_yatom: em 21/08 ele ancorou em 50,56; em 24/08, vendo a fita,
   pôs em 51,46, e o sinal está do lado do novo (50,56~50,64 dura 0,08s, é a
   respiração que ele mesmo desconfiava). O recado fica commitado em recados/.
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

## O erro que durou dias, e o conserto (24/08)

O Erez reclamou seis vezes de palavra no verso errado — tushbechata, raba,
chir'utêh, meshichêh, veyitpaar, veyishtabach, yitbarach — e TODAS as contas
diziam 100%. Ele estava certo as seis vezes.

**Ritmo não distingue o alinhamento certo do deslocado uma palavra.** Um arquivo
inteiro escorregado passa em tudo: cada palavra continua caindo num começo de
voz, continua tendo voz dentro, continua com duração plausível. Nota máxima num
arquivo errado do começo ao fim.

O que faltava era uma testemunha do CONTEÚDO: quem diz QUAL palavra soa em cada
segundo. Isso é a transcrição crua do Whisper, agora commitada em whisper/*.json
pelo workflow da revisão auditiva. Ela não é medida — o número exato continua
vindo do sinal —, mas é a única coisa que sabe o nome da palavra.

O mecanismo do erro tinha um nome: **palavra colada**. O rabino diz "Yehê shemê"
num fôlego só e o sinal vê UM bloco. Obrigando cada palavra a começar num começo
de bloco, o shemê era empurrado para o bloco seguinte e tudo depois dele
escorregava uma palavra. Agora: quando há bloco próprio, o sinal dá o número;
quando não há, vale o instante ouvido. Cada um diz o que sabe.

Duas armadilhas apareceram no conserto, e as duas estão escritas no código:

1. **Palpite não empurra testemunha.** O Whisper partiu "almayá" em duas e não
   a reconheceu. Órfã, ela tomou o começo de voz do "Yitbarêch" — que ele TINHA
   ouvido — e o empurrou 0,6s para a frente, ficando ela mesma com 0,10s de
   duração. Órfã agora só ocupa o buraco de tempo entre duas ouvidas. E nenhuma
   palavra pode acabar com menos de 0,20s: se acabar, é atropelo e não grava.
2. **As contas de ritmo estavam perguntando a coisa errada.** Enquanto o
   alinhador empurrava tudo para começos de bloco, elas davam zero — e era esse
   empurrão o defeito. Corrigido ele, "fora da voz" acusou 71 num Kadish que
   acabara de ficar certo. Não se afrouxou nada: a pergunta mudou. Começar
   DENTRO da voz, colada na de trás, é o certo; começar no SILÊNCIO é que é
   defeito. "partida" passou a olhar o fim do VERSO (é o verso que ele toca no
   app, e as queixas dele sempre foram de verso). "muda" passou a perguntar se
   há algum pedaço de voz dentro da palavra, em vez de se o MEIO de um bloco cai
   dentro dela. As três regras estão escritas igual em três lugares —
   checar-sincronia.mjs, sincronia.html e testar-sincronia.mjs. Se saírem de
   sincronia, a página volta a mentir para ele.

O resultado: concordância com o que o Whisper ouviu passou de 38–92% para
100% (ou 1 palavra a menos) nos 8, e "verso errado" foi de 83 para 0.

**O chabad_yatom também foi realinhado**, mesmo ele tendo dito que estava certo.
As 21 âncoras dele ficaram no lugar exato — o script prova isso antes de gravar —
e as 2 palavras que discordavam do ouvido entraram na linha. Se ele quiser
desfazer, é `git revert` do commit e nada mais se perde.

## A fita contínua (24/08) — como o destaque anda no app

O áudio sempre foi UM arquivo, tocado do começo ao fim. O que era por verso era
a BUSCA do destaque, no engine.html, e ela tinha duas etapas: primeiro "que
verso o relógio está pisando?", depois "que palavra dentro dele?".

Isso fazia da fronteira do verso uma autoridade separada, que podia discordar
das palavras. Discordando 0,2s, o destaque passava esse tempo aceso na palavra
do verso vizinho — a queixa do Erez em pessoa. E quando a segunda etapa não
achava palavra nenhuma, ela desistia e o destaque CONGELAVA até o verso seguinte.

Ele pediu: "que a sincronia seja contínua". Agora há UMA fita com todas as
palavras em fila e uma busca só — qual palavra soa neste segundo. **O verso
deixou de mandar e passou a ser consequência: é o verso daquela palavra.**
Palavra e linha não podem mais discordar, porque não há mais duas contas.

Isso vale porque as palavras se encostam do começo ao fim (o fim de cada uma é
o começo da seguinte — o realinhador garante, e há prova disso rodando junto
com as checagens). Se algum dia deixarem de se encostar, a fita continua
funcionando: num buraco ela mantém acesa a última palavra, em vez de congelar.

O Modo Treino e a repetição continuam por verso — o que muda é de onde vem o
número do verso.

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
- versao.json + a constante VERSAO no engine.html → a pagina se desatualiza
  sozinha. O iPad do Erez ficou preso na copia de ontem: no computador a versao
  nova aparecia, nele nao, e tudo o que eu consertava simplesmente nao chegava —
  ele testava, via o defeito de sempre e dizia "nada mudou". O versao.json e
  buscado sem cache nenhum; se discordar da constante gravada dentro do
  engine.html, a pagina se recarrega num endereco novo, que o cache e obrigado a
  buscar. **TROCAR OS DOIS JUNTOS a cada mudanca que ele va testar**, e o numero
  aparece NO ALTO DA TELA, sem abrir nada, para ele conferir de olho (esteve so
  dentro dos Ajustes e ele nao o achou duas vezes; escondido nao servia). O que
  a barra mostra sai da constante — nunca escrever um numero a mao no HTML, que
  e o jeito de a tela mentir no dia em que alguem esquecer de troca-lo.

  **O versao.json carrega DUAS marcas, e cada uma serve a uma pagina:**
  `versao` e a do app (engine.html, constante VERSAO); `marca` e a dos DADOS de
  sincronia (sincronia.html, constante DADOS, muda quando sync/ ou sinal/ mudam).
  Em 26/08 eu reescrevi o arquivo so com a primeira e apaguei a segunda — o aviso
  de "ha versao nova" do sincronia.html ficou morto por dois commits, calado, e
  so o testar-sincronia.mjs pegou. Nunca reescrever esse arquivo inteiro sem
  olhar o que ja esta la. O testar-treino.mjs agora confere as duas.

- checar-treino-fita.mjs → o Modo Treino medido NA FITA, tocando o audio de
  verdade. Os outros testes olham o app por dentro; este grava a posicao do audio
  quadro a quadro e pergunta o que o OUVIDO pega: vazou som depois do fim do
  passo? ficou pedaco da fita sem tocar? a parada caiu numa fronteira? E confere
  que entrar no Modo Treino volta para a primeira palavra.

  **O relogio do audio nao serve para saber quando o passo acaba.** No iOS o
  currentTime salta de ~250 em 250 ms, mesmo lendo 60 vezes por segundo: medido,
  o verso 1 do chabad_derabanan acaba em 4,380 e o audio soava ate 4,512 — 132 ms
  de "bealma" escapando, o "be" que o Erez ouvia. Nenhuma melhora na BUSCA
  conserta isso; o atraso nao esta na volta, esta em ficar sabendo. Por isso o
  fim do passo e AGENDADO por relogio de parede a partir de uma posicao conhecida,
  e o relogio do audio so serve de piso (ele nunca adianta) e de ancora nos
  instantes em que VIRA — que e quando ele nao mente.

- testar-treino-palavra.mjs → o Modo Treino PALAVRA A PALAVRA. Desde 26/08 esse
  modo NAO tem botao na tela — o Erez pediu "so por verso por enquanto" — e o
  teste chega nele por **?treino=palavra** no endereco. O caminho fica inteiro e
  testado para poder voltar num toque. Precisa do servidor-teste.mjs.

  **Os passos do treino saem da FITA, nunca de v.start/v.end.** E a mesma licao
  de "A FITA CONTINUA" aplicada ao treino: o verso nao tem numero proprio, ele e
  a soma das suas palavras. Enquanto a fronteira do verso era um numero separado,
  ela podia discordar das palavras, e discordar 0,2s ja bastava para a pausa vir
  no lugar errado. Agora nao ha duas contas: ha uma fita, e o verso e um pedaco
  dela. Os numeros sao os mesmos de antes — ha prova disso rodando, 0 ms de
  diferenca nos 8 —, o que mudou e de ONDE eles vem, e as correcoes de ouvido do
  Erez estao nas palavras.
- medir-sopros.py → escreve sopros.json: as fronteiras entre palavras onde ha
  menos de 80 ms de silencio no audio (12% delas) — as que o aramaico diz num
  sopro so, "di vra", "min kodam", "kol Yisrael".
  **E DIAGNOSTICO, nao autoridade. O app nao le esse arquivo.** Chegou a ler:
  o Modo Treino por palavra emendava esses pares num passo so. Foi retirado
  porque descartava 102 fronteiras que o Erez tinha conferido uma a uma, e a
  regra 1 das invioláveis diz que medicao nao passa por cima do ouvido dele —
  ele disse, com razao: "todas essas coisas ja foram acertadas por mim".
  Serve para PROCURAR: se ele reclamar de um corte que soou quebrado, e aqui
  que se olha primeiro. Se um dia alguma emenda tiver que valer, ela entra
  escolhida por ele, nunca calculada.
  So le audio e sync/; escreve so sopros.json.
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
- gerar-panfleto.mjs — os 8 panfletos em PDF, em panfleto/kadish-<lingua>.pdf.
  O panfleto (panfleto.html) e a folha A4 do display da sinagoga; ele imprime
  direto do navegador, e estes PDFs existem para o Erez baixar do iPad.
  **Prova antes de gravar, e a prova que importa e a primeira: o QR e LIDO DE
  DENTRO DO PDF**, renderizado a 200 dpi como uma impressora caseira faria, e
  tem de devolver exatamente o endereco do app. Um QR so se descobre quebrado
  com a folha ja pendurada na parede — e ali ninguem avisa, as pessoas so nao
  entram. Confere tambem uma pagina so, os 5 itens da lista e que o endereco
  escrito nao voltou (ele mandou tirar em 10/09). Qualquer falha e ele NAO
  grava nada: escreve em provisorios e so renomeia no fim.
  Provado que sabe reprovar: trocando o qr/kadish.svg por um codigo de outro
  endereco, ele acusa "o QR do PDF le ... e nao o endereco do app" e nao grava.
  Requer, alem do Playwright: pip install pypdfium2 zxing-cpp pillow.
- aplicar-ancoras.py — põe em sync/*.json as âncoras de ancoras.json e prova que
  nada mais mudou. Substitui o alinhar-global.py, que nunca foi commitado.
- realinhar-por-conteudo.mjs — o realinhador que casa NOSSA palavra com A
  PALAVRA OUVIDA (whisper/*.json). É o único que sabe o nome da palavra. Prova,
  antes de gravar: texto intacto byte a byte, tempos subindo, nenhuma palavra
  espremida, âncoras valendo, bordas da fala certas, e concordância com o
  ouvido que não piora. Ensaio por padrão; --confirmar grava.
    node realinhar-por-conteudo.mjs chabad_derabanan            → ensaio
    node realinhar-por-conteudo.mjs chabad_derabanan --confirmar → grava
- realinhar.mjs — o antecessor, por ritmo. Fica como registro: ele zerou as
  contas e continuou errado. Leia o cabeçalho antes de confiar.
- casar-ouvidas.mjs — módulo. Casa a nossa lista de palavras com a lista ouvida
  (Needleman-Wunsch por semelhança do hebraico). O realinhador e o
  checar-sincronia.mjs usam este mesmo, de propósito: senão medem coisas
  diferentes e uma diz que a outra está errada.
- extrair-whisper.mjs — tira do RELATORIO-AUDIO-WHISPER.md os tempos citados.
  Só serve de reserva: a transcrição crua em whisper/*.json tem todas as
  palavras, e é ela que vale.
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
- **O ENDEREÇO do app, e ele está pensando (10/09).** Ele: *"queria mudar o link
  para outro nome, erez.chalom é meu nome"*. Em
  `erezchalom-a18y.github.io/tefila-kadish` a parte antes do `.github.io` é o
  usuário dele. Três caminhos, apresentados a ele: renomear só o repositório
  (não resolve — o nome fica); uma organização no GitHub, grátis
  (`kadish-app.github.io/tefila-kadish`); ou domínio próprio, US$ 10–15 por ano
  (`kadish.app`), que é o recomendado — o endereço passa a ser dele, e se um dia
  sairmos do GitHub os panfletos pendurados continuam funcionando. Ele pediu
  para pensar; **nada foi mexido.**
  **A consequência que importa: o QR e o endereço andam juntos.** Enquanto isto
  estiver aberto, NÃO imprimir e pendurar os panfletos — papel na parede ninguém
  troca. Refazer os 8 PDFs é `node gerar-panfleto.mjs`.
  (Não deu para conferir daqui se os nomes estão livres: a rede deste ambiente
  bloqueia consulta de registro de domínio — 403 no proxy.)

## A auditoria do português — RESPONDIDA E APLICADA (24/08)

`revisoes/AUDITORIA-PT-2026-08-24.md` esteve listada como pendência aqui até
30/08, e não era. Ele respondeu os 10 itens no mesmo dia 24/08, em duas rodadas
(`revisoes/pt-2026-08-24-a.txt`, os 6 que ele entendeu de cara; e `-b.txt`, os 4
restantes depois de eu explicar), e tudo entrou por `aplicar-revisao.mjs`.
Conferido item a item contra os arquivos de hoje: os 10 estão como ele decidiu.

Ficam duas coisas registradas, porque são o tipo de coisa que some:

1. **No item 3 ele desfez o "emanada" que tinha decidido no dia anterior**, e
   isso é decisão dele, não engano meu: a auditoria listou as três aberturas com
   a dele entre elas, e ele escolheu outra — hoje é "paz em abundância **vinda**
   dos céus". O "emanada" tinha levado três rodadas (`pt-2026-08-23-c.txt`). Se
   um dia alguém achar o -23-c e quiser "corrigir" para emanada, é isto aqui que
   diz que não.
2. **O "seu povo" a mais e o "nossos sábios" ficam**, por decisão dele ("pode
   manter", "fica sabios"), mesmo não estando no aramaico. Não são erros
   pendentes; são escolhas dele.

A lição sobre esta CHECAGEM DE PENDÊNCIA: uma lista de "esperando ele" tem de ser
conferida contra os DADOS antes de ser repetida. Esta ficou seis dias pedindo
uma resposta que já tinha sido dada e aplicada.

## A noite em que ele passou os 8 (24/08)

Com a fita contínua na mão, o Erez ouviu os 8 Kadishim e mandou 8 recados —
**159 correções de ouvido**. Estão em recados/, entraram por aplicar-recado.mjs
e viraram âncoras. O resultado, medido pelo checar-sincronia.mjs:

| | palavras | apontamentos |
|---|---|---|
| ashkenaz_yatom | 75 | 0 |
| ashkenaz_derabanan | 118 | 0 |
| chabad_yatom | 80 | 1 (o "di" com 0,15s — ele mesmo separou o par colado) |
| chabad_derabanan | 121 | 0 |
| sefard_yatom | 81 | 0 |
| sefard_derabanan | 124 | 1 (o Whisper cortando o amên; ver acima) |
| sefaradi_yatom | 91 | 0 |
| sefaradi_derabanan | 125 | 0 |

Duas coisas para quem ler isto amanhã e achar que piorou:

1. **A concordância com o Whisper CAIU** (de ~100% para 60–113 de cada total),
   e isso é o esperado: em cada lugar onde ele arrastou, o ouvido dele passou a
   discordar do Whisper. Vale o ouvido dele (regra 1). Não realinhar por
   conteúdo em cima disto sem falar com ele — o realinhador respeita as
   âncoras, mas mexeria em tudo o mais.
2. **O fala_inicio do sefaradi_yatom mudou de 0,46 para 0,16.** Ele arrastou o
   Yitgadal para antes do que o arquivo chamava de começo da fala, e tinha
   razão: há um bloco de voz em 0,16~0,40. O corte do áudio (cortes.json) não
   foi tocado.

## Decisões escapadas do Erez (25/08)

Nem toda decisão dele vale nos 8. Duas apareceram em 25/08 e não cabem no
formato dos recados (que casam por conteúdo e por isso pegam os 8):

- **O hebraico do "Yitbarêch veyishtabach veyitpaêr" com tsere** — só no
  ashkenaz e no chabad. Os nussachim divergem de verdade nessa palavra, e os
  sidurim também. Sefard e sefaradi ficam com o patach (veyitpaar).
- **As glosas de UM verso**, sem mexer nas mesmas palavras nos outros. O "kol"
  com a glosa "todas" está em 29 lugares; virar "todo o povo" em "leela min kol
  birchatá" daria "acima de todo o povo das bênçãos".

Para isso existe **aplicar-decisoes.mjs**, que lê revisoes/decisoes-<data>.json
(escrito à mão, a partir do que ele mandou) e aplica cada uma no escopo pedido.
Prova antes de gravar: nenhum tempo mudou, **nenhuma LETRA do hebraico mudou**
(só o nikud — mudar letra é outro texto, e isso é do rabino), as outras 7
línguas intactas, as âncoras valendo, e cada verso é a soma das suas palavras.

**A armadilha do glossário, e o conserto.** A chave do glossario.json ignora o
nikud, então dois nussachim com o mesmo texto e nikud diferente caem na MESMA
entrada. Sem conserto, a rodada seguinte do aplicar-glossario.mjs desfaria a
transliteração dele, sem aviso — é o mesmo caso que já obrigou o
aplicar-revisao.mjs a escrever nos dois lugares. Agora a entrada aceita um
`por_nussach`, e o aplicar-glossario.mjs o respeita. Há prova disso: rodá-lo
depois não desfaz nada.

## Começar em qualquer palavra (25/08)

Ele pediu: *"tanto no modo reza ou no modo treino, deveria permitir começar de
qualquer palavra, hoje só começa na primeira"*.

Tocar numa palavra já abria o balão com o significado dela, e isso ele usa —
trocar esse toque por "toca daqui" tiraria uma coisa para dar outra. Então o
balão ganhou um botão: **▶ Começar aqui** (nas 8 línguas, na tabela I18N).

O que não bastava era mover o relógio. O Modo Treino conta verso pelo que veio
antes (`versoAnterior`), e cair no meio do Kadish sem re-armar esse contador
fazia o verso seguinte ser lido como "acabou um verso" — a pausa vinha na hora
errada. A repetição tinha o mesmo problema: o contador era do verso de onde ele
saiu. `SYNC.comecarEm(vi, wi)` põe o relógio na palavra, re-arma o contador no
verso dela, zera a repetição e o "parado no fim do verso", e toca.

O testar-treino.mjs cobra as duas coisas nos dois modos, e mais uma: começando
no meio, a pausa do Modo Treino tem que vir no fim DAQUELE verso.

## O que ele mandou tirar e mudar no treino (27/08)

Seis recados numa mensagem só, depois de ver a v9 no computador.

1. **Entra com 3 repetições por verso.** `TREINO_REPETICOES = 3`, e tem que ser
   um dos números do `REPEAT_CYCLE` — senão o botão de repetição pula o valor
   atual no primeiro toque e ele perde o controle do que está ligado. Sair do
   treino desliga (o "está repetindo" dele foi literal, em 26/08).
2. **A tradução sai do treino; o hebraico é escolha dele.** Ajustes → "No Modo
   Treino mostrar": *Só transliteração · Hebraico + transliteração · Tudo*. A
   transliteração nunca sai — é ela que a boca lê. Vale SÓ dentro do treino: as
   classes ficam no body, mas o CSS delas está preso a `.modo-treino`.
3. **A "engasgada" na troca de frase era o silêncio DESIGUAL.** Medido quadro a
   quadro: nenhum pedaço tocado duas vezes, nenhum salto, nenhuma volta. O
   silêncio é que era metade da duração de cada verso — 2,00s, 1,32s, 1,03s. O
   ouvido não conta segundos, conta ritmo, e ritmo que muda a cada compasso é
   exatamente o que se chama de engasgo. Agora é `RESPIRO = 900ms`, **igual**
   entre versos e entre repetições. Entre repetições não havia silêncio nenhum —
   era esse o engasgo que fez a repetição 2× ser desligada em 26/08.
   O `checar-treino-fita.mjs` passou a exigir CONSTÂNCIA (varia ≤ 150ms), não só
   "é curto?". Se alguém voltar a calcular o silêncio a partir do verso, fica
   vermelho antes de ele precisar ouvir de novo.
4. **A faixa "MODO TREINO · PAUSA APÓS CADA VERSO" saiu.** Quem apertou o botão
   acabou de ler o que ela dizia. O aviso continua no toast — que passou a dizer
   a VERDADE: era texto fixo com "repetição 2×" escrito dentro e continuou
   dizendo isso os dois dias em que a repetição esteve desligada.
5. **Os pictogramas "em pé · em minyan (10) · em voz audível" saíram.** Eu tinha
   escrito aqui que eles FICAVAM porque eram instrução e não enfeite. A instrução
   continua valendo, mas quem decide o que ocupa a tela dele é ele. A informação
   não se perdeu: o minyan está no painel da ℹ e "recitado em pé" na linha ao
   lado do título. Os dados por verso (`pictograms: [...]`) ficam intactos.
6. **Tela grande.** "no computador está muito pequeno, o espaço grande." A
   coluna tinha os mesmos 720px do celular e a letra os mesmos 28px, calibrados
   para um iPhone a 30cm do rosto. Agora crescem juntas: 880px/34px a partir de
   1000px de tela, 1040px/40px a partir de 1400px. **As regras têm que vir DEPOIS
   da regra base no arquivo** — pus antes e não pegaram, porque a base vinha mais
   abaixo e ganhava por ser a última. Medido: o verso mais largo rende 948px dos
   976px úteis. A coluna não está larga demais; o vazio à esquerda é dos versos
   CURTOS, e isso é o hebraico alinhado à direita, que é como se lê.

**E um defeito achado no meio, que não era do treino:** uma busca antiga podia
RELIGAR o áudio depois de ele mandar parar. `irPara` guardava "estava tocando" e,
ao terminar — o que pode ser 1,5s depois, pela rede de segurança —, mandava
tocar. Trocar Treino→Reza depressa fazia a voz voltar sozinha. Agora cada busca
tira uma ficha e só religa se a ficha ainda for a última E o app ainda achar que
está tocando.

## Reza | Treino: os dois caminhos sempre à vista (28/08)

Ele disse: *"dar um destaque maior para o modo treino — ele só aparece quando
clicado e o usuário não sabe de sua existência"*. Tinha razão, e o defeito era
de **linguagem**: havia UM botão que trocava de nome. Escrito "Modo Reza", ele
não dizia se aquilo era o estado em que se está ou o destino de apertá-lo — e de
nenhuma das duas leituras saía que existe um Modo Treino. Quem nunca apertou
nunca soube.

Agora são dois botões num segmentado (`.modo-switch`): **Reza | Treino**. O aceso
é onde você está; o apagado (opacidade .62) não pode sumir — é ele que conta que
o outro modo existe. Os rótulos são curtos de propósito (`modo_reza_curto` /
`modo_treino_curto` nas 8): o segmentado já diz "modo" pela forma, e repetir a
palavra nos dois lados só ocupava a barra.

Duas coisas que o teste cobra e não podem se perder:

- **Tocar no modo em que ele JÁ está não faz nada** (`irParaModo` sai cedo). É o
  toque mais provável de todos — o de quem só quer conferir onde está — e antes
  ele reiniciaria a reza e religaria a repetição.
- Os botões têm 30px de altura, que é o piso do projeto: dedo de quem reza de pé,
  com o sidur na outra mão.

Os ids: `#rezaToggle` e `#treinoToggle`. O `#treinoToggle` continua com o nome
antigo de propósito — é por onde os testes entram no treino desde o começo.

## O iPad que não obedece (28/08) — e o que aprendi com isso

Ele abriu no iPad, **com a v11 na tela**, e o Modo Treino continuava errado:
*"começa no veyitkadash, falando bealma, e depois veyitkadash"*. Aqui as doze
checagens estavam verdes.

**Estavam verdes e não valiam nada para aquela pergunta.** Todas medem o mesmo
navegador — um Chromium de servidor, onde pedir 0,18s põe o áudio em 0,18s ao
milissegundo e o relógio anda de 19 em 19 ms. O aparelho dele não é assim, e
nenhuma delas teria como perceber. (Ele usa o Chrome no iPad; não muda nada — no
iOS todo navegador roda o WebKit por baixo, por regra da Apple. **Um app nativo
também rodaria**, então empacotar não resolveria isto.)

**Três suposições do código que só valiam no Chromium**, todas consertadas:

1. `ancorar(destino)`, com o comentário *"aqui a posição é EXATA: fomos nós que
   pedimos"*. Era falso fora do Chromium. O modelo passava a mentir, e é o modelo
   que manda no fim do verso e no destaque. Agora ancora no que o aparelho DIZ.
2. `chegou()` tentava a busca de novo UMA vez se caísse fora do lugar. Contra um
   desvio sistemático isso não serve: a segunda tentativa cai no mesmo lugar
   errado. Agora o desvio é MEDIDO e compensado, e onde a busca é exata ele mede
   zero e nada disso entra em ação.
3. **O app mandava tocar com a busca ainda em voo.** O respiro contava do
   instante da pausa, e o ▶ tocava na hora. Onde a busca é instantânea dá na
   mesma; onde demora, a voz sai do lugar VELHO e só depois o áudio pula. Agora
   `buscasEmVoo` conta as buscas a caminho e `quandoChegar()` segura o play.

**O que eu NÃO consegui:** reproduzir o relato dele. Rodei cinco perfis de
aparelho, incluindo um "iPad no pior dia", e nenhum falha — nem o código de
antes dos consertos. Então os três consertos acima são corretos e defensáveis,
mas **não são a prova de que o iPad dele sarou**, e não devo dizer que são.

Por isso existe o **diagnostico.html**: ele abre no iPad, aperta um botão e o
aparelho mede a si mesmo (busca exata? erra para um lado só? relógio grosso?
a .75× é respeitada? volta a tocar sozinho? o que está guardado no localStorage?)
e monta um texto para ele copiar e mandar. Sem número de aparelho de verdade,
qualquer conserto meu é chute — e chute já custou três rodadas dele.

## O formato do áudio, e o caminho que ninguém media (28/08)

O diagnóstico rodado no iPad dele resolveu a dúvida, e o resultado **derrubou a
minha hipótese**: no aparelho dele a busca é EXATA (0 ms de erro em 6 alvos) e o
relógio anda de 53 em 53 ms. Nada de desvio de busca. O que apareceu foi outro:

```
mp3: "maybe"   ogg: "probably"
```

O app escolhia o formato assim:

```js
_formato = a.canPlayType('audio/ogg; codecs=vorbis') ? 'ogg' : 'mp3';
```

com o comentário *"O Safari (iPad e Mac) NÃO toca Ogg Vorbis"*. Era verdade
quando foi escrito; o iOS 26 toca. **Duas coisas erradas nessa linha:**

1. `canPlayType` devolve TEXTO — `''`, `'maybe'` ou `'probably'` — e tanto
   `'maybe'` quanto `'probably'` são verdadeiros num `if`. Aquele ternário nunca
   perguntou "toca Ogg melhor?"; perguntou "sabe alguma coisa sobre Ogg?".
2. **O iPad dele caiu, calado, num caminho que nenhuma das 14 checagens cobre:**
   todas passam `?audio=mp3`. A sincronia foi conferida no MP3, o Modo Treino
   foi medido no MP3, e ele estava ouvindo o Ogg.

Agora o formato é **MP3 em todo lugar**. O Ogg não pagava nada em troca: o MP3
daqui é até MENOR (1,95 MB contra 2,08 MB no chabad_derabanan) e toca em tudo.
Os dois arquivos são idênticos ao milissegundo (correlação cruzada: 0,0 ms de
deslocamento; primeira voz em 0,175s no Ogg e 0,173s no MP3), então trocar não
mexe em número nenhum de sincronia. `?audio=ogg` continua forçando o Ogg.

**A lição, que vale além deste caso:** um `if` sobre o que o navegador *diz que
talvez* consiga fazer é um desvio de caminho que ninguém vê. Se houver dois
caminhos, ou os dois são medidos, ou só existe um.

O `tefila_audio_src = tts` que apareceu no localStorage dele é inofensivo com a
sincronia ligada (o `playFullPrayer` retorna antes de chegar ao TTS), mas o nome
engana — é dívida a arrumar um dia.

## O relógio que mediu a si mesmo (28/08) — erro meu, e o conserto

Entre a v13 e a v15 eu pus no ar uma **compensação de busca**: o app media quanto
o aparelho errava ao procurar uma posição e passava a pedir compensado. Escrevi
para um desvio que eu SUPUS que o iPad dele tivesse.

A medida que ele mandou do aparelho mostrou o contrário: **a busca lá é exata,
0 ms de erro em seis alvos**. Não consertava nada. E quebrava.

O jeito como ela aprendia o desvio era: pedir x, ler `currentTime`, tirar a
diferença. Só que **no iOS o `currentTime` vem arredondado para baixo**, até um
quarto de segundo. Ela media um erro negativo que não existia, concluía que o
aparelho cai antes do pedido, e passava a pedir tudo ADIANTADO — dessincronizando
o app inteiro. No Chromium o relógio é fino, media zero, e nada aparecia. Ele viu
em minutos, no iPhone: *"o áudio não está sincronizando, isso já estava 100%
certo"*.

**Não se mede o erro de um relógio com o próprio relógio.** Se um dia houver
prova de desvio de busca num aparelho de verdade, a compensação volta — medida
contra o SINAL, nunca contra o `currentTime`.

O que ficou da rodada, e é sólido:

- `irPara` só ancora na posição MEDIDA quando o navegador avisou que a busca
  acabou (`seeked`). Pela rede de segurança a busca pode nem ter acontecido, e aí
  vale a intenção.
- `buscasEmVoo` + `quandoChegar()`: o app não manda tocar com a agulha a caminho.
- A trava de duração (abaixo), que é a que realmente pega o defeito dele.

## A trava que faltava: o arquivo dura o que a fita diz? (28/08)

A medida do iPad trazia esta linha, que eu quase deixei passar:

```
buscas no OGG (duracao 111.35145833333333)
```

O arquivo dura **121,603s**. O aparelho dele decodificava o Ogg com uma linha do
tempo **10,25 segundos mais curta — 9,21% adiantado**. Não era a busca, não era
o relógio, não era o Modo Treino: era o áudio correndo depressa demais, e
piorando verso a verso.

| verso | acaba em | adianto no iPad dele |
|---|---|---|
| 1 | 4,38s | **403 ms** ← o "bealma" |
| 2 | 7,04s | 648 ms |
| 3 | 9,12s | 840 ms |
| 6 | 19,78s | 1,8 s |

A sincronia inteira é uma regra de três contra o relógio do arquivo. Se esse
relógio está errado, nada em cima dele pode estar certo — e o app não tinha como
saber, **porque nunca perguntou**. Agora pergunta quando o áudio carrega, e avisa
nas 8 línguas (`toast_audio_torto`). O `checar-plataformas.mjs` confere as duas
metades: calado no arquivo certo, avisando no arquivo torto.

## O Ogg de 48kHz e o iOS 26 (28/08) — e as páginas que quase corromperam as âncoras

Confirmado nos DOIS aparelhos dele, com o mesmo número: o WebKit do iOS 26
decodifica o nosso Ogg Vorbis de 48kHz com uma linha do tempo de **111,351s**
onde o arquivo tem **121,603s** — 9,21% adiantado. Não é um aparelho com defeito;
é o decodificador do sistema. O MP3 no mesmo aparelho lê 121,632s (certo, com o
enchimento normal do codificador).

O `engine.html` já passou a usar MP3 sempre. **Mas a mesma linha quebrada estava
em mais dois lugares**, e num deles era pior:

- **`sincronia.html`** — é onde ele ARRASTA as palavras ouvindo, e o que ele
  arrasta vira âncora. Um defeito do decodificador do aparelho estava a um toque
  de entrar no `ancoras.json` como se fosse o ouvido dele. Isso é a regra 1 das
  invioláveis pelo avesso: em vez de medição passar por cima do ouvido dele, o
  ouvido dele seria contaminado pela medição errada do aparelho.
- **`conferidor.html`** — existe para ele ouvir e reportar o segundo exato. Com
  o áudio correndo depressa, o segundo que ele reporta está errado.

Os dois passaram a `return 'mp3'`, sem `canPlayType`.

**As 159 correções de 24/08 estão limpas.** Testado: se ele tivesse arrastado
ouvindo o Ogg torto, os arrastos teriam uma deriva PROPORCIONAL ao instante —
9,21% crescendo ao longo do Kadish. A inclinação medida é 0,00% nos 8, e a
mediana do arrasto é 0 ms. Independentemente disso, o `checar-sincronia.mjs`
(que compara com o sinal medido) dá zero em "verso errado" nos 8. Nada a refazer.

**A regra que fica:** um `if` sobre o que o navegador *diz que talvez* consiga
fazer é um desvio de caminho que ninguém vê. Se houver dois caminhos, ou os dois
são medidos, ou só existe um. Foi assim que o iPad dele passou dias num caminho
que nenhuma das 14 checagens cobria.

## O "bea" no fim de cada frase (28/08) — e por que era estrutural

Ele, no iPhone e no iPad, já com a v16: *"no final da frase dá para ouvir o começo
da outra (bea) antes de recomeçar a frase. na segunda também (ve), na terceira
também (ve)"*.

Medido nas **153 fronteiras de verso dos 8 Kadishim**, e não tem exceção:

| | |
|---|---|
| silêncio **antes** da fronteira | 320 a 760 ms (mediana 600) |
| silêncio **depois** da fronteira | **0 ms — nas 153** |

E é assim **por construção**: as palavras se encostam na fita (o fim de uma é o
começo da seguinte), então a última palavra do verso engole a respiração do
rabino e só termina quando a próxima já está soando. "Parar no fim do verso" era
parar no instante exato do ataque seguinte, com 20 ms de margem (`ANTECIPA`).

No Chromium a pausa cai no milissegundo e não se ouve nada — por isso as
checagens ficavam verdes. Num aparelho de verdade, com relógio de 27–53 ms e som
já no buffer, escapa o ataque: o "bea", o "ve".

**O conserto não é apertar a conta, é parar onde a VOZ acaba.**
`medir-fim-da-voz.py` mede esse instante e escreve `fim-da-voz.json`; o app o lê
e o Modo Treino para ali. Ganho medido: a folga até o ataque seguinte passou de
20 ms para **325 a 665 ms**, e o corte no fim da voz é **0 ms** — nada se perde,
o rabino já tinha calado. Se o arquivo faltar, o app volta ao comportamento
antigo sozinho.

**Duas contas para a mesma pergunta, de novo.** Há DOIS caminhos que encerram o
passo: o alarme de relógio de parede e, se ele falhar, o quadro que vê o relógio
cruzar o ponto. Mudei só o primeiro, e o segundo continuou parando na fronteira —
no chabad_yatom a checagem mediu a parada a **16 ms** do ataque seguinte. Agora
os dois chamam `pontoDeParada(passo)`, que é uma função só.

## O destaque lia o relógio errado (28/08)

Achado no mesmo dia, e é a metade visível da queixa de sempre ("iluminando as
palavras erradas"): `acender()` lia `audioEl().currentTime` — o relógio CRU. No
iOS ele é um piso: fica parado e salta. O destaque ficava até um salto inteiro
atrasado, e numa palavra curta isso é a palavra toda.

O app **já sabia** a posição boa: `posicaoEstimada()` conta por relógio de parede
desde a última âncora e usa o relógio do áudio só como piso. É ela que manda no
fim do verso desde 26/08. Só o destaque continuava perguntando ao relógio cru.

Medido no perfil "iPad no pior dia" (relógio de 250 ms): quadros em que a tela
acende uma palavra e o áudio toca outra caíram de **13% para 1%**. O limite do
`checar-plataformas.mjs` desceu junto, de 12% para 4% — aceitar 12% seria guardar
lugar para o defeito voltar.

**As checagens que precisaram mudar de pergunta** (e ficaram mais exigentes, não
menos): "buracos na fita" agora pergunta se ficou VOZ sem tocar, não se ficou
fita — pular a respiração é o pedido dele, não defeito; e "a parada caiu perto da
fronteira" virou "a agulha ficou estacionada no começo do verso seguinte", que é
o que o app de fato faz e que faz o ▶ entrar limpo.

## Trocar de Kadish e de modo no meio da reza (30/08)

Ele: *"ao passar de um kadish para outro ou de reza para treino dá erro, de
sincronia, etc"*.

**Nenhuma das quinze checagens trocava de nada com o app rodando.** Todas abriam
um Kadish, mediam e fechavam. Por isso ninguém viu que **trocar o tipo de Kadish
nunca funcionou**: o ouvinte chamava `temState()`, que mora dentro do módulo SYNC
e nunca esteve visível ali. Cada toque lançava *"temState is not defined"* dentro
de um `setTimeout`, morria calado, e o `SYNC.trocar()` logo depois nunca rodava —
o rótulo do botão trocava e o áudio e o texto ficavam no Kadish anterior.

E o segundo: trocar o `src` do áudio faz o navegador **parar e zerar o relógio**,
e nada religava. Pior, a âncora continuava com o instante do Kadish ANTERIOR — e
desde 28/08 é a âncora que manda no destaque. Agora `montar()` guarda se estava
tocando, zera o modelo junto com o áudio, e no fim volta ao começo do Kadish NOVO,
tocando se estava tocando. Trocar de Kadish é escolher outro Kadish, não pausar
a reza.

**checar-trocas.mjs** faz oito trocas em sequência **sem recarregar a página** —
de propósito: defeitos deste tipo são de ESTADO QUE SOBRA, e estado que sobra só
aparece quando se troca várias vezes seguidas. A pergunta é sempre a mesma: depois
da troca, a palavra acesa é a que está soando? Roda também com `GROSSO=0.25`, o
relógio grosso do iOS.

## As palavrinhas passam a ler a frase, nas 7 línguas (30/08)

Ele: *"gostaria que as evoluções que fiz em português fossem feitas nas traduções
nas outras línguas, como exaltado e santificado seja seu grande nome (no inglês
está his name great)"*.

O defeito não estava onde parecia. A tradução do VERSO está certa nas 8 línguas —
"Exalted and sanctified be His great Name". Erradas eram as **palavrinhas**, uma
por palavra hebraica: em fila davam *"Exalted and sanctified His Name great"*,
porque seguiam a ordem do hebraico. Em **44 dos 47 versos** no inglês, 43 no
alemão, 41 no espanhol e no francês, 39 no italiano, 36 no russo, 15 no hebraico.
Em português, 5 — porque ele já tinha arrumado.

**alinhar-glosas.mjs** + `fontes/glosas-alinhadas.json`. A regra que torna isto
seguro, e é o coração do arquivo:

> as glosas, juntas com espaços, têm de dar **exatamente** a frase que já existia
> naquela língua.

Com isso o único grau de liberdade é ONDE CORTAR — nenhuma palavra nova pode
entrar, e a regra 5 das invioláveis continua de pé: a autoridade continua sendo
quem escreveu a frase, não quem a repartiu. Um corte mal posto faz uma palavra
acender uma posição adiante; nunca inventa tradução. **Ao escrever os cortes eu
errei 46 de 329 na primeira volta** — pus os pedaços na ordem do hebraico — e foi
essa conferência que os pegou.

Escreve nos DOIS lugares (sync/*.json e glossario.json), pela lição de 23/08. Há
prova de que rodar o `aplicar-glossario.mjs` por cima não desfaz nada.

Resultado: as 7 línguas foram de 36–44 versos fora para **zero**. O português
continua com 5, que são decisões dele e não foram tocadas — em quatro é só
pontuação (vírgulas e o "e" final de uma enumeração) e em um o "Ele fará" da fila
contra o "que Ele faça" da frase. Ficam para ele decidir.

## Três mudanças em dois dias, e o que isso custou (30/08)

Entre a v17 e a v19 eu subi três mudanças de comportamento sem ele testar entre
elas: o ponto de parada do treino, o destaque lendo outro relógio, e um bloco
novo no `montar()` para consertar a troca de Kadish. Ele voltou dizendo *"a versão
17 estava perfeita na sincronia na reza e treino, agora está tudo errado"* — e
**nem ele nem eu tínhamos como saber qual das três foi**.

Aqui as dezesseis checagens estavam verdes, e a medida do desencontro entre a
palavra acesa e a que soa dava 1% na v19 e 1% na v17. Ou seja: **eu não sabia, e
continuo não sabendo, o que aquele bloco fazia no aparelho dele.**

O que fiz foi desfazer, não consertar por cima: o `engine.html` voltou byte a byte
ao da v17. Saiu junto um defeito real que eu tinha achado no caminho — trocar o
TIPO de Kadish nunca funcionou, porque o ouvinte chamava `temState()`, que não
existe naquele escopo, e o erro morria calado dentro de um `setTimeout`. Ele volta
sozinho, num commit que mexa só nisso, para ele poder testar uma coisa de cada vez.

**A regra que fica, e vale mais que qualquer conserto:** uma mudança de
comportamento por versão, e esperar ele dizer que está bom antes da seguinte.
É mais lento, e é o único jeito de saber o que quebrou quando quebrar.

## O botão de mudo, e o "Silencioso" que não silenciava (01/09)

Ele: *"quando desabilito o som nas configurações o som continua, favor corrigir.
gostaria de incluir um ícone em cima para bloquear o som"* — com o desenho do
alto-falante cortado por um círculo vermelho.

**Eram três defeitos numa linha só de Ajustes, não um.**

1. **O "Silencioso" não silenciava.** `applyAudioSource` só punha
   `state.disableTTS`, que cancela a voz sintetizada do navegador — e essa nunca
   soa com a sincronia ligada, porque o `playFullPrayer` retorna antes de chegar
   lá. A gravação do rabino continuava tocando, exatamente como ele descreveu.
2. **O rótulo mentia duas vezes.** "Áudio: Voz do dispositivo | Silencioso" — o
   app nunca toca voz do dispositivo, e o silencioso não silencia. Virou
   **"Som: Ligado | Mudo"**.
3. **Estava em português nas 8 línguas.** As chaves `audio_tts` e `audio_silent`
   nunca existiram na tabela I18N, e o `applyI18n` **ignora em silêncio** a chave
   que não existe (`if (t[key])`). Violação da regra 6 que ninguém via.

**O botão fica no alto**, e não dentro do menu, porque silenciar é coisa de quem
está rezando AGORA — o telefone tocou, alguém entrou na sala. O risco vermelho
só aparece quando está mudo, e as ondas somem junto: é ele que diz o estado sem
precisar de legenda.

**Mudo não é pausa, de propósito.** A reza continua andando e o destaque continua
acompanhando. Quem silencia no meio do Kadish quer que a reza siga.

**Uma conta só para "está mudo?"** (`aplicarSom`), lida e escrita pelo botão do
alto E pela linha dos Ajustes. Se fossem duas, elas se contradiriam — é o defeito
que este projeto já pagou caro mais de uma vez. Nada disso toca no módulo SYNC:
a `trava-sincronia.mjs` fica verde.

## A checagem que deixou o português passar, e como ela mudou de pergunta

O `testar-linguas.mjs` nunca abria o painel de Ajustes. Mas abrir não bastava:
procurar palavra portuguesa dá **falso positivo** — "Normal" é "Normal" em
inglês, "Tema" é "Tema" em italiano, "Idioma" é "Idioma" em espanhol. Foi o que
aconteceu na primeira tentativa: 5 línguas vermelhas, todas erradas.

A pergunta exata não é *"sobrou português?"* e sim **"a chave existe na tabela
daquela língua?"**. Sem falso positivo, e pega o app inteiro de uma vez — as 61
chaves da tela, inclusive as escondidas atrás de um botão. Provado que sabe
falhar: tirando `som_mudo` do inglês e do alemão, ela acusa as duas pelo nome.

Mesma classe de defeito do `canPlayType` e do `temState`: **um caminho que
nenhuma checagem visitava.**

## Nunca

- git push --force
- alterar checar.mjs/checar-ritos.mjs para silenciar um vermelho
- deixar o ChatGPT (ou qualquer modelo) escrever direto no glossario.json
- deixar o Whisper (ou qualquer modelo) escrever nos sync/*.json ou nas âncoras
- afrouxar o prompt da revisão cega para produzir mais apontamentos
- gravar arquivos de texto em UTF-16 (foi um `echo >>` do PowerShell em UTF-16
  no .gitignore que quebrou o repositório uma vez — todo texto em UTF-8)

## O que ele autorizou em 01/09, e o que entrou (v24)

Quatro coisas numa versão só. Nenhuma toca no módulo SYNC nem em número de
tempo — a `trava-sincronia.mjs` fica verde, e a regra 0 continua de pé.

1. **O `testar-telas.mjs` passou a medir também o Modo Treino**, e achou o
   defeito que ele já estava vendo: no iPhone deitado o treino mostra a faixa
   `.prayer-meta` ("Kadish do Enlutado · recitado em pé"), que a reza esconde em
   toda tela desde 27/08. São 34px de 375, e a sobra para o Kadish caía de 61%
   para **52%** — abaixo do piso de 60% do projeto. Mais um **caminho que
   nenhuma checagem visitava**: a checagem abria o app e media, sem nunca
   apertar o botão do Treino.
   O conserto é uma linha de CSS dentro do `@media (max-height:460px) and
   (orientation:landscape)`, ao lado do que já sai ali (o cartão "Por que
   dizemos o Kadish?", os pictogramas, o sufixo do tipo). Não se perde
   informação: o nome do Kadish está nas fitas do alto, "recitado em pé" está no
   painel da ℹ, e de pé no mesmo aparelho a faixa volta. Medido depois: os dois
   modos dão **61%** no iPhone SE deitado e **72%** no iPhone 15 deitado — os
   dois modos idênticos, que é como tem de ser.

2. **Os botões das camadas desenham o que fazem.** Ele perguntou como explicar,
   ao entrar no app, que dá para mostrar, destacar ou ocultar hebraico, tradução
   e transliteração. A explicação mais curta é nenhuma palavra: em
   `Ocultar | Normal | Destaque`, o "Ocultar" vem esmaecido e riscado e o
   "Destaque" vem maior e em latão. Zero pixel novo na barra, zero palavra nova,
   **zero língua nova** — não há o que traduzir num desenho, então a regra 6 nem
   entra. O seletor é `.seg-control[data-layer]`: tema, tamanho, tradição,
   língua e som continuam iguais.

3. **A dica subiu para junto das três linhas.** Medido num iPhone SE, o painel
   punha as camadas a 887px e a dica a 1242px — duas telas de rolagem depois de
   onde se decide, e depois do cartão de Yahrzeit. Agora ela vem imediatamente
   antes da linha do Hebraico. É o **mesmo texto e a mesma chave**
   (`settings_hint`), que já existia nas 8 línguas; nada foi reescrito.

4. **"Explicações entre versos" saiu do ⚙.** Medido antes de tirar: **0 dos 161
   versos** dos 8 Kadishim tem `tip` ou `communityResponds`. A chave não escondia
   nada — era uma linha do painel que não mudava um pixel da tela, em qualquer
   posição. Saíram junto o `applyExplanations`, o `tefila_explanations` do
   localStorage e as chaves `explanations_*` das 8 tabelas (o
   `testar-linguas.mjs` foi de 61 para **58 chaves na tela**). O desenho do
   `.tip` e do `.community-respond` FICA no CSS, agora sem interruptor: no dia em
   que houver uma explicação nos dados, ela aparece por existir. O painel encolheu
   de 1.460px para 1.354px.

**Uma nota sobre o `checar-plataformas.mjs` neste ambiente:** ele reprova de vez
em quando com `ERR_CERT_AUTHORITY_INVALID` no perfil "iPad no pior dia". Não é o
app: é o `fonts.googleapis.com` falhando o TLS no proxy do contêiner remoto. A
checagem cobra "nenhum erro de console" e conta esse também. Se aparecer, rodar
de novo; se passar a aparecer sempre, o conserto é ensinar a checagem a ignorar
falha de rede EXTERNA — nunca a ignorar erro de console.

## "Em memória de (clique aqui para incluir)" (01/09, v25)

Ele: *"o que acha em memória de (clique aqui para incluir) bem discreto"*, e
depois, nas mesmas palavras: *"acompanha o texto do kadish enquanto ele desce"*
e *"é permanente; se preencher ótimo, se não permanece"*.

**O convite já existia e ninguém o via.** Era uma caixa tracejada no FIM do
texto — "✦ dedicar este Kadish a alguém" — escrita com a intenção certa (ficar
fora do caminho de quem só quer rezar) e com o efeito errado: quem nunca rolou
até o fim do Kadish nunca soube que a dedicatória existe. A ideia dele resolve
isso sem custar nada, e é melhor que a minha por um motivo simples: **o convite
passou a ser a dedicatória VAZIA**, na mesma vaga e com o MESMO rótulo. Quem lê
"Em memória de · (clique aqui para incluir)" entende de uma vez o que aquilo
vira depois de preenchido. Não há palavra explicando a função; a função se
mostra.

O que ficou valendo, decidido por ele:

- **Fica antes do primeiro verso e desce junto com o texto.** Não é faixa fixa —
  faixa fixa rouba altura de leitura, e o `.memorial-strip` do cabeçalho
  continua desligado desde 27/08 justamente por isso.
- **É permanente até ser preenchido.** Sem "agora não", sem botão de fechar. Ao
  preencher, o convite some e no lugar dele fica a dedicatória — e essa também
  é permanente.
- **Nunca aparecem os dois**, e nunca dois do mesmo. As duas funções agora usam
  `main.prepend` e disputam a mesma vaga; o `atualizarDedicatoria` deixou de
  fazer a dança de mover elemento que fazia antes (era ali que dava para
  empilhar ao trocar de língua).
- O texto novo é só o que está entre parênteses (`CONVITE`, nas 8). O rótulo é o
  `DEDICATORIA`, que já existia nas 8 — nada foi reescrito.
- **A LETRA é outra, e é de propósito (v26).** A primeira tentativa reaproveitou
  também o *estilo* do rótulo da dedicatória — caixa-alta, espaçada, em duas
  linhas — e ele viu na hora: *"poderia ser uma fonte mais discreta, fina, você
  tinha feito uma que estava perfeita"*. Tinha razão, e a razão é de peso
  tipográfico: a dedicatória CHEIA carrega um nome, e caixa-alta espaçada é o
  que segura um nome; o convite não carrega nada — é um sussurro. Agora é uma
  linha só, em Cormorant Garamond 300, 0,95rem, sem caixa-alta, sem espaçamento
  de letra, sem caixa tracejada e **sem risco embaixo** (o risco ficaria mais
  escuro que a própria frase). Mediu 58px de altura na primeira versão e
  **27px** nesta. A dedicatória cheia não mudou.

**Virou checagem** (`testar-dedicatoria.mjs`, no workflow): as 8 línguas com o
memorial vazio, o convite antes do primeiro verso, um só de cada vez, some ao
preencher e volta ao apagar. E, com dentes na regra 6: fora do português, o
texto TEM de ser diferente do português — senão a checagem passaria com o
convite em português nas 8, que é o defeito clássico daqui.

## A fita das camadas no alto (02/09, v27)

Ele: *"gostaria de fazer mais uma linha no topo junto com o nussach e tipo de
kadish, incluindo as configurações do hebraico, tradução e transliteração"*.

Estavam só dentro do ⚙, e quem nunca abriu o ⚙ nunca soube que dá para ocultar
ou destacar uma camada.

**A conta da altura, que é o que decide o desenho.** Medi antes de fazer:

| | |
|---|---|
| cabeçalho de um iPhone, hoje | 165px (tradição+tipo 72 · Reza\|Treino+idioma+mudo 38 · cartão do Kadish 36) |
| a fita nova | **~30px** — as três palavras cabem numa linha nas 8 línguas (273 a 290px de 351 úteis) |
| sobra para o Kadish, somando | **57%** — abaixo do piso de 60% do projeto |

Somar não dava. Afrouxar o piso é o que a regra 3 proíbe. Então a fita **entrou
trocando, não somando**:

- **na REZA do celular** sai o cartão "Por que dizemos o Kadish?" (36px contra
  30px: saldo −6px). Ele já saía no Modo Treino e no celular deitado.
- **no TREINO do celular** sai a faixa `.prayer-meta` — ali o cartão já não
  existia para pagar. Não se perde nada: a reza esconde essa faixa em TODA tela
  desde 27/08.
- **no celular deitado** a fita inteira não aparece: quem vira o telefone de
  lado quer ler, não configurar. Continua no ⚙.
- **no iPad e no computador** nada sai; lá sobra altura.

Medido depois: **62%** em pé e **61%** deitado no iPhone SE, nos dois modos.

**A página Aprender ganhou uma segunda porta, dentro do ℹ**, e isso não é
enfeite: o cartão do alto era o ÚNICO caminho para o `aprender.html`, e escondê-lo
no celular teria sumido com a página inteira para quem usa telefone. Achei isso
ao fazer, não ao planejar.

**Não é um botão que troca de nome.** Ele descreveu "Hebraico (ocultar)" e eu
desaconselhei: é o mesmo defeito de linguagem do "Modo Reza" de 28/08 —
"(ocultar)" tanto pode ser lido como "está oculto" quanto como "aperte para
ocultar", e de nenhuma das duas leituras sai qual é o estado. Aqui **a palavra
não muda; muda o desenho**: apagada e riscada = oculta, dourada = em destaque,
normal = normal. Zero palavra nova, **zero língua nova** — as três chaves já
existiam nas 8 (`layer_hebrew` · `layer_translit` · `layer_translation`), e
desenho não se traduz.

**O ciclo é Normal → Destaque → Ocultar.** Ele tinha proposto começar pelo
ocultar; pular de "sumiu" direto para "está gritando" é um salto grande, e ele
concordou em inverter.

**Uma conta só** (`estadoCamada` + `aplicarCamada` + `pintarCamadas`), lida e
escrita pela fita do alto E pelas três linhas do ⚙. Se fossem duas, elas se
contradiriam — é o defeito que este projeto já pagou caro mais de uma vez.

**A escolha fica guardada no aparelho** (`tefila_camadas`). Sem isso, quem não lê
hebraico teria de ocultar o hebraico toda vez que abrisse o app — e foi por poder
ser uma vez só na vida que dispensamos a pergunta na entrada. Quem nunca escolheu
abre com **as três em Normal**: "Destaque" apaga as outras duas para 45%, e quem
lê hebraico com a transliteração de apoio abriria o app com o apoio já meio
apagado, sem ter pedido.

**Sem pergunta na entrada**, e essa foi a decisão mais importante da rodada. Ele
perguntou se valia perguntar "você sabe ler em hebraico?" ao abrir. Não vale:
está escrito no código, por decisão dele, que o app abre direto no Kadish porque
*"quem abre este app pode ter enterrado o pai ontem, e no minyan não há tempo de
preencher formulário"*. Uma pergunta antes do Kadish é um formulário antes do
Kadish. E "não sei ler hebraico" não quer dizer "não quero ver o hebraico" —
muita gente que não lê as letras quer vê-las assim mesmo. A fita É a pergunta,
respondida com o dedo, e o resultado aparece na hora.

**Uma armadilha de layout, achada pela checagem.** Na primeira tentativa a fita
era um item DENTRO do `.brand`, com `flex-basis:100%`. Isso obrigava um
`flex-wrap` no `.brand` que reorganizava o cabeçalho inteiro: a página passou a
rolar de lado no iPad e no computador (quatro medidas vermelhas), e no celular
deitado o cabeçalho subiu de 79px para 85px mesmo com a fita escondida. Agora ela
é uma **linha própria do `.topbar`**, irmã do `.brand`. Lição velha: mexer no
`flex-wrap` de um contêiner muda o que os OUTROS filhos fazem.

## A dedicatória desce junto com o Kadish (02/09, v28) — e a barra que nunca grudou

Ele, dois pedidos: *"o em memória deve descer junto com a rolagem quando o
kadish rola (aumentar um pouco mais a fonte e colocar numa fonte mais
elegante)"* e *"retirar o em memória do modo treino"*.

**Medido antes de mexer:** a dedicatória saía da tela com **400px de rolagem** e
não voltava mais. Quem começava a rezar perdia de vista para quem estava
rezando. Agora ela mora dentro do `.topbar`, que já é `position: sticky` — então
acompanha a rolagem por construção, e por estar no `.topbar` ela **entra na
conta** do `testar-telas.mjs`. Fosse um elemento fixo por fora, comeria altura
sem nenhuma checagem enxergar.

**E aí apareceu um defeito velho e grande: no celular a barra de cima NUNCA
grudou.** O `overflow-x: hidden` em `html, body` — posto como "Mobile topbar fix"
— faz do corpo um contêiner de rolagem, e um `overflow` diferente de `visible`
num ancestral **mata o `position: sticky`**, calado. Medido: no computador a
barra fica em 0 depois de rolar 600px; no iPhone ela vai para −600 e não volta.
Nussach, tipo, Reza|Treino, idioma, mudo, ⚙, ℹ — tudo sumia e só voltava
rolando até o topo.

Ninguém via porque **nenhuma das vinte checagens rolava a página**. É o mesmo
caminho-que-ninguém-visita do `canPlayType` e do `temState`. O conserto é
`overflow-x: clip`, que corta igual e **não** cria contêiner de rolagem. O
`testar-telas.mjs` passou a rolar 900px e a cobrar que a barra fique — e sabe
falhar: repondo o `hidden`, ele acusa as duas telas de celular pelo nome.

**A letra:** Cormorant Garamond, que é a mais elegante das três do app (as outras
são Lora, do corpo, e Frank Ruhl Libre, do hebraico). Ele pediu por ela duas
vezes — "mais discreta, fina" em 01/09 e "um pouco mais a fonte, e numa fonte
mais elegante" agora. Ficou: rótulo em 1,18rem peso 400, o convite entre
parênteses em 1,05rem itálico leve. É o ar antigo de dedicatória de livro.

**A conta da altura, e uma escolha explícita.** Com a dedicatória grudada, um
iPhone SE (375×667) somava 201px de cabeçalho e a sobra para o Kadish caía para
**56%** — abaixo do piso de 60%. Medi onde havia folga e não havia: o resto do
cabeçalho já está nos pisos de 12px de texto e 30px de botão. Não cabem as duas
coisas. Então:

> **numa tela curta (≤700px de altura) a dedicatória FICA e a fita das camadas
> SAI** — porque a dedicatória é a reza e a fita é ajuste, e o ajuste continua
> inteiro dentro do ⚙, que é onde ele sempre esteve.

É a mesma regra que já valia no celular deitado, agora escrita por ALTURA em vez
de por orientação. Medido depois: **61%** no iPhone SE em pé, nos dois modos, e
os telefones maiores (393×852) mantêm as duas coisas com 66%.

**No Modo Treino a dedicatória não aparece**, a pedido dele: quem está treinando
a boca não está dedicando. Ela volta sozinha ao sair do treino, e o
`testar-dedicatoria.mjs` cobra as três coisas — continua na tela depois de rolar
900px, some no Treino, volta na Reza.

## A dedicatória DENTRO do Kadish (04/09, v41) — a metade do pedido que faltava

Ele, olhando a v40: *"ainda não desceu o em memória e ainda não desce junto com
o kadish"*.

A v40 tinha atendido metade do pedido e eu tinha dado a coisa por feita. A
dedicatória já saíra do `.topbar` e já rolava — medido, some aos 400px e volta
ao subir. **Só que "junto com o Kadish" nunca foi sobre rolagem; era sobre
PERTENCIMENTO**, e disso eu não tinha feito nada.

O que estava na tela dele: um `<div>` irmão do `<main>`, com `padding: 14px 20px`
e `border-bottom: 1px solid var(--rule)`. Ou seja, uma faixa da **largura
inteira da janela** — 1440px no computador dele —, com um risco embaixo
separando-a do texto e encostada no cabeçalho. Lia-se como uma **terceira barra
de cabeçalho**. O Kadish, ao lado, mora numa coluna de 1040px centrada. A
dedicatória não estava no mesmo lugar que o Kadish; estava por cima dele.

Agora ela é o **primeiro filho do `<main>`**: mesma coluna dos versos, mesma
margem, sem faixa, sem risco, sem fundo. Rola junto porque **É o começo do
texto**, não porque alguém calculou uma rolagem. Medido no computador (1440×900,
com nome preenchido): antes o bloco começava a 99px do alto — colado no
cabeçalho — e media 95px com o risco; agora começa a 139px, dentro da coluna, e
mede 68px.

**A vaga deixou de estar escrita no HTML.** Quem a cria é o
`vagaDaDedicatoria()`, que a põe como primeiro filho do `main` e a repõe ali
toda vez — porque o `desenharVersos()` limpa o `main` inteiro antes de
redesenhar, e uma vaga escrita no HTML dentro do `main` sumiria na primeira
troca de Kadish. Escrita FORA do `main`, ela volta a ser faixa de cabeçalho.
Não há terceira opção, e é por isso que ela é criada em código.

**A lição, e é a mesma de 30/08:** o pedido dele tinha duas metades ("junto com
o Kadish" e "rolaria junta") e eu tratei a segunda como se fosse as duas. Quando
ele repete um pedido que eu já dei por atendido, a pergunta não é "será que não
chegou?" — é **qual metade eu não fiz**.


## "Rolar junto com o Kadish" tinha duas leituras opostas (04/09, v42)

Em 04/09 ele olhou a v41 e disse: *"fazer rolar o em memória junto com a rolagem
do kadish (não está indo)"*. Eu tinha acabado de fazer a v41 justamente para
isso. Perguntei, com as duas leituras desenhadas, e ele escolheu:

> **"a dedicatória fica parada no alto acompanhando a leitura"**

As duas leituras da mesma frase eram **opostas** — acompanhar a leitura (ficar à
vista) ou subir com o texto e sair — e em 04/09 eu escolhi a errada sozinho, duas
vezes, em versões seguidas. A regra que fica: **quando um pedido admite duas
leituras opostas, perguntar custa uma mensagem; adivinhar custou três versões.**

**Onde ela mora agora, e por que isso é uma função e não uma regra de CSS.**
No `.topbar`, que é sticky, ela acompanha por construção. Mas o cabeçalho é
altura que o Kadish perde, e o piso do projeto é 60%. Medido com o nome
preenchido:

| tela | cabeçalho | dedicatória | sobra |
|---|---|---|---|
| iPhone SE em pé (375×667) | 124px | 84px na forma de três linhas | **55%** ✗ |
| iPhone SE deitado (667×375) | 78px | 84px | **39%** ✗ |

Não há aperto de letra que resolva 39%. Então `vagaDaDedicatoria()` decide, e é
o **único** lugar que decide:

- **tela de 500px de altura ou mais** → última linha do `.topbar`, grudada.
- **tela mais baixa** (telefone deitado) → primeira linha do texto, como na v41:
  aparece ao abrir e sobe com o Kadish.

E numa tela **de até 700px de altura** ela encolhe para **uma linha só**, com o
rótulo curto `in_memory_of` ("Em memória de"), que já existia nas 8 línguas
desde a faixa antiga — **não é uma segunda cópia do texto**, é a mesma tabela.
Medido depois: 84px → **31px**, e a sobra do iPhone SE em pé volta a **63%**.
Deitado, **61%**.

**A armadilha do `const` em TDZ.** A primeira pintura da dedicatória acontece
ANTES de o `const I18N` ser inicializado, e ler um `const` nessa janela
**estoura** — `Cannot access 'I18N' before initialization`, e a dedicatória
inteira ficava em branco. Por isso o rótulo curto é lido por `rotuloCurto()`,
protegida, e o `<span>` carrega o `data-i18n` para o `applyI18n` preenchê-lo na
primeira volta. Duas rotas, as duas corretas, nenhuma cópia de texto.

**E o risco embaixo dela não voltou.** O risco é o do próprio `.topbar`. Com um
risco só ela é a última linha do cabeçalho; com dois, ela volta a ser a
"terceira barra" de que ele reclamou na v40.

**O traço do "Ocultar" saiu**, no mesmo dia e a pedido dele: *"tire o traço em
ocultar nas configurações"*. O esmaecido sozinho já diz o que o botão faz, e o
risco sobre uma palavra curta lia-se como erro. O "Destaque" maior e em latão
continua.

**E o ben/bat automático NÃO vai existir.** Eu tinha proposto perguntar o nome do
pai e da mãe e montar o nome hebraico sozinho. Ele cortou, e a razão é boa:
*"como você sabe se a pessoa é homem ou mulher para indicar ben ou bat, deixe que
a pessoa preencha na sua língua, o lembrete é para ele"*. O campo do nome
hebraico continua livre, escrito por quem cadastra. É a regra 5 das invioláveis
aplicada a um nome próprio: o modelo não escreve o que é do dono.

**A letra encolheu e o parentesco saiu (mesma v42).** Ele: *"pode diminuir o
tamanho das fontes do in memorian, não precisa colocar parentesco, ele com
certeza lembra, ganha uma linha"*. Rótulo de 0,95rem para **0,85rem**, nome de
1,25rem para **1,05rem**, e a linha da relação ("meu pai") **não aparece mais**
— continua guardada no perfil, some da tela e não dos dados. No computador a
dedicatória foi de 84px para **55px**, de três linhas para duas.

E a linha que ele deu de presente pagou uma coisa: **o nome hebraico voltou para
a tela do telefone**. Ele tinha saído da forma compacta porque, com o parentesco
ainda ali, "Em memória de Itzhak Avraham Cohen · יצחק אברהם בן יוסף" ia a três
linhas num iPhone SE e a sobra caía a 59,7%. Sem o parentesco e com a letra
menor, cabe: **63%** de sobra, com esse mesmo nome longo.

**Duas falhas que a checagem pegou nesta rodada, e as duas eram reais:**

1. **O convite virou um botão de 23px**, contra o piso de 30px do projeto — dedo
   de quem reza de pé, com o sidur na outra mão. O `testar-telas.mjs` o acusou
   pelo nome. Agora ele é `flex` com `min-height: 30px`.
2. **A forma compacta não pegava no convite.** As regras da forma cheia
   (`.convite-dedicar .ded-rotulo`) moram MAIS ABAIXO no arquivo e, com o mesmo
   peso de seletor, ganhavam por serem as últimas. O convite continuava em duas
   linhas (65px) e a sobra do iPhone SE caía a 58%. Os seletores da tela baixa
   passaram a levar `.dedicatoria-fixa .convite-dedicar` no meio. É a mesma
   lição de 02/09, quando as regras de tela grande não pegavam pelo mesmo
   motivo: **neste arquivo, quem vem depois ganha.**

**E uma armadilha nova:** numa tela baixa a vaga vive dentro do `<main>`, e o
`desenharVersos()` limpa o `main` inteiro antes de redesenhar. A segunda troca
de Kadish com o telefone deitado **apagava a dedicatória de vez**, sem erro
nenhum na tela. Por isso o `vagaDaDedicatoria()` a recria quando falta.


## O minyan e o "de pé", em destaque (04/09, v43)

Ele, depois de eu apontar que a página Aprender não mencionava o minyan:
*"devemos incluir a necessidade do minian em destaque e que seja recitado de
pé"* — e, em seguida: *"isso deve aparecer em algum lugar em destaque na página
principal"*. Entrou nos dois lugares.

**Na página Aprender** é um bloco `tipo: "destaque"`, o PRIMEIRO da página, com
fundo mais quente e barra de latão à esquerda. Fica antes do texto dele de
propósito: é o que se precisa saber antes de começar, e o resto da página é o
porquê.

**Na tela principal** é uma caixa no FLUXO do texto, logo antes do primeiro
verso — nunca no cabeçalho. A razão é a de sempre: o cabeçalho é altura que o
Kadish perde, e o piso é 60%. Ali ela não custa um pixel de leitura: está na
tela no instante em que ele abre o app, que é exatamente quando a informação
serve, e sobe com o texto quando ele começa a rezar. Aparece nos dois modos —
pensei em escondê-la no Treino, e desisti: é justamente quem está aprendendo
que precisa saber que a reza pede dez.

**Nenhuma frase é nova.** As duas saíram do que já estava aprovado nas 8
línguas dentro do app: o parágrafo do minyan do painel da ℹ e o "recitado em
pé" do `prayer_source`. Regra 5: o modelo não escreve texto religioso.

**E a checagem do texto dele mudou de pergunta, sem afrouxar.** O
`testar-aprender.mjs` comparava a página INTEIRA, palavra por palavra, com
`fontes/aprender-pt-2026-09-03.txt` — era assim que ninguém podia "melhorar" o
que é dele. Um bloco que não é dele quebraria a comparação, e havia dois
caminhos: afrouxar a conta (que a regra 3 proíbe) ou dizer, seção a seção, de
quem é o texto. Agora **toda seção declara `origem`**: as seis dele são
`origem: "erez"` e continuam conferidas palavra por palavra (742 palavras); o
bloco novo é `origem: "app"`, com uma nota dentro do próprio arquivo dizendo
que foi a pedido dele e que espera o OK dele e do rabino. Quem acrescentar um
bloco tem de assumi-lo por escrito; quem mexer numa palavra dele continua
ficando vermelho.

**A VERSÃO passou a ir no endereço do `aprender.html`.** O `aprender.json` é
buscado com `cache: 'no-cache'`, mas a própria página — onde moram o desenho e
o bloco em destaque — é servida pelo GitHub Pages com o cache dele. Sem isso ele
veria o texto novo com a página de ontem. É a mesma lição do `versao.json` e do
`DADOS` do `sincronia.html`.

**A armadilha do `const` em TDZ apareceu pela segunda vez no mesmo dia**, agora
na nota do minyan: a pintura pode acontecer antes de o `const I18N` existir.
Mesmo remédio — leitura protegida e `data-i18n` no `<span>`, para o `applyI18n`
preencher na primeira volta. Se aparecer uma terceira vez, o conserto certo é
mover as tabelas para o topo do script, não repetir o remendo.

**Cinco pontos do texto dele que ficam esperando o rabino** (analisados em
04/09, a pedido dele):

1. **"Escrito em aramaico"** — os dois últimos versos dos oito Kadishim são
   HEBRAICO (`עֹשֶׂה שָׁלוֹם בִּמְרוֹמָיו · הוּא יַעֲשֶׂה שָׁלוֹם...`). Quem lê a explicação e
   rola até o fim vê a contradição. "Escrito quase todo em aramaico" resolveria.
2. **Os 11 meses e os quatro nussachim** — o texto diz "o costume tradicional"
   sem dizer de quem. Entre sefaradim é largamente difundido recitar pelos doze
   meses, com interrupção. É halachá, é do rabino, e é a pergunta que mais
   importa num app que serve os quatro.
3. **`יהי זכרו ברוך` traduzido como "que sua memória seja uma bênção"** —
   *baruch* é "bendita"; "seja uma bênção" é a tradução de `זכרונו לברכה`. Ou
   muda o português, ou muda o hebraico.
4. **O texto só fala de pais** — para cônjuge, irmão ou filho o costume é de
   trinta dias, e a dedicatória do app aceita qualquer pessoa.
5. **O minyan não aparecia** — este foi resolvido nesta versão.


## A briga por 50 pixels no iPhone SE (04/09, v44)

Ele: *"quero aumentar o em memória, está muito pequeno, bem menor em fonte que
o texto da necessidade de 10 (minian)"*. Tinha razão na comparação: o nome
media 16,8px e a nota do minyan 14px — perto demais para uma ser o nome de um
morto e a outra uma instrução.

Agora o nome é o maior texto da moldura:

| | rótulo | nome | nota do minyan |
|---|---|---|---|
| computador · iPad · celular alto | 16px | **21,6px** | 14px |
| celular baixo | 13px | **17px** | 14px |

**E aqui a conta que decide tudo, escrita de uma vez para não se refazer a cada
rodada.** Num iPhone SE (375×667), no modo reza: o cabeçalho mede 124px, a
barra de baixo 92px, e o piso de 60% deixa **50px** para a dedicatória. Nesses
50px cabem **duas** destas três coisas, nunca as três:

1. letra maior,
2. o nome hebraico ao lado do nome latino,
3. ficar grudada no alto acompanhando a leitura.

- **v42** escolheu 2+3: letra pequena, hebraico visível, 63% de sobra.
- **v44** ele pediu a letra maior. Com o hebraico a 16px a linha quebrava em
  duas, a dedicatória ia a 53px e a sobra caía a **59,5%** — abaixo do piso, e
  o `testar-telas.mjs` reprovou. Entre a letra que ele pediu e o hebraico, vale
  o pedido dele: **o hebraico sai, e só naquele tamanho de tela.** Em celular
  alto, iPad e computador os dois aparecem, e no ⚙ ele continua inteiro.

Medido depois: 63% no iPhone SE em pé, 61% deitado, 64% no iPhone 15, 70% no
computador.

**A nota do minyan numa linha só**, também a pedido dele. Os dois `<span>`
viraram `inline` e o espaço entre eles vem de um `::before` — no HTML eles
estão colados, e sem isso sairia "…sozinho.E é recitado". A caixa foi de 30em
para 40em para a frase caber corrida numa tela grande; num telefone ela quebra
por largura, que é quebra de texto e não desenho.


## O piso que faltava: CONTRASTE (04/09, v45)

Ele: *"o texto do em memória ficou muito pequeno e apagado, o que sugere"*.
Medido contra o fundo de pergaminho, e ele estava certo com folga:

| | tamanho | contraste |
|---|---|---|
| "Em memória e pela elevação da alma de:" | 16px itálico | **3,65 : 1** |
| a nota do minyan | 14px | 8,92 : 1 |
| o nome | 21,6px | 13,82 : 1 |

O rótulo estava a **um terço** do contraste da nota, e abaixo de 4,5:1, que é o
mínimo para texto corrido. Somado ao itálico, que afina as letras, dava
exatamente o "apagado" que ele viu. E com o memorial VAZIO era pior: o convite
inteiro estava nesse 3,65 — a linha que a pessoa precisa **achar** para
cadastrar era a mais apagada da tela.

**O conserto foi de COR, não de tamanho:** o rótulo saiu de `--text-faint`
(#8a7860) para `--text-soft` (#4d3d2d) — 8,92:1, o mesmo da nota do minyan.
Continua sendo legenda (menor, itálico, discreta ao lado do nome). O convite
foi junto, e a opacidade dele subiu de .72 para .85. No celular o rótulo curto
foi de 13px para 14px, casando com a nota. Nenhuma altura mudou: 63% de sobra
no iPhone SE em pé, 61% deitado, 70% no computador.

**A lição, e é uma falha de projeto e não um detalhe desta tela:** este projeto
tem piso de TAMANHO (12px de texto, 30px de botão) e **não tem piso de
CONTRASTE**. Era por aí que a tela podia ficar ilegível sem nenhuma das
dezessete checagens acusar — o mesmo formato dos outros buracos que já custaram
caro aqui (o `canPlayType`, o `temState`, a página que ninguém rolava). Se um
dia sobrar tempo, o `testar-telas.mjs` deveria medir contraste como já mede
altura de botão.


## O tamanho do rótulo, escolhido por ele olhando (09/09, v46)

Ele: *"gostaria de aumentar a fonte em 'em memória e pela elevação da alma de',
o que sugere?"*. Levei **quatro tamanhos à tela dele**, com o nome fixo em
21,6px nas quatro para só o rótulo variar: 16px (como estava), 17,6px, 19,2px e
21,6px. Sugeri 17,6px; **ele escolheu 19,2px**, e a escolha é dele.

O limite de cima é 21,6px, que é o tamanho do NOME: ali os dois empatam e, como
a frase é longa e o nome é curto, a frase passa a pesar mais na tela que o nome
do falecido — o contrário do que uma dedicatória quer dizer. A 19,2px a
proporção rótulo/nome é **0,89**, ainda abaixo de 1.

No celular pequeno quem aparece é o rótulo curto ("Em memória de"), que foi de
14px para **15px** — a mesma proporção. Continua numa linha só e o bloco
continua medindo 31px.

Medido nas 14 combinações (7 telas × com e sem nome), todas acima do piso de
60%: 70,0% no computador, 74,2% no iPad em pé, 67,1% no iPad deitado, 63,4% no
iPhone 15, 62,8% no iPhone SE em pé e 61,3% deitado.

**A prática que funcionou, e vale repetir:** quando ele pergunta "o que
sugere?" num assunto de aparência, a resposta útil não é um parágrafo — é a
tela dele com as opções lado a lado e uma recomendação junto. Ele decidiu numa
mensagem.


## O rótulo empata com o nome, por decisão dele (09/09, v47)

Vendo a v46 na tela, ele: *"ainda está pequeno, pode fazer pelo D — igual ao
nome, 21,6px"*. Feito. Eu disse o porém as duas vezes — a 21,6px o rótulo empata
com o nome e, como a frase é longa e o nome é curto, a frase passa a ocupar mais
tela que o nome de quem partiu — e ele reafirmou. É decisão dele; fica assim.
Se um dia voltar atrás, o caminho é 1,2rem no computador e 15px no celular, que
foi a v46.

**E o pedido dele descobriu um defeito de regra que era meu.** A forma compacta
da dedicatória era escolhida **só pela altura** da tela (`max-height: 700px`).
Com o rótulo a 21,6px, um **iPhone 15 EM PÉ** (393×852) continuava na forma
cheia — e ali a frase quebra em duas linhas, a dedicatória vai a **123px** e a
sobra cai a **60,1%**. Passava por um décimo, e um nome um pouco mais longo
derrubaria.

Um telefone em pé é **estreito mesmo sendo alto**: nenhuma tela de 393px segura
"Em memória e pela elevação da alma de:" a 21,6px numa linha. A regra passou a
ser `(max-height: 700px), (max-width: 480px)` — 480px é a mesma fronteira que o
resto do arquivo já usa para dizer "isto é um telefone". Medido depois, o
iPhone 15 em pé foi de **60,1% para 70,9%**.

A lição, que é a mesma que já aparece três vezes neste arquivo: **uma regra
escrita sobre uma dimensão só mente na tela onde a outra dimensão é que aperta.**

Medido nas 14 combinações: 69,7% no computador, 74,0% no iPad em pé, 66,7% no
iPad deitado, 70,9% no iPhone 15 em pé, 62,8% no iPhone SE em pé, 61,3%
deitado.


## O fio curto no lugar do risco (09/09, v48)

Ele, vendo a v47: *"ficou ótimo, só queria alguma opção diferente, ao invés da
linha separando o em memória de do texto do kadish"*. Levei cinco à tela dele,
todas com a página já rolada — que é quando aquele risco pesa, com o Kadish
passando por baixo: (A) como estava, (B) nada, (C) fio curto que desbota,
(D) um ✦ em latão, (E) sombra suave. **Ele escolheu a C.**

Ela era a recomendação, e não por gosto: é a **única que já existia no
vocabulário do app** — o mesmo desenho do `.vm-line`, o fio que abre o primeiro
verso do Kadish. A dedicatória passa a fechar com o traço com que a reza começa,
em vez de uma régua de canto a canto que não tem par em lugar nenhum da tela.
(O ✦ foi descartado por um motivo concreto: ele já é o ícone do cartão "Por que
dizemos o Kadish?", e repetido deixa de significar.)

**A classe `com-dedicatoria` vem do JS, e isso é o ponto desta rodada.** O fio
só vale quando a vaga está DENTRO do cabeçalho; num telefone deitado ela vive no
fluxo do texto e o primeiro verso já traz o seu próprio `.vm-line` — dois fios
empilhados. Dava para escrever `.topbar:has(> .dedicatoria-fixa)`, e foi a
primeira coisa que me ocorreu. **Num navegador sem `:has()` a regra inteira é
ignorada em silêncio: o risco do topbar FICA e o fio aparece — duas linhas, e
nenhuma checagem daqui veria.** É literalmente o desvio-de-caminho do
`canPlayType`, que já custou dias do iPad dele. Quem decide onde a vaga mora já
é uma função (`vagaDaDedicatoria`), então é ela quem marca a classe: uma conta
só, sem depender do que o navegador *talvez* suporte.

Medido nas 14 combinações, e a troca é limpa: onde a vaga está no cabeçalho o
fio existe e o `border-bottom` do topbar mede **0px**; onde ela está no texto o
fio não existe e o risco volta a **1px**. Sobra para o Kadish: 69,1% no
computador, 73,6% no iPad em pé, 66,1% deitado, 70,3% no iPhone 15, 62,1% no
iPhone SE em pé, 61,3% deitado.


## De uma pessoa para VÁRIAS (09/09, v49)

Ele: *"cadastrar mais de uma pessoa… quando tiver mais de uma, o usuário poderá
selecionar"*, e a linha que ele quer ver: *"Haim Chalom filho de Esther e Ezra"*.

**O armazenamento.** Era um objeto em `tefila_memorial`. Agora é
`{ lista: [pessoa], atual: <id> }` em `tefila_memoriais`. A pessoa `atual` é a
que aparece na TELA; **todas** entram nos avisos de yahrzeit — quem se foi não
deixa de ter yahrzeit porque a reza de hoje é de outro.

**A chave antiga não é apagada.** Ela vira o primeiro da lista e fica onde está,
como cópia de segurança. Migração é o tipo de código que roda uma vez na vida do
aparelho: se falhar, falha calada e sem testemunha, e o que se perde é o nome do
pai de alguém. Provado num navegador: 1 pessoa, virou a atual, nome preservado,
chave antiga intacta.

**As três portas de sempre continuam** — `loadMemorial`, `saveMemorial`,
`clearMemorial`. Mudou o que está por baixo, não o nome da porta, e por isso o
resto do app (e o `testar-telas.mjs`, que escreve na chave antiga) continua
funcionando sem uma linha de mudança.

**"filho de Esther e Ezra" e o botão Filho | Filha.** Para escrever *filho* ou
*filha* o app teria de saber o sexo, e ele mesmo cortou essa adivinhação em
04/09. Então quem cadastra escolhe, num toque. **Sem escolha, a linha da
filiação não aparece** — nunca sai um "filho" chutado. O padrão da frase vem da
tabela I18N, um por língua: isto é gramática, e não se monta com pedaços
("filho" + "de" + nome) sem quebrar em metade das línguas. O hebraico precisa do
*vav* colado (`{a} ו{b}`), e é por isso que até o "e" é um padrão de tabela.

**Duas línguas ficam devendo revisão humana, e está anotado:**
- **Russo** — "сын Эстер и Эзра" pediria genitivo nos nomes próprios, que não se
  declina automaticamente. Usei um travessão (`сын — {a}`), que não é erro, mas
  um falante deveria ver.
- **Francês** — "fils de Esther" é erro; diante de vogal a preposição elide
  (`d'`). É a **única regra de gramática que o app aplica sozinho**, escrita em
  código no `textoFiliacao`.

**A pergunta do pôr do sol.** Quem faleceu depois do pôr do sol já entrou no dia
judaico seguinte. Sem essa pergunta o yahrzeit cai um dia errado **todos os
anos**, e ninguém tem como desconfiar. Entra em branco de propósito: não há
padrão seguro, e sem resposta vale a data como foi digitada, que é o
comportamento de antes.

**O `.ics` leva todas as pessoas, num arquivo só.** Dois calendários colados não
valem — um `.ics` tem um cabeçalho só —, então os eventos de cada pessoa são
extraídos e embrulhados juntos. **O UID leva o id da pessoa**: sem isso, duas
pessoas com yahrzeit no mesmo dia viram UM evento no calendário do telefone e um
dos nomes some sem aviso. Medido: 40 eventos (20 anos × 2 pessoas), um cabeçalho,
os dois nomes.

**No telefone a filiação não aparece**, e é a briga dos 50px de novo: com ela a
dedicatória vai a duas linhas e o Kadish cai abaixo do piso. Está inteira no
iPad, no computador e dentro do ⚙.

**Uma checagem ficou vermelha, e o conserto foi para MAIS forte.** A
`testar-dedicatoria.mjs` apagava a chave `tefila_memorial` por fora e esperava o
convite voltar. Com o cadastro na chave nova, ela passou a olhar o lugar de
ontem. O conserto **não** foi apontar para a chave nova: foi passar a apagar
pelo **caminho do app** (o `removerPessoa`, que é o ✕ da lista). Assim ela prova
o que interessa — quem tira a pessoa vê o convite voltar — e continua valendo se
o armazenamento mudar outra vez. E ganhou uma linha que faltava: **cadastrar
outra pessoa e provar que o convite some**, senão um defeito que nunca mostrasse
a dedicatória passaria verde nas duas linhas anteriores.


## O Destaque medido em pixel fixo, e o padrão que virou (09/09, v50)

Quatro pedidos numa mensagem, mais dois achados numa foto do computador dele.

**1. O texto do minyan é dele agora, palavra por palavra:** *"O Kadish exige
minyan de dez homens adultos e é recitado de pé. Não se recita sozinho, de
preferência deve ser recitado na sinagoga durante o ano do falecimento."* Nos
dois lugares — a nota da tela principal e o bloco da página Aprender — e nas 8
línguas. O português é dele; as outras sete são tradução, e o bloco continua
`origem: "app"`, esperando o rabino.

**2. O único link para fora de todo o app** entrou aqui: o diretório dos Beit
Chabad, a pedido dele (*"onde encontrar um beit chabad para fazer o kadish"*).
É um `tipo: "link"` novo no `aprender.json`, com o rótulo do botão numa língua
por vez — é texto de conteúdo, não da moldura, então mora na seção e não na
tabela `T` da página. Abre noutra aba, com `rel=noopener`: quem está rezando não
perde a página do Kadish por tocar num link.

**3 e 4. Ficou dito que é o falecido.** Os botões ganharam a pergunta acima
("O falecido era filho ou filha?") e os campos viraram "Nome da mãe do falecido"
e "Nome do pai do falecido", nas 8.

**E então ele mandou uma foto do computador: "as letras da tradução e
transliteração estão pequenas".** Estavam, e o motivo estava escrito no CSS:

```css
body.focus-heb .translit  { font-size: 14px; }   /* PIXEL FIXO */
body.focus-heb .pt-merged { font-size: 12px; }
```

O app cresce a letra com a tela desde 27/08 — 28px no celular, 34px no iPad,
40px no computador — mas o **Destaque nunca cresceu junto**. Num computador de
2000px a transliteração ficava presa em 14px, um terço do hebraico ao lado. E o
mesmo defeito pelo avesso no `focus-tr`: 26px fixos, que numa tela grande é o
tamanho NORMAL — ou seja, ali o Destaque **não destacava nada**.

Agora as nove regras são multiplicação do tamanho base, e há um bloco por faixa
de tela. Os fatores saem dos números antigos do CELULAR, onde foram calibrados
(36/28 para o hebraico em foco, 14/19 para a transliteração apagada), então **no
celular a tela fica idêntica ao que ele aprovou** e nas outras cresce.

**A lição, que é a terceira da mesma família neste arquivo:** um número absoluto
escrito dentro de uma regra que convive com regras responsivas mente em toda
tela que não seja aquela para a qual foi calibrado. Foi assim com a coluna de
720px em 27/08, com a forma compacta que só olhava a altura em 09/09, e agora
com o Destaque.

**O PADRÃO DO APP mudou, por decisão dele:** *"deixar como padrão do app a
transliteração em destaque"*. Estava escrito aqui que o padrão eram as três em
Normal, e o motivo era bom — "Destaque" apaga as outras duas para 45%, e ninguém
deve abrir o app com uma camada meio apagada sem ter pedido. **O argumento dele
é mais forte que o meu:** a transliteração é a linha que a BOCA lê, e num app
cujo trabalho é fazer alguém conseguir dizer o Kadish, ela é o texto principal.

Isso obrigou uma **limpeza de uma vez só** com marca nova
(`tefila_camadas_padrao_0909`): padrão só vale para quem nunca escolheu, e sem
trocar a marca o aparelho dele nunca veria o padrão novo. Custo assumido e dito
a ele: quem tinha escolhido outra coisa de propósito perde a escolha nesta
virada.

**Nove linhas do `testar-camadas.mjs` ficaram vermelhas, e as nove eram a mesma
decisão dele escrita em nove lugares** — oito línguas mais a da limpeza, todas
cobrando "abrem em Normal". Atualizadas para o padrão novo **sem afrouxar**:
continuam exigindo os três valores exatos, um a um, e que só uma camada esteja
em destaque. A da limpeza mudou de alvo com razão: cobrava "volta a tudo
Normal", agora cobra "chega ao PADRÃO do app" — que é o que ela sempre quis
dizer.


## Três portas na mesma linha, e um defeito que eu inventei (10/09, v51)

**1. Três portas onde havia uma**, a pedido dele: *"incluir na linha onde está
✦Por que dizemos o Kadish? mais dois links"* — "na linha", e é literal. Uma
embaixo da outra custaria três vezes a altura do cabeçalho, e altura de
cabeçalho é Kadish a menos. Lado a lado, a linha continua medindo **36px**:
mesmo cabeçalho, três caminhos.

| | leva para |
|---|---|
| Por que dizemos o Kadish? | a página Aprender, no texto dele |
| O que é o Kadish? | o painel da ℹ, que já tinha "O que é" nas 8 línguas — **zero texto novo** |
| Onde encontrar um Beit Chabad? | a página Aprender, na âncora `#chabad` |

O subtítulo saiu da primeira porta: com três títulos na mesma linha não há
espaço, e ele dizia justamente o que as duas portas novas agora dizem sozinhas.

**2. A pergunta do cadastro é dele.** Eu tinha escrito "O falecido era filho ou
filha?", ele achou confusa — e estava: toda pessoa é filho ou filha de alguém.
Ofereci três redações e ele escreveu a quarta: **"O(a) falecido(a) era homem ou
mulher?"**, com os botões passando a dizer **Homem | Mulher**, para pergunta e
resposta falarem a mesma língua. O valor guardado continua sendo filho/filha,
que é o que monta a frase.

**3. A frase do minyan mudou outra vez, e continua sendo dele:** *"…Não se
recita sozinho, após a shivá (7 dias de luto) deve ser recitado na sinagoga
durante o ano do falecimento."*

**4. Um defeito de verdade, que eu criei nesta rodada.** O botão antigo chamava
`irParaAprender` **direto** como ouvinte. Quando a função ganhou o parâmetro da
âncora, ela passou a receber o EVENTO do clique no lugar dele — e montaria
`…#[object PointerEvent]`. Ninguém veria: a página abriria igual, só não rolaria
para lugar nenhum. Agora é `() => irParaAprender()`, com o porquê escrito ao
lado.

**5. E um defeito que eu INVENTEI, o que é pior.** Medi a âncora e vi a seção
parando a **475px** do alto da janela. Tomei por defeito e escrevi duas
correções — uma rolagem repetida e um `document.fonts.ready` —, **as duas com
comentários afirmando um defeito medido**. O número não mudou nenhuma das duas
vezes. Só então medi a coisa certa:

| | |
|---|---|
| rolagem | 2910 |
| rolagem **máxima** da página | 2910 |
| seção inteira na tela | sim (topo 475, fim 749, janela 900) |

A seção do Beit Chabad é a **última**: chegando ao fim do documento não há mais
para onde rolar, e ela não encosta no alto porque não existe conteúdo abaixo
dela. **Nunca houve defeito.** As duas correções saíram e o achado verdadeiro
ficou escrito no `aprender.html`.

A lição, e ela é sobre mim: **escrever no código que um defeito foi medido, sem
ter medido a coisa certa, é pior que código inútil — é uma mentira deixada para
quem ler depois.** Duas correções entraram antes de eu conferir se havia o que
corrigir. A regra que já existia aqui — medir antes, e medir a pergunta certa —
vale também quando o número parece obviamente errado.

## Três portas com pop-up, o QR e o panfleto (10/09, v52)

Quatro pedidos numa mensagem, mais dois que ele mandou tirar no meio da rodada.

**1. As três portas abrem pop-up, com o conteúdo daquela porta e só dele.**
Ele: *"quando clicar nos menus, abrir pop ups só com o conteúdo relevante ao
menu e com título igual ao do menu"*. Antes, duas das três largavam a pessoa na
página Aprender inteira e a terceira abria o painel da ℹ completo — quem
perguntava "o que é o Kadish?" recebia tudo o que o app sabe e tinha de procurar.

**Zero texto novo.** As duas primeiras portas montam o pop-up com seções da
tabela `SOBRE`, que já existe nas 8 línguas, e a do Beit Chabad busca o
`aprender.json` na hora e usa a seção com `ancora === 'chabad'`. O que muda é
quais seções entram:

| porta | o que o pop-up mostra |
|---|---|
| O que é o Kadish? | SOBRE 0 e 2 (o que é · desde quando) |
| Por que dizemos o Kadish? | SOBRE 1 e 3 (por que · por que em comunidade) + "ler mais" |
| Onde encontrar um Beit Chabad? | a seção do `aprender.json` + o botão para o diretório |
| o ℹ (que continua existindo) | as quatro seções, com o rodapé |

**As seções são escolhidas por POSIÇÃO, nunca pelo título.** O título muda de
língua; o índice não. Escolher por texto funcionaria em português e falharia
calado nas outras sete — é exatamente a família de defeito que este arquivo já
registra três vezes.

**2. A frase do minyan mudou de novo, e continua sendo dele**, palavra por
palavra: *"O Kadish exige minyan de dez homens adultos e é recitado de pé. Deve
ser recitado normalmente numa sinagoga durante o período de luto."* Nos dois
lugares (a nota da tela principal e o bloco da página Aprender) e nas 8 línguas.

**3. O QR: `gerar-qr.mjs` → `qr/kadish.svg` e `qr/kadish.png`.**
**UM código, e não um para iPhone e outro para Android.** Não há app nas lojas;
o que existe é um endereço na web, e um endereço é um endereço. Dois códigos
seriam duas contas para a mesma pergunta — o defeito que este projeto já pagou
caro mais de uma vez.

O script **lê o código de volta** com uma câmera de software (zxing) antes de
dar por feito, e reprova se o que sai não for o endereço que entrou. Sem isso,
um QR quebrado só se descobre com a folha já impressa e pendurada na parede.
Correção de erro `h` (o nível mais alto), na cor do app.

**4. `panfleto.html` — a folha A4 para o display da sinagoga.**
Nas 8 línguas (`?lang=`), uma folha só, `@page A4`. O QR é o **SVG**, nunca o
PNG: numa folha impressa o SVG não perde nitidez em tamanho nenhum, e QR borrado
não lê.

**O primeiro desenho pôs o QR num canto de 62mm e sobrou um vazio de 400px no
meio da folha.** Numa parede isso é o defeito inteiro: quem passa a um metro
tem de ver o CÓDIGO, não ler a página. Agora o QR é o centro, com **88mm de
lado**, e as duas explicações ("Como usar" · "O que o app faz") ficam embaixo em
duas colunas. Medido nas 4 línguas conferidas: uma página no PDF, o hebraico em
RTL com as colunas e a barra da nota espelhadas, nenhum erro de console.

**5. O contador de almas SAIU, e ele estava certo.** Ele: *"retirar no menu
configurações: Junto com você, neste ano, 12.847 almas estão sendo honradas pelo
mundo mock"*. Aquilo era **um número inventado**, com uma etiqueta "mock" ao
lado — escrito um dia como enfeite de maquete e nunca ligado a coisa nenhuma.
Um app que serve enlutados não pode dizer um número que não mediu. Saíram o
bloco, o CSS e as 8 chaves `honoring_*`. O contador de verdade continua onde
sempre esteve (`contador.js`, por aparelho, e o Cloudflare esperando o endereço
dele).

**6. O aviso "Rascunho — este conteúdo ainda não foi revisado pelo rabino" saiu
da página Aprender**, a pedido dele. **O registro NÃO saiu:** o
`revisado_pelo_rabino: false` continua no `aprender.json`, e o
`testar-aprender.mjs` continua cobrando que ele seja `false` — o que mudou é a
legenda na tela, não a verdade no arquivo.

E a checagem **mudou de pergunta sem afrouxar**: ela cobrava "a página MOSTRA o
aviso"; agora cobra "a página NÃO mostra o aviso". Continua sabendo falhar — se
alguém repuser o aviso, ela acusa a língua pelo nome. Deixá-la só de olho em
outra coisa é que teria sido afrouxar.

A marca d'água **RASCUNHO — AGUARDANDO REVISÃO RABÍNICA dos folhetos
imprimíveis (`gerar-pdf.mjs`) continua**: aquilo é papel que vai à mão do
rabino, e ele não pediu para tirar de lá.

## As três portas no telefone, e a conta que media a coisa errada (10/09, v53)

Ele mandou a foto do iPhone ao lado da do computador: *"no app no iPhone não
aparece a fileira com as 3 explicações… como podemos fazer o menu do app ficar
mais friendly, mais parecido com o que temos no computador, talvez ocultando a
frase o Kadish exige minian, que ocupa boa parte da tela"*.

**Por que ela sumia, e não era gosto meu.** No computador os três cabem lado a
lado. Num iPhone não: com os títulos inteiros e `flex: 1 1 220px`, três botões
de 220px numa tela de 375 **empilham em três linhas — 119px** de cabeçalho, e a
sobra caía a 42%. O que estava errado era o FORMATO, não a ideia.

Agora ela cabe, e a troca é honesta: **30px de fileira, pagos pelas 27px que a
nota do minyan devolve.** Medido no iPhone SE: o primeiro verso começava a
304px e passou a começar a 303px — o Kadish não perdeu um pixel e o telefone
ganhou as três portas.

- **Rótulo curto só no telefone**, em `<span class="ls-curto">` ao lado do
  inteiro. São DOIS spans e não uma troca de texto por JS: cada um leva o seu
  `data-i18n` e o `applyI18n` preenche os dois na mesma volta, então não há
  caminho em que um fique em português nas 8. O **título do pop-up continua o
  inteiro** — a pergunta completa aparece ao tocar.
- **`flex: 1 1 auto`, nunca `1 1 0`.** Com base zero os três recebem a mesma
  largura, e as três perguntas não têm o mesmo tamanho: "Por que dizemos?" saía
  **"Por que dize…"**. Com base `auto` cada um parte da largura do seu texto.
- **12px e o ✦ some.** A primeira tentativa usou 11.5px e um ✦ de 9px, e o
  `testar-telas.mjs` acusou os dois pelo nome — 12px é o piso do projeto. O ✦
  sai em vez de encolher: ele é enfeite, quem precisa caber é a palavra.
- **A nota do minyan mostra só a primeira metade no telefone** (`nm-inicio` /
  `nm-resto`). Não é frase reescrita: são as palavras dele, e o telefone mostra
  menos delas. A segunda continua inteira no ℹ e na página Aprender.

**O buraco que isto descobriu, e é o mais importante da rodada.** O piso de 60%
descontava o cabeçalho e a barra de baixo e **dava todo o resto por Kadish**.
Não é: a caixa do minyan mora no FLUXO do texto, acima do primeiro verso, e
comia 85px sem nada acusar. A checagem dizia 61% e o Kadish tinha **41%** da
tela — **2 versos de 16** visíveis na primeira tela de um iPhone SE. Mesmo
formato dos outros buracos daqui (`canPlayType`, `temState`, a página que
ninguém rolava), com um agravante: **este estava dentro da conta que já
existia.**

Agora a pergunta é onde o **PRIMEIRO VERSO** começa, e ela achou logo um defeito
de verdade: **no telefone DEITADO chegavam aos versos 18% da tela.** Um iPhone
SE deitado tem 667px de LARGURA, então as regras de `max-width: 640px` nunca
chegaram nele e ele mostrava a nota inteira. É a mesma lição de 09/09 — *uma
regra escrita sobre uma dimensão só mente na tela onde a outra dimensão é que
aperta*. Deitado a nota agora sai inteira, pela razão que já tira dali o cartão
e o sufixo do tipo: quem vira o telefone de lado quer ler. Foi de 18% para
**42–45%**.

**E o MIN_LEITURA deixou de ser o juiz.** Com a fileira dentro do cabeçalho ele
reprovava o iPhone SE (56%) numa mudança em que o Kadish ficou com a MESMA
altura (41% antes e depois): os mesmos 30px, só que do lado de dentro de uma
linha arbitrária. **Isto não é afrouxar.** O `MIN_KADISH` cobre tudo o que ele
cobria — cabeçalho mais alto empurra o primeiro verso para baixo — mais o que
ele nunca viu. E para isso não ser só uma porta aberta com placa de fechada,
existe a **prova**: `node testar-telas.mjs <base> --provar` incha o cabeçalho
em 200px e exige que a checagem fique VERMELHA. Roda e acusa (11%).

O `MIN_KADISH = 0.40` é **catraca, não ideal**: é o pior caso medido hoje (41%,
iPhone SE em pé, na reza). Sobe quando o pior caso subir; nunca desce.

**O número que fica para ele decidir um dia:** num iPhone SE ainda são 2 versos
de 16 na primeira tela. O cabeçalho do telefone tem 204px em quatro linhas,
contra uma linha no computador. Ele perguntou sobre isso e ficou para depois de
testar esta versão — uma mudança de comportamento por versão.

## O icone na tela do telefone (10/09, v54)

Ele: *"queria um qr code que gerasse um ícone no iphone/android para acesso ao
app"*.

**A correção honesta veio primeiro, porque muda o que dá para prometer: um QR
só carrega um endereço.** Nenhum código de barras instala coisa alguma — nem o
da App Store. Quem faz o ícone aparecer é a PRÓPRIA PÁGINA, e ela precisava de
duas coisas que não tinha. **O QR não mudou e não precisava mudar.**

**1. O manifesto era mentira, e ninguém podia ver.** Ele existia — embutido no
HTML como um `data:` — com **um ícone em SVG**. O Android **não instala com
ícone SVG**: pede PNG de 192 e de 512. Ou seja, o "Instalar app" **nunca podia
aparecer**, e nada dava erro em lugar nenhum. É exatamente o formato do
`canPlayType` e do `temState`: um caminho que ninguém visitava. O `start_url`
também apontava para `./` (o index.html) e não para o app — quem instalasse
cairia na porta errada.

Agora é `manifest.webmanifest`, arquivo de verdade, com os três PNG e caminhos
**relativos** (o app é servido de subdiretório, e o endereço pode mudar — ele
está decidindo isso).

**2. `gerar-icones.py` desenha os quatro ícones**, e a folga muda por quê: o
Android **recorta o ícone em círculo**, então o `maskable` leva 20% de margem
em vez de 8%. O do iPhone é etiqueta separada — **o iOS ignora o manifesto para
o ícone** e lê só o `apple-touch-icon`.

**O erro que esse script me ensinou, e é dos bons.** A primeira tentativa
desenhou o ק com a **DejaVu Serif Bold, que não tem hebraico**: saiu o
retângulo vazio do "caractere ausente". E o meu teste disse que estava tudo
bem — **eu medi a CAIXA do glifo, e a caixa vazia também tem caixa.** Só
olhando o desenho é que se viu. Agora a prova compara o desenho do ק com o de
um caractere que não existe em fonte nenhuma; se forem iguais, o script para.
*Medir a coisa certa não é medir com cuidado — é escolher a pergunta certa.*

**3. O convite de um toque, e ele é diferente em cada sistema**, porque os dois
sistemas não instalam igual:
- **Android** avisa (`beforeinstallprompt`) e entrega um pedido guardado; o
  botão dispara a caixa do próprio sistema.
- **iPhone** não tem esse aviso. Ali **não há botão** — há a instrução
  ("Compartilhar → Adicionar à Tela de Início"). Prometer um botão que não
  instala nada seria mentir para quem está rezando.

Regras que o convite respeita: mora no **pé** da tela, nunca por cima do
Kadish; espera **12s** (quem abriu para rezar agora não pode receber uma caixa
na cara); some para sempre com "Agora não"; não aparece para quem já instalou;
e todo texto vem da I18N nas 8.

**Dois defeitos que a checagem nova pegou, e os dois eram reais:**

1. **A barra do áudio ficava POR CIMA do convite.** O botão aparecia na tela e
   não respondia ao toque. O `bottom` era um número fixo; agora é calculado da
   **altura medida** da barra, que muda (92px em pé, 66px deitado). A checagem
   não pergunta "estão sobrepostos?" e sim **"quem está no ponto do botão?"** —
   `elementFromPoint`, que é o que o dedo encontra.
2. **O aviso de privacidade tapava o convite**, e o meu primeiro conserto
   perguntou a coisa errada: *"o aviso está na tela agora?"*. Ele só aparece
   1,2s depois de carregar, então o convite passava no vão e o aviso caía por
   cima. A pergunta certa é **"ele já respondeu?"**, e a resposta mora no
   `localStorage` — a mesma conta que o próprio aviso usa. Uma conta só, de
   novo.

**`testar-instalar.mjs`** entrou no workflow. Ela cobra o manifesto, que todo
ícone existe mesmo (um caminho errado ali não quebra nada visivelmente: o
telefone só não oferece instalar), que o `start_url` abre o app, e o convite
nas 8 — inclusive que fora do português o texto é diferente do português.

**O desenho do ícone ficou com ele.** São dois: a estrela que o app já usa
desde 21/08 e o ק de קדיש. Levei os dois à tela dele e ele preferiu **ver no
telefone primeiro** — então **ficou a estrela**, que é o que já estava, e nada
mudou visualmente. Trocar é `python3 gerar-icones.py letra`.

## "Tentei e não aparece a opção" (10/09, v55) — o navegador de dentro da câmera

Ele tentou os dois toques e não achou nada: *"tentei, mas não aparece a opção:
iPhone/iPad: abrir o app → Compartilhar → Adicionar à Tela de Início"*.

**A foto respondeu.** Ele apontou a câmera para o panfleto e tocou no balão
amarelo do endereço — e isso abre uma **janelinha por dentro do próprio
aplicativo da câmera**, não o Safari. Nenhum navegador embutido tem "Adicionar
à Tela de Início": nem o da câmera, nem o do WhatsApp, nem o do Instagram. A
instrução estava certa e o caminho dele não passava por ela.

E há a segunda armadilha, que pega quem chega ao Safari certo: **a opção fica
abaixo da fileira de aplicativos**, e quem não rola a lista jura que não existe.

**O que entrou:**

1. **O app reconhece a janelinha embutida** (`ehEmbutido`) e, em vez de repetir
   uma instrução que ali não funciona, diz o que fazer: *"você abriu por dentro
   de outro aplicativo… copie o endereço e abra no Safari"*, com um botão que
   **copia o endereço**. Se a área de transferência for negada, ele mostra o
   endereço na tela para copiar a dedo — nunca fica sem fazer nada.
   Como se reconhece: no iOS o Safari de verdade põe `Safari/` no nome do
   navegador e a janelinha não põe; no Android a marca é `; wv)`; e há os nomes
   dos aplicativos (FBAN, Instagram, WhatsApp…), que são o sinal mais certo.

2. **"Como faço" abre os passos**, numerados, dentro do painel do ℹ **que já
   existe** — um overlay só no app, não dois. Três passos no iPhone, dois no
   Android, e o passo 2 diz em negrito o que ninguém conta: *"role a lista para
   baixo — é aqui que quase todo mundo desiste"*.

3. **O ícone de Compartilhar é DESENHADO em SVG**, nunca escrito com um
   caractere de fonte. É a lição do ק de 10/09 aplicada antes de doer: um glifo
   que a fonte não tenha vira retângulo vazio, e ninguém vê até olhar.

4. **O panfleto passou a dizer o NAVEGADOR** — "abra o endereço no **Safari**",
   "abra no **Chrome**" —, que era justamente a palavra que faltava.

**Um defeito antigo que apareceu no caminho, e vinha da v52:** o
`.info-note` tem fundo, borda e recheio, e os pop-ups o esvaziavam com
`textContent = ''` — o que deixa **uma caixa em branco na tela**. Estava assim
nos TRÊS pop-ups das portas desde a v52 e ninguém tinha visto. O conserto é uma
regra só, `.info-note:empty { display: none }`, que resolve os quatro lugares em
vez de cada um lembrar de escondê-la.

**E a barra do convite encolheu de três botões para dois:** a linha de resumo
dizia a mesma coisa que o botão "Como faço" ao lado dela, e num telefone de
390px isso espremia tudo e quebrava o título em duas linhas. Medido: 88px → 56px.

O `testar-instalar.mjs` cobra os dois caminhos — Safari (3 passos, com o
Compartilhar desenhado) e janelinha embutida (aviso + botão de copiar, e
**nenhum** passo) — e que os passos existam nas 8 línguas sem cair no português.

**E ela ficou vermelha nas 8 quando a linha de resumo saiu**, porque cobrava
justamente essa linha. **Mudou de pergunta sem afrouxar:** o que ela garantia
era *"no iPhone a pessoa é ensinada, na língua dela"*, e essa garantia não
encolheu — mudou de lugar. Agora ela cobra o botão **"Como faço"** (visível, com
texto próprio da língua e nos 30px de piso), e os passos em si continuam
conferidos um a um, nas 8, logo abaixo. É mais do que antes, não menos.

## O nome em hebraico, os lembretes escolhíveis, e "Onde rezar?" (11/09, v56)

Ele mandou seis coisas num "último teste". As do app entraram aqui; o domínio
saiu numa versão própria.

**1. Os rótulos pedem hebraico**, nas 8: *"Nome (de preferência em hebraico)"*,
*"Nome da mãe do(a) falecido(a) (de preferência em hebraico)"* e o mesmo para o
pai. O exemplo do campo virou `חיים בן עזרא`. É a prática tradicional — o nome
com que se reza é o hebraico.

**2. "Haim Chalom filho de Tera e Ezra" virou UMA frase**, e agora aparece
também no telefone. Ele: *"ao invés de 'em memória de Haim' deve ser 'Haim
filho de Tera (mãe) e Ezra (pai)'"*. O motivo de ele estar vendo só o nome
estava escrito no CSS: a filiação era um bloco separado embaixo e **saía do
telefone** desde 09/09, pela briga dos 50px. Agora é `display: inline` dentro da
frase do nome, a 0,86em. Medido: **43% aos versos** no iPhone SE, acima do piso
de 40%, e a dedicatória mede 22px.

**3. O botão de editar diz a PALAVRA.** Ele: *"poder clicar no nome e alterar"*
— e dava, pelo **✎**, que ele não achou. É o mesmo defeito de linguagem do
"Modo Reza" de 28/08: um desenho que só quem já sabe entende. A palavra
`mem_editar` já existia nas 8; o que mudou é que ela aparece, em vez de ficar só
no `title` — que num telefone ninguém vê, porque não há mouse parado em cima.

**4. Os lembretes do calendário viraram escolha**, quatro caixinhas **todas
marcadas**: quem não mexer em nada continua com os quatro avisos por 20 anos,
exatamente como antes. E aqui houve um defeito meu, pego na prova:

> **NÃO PEDIR é diferente de PEDIR NENHUM.** Na primeira versão, `[]` caía no
> padrão e devolvia os quatro avisos a quem tinha desmarcado as quatro caixinhas
> de propósito. Agora `null` (não pediu) → os quatro; `[]` (pediu nenhum) → o
> evento entra no calendário sem despertador.

Provado: 80 alarmes sem escolha · 0 com `[]` · 20 só com "no dia" · 40 com dois
· sempre 20 eventos.

**5. "Beit Chabad" virou "Onde rezar?"** (e "Onde rezar o Kadish?" nas telas
grandes), escolha dele entre quatro. Não exclui ninguém — serve para sinagoga,
minyan ou Beit Chabad — e o pop-up continua levando ao diretório do Chabad, que
é o único que temos.

**6. O campo "Nome hebraico (opcional)" saiu da TELA, e o dado NÃO saiu.** Com o
campo do nome pedindo hebraico, eram duas contas para a mesma pergunta — o
defeito que este projeto mais pagou caro. **Mas apagar o `<input>` do HTML teria
apagado o nome hebraico de quem já cadastrou**, calado: o `setupSave` lê o campo
e grava, então sem campo ele gravaria vazio no primeiro toque em Salvar. Ele
virou `type="hidden"`. Provado num navegador: abrindo e salvando um cadastro
antigo, o `חיים בן עזרא` continua guardado e continua na tela ao lado do nome.

**Uma nota sobre uma checagem vermelha que NÃO era defeito:** a
`testar-instalar` reprovou com `ERR_CONNECTION_REFUSED` porque duas rodadas
disputaram a porta 8896 e o servidor não estava de pé. Rodada sozinha, verde.
Isso não é motivo para confiar num vermelho — é motivo para ler o vermelho antes
de chamá-lo de falso.

## O cartão de 10 × 15 cm para o display de mesa (11/09)

Ele: *"quero colocar a folha num display, 15cm de altura por 10cm de largura,
me sugira 3 opções"*. O `panfleto.html` continua sendo o A4 de parede; o
`display.html` é o cartãozinho de mesa. Três formas, por `?f=A|B|C`, nas 8
línguas.

**A distância de leitura é o que decide o desenho, e ela é outra.** O A4 na
parede é visto a um metro ou mais, e por isso o código lá tem 80mm. O cartão de
mesa é olhado de passagem, a meio braço — mas o código não pode encolher à
vontade: uma câmera de telefone pede uns 3 cm para ler com folga, e papel em
cima de mesa pega reflexo.

| | o que tem | QR |
|---|---|---|
| **A** | o código e mais nada | **62mm** |
| **B** | o código e três passos | 46mm |
| **C** | o Kadish em hebraico, depois o código | 50mm |

Recomendei a **A**, pela razão acima: num cartão de passagem, quem tem de ser
grande é o código, não o texto.

**O `kadish.app` escrito por extenso voltou ao papel**, e isso mudou de figura
no mesmo dia: em 10/09 ele mandou tirar o endereço do panfleto, com razão —
`erezchalom-a18y.github.io/tefila-kadish` é longo, feio e tem o nome dele. Um
endereço curto que se decora é outra coisa: quem não conseguir apontar a câmera
digita.

**Uma pergunta que não é minha, e ficou dita a ele:** a forma **C** põe o texto
do Kadish num cartão que fica em cima de uma mesa, e isso tem implicação de
respeito ao texto sagrado. É do rabino. A e B não têm essa questão.
