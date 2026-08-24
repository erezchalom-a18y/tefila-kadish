# Relatório da revisão auditiva (Whisper)

Gerado em 2026-08-24 01:35 UTC por `whisper-1`, sobre o commit `cf8fff6`.

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
| ashkenaz_yatom | 75 | 80 | 36 |
| ashkenaz_derabanan | 118 | 124 | 35 |
| chabad_yatom | 80 | 80 | 16 |
| chabad_derabanan | 121 | 124 | 35 |
| sefard_yatom | 81 | 86 | 43 |
| sefard_derabanan | 124 | 126 | 38 |
| sefaradi_yatom | 91 | 92 | 27 |
| sefaradi_derabanan | 125 | 124 | 42 |
| **total** | | | **272** |

Por eixo:

- começa em hora diferente: **127**
- está no texto, não foi ouvida: **62**
- foi ouvida, não está no texto: **83**

## Cruzamento com OUVIR-PRIMEIRO.md

A auditoria de sinal de 20/08 listou 36 suspeitos, espalhados por
28 versos diferentes.

Dos 272 apontamentos do Whisper, **64** caem em versos que já
estavam naquela lista — cobrindo **20** dos 28 versos suspeitos.

Onde os dois métodos concordam, a chance de haver defeito real é bem maior:
comece a ouvir por aqui.

- ashkenaz_derabanan §11
- ashkenaz_derabanan §16
- ashkenaz_derabanan §20
- ashkenaz_yatom §13
- ashkenaz_yatom §14
- ashkenaz_yatom §2
- ashkenaz_yatom §5
- chabad_derabanan §21
- chabad_yatom §8
- sefaradi_derabanan §12
- sefaradi_derabanan §18
- sefaradi_derabanan §19
- sefard_derabanan §1
- sefard_derabanan §16
- sefard_derabanan §17
- sefard_derabanan §2
- sefard_derabanan §22
- sefard_derabanan §24
- sefard_yatom §12
- sefard_yatom §14

## Apontamentos, nussach por nussach

### ashkenaz_yatom

**§2** — **já está no OUVIR-PRIMEIRO**

- `ורה` — o Whisper ouviu em 6.139999866485596s, não existe no nosso texto
- `בְרָא` *(verá)* — no texto em 7.52s, o Whisper não ouviu
- `כִרְעוּתֵהּ` *(chir'utêh)* — nós: 8.24s · ouvido: 6.579999923706055s · diferença -1.66s

**§3**

- `וְיַמְלִיךְ` *(veyamlich)* — nós: 9.48s · ouvido: 8.34000015258789s · diferença -1.14s
- `מַלְכוּתֵהּ` *(malchutêh)* — nós: 11.18s · ouvido: 9.199999809265137s · diferença -1.98s
- `בחיי` — o Whisper ouviu em 11.460000038146973s, não existe no nosso texto
- `חון` — o Whisper ouviu em 11.9399995803833s, não existe no nosso texto
- `וביום` — o Whisper ouviu em 12.319999694824219s, não existe no nosso texto

**§4**

- `בְּחַיֵּיכוֹן` *(bechayechon)* — no texto em 12.86s, o Whisper não ouviu
- `החון` — o Whisper ouviu em 13.4399995803833s, não existe no nosso texto
- `וּבְיוֹמֵיכוֹן` *(uveyomechon)* — no texto em 14.46s, o Whisper não ouviu
- `דה` — o Whisper ouviu em 15.260000228881836s, não existe no nosso texto

**§5** — **já está no OUVIR-PRIMEIRO**

- `וּבְחַיֵּי` *(uvechayê)* — nós: 15.36s · ouvido: 14.579999923706055s · diferença -0.78s
- `דְכָל` *(dechol)* — no texto em 15.91s, o Whisper não ouviu
- `חול` — o Whisper ouviu em 15.979999542236328s, não existe no nosso texto

**§7**

- `על` — o Whisper ouviu em 29.219999313354492s, não existe no nosso texto
- `עָלְמַיָּא` *(almayá)* — no texto em 29.42s, o Whisper não ouviu
- `מיה` — o Whisper ouviu em 29.65999984741211s, não existe no nosso texto

**§10**

- `וְיִתְעַלֶּה` *(veyitaleh)* — nós: 39.8s · ouvido: 38.7400016784668s · diferença -1.06s
- `וְיִתְהַלָּל` *(veyithalal)* — nós: 41.1s · ouvido: 40.34000015258789s · diferença -0.76s
- `בקבוצה` — o Whisper ouviu em 42.86000061035156s, não existe no nosso texto
- `דְּקֻדְשָׁא` *(decudshá)* — no texto em 43s, o Whisper não ouviu
- `לאלה` — o Whisper ouviu em 45.18000030517578s, não existe no nosso texto

**§11**

- `לְעֵלָּא` *(leela)* — no texto em 45.82s, o Whisper não ouviu

**§12**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — nós: 50.54s · ouvido: 51.41999816894531s · diferença +0.88s
- `דה` — o Whisper ouviu em 55.29999923706055s, não existe no nosso texto

**§13** — **já está no OUVIR-PRIMEIRO**

- `יְהֵא` *(Yehê)* — nós: 61.5s · ouvido: 59.599998474121094s · diferença -1.9s
- `שְׁלָמָא` *(shelamá)* — nós: 62.48s · ouvido: 60.720001220703125s · diferença -1.76s
- `רַבָּא` *(raba)* — nós: 63.06s · ouvido: 61.31999969482422s · diferença -1.74s
- `מִן` *(min)* — nós: 63.55s · ouvido: 62s · diferença -1.55s
- `שְׁמַיָּא` *(shemayá)* — nós: 64.28s · ouvido: 63.13999938964844s · diferença -1.14s
- `וְחַיִּים` *(vechayim)* — nós: 65.42s · ouvido: 64.33999633789062s · diferença -1.08s
- `עָלֵינוּ` *(aleinu)* — nós: 66.64s · ouvido: 65.26000213623047s · diferença -1.38s
- `וְעַל` *(veal)* — nós: 67.52s · ouvido: 66.27999877929688s · diferença -1.24s
- `כָּל` *(kol)* — nós: 67.98s · ouvido: 67.23999786376953s · diferença -0.74s

**§14** — **já está no OUVIR-PRIMEIRO**

- `הוּא` *(hu)* — nós: 74.49s · ouvido: 75.62000274658203s · diferença +1.13s

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
- `אָמֵן` *(amên)* — nós: 62.02s · ouvido: 62.65999984741211s · diferença +0.64s

**§13**

- `עַל` *(Al)* — nós: 62.98s · ouvido: 63.959999084472656s · diferença +0.98s

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
- `אֲתַר` *(atar)* — no texto em 85.28s, o Whisper não ouviu
- `עטר` — o Whisper ouviu em 85.72000122070312s, não existe no nosso texto
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

**§23**

- `אָמֵן` *(amên)* — nós: 137.08s · ouvido: 137.86000061035156s · diferença +0.78s

### chabad_yatom

**§2**

- `דִּי` *(di)* — no texto em 5.84s, o Whisper não ouviu
- `דברי` — o Whisper ouviu em 5.840000152587891s, não existe no nosso texto
- `בְרָא` *(verá)* — no texto em 6.22s, o Whisper não ouviu
- `כִרְעוּתֵהּ` *(chir'utêh)* — no texto em 6.68s, o Whisper não ouviu
- `חירותי` — o Whisper ouviu em 6.71999979019165s, não existe no nosso texto

**§8** — **já está no OUVIR-PRIMEIRO**

- `יְהֵא` *(Yehê)* — nós: 27.66s · ouvido: 26.6200008392334s · diferença -1.04s

**§11**

- `דקוצה` — o Whisper ouviu em 44.84000015258789s, não existe no nosso texto
- `דְּקֻדְשָׁא` *(decudshá)* — no texto em 45s, o Whisper não ouviu
- `לאלה` — o Whisper ouviu em 46.97999954223633s, não existe no nosso texto

**§12**

- `לְעֵלָּא` *(leela)* — no texto em 47.38s, o Whisper não ouviu

**§13**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — no texto em 52.3s, o Whisper não ouviu
- `תושבכתה` — o Whisper ouviu em 52.34000015258789s, não existe no nosso texto

**§14**

- `של` — o Whisper ouviu em 60.2400016784668s, não existe no nosso texto
- `שְׁלָמָא` *(shelamá)* — no texto em 60.58s, o Whisper não ouviu
- `עמה` — o Whisper ouviu em 60.939998626708984s, não existe no nosso texto

**§15**

- `עֹשֶׂה` *(Ossê)* — nós: 73.14s · ouvido: 71.30000305175781s · diferença -1.84s

### chabad_derabanan

**§2**

- `דִּי` *(di)* — no texto em 5.16s, o Whisper não ouviu
- `דברי` — o Whisper ouviu em 5.21999979019165s, não existe no nosso texto
- `בְרָא` *(verá)* — no texto em 5.86s, o Whisper não ouviu
- `חירותי` — o Whisper ouviu em 5.860000133514404s, não existe no nosso texto
- `כִרְעוּתֵהּ` *(chir'utêh)* — no texto em 6.32s, o Whisper não ouviu

**§4**

- `וִיקָרֵב` *(vikarev)* — nós: 10.38s · ouvido: 11.5600004196167s · diferença +1.18s
- `מְשִׁיחֵהּ` *(meshichêh)* — nós: 11.5s · ouvido: 12.140000343322754s · diferença +0.64s

**§5**

- `בְּחַיֵּיכוֹן` *(bechayechon)* — nós: 12.4s · ouvido: 13.819999694824219s · diferença +1.42s
- `וּבְיוֹמֵיכוֹן` *(uveyomechon)* — nós: 13.66s · ouvido: 14.619999885559082s · diferença +0.96s

**§6**

- `וּבְחַיֵּי` *(uvechayê)* — nós: 15.06s · ouvido: 16.479999542236328s · diferença +1.42s
- `דְכָל` *(dechol)* — nós: 16.42s · ouvido: 17.100000381469727s · diferença +0.68s
- `בֵּית` *(beit)* — nós: 16.66s · ouvido: 17.979999542236328s · diferença +1.32s
- `יִשְׂרָאֵל` *(Israel)* — nós: 17.22s · ouvido: 18.559999465942383s · diferença +1.34s

**§7**

- `בַּעֲגָלָא` *(baagalá)* — nós: 18.6s · ouvido: 19.920000076293945s · diferença +1.32s
- `וּבִזְמַן` *(uvizmán)* — nós: 19.78s · ouvido: 20.860000610351562s · diferença +1.08s
- `קָרִיב` *(carív)* — nós: 20.9s · ouvido: 21.559999465942383s · diferença +0.66s
- `וְאִמְרוּ` *(veimrú)* — nós: 21.86s · ouvido: 22.780000686645508s · diferença +0.92s
- `אָמֵן` *(amên)* — nós: 22.7s · ouvido: 23.639999389648438s · diferença +0.94s

**§8**

- `יְהֵא` *(Yehê)* — nós: 23.66s · ouvido: 25.020000457763672s · diferença +1.36s
- `שְׁמֵהּ` *(shemê)* — nós: 25.12s · ouvido: 25.760000228881836s · diferença +0.64s

**§14**

- `עַל` *(Al)* — nós: 55.7s · ouvido: 55.02000045776367s · diferença -0.68s

**§15**

- `הון` — o Whisper ouviu em 60.97999954223633s, não existe no nosso texto
- `הון` — o Whisper ouviu em 65s, não existe no nosso texto

**§16**

- `וְעַל` *(veal)* — nós: 65.4s · ouvido: 66.0199966430664s · diferença +0.62s
- `באור` — o Whisper ouviu em 69.12000274658203s, não existe no nosso texto
- `בְּאוֹרַיְתָא` *(beoraytá)* — no texto em 69.5s, o Whisper não ouviu
- `איתה` — o Whisper ouviu em 69.94000244140625s, não existe no nosso texto

**§19**

- `חִנָּא` *(chiná)* — no texto em 82.48s, o Whisper não ouviu
- `חינה` — o Whisper ouviu em 82.68000030517578s, não existe no nosso texto

**§21** — **já está no OUVIR-PRIMEIRO**

- `די` — o Whisper ouviu em 94.91999816894531s, não existe no nosso texto
- `דְּבִשְׁמַיָּא` *(di-vishmayá)* — no texto em 94.96s, o Whisper não ouviu
- `ושמיה` — o Whisper ouviu em 95.45999908447266s, não existe no nosso texto
- `וְאִמְרוּ` *(veimrú)* — nós: 95.68s · ouvido: 96.69999694824219s · diferença +1.02s
- `אָמֵן` *(amên)* — nós: 96.56s · ouvido: 97.63999938964844s · diferença +1.08s

**§22**

- `שְׁלָמָא` *(shelamá)* — nós: 98.98s · ouvido: 99.68000030517578s · diferença +0.7s

### sefard_yatom

**§2**

- `דברי` — o Whisper ouviu em 6.400000095367432s, não existe no nosso texto
- `דִּי` *(di)* — no texto em 6.56s, o Whisper não ouviu
- `בְרָא` *(verá)* — no texto em 7.26s, o Whisper não ouviu
- `חירותי` — o Whisper ouviu em 7.300000190734863s, não existe no nosso texto
- `כִרְעוּתֵהּ` *(chir'utêh)* — no texto em 7.78s, o Whisper não ouviu

**§5**

- `בְּחַיֵּיכוֹן` *(bechayechon)* — no texto em 17.06s, o Whisper não ouviu
- `בחיי` — o Whisper ouviu em 17.239999771118164s, não existe no nosso texto
- `חון` — o Whisper ouviu em 17.739999771118164s, não existe no nosso texto
- `וביום` — o Whisper ouviu em 18.079999923706055s, não existe no nosso texto
- `וּבְיוֹמֵיכוֹן` *(uveyomechon)* — no texto em 18.66s, o Whisper não ouviu
- `חון` — o Whisper ouviu em 19.139999389648438s, não existe no nosso texto

**§8**

- `יְהֵא` *(Yehê)* — nós: 30.38s · ouvido: 29.260000228881836s · diferença -1.12s
- `שְׁמֵהּ` *(shemê)* — nós: 32.08s · ouvido: 31.020000457763672s · diferença -1.06s
- `רַבָּא` *(raba)* — nós: 32.74s · ouvido: 31.559999465942383s · diferença -1.18s
- `מְבָרַךְ` *(mevarách)* — nós: 34.04s · ouvido: 32.599998474121094s · diferença -1.44s
- `לְעָלַם` *(lealám)* — nós: 34.88s · ouvido: 34.099998474121094s · diferença -0.78s
- `על` — o Whisper ouviu em 35.560001373291016s, não existe no nosso texto
- `וּלְעָלְמֵי` *(ul'almei)* — nós: 35.64s · ouvido: 34.68000030517578s · diferença -0.96s
- `מיה` — o Whisper ouviu em 35.86000061035156s, não existe no nosso texto
- `עָלְמַיָּא` *(almayá)* — no texto em 36.9s, o Whisper não ouviu

**§9**

- `יִתְבָּרַךְ` *(Yitbarêch)* — nós: 38.14s · ouvido: 37.119998931884766s · diferença -1.02s
- `וְיִשְׁתַּבַּח` *(veyishtabach)* — nós: 39.62s · ouvido: 37.81999969482422s · diferença -1.8s
- `וְיִתְפָּאַר` *(veyitpaar)* — nós: 41s · ouvido: 39.779998779296875s · diferença -1.22s

**§10**

- `וְיִתְרוֹמַם` *(veyitromam)* — nós: 42.54s · ouvido: 40.65999984741211s · diferença -1.88s
- `וְיִתְנַשֵּׂא` *(veyitnasse)* — nós: 44.06s · ouvido: 42.63999938964844s · diferença -1.42s
- `וְיִתְהַדָּר` *(veyithadar)* — nós: 45.42s · ouvido: 44.13999938964844s · diferença -1.28s

**§11**

- `וְיִתְעַלֶּה` *(veyitaleh)* — nós: 46.84s · ouvido: 45.040000915527344s · diferença -1.8s
- `וְיִתְהַלָּל` *(veyithalal)* — nós: 48s · ouvido: 46.36000061035156s · diferença -1.64s
- `שְׁמֵהּ` *(shemê)* — nós: 49.04s · ouvido: 47.70000076293945s · diferença -1.34s
- `דקוצ` — o Whisper ouviu em 49.060001373291016s, não existe no nosso texto
- `דְּקֻדְשָׁא` *(decudshá)* — no texto em 49.26s, o Whisper não ouviu
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

**§1** — **já está no OUVIR-PRIMEIRO**

- `שְׁמֵהּ` *(shemê)* — nós: 1.82s · ouvido: 2.440000057220459s · diferença +0.62s

**§2** — **já está no OUVIR-PRIMEIRO**

- `בְּעָלְמָא` *(bealma)* — nós: 3.46s · ouvido: 4.340000152587891s · diferença +0.88s
- `דִּי` *(di)* — nós: 4.56s · ouvido: 5.480000019073486s · diferença +0.92s
- `בְרָא` *(verá)* — no texto em 5s, o Whisper não ouviu
- `ורה` — o Whisper ouviu em 5.900000095367432s, não existe no nosso texto
- `כִרְעוּתֵהּ` *(chir'utêh)* — nós: 8.02s · ouvido: 6.480000019073486s · diferença -1.54s

**§3**

- `וְיַמְלִיךְ` *(veyamlich)* — nós: 9.18s · ouvido: 8.15999984741211s · diferença -1.02s
- `מַלְכוּתֵהּ` *(malchutêh)* — nós: 10.6s · ouvido: 8.9399995803833s · diferença -1.66s

**§4**

- `וְיַצְמַח` *(veyatsmách)* — nós: 11.96s · ouvido: 10.720000267028809s · diferença -1.24s
- `פֻּרְקָנֵהּ` *(purkanêh)* — nós: 13.06s · ouvido: 11.539999961853027s · diferença -1.52s
- `וִיקָרֵב` *(vikarev)* — nós: 14.08s · ouvido: 13.239999771118164s · diferença -0.84s
- `מְשִׁיחֵהּ` *(meshichêh)* — nós: 15.56s · ouvido: 13.800000190734863s · diferença -1.76s

**§5**

- `בְּחַיֵּיכוֹן` *(bechayechon)* — nós: 17.08s · ouvido: 15.779999732971191s · diferença -1.3s
- `וּבְיוֹמֵיכוֹן` *(uveyomechon)* — nós: 18.5s · ouvido: 16.65999984741211s · diferença -1.84s

**§6**

- `וּבְחַיֵּי` *(uvechayê)* — nós: 19.44s · ouvido: 18.6200008392334s · diferença -0.82s

**§8**

- `יְהֵא` *(Yehê)* — nós: 27.74s · ouvido: 26.5s · diferença -1.24s

**§15**

- `הון` — o Whisper ouviu em 65.36000061035156s, não existe no nosso texto

**§16** — **já está no OUVIR-PRIMEIRO**

- `וְעַל` *(veal)* — nós: 69.39s · ouvido: 70.76000213623047s · diferença +1.37s
- `הון` — o Whisper ouviu em 69.55999755859375s, não existe no nosso texto
- `כָּל` *(kol)* — nós: 70.26s · ouvido: 70.87999725341797s · diferença +0.62s
- `מָאן` *(man)* — nós: 70.69s · ouvido: 71.76000213623047s · diferença +1.07s

**§17** — **já está no OUVIR-PRIMEIRO**

- `בְאַתְרָא` *(veatrá)* — nós: 76.72s · ouvido: 75.37999725341797s · diferença -1.34s
- `הָדֵין` *(haden)* — nós: 77.88s · ouvido: 76.58000183105469s · diferença -1.3s

**§18**

- `יְהֵא` *(yehê)* — nós: 82.4s · ouvido: 81.62000274658203s · diferença -0.78s
- `שְׁלָמָא` *(shelamá)* — nós: 83.94s · ouvido: 85.30000305175781s · diferença +1.36s
- `רַבָּא` *(raba)* — nós: 85.1s · ouvido: 85.87999725341797s · diferença +0.78s

**§19**

- `חִנָּא` *(chiná)* — no texto em 86.08s, o Whisper não ouviu
- `חינה` — o Whisper ouviu em 87.30000305175781s, não existe no nosso texto
- `וְרַחֲמִין` *(verachamin)* — nós: 88.02s · ouvido: 89.30000305175781s · diferença +1.28s

**§21**

- `דִּי` *(di)* — nós: 99.9s · ouvido: 100.62000274658203s · diferença +0.72s
- `וְאַרְעָא` *(vear-á)* — no texto em 102s, o Whisper não ouviu
- `וערה` — o Whisper ouviu em 102.19999694824219s, não existe no nosso texto
- `וְאִמְרוּ` *(veimrú)* — nós: 102.57s · ouvido: 103.83999633789062s · diferença +1.27s
- `אָמֵן` *(amên)* — nós: 103.72s · ouvido: 104.68000030517578s · diferença +0.96s

**§22** — **já está no OUVIR-PRIMEIRO**

- `שְׁלָמָא` *(shelamá)* — nós: 105.9s · ouvido: 106.55999755859375s · diferença +0.66s
- `רַבָּא` *(raba)* — nós: 106.66s · ouvido: 107.30000305175781s · diferença +0.64s
- `מִן` *(min)* — nós: 107.62s · ouvido: 108.5999984741211s · diferença +0.98s

**§24** — **já está no OUVIR-PRIMEIRO**

- `אָמֵן` *(amên)* — nós: 130.44s · ouvido: 129.82000732421875s · diferença -0.62s

### sefaradi_yatom

**§2**

- `דברי` — o Whisper ouviu em 6.119999885559082s, não existe no nosso texto
- `דִּי` *(di)* — no texto em 6.3s, o Whisper não ouviu
- `בְרָא` *(verá)* — no texto em 7.08s, o Whisper não ouviu
- `כִרְעוּתֵהּ` *(chir'utêh)* — nós: 7.82s · ouvido: 7.039999961853027s · diferença -0.78s

**§4**

- `בחיי` — o Whisper ouviu em 15.819999694824219s, não existe no nosso texto

**§5**

- `בְּחַיֵּיכוֹן` *(bechayechon)* — no texto em 16.5s, o Whisper não ouviu
- `חון` — o Whisper ouviu em 17.219999313354492s, não existe no nosso texto
- `וביום` — o Whisper ouviu em 17.579999923706055s, não existe no nosso texto
- `וּבְיוֹמֵיכוֹן` *(uveyomechon)* — no texto em 18s, o Whisper não ouviu
- `חון` — o Whisper ouviu em 18.559999465942383s, não existe no nosso texto

**§11**

- `דקוצה` — o Whisper ouviu em 49.97999954223633s, não existe no nosso texto
- `דְּקֻדְשָׁא` *(decudshá)* — no texto em 50.28s, o Whisper não ouviu

**§13**

- `דַּאֲמִירָן` *(dáamiran)* — nós: 60.36s · ouvido: 61.040000915527344s · diferença +0.68s
- `בְּעָלְמָא` *(bealma)* — nós: 61.1s · ouvido: 62.060001373291016s · diferença +0.96s

**§14**

- `יְהֵא` *(Yehê)* — nós: 65.24s · ouvido: 64.54000091552734s · diferença -0.7s
- `שְׁמַיָּא` *(shemayá)* — nós: 69.06s · ouvido: 67.9000015258789s · diferença -1.16s
- `וסבא` — o Whisper ouviu em 69.66000366210938s, não existe no nosso texto

**§15**

- `חַיִּים` *(chayim)* — nós: 69.84s · ouvido: 68.54000091552734s · diferença -1.3s
- `וְשָׂבָע` *(vessavá)* — no texto em 71.04s, o Whisper não ouviu
- `וִישׁוּעָה` *(vishuá)* — nós: 72.2s · ouvido: 70.72000122070312s · diferença -1.48s
- `וְנֶחָמָה` *(venechamá)* — nós: 73.58s · ouvido: 72.12000274658203s · diferença -1.46s
- `וְשֵׁיזָבָא` *(veshezavá)* — nós: 75.06s · ouvido: 73.41999816894531s · diferença -1.64s

**§16**

- `וּרְפוּאָה` *(urfuá)* — nós: 75.62s · ouvido: 74.81999969482422s · diferença -0.8s

**§17**

- `עַמּוֹ` *(amô)* — nós: 85.28s · ouvido: 84.31999969482422s · diferença -0.96s
- `יִשְׂרָאֵל` *(Israel)* — nós: 85.9s · ouvido: 84.94000244140625s · diferença -0.96s

**§19**

- `ורחמב` — o Whisper ouviu em 92.36000061035156s, não existe no nosso texto
- `בְּרַחֲמָיו` *(berachamav)* — no texto em 92.8s, o Whisper não ouviu

### sefaradi_derabanan

**§2**

- `דברה` — o Whisper ouviu em 5.639999866485596s, não existe no nosso texto
- `דִּי` *(di)* — no texto em 5.64s, o Whisper não ouviu
- `בְרָא` *(verá)* — no texto em 6.32s, o Whisper não ouviu

**§8**

- `עָלְמַיָּא` *(almayá)* — no texto em 33.94s, o Whisper não ouviu

**§11**

- `דְּקֻדְשָׁא` *(decudshá)* — no texto em 47.68s, o Whisper não ouviu
- `בקבוצה` — o Whisper ouviu em 47.7599983215332s, não existe no nosso texto

**§12** — **já está no OUVIR-PRIMEIRO**

- `לְעֵלָּא` *(leela)* — nós: 50.74s · ouvido: 50.02000045776367s · diferença -0.72s
- `ממכל` — o Whisper ouviu em 51.439998626708984s, não existe no nosso texto
- `מִן` *(min)* — no texto em 51.86s, o Whisper não ouviu
- `כָּל` *(kol)* — no texto em 52.58s, o Whisper não ouviu

**§13**

- `בְּעָלְמָא` *(bealma)* — nós: 61s · ouvido: 59.900001525878906s · diferença -1.1s
- `וְאִמְרוּ` *(veimrú)* — nós: 62.26s · ouvido: 61.08000183105469s · diferença -1.18s
- `אָמֵן` *(amên)* — nós: 63.94s · ouvido: 61.880001068115234s · diferença -2.06s

**§14**

- `עַל` *(Al)* — nós: 64.48s · ouvido: 63.58000183105469s · diferença -0.9s
- `יִשְׂרָאֵל` *(Israel)* — nós: 65.06s · ouvido: 64.36000061035156s · diferença -0.7s

**§15**

- `הון` — o Whisper ouviu em 69.13999938964844s, não existe no nosso texto
- `הון` — o Whisper ouviu em 73.19999694824219s, não existe no nosso texto

**§18** — **já está no OUVIR-PRIMEIRO**

- `חִנָּא` *(chiná)* — no texto em 88.64s, o Whisper não ouviu
- `חינה` — o Whisper ouviu em 88.95999908447266s, não existe no nosso texto

**§19** — **já está no OUVIR-PRIMEIRO**

- `וְאַרְעָא` *(vear-á)* — no texto em 95.84s, o Whisper não ouviu
- `ועראה` — o Whisper ouviu em 95.91999816894531s, não existe no nosso texto

**§21**

- `וסבא` — o Whisper ouviu em 105.0199966430664s, não existe no nosso texto
- `וְשָׂבָע` *(vessavá)* — no texto em 105.22s, o Whisper não ouviu

**§22**

- `וּגְאֻלָּה` *(ug'ulá)* — nós: 110.6s · ouvido: 111.5s · diferença +0.9s
- `וּסְלִיחָה` *(usslichá)* — nós: 111.44s · ouvido: 112.68000030517578s · diferença +1.24s
- `וְכַפָּרָה` *(vechapará)* — nós: 112.66s · ouvido: 113.95999908447266s · diferença +1.3s

**§23**

- `וְרֶוַח` *(verêvach)* — nós: 113.88s · ouvido: 115.69999694824219s · diferença +1.82s
- `וְהַצָּלָה` *(vehatsalá)* — nós: 114.42s · ouvido: 116.83999633789062s · diferença +2.42s
- `לָנוּ` *(lanu)* — nós: 115.62s · ouvido: 117.66000366210938s · diferença +2.04s
- `וּלְכָל` *(ulechol)* — nós: 116.7s · ouvido: 118.5s · diferença +1.8s
- `עַמּוֹ` *(amô)* — nós: 117.9s · ouvido: 119.5999984741211s · diferença +1.7s
- `יִשְׂרָאֵל` *(Israel)* — nós: 118.86s · ouvido: 120.18000030517578s · diferença +1.32s
- `וְאִמְרוּ` *(veimrú)* — nós: 120.28s · ouvido: 121.76000213623047s · diferença +1.48s
- `אָמֵן` *(amên)* — nós: 121.76s · ouvido: 122.55999755859375s · diferença +0.8s

**§24**

- `שָׁלוֹם` *(shalom)* — nós: 124.64s · ouvido: 125.58000183105469s · diferença +0.94s

**§25**

- `הוּא` *(hu)* — nós: 126.62s · ouvido: 128.10000610351562s · diferença +1.48s
- `בְּרַחֲמָיו` *(berachamav)* — no texto em 127.88s, o Whisper não ouviu
- `ורחמב` — o Whisper ouviu em 128.24000549316406s, não existe no nosso texto
- `יַעֲשֶׂה` *(yaassê)* — nós: 128.48s · ouvido: 129.39999389648438s · diferença +0.92s
- `שָׁלוֹם` *(shalom)* — nós: 129.84s · ouvido: 130.52000427246094s · diferença +0.68s
- `וְעַל` *(veal)* — nós: 131.64s · ouvido: 132.25999450683594s · diferença +0.62s
- `כָּל` *(kol)* — nós: 132.78s · ouvido: 133.44000244140625s · diferença +0.66s

## O que fazer com isto

1. Comece pelos versos do cruzamento acima — são os que os dois métodos marcaram.
2. Ouça o verso no conferidor.html. Se a palavra acender fora da voz, anote o segundo.
3. O reparo vira âncora em `ancoras.json`, e só então roda o alinhador.
4. Este relatório nunca altera nada. Quem altera é uma pessoa.

