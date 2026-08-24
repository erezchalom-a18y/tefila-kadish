# Relatório da revisão auditiva (Whisper)

Gerado em 2026-08-24 15:07 UTC por `whisper-1`, sobre o commit `63aee7f`.

> **O Whisper não decide nada.** Ele não alterou nenhum `sync/*.json` e nunca
> vai alterar. As âncoras do Erez são invioláveis: a máquina aponta, o ouvido
> dele decide, e o siddur e o rabino mandam no texto.

## Como ler

Os 8 áudios foram transcritos em hebraico com marcação de tempo por palavra.
A transcrição foi alinhada com o nosso texto e comparada em dois eixos:

1. **palavra fora do lugar** — ouvida mas não está no texto, ou está no texto
   mas não foi ouvida;
2. **hora errada** — o começo da palavra difere mais de 0.6s do nosso.

O Whisper erra em hebraico litúrgico: ele não conhece bem o aramaico do Kadish,
confunde palavra curta com respiração e às vezes junta duas palavras numa só.
Trate cada linha como *vale a pena ouvir este trecho*, nunca como *está errado*.

## Resumo

| Nussach | Palavras nossas | Palavras ouvidas | Apontamentos |
| --- | ---: | ---: | ---: |
| ashkenaz_yatom | 75 | 80 | 22 |
| ashkenaz_derabanan | 118 | 124 | 30 |
| chabad_yatom | 80 | 80 | 15 |
| chabad_derabanan | 121 | 124 | 15 |
| sefard_yatom | 81 | 86 | 25 |
| sefard_derabanan | 124 | 126 | 8 |
| sefaradi_yatom | 91 | 92 | 15 |
| sefaradi_derabanan | 125 | 124 | 19 |
| **total** | | | **149** |

Por eixo:

- começa em hora diferente: **2**
- está no texto, não foi ouvida: **63**
- foi ouvida, não está no texto: **84**

## Cruzamento com OUVIR-PRIMEIRO.md

A auditoria de sinal de 20/08 listou 36 suspeitos, espalhados por
28 versos diferentes.

Dos 149 apontamentos do Whisper, **36** caem em versos que já
estavam naquela lista — cobrindo **13** dos 28 versos suspeitos.

Onde os dois métodos concordam, a chance de haver defeito real é bem maior:
comece a ouvir por aqui.

- ashkenaz_derabanan §11
- ashkenaz_derabanan §16
- ashkenaz_derabanan §20
- ashkenaz_yatom §14
- ashkenaz_yatom §2
- ashkenaz_yatom §5
- chabad_derabanan §21
- chabad_yatom §8
- sefaradi_derabanan §12
- sefaradi_derabanan §18
- sefaradi_derabanan §19
- sefard_derabanan §2
- sefard_yatom §12

## Apontamentos, nussach por nussach

### ashkenaz_yatom

**§2** — **já está no OUVIR-PRIMEIRO**

- `בְרָא` *(verá)* — no texto em 6.06s, o Whisper não ouviu
- `ורה` — o Whisper ouviu em 6.139999866485596s, não existe no nosso texto

**§4**

- `בְּחַיֵּיכוֹן` *(bechayechon)* — no texto em 10.825s, o Whisper não ouviu
- `בחיי` — o Whisper ouviu em 11.460000038146973s, não existe no nosso texto
- `חון` — o Whisper ouviu em 11.9399995803833s, não existe no nosso texto
- `וביום` — o Whisper ouviu em 12.319999694824219s, não existe no nosso texto
- `וּבְיוֹמֵיכוֹן` *(uveyomechon)* — no texto em 12.88s, o Whisper não ouviu
- `החון` — o Whisper ouviu em 13.4399995803833s, não existe no nosso texto

**§5** — **já está no OUVIR-PRIMEIRO**

- `דה` — o Whisper ouviu em 15.260000228881836s, não existe no nosso texto
- `דְכָל` *(dechol)* — no texto em 15.72s, o Whisper não ouviu
- `חול` — o Whisper ouviu em 15.979999542236328s, não existe no nosso texto

**§7**

- `על` — o Whisper ouviu em 29.219999313354492s, não existe no nosso texto
- `עָלְמַיָּא` *(almayá)* — no texto em 29.44s, o Whisper não ouviu
- `מיה` — o Whisper ouviu em 29.68000030517578s, não existe no nosso texto

**§10**

- `בקבוצה` — o Whisper ouviu em 42.86000061035156s, não existe no nosso texto
- `דְּקֻדְשָׁא` *(decudshá)* — no texto em 43.04s, o Whisper não ouviu

**§11**

- `לְעֵלָּא` *(leela)* — no texto em 45.06s, o Whisper não ouviu
- `לאלה` — o Whisper ouviu em 46.31999969482422s, não existe no nosso texto

**§12**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — no texto em 50.56s, o Whisper não ouviu
- `תושבכתה` — o Whisper ouviu em 51.41999816894531s, não existe no nosso texto
- `דה` — o Whisper ouviu em 55.29999923706055s, não existe no nosso texto

**§14** — **já está no OUVIR-PRIMEIRO**

- `וְאִמְרוּ` *(veimrú)* — nós: 82s · ouvido: 81.27999877929688s · diferença -0.72s

### ashkenaz_derabanan

**§2**

- `ורה` — o Whisper ouviu em 6.760000228881836s, não existe no nosso texto
- `בְרָא` *(verá)* — no texto em 6.82s, o Whisper não ouviu

**§7**

- `עָלְמַיָּא` *(almayá)* — no texto em 32.871s, o Whisper não ouviu
- `על` — o Whisper ouviu em 33.040000915527344s, não existe no nosso texto
- `מיה` — o Whisper ouviu em 33.619998931884766s, não existe no nosso texto

**§10**

- `די` — o Whisper ouviu em 47.619998931884766s, não existe no nosso texto

**§11** — **já está no OUVIR-PRIMEIRO**

- `לְעֵלָּא` *(leela)* — no texto em 50.28s, o Whisper não ouviu
- `לאלה` — o Whisper ouviu em 50.84000015258789s, não existe no nosso texto

**§12**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — no texto em 56.4s, o Whisper não ouviu
- `תושבכתה` — o Whisper ouviu em 56.47999954223633s, não existe no nosso texto

**§14**

- `הון` — o Whisper ouviu em 70.5999984741211s, não existe no nosso texto
- `הון` — o Whisper ouviu em 75.26000213623047s, não existe no nosso texto

**§15**

- `בְּאוֹרַיְתָא` *(beoraytá)* — no texto em 78.74s, o Whisper não ouviu
- `באור` — o Whisper ouviu em 79.0199966430664s, não existe no nosso texto
- `איתה` — o Whisper ouviu em 79.77999877929688s, não existe no nosso texto

**§16** — **já está no OUVIR-PRIMEIRO**

- `ועטרה` — o Whisper ouviu em 81.4000015258789s, não existe no nosso texto
- `בְאַתְרָא` *(veatrá)* — no texto em 81.72s, o Whisper não ouviu
- `עדן` — o Whisper ouviu em 82.5199966430664s, não existe no nosso texto
- `הָדֵין` *(haden)* — no texto em 82.96s, o Whisper não ouviu
- `אֲתַר` *(atar)* — no texto em 84.94s, o Whisper não ouviu
- `עטר` — o Whisper ouviu em 85.72000122070312s, não existe no nosso texto
- `וַאֲתַר` *(vaatár)* — no texto em 86.02s, o Whisper não ouviu
- `ועטר` — o Whisper ouviu em 86.37999725341797s, não existe no nosso texto

**§18**

- `חִנָּא` *(chiná)* — no texto em 92.4s, o Whisper não ouviu
- `חינה` — o Whisper ouviu em 92.5199966430664s, não existe no nosso texto

**§20** — **já está no OUVIR-PRIMEIRO**

- `דְּבִשְׁמַיָּא` *(di-vishmayá)* — no texto em 105.92s, o Whisper não ouviu
- `דווי` — o Whisper ouviu em 106s, não existe no nosso texto
- `שמיה` — o Whisper ouviu em 106.83999633789062s, não existe no nosso texto
- `ועראה` — o Whisper ouviu em 108.04000091552734s, não existe no nosso texto
- `וְאַרְעָא` *(vear-á)* — no texto em 108.36s, o Whisper não ouviu

### chabad_yatom

**§2**

- `דברי` — o Whisper ouviu em 5.840000152587891s, não existe no nosso texto
- `דִּי` *(di)* — no texto em 5.86s, o Whisper não ouviu
- `בְרָא` *(verá)* — no texto em 6.601s, o Whisper não ouviu
- `חירותי` — o Whisper ouviu em 6.71999979019165s, não existe no nosso texto
- `כִרְעוּתֵהּ` *(chir'utêh)* — no texto em 6.811s, o Whisper não ouviu

**§8** — **já está no OUVIR-PRIMEIRO**

- `יְהֵא` *(Yehê)* — nós: 27.66s · ouvido: 26.6200008392334s · diferença -1.04s

**§11**

- `דְּקֻדְשָׁא` *(decudshá)* — no texto em 44.7s, o Whisper não ouviu
- `דקוצה` — o Whisper ouviu em 44.84000015258789s, não existe no nosso texto

**§12**

- `לְעֵלָּא` *(leela)* — no texto em 46.84s, o Whisper não ouviu
- `לאלה` — o Whisper ouviu em 46.97999954223633s, não existe no nosso texto

**§13**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — no texto em 52.3s, o Whisper não ouviu
- `תושבכתה` — o Whisper ouviu em 52.34000015258789s, não existe no nosso texto

**§14**

- `שְׁלָמָא` *(shelamá)* — no texto em 60.18s, o Whisper não ouviu
- `של` — o Whisper ouviu em 60.2400016784668s, não existe no nosso texto
- `עמה` — o Whisper ouviu em 60.939998626708984s, não existe no nosso texto

### chabad_derabanan

**§2**

- `דִּי` *(di)* — no texto em 5.16s, o Whisper não ouviu
- `דברי` — o Whisper ouviu em 5.21999979019165s, não existe no nosso texto
- `בְרָא` *(verá)* — no texto em 5.86s, o Whisper não ouviu
- `חירותי` — o Whisper ouviu em 5.860000133514404s, não existe no nosso texto
- `כִרְעוּתֵהּ` *(chir'utêh)* — no texto em 6.32s, o Whisper não ouviu

**§15**

- `הון` — o Whisper ouviu em 60.97999954223633s, não existe no nosso texto
- `הון` — o Whisper ouviu em 65s, não existe no nosso texto

**§16**

- `באור` — o Whisper ouviu em 69.12000274658203s, não existe no nosso texto
- `בְּאוֹרַיְתָא` *(beoraytá)* — no texto em 69.5s, o Whisper não ouviu
- `איתה` — o Whisper ouviu em 69.94000244140625s, não existe no nosso texto

**§19**

- `חִנָּא` *(chiná)* — no texto em 82.48s, o Whisper não ouviu
- `חינה` — o Whisper ouviu em 82.68000030517578s, não existe no nosso texto

**§21** — **já está no OUVIR-PRIMEIRO**

- `דְּבִשְׁמַיָּא` *(di-vishmayá)* — no texto em 94.56s, o Whisper não ouviu
- `די` — o Whisper ouviu em 94.91999816894531s, não existe no nosso texto
- `ושמיה` — o Whisper ouviu em 95.45999908447266s, não existe no nosso texto

### sefard_yatom

**§2**

- `דברי` — o Whisper ouviu em 6.400000095367432s, não existe no nosso texto
- `דִּי` *(di)* — no texto em 6.56s, o Whisper não ouviu
- `בְרָא` *(verá)* — no texto em 7.26s, o Whisper não ouviu
- `חירותי` — o Whisper ouviu em 7.300000190734863s, não existe no nosso texto
- `כִרְעוּתֵהּ` *(chir'utêh)* — no texto em 7.78s, o Whisper não ouviu

**§5**

- `בְּחַיֵּיכוֹן` *(bechayechon)* — no texto em 16.582s, o Whisper não ouviu
- `בחיי` — o Whisper ouviu em 17.239999771118164s, não existe no nosso texto
- `חון` — o Whisper ouviu em 17.739999771118164s, não existe no nosso texto
- `וביום` — o Whisper ouviu em 18.079999923706055s, não existe no nosso texto
- `וּבְיוֹמֵיכוֹן` *(uveyomechon)* — no texto em 18.66s, o Whisper não ouviu
- `חון` — o Whisper ouviu em 19.139999389648438s, não existe no nosso texto

**§8**

- `על` — o Whisper ouviu em 35.560001373291016s, não existe no nosso texto
- `עָלְמַיָּא` *(almayá)* — no texto em 35.64s, o Whisper não ouviu
- `מיה` — o Whisper ouviu em 35.86000061035156s, não existe no nosso texto

**§11**

- `דְּקֻדְשָׁא` *(decudshá)* — no texto em 49.04s, o Whisper não ouviu
- `דקוצ` — o Whisper ouviu em 49.060001373291016s, não existe no nosso texto
- `ה` — o Whisper ouviu em 49.5s, não existe no nosso texto

**§12** — **já está no OUVIR-PRIMEIRO**

- `לְעֵלָּא` *(leela)* — no texto em 51.32s, o Whisper não ouviu
- `לאלה` — o Whisper ouviu em 52.91999816894531s, não existe no nosso texto

**§13**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — no texto em 57.7s, o Whisper não ouviu
- `תושב` — o Whisper ouviu em 57.70000076293945s, não existe no nosso texto
- `חתה` — o Whisper ouviu em 58.220001220703125s, não existe no nosso texto
- `וְנֶחֱמָתָא` *(venechamata)* — no texto em 59.34s, o Whisper não ouviu
- `בני` — o Whisper ouviu em 59.459999084472656s, não existe no nosso texto
- `חמתה` — o Whisper ouviu em 59.7400016784668s, não existe no nosso texto

### sefard_derabanan

**§2** — **já está no OUVIR-PRIMEIRO**

- `ורה` — o Whisper ouviu em 5.900000095367432s, não existe no nosso texto
- `בְרָא` *(verá)* — no texto em 5.94s, o Whisper não ouviu

**§15**

- `הון` — o Whisper ouviu em 65.36000061035156s, não existe no nosso texto
- `הון` — o Whisper ouviu em 69.55999755859375s, não existe no nosso texto

**§19**

- `חִנָּא` *(chiná)* — no texto em 87.12s, o Whisper não ouviu
- `חינה` — o Whisper ouviu em 87.30000305175781s, não existe no nosso texto

**§21**

- `וערה` — o Whisper ouviu em 102.19999694824219s, não existe no nosso texto
- `וְאַרְעָא` *(vear-á)* — no texto em 102.52s, o Whisper não ouviu

### sefaradi_yatom

**§2**

- `דברי` — o Whisper ouviu em 6.119999885559082s, não existe no nosso texto
- `דִּי` *(di)* — no texto em 6.3s, o Whisper não ouviu
- `בְרָא` *(verá)* — no texto em 6.703s, o Whisper não ouviu

**§5**

- `בְּחַיֵּיכוֹן` *(bechayechon)* — no texto em 15.8s, o Whisper não ouviu
- `בחיי` — o Whisper ouviu em 15.819999694824219s, não existe no nosso texto
- `חון` — o Whisper ouviu em 17.219999313354492s, não existe no nosso texto
- `וביום` — o Whisper ouviu em 17.579999923706055s, não existe no nosso texto
- `וּבְיוֹמֵיכוֹן` *(uveyomechon)* — no texto em 18s, o Whisper não ouviu
- `חון` — o Whisper ouviu em 18.559999465942383s, não existe no nosso texto

**§11**

- `דְּקֻדְשָׁא` *(decudshá)* — no texto em 49.94s, o Whisper não ouviu
- `דקוצה` — o Whisper ouviu em 49.97999954223633s, não existe no nosso texto

**§15**

- `וסבא` — o Whisper ouviu em 69.66000366210938s, não existe no nosso texto
- `וְשָׂבָע` *(vessavá)* — no texto em 69.84s, o Whisper não ouviu

**§19**

- `בְּרַחֲמָיו` *(berachamav)* — no texto em 91.98s, o Whisper não ouviu
- `ורחמב` — o Whisper ouviu em 92.36000061035156s, não existe no nosso texto

### sefaradi_derabanan

**§2**

- `דברה` — o Whisper ouviu em 5.639999866485596s, não existe no nosso texto
- `דִּי` *(di)* — no texto em 5.64s, o Whisper não ouviu
- `בְרָא` *(verá)* — no texto em 6.097s, o Whisper não ouviu

**§8**

- `עָלְמַיָּא` *(almayá)* — no texto em 33.54s, o Whisper não ouviu

**§11**

- `דְּקֻדְשָׁא` *(decudshá)* — no texto em 47.26s, o Whisper não ouviu
- `בקבוצה` — o Whisper ouviu em 47.7599983215332s, não existe no nosso texto

**§12** — **já está no OUVIR-PRIMEIRO**

- `ממכל` — o Whisper ouviu em 51.439998626708984s, não existe no nosso texto
- `מִן` *(min)* — no texto em 51.86s, o Whisper não ouviu
- `כָּל` *(kol)* — no texto em 52.087s, o Whisper não ouviu

**§15**

- `הון` — o Whisper ouviu em 69.13999938964844s, não existe no nosso texto
- `הון` — o Whisper ouviu em 73.19999694824219s, não existe no nosso texto

**§18** — **já está no OUVIR-PRIMEIRO**

- `חִנָּא` *(chiná)* — no texto em 87.88s, o Whisper não ouviu
- `חינה` — o Whisper ouviu em 88.95999908447266s, não existe no nosso texto

**§19** — **já está no OUVIR-PRIMEIRO**

- `ועראה` — o Whisper ouviu em 95.91999816894531s, não existe no nosso texto
- `וְאַרְעָא` *(vear-á)* — no texto em 96.273s, o Whisper não ouviu

**§21**

- `וסבא` — o Whisper ouviu em 105.0199966430664s, não existe no nosso texto
- `וְשָׂבָע` *(vessavá)* — no texto em 105.22s, o Whisper não ouviu

**§25**

- `ורחמב` — o Whisper ouviu em 128.24000549316406s, não existe no nosso texto
- `בְּרַחֲמָיו` *(berachamav)* — no texto em 128.48s, o Whisper não ouviu

## O que fazer com isto

1. Comece pelos versos do cruzamento acima — são os que os dois métodos marcaram.
2. Ouça o verso no conferidor.html. Se a palavra acender fora da voz, anote o segundo.
3. O reparo vira âncora em `ancoras.json`, e só então roda o alinhador.
4. Este relatório nunca altera nada. Quem altera é uma pessoa.

