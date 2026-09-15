# Como ligar o "Sua opinião" — passo a passo, pelo navegador

Dá para fazer tudo do iPad. São uns dez minutos, uma vez só.

Enquanto isto não estiver feito, **a seção não aparece no app** — de propósito:
um botão de enviar sem destino é um botão que engole a mensagem de alguém.

---

## 1. Criar a planilha

1. Abra **drive.google.com** e crie uma **Planilha** nova.
2. Dê o nome de **Kadish — opiniões**.
3. Na primeira linha, escreva estes seis títulos, um por coluna:

   `quando` · `mensagem` · `nome` · `contato` · `língua` · `versão`

## 2. Colar o programinha

1. Na planilha, menu **Extensões → Apps Script**.
2. Apague o que estiver lá e **cole o conteúdo do arquivo `Codigo.gs`** desta pasta.
3. Salve (o disquete).

## 3. Publicar

1. No alto à direita: **Implantar → Nova implantação**.
2. No tipo (a engrenagem), escolha **App da Web**.
3. Preencha:
   - **Executar como:** Eu (`erezchalom@gmail.com`)
   - **Quem pode acessar:** **Qualquer pessoa**
4. **Implantar**. O Google vai pedir autorização — aceite (é o seu próprio
   script escrevendo na sua própria planilha e mandando e-mail para você).
5. Copie o endereço que ele mostra. É uma coisa assim:

   `https://script.google.com/macros/s/AKfycb.....X/exec`

## 4. Me mandar o endereço

Só isso. Eu ponho numa linha do app (`ENDERECO_OPINIAO`) e a seção aparece.

---

## O primeiro teste, e ele importa

Depois que eu ligar, **mande uma mensagem de teste pelo próprio app** e confira
as duas coisas:

1. a tela disse **"Recebido. Obrigado por escrever."**
2. a linha apareceu na planilha e o e-mail chegou

**Se a linha chegar na planilha mas a tela disser "não deu para enviar":** me
avise. Não é defeito do seu lado — é uma peculiaridade conhecida do Apps Script
(ele responde com um desvio para outro endereço do Google, e o navegador pode
recusar ler a resposta). Nesse caso o conserto é meu, e o caminho é trocar o
destino pelo Cloudflare. **Eu não consigo testar isso daqui**: a rede deste
ambiente não alcança o Google — é a mesma cegueira que me fez errar sobre o
`kadish.app` em 13/09.

## Se um dia quiser desligar

Apague o endereço da constante `ENDERECO_OPINIAO` no `engine.html`. A seção
some da tela e nada mais muda.

## O que sai do aparelho de quem escreve

Só isto: **a mensagem, o nome, o contato, a língua e a versão do app.** Nunca
identificador de aparelho, nunca hora do aparelho, nunca nada que volte a uma
pessoa que não quis se identificar — a mesma regra do contador. E está dito na
tela, em cima do formulário, onde a pessoa escreve.
