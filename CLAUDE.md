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
- **Responder a revisoes/AUDITORIA-PT-2026-08-24.md** (10 itens). Em 24/08 ele
  disse: "reparei que algumas das frases dos 8 kadishim em portugues estao com
  traducao incorreta". Nos 42 versos distintos, o mesmo hebraico tem sempre o
  mesmo português — o defeito é outro: versos que são o MESMO texto com uma
  letra a mais ou a menos viraram dois itens na página de revisão, ele corrigiu
  um e o outro ficou como estava. O caso que muda sentido é o meshichêh
  ("apresse a vinda de" no chabad, "aproxime o" nos outros 4). Nada foi
  alterado: só ele decide, e a lista espera o sim ou não dele.

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

## Nunca

- git push --force
- alterar checar.mjs/checar-ritos.mjs para silenciar um vermelho
- deixar o ChatGPT (ou qualquer modelo) escrever direto no glossario.json
- deixar o Whisper (ou qualquer modelo) escrever nos sync/*.json ou nas âncoras
- afrouxar o prompt da revisão cega para produzir mais apontamentos
- gravar arquivos de texto em UTF-16 (foi um `echo >>` do PowerShell em UTF-16
  no .gitignore que quebrou o repositório uma vez — todo texto em UTF-8)
