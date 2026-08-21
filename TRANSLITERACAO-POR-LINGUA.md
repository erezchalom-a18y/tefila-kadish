# Transliteração por língua — o que entrou, o que faltou, e o que você precisa ouvir

Pedido de 21/08: *"quanto à transliteração, use a que está no arquivo para as
outras línguas, português deixe como está."*

Feito. Este documento diz exatamente o que entrou, porque tem coisa que o
documento do Drive não cobre — e uma coisa que só você pode decidir.

---

## De onde veio

Dos seus documentos no Google Drive, de 1º de agosto:

```
kadish-derabanan-transliteration-{en,es,fr,it,ru}-3nusachim.docx
```

Copiei as tabelas **verbatim** para `fontes/transliteracao-por-lingua.json`, para
ficar auditável: dá para conferir linha por linha contra o Word original. Nada
foi escrito pela máquina — ela só casou palavra com palavra.

O português **não foi tocado**, como você pediu.

---

## O que entrou

| arquivo | palavras com as 5 línguas | |
|---|---|---|
| chabad_yatom | 80 / 80 | 100% |
| ashkenaz_yatom | 75 / 75 | 100% |
| chabad_derabanan | 120 / 121 | 99% |
| ashkenaz_derabanan | 114 / 118 | 97% |
| sefaradi_yatom | 76 / 91 | 84% |
| sefaradi_derabanan | 104 / 125 | 83% |
| **sefard_yatom** | 0 / 81 | **sem fonte** |
| **sefard_derabanan** | 0 / 124 | **sem fonte** |

**569 palavras** ganharam inglês, espanhol, francês, italiano e russo.

## O que faltou, e por quê

**1. O Sefard inteiro.** O documento compara três tradições — Sefaradi,
Ashkenazi e Chabad. O **Sefard** não está lá. Esses dois arquivos continuam com
o apoio em português.

**2. Não há Yatom no documento.** Ele só traz o deRabanan. Como o Yatom é quase
um recorte do deRabanan, casei palavra por palavra pelo **hebraico** dentro do
mesmo nussach — por isso o Yatom do chabad e do ashkenaz ficaram em 100%.

**3. O alemão não existe no conjunto.** Os documentos são en, es, fr, it, ru,
árabe e português — não há alemão. Quem lê o app em alemão continua com a
transliteração portuguesa.

**4. Faltam 41 palavras no sefaradi.** Não é falha de casamento: o nosso texto
sefaradi tem um trecho que o documento não traz — *vesava, vishua, venechama,
vesheizava, urefua, ugula, uselicha, vechapara, verevach, vehatsala…* — a
expansão sefaradi do *yehei shlama raba*. Onde não há fonte, fica o português.

**5. Sobrou um `min` no chabad.** O nosso texto diz *leila **min kol** birchata*;
o documento diz *l'eila u'l'eila **mikol** birchata*. É diferença de texto, não
de transliteração. Não forcei.

---

## O que só você pode resolver — e é importante

O documento não muda só a **grafia**. No Ashkenazi e no Chabad ele muda o **som**:

| | nosso português | o documento |
|---|---|---|
| §1 | Yitgadal veyitkadash | **Yisgadal veyiskadash** |
| §2 | chirutei | **chirusei** |
| §6 | beit yisrael | **beis yisrael** |
| §9 | Yitbarach | **yisborach** |

Medido, palavra a palavra:

| nussach | só mudam de grafia | **mudam de som** |
|---|---|---|
| sefaradi | 39 | **7** |
| chabad | 41 | **21** |
| ashkenaz | 59 | **23** |

No **sefaradi** a mudança é cosmética (apóstrofos, *sh'me* em vez de *shemei*).
No **ashkenaz e no chabad** é a pronúncia europeia tradicional — o próprio
documento diz isso: *"a transliteração ashkenazi usa a pronúncia europeia
tradicional, 'yisgadal' em vez de 'yitgadal', refletindo o kamatz como 'o'."*

### O problema prático

A transliteração serve para a pessoa **ler junto com o áudio**. Se a tela diz
*Yisgadal* e o rabino diz *Yitgadal*, ela atrapalha em vez de ajudar — e isso
agora vale para quem lê o app em inglês, espanhol, francês, italiano ou russo,
nos nussachim ashkenaz e chabad.

**A nossa transliteração portuguesa diz "Yitgadal" nos quatro nussachim.** Ela
foi feita seguindo o áudio. Isso é indício forte de que o rabino diz *yitgadal*
também no ashkenaz e no chabad — mas indício não é prova.

### O teste, cinco segundos

Abra o app em `?n=ashkenaz` e depois em `?n=chabad` e ouça o começo:

- Ele diz **"yit**gadal" ou **"yis**gadal"?
- No §9, ele diz "**ra**ba" ou "ra**bo**"?

**Se ele disser "yitgadal"** — me avise. Eu troco as colunas Ashkenazi e Chabad
pela coluna Sefaradi do mesmo documento (que diz *Yitgadal*), e a grafia
melhorada continua valendo sem a pronúncia trocada. É um comando.

**Se ele disser "yisgadal"** — está tudo certo como ficou, e aí a nossa
transliteração *portuguesa* é que está descolada do áudio nesses dois nussachim,
e isso passa a ser o defeito a consertar.

---

## Como refazer, se precisar

```
node aplicar-transliteracoes.mjs              # ensaio: mostra o que faria
node aplicar-transliteracoes.mjs --confirmar  # grava
```

O script nunca mexe em tempo, hebraico, glosa, tradução nem no
`transliteration_pt`, e não grava nada se qualquer prova falhar. O que ele
gravou foram **só linhas novas**: 3.983 acrescentadas, nenhuma removida, nenhuma
alterada.

## Continua valendo

As 7 línguas fora do português são rascunho até o rabino olhar — inclusive
estas. Um documento no Drive é um ponto de partida melhor que um modelo, mas
não substitui o rabino.
