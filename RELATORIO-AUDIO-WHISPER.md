# Relatório da revisão auditiva (Whisper)

Gerado em 2026-08-24 02:22 UTC por `whisper-1`, sobre o commit `2b7125c`.

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
| ashkenaz_yatom | 75 | 80 | 34 |
| ashkenaz_derabanan | 118 | 124 | 35 |
| chabad_yatom | 80 | 80 | 16 |
| chabad_derabanan | 121 | 115 | 46 |
| sefard_yatom | 81 | 86 | 42 |
| sefard_derabanan | 124 | 126 | 82 |
| sefaradi_yatom | 91 | 92 | 54 |
| sefaradi_derabanan | 125 | 124 | 52 |
| **total** | | | **361** |

Por eixo:

- começa em hora diferente: **209**
- está no texto, não foi ouvida: **70**
- foi ouvida, não está no texto: **82**

## Cruzamento com OUVIR-PRIMEIRO.md

A auditoria de sinal de 20/08 listou 36 suspeitos, espalhados por
28 versos diferentes.

Dos 361 apontamentos do Whisper, **102** caem em versos que já
estavam naquela lista — cobrindo **22** dos 28 versos suspeitos.

Onde os dois métodos concordam, a chance de haver defeito real é bem maior:
comece a ouvir por aqui.

- ashkenaz_derabanan §11
- ashkenaz_derabanan §16
- ashkenaz_derabanan §20
- ashkenaz_yatom §14
- ashkenaz_yatom §2
- ashkenaz_yatom §5
- chabad_derabanan §17
- chabad_derabanan §21
- chabad_yatom §8
- sefaradi_derabanan §12
- sefaradi_derabanan §18
- sefaradi_derabanan §19
- sefaradi_yatom §12
- sefaradi_yatom §8
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

- `בְרָא` *(verá)* — no texto em 6.06s, o Whisper não ouviu
- `ורה` — o Whisper ouviu em 6.139999866485596s, não existe no nosso texto

**§4**

- `בְּחַיֵּיכוֹן` *(bechayechon)* — no texto em 9.88s, o Whisper não ouviu
- `וּבְיוֹמֵיכוֹן` *(uveyomechon)* — no texto em 11.2s, o Whisper não ouviu
- `בחיי` — o Whisper ouviu em 11.460000038146973s, não existe no nosso texto
- `חון` — o Whisper ouviu em 11.9399995803833s, não existe no nosso texto
- `וביום` — o Whisper ouviu em 12.319999694824219s, não existe no nosso texto

**§5** — **já está no OUVIR-PRIMEIRO**

- `וּבְחַיֵּי` *(uvechayê)* — nós: 12.88s · ouvido: 14.579999923706055s · diferença +1.7s
- `החון` — o Whisper ouviu em 13.4399995803833s, não existe no nosso texto
- `דְכָל` *(dechol)* — no texto em 13.64s, o Whisper não ouviu
- `בֵּית` *(beit)* — nós: 14.48s · ouvido: 16.139999389648438s · diferença +1.66s
- `יִשְׂרָאֵל` *(Israel)* — nós: 14.72s · ouvido: 17.18000030517578s · diferença +2.46s
- `דה` — o Whisper ouviu em 15.260000228881836s, não existe no nosso texto
- `חול` — o Whisper ouviu em 15.979999542236328s, não existe no nosso texto

**§6**

- `בַּעֲגָלָא` *(baagalá)* — nós: 16.62s · ouvido: 18.5s · diferença +1.88s
- `וּבִזְמַן` *(uvizmán)* — nós: 18.4s · ouvido: 19.18000030517578s · diferença +0.78s
- `קָרִיב` *(carív)* — nós: 19.58s · ouvido: 20.239999771118164s · diferença +0.66s
- `וְאִמְרוּ` *(veimrú)* — nós: 20.78s · ouvido: 21.6200008392334s · diferença +0.84s
- `אָמֵן` *(amên)* — nós: 21.48s · ouvido: 22.440000534057617s · diferença +0.96s

**§7**

- `יְהֵא` *(Yehê)* — nós: 22.48s · ouvido: 23.84000015258789s · diferença +1.36s
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

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — nós: 50.56s · ouvido: 51.41999816894531s · diferença +0.86s
- `דה` — o Whisper ouviu em 55.29999923706055s, não existe no nosso texto

**§14** — **já está no OUVIR-PRIMEIRO**

- `שָׁלוֹם` *(shalom)* — nós: 77.76s · ouvido: 76.66000366210938s · diferença -1.1s
- `עָלֵינוּ` *(aleinu)* — nós: 78.94s · ouvido: 77.54000091552734s · diferença -1.4s
- `וְעַל` *(veal)* — nós: 79.8s · ouvido: 78.41999816894531s · diferença -1.38s
- `כָּל` *(kol)* — nós: 80.44s · ouvido: 79.62000274658203s · diferença -0.82s
- `יִשְׂרָאֵל` *(Israel)* — nós: 81.02s · ouvido: 80.22000122070312s · diferença -0.8s

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

- `עַל` *(Al)* — nós: 64.98s · ouvido: 63.939998626708984s · diferença -1.04s
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

- `וְאִמְרוּ` *(veimrú)* — nós: 137.08s · ouvido: 136.4600067138672s · diferença -0.62s

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

**§8**

- `יְהֵא` *(Yehê)* — nós: 25.12s · ouvido: 24.020000457763672s · diferença -1.1s
- `שְׁמֵהּ` *(shemê)* — nós: 26.42s · ouvido: 25.760000228881836s · diferença -0.66s
- `רַבָּא` *(raba)* — nós: 27.18s · ouvido: 26.239999771118164s · diferença -0.94s
- `מְבָרַךְ` *(mevarách)* — nós: 28.32s · ouvido: 27s · diferença -1.32s
- `לְעָלַם` *(lealám)* — nós: 29.26s · ouvido: 27.760000228881836s · diferença -1.5s
- `וּלְעָלְמֵי` *(ul'almei)* — nós: 30.02s · ouvido: 28.979999542236328s · diferença -1.04s
- `עָלְמַיָּא` *(almayá)* — nós: 31.14s · ouvido: 29.959999084472656s · diferença -1.18s

**§9**

- `יִתְבָּרֵךְ` *(Yitbarêch)* — nós: 32.1s · ouvido: 31.34000015258789s · diferença -0.76s
- `וְיִשְׁתַּבַּח` *(veyishtabach)* — nós: 33.34s · ouvido: 31.940000534057617s · diferença -1.4s
- `וְיִתְפָּאַר` *(veyitpaar)* — nós: 34.6s · ouvido: 33.439998626708984s · diferença -1.16s

**§10**

- `וְיִתְרוֹמָם` *(veyitromam)* — nós: 35.72s · ouvido: 34.2400016784668s · diferença -1.48s
- `וְיִתְנַשֵּׂא` *(veyitnasse)* — nós: 37s · ouvido: 36.119998931884766s · diferença -0.88s
- `וְיִתְהַדָּר` *(veyithadar)* — nós: 38.28s · ouvido: 36.91999816894531s · diferença -1.36s

**§11**

- `וְיִתְעַלֶּה` *(veyitaleh)* — nós: 39.82s · ouvido: 37.900001525878906s · diferença -1.92s
- `וְיִתְהַלָּל` *(veyithalal)* — nós: 41.04s · ouvido: 39.439998626708984s · diferença -1.6s
- `שְׁמֵהּ` *(shemê)* — nós: 41.86s · ouvido: 40.70000076293945s · diferença -1.16s

**§14**

- `עַל` *(Al)* — nós: 55.7s · ouvido: 55.02000045776367s · diferença -0.68s

**§15**

- `הון` — o Whisper ouviu em 60.97999954223633s, não existe no nosso texto
- `הון` — o Whisper ouviu em 65s, não existe no nosso texto

**§16**

- `כָּל` *(kol)* — nós: 67.34s · ouvido: 66.05999755859375s · diferença -1.28s
- `מָאן` *(man)* — nós: 68.12s · ouvido: 67.27999877929688s · diferença -0.84s
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
- `בְרָא` *(verá)* — no texto em 7.26s, o Whisper não ouviu
- `חירותי` — o Whisper ouviu em 7.300000190734863s, não existe no nosso texto
- `כִרְעוּתֵהּ` *(chir'utêh)* — no texto em 7.78s, o Whisper não ouviu

**§4**

- `וְיַצְמַח` *(veyatsmách)* — nós: 10.4s · ouvido: 11.479999542236328s · diferença +1.08s
- `פֻּרְקָנֵהּ` *(purkanêh)* — nós: 11.38s · ouvido: 12.279999732971191s · diferença +0.9s
- `וִיקָרֵב` *(vikarev)* — nós: 12.6s · ouvido: 14.180000305175781s · diferença +1.58s
- `מְשִׁיחֵהּ` *(meshichêh)* — nós: 14.08s · ouvido: 14.84000015258789s · diferença +0.76s

**§5**

- `בְּחַיֵּיכוֹן` *(bechayechon)* — no texto em 15.16s, o Whisper não ouviu
- `וּבְיוֹמֵיכוֹן` *(uveyomechon)* — no texto em 17.06s, o Whisper não ouviu
- `בחיי` — o Whisper ouviu em 17.239999771118164s, não existe no nosso texto
- `חון` — o Whisper ouviu em 17.739999771118164s, não existe no nosso texto
- `וביום` — o Whisper ouviu em 18.079999923706055s, não existe no nosso texto

**§6** — **já está no OUVIR-PRIMEIRO**

- `וּבְחַיֵּי` *(uvechayê)* — nós: 18.66s · ouvido: 20.399999618530273s · diferença +1.74s
- `חון` — o Whisper ouviu em 19.139999389648438s, não existe no nosso texto
- `דְכָל` *(dechol)* — nós: 20.28s · ouvido: 21.059999465942383s · diferença +0.78s
- `בֵּית` *(beit)* — nós: 20.5s · ouvido: 22.459999084472656s · diferença +1.96s
- `יִשְׂרָאֵל` *(Israel)* — nós: 21.28s · ouvido: 23.139999389648438s · diferença +1.86s

**§7**

- `בַּעֲגָלָא` *(baagalá)* — nós: 22.46s · ouvido: 24.559999465942383s · diferença +2.1s
- `וּבִזְמַן` *(uvizmán)* — nós: 24.46s · ouvido: 25.18000030517578s · diferença +0.72s
- `קָרִיב` *(carív)* — nós: 25.74s · ouvido: 26.420000076293945s · diferença +0.68s
- `וְאִמְרוּ` *(veimrú)* — nós: 26.84s · ouvido: 27.81999969482422s · diferença +0.98s
- `אָמֵן` *(amên)* — nós: 27.7s · ouvido: 28.6200008392334s · diferença +0.92s

**§8**

- `שְׁמֵהּ` *(shemê)* — nós: 30.38s · ouvido: 31.020000457763672s · diferença +0.64s
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
- `בְרָא` *(verá)* — no texto em 6.64s, o Whisper não ouviu

**§8**

- `מְבָרַךְ` *(mevarách)* — nós: 31.08s · ouvido: 29.739999771118164s · diferença -1.34s
- `לְעָלַם` *(lealám)* — nós: 31.98s · ouvido: 31.139999389648438s · diferença -0.84s
- `וּלְעָלְמֵי` *(ul'almei)* — nós: 33.04s · ouvido: 31.719999313354492s · diferença -1.32s
- `עָלְמַיָּא` *(almayá)* — nós: 34.22s · ouvido: 32.91999816894531s · diferença -1.3s

**§9**

- `יִתְבָּרַךְ` *(Yitbarêch)* — nós: 35.36s · ouvido: 34.459999084472656s · diferença -0.9s
- `וְיִשְׁתַּבַּח` *(veyishtabach)* — nós: 36.78s · ouvido: 35.060001373291016s · diferença -1.72s
- `וְיִתְפָּאַר` *(veyitpaar)* — nós: 38s · ouvido: 36.880001068115234s · diferença -1.12s

**§10**

- `וְיִתְרוֹמַם` *(veyitromam)* — nós: 39.32s · ouvido: 38.13999938964844s · diferença -1.18s
- `וְיִתְנַשֵּׂא` *(veyitnasse)* — nós: 40.66s · ouvido: 39.41999816894531s · diferença -1.24s
- `וְיִתְהַדָּר` *(veyithadar)* — nós: 41.92s · ouvido: 40.7599983215332s · diferença -1.16s

**§11**

- `וְיִתְעַלֶּה` *(veyitaleh)* — nós: 43.24s · ouvido: 42.08000183105469s · diferença -1.16s
- `וְיִתְהַלָּל` *(veyithalal)* — nós: 44.7s · ouvido: 43.380001068115234s · diferença -1.32s
- `שְׁמֵהּ` *(shemê)* — nós: 46.24s · ouvido: 44.91999816894531s · diferença -1.32s
- `דְּקֻדְשָׁא` *(decudshá)* — nós: 46.94s · ouvido: 45.31999969482422s · diferença -1.62s
- `בְּרִיךְ` *(berich)* — nós: 48.24s · ouvido: 46.119998931884766s · diferença -2.12s
- `הוּא` *(hu)* — nós: 49.34s · ouvido: 46.97999954223633s · diferença -2.36s

**§12**

- `לְעֵלָּא` *(leela)* — nós: 49.72s · ouvido: 48.18000030517578s · diferença -1.54s
- `מִן` *(min)* — nós: 50.12s · ouvido: 48.880001068115234s · diferença -1.24s
- `כָּל` *(kol)* — nós: 50.64s · ouvido: 49.7400016784668s · diferença -0.9s
- `בִּרְכָתָא` *(birchatá)* — nós: 51.4s · ouvido: 50.060001373291016s · diferença -1.34s
- `וְשִׁירָתָא` *(veshiratá)* — nós: 52.68s · ouvido: 51.15999984741211s · diferença -1.52s

**§13**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — nós: 53.8s · ouvido: 52.70000076293945s · diferença -1.1s
- `וְנֶחֱמָתָא` *(venechamata)* — nós: 55.46s · ouvido: 53.7400016784668s · diferença -1.72s
- `דַּאֲמִירָן` *(dáamiran)* — nós: 57.26s · ouvido: 55.63999938964844s · diferença -1.62s
- `בְּעָלְמָא` *(bealma)* — nós: 59.76s · ouvido: 56.20000076293945s · diferença -3.56s
- `וְאִמְרוּ` *(veimrú)* — nós: 61.74s · ouvido: 57.36000061035156s · diferença -4.38s
- `אָמֵן` *(amên)* — nós: 62.38s · ouvido: 58.13999938964844s · diferença -4.24s

**§14**

- `עַל` *(Al)* — nós: 63.66s · ouvido: 59.380001068115234s · diferença -4.28s
- `יִשְׂרָאֵל` *(Israel)* — nós: 64.6s · ouvido: 60.08000183105469s · diferença -4.52s
- `הון` — o Whisper ouviu em 65.36000061035156s, não existe no nosso texto
- `וְעַל` *(veal)* — nós: 65.88s · ouvido: 61.779998779296875s · diferença -4.1s
- `רַבָּנָן` *(rabanan)* — nós: 66.1s · ouvido: 62.2599983215332s · diferença -3.84s

**§15**

- `וְעַל` *(veal)* — nós: 67.46s · ouvido: 63.81999969482422s · diferença -3.64s
- `תַּלְמִידֵיהוֹן` *(talmidehon)* — nós: 68.5s · ouvido: 64.19999694824219s · diferença -4.3s
- `הון` — o Whisper ouviu em 69.55999755859375s, não existe no nosso texto
- `וְעַל` *(veal)* — nós: 70.28s · ouvido: 66.0199966430664s · diferença -4.26s
- `כָּל` *(kol)* — nós: 71.12s · ouvido: 66.45999908447266s · diferença -4.66s
- `תַּלְמִידֵי` *(talmidei)* — nós: 71.58s · ouvido: 67.16000366210938s · diferença -4.42s
- `תַלְמִידֵיהוֹן` *(talmidehon)* — nós: 72.7s · ouvido: 68.45999908447266s · diferença -4.24s

**§16** — **já está no OUVIR-PRIMEIRO**

- `וְעַל` *(veal)* — nós: 74.34s · ouvido: 70.76000213623047s · diferença -3.58s
- `כָּל` *(kol)* — nós: 74.88s · ouvido: 70.87999725341797s · diferença -4s
- `מָאן` *(man)* — nós: 75.7s · ouvido: 71.76000213623047s · diferença -3.94s
- `דְּעָסְקִין` *(daaskin)* — nós: 76.24s · ouvido: 72.18000030517578s · diferença -4.06s
- `בְּאוֹרַיְתָא` *(beoraytá)* — nós: 76.74s · ouvido: 73.5s · diferença -3.24s

**§17** — **já está no OUVIR-PRIMEIRO**

- `דִּי` *(di)* — nós: 77.9s · ouvido: 75.22000122070312s · diferença -2.68s
- `בְאַתְרָא` *(veatrá)* — nós: 78.74s · ouvido: 75.37999725341797s · diferença -3.36s
- `הָדֵין` *(haden)* — nós: 79.08s · ouvido: 76.58000183105469s · diferença -2.5s
- `וְדִי` *(vedi)* — nós: 79.8s · ouvido: 78.04000091552734s · diferença -1.76s
- `בְּכָל` *(vechol)* — nós: 80s · ouvido: 78.54000091552734s · diferença -1.46s
- `אֲתַר` *(atar)* — nós: 80.8s · ouvido: 79.77999877929688s · diferença -1.02s
- `וַאֲתַר` *(vaatár)* — nós: 81.12s · ouvido: 80.4000015258789s · diferença -0.72s

**§18**

- `יְהֵא` *(yehê)* — nós: 82.42s · ouvido: 81.62000274658203s · diferença -0.8s

**§19**

- `חִנָּא` *(chiná)* — no texto em 87.12s, o Whisper não ouviu
- `חינה` — o Whisper ouviu em 87.30000305175781s, não existe no nosso texto

**§21**

- `דִּי` *(di)* — nós: 99.92s · ouvido: 100.62000274658203s · diferença +0.7s
- `וְאַרְעָא` *(vear-á)* — no texto em 102.02s, o Whisper não ouviu
- `וערה` — o Whisper ouviu em 102.19999694824219s, não existe no nosso texto
- `אָמֵן` *(amên)* — nós: 105.92s · ouvido: 104.68000030517578s · diferença -1.24s

**§22** — **já está no OUVIR-PRIMEIRO**

- `יְהֵא` *(Yehê)* — nós: 106.7s · ouvido: 105.05999755859375s · diferença -1.64s
- `שְׁלָמָא` *(shelamá)* — nós: 107.46s · ouvido: 106.55999755859375s · diferença -0.9s
- `רַבָּא` *(raba)* — nós: 108.5s · ouvido: 107.30000305175781s · diferença -1.2s
- `מִן` *(min)* — nós: 110.16s · ouvido: 108.5999984741211s · diferença -1.56s
- `שְׁמַיָּא` *(shemayá)* — nós: 111.1s · ouvido: 108.95999908447266s · diferença -2.14s
- `וְחַיִּים` *(vechayim)* — nós: 112.18s · ouvido: 110.19999694824219s · diferença -1.98s
- `טוֹבִים` *(tovim)* — nós: 113.04s · ouvido: 110.87999725341797s · diferença -2.16s
- `עָלֵינוּ` *(aleinu)* — nós: 113.8s · ouvido: 112.31999969482422s · diferença -1.48s
- `וְעַל` *(veal)* — nós: 114.58s · ouvido: 112.94000244140625s · diferença -1.64s
- `כָּל` *(kol)* — nós: 115.08s · ouvido: 113.62000274658203s · diferença -1.46s
- `יִשְׂרָאֵל` *(Israel)* — nós: 115.64s · ouvido: 114.62000274658203s · diferença -1.02s
- `וְאִמְרוּ` *(veimrú)* — nós: 116.92s · ouvido: 115.73999786376953s · diferença -1.18s
- `אָמֵן` *(amên)* — nós: 117.96s · ouvido: 116.5199966430664s · diferença -1.44s

**§23**

- `שָׁלוֹם` *(shalom)* — nós: 119.94s · ouvido: 118.83999633789062s · diferença -1.1s
- `בִּמְרוֹמָיו` *(bimromav)* — nós: 120.96s · ouvido: 119.31999969482422s · diferença -1.64s

**§24** — **já está no OUVIR-PRIMEIRO**

- `הוּא` *(hu)* — nós: 121.84s · ouvido: 121.12000274658203s · diferença -0.72s
- `בְּרַחֲמָיו` *(berachamav)* — nós: 122.94s · ouvido: 121.54000091552734s · diferença -1.4s
- `יַעֲשֶׂה` *(yaassê)* — nós: 124.14s · ouvido: 123.08000183105469s · diferença -1.06s
- `שָׁלוֹם` *(shalom)* — nós: 125.16s · ouvido: 123.68000030517578s · diferença -1.48s
- `עָלֵינוּ` *(aleinu)* — nós: 126.3s · ouvido: 125s · diferença -1.3s
- `וְעַל` *(veal)* — nós: 127.3s · ouvido: 125.86000061035156s · diferença -1.44s
- `כָּל` *(kol)* — nós: 127.8s · ouvido: 126.9000015258789s · diferença -0.9s

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

**§7**

- `אָמֵן` *(amên)* — nós: 27.42s · ouvido: 28.31999969482422s · diferença +0.9s

**§8** — **já está no OUVIR-PRIMEIRO**

- `יְהֵא` *(Yehê)* — nós: 28.32s · ouvido: 30s · diferença +1.68s
- `שְׁמֵהּ` *(shemê)* — nós: 30.34s · ouvido: 31.18000030517578s · diferença +0.84s
- `מְבָרַךְ` *(mevarách)* — nós: 32.16s · ouvido: 32.79999923706055s · diferença +0.64s
- `לְעָלַם` *(lealám)* — nós: 33.1s · ouvido: 34.31999969482422s · diferença +1.22s
- `וּלְעָלְמֵי` *(ul'almei)* — nós: 34.46s · ouvido: 35.15999984741211s · diferença +0.7s
- `עָלְמַיָּא` *(almayá)* — nós: 35.48s · ouvido: 36.279998779296875s · diferença +0.8s

**§9**

- `יִתְבָּרַךְ` *(Yitbarêch)* — nós: 36.6s · ouvido: 37.41999816894531s · diferença +0.82s
- `וְיִשְׁתַּבַּח` *(veyishtabach)* — nós: 37.94s · ouvido: 38.84000015258789s · diferença +0.9s
- `וְיִתְפָּאַר` *(veyitpaar)* — nós: 39.26s · ouvido: 40.2400016784668s · diferença +0.98s

**§10**

- `וְיִתְרוֹמַם` *(veyitromam)* — nós: 40.62s · ouvido: 41.880001068115234s · diferença +1.26s
- `וְיִתְנַשֵּׂא` *(veyitnasse)* — nós: 42.08s · ouvido: 43.279998779296875s · diferença +1.2s
- `וְיִתְהַדָּר` *(veyithadar)* — nós: 43.5s · ouvido: 44.880001068115234s · diferença +1.38s

**§11**

- `וְיִתְעַלֶּה` *(veyitaleh)* — nós: 44.84s · ouvido: 46.279998779296875s · diferença +1.44s
- `וְיִתְהַלָּל` *(veyithalal)* — nós: 46.44s · ouvido: 47.68000030517578s · diferença +1.24s
- `שְׁמֵהּ` *(shemê)* — nós: 47.84s · ouvido: 48.959999084472656s · diferença +1.12s
- `דְּקֻדְשָׁא` *(decudshá)* — no texto em 48.22s, o Whisper não ouviu
- `בְּרִיךְ` *(berich)* — nós: 49.38s · ouvido: 51.08000183105469s · diferença +1.7s
- `דקוצה` — o Whisper ouviu em 49.97999954223633s, não existe no nosso texto
- `הוּא` *(hu)* — nós: 50.28s · ouvido: 51.86000061035156s · diferença +1.58s

**§12** — **já está no OUVIR-PRIMEIRO**

- `לְעֵלָּא` *(leela)* — nós: 50.52s · ouvido: 52.79999923706055s · diferença +2.28s
- `מִן` *(min)* — nós: 51.08s · ouvido: 54.20000076293945s · diferença +3.12s
- `כָּל` *(kol)* — nós: 51.88s · ouvido: 54.540000915527344s · diferença +2.66s
- `בִּרְכָתָא` *(birchatá)* — nós: 53.02s · ouvido: 54.939998626708984s · diferença +1.92s
- `שִׁירָתָא` *(shirata)* — nós: 54.9s · ouvido: 56.31999969482422s · diferença +1.42s

**§13**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — nós: 56.44s · ouvido: 57.779998779296875s · diferença +1.34s
- `וְנֶחָמָתָא` *(venechamata)* — nós: 57.74s · ouvido: 58.779998779296875s · diferença +1.04s
- `דַּאֲמִירָן` *(dáamiran)* — nós: 59.18s · ouvido: 61.040000915527344s · diferença +1.86s
- `בְּעָלְמָא` *(bealma)* — nós: 60.36s · ouvido: 62.060001373291016s · diferença +1.7s
- `וְאִמְרוּ` *(veimrú)* — nós: 61.1s · ouvido: 62.7400016784668s · diferença +1.64s
- `אָמֵן` *(amên)* — nós: 63.14s · ouvido: 63.91999816894531s · diferença +0.78s

**§14**

- `שְׁלָמָא` *(shelamá)* — nós: 65.24s · ouvido: 65.94000244140625s · diferença +0.7s
- `רַבָּא` *(raba)* — nós: 65.9s · ouvido: 66.58000183105469s · diferença +0.68s

**§15**

- `וסבא` — o Whisper ouviu em 69.66000366210938s, não existe no nosso texto
- `וְשָׂבָע` *(vessavá)* — no texto em 69.84s, o Whisper não ouviu

**§16**

- `וּגְאֻלָּה` *(ug'ulá)* — nós: 75.44s · ouvido: 76.22000122070312s · diferença +0.78s
- `וּסְלִיחָה` *(usslichá)* — nós: 76.28s · ouvido: 77.33999633789062s · diferença +1.06s
- `וְכַפָּרָה` *(vechapará)* — nós: 77.52s · ouvido: 78.5999984741211s · diferença +1.08s

**§17**

- `וְרֶוַח` *(verêvach)* — nós: 79.28s · ouvido: 80s · diferença +0.72s
- `וְהַצָּלָה` *(vehatsalá)* — nós: 80.36s · ouvido: 81.05999755859375s · diferença +0.7s
- `לָנוּ` *(lanu)* — nós: 81.48s · ouvido: 82.41999816894531s · diferença +0.94s
- `עַמּוֹ` *(amô)* — nós: 83.68s · ouvido: 84.31999969482422s · diferença +0.64s

**§19**

- `ורחמב` — o Whisper ouviu em 92.36000061035156s, não existe no nosso texto
- `בְּרַחֲמָיו` *(berachamav)* — no texto em 92.8s, o Whisper não ouviu

### sefaradi_derabanan

**§2**

- `דברה` — o Whisper ouviu em 5.639999866485596s, não existe no nosso texto
- `דִּי` *(di)* — no texto em 5.64s, o Whisper não ouviu
- `בְרָא` *(verá)* — no texto em 6.32s, o Whisper não ouviu

**§7**

- `וּבִזְמַן` *(uvizmán)* — nós: 23.88s · ouvido: 22.479999542236328s · diferença -1.4s
- `קָרִיב` *(carív)* — nós: 24.84s · ouvido: 23.579999923706055s · diferença -1.26s
- `וְאִמְרוּ` *(veimrú)* — nós: 25.98s · ouvido: 24.940000534057617s · diferença -1.04s
- `אָמֵן` *(amên)* — nós: 27.88s · ouvido: 25.68000030517578s · diferença -2.2s

**§8**

- `יְהֵא` *(Yehê)* — nós: 28.62s · ouvido: 27.34000015258789s · diferença -1.28s
- `שְׁמֵהּ` *(shemê)* — nós: 29.58s · ouvido: 28.639999389648438s · diferença -0.94s
- `רַבָּא` *(raba)* — nós: 30.2s · ouvido: 29.18000030517578s · diferença -1.02s
- `מְבָרַךְ` *(mevarách)* — nós: 31.7s · ouvido: 30.1200008392334s · diferença -1.58s
- `לְעָלַם` *(lealám)* — nós: 32.8s · ouvido: 31.81999969482422s · diferença -0.98s
- `וּלְעָלְמֵי` *(ul'almei)* — nós: 33.94s · ouvido: 32.560001373291016s · diferença -1.38s
- `עָלְמַיָּא` *(almayá)* — no texto em 35.02s, o Whisper não ouviu

**§9**

- `יִתְבָּרַךְ` *(Yitbarêch)* — nós: 36.62s · ouvido: 34.619998931884766s · diferença -2s
- `וְיִשְׁתַּבַּח` *(veyishtabach)* — nós: 38.08s · ouvido: 36.7400016784668s · diferença -1.34s
- `וְיִתְפָּאַר` *(veyitpaar)* — nós: 39.6s · ouvido: 38.13999938964844s · diferença -1.46s

**§10**

- `וְיִתְרוֹמַם` *(veyitromam)* — nós: 41.02s · ouvido: 39.7400016784668s · diferença -1.28s
- `וְיִתְנַשֵּׂא` *(veyitnasse)* — nós: 42.44s · ouvido: 41.15999984741211s · diferença -1.28s
- `וְיִתְהַדָּר` *(veyithadar)* — nós: 43.98s · ouvido: 42.560001373291016s · diferença -1.42s

**§11**

- `וְיִתְעַלֶּה` *(veyitaleh)* — nós: 45.26s · ouvido: 44.20000076293945s · diferença -1.06s
- `וְיִתְהַלָּל` *(veyithalal)* — nós: 46.7s · ouvido: 45.619998931884766s · diferença -1.08s
- `שְׁמֵהּ` *(shemê)* — nós: 47.68s · ouvido: 46.34000015258789s · diferença -1.34s
- `בקבוצה` — o Whisper ouviu em 47.7599983215332s, não existe no nosso texto
- `דְּקֻדְשָׁא` *(decudshá)* — no texto em 47.9s, o Whisper não ouviu

**§12** — **já está no OUVIR-PRIMEIRO**

- `לְעֵלָּא` *(leela)* — nós: 50.74s · ouvido: 50.02000045776367s · diferença -0.72s
- `ממכל` — o Whisper ouviu em 51.439998626708984s, não existe no nosso texto
- `מִן` *(min)* — no texto em 51.86s, o Whisper não ouviu
- `כָּל` *(kol)* — no texto em 52.58s, o Whisper não ouviu
- `שִׁירָתָא` *(shirata)* — nós: 53.7s · ouvido: 54.5s · diferença +0.8s

**§13**

- `תֻּשְׁבְּחָתָא` *(tushbechata)* — nós: 54.44s · ouvido: 55.880001068115234s · diferença +1.44s
- `וְנֶחָמָתָא` *(venechamata)* — nós: 55.78s · ouvido: 57.20000076293945s · diferença +1.42s
- `דַּאֲמִירָן` *(dáamiran)* — nós: 57.12s · ouvido: 59.08000183105469s · diferença +1.96s
- `בְּעָלְמָא` *(bealma)* — nós: 58.9s · ouvido: 59.900001525878906s · diferença +1s

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

**§23**

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

