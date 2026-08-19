# Os quatro siddurim usados

Fotografados pelo Erez em 19/08/2026. Cada nussach do aplicativo vem de um livro
específico — não de site, não de memória.

| nussach | livro | páginas conferidas |
|---|---|---|
| **Ashkenaz** | סדור תפלת כל פה עם הקריאות — אשכנז | 98–99 (DeRabanan) |
| **Sefard** | סדור תפלת שלמה השלם | 79 (DeRabanan) |
| **Sefaradi** | סדור קול יעקב — כמנהג ארם צובה (Alepo) | 29 (DeRabanan) |
| **Chabad** | סדור תהלת ה' על פי נוסח האר"י ז"ל — Beit Chabad Central | DeRabanan |

---

## Decisão fechada: a edição-mãe do Ashkenaz

O arquivo `texto-ashkenaz-yatom.md` deixava em aberto: Sefaria ou **Tefilat Kol
Peh**, recomendando o segundo. **A escolha é o Tefilat Kol Peh** — é o livro que
o Erez tem em mãos e que foi fotografado. O Sefaria sai de cena.

---

## Ponto de atenção sobre direitos

O siddur do Chabad é o **Tehilat Hashem "com tradução e transliteração"**, do
Beit Chabad Central. A transliteração e a tradução em português que hoje estão no
`chabad_yatom_sync.json` provavelmente saíram desse livro, não foram escritas pelo
rabino.

Isso muda a pergunta a fazer: não é "quem escreveu", é **"podemos usar o texto
desta edição?"**. O hebraico do Kadish é domínio público; uma tradução e uma
transliteração publicadas, não necessariamente.

Três saídas, em ordem de esforço:

1. pedir autorização ao Beit Chabad Central
2. usar outra tradução/transliteração de domínio público ou com licença aberta
3. encomendar uma tradução e uma transliteração próprias

---

## O que ainda falta fotografar

As quatro páginas do **Kadish Yatom**, uma em cada livro. Sem elas, `sefard_yatom`
e `sefaradi_yatom` continuam sem texto — e o `ashkenaz_yatom` e o `chabad_yatom`
continuam conferidos apenas contra a transcrição antiga, não contra o livro.

---

## Como o texto de cada página vira arquivo

1. foto da página
2. transcrição para o `.md` correspondente em `fontes/`, com a tabela de versos
3. `node checar-ritos.mjs` — confere as marcas estruturais do rito
4. o JSON de sincronia é preenchido a partir da tabela
5. `node sincronizar.mjs` — alinha os versos com as pausas reais do áudio
6. `node checar.mjs` — confere ritmo, contagem, buracos
7. o Erez ouve pelo `conferidor.html` e corrige o que estiver fora

Os passos 3, 5 e 6 são máquina. O passo 7 é ouvido humano, e é o único que decide.
