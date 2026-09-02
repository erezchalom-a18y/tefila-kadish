# Relatório da revisão auditiva (Whisper)

Gerado em 2026-09-02 23:39 UTC por `whisper-1`, sobre o commit `8b375be`.

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
| ashkenaz_yatom | 75 | 80 | 19 |
| ashkenaz_derabanan | 118 | 124 | 34 |
| chabad_yatom | 80 | 80 | 17 |
| chabad_derabanan | 121 | 115 | 30 |
| sefard_yatom | 81 | 86 | 29 |
| sefard_derabanan | 124 | 126 | 13 |
| sefaradi_yatom | 91 | 92 | 23 |
| sefaradi_derabanan | 125 | 127 | 25 |
| **total** | | | **190** |

Por eixo:

- começa em hora diferente: **29**
- está no texto, não foi ouvida: **73**
- foi ouvida, não está no texto: **88**

## Cruzamento com OUVIR-PRIMEIRO.md

A auditoria de sinal de 20/08 listou 36 suspeitos, espalhados por
28 versos diferentes.

Dos 190 apontamentos do Whisper, **46** caem em versos que já
estavam naquela lista — cobrindo **17** dos 28 versos suspeitos.

Onde os dois métodos concordam, a chance de haver defeito real é bem maior:
comece a ouvir por aqui.

- ashkenaz_derabanan §11
- ashkenaz_derabanan §16
- ashkenaz_derabanan §20
- ashkenaz_yatom §2
- ashkenaz_yatom §5
- chabad_derabanan §17
- chabad_derabanan §21
- chabad_yatom §8
- sefaradi_derabanan §12
- sefaradi_derabanan §18
- sefaradi_yatom §12
- sefaradi_yatom §8
- sefard_derabanan §2
- sefard_derabanan §22
- sefard_derabanan §24
- sefard_yatom §12
- sefard_yatom §14

## Apontamentos, nussach por nussach

### ashkenaz_yatom

**§2** — **já está no OUVIR-PRIMEIRO**

- `בְרָא` *(verá)* — no texto em 6.06s, o Whisper não ouviu
- `ורה` — o Whisper ouviu em 6.139999866485596s, não existe no nosso texto

**§4**

- `בְּחַיֵּיכוֹן` *(bechayechon)* — no texto em 11.2s, o Whisper não ouviu
- `בחיי` — o Whisper ouviu em 11.460000038146973s, não existe no nosso texto
- `חון` — o Whisper ouviu em 11.9399995803833s, não existe no nosso texto
- `וביום` — o Whisper ouviu em 12.319999694824219s, não existe no nosso texto
- `וּבְיוֹמֵיכוֹן` *(uveyomechon)* — no texto em 12.88s, o Whisper não ouviu
- `החון` — o Whisper ouviu em 13.4399995803833s, não existe no nosso texto

**§5** — **já está no OUVIR-PRIMEIRO**

- `דה` — o Whisper ouviu em 15.260000228881836s, não existe no nosso texto
- `דְכָל` *(dechol)* — no texto em 15.38s, o Whisper não ouviu
- `חול` — o Whisper ouviu em 15.979999542236328s, não existe no nosso texto

**§7**

- `על` — o Whisper ouviu em 29.219999313354492s, não existe no nosso texto
- `עָלְמַיָּא` *(almayá)* — no texto em 29.44s, o Whisper não ouviu
- `מיה` — o Whisper ouviu em 29.65999984741211s, não existe no nosso texto

**§10**

- `בקבוצה` — o Whisper ouviu em 42.86000061035156s, não existe no nosso texto
- `דְּקֻדְשָׁא` *(decudshá)* — no texto em 43.04s, o Whisper não ouviu
- `לאלה` — o Whisper ouviu em 45.18000030517578s, não existe no nosso texto

**§11**

- `לְעֵלָּא` *(leela)* — no texto em 45.84s, o Whisper não ouviu

**§12**

- `דה` — o Whisper ouviu em 55.29999923706055s, não existe no nosso texto

### ashkenaz_derabanan

**§2**

- `ורה` — o Whisper ouviu em 6.760000228881836s, não existe no nosso texto
- `בְרָא` *(verá)* — no texto em 6.82s, o Whisper não ouviu

**§7**

- `מְבָרַךְ` *(mevarách)* — nós: 29.7s · ouvido: 28.940000534057617s · diferença -0.76s
- `על` — o Whisper ouviu em 33.040000915527344s, não existe no nosso texto
- `עָלְמַיָּא` *(almayá)* — no texto em 33.4s, o Whisper não ouviu
- `מיה` — o Whisper ouviu em 33.619998931884766s, não existe no nosso texto

**§10**

- `די` — o Whisper ouviu em 47.619998931884766s, não existe no nosso texto

**§11** — **já está no OUVIR-PRIMEIRO**

- `לְעֵלָּא` *(leela)* — no texto em 50.82s, o Whisper não ouviu
- `לאלה` — o Whisper ouviu em 50.84000015258789s, não existe no nosso texto

**§12**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — no texto em 56.4s, o Whisper não ouviu
- `תושבכתה` — o Whisper ouviu em 56.47999954223633s, não existe no nosso texto

**§13**

- `עַל` *(Al)* — nós: 64.98s · ouvido: 63.959999084472656s · diferença -1.02s
- `וְעַל` *(veal)* — nós: 67.12s · ouvido: 66.37999725341797s · diferença -0.74s

**§14**

- `הון` — o Whisper ouviu em 70.5999984741211s, não existe no nosso texto
- `הון` — o Whisper ouviu em 75.26000213623047s, não existe no nosso texto

**§15**

- `באור` — o Whisper ouviu em 79.0199966430664s, não existe no nosso texto
- `בְּאוֹרַיְתָא` *(beoraytá)* — no texto em 79.36s, o Whisper não ouviu
- `איתה` — o Whisper ouviu em 79.77999877929688s, não existe no nosso texto

**§16** — **já está no OUVIR-PRIMEIRO**

- `ועטרה` — o Whisper ouviu em 81.4000015258789s, não existe no nosso texto
- `בְאַתְרָא` *(veatrá)* — no texto em 81.72s, o Whisper não ouviu
- `עדן` — o Whisper ouviu em 82.5199966430664s, não existe no nosso texto
- `הָדֵין` *(haden)* — no texto em 82.96s, o Whisper não ouviu
- `עטר` — o Whisper ouviu em 85.72000122070312s, não existe no nosso texto
- `אֲתַר` *(atar)* — no texto em 85.8s, o Whisper não ouviu
- `ועטר` — o Whisper ouviu em 86.37999725341797s, não existe no nosso texto
- `וַאֲתַר` *(vaatár)* — no texto em 86.72s, o Whisper não ouviu

**§17**

- `יְהֵא` *(yehê)* — nós: 88.24s · ouvido: 87.62000274658203s · diferença -0.62s
- `חינה` — o Whisper ouviu em 92.5199966430664s, não existe no nosso texto

**§18**

- `חִנָּא` *(chiná)* — no texto em 93.02s, o Whisper não ouviu

**§20** — **já está no OUVIR-PRIMEIRO**

- `דווי` — o Whisper ouviu em 106s, não existe no nosso texto
- `דְּבִשְׁמַיָּא` *(di-vishmayá)* — no texto em 106.4s, o Whisper não ouviu
- `שמיה` — o Whisper ouviu em 106.83999633789062s, não existe no nosso texto
- `וְאַרְעָא` *(vear-á)* — no texto em 107.94s, o Whisper não ouviu
- `ועראה` — o Whisper ouviu em 108.04000091552734s, não existe no nosso texto

### chabad_yatom

**§2**

- `דברי` — o Whisper ouviu em 5.840000152587891s, não existe no nosso texto
- `דִּי` *(di)* — no texto em 5.86s, o Whisper não ouviu
- `בְרָא` *(verá)* — no texto em 6.01s, o Whisper não ouviu
- `כִרְעוּתֵהּ` *(chir'utêh)* — no texto em 6.7s, o Whisper não ouviu
- `חירותי` — o Whisper ouviu em 6.71999979019165s, não existe no nosso texto

**§8** — **já está no OUVIR-PRIMEIRO**

- `יְהֵא` *(Yehê)* — nós: 27.66s · ouvido: 26.6200008392334s · diferença -1.04s

**§11**

- `דקוצה` — o Whisper ouviu em 44.84000015258789s, não existe no nosso texto
- `דְּקֻדְשָׁא` *(decudshá)* — no texto em 45.02s, o Whisper não ouviu
- `לאלה` — o Whisper ouviu em 46.97999954223633s, não existe no nosso texto

**§12**

- `לְעֵלָּא` *(leela)* — no texto em 47.4s, o Whisper não ouviu

**§13**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — no texto em 52.3s, o Whisper não ouviu
- `תושבכתה` — o Whisper ouviu em 52.34000015258789s, não existe no nosso texto

**§14**

- `של` — o Whisper ouviu em 60.2400016784668s, não existe no nosso texto
- `שְׁלָמָא` *(shelamá)* — no texto em 60.6s, o Whisper não ouviu
- `עמה` — o Whisper ouviu em 60.939998626708984s, não existe no nosso texto
- `מִן` *(min)* — nós: 62.48s · ouvido: 61.86000061035156s · diferença -0.62s

**§15**

- `עֹשֶׂה` *(Ossê)* — nós: 73.16s · ouvido: 71.30000305175781s · diferença -1.86s

### chabad_derabanan

**§2**

- `דִּי` *(di)* — no texto em 5.16s, o Whisper não ouviu
- `דברי` — o Whisper ouviu em 5.21999979019165s, não existe no nosso texto
- `בְרָא` *(verá)* — no texto em 5.56s, o Whisper não ouviu
- `כִרְעוּתֵהּ` *(chir'utêh)* — no texto em 5.86s, o Whisper não ouviu
- `חירותי` — o Whisper ouviu em 5.860000133514404s, não existe no nosso texto

**§8**

- `יְהֵא` *(Yehê)* — nós: 25.12s · ouvido: 24.020000457763672s · diferença -1.1s

**§14**

- `עַל` *(Al)* — nós: 55.7s · ouvido: 55.02000045776367s · diferença -0.68s

**§15**

- `הון` — o Whisper ouviu em 60.97999954223633s, não existe no nosso texto
- `הון` — o Whisper ouviu em 65s, não existe no nosso texto

**§16**

- `וְעַל` *(veal)* — nós: 65.4s · ouvido: 66.0199966430664s · diferença +0.62s
- `בְּאוֹרַיְתָא` *(beoraytá)* — no texto em 69.5s, o Whisper não ouviu
- `איתה` — o Whisper ouviu em 69.94000244140625s, não existe no nosso texto

**§17** — **já está no OUVIR-PRIMEIRO**

- `דִּי` *(di)* — no texto em 70.72s, o Whisper não ouviu
- `בְאַתְרָא` *(veatrá)* — nós: 71.48s · ouvido: 69.12000274658203s · diferença -2.36s
- `הָדֵין` *(haden)* — no texto em 72.78s, o Whisper não ouviu
- `וְדִי` *(vedi)* — no texto em 73.82s, o Whisper não ouviu
- `בְכָל` *(vechol)* — no texto em 74.7s, o Whisper não ouviu
- `אֲתַר` *(atar)* — no texto em 75.68s, o Whisper não ouviu
- `וַאֲתַר` *(vaatár)* — no texto em 76.64s, o Whisper não ouviu

**§18**

- `יְהֵא` *(yehê)* — nós: 77.92s · ouvido: 77.0199966430664s · diferença -0.9s
- `לְהוֹן` *(lehon)* — no texto em 78.72s, o Whisper não ouviu
- `וּלְכוֹן` *(ulechon)* — no texto em 79.74s, o Whisper não ouviu
- `שְׁלָמָא` *(shelamá)* — nós: 80.82s · ouvido: 78.41999816894531s · diferença -2.4s
- `רַבָּא` *(raba)* — nós: 81.7s · ouvido: 79.36000061035156s · diferença -2.34s
- `חינה` — o Whisper ouviu em 82.16000366210938s, não existe no nosso texto

**§19**

- `חִנָּא` *(chiná)* — no texto em 82.48s, o Whisper não ouviu

**§21** — **já está no OUVIR-PRIMEIRO**

- `דווי` — o Whisper ouviu em 94.94000244140625s, não existe no nosso texto
- `דְּבִשְׁמַיָּא` *(di-vishmayá)* — no texto em 94.96s, o Whisper não ouviu
- `שמיה` — o Whisper ouviu em 95.5999984741211s, não existe no nosso texto

**§22**

- `יְהֵא` *(Yehê)* — nós: 98.98s · ouvido: 98.0199966430664s · diferença -0.96s

### sefard_yatom

**§2**

- `דברי` — o Whisper ouviu em 6.400000095367432s, não existe no nosso texto
- `דִּי` *(di)* — no texto em 6.56s, o Whisper não ouviu
- `בְרָא` *(verá)* — no texto em 6.89s, o Whisper não ouviu
- `כִרְעוּתֵהּ` *(chir'utêh)* — no texto em 7.26s, o Whisper não ouviu
- `חירותי` — o Whisper ouviu em 7.300000190734863s, não existe no nosso texto

**§5**

- `בְּחַיֵּיכוֹן` *(bechayechon)* — no texto em 17.06s, o Whisper não ouviu
- `בחיי` — o Whisper ouviu em 17.239999771118164s, não existe no nosso texto
- `חון` — o Whisper ouviu em 17.739999771118164s, não existe no nosso texto
- `וביום` — o Whisper ouviu em 18.079999923706055s, não existe no nosso texto
- `וּבְיוֹמֵיכוֹן` *(uveyomechon)* — no texto em 18.66s, o Whisper não ouviu
- `חון` — o Whisper ouviu em 19.139999389648438s, não existe no nosso texto

**§8**

- `יְהֵא` *(Yehê)* — nós: 30.38s · ouvido: 29.260000228881836s · diferença -1.12s
- `על` — o Whisper ouviu em 35.560001373291016s, não existe no nosso texto
- `עָלְמַיָּא` *(almayá)* — no texto em 35.64s, o Whisper não ouviu
- `מיה` — o Whisper ouviu em 35.86000061035156s, não existe no nosso texto

**§11**

- `דְּקֻדְשָׁא` *(decudshá)* — no texto em 49.04s, o Whisper não ouviu
- `דקוצ` — o Whisper ouviu em 49.060001373291016s, não existe no nosso texto
- `ה` — o Whisper ouviu em 49.5s, não existe no nosso texto

**§12** — **já está no OUVIR-PRIMEIRO**

- `לְעֵלָּא` *(leela)* — no texto em 52.4s, o Whisper não ouviu
- `לאלה` — o Whisper ouviu em 52.91999816894531s, não existe no nosso texto

**§13**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — no texto em 57.7s, o Whisper não ouviu
- `תושב` — o Whisper ouviu em 57.70000076293945s, não existe no nosso texto
- `חתה` — o Whisper ouviu em 58.220001220703125s, não existe no nosso texto
- `וְנֶחֱמָתָא` *(venechamata)* — no texto em 59.34s, o Whisper não ouviu
- `בני` — o Whisper ouviu em 59.459999084472656s, não existe no nosso texto
- `חמתה` — o Whisper ouviu em 59.7400016784668s, não existe no nosso texto

**§14** — **já está no OUVIR-PRIMEIRO**

- `יְהֵא` *(Yehê)* — nós: 65.66s · ouvido: 64.5999984741211s · diferença -1.06s

**§15**

- `בִּמְרוֹמָיו` *(bimromav)* — nós: 80.86s · ouvido: 80.23999786376953s · diferença -0.62s

**§16**

- `וְעַל` *(veal)* — nós: 88.16s · ouvido: 87.4800033569336s · diferença -0.68s

### sefard_derabanan

**§2** — **já está no OUVIR-PRIMEIRO**

- `ורה` — o Whisper ouviu em 5.900000095367432s, não existe no nosso texto
- `בְרָא` *(verá)* — no texto em 5.94s, o Whisper não ouviu

**§15**

- `הון` — o Whisper ouviu em 65.36000061035156s, não existe no nosso texto
- `הון` — o Whisper ouviu em 69.55999755859375s, não existe no nosso texto

**§18**

- `יְהֵא` *(yehê)* — nós: 82.42s · ouvido: 81.62000274658203s · diferença -0.8s

**§19**

- `חִנָּא` *(chiná)* — no texto em 87.12s, o Whisper não ouviu
- `חינה` — o Whisper ouviu em 87.30000305175781s, não existe no nosso texto

**§21**

- `דִּי` *(di)* — nós: 99.92s · ouvido: 100.62000274658203s · diferença +0.7s
- `וְאַרְעָא` *(vear-á)* — no texto em 102.02s, o Whisper não ouviu
- `וערה` — o Whisper ouviu em 102.19999694824219s, não existe no nosso texto

**§22** — **já está no OUVIR-PRIMEIRO**

- `יְהֵא` *(Yehê)* — nós: 105.92s · ouvido: 105.05999755859375s · diferença -0.86s

**§23**

- `בִּמְרוֹמָיו` *(bimromav)* — nós: 119.94s · ouvido: 119.31999969482422s · diferença -0.62s

**§24** — **já está no OUVIR-PRIMEIRO**

- `אָמֵן` *(Amen)* — nós: 130.46s · ouvido: 129.82000732421875s · diferença -0.64s

### sefaradi_yatom

**§2**

- `דברך` — o Whisper ouviu em 5.019999980926514s, não existe no nosso texto
- `דִּי` *(di)* — no texto em 5.14s, o Whisper não ouviu
- `חיראותי` — o Whisper ouviu em 5.860000133514404s, não existe no nosso texto
- `בְרָא` *(verá)* — no texto em 5.88s, o Whisper não ouviu
- `כִרְעוּתֵהּ` *(chir'utêh)* — no texto em 6.22s, o Whisper não ouviu

**§5**

- `בְּחַיֵּיכוֹן` *(bechayechon)* — no texto em 14.06s, o Whisper não ouviu
- `בחיי` — o Whisper ouviu em 14.220000267028809s, não existe no nosso texto
- `חון` — o Whisper ouviu em 14.640000343322754s, não existe no nosso texto
- `וביום` — o Whisper ouviu em 15s, não existe no nosso texto
- `וּבְיוֹמֵיכוֹן` *(uveyomechon)* — no texto em 15.44s, o Whisper não ouviu
- `היכון` — o Whisper ouviu em 15.819999694824219s, não existe no nosso texto

**§7**

- `בַּעֲגָלָא` *(baagalá)* — nós: 21.1s · ouvido: 19.899999618530273s · diferença -1.2s

**§8** — **já está no OUVIR-PRIMEIRO**

- `לְעָלַם` *(lealám)* — nós: 29.52s · ouvido: 28.899999618530273s · diferença -0.62s

**§11**

- `דְּקֻדְשָׁא` *(decudshá)* — no texto em 43.16s, o Whisper não ouviu
- `בקבוצה` — o Whisper ouviu em 43.2400016784668s, não existe no nosso texto

**§12** — **já está no OUVIR-PRIMEIRO**

- `לְעֵלָּא` *(leela)* — no texto em 45.32s, o Whisper não ouviu
- `לאלה` — o Whisper ouviu em 45.52000045776367s, não existe no nosso texto

**§13**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — no texto em 48.94s, o Whisper não ouviu
- `תושבכתה` — o Whisper ouviu em 49s, não existe no nosso texto

**§14**

- `יְהֵא` *(Yehê)* — nós: 55.64s · ouvido: 54.86000061035156s · diferença -0.78s

**§15**

- `וסבה` — o Whisper ouviu em 59.86000061035156s, não existe no nosso texto
- `וְשָׂבָע` *(vessavá)* — no texto em 59.96s, o Whisper não ouviu

**§18**

- `עוֹשֶׂה` *(Ossê)* — nós: 78.24s · ouvido: 76.94000244140625s · diferença -1.3s

### sefaradi_derabanan

**§2**

- `דברך` — o Whisper ouviu em 4.579999923706055s, não existe no nosso texto
- `דִּי` *(di)* — no texto em 4.6s, o Whisper não ouviu
- `חירותי` — o Whisper ouviu em 5.239999771118164s, não existe no nosso texto
- `בְרָא` *(verá)* — no texto em 5.24s, o Whisper não ouviu
- `כִרְעוּתֵהּ` *(chir'utêh)* — no texto em 5.64s, o Whisper não ouviu

**§5**

- `בְּחַיֵּיכוֹן` *(bechayechon)* — no texto em 12.46s, o Whisper não ouviu
- `בחיי` — o Whisper ouviu em 12.640000343322754s, não existe no nosso texto
- `חון` — o Whisper ouviu em 13.0600004196167s, não existe no nosso texto
- `חון` — o Whisper ouviu em 14.140000343322754s, não existe no nosso texto

**§11**

- `דקוצ` — o Whisper ouviu em 36.7400016784668s, não existe no nosso texto
- `דְּקֻדְשָׁא` *(decudshá)* — no texto em 36.82s, o Whisper não ouviu
- `ה` — o Whisper ouviu em 37.060001373291016s, não existe no nosso texto
- `להאלה` — o Whisper ouviu em 38.15999984741211s, não existe no nosso texto

**§12** — **já está no OUVIR-PRIMEIRO**

- `לְעֵלָּא` *(leela)* — no texto em 38.68s, o Whisper não ouviu

**§13**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — no texto em 42.16s, o Whisper não ouviu
- `תושבכתה` — o Whisper ouviu em 42.220001220703125s, não existe no nosso texto

**§18** — **já está no OUVIR-PRIMEIRO**

- `לָנָא` *(lána)* — no texto em 64.3s, o Whisper não ouviu
- `לאנה` — o Whisper ouviu em 64.45999908447266s, não existe no nosso texto
- `חִנָּא` *(chiná)* — no texto em 67.2s, o Whisper não ouviu
- `חינה` — o Whisper ouviu em 67.4000015258789s, não existe no nosso texto

**§21**

- `וסבה` — o Whisper ouviu em 78.86000061035156s, não existe no nosso texto
- `וְשָׂבָע` *(vessavá)* — no texto em 79.04s, o Whisper não ouviu

**§24**

- `עוֹשֶׂה` *(Ossê)* — nós: 94.32s · ouvido: 93.4800033569336s · diferença -0.84s

**§25**

- `ורחמב` — o Whisper ouviu em 96.80000305175781s, não existe no nosso texto
- `בְּרַחֲמָיו` *(berachamav)* — no texto em 96.88s, o Whisper não ouviu

## O que fazer com isto

1. Comece pelos versos do cruzamento acima — são os que os dois métodos marcaram.
2. Ouça o verso no conferidor.html. Se a palavra acender fora da voz, anote o segundo.
3. O reparo vira âncora em `ancoras.json`, e só então roda o alinhador.
4. Este relatório nunca altera nada. Quem altera é uma pessoa.

