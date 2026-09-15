/**
 * Codigo.gs — o destino do "Sua opiniao" do app (15/09).
 *
 * O app (engine.html, constante ENDERECO_OPINIAO) manda um POST com um JSON
 * curto. Este script escreve uma linha na planilha "Kadish — opinioes" do Drive
 * do Erez e manda um e-mail para ele a cada mensagem. Nada mais.
 *
 * ESTE CODIGO EXISTE EM DOIS LUGARES, e isso e uma divida, nao um plano: aqui
 * e no documento "Kadish — programinha para colar no Apps Script", no Drive
 * dele, que e de onde ele copia pelo iPad. AS LINHAS DE CODIGO DOS DOIS SAO
 * IGUAIS (conferido: mesmas 28 linhas, JavaScript valido, zero aspas tortas —
 * aspa torta e o unico jeito de isto quebrar calado). Mexeu num, mexe no outro.
 *
 * O QUE ELE GUARDA, e a lista e curta de proposito:
 *   quando · mensagem · nome · contato · lingua · versao do app
 *
 * NUNCA acrescentar IP, identificador de aparelho, ou qualquer coisa que volte
 * a uma pessoa que nao quis se identificar. E a mesma regra do worker do
 * contador, e e a razao de ter sido escolhido em vez do Google Analytics.
 *
 * O Content-Type que o app manda e text/plain (com o corpo em JSON), e isso
 * NAO e descuido: application/json obrigaria o navegador a pedir permissao
 * antes (preflight OPTIONS), e o Apps Script nao responde a esse pedido — a
 * mensagem morreria sem nunca chegar, calada.
 *
 * E o `throw` da mensagem vazia nao e desleixo: o Apps Script nao deixa
 * escolher o codigo HTTP, entao um erro LANCADO e o unico jeito de a resposta
 * sair como 5xx. E e disso que o app precisa — ele so agradece depois de um
 * 2xx de verdade, e o que nao chegou nunca pode aparecer como "recebido".
 */
function doPost(e) {
  var dados = {};
  try { dados = JSON.parse(e.postData.contents); } catch (x) {}

  var msg = String(dados.mensagem || '').slice(0, 2000).trim();
  if (!msg) throw new Error('sem mensagem');

  var nome    = String(dados.nome    || '').slice(0, 120).trim();
  var contato = String(dados.contato || '').slice(0, 120).trim();
  var lingua  = String(dados.lingua  || '').slice(0, 8).trim();
  var versao  = String(dados.versao  || '').slice(0, 40).trim();

  var folha = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  folha.appendRow([new Date(), msg, nome, contato, lingua, versao]);

  // O e-mail e o que faz isto servir a quem le no iPad: a mensagem chega na
  // caixa de entrada e se responde dali. Vai DEPOIS do appendRow e dentro de um
  // try: se o envio falhar (cota do Google, por exemplo), a linha ja esta
  // gravada e nao se perde nada.
  try {
    var aviso = {
      to: Session.getEffectiveUser().getEmail(),
      subject: 'Kadish.app - mensagem de ' + (nome || 'alguem'),
      body: msg + '\n\n---\n' +
            'nome: '    + (nome    || '(nao disse)') + '\n' +
            'contato: ' + (contato || '(nao quis resposta)') + '\n' +
            'lingua: '  + lingua + '   versao do app: ' + versao
    };
    // "Responder" vai direto para quem escreveu, quando ela deixou um e-mail.
    // A chave so entra se houver um de verdade: posta vazia, o MailApp reclama
    // e o aviso inteiro se perde.
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contato)) aviso.replyTo = contato;
    MailApp.sendEmail(aviso);
  } catch (x) {}

  return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
}

function doGet() {
  return ContentService.createTextOutput('Kadish.app - destino das mensagens. Use POST.');
}
