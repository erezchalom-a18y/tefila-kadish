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

**774 das 815 palavras (95%)** ganharam inglês, espanhol, francês, italiano e
russo.

| arquivo | com as 5 línguas | |
|---|---|---|
| chabad_derabanan | 121 / 121 | 100% |
| chabad_yatom | 80 / 80 | 100% |
| ashkenaz_yatom | 75 / 75 | 100% |
| sefard_yatom | 80 / 81 | 99% |
| ashkenaz_derabanan | 116 / 118 | 98% |
| sefard_derabanan | 119 / 124 | 96% |
| sefaradi_yatom | 79 / 91 | 87% |
| sefaradi_derabanan | 107 / 125 | 86% |

## Como o Sefard entrou, se não está no documento

O documento compara três tradições — Sefaradi, Ashkenazi e Chabad — e o
**Sefard** não está lá. Decisão do Erez (21/08): *"Sefard, em outras línguas use
a transliteração dos outros nussachim como base, é muito parecido."*

Foi o que se fez, com um critério estreito: **só empresta quando a palavra
hebraica é exatamente a mesma**. Não há adivinhação — se a palavra do Sefard não
existe igual em nenhum dos outros três, ela fica em português. Assim entraram
119 das 124 do deRabanan e 80 das 81 do Yatom.

O mesmo empréstimo completou os buracos dos outros: sefaradi +3, ashkenaz +2,
chabad +1.

## O que ainda falta, e por quê

**As 41 palavras que sobram são quase todas do sefaradi** — a expansão sefaradi
do *yehei shlama raba* (*vesava, vishua, venechama, vesheizava, urefua, ugula,
uselicha, vechapara, verevach, vehatsala…*). Esse trecho não existe no documento
**nem nos outros nussachim**, então não há de onde emprestar. Fica em português.

## O alemão

Os documentos são en, es, fr, it, ru, árabe e português — **não há alemão**.
Decisão do Erez: em alemão, **tirar a linha da transliteração**. Mostrar a
portuguesa para quem lê alemão não ajudaria: o "z" alemão soa "ts" e o "y" soa
"u" — sairia outra palavra. Quem lê em alemão vê o hebraico e a tradução.

## A pergunta que estava aberta — resolvida

O documento tem três colunas: Sefaradi, Ashkenazi e Chabad. As colunas Ashkenazi
e Chabad usam a **pronúncia europeia tradicional**: *Yisgadal* em vez de
*Yitgadal*, *beis* em vez de *beit*, *rabo* em vez de *raba*.

**O Erez ouviu a gravação em 21/08 e confirmou: o rabino diz "yit-gadal".**

Como a transliteração existe para a pessoa ler **junto com o áudio**, uma que
diga *Yisgadal* atrapalha em vez de ajudar. Então os três nussachim saem da
**coluna Sefaradi**, que é a que traz a pronúncia que se ouve na gravação.

Antes e depois, palavras que soavam diferente do nosso português:

| nussach | antes | depois |
|---|---|---|
| ashkenaz | 23 | **8** |
| chabad | 21 | **9** |
| sefaradi | 7 | 7 |

E a cobertura não caiu: continuam 569 palavras com as 5 línguas.

As 8 e 9 que sobram não são pronúncia trocada — são convenção de escrita
(*qariv* / *kariv*, *dequdsha* / *d'kudsha*) ou prefixo escrito junto
(*vatra* / *b'atra*).

**Nada de pronúncia foi inventado pela máquina.** Onde o texto do ashkenaz ou do
chabad é realmente diferente do sefaradi, as palavras simplesmente não casam e
continuam em português. Preferi perder cobertura a inventar.

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
