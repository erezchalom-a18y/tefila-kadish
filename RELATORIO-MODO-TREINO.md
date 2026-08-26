# Modo Treino — o que estava errado, o que consertei

Auditoria de 26/08, feita a pedido do Erez: *"o modo treino está travando e
iluminando as palavras erradas, entre outros erros"*.

Tudo aqui foi testado num navegador de verdade, com o app servido de
subdiretório, como o GitHub Pages serve. Não é leitura de código: é o app
rodando.

---

## O resumo em três frases

O app não estava tocando a gravação do rabino. Estava lendo a reza com a voz
sintética do navegador — e acendendo as palavras no ritmo dessa voz, por
estimativa, sobre um texto antigo. Faltava **uma linha** para o app enxergar a
sincronia que a gente mediu; sem ela, todo o trabalho de medição de agosto
nunca chegou na tela.

---

## A causa raiz

O app guarda tudo o que sabe numa caixa chamada `state`. O pedaço de código que
liga o áudio do rabino e a sincronia medida perguntava, antes de agir:

> "a caixa `state` existe?"

E a resposta era **não** — por um detalhe da linguagem, aquela caixa não ficava
visível para quem perguntava daquele jeito. Então, calado, o app pulava:

- não carregava `tefila-audio/*.ogg` (a gravação do rabino),
- não ligava o texto medido de `sync/*.json`,
- caía no plano B: ler as palavras com a voz do navegador.

Uma linha (`window.state = state`) conserta isso. Mas ela sozinha destrava um
monte de coisa que estava escondida atrás — e é por isso que este relatório é
longo.

---

## O que estava quebrado (e agora está consertado)

### 1. A gravação do rabino não tocava · **grave**
O `play` chamava a voz sintética do navegador, palavra por palavra. O áudio do
rabino ficava carregado e nunca era tocado.
**Agora:** toca a gravação. Confirmado: `audioPlayer.play()` é chamado, e a voz
sintética não é usada nenhuma vez.

### 2. As palavras acendiam por chute · **grave** — *este é o "iluminando as palavras erradas"*
Sem a sincronia, o app acendia cada palavra num tempo **estimado** por contagem
de sílabas. Não tinha relação com o que o rabino estava dizendo.
**Agora:** acende pelo tempo medido do áudio. Conferido palavra por palavra nas
8 combinações — **815 palavras, zero erradas**.

### 3. O Modo Treino não pausava em verso nenhum · **grave** — *este é o "travando"*
Dois problemas somados:

- Em Yatom, os 8 versos que só existem no DeRabanan eram pulados — mas cada
  pulo virava uma "pausa". Você apertava ▶ e não acontecia nada. Oito vezes
  seguidas, em silêncio. Parece travamento porque, na prática, é.
- E no caminho do áudio inteiro a pausa por verso nem existia.

**Agora:** pausa no fim de cada verso, no tempo medido do áudio, e anuncia
"Pausado · toque ▶ para o próximo verso (3/16)". Verso pulado não vira pausa.

### 4. Retomar voltava para o começo · **grave**
**Agora:** ▶ retoma exatamente no início do próximo verso — conferido contra os
tempos de `sync/*.json`, com precisão de milésimo.

### 5. A velocidade .75× não chegava no áudio · **grave**
O botão `.75×` acendia, mas o áudio continuava em velocidade normal.
**Agora:** chega. E a repetição 2× também funciona — volta exatamente para o
início do mesmo verso.

### 6. Sair do Modo Treino não desfazia nada · **médio**
O aviso dizia "Modo Reza · leitura limpa, sem pausas" e a reza continuava a
.75× repetindo 2×.
**Agora:** devolve velocidade e repetição. E respeita você: se você escolheu
1.25× na mão, sair do treino não mexe nisso.

### 7. Trocar a tradição não trocava nada · **grave**
Você escolhia "Sefard", o crachá mudava — e o app continuava tocando Chabad,
com o texto do Chabad. Pior: o botão se chamava "Ashkenazi", nome que não
existe em lugar nenhum do projeto (as pastas são `ashkenaz`), então cair no
Chabad era o comportamento programado.
**Agora:** os quatro botões são **Chabad · Ashkenaz · Sefard · Sefaradi**,
com os mesmos nomes de `tefila-audio/` e `sync/`. Trocar troca o áudio e o
texto medido junto. Conferido nos quatro.

### 8. A palavra ficava acesa presa · **médio**
Passado o fim da reza, a última palavra (אָמֵן) ficava destacada para sempre.
Mesma coisa em qualquer trecho fora de verso.
**Agora:** apaga. E o fim é anunciado.

### 9. Barra de progresso e relógio parados em 0:00 · **médio**
**Agora:** andam, com o tempo real do áudio.

### 10. Apertar ▶ cedo demais acendia palavra errada · **grave**
Se você apertasse ▶ antes do arquivo de sincronia terminar de baixar (iPad em
4G, primeira abertura do dia), o app montava 99 marcações por estimativa. Aí a
sincronia chegava e as duas ficavam acendendo palavras ao mesmo tempo — uma
delas errada.
**Agora:** o app espera a sincronia (mostra "Carregando a sincronia…") e só
então toca. Se ela não vier em 5 segundos, toca do jeito antigo em vez de
travar.

### 11. Trocar Yatom/DeRabanan não trocava o áudio · **grave**
Mesma causa da linha faltando.
**Agora:** troca o áudio e o texto medido junto.

---

## O que eu testei

Está tudo em `testar-treino.mjs`, para você (ou eu) rodar de novo quando quiser:

```
python3 -m http.server 8896 --bind 127.0.0.1   # de um diretório que contenha tefila-kadish/
node testar-treino.mjs
```

São 10 grupos de teste, e cada um nasceu de um defeito real desta lista. Se um
ficar vermelho, o defeito voltou. Hoje: **verde**.

As duas checagens obrigatórias do projeto continuam verdes nos 8:

```
node checar.mjs        → VERDE: os 8 passaram
node checar-ritos.mjs  → VERDE: marcas de rito conferem nos 8
```

E o teste que já existia, `testar-app.mjs`, passa nas 8 combinações — com uma
ressalva que **não é minha e não é de agora**: ele acusa um 404 de
`/favicon.ico` na primeira página que abre (o app não declara um ícone, então o
navegador pede um que não existe). Conferi com as mudanças desligadas: o mesmo
vermelho aparece. Não silenciei essa checagem — isso seria contra as regras do
projeto. O conserto certo é o app passar a ter um ícone; é decisão sua, e enquanto
não for feito o vermelho vai continuar aparecendo em uma das 8 linhas, sempre
por esse motivo.

**Nada foi tocado** em `sync/*.json`, `ancoras.json`, `cortes.json` nem
`glossario.json`. As mudanças estão só em `engine.html` e `sync-player.js`.

---

## O que eu NÃO consertei — porque a decisão é sua

### A. São dois textos na tela, e eles não são o mesmo texto

Isto é o mais importante desta lista, e é por isso que não mexi.

O app mostra a reza inteira em letras grandes, ocupando a tela. Esse texto está
escrito dentro do `engine.html` e é **uma versão antiga**: no Kadish Yatom ele
tem **66 palavras**. O texto que a gente mediu do áudio do rabino, em
`sync/chabad_yatom_sync.json`, tem **80 palavras**. Não são o mesmo texto — a
divisão dos versos também é diferente (o texto antigo separa "וְיַצְמַח פֻּרְקָנֵהּ"
e "וִיקָרֵב מְשִׁיחֵהּ" em dois versos; o medido junta num só).

Hoje, com o conserto, quem acompanha a reza palavra por palavra é o **painel de
sincronia** — o quadro com a barra dourada à esquerda. O texto grande fica
parado. Fiz o painel rolar sozinho para a tela quando o verso muda (antes ele
ficava no rodapé, depois de todos os 27 versos — você nunca ia vê-lo). Mas isso
é remendo.

**A pergunta para você e para o rabino:** qual texto vale? Se for o medido — e
eu acho que é, porque é o que o rabino gravou — então o texto antigo tem que
sair do `engine.html` e o painel de sincronia vira o texto principal do app.
Isso é redesenho de tela, não é conserto de defeito, e não faço sem você mandar.

### B. Duas línguas sem botão

O glossário tem 8 línguas. O painel de ajustes só oferece 6: faltam **italiano**
e **alemão**. Elas existem e funcionam — só dá para chegar nelas clicando várias
vezes no botão de idioma da barra de cima. Consertar é acrescentar dois botões;
não fiz porque mexe no layout dos ajustes e você pode preferir outro arranjo.

### C. Os textos que não são Chabad

Agora que trocar a tradição funciona de verdade, o app passa a servir os quatro
nussachim. Vale lembrar o que está escrito nos próprios arquivos:

- **sefard e sefaradi (Yatom):** o hebraico foi *derivado* do DeRabanan — falta
  a foto da página do Yatom no siddur.
- **sefard e sefaradi (DeRabanan):** hebraico transcrito de foto, a conferir
  contra o livro.
- **ashkenaz:** hebraico da fonte; transliteração e tradução parte do siddur
  Tehilat Hashem (direitos a resolver), parte rascunho de IA.

O app avisa com um toast ("Texto Ashkenaz ainda por conferir com o rabino")
quando você escolhe algo diferente de Chabad. Se preferir que os outros três
fiquem escondidos até o rabino ver, é um pedido e eu faço.

---

## Como conferir no iPad

1. Abra o app e aperte ▶. **Você deve ouvir o rabino**, não uma voz de robô.
   Se ouvir robô, me avise — é o sinal de que a sincronia não carregou.
2. Role até o quadro com a barra dourada. É ali que a palavra acende.
3. Aperte **Modo Treino**. Aperte ▶. Ele tem que parar sozinho no fim do
   primeiro verso e dizer "Pausado · toque ▶ para o próximo verso (2/16)".
4. Aperte ▶ de novo. Tem que continuar do **segundo verso**, não do começo.
5. Nos ajustes, troque a tradição. O áudio tem que mudar de voz/versão.

Se algo dessa lista não acontecer, me diga **qual passo** e o que apareceu na
tela. Com o número do passo eu chego rápido.

---

*Uma ressalva honesta: verde nos testes quer dizer que os defeitos desta lista
não estão mais lá. Não quer dizer que a sincronia está boa de ouvido — isso
continua sendo o seu ouvido, e a lista curta de escuta segue sendo o
`OUVIR-PRIMEIRO-v2.md`.*
