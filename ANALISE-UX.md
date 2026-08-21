# Análise crítica de UX — app do Kadish

Feita medindo o app de verdade num navegador, em tela de celular (390×844), não
opinando por cima. Cada número aqui foi medido, e dá para repetir a medição.

A régua que usei o tempo todo: **este app é para rezar, não para configurar.**
Quem abre está de pé, muitas vezes no minyan, às vezes chorando, com o telefone
numa mão. Tudo que não serve a esse momento está no caminho.

---

## 1. O primeiro contato afasta quem mais precisa

**O que acontece hoje:** ao abrir o app pela primeira vez, antes de aparecer uma
única letra do Kadish, o enlutado recebe um formulário: *"Em memória de quem você
está rezando?"* — nome, nome hebraico, relação e **data de falecimento**. Atrás
dele, um aviso de privacidade.

**Por que é grave.** A pessoa que abre este app pode ter enterrado o pai ontem.
Pedir a data do falecimento como porta de entrada é pedir que ela reviva o dia
antes de rezar. E é pedir uma tarefa administrativa a quem veio buscar consolo.

Há também um problema prático: no minyan o Kadish começa quando o chazan chega
nele. Não há trinta segundos para preencher formulário.

**O que eu faria:** abrir direto no Kadish. O nome do falecido é uma coisa linda
de ter — mas oferecida **depois**, discreta, uma vez que a pessoa já rezou. Um
link no rodapé: *"dedicar este Kadish a alguém"*. Quem quiser, preenche.

Isto é, na minha leitura, o problema número um do app. Os outros são de conforto;
este é de acolhimento.

---

## 2. Quase metade da tela não é oração

Medido no celular:

| | altura | |
|---|---:|---|
| cabeçalho | 216 px | 26% da tela |
| barra de baixo | 130 px | 15% |
| **total de moldura** | **346 px** | **41%** |
| sobra para o Kadish | 498 px | 59% |

Com isso, **3 versos inteiros cabem na tela**, de 27. A pessoa rola sete vezes
para rezar um Kadish de dois minutos.

O cabeçalho tem hoje sete coisas disputando espaço — `TEFILÁ · V3.0`, `CHABAD`,
`YATOM`, `Modo Reza`, `PT`, engrenagem, informação — mais uma segunda linha
(`EM PÉ / EM MINYAN / EM VOZ AUDÍVEL`) e mais um cartão de propaganda
(*"Por que dizemos o Kadish?"*).

**Sua intuição estava certa.** Só acrescento uma ressalva: **o ▶ merece ficar
grande e fixo**. Quem está de pé precisa acertar pausar sem olhar. O que não
merece espaço permanente são os cinco botões de velocidade (`.5× .75× 1× 1.25×
1.5×`), que se usam uma vez.

`TEFILÁ · V3.0` também pode sair: o número da versão não serve a ninguém que reza.

---

## 3. Os temas: dois dos quatro não funcionam

Você disse que as outras cores estão estranhas. Elas estão **quebradas**, e dá
para provar. Contraste medido entre a letra e o fundo (a norma de acessibilidade
pede no mínimo 4,5 para texto corrido):

| tema | contraste do hebraico | veredito |
|---|---:|---|
| Pergaminho | 13,8 | ótimo |
| Claro | 15,0 | ótimo |
| **Escuro** | **1,16** | **ilegível** |
| Contraste | 18,0 | ótimo |

**1,16 quer dizer letra branca sobre fundo creme.** No tema Escuro, o cabeçalho e
o rodapé escurecem, mas o fundo do texto continua claro — e o hebraico fica
praticamente invisível. Não é gosto: está defeituoso.

E tem outra coisa, que explica por que "Claro" nunca pareceu claro: **o fundo da
página é o mesmo pergaminho (244,237,224) nos quatro temas.** O controle de tema
só muda a cor da letra e das barras. Nenhum dos quatro deixa a tela branca.

**Concordo com você: dois temas bastam.** Sugiro:

- **Pergaminho** (o atual, bonito e legível) — padrão;
- **Claro de verdade** — fundo branco, letra preta, para quem tem vista cansada
  ou está num lugar muito iluminado.

O Escuro só voltaria se fosse feito direito — fundo escuro *no texto também*. Um
tema escuro correto tem valor real: Kadish se reza de noite, e um telefone branco
na mão ofusca. Mas meio escuro é pior que nenhum.

---

## 4. "Modo Reza" promete e não entrega

O botão existe e é a primeira coisa que se lê no cabeçalho. Medi antes e depois
de apertá-lo: **a moldura continua com os mesmos 346 px, e continuam cabendo 3
versos.** Ele liga uma classe chamada `modo-treino` — ou seja, o botão que diz
"Reza" liga o modo treino.

Um botão com nome de promessa que não cumpre é pior que nenhum botão: ensina a
pessoa a não confiar no que está escrito.

**O que eu faria:** ou o Modo Reza vira de verdade o modo "só o Kadish" — some
tudo menos o texto e o ▶ —, ou o botão sai.

---

## 5. Configurações: dez perguntas para quem quer rezar

O painel tem hoje dez linhas: tema, tamanho da fonte, tradição, idioma,
explicações entre versos, áudio, e mais quatro camadas (hebraico, transliteração,
tradução, com Ocultar/Normal/Destaque cada uma).

Quase tudo ali se ajusta **uma vez na vida**. Mas duas coisas mudam de verdade no
dia a dia, e são justamente as que estão enterradas no menu: **a tradição** e **o
tipo de Kadish**.

**O que eu faria:** subir tradição, tipo e idioma para o cabeçalho, clicáveis
direto — as três etiquetas já estão lá, falta só poderem ser tocadas. Todo o
resto continua na engrenagem.

E cortaria as três camadas Ocultar/Normal/Destaque para um controle só:
*"o que mostrar: hebraico · + transliteração · + tradução"*. Nove combinações
viram três escolhas que uma pessoa entende sem pensar.

---

## 6. O que eu mudaria, em ordem

1. **Abrir direto no Kadish.** O formulário de memória vira convite depois.
2. **Consertar o tema Escuro ou tirá-lo.** Hoje ele é ilegível.
3. **Encolher a moldura** de 41% para perto de 25%: tirar a versão, as
   velocidades da barra de baixo e o cartão de propaganda.
4. **Tradição, tipo e idioma clicáveis no topo.**
5. **Fazer o Modo Reza cumprir o nome**, ou tirá-lo.
6. **Dois temas**, como você propôs — mas com o Claro sendo branco de verdade.

Os itens 1 e 2 eu chamaria de defeito. Do 3 ao 6 é gosto informado — e o gosto,
aqui, é seu.

---

## O que não mudaria

O texto em três linhas — hebraico grande, transliteração em itálico, tradução
embaixo — está muito bom. A hierarquia está certa: o olho cai no hebraico
primeiro, e é isso que tem que acontecer. A tipografia com serifa e o pergaminho
dão ao app um ar de livro, não de aplicativo. Isso é acerto, não sorte, e eu não
mexeria.
