# Como ligar a revisão direta dos rabinos — passo a passo

Hoje o rabino revisa em `revisar.html?lang=xx` e, no fim, **copia** um recado e
manda para o Erez. Ligando isto, o botão do fim vira **«Enviar as correções»**:
o recado vai sozinho para o repositório, o GitHub Actions o aplica com todas as
provas do `aplicar-revisao.mjs`, e em poucos minutos está no app.

```
rabino toca Enviar
  → revisao-kadish (Cloudflare) confere a chave e grava revisoes/fr-<dia>-<hora>.txt
  → GitHub Actions "Revisão do rabino": aplicar-revisao.mjs --confirmar + checagens
  → empurra sync/*.json → o GitHub Pages republica o kadish.app
```

Se uma prova falhar, **nada muda no app**: o recado fica em `revisoes/` como
registro e o Actions fica vermelho (o GitHub manda e-mail).

O que vale para quê (decisão do Erez, 27/10):
- **tradução** (do verso e da palavra): corrigida uma vez, vale nos 8 kadishim
  onde o texto era o mesmo;
- **transliteração**: vale só no Yatom e no DeRabanan **do mesmo nussach**.

Tudo se faz pelo navegador. São três coisas: um token do GitHub, o Worker na
Cloudflare (a conta já existe — é onde está o DNS do kadish.app) e uma linha no
`revisar.html`.

As chaves dos 6 rabinos e os 6 links prontos estão em
`revisao-cloudflare/CHAVES-E-LINKS.local.txt` — **só no computador**, nunca no
GitHub (o `.gitignore` não deixa). Quem tem o link de uma língua pode alterar o
texto dela no app.

---

## Passo 1 — o token do GitHub (é ele que deixa o Worker gravar)

1. Abra **github.com/settings/personal-access-tokens/new** (token *fine-grained*).
2. Nome: **`kadish-revisao`**. Validade: a que preferir (1 ano é razoável —
   quando vencer, o Enviar dá erro e o rabino volta a copiar).
3. **Repository access** → *Only select repositories* → **tefila-kadish**.
4. **Permissions** → *Repository permissions* → **Contents: Read and write**.
   Nada mais.
5. **Generate token** e copie. Ele só aparece uma vez.

## Passo 2 — o Worker na Cloudflare

1. **dash.cloudflare.com** → **Workers & Pages** → **Create** → **Create Worker**.
2. Nome: **`revisao-kadish`** → **Deploy**.
3. **Edit code**: apague o que estiver lá, cole o conteúdo inteiro de
   `revisao-cloudflare/worker.js` → **Deploy**.
4. **Settings** → **Variables and Secrets** → **Add**, duas vezes, as duas como
   **Secret**:
   - `GITHUB_TOKEN` = o token do passo 1;
   - `CHAVES` = a linha de `{"en":…}` do `CHAVES-E-LINKS.local.txt`, exatamente
     como está.
5. Anote o endereço do Worker, algo como
   `https://revisao-kadish.<seu-nome>.workers.dev`.

## Passo 3 — dizer ao revisar.html onde está o Worker

No `revisar.html`, a linha

```js
const ENDERECO_REVISAO = '';
```

vira

```js
const ENDERECO_REVISAO = 'https://revisao-kadish.<seu-nome>.workers.dev';
```

Commit e push. Pronto: os links do `CHAVES-E-LINKS.local.txt` passam a enviar.

## Conferir

Abra o link de uma língua, corrija uma palavra qualquer, toque em
«Enviar as correções» → «Enviar». Em seguida:
- no GitHub aparece `revisoes/<lingua>-<dia>-<hora>.txt`;
- em **Actions**, "Revisão do rabino" roda e fica verde;
- em 1–2 minutos o app mostra a palavra nova.

(Para desfazer o teste: corrija de volta pelo mesmo link.)

## Se uma chave vazar

Troque só a daquela língua no segredo `CHAVES` e mande o link novo ao rabino.
O link antigo para de gravar na hora.

## Desligar

Apague a linha do `ENDERECO_REVISAO` (volta a `''`): a página volta a ser a de
copiar e mandar. Ou apague o Worker na Cloudflare.
