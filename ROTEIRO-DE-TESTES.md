# Roteiro de testes — Kadish

> **No iPad, não use este arquivo — abra a página de testes:**
> **https://erezchalom-a18y.github.io/tefila-kadish/testes.html**
>
> São 9 testes, cada um com o botão que já abre a coisa certa. Você toca
> "Funcionou" ou "Deu problema", e no fim ela monta o recado pronto para me
> mandar. Leva uns 15 minutos.
>
> Este arquivo aqui é a versão longa, com os 40 testes. Serve de referência
> quando algo der errado e a gente precisar olhar mais fundo.

Nenhum passo precisa de programa nenhum: só o navegador e o ouvido.

Marque cada linha. Onde der errado, me diga **o número do teste** e o que você
viu — com isso eu acho o problema rápido.

---

## Parte 1 — O app no ar (10 min)

Abra: **https://erezchalom-a18y.github.io/tefila-kadish/**

| # | O que fazer | O que tem que acontecer |
|---|---|---|
| 1.1 | Abrir o endereço | A página abre. Não pode ficar em branco nem dar erro. |
| 1.2 | Apertar ▶ | O áudio do rabino começa a tocar. |
| 1.3 | Olhar o texto enquanto toca | A palavra que ele está falando **acende em amarelo**, e vai andando junto com a voz. |
| 1.4 | Deixar tocar 30 segundos | O destaque continua acompanhando. Se ele "descolar" da voz, anote o segundo. |
| 1.5 | Trocar o idioma (botão da bandeira, no alto) | A tradução muda de língua. São 8: PT, EN, ES, FR, IT, DE, RU, HE. |
| 1.6 | Passar pelas 8 e voltar ao PT | Nenhuma delas pode ficar em branco. |
| 1.7 | Trocar o tipo de Kadish (botão YATOM/DERABANAN) | O áudio troca junto, e o texto fica mais longo no deRabanan. |

**Trocar de nussach:** acrescente `?n=` no fim do endereço. Teste os quatro:

| # | Endereço | |
|---|---|---|
| 1.8 | `.../tefila-kadish/?n=ashkenaz` | toca e destaca |
| 1.9 | `.../tefila-kadish/?n=chabad` | toca e destaca |
| 1.10 | `.../tefila-kadish/?n=sefard` | toca e destaca |
| 1.11 | `.../tefila-kadish/?n=sefaradi` | toca e destaca |

---

## Parte 2 — A transliteração nova (10 min)

Foi a mudança de hoje. Abra o app e olhe a linha do meio (a que está em itálico).

| # | O que conferir | Certo |
|---|---|---|
| 2.1 | Não pode sobrar **nenhum apóstrofo** na transliteração | `veyitkadash`, não `v'yitkadash` |
| 2.2 | Antes de consoante virou "e" | `veshirata`, `shemei`, `berich` |
| 2.3 | Antes de vogal, o apóstrofo sumiu | `val`, `leila` |
| 2.4 | Entre duas vogais, sumiu | `veimru`, `yaaseh` |
| 2.5 | **Leia em voz alta 3 versos** | Você consegue ler sem tropeçar? Um estranho conseguiria? |

O teste 2.5 é o que importa de verdade. Os outros a máquina já conferiu.

Palavras que valem a pena olhar com carinho, porque ficaram diferentes do que
eram: `balma`, `lalam`, `ulalmei`, `chirutei`, `baagala`, `yaaseh`.

---

## Parte 3 — Os folhetos (5 min)

No repositório, pasta **folhetos/**. Abra dois ou três.

| # | O que conferir | Certo |
|---|---|---|
| 3.1 | O hebraico lê da direita para a esquerda | Começa em יִתְגַּדַּל, no canto direito |
| 3.2 | Os pontinhos (nikud) estão embaixo das letras certas | Não soltos nem deslocados |
| 3.3 | A tarja vermelha aparece em toda página | "RASCUNHO — AGUARDANDO REVISÃO RABÍNICA" |
| 3.4 | A marca d'água está clara o bastante para não atrapalhar | Dá para ler o texto por cima dela |
| 3.5 | Nenhum verso ficou cortado ao virar a página | Cada bloco inteiro numa página só |

---

## Parte 4 — Os cadernos do rabino (10 min)

Pasta **escolha-rabino/**. Comece pelo **pt** (10 páginas) e pelo **tl** (17).

| # | O que conferir | Certo |
|---|---|---|
| 4.1 | A capa tem a instrução de uma frase | "Assinale a tradução preferida em cada item, ou escreva a sua." |
| 4.2 | Em cada item com duas opções, a **diferença está grifada em amarelo** | `tod`**`o`** contra `tod`**`as`** |
| 4.3 | Nenhum item diz qual opção é a nossa | Só "Opção A" e "Opção B" |
| 4.4 | Tem espaço para escrever à mão | Linha "Outra tradução — escreva aqui" |
| 4.5 | No caderno **tl**, a transliteração **não** aparece no cabeçalho | Ela é a escolha; aparece só nas opções |
| 4.6 | Os números não se repetem | O item 112 é único em todos os cadernos |
| 4.7 | Dá para escrever em cima com caneta, impresso | Imprima uma página e teste |

---

## Parte 5 — O que roda sozinho (5 min)

| # | Onde | O que tem que estar |
|---|---|---|
| 5.1 | Aba **Actions** no GitHub | Tudo com ✅ verde. Nenhum ❌ vermelho. |
| 5.2 | Arquivo **STATUS.md** | As duas checagens 🟢, e a data de hoje |
| 5.3 | **STATUS.md**, tabela dos 8 | Coluna "em cima da voz" acima de 85% em todos |
| 5.4 | **OUVIR-PRIMEIRO-v2.md** | 12 versos listados |

---

## Parte 6 — Ouvir os 12 versos (o mais importante)

Este não tem pressa e não precisa ser hoje. Abra o **conferidor.html** e siga a
lista do `OUVIR-PRIMEIRO-v2.md`.

Para cada verso da lista:

1. Escolha o nussach no seletor de cima.
2. Ache o verso (o número § está na lista).
3. Clique nele e ouça.
4. **Se a palavra acender fora da voz**, anote: nussach, verso, palavra e o
   segundo em que ela realmente começa.

Exemplo do que me mandar: *"ashkenaz_yatom §13, a palavra `min` começa aos 63,9s"*.

Com isso eu registro a âncora e realinho. Sem o segundo, eu não faço nada — é a
regra do projeto: o ouvido aponta, o sinal decide o número.

---

## Se algo der errado

Me diga o **número do teste** e o que apareceu. Se for no app, ajuda muito saber:
qual nussach, qual língua, e se estava tocando ou parado.

Nada do que você testar aqui altera arquivo nenhum. Pode clicar à vontade.
