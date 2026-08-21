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

  // ---------- Textos, nas 8 linguas ----------
  // Os avisos e o arquivo de calendario sairam so em portugues por muito tempo.
  // Quem usava o app em outra lingua recebia o alerta do celular em portugues.
  const TEXTOS = {
    pt: { anoitecer: 'O dia hebraico começa ao anoitecer. Se o falecimento foi depois do pôr do sol, a data hebraica é a do dia seguinte — confirme.',
          adarSef: 'Este ano tem dois meses de Adar. Pelo costume sefaradi marca-se no Adar II — confirme com seu rabino.',
          adarAsh: 'Este ano tem dois meses de Adar. Pelo costume ashkenazi marca-se no Adar I, e há quem marque também no Adar II — confirme com seu rabino.',
          primeiro: 'É o primeiro yahrzeit. Quando o enterro demorou, há quem conte a data do enterro em vez da do falecimento — confirme com seu rabino.',
          puxado: (d, l) => `O falecimento foi no dia ${d} do mês, e este ano o mês tem ${l} dias. A data foi puxada para o dia ${l} — confirme com seu rabino.`,
          rotulo: (d, m, a) => `${d} de ${m} de ${a}`,
          evento: 'Yahrzeit', vela: 'Acenda a vela no anoitecer da véspera e diga o Kadish com minyan.',
          av7: 'Yahrzeit em uma semana', av3: 'Yahrzeit em três dias — veja qual minyan pegar',
          avVespera: 'Yahrzeit começa ao anoitecer — acenda a vela', avHoje: 'Yahrzeit hoje — Kadish com minyan' },

    en: { anoitecer: 'The Hebrew day begins at nightfall. If the passing was after sunset, the Hebrew date is the following day — please confirm.',
          adarSef: 'This year has two months of Adar. Sephardi custom marks it in Adar II — confirm with your rabbi.',
          adarAsh: 'This year has two months of Adar. Ashkenazi custom marks it in Adar I, and some mark it in Adar II as well — confirm with your rabbi.',
          primeiro: 'This is the first yahrzeit. When the burial was delayed, some count from the burial rather than the passing — confirm with your rabbi.',
          puxado: (d, l) => `The passing was on day ${d} of the month, and this year that month has ${l} days. The date was moved to day ${l} — confirm with your rabbi.`,
          rotulo: (d, m, a) => `${d} ${m} ${a}`,
          evento: 'Yahrzeit', vela: 'Light the candle at nightfall the evening before and say Kaddish with a minyan.',
          av7: 'Yahrzeit in one week', av3: 'Yahrzeit in three days — find your minyan',
          avVespera: 'Yahrzeit begins at nightfall — light the candle', avHoje: 'Yahrzeit today — Kaddish with a minyan' },

    es: { anoitecer: 'El día hebreo comienza al anochecer. Si el fallecimiento fue después de la puesta del sol, la fecha hebrea es la del día siguiente — confirme.',
          adarSef: 'Este año tiene dos meses de Adar. Por la costumbre sefaradí se marca en Adar II — confirme con su rabino.',
          adarAsh: 'Este año tiene dos meses de Adar. Por la costumbre ashkenazí se marca en Adar I, y hay quien lo marca también en Adar II — confirme con su rabino.',
          primeiro: 'Es el primer yahrzeit. Cuando el entierro se demoró, hay quien cuenta la fecha del entierro en lugar de la del fallecimiento — confirme con su rabino.',
          puxado: (d, l) => `El fallecimiento fue el día ${d} del mes, y este año el mes tiene ${l} días. La fecha se corrió al día ${l} — confirme con su rabino.`,
          rotulo: (d, m, a) => `${d} de ${m} de ${a}`,
          evento: 'Yahrzeit', vela: 'Encienda la vela al anochecer de la víspera y diga el Kadish con minián.',
          av7: 'Yahrzeit en una semana', av3: 'Yahrzeit en tres días — vea a qué minián ir',
          avVespera: 'El Yahrzeit comienza al anochecer — encienda la vela', avHoje: 'Yahrzeit hoy — Kadish con minián' },

    fr: { anoitecer: 'Le jour hébraïque commence à la tombée de la nuit. Si le décès a eu lieu après le coucher du soleil, la date hébraïque est celle du lendemain — à confirmer.',
          adarSef: 'Cette année compte deux mois d’Adar. Selon la coutume séfarade, on le marque en Adar II — confirmez avec votre rabbin.',
          adarAsh: 'Cette année compte deux mois d’Adar. Selon la coutume achkénaze, on le marque en Adar I, et certains le marquent aussi en Adar II — confirmez avec votre rabbin.',
          primeiro: 'C’est le premier yahrzeit. Lorsque l’enterrement a tardé, certains comptent à partir de l’enterrement plutôt que du décès — confirmez avec votre rabbin.',
          puxado: (d, l) => `Le décès a eu lieu le ${d} du mois, et cette année ce mois compte ${l} jours. La date a été ramenée au ${l} — confirmez avec votre rabbin.`,
          rotulo: (d, m, a) => `${d} ${m} ${a}`,
          evento: 'Yahrzeit', vela: 'Allumez la bougie à la tombée de la nuit la veille et dites le Kaddish avec un minyan.',
          av7: 'Yahrzeit dans une semaine', av3: 'Yahrzeit dans trois jours — repérez votre minyan',
          avVespera: 'Le Yahrzeit commence à la tombée de la nuit — allumez la bougie', avHoje: 'Yahrzeit aujourd’hui — Kaddish avec un minyan' },

    it: { anoitecer: 'Il giorno ebraico comincia al calar della sera. Se il decesso è avvenuto dopo il tramonto, la data ebraica è quella del giorno seguente — da confermare.',
          adarSef: 'Quest’anno ha due mesi di Adar. Secondo l’uso sefardita si osserva in Adar II — confermi con il suo rabbino.',
          adarAsh: 'Quest’anno ha due mesi di Adar. Secondo l’uso ashkenazita si osserva in Adar I, e alcuni lo osservano anche in Adar II — confermi con il suo rabbino.',
          primeiro: 'È il primo yahrzeit. Quando la sepoltura ha tardato, alcuni contano dalla sepoltura anziché dal decesso — confermi con il suo rabbino.',
          puxado: (d, l) => `Il decesso è avvenuto il giorno ${d} del mese, e quest’anno il mese ha ${l} giorni. La data è stata spostata al giorno ${l} — confermi con il suo rabbino.`,
          rotulo: (d, m, a) => `${d} di ${m} ${a}`,
          evento: 'Yahrzeit', vela: 'Accenda la candela al calar della sera della vigilia e dica il Kaddish con il minyan.',
          av7: 'Yahrzeit fra una settimana', av3: 'Yahrzeit fra tre giorni — veda a quale minyan andare',
          avVespera: 'Lo Yahrzeit comincia al calar della sera — accenda la candela', avHoje: 'Yahrzeit oggi — Kaddish con il minyan' },

    de: { anoitecer: 'Der jüdische Tag beginnt bei Einbruch der Nacht. War der Todesfall nach Sonnenuntergang, ist das hebräische Datum das des folgenden Tages — bitte prüfen.',
          adarSef: 'Dieses Jahr hat zwei Adar-Monate. Nach sefardischem Brauch wird im Adar II begangen — klären Sie es mit Ihrem Rabbiner.',
          adarAsh: 'Dieses Jahr hat zwei Adar-Monate. Nach aschkenasischem Brauch wird im Adar I begangen, manche begehen ihn auch im Adar II — klären Sie es mit Ihrem Rabbiner.',
          primeiro: 'Es ist der erste Jahrzeit. Verzögerte sich die Beerdigung, zählen manche vom Tag der Beerdigung statt vom Todestag — klären Sie es mit Ihrem Rabbiner.',
          puxado: (d, l) => `Der Todesfall war am ${d}. des Monats, und dieser Monat hat in diesem Jahr ${l} Tage. Das Datum wurde auf den ${l}. gelegt — klären Sie es mit Ihrem Rabbiner.`,
          rotulo: (d, m, a) => `${d}. ${m} ${a}`,
          evento: 'Jahrzeit', vela: 'Zünden Sie die Kerze am Vorabend bei Einbruch der Nacht an und sagen Sie Kaddisch mit einem Minjan.',
          av7: 'Jahrzeit in einer Woche', av3: 'Jahrzeit in drei Tagen — suchen Sie Ihren Minjan',
          avVespera: 'Der Jahrzeit beginnt bei Einbruch der Nacht — zünden Sie die Kerze an', avHoje: 'Jahrzeit heute — Kaddisch mit einem Minjan' },

    ru: { anoitecer: 'Еврейские сутки начинаются с наступлением темноты. Если смерть наступила после захода солнца, еврейская дата — следующий день; уточните.',
          adarSef: 'В этом году два месяца адар. По сефардскому обычаю отмечают в адаре II — уточните у своего раввина.',
          adarAsh: 'В этом году два месяца адар. По ашкеназскому обычаю отмечают в адаре I, а некоторые — также в адаре II. Уточните у своего раввина.',
          primeiro: 'Это первый йорцайт. Если погребение задержалось, некоторые считают от дня погребения, а не от дня смерти — уточните у своего раввина.',
          puxado: (d, l) => `Смерть пришлась на ${d}-й день месяца, а в этом году в месяце ${l} дней. Дата перенесена на ${l}-й день — уточните у своего раввина.`,
          rotulo: (d, m, a) => `${d} ${m} ${a}`,
          evento: 'Йорцайт', vela: 'Зажгите свечу накануне с наступлением темноты и прочтите кадиш с миньяном.',
          av7: 'Йорцайт через неделю', av3: 'Йорцайт через три дня — найдите миньян',
          avVespera: 'Йорцайт начинается с наступлением темноты — зажгите свечу', avHoje: 'Йорцайт сегодня — кадиш с миньяном' },

    he: { anoitecer: 'היום העברי מתחיל בצאת הכוכבים. אם הפטירה הייתה לאחר השקיעה, התאריך העברי הוא של היום שלמחרת — נא לאמת.',
          adarSef: 'בשנה זו שני חודשי אדר. לפי מנהג הספרדים מציינים באדר ב׳ — לברר עם הרב.',
          adarAsh: 'בשנה זו שני חודשי אדר. לפי מנהג האשכנזים מציינים באדר א׳, ויש המציינים גם באדר ב׳ — לברר עם הרב.',
          primeiro: 'זהו היארצייט הראשון. כאשר הקבורה התאחרה, יש המונים מיום הקבורה ולא מיום הפטירה — לברר עם הרב.',
          puxado: (d, l) => `הפטירה חלה ב-${d} בחודש, ובשנה זו לחודש ${l} ימים. התאריך הוסט ליום ${l} — לברר עם הרב.`,
          rotulo: (d, m, a) => `${d} ב${m} ${a}`,
          evento: 'יארצייט', vela: 'הדליקו נר בצאת הכוכבים בערב שלפני, ואמרו קדיש במניין.',
          av7: 'יארצייט בעוד שבוע', av3: 'יארצייט בעוד שלושה ימים — בדקו לאיזה מניין להגיע',
          avVespera: 'היארצייט מתחיל בצאת הכוכבים — הדליקו נר', avHoje: 'יארצייט היום — קדיש במניין' }
  };
  const textos = lingua => TEXTOS[lingua] || TEXTOS.pt;

  /**
   * @param {Date} falecimento  data civil do falecimento
   * @param {string} nussach    ashkenaz | chabad | sefard | sefaradi
   * @param {Date} [hoje]
   * @returns {{data:Date, hebraico:object, rotulo:string, primeiroAno:boolean, avisos:string[]}}
   */
  function proximoYahrzeit(falecimento, nussach, hoje, lingua) {
    hoje = hoje || new Date();
    const T = textos(lingua);
    const regra = REGRA[nussach] || 'ashkenazi';
    const morte = H.deData(falecimento);
    const avisos = [];

    avisos.push(T.anoitecer);

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
        avisos.push(regra === 'sefaradi' ? T.adarSef : T.adarAsh);
      }
      if (primeiroAno) {
        avisos.push(T.primeiro);
      }
      if (ajustouDia) {
        avisos.push(T.puxado(morte.dia, limite));
      }

      return { data, hebraico: { ano, mes, dia },
               rotulo: T.rotulo(lingua === 'he' ? H.gematria(dia) : dia,
                                H.nomeMes(ano, mes, lingua),
                                lingua === 'he' ? H.gematria(ano) : ano),
               primeiroAno, avisos };
    }
    return null;
  }

  /** Lista os proximos N yahrzeits, para o arquivo de calendario. */
  function proximos(falecimento, nussach, quantos, hoje, lingua) {
    const saida = [];
    let cursor = hoje || new Date();
    for (let i = 0; i < (quantos || 20); i++) {
      const y = proximoYahrzeit(falecimento, nussach, cursor, lingua);
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
  function gerarICS(falecimento, nussach, nome, quantos, lingua) {
    const T = textos(lingua);
    const lista = proximos(falecimento, nussach, quantos || 20, null, lingua);
    const l = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tefila Kadish//Yahrzeit//PT',
               'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    lista.forEach((y, i) => {
      const fim = new Date(y.data.getTime() + 86400000);
      const titulo = `${T.evento}${nome ? ' · ' + nome : ''}`;
      l.push('BEGIN:VEVENT');
      l.push(`UID:yahrzeit-${paraICS(y.data)}-${i}@tefila-kadish`);
      l.push(`DTSTART;VALUE=DATE:${paraICS(y.data)}`);
      l.push(`DTEND;VALUE=DATE:${paraICS(fim)}`);
      l.push(`SUMMARY:${titulo}`);
      l.push(`DESCRIPTION:${y.rotulo}. ${T.vela}${y.avisos.length ? ' — ' + y.avisos.join(' ') : ''}`);
      // uma semana antes, tres dias antes, tarde da vespera, manha do dia
      [['-P7D', T.av7], ['-P3D', T.av3],
       ['-PT8H', T.avVespera], ['PT8H', T.avHoje]].forEach(([quando, texto]) => {
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
