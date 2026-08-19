# Kadish — estado real e o que falta

Atualizado: 19/08/2026
Repositório: https://github.com/erezchalom-a18y/tefila-kadish (público)
Pasta local: `C:\Users\erez\Downloads\files (1)\tefila-motor-final`

8 combinações: 4 nussachim (ashkenaz, chabad, sefard, sefaradi) × 2 tipos
(yatom, derabanan). Cada uma tem um áudio do rabino e um JSON com os versos em
hebraico, transliteração, tradução e os tempos de sincronia.

---

## Onde estamos

`node checar.mjs` → **VERDE nos 8**. `node checar-ritos.mjs` → **VERDE nos 8**.

Verde aqui significa: os 8 têm hebraico real, contagem correta, sem buracos entre
versos, ritmo de leitura plausível, e as marcas estruturais do rito certo. **Não**
significa pronto — ver a coluna "origem" e as pendências.

| | versos | origem do hebraico | translit. | tradução |
|---|---|---|---|---|
| ashkenaz yatom | 14 | transcrição antiga | falta | falta |
| ashkenaz derabanan | 23 | **conferido no livro, 5/5** | falta | falta |
| chabad yatom | 16 | transcrição antiga | ok\* | ok\* |
| chabad derabanan | 24 | **conferido no livro, 5/5** | falta | falta |
| sefard yatom | 16 | **derivado** do DeRabanan | falta | falta |
| sefard derabanan | 24 | transcrito de foto (p. 79) | falta | falta |
| sefaradi yatom | 19 | **derivado** do DeRabanan | falta | falta |
| sefaradi derabanan | 25 | transcrito de foto (p. 29) | falta | falta |

\* provavelmente copiados do Tehilat Hashem publicado — ver "Direitos".

**"Derivado"** = partiu do DeRabanan e removeu o parágrafo
`עַל יִשְׂרָאֵל וְעַל רַבָּנָן`, que é o único trecho exclusivo do DeRabanan.
Foi assim que o Erez apontou o caminho: *"o yatom tem partes a menos"*.

---

## Os quatro siddurim

| nussach | livro |
|---|---|
| Ashkenaz | סדור תפלת כל פה עם הקריאות — אשכנז |
| Sefard | סדור תפלת שלמה השלם |
| Sefaradi | סדור קול יעקב — כמנהג ארם צובה (Alepo) |
| Chabad | סדור תהלת ה' על פי נוסח האר"י ז"ל — Beit Chabad Central |

**Pendência fechada:** a edição-mãe do Ashkenaz é o **Tefilat Kol Peh**, não o
Sefaria. Era a recomendação que estava em aberto.

---

## Os defeitos que a checagem por máquina encontrou

Todos existiam no dia em que o projeto foi declarado "TUDO ✅".

**1. Sete dos oito JSONs só tinham marcador de lugar** (`"hebrew": "[verso 1]"`).

**2. Os tempos eram divisão uniforme, não sincronia.** Desvio máximo de 0,010s
entre `audio_duration / total_versos` e `verso_duration` nos 8. No único arquivo
com texto real, o verso 3 tinha 2 palavras em 5,58s e o verso 14 tinha 13
palavras em 5,57s — 6,5× de diferença de velocidade, impossível.

**3. Os 8 áudios perderam 5 segundos do começo.** A etiqueta `iTunSMPB` dentro de
cada `.ogg` guarda o tamanho do `.m4a` original; os originais eram ~5,0s mais
longos, e essas durações batem com o `audio_duration` dos JSONs. Alguém cortou
5,0s de todos em lote — mas o anúncio do chazan ("Kadish [tipo] [nussach]") tem
duração diferente em cada gravação, e em dois deles o corte comeu o `יִתְגַּדַּל`.

**4. As transcrições de Sefard e Sefaradi estavam erradas — os livros não.**
Faltava `וְיַצְמַח פֻּרְקָנֵהּ`, faltava a expansão sefaradi
`חַיִּים וְשָׂבָע וִישׁוּעָה... וְשֵׁיזָבָא`, e o `sefaradi_yatom` trazia
`שָׁלוֹם רַב מִן שְׁמַיָּא`, que não existe no Kadish. As fotos das páginas
mostraram que os siddurim têm tudo certo. O erro foi na etapa de transcrição.

---

## O teste que amarra texto e áudio

**Segundos por letra hebraica.** Se o texto e o áudio são da mesma reza, esse
número fica na mesma faixa em todos os nussachim.

| nussach | s/letra |
|---|---|
| chabad derabanan | 0,227 |
| chabad yatom | 0,235 |
| sefard derabanan | 0,240 |
| sefaradi derabanan | 0,249 |
| sefaradi yatom (derivado) | 0,250 |
| ashkenaz yatom | 0,252 |
| sefard yatom (derivado) | 0,256 |
| ashkenaz derabanan | 0,266 |

O `sefaradi_yatom` quebrado dava **0,309** — o rabino falava 40% mais do que
estava escrito. Foi esse número que denunciou o parágrafo faltando.

**O que este teste pega:** falta ou sobra de parágrafo, corte de áudio errado,
texto do rito errado.
**O que ele NÃO pega:** uma palavra trocada, uma letra errada, um nikud errado.
Para isso só o livro impresso e o rabino.

---

## As ferramentas, todas no repositório

| arquivo | o que faz |
|---|---|
| `checar.mjs` | hebraico, transliteração, tradução, contagem, buracos entre versos, ritmo |
| `checar-ritos.mjs` + `ritos.json` | marcas estruturais de cada rito. Lê **só a tabela de versos**, não o comentário do arquivo |
| `cortar.mjs` + `cortes.json` | corta o anúncio do chazan nos 8 pontos conferidos de ouvido, congelados |
| `sincronizar.mjs` | pausas reais do áudio + proporção do texto, por programação dinâmica |
| `conferidor.html` | toca destacando o verso; tecla **M** corrige de ouvido; baixa o JSON corrigido; avisa se o áudio carregado não bater com o JSON |

**Dois defeitos da própria checagem, achados e corrigidos:** ela comparava
trechos longos e reprovava por grafia cheia vs. defectiva
(`פורקנה` / `פֻּרְקָנֵהּ`) — agora usa raízes curtas; e lia o arquivo inteiro,
casando com o comentário "este rito **omite** ויצמח" — agora lê só a tabela.

---

## Direitos

O siddur do Chabad é o **Tehilat Hashem "com tradução e transliteração"**, do
Beit Chabad Central. A transliteração e a tradução em português que estão hoje no
`chabad_yatom_sync.json` provavelmente vieram desse livro, não do rabino.

O hebraico do Kadish é domínio público. Uma tradução e uma transliteração
publicadas, não necessariamente. A pergunta deixa de ser "quem escreveu" e passa
a ser **"podemos usar o texto desta edição?"**.

Saídas: pedir autorização ao Beit Chabad Central; usar fonte de domínio público
ou licença aberta; ou encomendar tradução e transliteração próprias.

---

## Pendências, em ordem

1. **Fotografar as 4 páginas do Kadish Yatom**, uma em cada livro. Confirma os
   dois derivados e os dois de transcrição antiga. É o único item que ainda
   depende só de você.
2. **Resolver a transliteração e a tradução** — ver "Direitos". É o maior buraco:
   7 dos 8 não têm nenhuma das duas.
3. **Conferir contra o livro impresso** o Sefard e o Sefaradi DeRabanan, lidos de
   foto por Claude. Erro aqui é pior que campo vazio, porque parece certo.
4. **Conferir a sincronia de ouvido** nos 8, pelo conferidor.
5. **Rabino:** revisão final; o nome dele pode aparecer como responsável?;
   conferir as 6 regras de `ritos.json`.
6. Só depois de tudo isso: mostrar para 10 pessoas reais.

---

## A lição que vale para os outros projetos

A conversa anterior fechou com "8 JSONs ✅ COMPLETO" marcando apenas
`chabad_yatom_sync.json` como `(COMPLETO)`. Tecnicamente honesto; o resumo dizia
"TUDO ✅".

Três minutos de checagem por máquina acharam quatro defeitos que nenhuma leitura
de resumo acharia. E a checagem também errou duas vezes, do jeito clássico:
casando texto demais e lendo comentário como se fosse dado.

Três regras sobraram:

> **Enquanto a máquina não consegue conferir, não está pronto — está parecendo
> pronto.**

> **Verde não é pronto. Verde é "os defeitos que eu sei checar não estão aí".**

> **Onde a máquina não alcança — um segundo a mais no corte, se a tradução está
> correta, se o texto é do rito certo — quem decide é a pessoa que sabe, não o
> modelo.**
