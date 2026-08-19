// Monta glossario.json: cada verso hebraico -> transliteracao + traducao + ORIGEM.
// A origem importa: o que veio do siddur publicado pode precisar ser trocado.
import { readFileSync, writeFileSync } from 'node:fs';
const norm = s => String(s).replace(/[֑-ׇ]/g, '').replace(/[^א-ת]/g, '');

const NOVOS = [
["עַל יִשְׂרָאֵל וְעַל רַבָּנָן","Al yisrael v'al rabanan","Sobre Israel e sobre os mestres"],
["וְעַל תַּלְמִידֵיהוֹן וְעַל כָּל תַּלְמִידֵי תַלְמִידֵיהוֹן","v'al talmideihon v'al kol talmidei talmideihon","e sobre seus discípulos e sobre todos os discípulos de seus discípulos"],
["וְעַל כָּל מָאן דְּעָסְקִין בְּאוֹרַיְתָא","v'al kol man d'as'kin b'oraita","e sobre todos os que se dedicam à Torá"],
["דְּעָסְקִין בְּאוֹרַיְתָא קַדִּשְׁתָּא","d'as'kin b'oraita kadishta","que se dedicam à Torá sagrada"],
["דִּי בְאַתְרָא הָדֵין וְדִי בְכָל אֲתַר וַאֲתַר","di v'atra hadein v'di v'chol atar va'atar","neste lugar e em todo e qualquer lugar"],
["יְהֵא לְהוֹן וּלְכוֹן שְׁלָמָא רַבָּא","yehei l'hon ul'chon shlama raba","que haja para eles e para vós grande paz"],
["יְהֵא לָנָא וּלְהוֹן וּלְכוֹן חִנָּא וְחִסְדָּא וְרַחֲמֵי","yehei lana ul'hon ul'chon china v'chisda v'rachamei","que haja para nós, para eles e para vós graça, bondade e misericórdia"],
["חִנָּא וְחִסְדָּא וְרַחֲמִין","china v'chisda v'rachamin","graça, bondade e misericórdia"],
["וְחַיִּין אֲרִיכִין וּמְזוֹנָא רְוִיחָא","v'chayin arichin um'zona r'vicha","vida longa e sustento abundante"],
["וְחַיִּין אֲרִיכִין וּמְזוֹנֵי רְוִיחֵי","v'chayin arichin um'zonei r'vichei","vida longa e sustento abundante"],
["וּפוּרְקָנָא מִן קֳדָם אֲבוּהוֹן דְּבִשְׁמַיָּא וְאִמְרוּ אָמֵן","ufurkana min kodam avuhon divishmaya ve'imru amen","e redenção de diante de seu Pai que está nos céus — e dizei amém"],
["וּפוּרְקָנָא מִן קֳדָם אֲבוּהוֹן דְּבִשְׁמַיָּא וְאַרְעָא וְאִמְרוּ אָמֵן","ufurkana min kodam avuhon divishmaya v'ar'a ve'imru amen","e redenção de diante de seu Pai que está nos céus e na terra — e dizei amém"],
["וּפֻרְקָנָא מִן קֳדָם אֲבוּהוֹן דִּי בִשְׁמַיָּא וְאַרְעָא וְאִמְרוּ אָמֵן","ufurkana min kodam avuhon di vishmaya v'ar'a ve'imru amen","e redenção de diante de seu Pai que está nos céus e na terra — e dizei amém"],
["מִן קֳדָם מָרֵא שְׁמַיָּא וְאַרְעָא וְאִמְרוּ אָמֵן","min kodam marei shmaya v'ar'a ve'imru amen","de diante do Senhor do céu e da terra — e dizei amém"],
["יְהֵא שְׁלָמָא רַבָּא מִן שְׁמַיָּא","Yehei shlama raba min shamaya","Que venha grande paz do céu"],
["יְהֵא שְׁלָמָא רַבָּא מִן שְׁמַיָּא וְחַיִּים עָלֵינוּ וְעַל כָּל יִשְׂרָאֵל וְאִמְרוּ אָמֵן","Yehei shlama raba min shamaya v'chayim aleinu v'al kol yisrael ve'imru amen","Que venha grande paz do céu, e vida, sobre nós e sobre toda Israel — e dizei amém"],
["חַיִּים וְשָׂבָע וִישׁוּעָה וְנֶחָמָה וְשֵׁיזָבָא","chayim v'sava vishua v'nechama v'sheizava","vida, fartura, salvação, consolo e livramento"],
["וּרְפוּאָה וּגְאֻלָּה וּסְלִיחָה וְכַפָּרָה","ur'fua ug'ula us'licha v'chapara","cura, redenção, perdão e expiação"],
["וְרֶוַח וְהַצָּלָה לָנוּ וּלְכָל עַמּוֹ יִשְׂרָאֵל וְאִמְרוּ אָמֵן","v'revach v'hatsala lanu ul'chol amo yisrael ve'imru amen","alívio e salvação, para nós e para todo o Seu povo Israel — e dizei amém"],
["עוֹשֶׂה שָׁלוֹם בִּמְרוֹמָיו","Oseh shalom bimromav","Aquele que faz paz em Suas alturas"],
["הוּא בְּרַחֲמָיו יַעֲשֶׂה שָׁלוֹם עָלֵינוּ וְעַל כָּל יִשְׂרָאֵל וְאִמְרוּ אָמֵן","hu b'rachamav ya'aseh shalom aleinu v'al kol yisrael ve'imru amen","que Ele, em Sua misericórdia, faça paz sobre nós e sobre toda Israel — e dizei amém"],
["הוּא בְּרַחֲמָיו יַעֲשֶׂה שָׁלוֹם עָלֵינוּ וְעַל כָּל עַמּוֹ יִשְׂרָאֵל וְאִמְרוּ אָמֵן","hu b'rachamav ya'aseh shalom aleinu v'al kol amo yisrael ve'imru amen","que Ele, em Sua misericórdia, faça paz sobre nós e sobre todo o Seu povo Israel — e dizei amém"],
["הוּא יַעֲשֶׂה בְרַחֲמָיו שָׁלוֹם עָלֵינוּ וְעַל כָּל יִשְׂרָאֵל וְאִמְרוּ אָמֵן","hu ya'aseh v'rachamav shalom aleinu v'al kol yisrael ve'imru amen","que Ele, em Sua misericórdia, faça paz sobre nós e sobre toda Israel — e dizei amém"],
["עוֹשֶׂה שָׁלוֹם בִּמְרוֹמָיו הוּא יַעֲשֶׂה שָׁלוֹם עָלֵינוּ וְעַל כָּל יִשְׂרָאֵל וְאִמְרוּ אָמֵן","Oseh shalom bimromav hu ya'aseh shalom aleinu v'al kol yisrael ve'imru amen","Aquele que faz paz em Suas alturas, que Ele faça paz sobre nós e sobre toda Israel — e dizei amém"],
["וְיַצְמַח פֻּרְקָנֵהּ וִיקָרֵב מְשִׁיחֵהּ","v'yatsmach purkanei vikarev meshichei","e que floresça Sua redenção e aproxime o Seu Mashiach"],
["לְעֵלָּא מִן כָּל בִּרְכָתָא שִׁירָתָא","l'eila min kol birchata shirata","acima de todas as bênçãos e cânticos"],
];

const g = { _leia:
  'Transliteracao e traducao verso a verso. O campo "origem" diz de onde veio cada uma. ' +
  'origem="tehilat_hashem": estava no chabad_yatom_sync.json e provavelmente foi copiado do ' +
  'siddur Tehilat Hashem publicado (Beit Chabad Central) - PRECISA de decisao sobre direitos. ' +
  'origem="claude": redigido por Claude no mesmo estilo, sem copia - precisa de revisao do rabino. ' +
  'A chave e o hebraico sem nikud e sem pontuacao.',
  entradas: {} };

for (const v of JSON.parse(readFileSync('sync/chabad_yatom_sync.json','utf8')).versos)
  if (v.transliteration_pt)
    g.entradas[norm(v.hebrew)] = { hebrew: v.hebrew, transliteration_pt: v.transliteration_pt,
                                   translation_pt: v.translation_pt, origem: 'tehilat_hashem' };

for (const [h, tl, td] of NOVOS)
  g.entradas[norm(h)] = { hebrew: h, transliteration_pt: tl, translation_pt: td, origem: 'claude' };

writeFileSync('glossario.json', JSON.stringify(g, null, 2) + '\n', 'utf8');
const n = Object.values(g.entradas);
console.log('glossario.json:', n.length, 'entradas |',
  n.filter(x=>x.origem==='tehilat_hashem').length, 'do siddur |',
  n.filter(x=>x.origem==='claude').length, 'redigidas');
