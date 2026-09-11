# Como pegar o `kadish.app` — passo a passo, pelo iPad

Escrito em 11/09/2026, quando o Erez decidiu por domínio próprio.
O endereço de hoje é `erezchalom-a18y.github.io/tefila-kadish`, e a parte antes
do `.github.io` é o nome de usuário dele. Com domínio próprio o endereço passa a
ser **dele**: se um dia sairmos do GitHub, os panfletos pendurados nas sinagogas
continuam funcionando.

**Você faz a PARTE 1 (comprar). Eu faço a PARTE 2 e a PARTE 3.**
Não compre nada antes de ler a caixa "Antes de comprar", logo abaixo.

---

## Antes de comprar — três coisas, e a terceira é a que dói

1. **Confira o nome na hora.** Eu pesquisei em 10/09 e o `kadish.app` não tinha
   rastro nenhum — mas isso é indício, não prova: um domínio pode estar
   registrado e parado. Quem diz a verdade é a tela do registrador no instante
   da compra.

2. **Renovação, não o primeiro ano.** Muitos vendem o primeiro ano por US$ 1 e
   renovam por US$ 40. Olhe o preço da RENOVAÇÃO antes de fechar. O `.app`
   custa uns **US$ 14 por ano**, e é esse número que tem de se repetir.

3. **É por ANO, para sempre.** Se um dia ninguém pagar, o endereço cai e alguém
   pode comprá-lo — e aí os panfletos da parede levam a pessoa para outro lugar
   qualquer. Ligue a **renovação automática** e use um cartão que não vença.

---

## PARTE 1 — comprar (você, uns 10 minutos)

Recomendo a **Cloudflare**, por dois motivos concretos: ela vende a preço de
custo (não infla a renovação) e você já vai criar conta lá para o contador de
Kadishim — fica tudo num lugar só. Qualquer outro registrador serve; o que muda
são as telas.

1. Abra **dash.cloudflare.com** e crie a conta (e-mail e senha).
2. No menu, **Domain Registration → Register Domain**.
3. Digite **kadish.app** e veja o que a tela diz.
   - **Disponível** → siga.
   - **Indisponível** → tente, nesta ordem: `kadishapp.com` · `kadish.online` ·
     `okadish.com` · `kadish.me`. Todos estavam livres em 10/09.
4. Pague com cartão. **Deixe a renovação automática LIGADA.**
5. Quando terminar, **me mande o nome exato que você comprou.** Só isso — não
   mexa em mais nada. O resto é meu.

> **O `.app` obriga HTTPS**, e isso é bom: o navegador se recusa a abrir a
> página sem o cadeado. O GitHub emite o certificado sozinho e de graça; só
> demora alguns minutos.

---

## PARTE 2 — ligar o endereço ao app (eu, no mesmo dia)

Faço tudo daqui, e é pouco:

1. Crio o arquivo `CNAME` no repositório, com o nome que você comprou dentro.
2. No painel do GitHub (Settings → Pages) o domínio entra no campo *Custom
   domain* e marco **Enforce HTTPS**.
3. No registrador entram quatro endereços de servidor do GitHub e um apontador
   para o `www`. É a única parte em que eu preciso do seu acesso — ou você me
   segue no ⚙ da Cloudflare e eu digito, ou eu te mando os cinco valores para
   colar. Não há segredo nenhum neles.

**O endereço antigo não morre.** O GitHub passa a redirecionar o
`erezchalom-a18y.github.io/tefila-kadish` para o novo, sozinho — quem já tem o
link, ou já pôs o ícone na tela do telefone, não se perde.

---

## PARTE 3 — refazer o QR e os panfletos (eu, um comando)

O código de barras e o endereço andam juntos. Assim que o domínio estiver de pé:

```
node gerar-qr.mjs          # o QR novo, lido de volta para provar que serve
node gerar-panfleto.mjs    # os 8 panfletos, com o QR novo dentro
```

O `gerar-panfleto.mjs` **lê o código de dentro de cada PDF, a 200 dpi**, e se
recusa a gravar se ele não devolver o endereço certo. Um QR quebrado só se
descobre com a folha já pendurada — e ali ninguém avisa, as pessoas só não
entram.

---

## Enquanto isso: NÃO imprima e pendure

É a única coisa que peço. Papel na parede da sinagoga ninguém troca, e o QR de
hoje aponta para o endereço antigo. Faltam poucos dias; depois disso imprima à
vontade.
