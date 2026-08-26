# Tefilá · Kadish do Enlutado

App gratuito para dizer Kadish acompanhando a voz do rabino, palavra por palavra.

**4 nussachim** (Ashkenaz, Chabad, Sefard, Sefaradi) × **2 kadishim**
(Yatom, deRabanan) × **8 línguas** (português, inglês, espanhol, francês,
italiano, alemão, russo, hebraico).

---

## Os endereços

Toque para abrir. Se for copiar, cole na **barra de endereço** do navegador —
colar dentro do GitHub não funciona.

### Para quem reza

| | |
|---|---|
| **[Abrir o app](https://erezchalom-a18y.github.io/tefila-kadish/)** | começa no Chabad |
| [Ashkenaz](https://erezchalom-a18y.github.io/tefila-kadish/?n=ashkenaz) · [Chabad](https://erezchalom-a18y.github.io/tefila-kadish/?n=chabad) · [Sefard](https://erezchalom-a18y.github.io/tefila-kadish/?n=sefard) · [Sefaradi](https://erezchalom-a18y.github.io/tefila-kadish/?n=sefaradi) | escolher o nussach |
| [Aprender sobre o Kadish](https://erezchalom-a18y.github.io/tefila-kadish/aprender.html) | ainda vazia, esperando conteúdo |

### Para o Erez

| | |
|---|---|
| **[Revisar as traduções](https://erezchalom-a18y.github.io/tefila-kadish/revisar.html)** | conferir as línguas que você sabe, verso a verso |
| [Kadishim ditos](https://erezchalom-a18y.github.io/tefila-kadish/contador.html) | o contador |
| **[Sincronia — ver a voz](https://erezchalom-a18y.github.io/tefila-kadish/sincronia.html)** | ver a voz do rabino desenhada com as palavras em cima, entender por que uma está fora do lugar, e arrastar |
| [Conferidor de sincronia](https://erezchalom-a18y.github.io/tefila-kadish/conferidor.html) | ouvir verso a verso e achar o segundo exato |
| [Roteiro de testes](https://erezchalom-a18y.github.io/tefila-kadish/testes.html) | os 9 testes que uma pessoa precisa fazer |

---

## Onde está cada coisa

```
engine.html              o app
index.html               abre direto no Kadish
revisar.html             revisão das línguas (só lê)
contador.html            os Kadishim ditos (só deste aparelho)
sincronia.html           ver a voz desenhada e arrastar a palavra (só lê)
conferidor.html          ouvir e conferir a sincronia
aprender.html            página de conteúdo (aprender.json)

sync/*.json              o texto e o tempo de cada palavra — o coração
ancoras.json             reparos de ouvido do Erez. INVIOLÁVEL
cortes.json              pontos de corte dos áudios. INVIOLÁVEL
glossario.json           42 entradas × 8 línguas
tefila-audio/            os 8 áudios (.ogg e .mp3)
fontes/                  de onde veio o texto e a transliteração
folhetos/                os 8 folhetos imprimíveis (rascunho)
contador-cloudflare/     o contador geral, pronto e desligado
```

## Como rodar as checagens

```
node checar.mjs          estrutura, contagem, ritmo
node checar-ritos.mjs    marcas de rito
node testar-contador.mjs o contador, sem gastar nada

node servidor-teste.mjs 8896 . &      (precisa ser este: responde Range)
node testar-app.mjs      http://127.0.0.1:8896/tefila-kadish
node testar-linguas.mjs  http://127.0.0.1:8896/tefila-kadish
node testar-telas.mjs    http://127.0.0.1:8896/tefila-kadish
node testar-treino.mjs   http://127.0.0.1:8896/tefila-kadish
node testar-revisar.mjs  http://127.0.0.1:8896/tefila-kadish
```

As oito rodam sozinhas no GitHub a cada push. As regras de operação estão em
[CLAUDE.md](CLAUDE.md).

## O que ainda não é verdade

Escrito aqui para não enganar quem chega:

- **Não funciona offline.** Não há service worker. Precisa de internet.
- **As 7 línguas fora do português são rascunho.** Esperam revisão do rabino.
  O que vai a ele é o `ESCOLHA-RABINO.pdf`.
- **A transliteração portuguesa é a base.** As outras vêm dos documentos do
  Erez; 41 de 815 palavras ainda não têm fonte e caem para o português.
  Em alemão não há transliteração nenhuma, de propósito.
- **Os folhetos saem marcados RASCUNHO.** A marca só sai quando o rabino
  revisar.
- **O contador geral está desligado.** Nada sai de aparelho nenhum até o
  Cloudflare ser ligado (`contador-cloudflare/COMO-LIGAR.md`).
