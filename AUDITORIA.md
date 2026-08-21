# Auditoria geral — o que passou e o que ficou

Feita depois dos itens 1 a 5, medindo o app de verdade num navegador. Nada aqui
é opinião: cada número foi medido e dá para repetir a medição.

---

## Verde

| o quê | resultado |
|---|---|
| As 7 páginas do site | abrem sem nenhum 404 e sem erro de console |
| As 8 combinações do app, nos 2 formatos de áudio | 16 verdes |
| `checar.mjs` e `checar-ritos.mjs` | verdes nos 8 |
| Alinhamento dos dados (hebraico, transliteração, glosas nas 8 línguas) | zero desalinhado nos 8 arquivos |
| Contraste da letra | Pergaminho 13,8 · Claro 17,4 (norma pede 4,5) |
| Calendário hebraico | confere com 7 datas conhecidas |
| Âncoras, cortes, sync e glossário | intactos em toda a sessão |

---

## Achado e consertado nesta auditoria

**`sync-player.js` virou código morto.** Quando o destaque passou a usar a
máquina do próprio app, esse arquivo deixou de ser usado — mas continuava sendo
baixado por toda pessoa que abrisse o app, e três comentários ainda apontavam
para ele. Removido.

**Painel órfão no HTML.** O `#verso-sync-display`, do desenho antigo, continuava
na página, escondido. Removido.

**`netlify.toml` removido.** Ele mandava guardar em cache uma pasta `/audio/` que
não existe mais, e tinha um redirecionamento que mandava *tudo* para o index — o
que devolveria HTML no lugar dos JSONs e dos áudios. Como o Erez decidiu ficar só
com o GitHub Pages, o arquivo saiu inteiro: sobra do tempo do Netlify, e uma
armadilha para quem abrir o repositório amanhã e achar que ainda há dois destinos.

**A faixa "em pé · em minyan · em voz audível" tinha sumido.** Eu a havia cortado
junto com o resto da moldura. Devolvi: custa 39px e **não custa nenhum verso**.
É instrução de como rezar, não enfeite — quem nunca disse Kadish precisa saber
que se diz de pé, que precisa de dez e em voz alta.

---

## Achado e NÃO consertado — precisa da sua decisão

### 1. A interface não fala italiano nem alemão

O **texto da reza** aparece nas 8 línguas. Mas os botões e rótulos do app
("Modo Reza", "Configurações", "Pronto para começar") só existem em 6. Quem
escolhe italiano lê a oração em italiano e a interface em português.

Não é liturgia, então eu posso traduzir sem envolver o rabino. São cerca de 40
frases curtas. **Diga se quer.**

### 2. O repositório tem 51 MB, e dá para cortar 17

| pasta | tamanho | precisa estar no site? |
|---|---:|---|
| `tefila-audio/` (.ogg) | 15 MB | sim |
| `tefila-audio/` (.mp3) | 14 MB | sim — é o que toca no iPhone |
| `audio completo/` | 17 MB | **não** — é matéria-prima |

Os dois formatos de áudio são necessários (o Safari não toca `.ogg`). Já a pasta
`audio completo/` são as gravações originais, de onde os trechos foram cortados:
ninguém que abre o site baixa isso, mas ela pesa em todo clone e em todo deploy.

Não apaguei: é o material bruto, e material bruto não se joga fora sem ordem.
Se quiser, movo para outro lugar (Drive) e tiro do repositório.

### 3. Seis arquivos que ninguém mais usa

`DEBUG-CONSOLE.js`, `testaudiosync.html`, `atualizar-engine.py`,
`montar-glossario.mjs`, `header-redesign-opcoes-1a10.md`, `FINALIZACAO.txt`.

Somam 48 KB — não incomodam no tamanho. Incomodam na leitura: quem abrir o
repositório amanhã não sabe o que é vivo e o que é entulho. Não apaguei porque
alguns são registro de decisões antigas. **Diga se apago.**

---

## O que continua esperando gente

1. **Ouvir os 12 versos** do `OUVIR-PRIMEIRO-v2.md`.
2. **Levar os cadernos ao rabino** — comece por português (10 páginas) e
   transliteração (17).
3. **Decidir os direitos** das 16 entradas vindas de siddur publicado.
4. **Preencher o `aprender.json`** — a página existe e está vazia.
5. **Confirmar com o rabino** a formula hebraica da dedicatória (לזכר נשמת) e a
   regra de yahrzeit por nussach que implementei.

---

## Sobre o Netlify — decidido

O Erez decidiu ficar **só com o GitHub Pages**. Concordo, e o motivo é simples:
dois endereços para o mesmo app é fonte permanente de confusão — um deles fica
velho e alguém acaba rezando pelo errado.

O `netlify.toml` foi removido do repositório. Se um dia o Netlify voltar a ser
usado, é um arquivo de dez linhas para recriar; deixá-lo apodrecendo ali seria
pior.

Endereço único, no ar:
**https://erezchalom-a18y.github.io/tefila-kadish/**
