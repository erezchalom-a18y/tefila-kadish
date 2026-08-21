# O que estava só em português — e o que foi feito

Conferência pedida em 21/08: "confirmar que tudo o que foi feito em português
foi feito nas outras línguas também".

**Resposta curta: não estava. Sete coisas estavam só em português. As sete foram
consertadas, e agora existe um teste que impede que isso volte a acontecer.**

As oito línguas são: português, inglês, espanhol, francês, italiano, alemão,
russo e hebraico.

---

## O que já estava certo

| O quê | Situação |
|---|---|
| Glossário (42 entradas) | 8/8 línguas, nenhuma vazia |
| Tradução de cada verso, nos 8 nussachim | 8/8 línguas, nenhuma vazia |
| Glosa palavra por palavra (815 palavras ao todo) | 8/8 línguas, nenhuma vazia |
| Rótulos do app (menus, botões) | 55 chaves × 8 línguas, nenhuma faltando |
| Dedicatória "Em memória de" e o convite | 8/8 |

## O que estava só em português (e foi consertado)

**1. O painel "Sobre esta reza".** Sete parágrafos sobre o Kadish — o que é, por
que se diz, desde quando, por que em comunidade. Estavam escritos direto no HTML,
em português. Quem abria o app em russo ou hebraico e tocava no "i" recebia
português. Agora são tabela, nas 8 línguas.

**2. O título da reza, em italiano e alemão.** A tabela de títulos tinha pt, en,
es, fr, ru e he — faltavam it e de. Quem lia em italiano ou alemão via
"Kadish do Enlutado" em português no alto da tela. Agora: *Kaddish dei Dolenti*
e *Trauerkaddisch*. De quebra, o francês estava com o artigo errado
("Kaddish du Endeuillé"); virou "Kaddish de l'Endeuillé".

**3. Os avisos do yahrzeit.** Os cinco avisos — o dia hebraico começa ao
anoitecer, os dois meses de Adar, o primeiro ano, o mês de 29 dias — saíam em
português qualquer que fosse a língua. Agora nas 8.

**4. O arquivo de calendário (.ics).** Os quatro lembretes de cada yahrzeit (uma
semana antes, três dias antes, na véspera ao anoitecer, no dia) chegavam ao
celular em português. Agora chegam na língua da pessoa.

**5. Os nomes dos meses hebraicos.** Existiam só em transliteração latina:
"Kislev" mesmo para quem lia em hebraico. Agora:

| | |
|---|---|
| português, inglês, espanhol, francês, italiano | 17 Kislev 5787 |
| alemão | 17. Kislew 5787 |
| russo | 17 Кислев 5787 |
| hebraico | י"ז בכסלו תשפ"ז |

O hebraico sai em letras, como no siddur — foi preciso escrever a conta da
gematria (15 e 16 são ט"ו e ט"ז, nunca יה nem יו).

**6. As mensagens do app.** Dez mensagens que aparecem por cima da tela estavam
fixas em português: "Modo Treino", "Modo Reza", "Repetição 2 de 3", "Dedicação
salva", "Preencha pelo menos o nome", "Abra o arquivo baixado", os erros de
áudio. Agora nas 8.

**7. A página Aprender e os folhetos em PDF.** A moldura da página Aprender
(título, "voltar", o aviso de rascunho) estava em português. Nos folhetos, a
marca d'água **RASCUNHO — NÃO DISTRIBUIR** saía em português mesmo num folheto
alemão — justo o aviso que precisa ser lido por quem segura o papel. Ambos
corrigidos. `node gerar-pdf.mjs de` agora gera o folheto alemão inteiro em
alemão, com sufixo `_de` no nome. Os folhetos commitados continuam sendo os de
português, que são os que vão ao rabino.

---

## A exceção, que é de propósito

**A transliteração é uma só, com fonética portuguesa.** "Yitgadal veyitkadash"
é lido com as regras do português. Um leitor inglês lê "yit-ga-DAL" mais ou
menos certo por sorte; um alemão vai ler o "y" e o "sh" pelas regras dele e sair
diferente.

A regra do apóstrofo que você decidiu (v'shirata → **vershirata**) vale para
essa transliteração portuguesa, e só.

Fazer uma transliteração por língua é trabalho de verdade — 815 palavras × 7
línguas — e é decisão sua, não minha. **Não fiz.** Se quiser, dá para começar
pelo inglês, que é o que mais gente usa.

## O que continua sendo rascunho

Isto não mudou: as 7 línguas fora do português são **rascunho de IA**
(`origem=claude` no glossário). Elas estão completas, o que não é o mesmo que
estarem certas. Continuam precisando de olho humano — e a autoridade final é o
rabino.

---

## O teste que impede a recaída

`node testar-linguas.mjs` abre o app nas 8 línguas, uma por uma, e reprova se:

- o painel Sobre vier vazio;
- o cartão de yahrzeit vier sem data hebraica ou sem avisos;
- o arquivo de calendário não gerar;
- sobrar português na tela, no aviso ou no .ics.

Roda sozinho no GitHub a cada push, junto com `testar-app.mjs`. Foi ele que achou
o item 2 (italiano e alemão) — que passou despercebido por mim e por você.
