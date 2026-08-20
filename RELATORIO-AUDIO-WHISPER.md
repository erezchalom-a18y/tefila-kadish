# Relatório da revisão auditiva (Whisper)

Gerado em 2026-08-20 20:01 UTC por `whisper-1`, sobre o commit `576001b`.

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
| ashkenaz_derabanan | 118 | 124 | 89 |
| chabad_yatom | 80 | 80 | 27 |
| chabad_derabanan | 121 | 124 | 79 |
| sefard_yatom | 81 | 86 | 49 |
| sefard_derabanan | 124 | 126 | 37 |
| sefaradi_yatom | 91 | 92 | 58 |
| sefaradi_derabanan | 125 | 124 | 56 |
| **total** | | | **431** |

Por eixo:

- começa em hora diferente: **286**
- está no texto, não foi ouvida: **62**
- foi ouvida, não está no texto: **83**

## Cruzamento com OUVIR-PRIMEIRO.md

A auditoria de sinal de 20/08 listou 36 suspeitos, espalhados por
28 versos diferentes.

Dos 431 apontamentos do Whisper, **120** caem em versos que já
estavam naquela lista — cobrindo **27** dos 28 versos suspeitos.

Onde os dois métodos concordam, a chance de haver defeito real é bem maior:
comece a ouvir por aqui.

- ashkenaz_derabanan §11
- ashkenaz_derabanan §16
- ashkenaz_derabanan §20
- ashkenaz_derabanan §5
- ashkenaz_yatom §13
- ashkenaz_yatom §14
- ashkenaz_yatom §2
- ashkenaz_yatom §5
- chabad_derabanan §12
- chabad_derabanan §17
- chabad_derabanan §20
- chabad_derabanan §21
- chabad_yatom §8
- sefaradi_derabanan §12
- sefaradi_derabanan §18
- sefaradi_derabanan §19
- sefaradi_yatom §12
- sefaradi_yatom §8
- sefard_derabanan §1
- sefard_derabanan §16
- sefard_derabanan §17
- sefard_derabanan §2
- sefard_derabanan §22
- sefard_derabanan §24
- sefard_yatom §12
- sefard_yatom §14
- sefard_yatom §6

## Apontamentos, nussach por nussach

### ashkenaz_yatom

**§2** — **já está no OUVIR-PRIMEIRO**

- `ורה` — o Whisper ouviu em 6.139999866485596s, não existe no nosso texto
- `בְרָא` *(vera)* — no texto em 7.52s, o Whisper não ouviu
- `כִרְעוּתֵהּ` *(chirutei)* — nós: 8.24s · ouvido: 6.579999923706055s · diferença -1.66s

**§3**

- `וְיַמְלִיךְ` *(veyamlich)* — nós: 9.48s · ouvido: 8.34000015258789s · diferença -1.14s
- `מַלְכוּתֵהּ` *(malchutei)* — nós: 11.18s · ouvido: 9.199999809265137s · diferença -1.98s
- `בחיי` — o Whisper ouviu em 11.460000038146973s, não existe no nosso texto
- `חון` — o Whisper ouviu em 11.9399995803833s, não existe no nosso texto
- `וביום` — o Whisper ouviu em 12.319999694824219s, não existe no nosso texto

**§4**

- `בְּחַיֵּיכוֹן` *(bechayeichon)* — no texto em 12.86s, o Whisper não ouviu
- `החון` — o Whisper ouviu em 13.4399995803833s, não existe no nosso texto
- `וּבְיוֹמֵיכוֹן` *(uveyomeichon)* — no texto em 14.46s, o Whisper não ouviu
- `דה` — o Whisper ouviu em 15.260000228881836s, não existe no nosso texto

**§5** — **já está no OUVIR-PRIMEIRO**

- `וּבְחַיֵּי` *(uvechayei)* — nós: 15.36s · ouvido: 14.579999923706055s · diferença -0.78s
- `דְכָל` *(dechol)* — no texto em 15.91s, o Whisper não ouviu
- `חול` — o Whisper ouviu em 15.979999542236328s, não existe no nosso texto

**§7**

- `על` — o Whisper ouviu em 29.219999313354492s, não existe no nosso texto
- `עָלְמַיָּא` *(almaya)* — no texto em 29.42s, o Whisper não ouviu
- `מיה` — o Whisper ouviu em 29.65999984741211s, não existe no nosso texto

**§10**

- `וְיִתְעַלֶּה` *(veyitaleh)* — nós: 39.8s · ouvido: 38.7400016784668s · diferença -1.06s
- `וְיִתְהַלָּל` *(veyithalal)* — nós: 41.1s · ouvido: 40.34000015258789s · diferença -0.76s
- `בקבוצה` — o Whisper ouviu em 42.86000061035156s, não existe no nosso texto
- `דְּקֻדְשָׁא` *(dequdsha)* — no texto em 43s, o Whisper não ouviu
- `לאלה` — o Whisper ouviu em 45.18000030517578s, não existe no nosso texto

**§11**

- `לְעֵלָּא` *(leila)* — no texto em 45.82s, o Whisper não ouviu

**§12**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — nós: 50.54s · ouvido: 51.41999816894531s · diferença +0.88s
- `דה` — o Whisper ouviu em 55.29999923706055s, não existe no nosso texto

**§13** — **já está no OUVIR-PRIMEIRO**

- `יְהֵא` *(Yehei)* — nós: 61.5s · ouvido: 59.599998474121094s · diferença -1.9s
- `שְׁלָמָא` *(shlama)* — nós: 62.48s · ouvido: 60.720001220703125s · diferença -1.76s
- `רַבָּא` *(raba)* — nós: 63.06s · ouvido: 61.31999969482422s · diferença -1.74s
- `מִן` *(min)* — nós: 63.55s · ouvido: 62s · diferença -1.55s
- `שְׁמַיָּא` *(shamaya)* — nós: 64.28s · ouvido: 63.13999938964844s · diferença -1.14s
- `וְחַיִּים` *(vechayim)* — nós: 65.42s · ouvido: 64.33999633789062s · diferença -1.08s
- `עָלֵינוּ` *(aleinu)* — nós: 66.64s · ouvido: 65.26000213623047s · diferença -1.38s
- `וְעַל` *(val)* — nós: 67.52s · ouvido: 66.27999877929688s · diferença -1.24s
- `כָּל` *(kol)* — nós: 67.98s · ouvido: 67.23999786376953s · diferença -0.74s

**§14** — **já está no OUVIR-PRIMEIRO**

- `הוּא` *(hu)* — nós: 74.49s · ouvido: 75.62000274658203s · diferença +1.13s

### ashkenaz_derabanan

**§2**

- `ורה` — o Whisper ouviu em 6.760000228881836s, não existe no nosso texto
- `דִי` *(di)* — nós: 6.8s · ouvido: 5.940000057220459s · diferença -0.86s
- `בְרָא` *(vera)* — no texto em 7.07s, o Whisper não ouviu

**§3**

- `וְיַמְלִיךְ` *(veyamlich)* — nós: 10.62s · ouvido: 8.979999542236328s · diferença -1.64s
- `מַלְכוּתֵהּ` *(malchutei)* — nós: 12.16s · ouvido: 10.380000114440918s · diferença -1.78s

**§4**

- `בְּחַיֵּיכוֹן` *(bechayeichon)* — nós: 13.86s · ouvido: 12.239999771118164s · diferença -1.62s
- `וּבְיוֹמֵיכוֹן` *(uveyomeichon)* — nós: 15.5s · ouvido: 13.640000343322754s · diferença -1.86s

**§5** — **já está no OUVIR-PRIMEIRO**

- `וּבְחַיֵּי` *(uvechayei)* — nós: 16.6s · ouvido: 15.34000015258789s · diferença -1.26s

**§7**

- `יְהֵא` *(Yehei)* — nós: 25.42s · ouvido: 26.1200008392334s · diferença +0.7s
- `שְׁמֵהּ` *(shmei)* — nós: 26.18s · ouvido: 27.31999969482422s · diferença +1.14s
- `רַבָּא` *(raba)* — nós: 27.26s · ouvido: 27.899999618530273s · diferença +0.64s
- `מְבָרַךְ` *(mevarach)* — nós: 28.28s · ouvido: 28.940000534057617s · diferença +0.66s
- `על` — o Whisper ouviu em 33.040000915527344s, não existe no nosso texto
- `עָלְמַיָּא` *(almaya)* — no texto em 33.38s, o Whisper não ouviu
- `מיה` — o Whisper ouviu em 33.619998931884766s, não existe no nosso texto

**§10**

- `די` — o Whisper ouviu em 47.619998931884766s, não existe no nosso texto

**§11** — **já está no OUVIR-PRIMEIRO**

- `לְעֵלָּא` *(leila)* — no texto em 50.78s, o Whisper não ouviu
- `לאלה` — o Whisper ouviu em 50.84000015258789s, não existe no nosso texto

**§12**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — no texto em 56.38s, o Whisper não ouviu
- `תושבכתה` — o Whisper ouviu em 56.47999954223633s, não existe no nosso texto

**§13**

- `עַל` *(Al)* — nós: 64.96s · ouvido: 63.959999084472656s · diferença -1s
- `וְעַל` *(val)* — nós: 67.08s · ouvido: 66.37999725341797s · diferença -0.7s

**§14**

- `הון` — o Whisper ouviu em 70.5999984741211s, não existe no nosso texto
- `וְעַל` *(val)* — nós: 72.46s · ouvido: 70.9800033569336s · diferença -1.48s
- `כָּל` *(kol)* — nós: 73.16s · ouvido: 72.05999755859375s · diferença -1.1s
- `תַּלְמִידֵי` *(talmidei)* — nós: 74.32s · ouvido: 73.16000366210938s · diferença -1.16s
- `הון` — o Whisper ouviu em 75.26000213623047s, não existe no nosso texto
- `תַלְמִידֵיהוֹן` *(talmideihon)* — nós: 75.84s · ouvido: 74.16000366210938s · diferença -1.68s

**§15**

- `וְעַל` *(val)* — nós: 76.84s · ouvido: 75.36000061035156s · diferença -1.48s
- `כָּל` *(kol)* — nós: 77.38s · ouvido: 76.37999725341797s · diferença -1s
- `באור` — o Whisper ouviu em 79.0199966430664s, não existe no nosso texto
- `בְּאוֹרַיְתָא` *(boraita)* — no texto em 79.34s, o Whisper não ouviu
- `איתה` — o Whisper ouviu em 79.77999877929688s, não existe no nosso texto

**§16** — **já está no OUVIR-PRIMEIRO**

- `ועטרה` — o Whisper ouviu em 81.4000015258789s, não existe no nosso texto
- `עדן` — o Whisper ouviu em 82.5199966430664s, não existe no nosso texto
- `בְאַתְרָא` *(vatra)* — no texto em 82.94s, o Whisper não ouviu
- `הָדֵין` *(hadein)* — no texto em 83.92s, o Whisper não ouviu
- `וְדִי` *(vedi)* — nós: 84.92s · ouvido: 83.87999725341797s · diferença -1.04s
- `בְכָל` *(vechol)* — nós: 85.27s · ouvido: 84.4800033569336s · diferença -0.79s
- `עטר` — o Whisper ouviu em 85.72000122070312s, não existe no nosso texto
- `אֲתַר` *(atar)* — no texto em 85.78s, o Whisper não ouviu
- `ועטר` — o Whisper ouviu em 86.37999725341797s, não existe no nosso texto
- `וַאֲתַר` *(vaatar)* — no texto em 86.68s, o Whisper não ouviu

**§17**

- `יְהֵא` *(yehei)* — nós: 89.9s · ouvido: 87.62000274658203s · diferença -2.28s
- `לְהוֹן` *(lehon)* — nós: 90.25s · ouvido: 88.86000061035156s · diferença -1.39s
- `וּלְכוֹן` *(ulechon)* — nós: 91s · ouvido: 89.44000244140625s · diferença -1.56s
- `שְׁלָמָא` *(shlama)* — nós: 91.98s · ouvido: 90.55999755859375s · diferença -1.42s
- `חינה` — o Whisper ouviu em 92.5199966430664s, não existe no nosso texto
- `רַבָּא` *(raba)* — nós: 92.98s · ouvido: 91.72000122070312s · diferença -1.26s

**§18**

- `חִנָּא` *(china)* — no texto em 94.02s, o Whisper não ouviu
- `וְחִסְדָּא` *(vechisda)* — nós: 95.18s · ouvido: 93.5199966430664s · diferença -1.66s
- `וְרַחֲמִין` *(verachamin)* — nós: 96.68s · ouvido: 95.22000122070312s · diferença -1.46s

**§19**

- `וְחַיִּין` *(vechayin)* — nós: 98s · ouvido: 96.23999786376953s · diferença -1.76s
- `אֲרִיכִין` *(arichin)* — nós: 99.2s · ouvido: 97.94000244140625s · diferença -1.26s
- `וּמְזוֹנָא` *(umezona)* — nós: 102s · ouvido: 98.80000305175781s · diferença -3.2s
- `רְוִיחָא` *(revicha)* — nós: 103.44s · ouvido: 100.19999694824219s · diferença -3.24s

**§20** — **já está no OUVIR-PRIMEIRO**

- `וּפוּרְקָנָא` *(ufurkana)* — nós: 104.06s · ouvido: 101.5999984741211s · diferença -2.46s
- `מִן` *(min)* — nós: 105.24s · ouvido: 102.9800033569336s · diferença -2.26s
- `קֳדָם` *(kodam)* — nós: 105.49s · ouvido: 103.9000015258789s · diferença -1.59s
- `דווי` — o Whisper ouviu em 106s, não existe no nosso texto
- `אֲבוּהוֹן` *(avuhon)* — nós: 106.36s · ouvido: 104.68000030517578s · diferença -1.68s
- `שמיה` — o Whisper ouviu em 106.83999633789062s, não existe no nosso texto
- `דְּבִשְׁמַיָּא` *(divishmaya)* — no texto em 107.9s, o Whisper não ouviu
- `ועראה` — o Whisper ouviu em 108.04000091552734s, não existe no nosso texto
- `וְאַרְעָא` *(vara)* — no texto em 109.34s, o Whisper não ouviu
- `וְאִמְרוּ` *(veimru)* — nós: 110.5s · ouvido: 109.44000244140625s · diferença -1.06s
- `אָמֵן` *(amen)* — nós: 112.18s · ouvido: 110.33999633789062s · diferença -1.84s

**§21**

- `יְהֵא` *(Yehei)* — nós: 113.88s · ouvido: 111.66000366210938s · diferença -2.22s
- `שְׁלָמָא` *(shlama)* — nós: 114.82s · ouvido: 113.05999755859375s · diferença -1.76s
- `רַבָּא` *(raba)* — nós: 116.4s · ouvido: 113.68000030517578s · diferença -2.72s
- `מִן` *(min)* — nós: 117.05s · ouvido: 114.37999725341797s · diferença -2.67s
- `שְׁמַיָּא` *(shamaya)* — nós: 117.66s · ouvido: 115.26000213623047s · diferença -2.4s
- `וְחַיִּים` *(vechayim)* — nós: 118.72s · ouvido: 116.04000091552734s · diferença -2.68s
- `עָלֵינוּ` *(aleinu)* — nós: 119.88s · ouvido: 117.31999969482422s · diferença -2.56s
- `וְעַל` *(val)* — nós: 120.62s · ouvido: 118.44000244140625s · diferença -2.18s
- `כָּל` *(kol)* — nós: 120.98s · ouvido: 119.37999725341797s · diferença -1.6s
- `יִשְׂרָאֵל` *(yisrael)* — nós: 121.88s · ouvido: 120.72000122070312s · diferença -1.16s
- `וְאִמְרוּ` *(veimru)* — nós: 123.3s · ouvido: 121.62000274658203s · diferença -1.68s
- `אָמֵן` *(amen)* — nós: 124.5s · ouvido: 123.0199966430664s · diferença -1.48s

**§22**

- `עֹשֶׂה` *(Oseh)* — nós: 125.58s · ouvido: 124.26000213623047s · diferença -1.32s
- `שָׁלוֹם` *(shalom)* — nós: 126.66s · ouvido: 125.66000366210938s · diferença -1s
- `בִּמְרוֹמָיו` *(bimromav)* — nós: 128.78s · ouvido: 126.19999694824219s · diferença -2.58s

**§23**

- `הוּא` *(hu)* — nós: 129.92s · ouvido: 127.44000244140625s · diferença -2.48s
- `יַעֲשֶׂה` *(yaaseh)* — nós: 130.16s · ouvido: 128.5s · diferença -1.66s
- `בְרַחֲמָיו` *(verachamav)* — nós: 131.5s · ouvido: 129.60000610351562s · diferença -1.9s
- `שָׁלוֹם` *(shalom)* — nós: 132.48s · ouvido: 131.0399932861328s · diferença -1.44s
- `עָלֵינוּ` *(aleinu)* — nós: 133.6s · ouvido: 132.1999969482422s · diferença -1.4s
- `וְעַל` *(val)* — nós: 134.88s · ouvido: 133.1999969482422s · diferença -1.68s
- `כָּל` *(kol)* — nós: 135.52s · ouvido: 134.4600067138672s · diferença -1.06s

### chabad_yatom

**§2**

- `דִּי` *(di)* — no texto em 5.84s, o Whisper não ouviu
- `דברי` — o Whisper ouviu em 5.840000152587891s, não existe no nosso texto
- `בְרָא` *(vera)* — no texto em 6.22s, o Whisper não ouviu
- `כִרְעוּתֵהּ` *(chirutei)* — no texto em 6.68s, o Whisper não ouviu
- `חירותי` — o Whisper ouviu em 6.71999979019165s, não existe no nosso texto

**§6**

- `בֵּית` *(beit)* — nós: 19.42s · ouvido: 20.18000030517578s · diferença +0.76s

**§8** — **já está no OUVIR-PRIMEIRO**

- `שְׁמֵהּ` *(shmei)* — nós: 27.64s · ouvido: 28.540000915527344s · diferença +0.9s
- `מְבָרַךְ` *(mevarach)* — nós: 29.36s · ouvido: 30.079999923706055s · diferença +0.72s
- `לְעָלַם` *(lalam)* — nós: 30.24s · ouvido: 30.8799991607666s · diferença +0.64s
- `וּלְעָלְמֵי` *(ulalmei)* — nós: 31.38s · ouvido: 32.040000915527344s · diferença +0.66s
- `עָלְמַיָּא` *(almaya)* — nós: 32.46s · ouvido: 33.20000076293945s · diferença +0.74s

**§11**

- `דקוצה` — o Whisper ouviu em 44.84000015258789s, não existe no nosso texto
- `דְּקֻדְשָׁא` *(dequdsha)* — no texto em 45s, o Whisper não ouviu
- `לאלה` — o Whisper ouviu em 46.97999954223633s, não existe no nosso texto

**§12**

- `לְעֵלָּא` *(leila)* — no texto em 47.38s, o Whisper não ouviu
- `תושבכתה` — o Whisper ouviu em 52.34000015258789s, não existe no nosso texto

**§13**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — no texto em 53.76s, o Whisper não ouviu
- `וְנֶחָמָתָא` *(venechamata)* — nós: 55.7s · ouvido: 53.70000076293945s · diferença -2s
- `דַּאֲמִירָן` *(daamiran)* — nós: 56.58s · ouvido: 55.81999969482422s · diferença -0.76s
- `בְּעָלְמָא` *(balma)* — nós: 57.58s · ouvido: 56.58000183105469s · diferença -1s
- `וְאִמְרוּ` *(veimru)* — nós: 58.7s · ouvido: 57.70000076293945s · diferença -1s
- `אָמֵן` *(amen)* — nós: 59.74s · ouvido: 58.41999816894531s · diferença -1.32s

**§14**

- `של` — o Whisper ouviu em 60.2400016784668s, não existe no nosso texto
- `שְׁלָמָא` *(shlama)* — no texto em 60.58s, o Whisper não ouviu
- `עמה` — o Whisper ouviu em 60.939998626708984s, não existe no nosso texto
- `כָּל` *(kol)* — nós: 67.36s · ouvido: 68s · diferença +0.64s

**§15**

- `עֹשֶׂה` *(Oseh)* — nós: 73.14s · ouvido: 71.30000305175781s · diferença -1.84s

### chabad_derabanan

**§1**

- `שְׁמֵהּ` *(shemei)* — nós: 1.84s · ouvido: 2.4600000381469727s · diferença +0.62s

**§2**

- `בְּעָלְמָא` *(balma)* — nós: 3.17s · ouvido: 4.5s · diferença +1.33s
- `דִּי` *(di)* — no texto em 4.36s, o Whisper não ouviu
- `בְרָא` *(vera)* — no texto em 4.75s, o Whisper não ouviu
- `כִרְעוּתֵהּ` *(chirutei)* — no texto em 5.14s, o Whisper não ouviu
- `דברי` — o Whisper ouviu em 5.21999979019165s, não existe no nosso texto
- `חירותי` — o Whisper ouviu em 5.860000133514404s, não existe no nosso texto

**§3**

- `וְיַמְלִיךְ` *(veyamlich)* — nós: 5.97s · ouvido: 7.179999828338623s · diferença +1.21s
- `מַלְכוּתֵהּ` *(malchutei)* — nós: 7.04s · ouvido: 7.820000171661377s · diferença +0.78s

**§8**

- `לְעָלַם` *(lalam)* — nós: 27.16s · ouvido: 28.3799991607666s · diferença +1.22s
- `וּלְעָלְמֵי` *(ulalmei)* — nós: 28.3s · ouvido: 28.979999542236328s · diferença +0.68s
- `עָלְמַיָּא` *(almaya)* — nós: 29.24s · ouvido: 29.959999084472656s · diferença +0.72s

**§9**

- `יִתְבָּרֵךְ` *(Yitbarach)* — nós: 29.84s · ouvido: 31.360000610351562s · diferença +1.52s
- `וְיִשְׁתַּבַּח` *(veyishtabach)* — nós: 31.14s · ouvido: 31.920000076293945s · diferença +0.78s
- `וְיִתְפָּאַר` *(veyitpaar)* — nós: 32.1s · ouvido: 33.41999816894531s · diferença +1.32s

**§10**

- `וְיִתְרוֹמָם` *(veyitromam)* — nós: 33.34s · ouvido: 34.720001220703125s · diferença +1.38s
- `וְיִתְנַשֵּׂא` *(veyitnassa)* — nós: 34.58s · ouvido: 36.119998931884766s · diferença +1.54s
- `וְיִתְהַדָּר` *(veyithadar)* — nós: 35.74s · ouvido: 37.13999938964844s · diferença +1.4s

**§11**

- `וְיִתְעַלֶּה` *(veyitaleh)* — nós: 37s · ouvido: 38.400001525878906s · diferença +1.4s
- `וְיִתְהַלָּל` *(veyithalal)* — nós: 38.26s · ouvido: 39.939998626708984s · diferença +1.68s
- `שְׁמֵהּ` *(shmei)* — nós: 38.94s · ouvido: 41.15999984741211s · diferença +2.22s
- `דְּקֻדְשָׁא` *(dequdsha)* — nós: 39.8s · ouvido: 41.84000015258789s · diferença +2.04s
- `בְּרִיךְ` *(berich)* — nós: 41.04s · ouvido: 42.540000915527344s · diferença +1.5s
- `הוּא` *(hu)* — nós: 41.84s · ouvido: 43.599998474121094s · diferença +1.76s

**§12** — **já está no OUVIR-PRIMEIRO**

- `לְעֵלָּא` *(leila)* — nós: 42.68s · ouvido: 43.91999816894531s · diferença +1.24s
- `מִן` *(min)* — nós: 43.56s · ouvido: 45.15999984741211s · diferença +1.6s
- `וְשִׁירָתָא` *(veshirata)* — nós: 46.56s · ouvido: 47.720001220703125s · diferença +1.16s

**§13**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — nós: 47.62s · ouvido: 48.959999084472656s · diferença +1.34s
- `וְנֶחָמָתָא` *(venechamata)* — nós: 48.9s · ouvido: 50.15999984741211s · diferença +1.26s
- `דַּאֲמִירָן` *(daamiran)* — nós: 50.06s · ouvido: 51.79999923706055s · diferença +1.74s
- `בְּעָלְמָא` *(balma)* — nós: 51.68s · ouvido: 52.47999954223633s · diferença +0.8s
- `וְאִמְרוּ` *(veimru)* — nós: 52.56s · ouvido: 53.81999969482422s · diferença +1.26s
- `אָמֵן` *(amen)* — nós: 53.66s · ouvido: 54.58000183105469s · diferença +0.92s

**§14**

- `עַל` *(Al)* — nós: 54.13s · ouvido: 55.02000045776367s · diferença +0.89s
- `יִשְׂרָאֵל` *(yisrael)* — nós: 54.64s · ouvido: 56.02000045776367s · diferença +1.38s
- `וְעַל` *(val)* — nós: 55.68s · ouvido: 57.439998626708984s · diferença +1.76s
- `רַבָּנָן` *(rabanan)* — nós: 56.16s · ouvido: 57.959999084472656s · diferença +1.8s

**§15**

- `וְעַל` *(val)* — nós: 57.42s · ouvido: 59.459999084472656s · diferença +2.04s
- `תַּלְמִידֵיהוֹן` *(talmideihon)* — nós: 58.1s · ouvido: 59.86000061035156s · diferença +1.76s
- `וְעַל` *(val)* — nós: 59.2s · ouvido: 61.63999938964844s · diferença +2.44s
- `כָּל` *(kol)* — nós: 59.47s · ouvido: 62.13999938964844s · diferença +2.67s
- `תַּלְמִידֵי` *(talmidei)* — nós: 60.16s · ouvido: 62.880001068115234s · diferença +2.72s
- `הון` — o Whisper ouviu em 60.97999954223633s, não existe no nosso texto
- `תַלְמִידֵיהוֹן` *(talmideihon)* — nós: 61.5s · ouvido: 64.04000091552734s · diferença +2.54s

**§16**

- `וְעַל` *(val)* — nós: 62.52s · ouvido: 66.0199966430664s · diferença +3.5s
- `כָּל` *(kol)* — nós: 63.14s · ouvido: 66.05999755859375s · diferença +2.92s
- `מָאן` *(man)* — nós: 63.63s · ouvido: 67.27999877929688s · diferença +3.65s
- `דְּעָסְקִין` *(dasekin)* — nós: 64.24s · ouvido: 67.86000061035156s · diferença +3.62s
- `הון` — o Whisper ouviu em 65s, não existe no nosso texto
- `בְּאוֹרַיְתָא` *(boraita)* — no texto em 65.38s, o Whisper não ouviu

**§17** — **já está no OUVIR-PRIMEIRO**

- `דִּי` *(di)* — nós: 66.58s · ouvido: 71.08000183105469s · diferença +4.5s
- `בְאַתְרָא` *(vatra)* — nós: 68.1s · ouvido: 71.16000366210938s · diferença +3.06s
- `באור` — o Whisper ouviu em 69.12000274658203s, não existe no nosso texto
- `איתה` — o Whisper ouviu em 69.94000244140625s, não existe no nosso texto
- `הָדֵין` *(hadein)* — nós: 70.72s · ouvido: 72.72000122070312s · diferença +2s
- `וְדִי` *(vedi)* — nós: 71.46s · ouvido: 73.91999816894531s · diferença +2.46s
- `בְכָל` *(vechol)* — nós: 72.24s · ouvido: 74.37999725341797s · diferença +2.14s
- `אֲתַר` *(atar)* — nós: 73.8s · ouvido: 75.62000274658203s · diferença +1.82s
- `וַאֲתַר` *(vaatar)* — nós: 74.7s · ouvido: 76.26000213623047s · diferença +1.56s

**§18**

- `יְהֵא` *(yehei)* — nós: 75.88s · ouvido: 77.0199966430664s · diferença +1.14s
- `לְהוֹן` *(lehon)* — nós: 76.64s · ouvido: 78.45999908447266s · diferença +1.82s
- `וּלְכוֹן` *(ulechon)* — nós: 77.06s · ouvido: 79.36000061035156s · diferença +2.3s
- `שְׁלָמָא` *(shlama)* — nós: 77.9s · ouvido: 80.9000015258789s · diferença +3s
- `רַבָּא` *(raba)* — nós: 78.7s · ouvido: 81.5199966430664s · diferença +2.82s

**§19**

- `חִנָּא` *(china)* — no texto em 79.72s, o Whisper não ouviu
- `וְחִסְדָּא` *(vechisda)* — nós: 80.8s · ouvido: 82.94000244140625s · diferença +2.14s
- `וְרַחֲמִין` *(verachamin)* — nós: 81.68s · ouvido: 84.63999938964844s · diferença +2.96s

**§20** — **já está no OUVIR-PRIMEIRO**

- `וְחַיִּין` *(vechayin)* — nós: 82.44s · ouvido: 86.27999877929688s · diferença +3.84s
- `חינה` — o Whisper ouviu em 82.68000030517578s, não existe no nosso texto
- `אֲרִיכִין` *(arichin)* — nós: 83.34s · ouvido: 86.9000015258789s · diferença +3.56s
- `וּמְזוֹנָא` *(umezona)* — nós: 86.08s · ouvido: 88.4800033569336s · diferença +2.4s
- `רְוִיחָא` *(revicha)* — nós: 87.3s · ouvido: 89.19999694824219s · diferença +1.9s

**§21** — **já está no OUVIR-PRIMEIRO**

- `וּפוּרְקָנָא` *(ufurkana)* — nós: 88.42s · ouvido: 90.54000091552734s · diferença +2.12s
- `מִן` *(min)* — nós: 90.72s · ouvido: 92.4000015258789s · diferença +1.68s
- `אֲבוּהוֹן` *(avuhon)* — nós: 92.82s · ouvido: 93.5199966430664s · diferença +0.7s
- `די` — o Whisper ouviu em 94.91999816894531s, não existe no nosso texto
- `דְּבִשְׁמַיָּא` *(divishmaya)* — no texto em 94.94s, o Whisper não ouviu
- `ושמיה` — o Whisper ouviu em 95.45999908447266s, não existe no nosso texto

**§22**

- `יְהֵא` *(Yehei)* — nós: 98.96s · ouvido: 98.04000091552734s · diferença -0.92s

### sefard_yatom

**§2**

- `דברי` — o Whisper ouviu em 6.400000095367432s, não existe no nosso texto
- `דִּי` *(di)* — no texto em 6.52s, o Whisper não ouviu
- `בְרָא` *(vera)* — no texto em 6.92s, o Whisper não ouviu
- `כִרְעוּתֵהּ` *(chirutei)* — no texto em 7.2s, o Whisper não ouviu
- `חירותי` — o Whisper ouviu em 7.300000190734863s, não existe no nosso texto

**§3**

- `וְיַמְלִיךְ` *(veyamlich)* — nós: 9.84s · ouvido: 8.920000076293945s · diferença -0.92s
- `מַלְכוּתֵהּ` *(malchutei)* — nós: 11.34s · ouvido: 9.65999984741211s · diferença -1.68s

**§4**

- `וְיַצְמַח` *(veyatsmach)* — nós: 12.58s · ouvido: 11.479999542236328s · diferença -1.1s
- `פֻּרְקָנֵהּ` *(purkanei)* — nós: 14.02s · ouvido: 12.279999732971191s · diferença -1.74s
- `וִיקָרֵב` *(vikarev)* — nós: 15.14s · ouvido: 14.180000305175781s · diferença -0.96s
- `מְשִׁיחֵהּ` *(meshichei)* — nós: 16.94s · ouvido: 14.84000015258789s · diferença -2.1s
- `בחיי` — o Whisper ouviu em 17.239999771118164s, não existe no nosso texto
- `חון` — o Whisper ouviu em 17.739999771118164s, não existe no nosso texto
- `וביום` — o Whisper ouviu em 18.079999923706055s, não existe no nosso texto

**§5**

- `בְּחַיֵּיכוֹן` *(bechayeichon)* — no texto em 18.64s, o Whisper não ouviu
- `חון` — o Whisper ouviu em 19.139999389648438s, não existe no nosso texto
- `וּבְיוֹמֵיכוֹן` *(uveyomeichon)* — no texto em 20.26s, o Whisper não ouviu

**§6** — **já está no OUVIR-PRIMEIRO**

- `וּבְחַיֵּי` *(uvechayei)* — nós: 21.24s · ouvido: 20.399999618530273s · diferença -0.84s
- `דְכָל` *(dechol)* — nós: 21.77s · ouvido: 21.059999465942383s · diferença -0.71s

**§8**

- `יְהֵא` *(Yehei)* — nós: 30.36s · ouvido: 29.260000228881836s · diferença -1.1s
- `עָלְמַיָּא` *(almaya)* — no texto em 35.31s, o Whisper não ouviu
- `על` — o Whisper ouviu em 35.560001373291016s, não existe no nosso texto
- `מיה` — o Whisper ouviu em 35.86000061035156s, não existe no nosso texto

**§11**

- `דְּקֻדְשָׁא` *(dequdsha)* — no texto em 49.02s, o Whisper não ouviu
- `דקוצ` — o Whisper ouviu em 49.060001373291016s, não existe no nosso texto
- `ה` — o Whisper ouviu em 49.5s, não existe no nosso texto

**§12** — **já está no OUVIR-PRIMEIRO**

- `לְעֵלָּא` *(leila)* — no texto em 52.38s, o Whisper não ouviu
- `לאלה` — o Whisper ouviu em 52.91999816894531s, não existe no nosso texto
- `מִן` *(min)* — nós: 52.98s · ouvido: 53.619998931884766s · diferença +0.64s
- `וְשִׁירָתָא` *(veshirata)* — nós: 54.9s · ouvido: 55.97999954223633s · diferença +1.08s

**§13**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — no texto em 56.02s, o Whisper não ouviu
- `וְנֶחֱמָתָא` *(venechamata)* — no texto em 57.68s, o Whisper não ouviu
- `תושב` — o Whisper ouviu em 57.70000076293945s, não existe no nosso texto
- `חתה` — o Whisper ouviu em 58.220001220703125s, não existe no nosso texto
- `דַּאֲמִירָן` *(daamiran)* — nós: 59.32s · ouvido: 61.20000076293945s · diferença +1.88s
- `בני` — o Whisper ouviu em 59.459999084472656s, não existe no nosso texto
- `חמתה` — o Whisper ouviu em 59.7400016784668s, não existe no nosso texto
- `בְּעָלְמָא` *(balma)* — nós: 61s · ouvido: 61.86000061035156s · diferença +0.86s
- `וְאִמְרוּ` *(veimru)* — nós: 61.92s · ouvido: 63.2400016784668s · diferença +1.32s
- `אָמֵן` *(amen)* — nós: 63.1s · ouvido: 63.97999954223633s · diferença +0.88s

**§14** — **já está no OUVIR-PRIMEIRO**

- `יְהֵא` *(Yehei)* — nós: 63.51s · ouvido: 64.5999984741211s · diferença +1.09s
- `שְׁלָמָא` *(shlama)* — nós: 64.2s · ouvido: 66.45999908447266s · diferença +2.26s
- `רַבָּא` *(raba)* — nós: 65.64s · ouvido: 67.22000122070312s · diferença +1.58s
- `מִן` *(min)* — nós: 66.52s · ouvido: 67.95999908447266s · diferença +1.44s
- `שְׁמַיָּא` *(shamaya)* — nós: 66.79s · ouvido: 69.04000091552734s · diferença +2.25s
- `וְחַיִּים` *(vechayim)* — nós: 68.46s · ouvido: 70.4000015258789s · diferença +1.94s
- `טוֹבִים` *(tovim)* — nós: 69.22s · ouvido: 71.05999755859375s · diferença +1.84s

**§16**

- `הוּא` *(hu)* — nós: 83s · ouvido: 82.30000305175781s · diferença -0.7s
- `וְעַל` *(val)* — nós: 88.14s · ouvido: 87.4800033569336s · diferença -0.66s

### sefard_derabanan

**§1** — **já está no OUVIR-PRIMEIRO**

- `שְׁמֵהּ` *(shemei)* — nós: 1.82s · ouvido: 2.440000057220459s · diferença +0.62s

**§2** — **já está no OUVIR-PRIMEIRO**

- `בְּעָלְמָא` *(balma)* — nós: 3.46s · ouvido: 4.340000152587891s · diferença +0.88s
- `דִּי` *(di)* — nós: 4.56s · ouvido: 5.480000019073486s · diferença +0.92s
- `בְרָא` *(vera)* — no texto em 5s, o Whisper não ouviu
- `ורה` — o Whisper ouviu em 5.900000095367432s, não existe no nosso texto
- `כִרְעוּתֵהּ` *(chirutei)* — nós: 8.02s · ouvido: 6.480000019073486s · diferença -1.54s

**§3**

- `וְיַמְלִיךְ` *(veyamlich)* — nós: 9.18s · ouvido: 8.15999984741211s · diferença -1.02s
- `מַלְכוּתֵהּ` *(malchutei)* — nós: 10.6s · ouvido: 8.9399995803833s · diferença -1.66s

**§4**

- `וְיַצְמַח` *(veyatsmach)* — nós: 11.96s · ouvido: 10.720000267028809s · diferença -1.24s
- `פֻּרְקָנֵהּ` *(purkanei)* — nós: 13.06s · ouvido: 11.539999961853027s · diferença -1.52s
- `וִיקָרֵב` *(vikarev)* — nós: 14.08s · ouvido: 13.239999771118164s · diferença -0.84s
- `מְשִׁיחֵהּ` *(meshichei)* — nós: 15.56s · ouvido: 13.800000190734863s · diferença -1.76s

**§5**

- `בְּחַיֵּיכוֹן` *(bechayeichon)* — nós: 17.08s · ouvido: 15.779999732971191s · diferença -1.3s
- `וּבְיוֹמֵיכוֹן` *(uveyomeichon)* — nós: 18.5s · ouvido: 16.65999984741211s · diferença -1.84s

**§6**

- `וּבְחַיֵּי` *(uvechayei)* — nós: 19.44s · ouvido: 18.6200008392334s · diferença -0.82s

**§15**

- `הון` — o Whisper ouviu em 65.36000061035156s, não existe no nosso texto

**§16** — **já está no OUVIR-PRIMEIRO**

- `וְעַל` *(val)* — nós: 69.39s · ouvido: 70.76000213623047s · diferença +1.37s
- `הון` — o Whisper ouviu em 69.55999755859375s, não existe no nosso texto
- `כָּל` *(kol)* — nós: 70.26s · ouvido: 70.87999725341797s · diferença +0.62s
- `מָאן` *(man)* — nós: 70.69s · ouvido: 71.76000213623047s · diferença +1.07s

**§17** — **já está no OUVIR-PRIMEIRO**

- `בְאַתְרָא` *(vatra)* — nós: 76.72s · ouvido: 75.37999725341797s · diferença -1.34s
- `הָדֵין` *(hadein)* — nós: 77.88s · ouvido: 76.58000183105469s · diferença -1.3s

**§18**

- `יְהֵא` *(yehei)* — nós: 82.4s · ouvido: 81.62000274658203s · diferença -0.78s
- `שְׁלָמָא` *(shlama)* — nós: 83.94s · ouvido: 85.30000305175781s · diferença +1.36s
- `רַבָּא` *(raba)* — nós: 85.1s · ouvido: 85.87999725341797s · diferença +0.78s

**§19**

- `חִנָּא` *(china)* — no texto em 86.08s, o Whisper não ouviu
- `חינה` — o Whisper ouviu em 87.30000305175781s, não existe no nosso texto
- `וְרַחֲמִין` *(verachamin)* — nós: 88.02s · ouvido: 89.30000305175781s · diferença +1.28s

**§21**

- `דִּי` *(di)* — nós: 99.9s · ouvido: 100.62000274658203s · diferença +0.72s
- `וְאַרְעָא` *(vara)* — no texto em 102s, o Whisper não ouviu
- `וערה` — o Whisper ouviu em 102.19999694824219s, não existe no nosso texto
- `וְאִמְרוּ` *(veimru)* — nós: 102.57s · ouvido: 103.83999633789062s · diferença +1.27s
- `אָמֵן` *(amen)* — nós: 103.72s · ouvido: 104.68000030517578s · diferença +0.96s

**§22** — **já está no OUVIR-PRIMEIRO**

- `שְׁלָמָא` *(shlama)* — nós: 105.9s · ouvido: 106.55999755859375s · diferença +0.66s
- `רַבָּא` *(raba)* — nós: 106.66s · ouvido: 107.30000305175781s · diferença +0.64s
- `מִן` *(min)* — nós: 107.62s · ouvido: 108.5999984741211s · diferença +0.98s

**§24** — **já está no OUVIR-PRIMEIRO**

- `אָמֵן` *(amen)* — nós: 130.44s · ouvido: 129.82000732421875s · diferença -0.62s

### sefaradi_yatom

**§1**

- `וְיִתְקַדַּשׁ` *(veyitkadash)* — nós: 1.94s · ouvido: 1.159999966621399s · diferença -0.78s

**§2**

- `דברי` — o Whisper ouviu em 6.119999885559082s, não existe no nosso texto
- `דִּי` *(di)* — no texto em 7.06s, o Whisper não ouviu
- `בְרָא` *(vera)* — no texto em 7.82s, o Whisper não ouviu
- `כִרְעוּתֵהּ` *(chirutei)* — nós: 8.76s · ouvido: 7.039999961853027s · diferença -1.72s

**§3**

- `וְיַמְלִיךְ` *(veyamlich)* — nós: 9.68s · ouvido: 8.140000343322754s · diferença -1.54s
- `מַלְכוּתֵהּ` *(malchutei)* — nós: 11.2s · ouvido: 9.539999961853027s · diferença -1.66s

**§4**

- `וְיַצְמַח` *(veyatsmach)* — nós: 12.56s · ouvido: 10.760000228881836s · diferença -1.8s
- `פֻּרְקָנֵהּ` *(purkanei)* — nós: 13.78s · ouvido: 12.15999984741211s · diferença -1.62s
- `וִיקָרֵב` *(vikarev)* — nós: 14.9s · ouvido: 13.279999732971191s · diferença -1.62s
- `בחיי` — o Whisper ouviu em 15.819999694824219s, não existe no nosso texto
- `מְשִׁיחֵהּ` *(meshichei)* — nós: 16.52s · ouvido: 14.619999885559082s · diferença -1.9s
- `חון` — o Whisper ouviu em 17.219999313354492s, não existe no nosso texto
- `וביום` — o Whisper ouviu em 17.579999923706055s, não existe no nosso texto

**§5**

- `בְּחַיֵּיכוֹן` *(bechayeichon)* — no texto em 18s, o Whisper não ouviu
- `חון` — o Whisper ouviu em 18.559999465942383s, não existe no nosso texto
- `וּבְיוֹמֵיכוֹן` *(uveyomeichon)* — no texto em 19.54s, o Whisper não ouviu

**§6**

- `וּבְחַיֵּי` *(uvechayei)* — nós: 20.68s · ouvido: 19.18000030517578s · diferença -1.5s
- `דְכָל` *(dechol)* — nós: 21.56s · ouvido: 20.360000610351562s · diferença -1.2s
- `בֵּית` *(beit)* — nós: 22.26s · ouvido: 21.600000381469727s · diferença -0.66s

**§8** — **já está no OUVIR-PRIMEIRO**

- `יְהֵא` *(Yehei)* — nós: 28.62s · ouvido: 30s · diferença +1.38s
- `שְׁמֵהּ` *(shmei)* — nós: 30.32s · ouvido: 31.18000030517578s · diferença +0.86s
- `מְבָרַךְ` *(mevarach)* — nós: 32.16s · ouvido: 32.79999923706055s · diferença +0.64s
- `לְעָלַם` *(lalam)* — nós: 33.08s · ouvido: 34.31999969482422s · diferença +1.24s
- `וּלְעָלְמֵי` *(ulalmei)* — nós: 34.46s · ouvido: 35.15999984741211s · diferença +0.7s
- `עָלְמַיָּא` *(almaya)* — nós: 35.46s · ouvido: 36.279998779296875s · diferença +0.82s

**§9**

- `יִתְבָּרַךְ` *(Yitbarach)* — nós: 36.6s · ouvido: 37.41999816894531s · diferença +0.82s
- `וְיִשְׁתַּבַּח` *(veyishtabach)* — nós: 37.66s · ouvido: 38.84000015258789s · diferença +1.18s
- `וְיִתְפָּאַר` *(veyitpaar)* — nós: 39.26s · ouvido: 40.2400016784668s · diferença +0.98s

**§10**

- `וְיִתְרוֹמַם` *(veyitromam)* — nós: 40.62s · ouvido: 41.880001068115234s · diferença +1.26s
- `וְיִתְנַשֵּׂא` *(veyitnassa)* — nós: 41.1s · ouvido: 43.279998779296875s · diferença +2.18s
- `וְיִתְהַדָּר` *(veyithadar)* — nós: 42.08s · ouvido: 44.880001068115234s · diferença +2.8s

**§11**

- `וְיִתְעַלֶּה` *(veyitaleh)* — nós: 43.5s · ouvido: 46.279998779296875s · diferença +2.78s
- `וְיִתְהַלָּל` *(veyithalal)* — nós: 44.86s · ouvido: 47.68000030517578s · diferença +2.82s
- `שְׁמֵהּ` *(shmei)* — nós: 46.44s · ouvido: 48.959999084472656s · diferença +2.52s
- `דְּקֻדְשָׁא` *(dequdsha)* — no texto em 47.84s, o Whisper não ouviu
- `בְּרִיךְ` *(berich)* — nós: 49.38s · ouvido: 51.08000183105469s · diferença +1.7s
- `דקוצה` — o Whisper ouviu em 49.97999954223633s, não existe no nosso texto
- `הוּא` *(hu)* — nós: 50.28s · ouvido: 51.86000061035156s · diferença +1.58s

**§12** — **já está no OUVIR-PRIMEIRO**

- `לְעֵלָּא` *(leila)* — nós: 50.68s · ouvido: 52.79999923706055s · diferença +2.12s
- `מִן` *(min)* — nós: 51.5s · ouvido: 54.20000076293945s · diferença +2.7s
- `כָּל` *(kol)* — nós: 51.88s · ouvido: 54.540000915527344s · diferença +2.66s
- `בִּרְכָתָא` *(birchata)* — nós: 54.12s · ouvido: 54.939998626708984s · diferença +0.82s

**§13**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — nós: 59.16s · ouvido: 57.779998779296875s · diferença -1.38s
- `וְנֶחָמָתָא` *(venechamata)* — nós: 61.12s · ouvido: 58.779998779296875s · diferença -2.34s
- `דַּאֲמִירָן` *(daamiran)* — nós: 61.91s · ouvido: 61.040000915527344s · diferença -0.87s
- `בְּעָלְמָא` *(balma)* — nós: 63.14s · ouvido: 62.060001373291016s · diferença -1.08s
- `וְאִמְרוּ` *(veimru)* — nós: 63.92s · ouvido: 62.7400016784668s · diferença -1.18s
- `אָמֵן` *(amen)* — nós: 65.24s · ouvido: 63.91999816894531s · diferença -1.32s

**§14**

- `יְהֵא` *(Yehei)* — nós: 65.56s · ouvido: 64.54000091552734s · diferença -1.02s

**§15**

- `וסבא` — o Whisper ouviu em 69.66000366210938s, não existe no nosso texto
- `וְשָׂבָע` *(vesava)* — no texto em 69.82s, o Whisper não ouviu

**§16**

- `וּרְפוּאָה` *(urefua)* — nós: 76.26s · ouvido: 74.81999969482422s · diferença -1.44s
- `וּגְאֻלָּה` *(ugula)* — nós: 77.5s · ouvido: 76.22000122070312s · diferença -1.28s
- `וּסְלִיחָה` *(uselicha)* — nós: 78.74s · ouvido: 77.33999633789062s · diferença -1.4s
- `וְכַפָּרָה` *(vechapara)* — nós: 79.26s · ouvido: 78.5999984741211s · diferença -0.66s

**§19**

- `ורחמב` — o Whisper ouviu em 92.36000061035156s, não existe no nosso texto
- `בְּרַחֲמָיו` *(berachamav)* — no texto em 92.8s, o Whisper não ouviu

### sefaradi_derabanan

**§1**

- `וְיִתְקַדַּשׁ` *(veyitkadash)* — nós: 1.8s · ouvido: 1.1399999856948853s · diferença -0.66s
- `רַבָּא` *(raba)* — nós: 4.58s · ouvido: 3.2799999713897705s · diferença -1.3s

**§2**

- `בְּעָלְמָא` *(balma)* — nós: 5.62s · ouvido: 4.980000019073486s · diferença -0.64s
- `דברה` — o Whisper ouviu em 5.639999866485596s, não existe no nosso texto
- `דִּי` *(di)* — no texto em 6.42s, o Whisper não ouviu
- `בְרָא` *(vera)* — no texto em 6.96s, o Whisper não ouviu
- `כִרְעוּתֵהּ` *(chirutei)* — nós: 7.74s · ouvido: 6.380000114440918s · diferença -1.36s

**§3**

- `וְיַמְלִיךְ` *(veyamlich)* — nós: 9.44s · ouvido: 7.760000228881836s · diferença -1.68s
- `מַלְכוּתֵהּ` *(malchutei)* — nós: 10.18s · ouvido: 8.539999961853027s · diferença -1.64s

**§4**

- `וְיַצְמַח` *(veyatsmach)* — nós: 11.44s · ouvido: 10.279999732971191s · diferença -1.16s
- `פֻּרְקָנֵהּ` *(purkanei)* — nós: 12.72s · ouvido: 11.079999923706055s · diferença -1.64s
- `וִיקָרֵב` *(vikarev)* — nós: 13.52s · ouvido: 12.640000343322754s · diferença -0.88s
- `מְשִׁיחֵהּ` *(meshichei)* — nós: 14.84s · ouvido: 13.300000190734863s · diferença -1.54s

**§5**

- `בְּחַיֵּיכוֹן` *(bechayeichon)* — nós: 16.24s · ouvido: 14.979999542236328s · diferença -1.26s
- `וּבְיוֹמֵיכוֹן` *(uveyomeichon)* — nós: 17.78s · ouvido: 15.880000114440918s · diferença -1.9s

**§6**

- `וּבְחַיֵּי` *(uvechayei)* — nós: 18.94s · ouvido: 17.860000610351562s · diferença -1.08s

**§8**

- `לְעָלַם` *(lalam)* — nós: 30.35s · ouvido: 31.81999969482422s · diferença +1.47s
- `וּלְעָלְמֵי` *(ulalmei)* — nós: 31.7s · ouvido: 32.560001373291016s · diferença +0.86s
- `עָלְמַיָּא` *(almaya)* — no texto em 32.78s, o Whisper não ouviu

**§9**

- `יִתְבָּרַךְ` *(Yitbarach)* — nós: 33.94s · ouvido: 34.619998931884766s · diferença +0.68s
- `וְיִשְׁתַּבַּח` *(veyishtabach)* — nós: 35.02s · ouvido: 36.7400016784668s · diferença +1.72s
- `וְיִתְפָּאַר` *(veyitpaar)* — nós: 36.62s · ouvido: 38.13999938964844s · diferença +1.52s

**§10**

- `וְיִתְרוֹמַם` *(veyitromam)* — nós: 38.08s · ouvido: 39.7400016784668s · diferença +1.66s
- `וְיִתְנַשֵּׂא` *(veyitnassa)* — nós: 38.56s · ouvido: 41.15999984741211s · diferença +2.6s
- `וְיִתְהַדָּר` *(veyithadar)* — nós: 39.58s · ouvido: 42.560001373291016s · diferença +2.98s

**§11**

- `וְיִתְעַלֶּה` *(veyitaleh)* — nós: 41s · ouvido: 44.20000076293945s · diferença +3.2s
- `וְיִתְהַלָּל` *(veyithalal)* — nós: 42.44s · ouvido: 45.619998931884766s · diferença +3.18s
- `שְׁמֵהּ` *(shmei)* — nós: 43.98s · ouvido: 46.34000015258789s · diferença +2.36s
- `דְּקֻדְשָׁא` *(dequdsha)* — no texto em 45.26s, o Whisper não ouviu
- `בְּרִיךְ` *(berich)* — nós: 46.68s · ouvido: 48.5s · diferença +1.82s
- `הוּא` *(hu)* — nós: 47.66s · ouvido: 49.29999923706055s · diferença +1.64s
- `בקבוצה` — o Whisper ouviu em 47.7599983215332s, não existe no nosso texto

**§12** — **já está no OUVIR-PRIMEIRO**

- `לְעֵלָּא` *(leila)* — nós: 48.62s · ouvido: 50.02000045776367s · diferença +1.4s
- `מִן` *(min)* — no texto em 49.62s, o Whisper não ouviu
- `ממכל` — o Whisper ouviu em 51.439998626708984s, não existe no nosso texto
- `כָּל` *(kol)* — no texto em 51.84s, o Whisper não ouviu

**§15**

- `הון` — o Whisper ouviu em 69.13999938964844s, não existe no nosso texto
- `הון` — o Whisper ouviu em 73.19999694824219s, não existe no nosso texto

**§16**

- `קַדִּשְׁתָּא` *(kadishta)* — nós: 77.88s · ouvido: 76.63999938964844s · diferença -1.24s

**§17**

- `בְאַתְרָא` *(vatra)* — nós: 79.4s · ouvido: 78.30000305175781s · diferença -1.1s
- `הָדֵין` *(hadein)* — nós: 80.68s · ouvido: 79.26000213623047s · diferença -1.42s
- `וְדִי` *(vedi)* — nós: 81.38s · ouvido: 80.76000213623047s · diferença -0.62s

**§18** — **já está no OUVIR-PRIMEIRO**

- `וּלְהוֹן` *(ulehon)* — nós: 85.06s · ouvido: 85.87999725341797s · diferença +0.82s
- `וּלְכוֹן` *(ulechon)* — nós: 86.2s · ouvido: 86.95999908447266s · diferença +0.76s
- `חִנָּא` *(china)* — no texto em 88.62s, o Whisper não ouviu
- `חינה` — o Whisper ouviu em 88.95999908447266s, não existe no nosso texto

**§19** — **já está no OUVIR-PRIMEIRO**

- `שְׁמַיָּא` *(shmaya)* — nós: 95.82s · ouvido: 94.63999938964844s · diferença -1.18s
- `ועראה` — o Whisper ouviu em 95.91999816894531s, não existe no nosso texto
- `וְאַרְעָא` *(vara)* — no texto em 97.16s, o Whisper não ouviu
- `וְאִמְרוּ` *(veimru)* — nós: 98.34s · ouvido: 97.36000061035156s · diferença -0.98s
- `אָמֵן` *(amen)* — nós: 99.8s · ouvido: 98.0199966430664s · diferença -1.78s

**§21**

- `וסבא` — o Whisper ouviu em 105.0199966430664s, não existe no nosso texto
- `וְשָׂבָע` *(vesava)* — no texto em 105.22s, o Whisper não ouviu

**§24**

- `עוֹשֶׂה` *(Oseh)* — nós: 124.64s · ouvido: 123.41999816894531s · diferença -1.22s

**§25**

- `ורחמב` — o Whisper ouviu em 128.24000549316406s, não existe no nosso texto
- `בְּרַחֲמָיו` *(berachamav)* — no texto em 128.48s, o Whisper não ouviu

## O que fazer com isto

1. Comece pelos versos do cruzamento acima — são os que os dois métodos marcaram.
2. Ouça o verso no conferidor.html. Se a palavra acender fora da voz, anote o segundo.
3. O reparo vira âncora em `ancoras.json`, e só então roda o alinhador.
4. Este relatório nunca altera nada. Quem altera é uma pessoa.

