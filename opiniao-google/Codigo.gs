/**
 * Codigo.gs — o destino do "Sua opiniao" do app (15/09).
 *
 * O app (engine.html, constante ENDERECO_OPINIAO) manda um POST com um JSON
 * curto. Este script escreve uma linha numa planilha do Google Drive DO EREZ e
 * manda um e-mail para ele a cada mensagem. Nada mais.
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
 */

function doPost(e) {
  var dados = {};
  try { dados = JSON.parse(e.postData.contents); } catch (x) {}

  var msg = String(dados.mensagem || '').slice(0, 2000).trim();
  // Sem mensagem nao ha o que guardar. Responder 400 faz o app dizer, em
  // portugues, que nao deu — em vez de agradecer por nada.
  if (!msg) return responder(400, 'sem mensagem');

  var nome    = String(dados.nome    || '').slice(0, 120).trim();
  var contato = String(dados.contato || '').slice(0, 120).trim();
  var lingua  = String(dados.lingua  || '').slice(0, 8).trim();
  var versao  = String(dados.versao  || '').slice(0, 40).trim();

  var folha = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  folha.appendRow([new Date(), msg, nome, contato, lingua, versao]);

  // O e-mail e o que faz isto servir a quem le no iPad: a mensagem chega na
  // caixa de entrada e se responde dali. Se o envio falhar (cota do Google,
  // por exemplo), a LINHA JA ESTA GRAVADA — entao nao se perde nada, e por
  // isso o e-mail vai depois do appendRow e dentro de um try.
  try {
    var aviso = {
      to: Session.getEffectiveUser().getEmail(),
      subject: 'Kadish.app — mensagem de ' + (nome || 'alguem'),
      body: msg + '\n\n---\n' +
            'nome: '    + (nome    || '(nao disse)') + '\n' +
            'contato: ' + (contato || '(nao quis resposta)') + '\n' +
            'lingua: '  + lingua + '   versao do app: ' + versao
    };
    // "Responder" no e-mail vai direto para quem escreveu, quando ela deixou um
    // e-mail. A chave so entra se houver um de verdade: posta vazia, o MailApp
    // reclama e o aviso inteiro se perde.
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contato)) aviso.replyTo = contato;
    MailApp.sendEmail(aviso);
  } catch (x) {}

  return responder(200, 'ok');
}

// O app so agradece se a resposta for 2xx — entao esta funcao e o que decide o
// que aparece na tela de quem escreveu. Nunca devolver 200 para o que nao foi
// gravado.
function responder(codigo, texto) {
  // O Apps Script nao deixa escolher o codigo HTTP: qualquer saida normal vai
  // como 200. Por isso o "erro" aqui e um erro DE VERDADE, lancado, que o
  // Google devolve como 5xx — e e assim que o app fica sabendo.
  if (codigo >= 400) throw new Error(texto);
  return ContentService.createTextOutput(texto).setMimeType(ContentService.MimeType.TEXT);
}

function doGet() {
  return ContentService.createTextOutput('Kadish.app — destino das mensagens. Use POST.');
}
