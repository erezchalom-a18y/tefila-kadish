# Auditoria — 03/09/2026

O Erez pediu: *"fazer uma auditoria apontando possíveis erros e inconsistências e
se foram feitas alterações nas telas, nos textos, traduções e transliterações sem
minha autorização"*.

Tudo abaixo é **medido**, não lembrado. Cada afirmação tem a conta que a sustenta,
e ela pode ser refeita.

---

## 1. Houve mudança de texto sem autorização?

**Não.** Desde 26/08 só DOIS commits mudaram texto nos `sync/*.json`, e os dois
têm pedido escrito dele.

| commit | textos mudados | pedido dele |
|---|---|---|
| `99126ea` — as palavrinhas nas 7 línguas | 2.695 | *"gostaria que as evoluções que fiz em português fossem feitas nas traduções nas outras línguas, como exaltado e santificado seja seu grande nome (no inglês está his name great)"* |
| `5489671` — o Yitbarach | 8 | *"um erro na transliteração, o correto é yitbarach não veitbarech"* |

**Os 2.695 assustam e não deviam.** Medido no próprio commit: **nenhuma frase de
verso mudou** (0 de 376) — o que mudou foram 858 filas de palavrinhas, isto é,
ONDE cada frase foi cortada em pedaços. Nenhuma palavra nova entrou em nenhuma
das 7 línguas; só se mudou o corte. É a regra que torna aquele trabalho seguro, e
ela vale hoje: juntando as palavrinhas de qualquer verso, nas 7 línguas, sai
**exatamente** a frase que já existia. Zero exceções em en, es, fr, it, de, ru, he.

**Os 8 são a correção dele de ontem**, e só ela: o `Yitbarêch` → `Yitbarach` nos
quatro Kadishim que têm patach (os dois sefaradi e os dois sefard), no verso e na
palavra. Nada mais.

**O hebraico não mudou uma letra.** Conferidos os 976 textos hebraicos dos 8
arquivos, sem nikud, contra 26/08, contra 02/09 e contra hoje de manhã: **0
diferenças** nos três.

**Na minha sessão inteira** (áudio novo do sefaradi, remapeamento, os 5 arrastos,
o Adar, a porta da frente, a página Aprender, o "Em memória de"): **8 textos
mudaram, e são os 8 do Yitbarach**. Os commits do áudio e do remapeamento mudaram
**0 textos** — só tempos.

---

## 2. Houve mudança de tela sem autorização?

**Não.** As 61 palavras da tela (tabela `I18N`) e o texto do painel "Sobre" estão
**idênticos, caractere por caractere**, ao que estavam antes de eu começar.

As duas únicas tabelas de texto que mudaram são a `DEDICATORIA` e o `CONVITE`, e
são o pedido dele desta noite: *"incluir no lugar: Em memória e pela elevação da
alma de: e na linha de baixo (nome) ou (clique aqui e inclua o nome)"*.

Das versões anteriores (v24 a v28, de outras sessões), cada uma tem a frase dele
citada no CLAUDE.md que a autorizou — a fita das camadas, o convite, a
dedicatória rolando junto, o botão de mudo, o Reza | Treino.

---

## 3. Inconsistências que achei, e que são dele para decidir

### 3.1 O `Yitbarêch` do ashkenaz e do chabad discorda das outras 5 línguas

Ele decidiu em 25/08 que o ashkenaz e o chabad ficam com o **tsere** (`Yitbarêch`,
`veyitpaêr`) e o sefard e o sefaradi com o **patach**. Isso foi feito no hebraico
e no português. Mas as outras cinco línguas vêm de um documento só, que não separa
por nussach, e por isso trazem o **patach em todos os oito**:

| | português | inglês | espanhol | francês | italiano | russo |
|---|---|---|---|---|---|---|
| ashkenaz / chabad | Yitbar**ê**ch | yitbar**a**ch | yitbar**a**j | yitbar**a**’h | yitbar**a**ch | йитбар**а**х |
| sefard / sefaradi | Yitbar**a**ch | yitbar**a**ch | yitbar**a**j | yitbar**a**’h | yitbar**a**ch | йитбар**а**х |

O mesmo acontece com o `veyitpaêr` (pt) contra `v'yitpa'ar` (as 5).

Ou seja: **no ashkenaz e no chabad, a linha em português diz "ê" e a linha em
inglês diz "a", para a mesma palavra.** São 2 palavras em 4 arquivos.
Não é mudança não autorizada — as cinco línguas vêm do documento humano dele —
mas as duas se contradizem na tela.
**Não mexi. É decisão dele.**

### 3.2 O russo mostra letras latinas no meio do cirílico

21 palavras (em 41 lugares) não têm transliteração própria em nenhuma das cinco
línguas — o documento dele não as cobre. A regra do app é cair no português, e
está escrita e é deliberada. Em inglês, espanhol, francês e italiano isso quase
não se nota, porque é o mesmo alfabeto. **Em russo, nota-se muito.** Na tela, hoje:

> `хайим vessavá vishuá venechamá veshezavá`
> `verêvach vehatsalá lanu ulechol amô Исраэль вэимру амэн`

São três versos do sefaradi_derabanan e um do sefard_derabanan. Quem lê o app em
russo vê metade da linha em cirílico e metade em português.
**Não mexi. Também é decisão dele** — as opções são deixar assim, escrever essas
21 palavras em cirílico, ou esconder a linha de transliteração no russo onde falta
(como já se faz no alemão).

### 3.3 As 5 diferenças conhecidas do português continuam abertas

Juntando as palavrinhas em português, 5 casos (em 12 versos) não dão exatamente a
frase — tirada a pontuação e o travessão. Estão registradas no CLAUDE.md desde
30/08 como decisão dele, e **conferi que continuam sendo exatamente essas 5**:

1. `graça, bondade e misericórdia` × `graça bondade misericórdia` (falta o "e") — 3 versos
2. `que Ele, em Sua misericórdia, faça paz` × `que Ele faça em Sua misericórdia paz` (ordem) — 1
3. `uma boa vida` × `uma vida boa` (ordem) — 4
4. `que Ele faça a paz` × `Ele fará a paz` — 2
5. `cura, redenção, perdão e expiação` × `cura redenção perdão expiação` (falta o "e") — 2

---

## 4. O que continua sendo rascunho de máquina, e ninguém humano leu

Isto não é defeito novo: é o estado declarado do projeto. Mas numa auditoria tem
de estar escrito, porque é a maior dívida de conteúdo que existe.

| onde | o que | estado |
|---|---|---|
| `glossario.json` | 26 das 42 entradas | `origem=claude` — rascunho de IA |
| `glossario.json` | 16 das 42 entradas | `origem=tehilat_hashem` — de siddur publicado, **direitos pendentes** |
| `sync/*.json` | as traduções dos versos nas 7 línguas | rascunho de IA |
| `aprender.json` | as 7 línguas do texto novo dele | tradução minha, de hoje — a página avisa "Rascunho" nas 8 |
| `yahrzeit.js` | os avisos do yahrzeit nas 8 línguas | tradução de IA, sem fonte humana |

O **português** é o único que passou por ele, e passou item a item.

---

## 5. Apontamentos de sincronia que sobrevivem, e por quê

`checar-sincronia.mjs` acusa 4 nos 8. Rastreei os quatro:

- **3 são o Whisper errando**, e o sinal está do nosso lado nos três: ele corta o
  "Amen" curto e começa a palavra seguinte ainda no silêncio (sefaradi_yatom
  versos 14 e 18; sefaradi_derabanan verso 24). Medido bloco a bloco.
- **1 é o "di" do chabad_yatom**, que ele mesmo separou de ouvido em 24/08.

Nenhum é defeito de dado. A coluna acusa de propósito e quem julga é o ouvido dele.

---

## 6. Coisas que EU mudei e ele ainda não viu

1. **O `de:` que ele escreveu com acento.** Ele escreveu "alma dê:"; pus "alma
   de:", que é o que a frase pede. Um caractere, se ele quis outra coisa.
2. **O desenho da dedicatória.** O rótulo saiu da caixa-alta espaçada, porque
   caixa-alta segura um nome e não uma frase. E na tela curta a letra e a
   entrelinha apertaram (14,7px e 13,6px, acima do piso de 12px do projeto),
   senão a sobra para o Kadish caía para 58% — abaixo do piso de 60%.
3. **As 7 traduções do texto da página Aprender** são minhas, de hoje, e ninguém
   humano as leu. O português é dele, palavra por palavra (742, conferidas).
4. **O `Yitbarach` foi aplicado nos quatro de patach**, e não só no
   sefaradi_yatom que ele nomeou.

---

## 7. O que a auditoria NÃO alcança

- Não sei se as 7 traduções estão **certas** — só sei que ninguém humano as leu.
  Isso é para o rabino.
- Não sei se o iPad dele mostra o que eu meço aqui. Nenhuma checagem roda no
  aparelho dele; é a lição de 28/08.
- Direitos das 16 entradas de siddur publicado continuam pendentes, e isso é
  jurídico, não técnico.
