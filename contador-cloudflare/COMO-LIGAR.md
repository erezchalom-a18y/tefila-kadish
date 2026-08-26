# Como ligar o contador geral — passo a passo

Dá para fazer tudo do iPad, pelo navegador. Não precisa instalar nada.
São **cinco passos** e uns **quinze minutos**. Só faz sentido fazer uma vez.

Se em algum ponto a tela não estiver como está escrito aqui, pare e me avise —
é melhor eu ajustar o texto do que você adivinhar.

---

## Antes de começar: o que isto é

O app está no GitHub Pages, que só sabe **entregar arquivo**. Ele não guarda
nada. Por isso a conta de cada aparelho funciona (fica no próprio celular) mas o
total de todo mundo não existe.

O Cloudflare vai ser esse lugar que guarda. Ele recebe um aviso a cada Kadish
dito e soma. Guarda **só isto**:

> país · nussach · tipo · língua · dia · quantos

Não guarda endereço de internet, aparelho, nome nem hora. Duas pessoas do mesmo
país, no mesmo dia, no mesmo nussach, viram o número 2 — e não há como
separá-las depois. Não existe o que vazar.

**É de graça** nesta escala. O plano gratuito do Cloudflare dá 100 mil pedidos
por dia. Se o app tiver mil pessoas rezando duas vezes por dia, são 2 mil.

---

## Passo 1 — criar a conta

1. Abra **dash.cloudflare.com/sign-up**
2. E-mail e senha. Confirme pelo e-mail que chegar.
3. Se ele pedir para adicionar um site (domínio), **pule** — não precisamos.

---

## Passo 2 — criar o banco (onde os números ficam)

1. No menu da esquerda, procure **Storage & Databases** e clique em **D1 SQL Database**.
   (Em algumas contas aparece só como **D1**.)
2. Clique em **Create** (ou **Create database**).
3. Nome: **`kadish`**
4. Clique em **Create**.
5. Com o banco aberto, procure a aba **Console** (ou **Query**).
6. Cole exatamente isto e clique em **Execute** (ou **Run**):

```sql
CREATE TABLE IF NOT EXISTS contagem (
  pais    TEXT    NOT NULL,
  nussach TEXT    NOT NULL,
  tipo    TEXT    NOT NULL,
  lingua  TEXT    NOT NULL,
  dia     TEXT    NOT NULL,
  n       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (pais, nussach, tipo, lingua, dia)
);
```

Se aparecer algo como *Query executed successfully*, deu certo.
(Este mesmo texto está no arquivo `schema.sql`, aqui do lado.)

---

## Passo 3 — criar o programinha

1. No menu da esquerda: **Compute (Workers)** → **Workers & Pages**.
2. **Create** → **Start with Hello World!** (ou **Create Worker**).
3. Nome: **`contador-kadish`**
4. **Deploy** (ele publica um "olá mundo" — é só para existir).
5. Clique em **Edit code** (ou **</> Edit code**).
6. **Apague tudo** o que estiver no editor.
7. Cole o conteúdo do arquivo **`worker.js`**, que está nesta mesma pasta do
   repositório. Abra ele no GitHub, clique em **Raw**, selecione tudo, copie.
8. Clique em **Deploy** (ou **Save and deploy**).

---

## Passo 4 — ligar o programinha ao banco

Sem este passo o programinha não acha onde guardar.

1. Volte à página do Worker `contador-kadish`.
2. Aba **Settings** → **Bindings** (em algumas contas: **Variables** →
   **D1 database bindings**).
3. **Add** → escolha **D1 database**.
4. **Variable name:** `DB`  ← precisa ser exatamente `DB`, em maiúsculas.
5. **D1 database:** escolha `kadish`.
6. **Deploy** / **Save**.

---

## Passo 5 — me passar o endereço

Na página do Worker aparece um endereço parecido com:

```
https://contador-kadish.alguma-coisa.workers.dev
```

**Copie esse endereço e me mande.** Eu ponho no lugar certo, confiro que está
somando e te aviso. São dois minutos.

Se preferir fazer você mesmo: no GitHub, abra o arquivo `contador.js`, clique no
lápis, e na linha que diz

```js
const ENDERECO_GERAL = '';
```

ponha o endereço entre as aspas:

```js
const ENDERECO_GERAL = 'https://contador-kadish.alguma-coisa.workers.dev';
```

Depois **Commit changes**. Pronto — a partir daí o total geral aparece em
`contador.html`.

---

## Como saber que funcionou

1. Abra o app, escolha um Kadish e deixe o áudio **até o fim**.
2. Abra `contador.html`. A conta de cima (deste aparelho) sobe na hora.
3. O total de todo mundo, mais abaixo, deve mostrar 1 e o país **Brasil**.

Se o total geral disser "não consegui falar com o contador geral", quase sempre
é o passo 4 (o nome da variável tem que ser `DB`) ou o passo 3 (o código não foi
publicado). Me mande o print e eu digo qual dos dois é.

---

## O que fazer se você mudar de ideia

Apagar tudo é fácil: no Cloudflare, apague o Worker e o banco. E no `contador.js`,
deixe `ENDERECO_GERAL` vazio de novo — a partir daí nada mais sai de aparelho
nenhum, e a conta de cada aparelho continua funcionando como antes.

---

## O que já foi conferido, sem gastar nada

`node testar-contador.mjs` roda o mesmo programinha no computador, sobre o mesmo
SQLite que o Cloudflare usa, e prova que:

- soma certo, e soma **de forma atômica** — 100 pessoas rezando ao mesmo tempo
  dão 100, não 97;
- o país vem junto e é guardado;
- lixo é recusado: nussach inventado, língua inventada, corpo torto — nada soma;
- pedido que não vem do app não soma;
- o banco **não tem** coluna de IP, de aparelho nem de hora;
- se o banco cair, quem está rezando não percebe nada.

Isso não substitui o teste de verdade do passo "Como saber que funcionou" — mas
quer dizer que, se der errado, o problema vai estar na configuração, não no
código.
