# Contador de Kadishim — o que já funciona e a decisão que falta

Pedido: "gostaria de incluir um contador de quantos kadishim fez (oculto para o
cliente) e um geral total, por país, por língua".

São duas coisas bem diferentes. **A primeira já está pronta e funcionando. A
segunda depende de uma decisão sua, porque custa dinheiro ou custa privacidade.**

---

## 1. A conta de cada aparelho — pronta

Está no ar. Fica no próprio celular ou iPad de quem reza, não sai dali, não passa
por servidor nenhum, não identifica ninguém.

- Um Kadish só conta quando a pessoa **chega ao fim** — o áudio precisa passar de
  90% do último verso. Abrir e fechar não conta. Ouvir de novo conta de novo.
- Guarda: total, por nussach, por tipo, por língua da tela, e por dia.
- **Não aparece nada na tela do app.** Quem reza não vê contador nenhum.
- Para você ver: abra **`contador.html`** (é o endereço do app com
  `/contador.html` no fim). Tem também um botão para zerar.

Testado no navegador: rezei um chabad yatom em português e um sefard deRabanan
em alemão, e a página mostrou os dois, separados certo.

**O limite honesto:** é a conta *daquele aparelho*. Se você abrir o app no seu
iPad e no seu celular, são duas contas separadas. E você não enxerga a conta de
outras pessoas.

---

## 2. O total geral, por país e por língua — falta decidir

O GitHub Pages só entrega arquivo. Ele não tem onde guardar nada. Para somar o
que acontece nos aparelhos de todo mundo, é preciso um serviço fora — algum lugar
que receba um aviso a cada Kadish e vá somando.

O código de envio **já está escrito e desligado**. Enquanto ninguém puser um
endereço em `contador.js` (na linha `ENDERECO_GERAL`), nada é enviado para lugar
nenhum. Ligar é trocar uma linha.

### As opções

| | O que é | Custo | Dá o país? | Privacidade |
|---|---|---|---|---|
| **A. Cloudflare Worker** *(recomendo)* | Um programinha de 20 linhas que só soma. Você cria conta grátis. | R$ 0 até 100 mil avisos por dia | Sim, o próprio Cloudflare informa | A melhor: guardamos só números, nunca quem |
| **B. Google Analytics** | Pôr o código do Google no app | R$ 0 | Sim | A pior: o Google passa a ver quem reza, de onde, quando |
| **C. Plausible / Umami** | Serviço de estatística sem rastreio | ~R$ 50/mês (ou você hospeda) | Sim | Boa: não usa cookie, não segue a pessoa |
| **D. Não fazer** | Fica só a conta de cada aparelho | R$ 0 | — | Perfeita |

### O que eu recomendo, e por quê

**A opção A.** Motivos:

1. É grátis de verdade na escala deste app.
2. O país vem de graça — o Cloudflare já sabe de onde veio o pedido, sem precisar
   perguntar nada a ninguém nem instalar rastreador.
3. **Guarda só contagem.** Chegam três informações — nussach, tipo, língua — e um
   número sobe. Não há nome, não há aparelho identificado, não há como voltar
   atrás e descobrir quem rezou. Num app de Kadish isso me parece o que importa:
   a pessoa está num momento de luto, não é hora de ser medida.
4. O trabalho é pequeno: criar a conta, colar o programinha, copiar o endereço
   para o `contador.js`.

**Contra a opção B:** o Google Analytics resolveria em cinco minutos, mas passaria
a acompanhar cada pessoa que abre o app — de onde é, que aparelho usa, quando reza
e por quanto tempo — e a guardar isso nos servidores dele. Num app de reza para
enlutados, acho que não vale.

### O que preciso de você

Só a resposta: **A, B, C ou D**. Se for A, eu escrevo o programinha do Cloudflare
e o passo a passo de onde clicar — você só precisa criar a conta (é de graça e
leva uns cinco minutos) e me passar o endereço que ele gerar.

---

## O que NÃO foi feito, de propósito

- Nada é enviado hoje. Nem um byte.
- Não há contador visível na tela de quem reza.
- Não há cookie, não há identificador de aparelho, não há nome.
