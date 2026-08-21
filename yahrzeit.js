/**
 * yahrzeit.js — quando cai o yahrzeit, e os avisos.
 *
 * A conta da data esta em hebraico.js. Aqui esta a parte que NAO e conta: qual
 * data vale, e isso depende do nussach e, em alguns casos, do rabino.
 *
 * O que a pesquisa mostrou, e que esta implementado:
 *
 *  - Adar em ano bissexto. Se a pessoa faleceu num Adar de ano comum e o ano
 *    corrente e bissexto (tem Adar I e Adar II), as tradicoes DISCORDAM:
 *    Ashkenazi marca no Adar I (e de preferencia tambem no Adar II);
 *    Sefaradi marca no Adar II. Sao respostas opostas.
 *
 *  - Primeiro ano. Ha discussao se conta a data do falecimento ou a do enterro
 *    quando o enterro demorou. Do segundo ano em diante e sempre o falecimento.
 *    Nao temos a data do enterro, entao o primeiro ano sai marcado como duvida.
 *
 *  - O dia hebraico comeca ao ANOITECER. Quem faleceu depois do por do sol
 *    faleceu, no calendario hebraico, no dia seguinte. Nao temos a hora, entao
 *    isso tambem sai como aviso.
 *
 * Em todo caso duvidoso o app mostra a data E o aviso. A maquina calcula; o
 * rabino decide. E a mesma regra que vale para o texto liturgico neste projeto.
 */
(function (raiz) {
  const H = raiz.Hebraico || (typeof require !== 'undefined' ? require('./hebraico.js') : null);

  // Nusach Sefard e de origem askenazi (chassidico); Sefaradi e que segue o
  // costume sefaradi. Vale confirmar com o rabino.
  const REGRA = { ashkenaz: 'ashkenazi', chabad: 'ashkenazi', sefard: 'ashkenazi', sefaradi: 'sefaradi' };

  /**
   * @param {Date} falecimento  data civil do falecimento
   * @param {string} nussach    ashkenaz | chabad | sefard | sefaradi
   * @param {Date} [hoje]
   * @returns {{data:Date, hebraico:object, rotulo:string, primeiroAno:boolean, avisos:string[]}}
   */
  function proximoYahrzeit(falecimento, nussach, hoje) {
    hoje = hoje || new Date();
    const regra = REGRA[nussach] || 'ashkenazi';
    const morte = H.deData(falecimento);
    const avisos = [];

    avisos.push('O dia hebraico começa ao anoitecer. Se o falecimento foi depois do ' +
                'pôr do sol, a data hebraica é a do dia seguinte — confirme.');

    const hojeAbs = H.absolutoDeGregoriano(hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate());
    const anoHoje = H.deData(hoje).ano;

    for (let ano = anoHoje; ano <= anoHoje + 3; ano++) {
      let mes = morte.mes, dia = morte.dia;
      const morteEmAdarComum = (morte.mes === 12 && !H.ehBissexto(morte.ano));
      const alvoBissexto = H.ehBissexto(ano);

      if (morteEmAdarComum && alvoBissexto) {
        mes = (regra === 'sefaradi') ? 13 : 12;   // Sefaradi: Adar II · Ashkenazi: Adar I
      } else if (!alvoBissexto && (morte.mes === 12 || morte.mes === 13)) {
        mes = 12;                                  // dos dois Adar para o Adar unico
      }

      // dia 30 num mes que so tem 29 naquele ano
      const limite = H.diasNoMes(ano, mes);
      let ajustouDia = false;
      if (dia > limite) { dia = limite; ajustouDia = true; }

      const abs = H.absolutoDeHebraico(ano, mes, dia);
      if (abs < hojeAbs) continue;                 // ja passou neste ano

      const g = H.gregorianoDeAbsoluto(abs);
      const data = new Date(g.ano, g.mes - 1, g.dia);
      const primeiroAno = (ano === morte.ano + 1);

      if (morteEmAdarComum && alvoBissexto) {
        avisos.push(regra === 'sefaradi'
          ? 'Este ano tem dois meses de Adar. Pelo costume sefaradi marca-se no Adar II — confirme com seu rabino.'
          : 'Este ano tem dois meses de Adar. Pelo costume ashkenazi marca-se no Adar I, e há quem marque também no Adar II — confirme com seu rabino.');
      }
      if (primeiroAno) {
        avisos.push('É o primeiro yahrzeit. Quando o enterro demorou, há quem conte a ' +
                    'data do enterro em vez da do falecimento — confirme com seu rabino.');
      }
      if (ajustouDia) {
        avisos.push(`O falecimento foi no dia ${morte.dia} do mês, e este ano o mês tem ` +
                    `${limite} dias. A data foi puxada para o dia ${limite} — confirme com seu rabino.`);
      }

      return { data, hebraico: { ano, mes, dia },
               rotulo: `${dia} de ${H.nomeMes(ano, mes)} de ${ano}`,
               primeiroAno, avisos };
    }
    return null;
  }

  /** Lista os proximos N yahrzeits, para o arquivo de calendario. */
  function proximos(falecimento, nussach, quantos, hoje) {
    const saida = [];
    let cursor = hoje || new Date();
    for (let i = 0; i < (quantos || 20); i++) {
      const y = proximoYahrzeit(falecimento, nussach, cursor);
      if (!y) break;
      saida.push(y);
      cursor = new Date(y.data.getTime() + 86400000);   // procura a partir do dia seguinte
    }
    return saida;
  }

  const doisDig = n => String(n).padStart(2, '0');
  const paraICS = d => `${d.getFullYear()}${doisDig(d.getMonth() + 1)}${doisDig(d.getDate())}`;

  /**
   * Arquivo .ics com os proximos yahrzeits e QUATRO avisos em cada um.
   *
   * Por que arquivo de calendario e nao aviso do navegador: aviso de navegador
   * no iPhone so funciona se a pessoa adicionar o app a tela de inicio, e para
   * de valer se ela limpar os dados. O calendario do telefone avisa sempre,
   * inclusive com o telefone no silencioso e sem internet.
   */
  function gerarICS(falecimento, nussach, nome, quantos) {
    const lista = proximos(falecimento, nussach, quantos || 20);
    const l = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tefila Kadish//Yahrzeit//PT',
               'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    lista.forEach((y, i) => {
      const fim = new Date(y.data.getTime() + 86400000);
      const titulo = `Yahrzeit${nome ? ' · ' + nome : ''}`;
      l.push('BEGIN:VEVENT');
      l.push(`UID:yahrzeit-${paraICS(y.data)}-${i}@tefila-kadish`);
      l.push(`DTSTART;VALUE=DATE:${paraICS(y.data)}`);
      l.push(`DTEND;VALUE=DATE:${paraICS(fim)}`);
      l.push(`SUMMARY:${titulo}`);
      l.push(`DESCRIPTION:${y.rotulo}. Acenda a vela no anoitecer da véspera e ` +
             `diga o Kadish com minyan.${y.avisos.length ? ' — ' + y.avisos.join(' ') : ''}`);
      // uma semana antes, tres dias antes, tarde da vespera, manha do dia
      [['-P7D', 'Yahrzeit em uma semana'],
       ['-P3D', 'Yahrzeit em tres dias — veja qual minyan pegar'],
       ['-PT8H', 'Yahrzeit comeca ao anoitecer — acenda a vela'],
       ['PT8H', 'Yahrzeit hoje — Kadish com minyan']].forEach(([quando, texto]) => {
        l.push('BEGIN:VALARM', 'ACTION:DISPLAY', `TRIGGER:${quando}`, `DESCRIPTION:${texto}`, 'END:VALARM');
      });
      l.push('END:VEVENT');
    });
    l.push('END:VCALENDAR');
    return l.join('\r\n') + '\r\n';
  }

  const api = { proximoYahrzeit, proximos, gerarICS, REGRA };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  raiz.Yahrzeit = api;
})(typeof window !== 'undefined' ? window : globalThis);
