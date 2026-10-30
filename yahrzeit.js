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
    pt: { anoitecer: "Não temos certeza da data hebraica: se o falecimento foi depois do pôr do sol, o yahrzeit cai um dia depois. Confirme com um rabino, ou complete o cadastro.",
          adarSef: 'Este ano tem dois meses de Adar. Pelo costume sefaradi marca-se no Adar II — confirme com seu rabino.',
          adarAsh: 'Este ano tem dois meses de Adar. Pelo costume ashkenazi marca-se no Adar I, e há quem marque também no Adar II — confirme com seu rabino.',
          primeiro: 'É o primeiro yahrzeit. Quando o enterro demorou, há quem conte a data do enterro em vez da do falecimento — confirme com seu rabino.',
          puxado: (d, l) => `O falecimento foi no dia ${d} do mês, e este ano o mês tem ${l} dias. A data foi puxada para o dia ${l} — confirme com seu rabino.`,
          rotulo: (d, m, a) => `${d} de ${m} de ${a}`,
          evento: 'Yahrzeit', vela: 'Acenda a vela no anoitecer da véspera e diga o Kadish com minyan.',
          av7: 'Yahrzeit em uma semana', av3: 'Yahrzeit em três dias — veja qual minyan pegar',
          avVespera: 'Yahrzeit começa ao anoitecer — acenda a vela', avHoje: 'Yahrzeit hoje — Kadish com minyan',
          periodo: "da noite de {v}, até {d}", velaNormal: "🕯 Acenda a vela ao pôr do sol de {v}, e deixe-a acesa até o anoitecer de {d}.", velaAntes: "🕯 O yahrzeit começa durante o {n}, e no {n} não se acende. Acenda a vela antes do pôr do sol de {v}, antes das velas de {n}, e use uma vela que dure até o anoitecer de {d}.", velaDepois: "🕯 O yahrzeit começa na saída do {n}, e no {n} não se acende. Acenda a vela só depois que o {n} terminar, na noite de {v}, e deixe-a acesa até o anoitecer de {d}.", kadish: "O Kadish é dito com minyan da noite de {v}, até a tarde de {d}.", shabat: "Shabat", yomtov: "Yom Tov", ambos: "Shabat e Yom Tov" },

    en: { anoitecer: "We are not sure of the Hebrew date: if the passing was after sunset, the yahrzeit falls one day later. Please confirm with a rabbi, or complete the entry.",
          adarSef: 'This year has two months of Adar. Sephardi custom marks it in Adar II — confirm with your rabbi.',
          adarAsh: 'This year has two months of Adar. Ashkenazi custom marks it in Adar I, and some mark it in Adar II as well — confirm with your rabbi.',
          primeiro: 'This is the first yahrzeit. When the burial was delayed, some count from the burial rather than the passing — confirm with your rabbi.',
          puxado: (d, l) => `The passing was on day ${d} of the month, and this year that month has ${l} days. The date was moved to day ${l} — confirm with your rabbi.`,
          rotulo: (d, m, a) => `${d} ${m} ${a}`,
          evento: 'Yahrzeit', vela: 'Light the candle at nightfall the evening before and say Kaddish with a minyan.',
          av7: 'Yahrzeit in one week', av3: 'Yahrzeit in three days — find your minyan',
          avVespera: 'Yahrzeit begins at nightfall — light the candle', avHoje: 'Yahrzeit today — Kaddish with a minyan',
          periodo: "from the evening of {v}, until {d}", velaNormal: "🕯 Light the candle at sunset on {v}, and let it burn until nightfall on {d}.", velaAntes: "🕯 The yahrzeit begins during {n}, and no candle is lit on {n}. Light it before sunset on {v}, before the {n} candles, and use a candle that lasts until nightfall on {d}.", velaDepois: "🕯 The yahrzeit begins as {n} ends, and no candle is lit on {n}. Light it only after {n} is over, on the evening of {v}, and let it burn until nightfall on {d}.", kadish: "Kaddish is said with a minyan from the evening of {v}, until the afternoon of {d}.", shabat: "Shabbat", yomtov: "Yom Tov", ambos: "Shabbat and Yom Tov" },

    es: { anoitecer: "No tenemos certeza de la fecha hebrea: si el fallecimiento fue después de la puesta del sol, el yahrzeit cae un día después. Confírmelo con un rabino, o complete el registro.",
          adarSef: 'Este año tiene dos meses de Adar. Por la costumbre sefaradí se marca en Adar II — confirme con su rabino.',
          adarAsh: 'Este año tiene dos meses de Adar. Por la costumbre ashkenazí se marca en Adar I, y hay quien lo marca también en Adar II — confirme con su rabino.',
          primeiro: 'Es el primer yahrzeit. Cuando el entierro se demoró, hay quien cuenta la fecha del entierro en lugar de la del fallecimiento — confirme con su rabino.',
          puxado: (d, l) => `El fallecimiento fue el día ${d} del mes, y este año el mes tiene ${l} días. La fecha se corrió al día ${l} — confirme con su rabino.`,
          rotulo: (d, m, a) => `${d} de ${m} de ${a}`,
          evento: 'Yahrzeit', vela: 'Encienda la vela al anochecer de la víspera y diga el Kadish con minián.',
          av7: 'Yahrzeit en una semana', av3: 'Yahrzeit en tres días — vea a qué minián ir',
          avVespera: 'El Yahrzeit comienza al anochecer — encienda la vela', avHoje: 'Yahrzeit hoy — Kadish con minián',
          periodo: "desde la noche del {v}, hasta el {d}", velaNormal: "🕯 Encienda la vela a la puesta del sol del {v}, y déjela encendida hasta el anochecer del {d}.", velaAntes: "🕯 El yahrzeit comienza durante {n}, y en {n} no se enciende. Encienda la vela antes de la puesta del sol del {v}, antes de las velas de {n}, y use una vela que dure hasta el anochecer del {d}.", velaDepois: "🕯 El yahrzeit comienza a la salida de {n}, y en {n} no se enciende. Encienda la vela solo después de que termine {n}, la noche del {v}, y déjela encendida hasta el anochecer del {d}.", kadish: "El Kadish se dice con minián desde la noche del {v}, hasta la tarde del {d}.", shabat: "Shabat", yomtov: "Yom Tov", ambos: "Shabat y Yom Tov" },

    fr: { anoitecer: "Nous ne sommes pas sûrs de la date hébraïque : si le décès a eu lieu après le coucher du soleil, le yahrzeit tombe un jour plus tard. Confirmez auprès d’un rabbin, ou complétez la fiche.",
          adarSef: 'Cette année compte deux mois d’Adar. Selon la coutume séfarade, on le marque en Adar II — confirmez avec votre rabbin.',
          adarAsh: 'Cette année compte deux mois d’Adar. Selon la coutume achkénaze, on le marque en Adar I, et certains le marquent aussi en Adar II — confirmez avec votre rabbin.',
          primeiro: 'C’est le premier yahrzeit. Lorsque l’enterrement a tardé, certains comptent à partir de l’enterrement plutôt que du décès — confirmez avec votre rabbin.',
          puxado: (d, l) => `Le décès a eu lieu le ${d} du mois, et cette année ce mois compte ${l} jours. La date a été ramenée au ${l} — confirmez avec votre rabbin.`,
          rotulo: (d, m, a) => `${d} ${m} ${a}`,
          evento: 'Yahrzeit', vela: 'Allumez la bougie à la tombée de la nuit la veille et dites le Kaddish avec un minyan.',
          av7: 'Yahrzeit dans une semaine', av3: 'Yahrzeit dans trois jours — repérez votre minyan',
          avVespera: 'Le Yahrzeit commence à la tombée de la nuit — allumez la bougie', avHoje: 'Yahrzeit aujourd’hui — Kaddish avec un minyan',
          periodo: "du soir du {v}, jusqu’au {d}", velaNormal: "🕯 Allumez la bougie au coucher du soleil du {v}, et laissez-la brûler jusqu’à la tombée de la nuit du {d}.", velaAntes: "🕯 Le yahrzeit commence pendant {n}, et on n’allume pas pendant {n}. Allumez la bougie avant le coucher du soleil du {v}, avant les bougies de {n}, et prenez une bougie qui dure jusqu’à la tombée de la nuit du {d}.", velaDepois: "🕯 Le yahrzeit commence à la sortie de {n}, et on n’allume pas pendant {n}. Allumez la bougie seulement après la fin de {n}, le soir du {v}, et laissez-la brûler jusqu’à la tombée de la nuit du {d}.", kadish: "Le Kaddish se dit avec un minyan du soir du {v}, jusqu’à l’après-midi du {d}.", shabat: "Chabbat", yomtov: "Yom Tov", ambos: "Chabbat et Yom Tov" },

    it: { anoitecer: "Non siamo certi della data ebraica: se il decesso è avvenuto dopo il tramonto, lo yahrzeit cade un giorno dopo. Lo confermi con un rabbino, o completi la scheda.",
          adarSef: 'Quest’anno ha due mesi di Adar. Secondo l’uso sefardita si osserva in Adar II — confermi con il suo rabbino.',
          adarAsh: 'Quest’anno ha due mesi di Adar. Secondo l’uso ashkenazita si osserva in Adar I, e alcuni lo osservano anche in Adar II — confermi con il suo rabbino.',
          primeiro: 'È il primo yahrzeit. Quando la sepoltura ha tardato, alcuni contano dalla sepoltura anziché dal decesso — confermi con il suo rabbino.',
          puxado: (d, l) => `Il decesso è avvenuto il giorno ${d} del mese, e quest’anno il mese ha ${l} giorni. La data è stata spostata al giorno ${l} — confermi con il suo rabbino.`,
          rotulo: (d, m, a) => `${d} di ${m} ${a}`,
          evento: 'Yahrzeit', vela: 'Accenda la candela al calar della sera della vigilia e dica il Kaddish con il minyan.',
          av7: 'Yahrzeit fra una settimana', av3: 'Yahrzeit fra tre giorni — veda a quale minyan andare',
          avVespera: 'Lo Yahrzeit comincia al calar della sera — accenda la candela', avHoje: 'Yahrzeit oggi — Kaddish con il minyan',
          periodo: "dalla sera di {v}, fino a {d}", velaNormal: "🕯 Accenda la candela al tramonto di {v}, e la lasci accesa fino al calar della sera di {d}.", velaAntes: "🕯 Lo yahrzeit comincia durante {n}, e di {n} non si accende. Accenda la candela prima del tramonto di {v}, prima delle candele di {n}, e usi una candela che duri fino al calar della sera di {d}.", velaDepois: "🕯 Lo yahrzeit comincia all’uscita di {n}, e di {n} non si accende. Accenda la candela solo dopo la fine di {n}, la sera di {v}, e la lasci accesa fino al calar della sera di {d}.", kadish: "Il Kaddish si dice con il minyan dalla sera di {v}, fino al pomeriggio di {d}.", shabat: "Shabbat", yomtov: "Yom Tov", ambos: "Shabbat e Yom Tov" },

    de: { anoitecer: "Wir sind uns beim hebräischen Datum nicht sicher: War der Todesfall nach Sonnenuntergang, fällt der Jahrzeit einen Tag später. Bitte mit einem Rabbiner klären oder den Eintrag ergänzen.",
          adarSef: 'Dieses Jahr hat zwei Adar-Monate. Nach sefardischem Brauch wird im Adar II begangen — klären Sie es mit Ihrem Rabbiner.',
          adarAsh: 'Dieses Jahr hat zwei Adar-Monate. Nach aschkenasischem Brauch wird im Adar I begangen, manche begehen ihn auch im Adar II — klären Sie es mit Ihrem Rabbiner.',
          primeiro: 'Es ist der erste Jahrzeit. Verzögerte sich die Beerdigung, zählen manche vom Tag der Beerdigung statt vom Todestag — klären Sie es mit Ihrem Rabbiner.',
          puxado: (d, l) => `Der Todesfall war am ${d}. des Monats, und dieser Monat hat in diesem Jahr ${l} Tage. Das Datum wurde auf den ${l}. gelegt — klären Sie es mit Ihrem Rabbiner.`,
          rotulo: (d, m, a) => `${d}. ${m} ${a}`,
          evento: 'Jahrzeit', vela: 'Zünden Sie die Kerze am Vorabend bei Einbruch der Nacht an und sagen Sie Kaddisch mit einem Minjan.',
          av7: 'Jahrzeit in einer Woche', av3: 'Jahrzeit in drei Tagen — suchen Sie Ihren Minjan',
          avVespera: 'Der Jahrzeit beginnt bei Einbruch der Nacht — zünden Sie die Kerze an', avHoje: 'Jahrzeit heute — Kaddisch mit einem Minjan',
          periodo: "vom Abend des {v} bis {d}", velaNormal: "🕯 Zünden Sie die Kerze bei Sonnenuntergang am {v} an und lassen Sie sie bis zum Einbruch der Nacht am {d} brennen.", velaAntes: "🕯 Der Jahrzeit beginnt während {n}, und an {n} wird nicht angezündet. Zünden Sie die Kerze vor Sonnenuntergang am {v} an, vor den Kerzen von {n}, und nehmen Sie eine Kerze, die bis zum Einbruch der Nacht am {d} brennt.", velaDepois: "🕯 Der Jahrzeit beginnt mit dem Ausgang von {n}, und an {n} wird nicht angezündet. Zünden Sie die Kerze erst nach dem Ende von {n} an, am Abend des {v}, und lassen Sie sie bis zum Einbruch der Nacht am {d} brennen.", kadish: "Kaddisch wird mit einem Minjan vom Abend des {v} bis zum Nachmittag des {d} gesagt.", shabat: "Schabbat", yomtov: "Jom Tow", ambos: "Schabbat und Jom Tow" },

    ru: { anoitecer: "Мы не уверены в еврейской дате: если смерть наступила после захода солнца, йорцайт приходится на день позже. Уточните у раввина или дополните запись.",
          adarSef: 'В этом году два месяца адар. По сефардскому обычаю отмечают в адаре II — уточните у своего раввина.',
          adarAsh: 'В этом году два месяца адар. По ашкеназскому обычаю отмечают в адаре I, а некоторые — также в адаре II. Уточните у своего раввина.',
          primeiro: 'Это первый йорцайт. Если погребение задержалось, некоторые считают от дня погребения, а не от дня смерти — уточните у своего раввина.',
          puxado: (d, l) => `Смерть пришлась на ${d}-й день месяца, а в этом году в месяце ${l} дней. Дата перенесена на ${l}-й день — уточните у своего раввина.`,
          rotulo: (d, m, a) => `${d} ${m} ${a}`,
          evento: 'Йорцайт', vela: 'Зажгите свечу накануне с наступлением темноты и прочтите кадиш с миньяном.',
          av7: 'Йорцайт через неделю', av3: 'Йорцайт через три дня — найдите миньян',
          avVespera: 'Йорцайт начинается с наступлением темноты — зажгите свечу', avHoje: 'Йорцайт сегодня — кадиш с миньяном',
          periodo: "с вечера {v} до {d}", velaNormal: "🕯 Зажгите свечу на закате {v} и оставьте её гореть до наступления темноты {d}.", velaAntes: "🕯 Йорцайт начинается в {n}, а в {n} свечу не зажигают. Зажгите её до захода солнца {v}, до свечей {n}, и возьмите свечу, которая прогорит до наступления темноты {d}.", velaDepois: "🕯 Йорцайт начинается на исходе {n}, а в {n} свечу не зажигают. Зажгите её только после окончания {n}, вечером {v}, и оставьте гореть до наступления темноты {d}.", kadish: "Кадиш читают с миньяном с вечера {v} до второй половины дня {d}.", shabat: "Шабат", yomtov: "Йом-Тов", ambos: "Шабат и Йом-Тов" },

    he: { anoitecer: "איננו בטוחים בתאריך העברי: אם הפטירה הייתה אחרי השקיעה, היארצייט חל יום אחד מאוחר יותר. נא לברר עם רב, או להשלים את הפרטים.",
          adarSef: 'בשנה זו שני חודשי אדר. לפי מנהג הספרדים מציינים באדר ב׳ — לברר עם הרב.',
          adarAsh: 'בשנה זו שני חודשי אדר. לפי מנהג האשכנזים מציינים באדר א׳, ויש המציינים גם באדר ב׳ — לברר עם הרב.',
          primeiro: 'זהו היארצייט הראשון. כאשר הקבורה התאחרה, יש המונים מיום הקבורה ולא מיום הפטירה — לברר עם הרב.',
          puxado: (d, l) => `הפטירה חלה ב-${d} בחודש, ובשנה זו לחודש ${l} ימים. התאריך הוסט ליום ${l} — לברר עם הרב.`,
          rotulo: (d, m, a) => `${d} ב${m} ${a}`,
          evento: 'יארצייט', vela: 'הדליקו נר בצאת הכוכבים בערב שלפני, ואמרו קדיש במניין.',
          av7: 'יארצייט בעוד שבוע', av3: 'יארצייט בעוד שלושה ימים — בדקו לאיזה מניין להגיע',
          avVespera: 'היארצייט מתחיל בצאת הכוכבים — הדליקו נר', avHoje: 'יארצייט היום — קדיש במניין',
          periodo: "מערב {v} עד {d}", velaNormal: "🕯 הדליקו את הנר בשקיעה של {v} והשאירו אותו דולק עד צאת הכוכבים של {d}.", velaAntes: "🕯 היארצייט מתחיל ב{n}, וב{n} לא מדליקים. הדליקו את הנר לפני השקיעה של {v}, לפני נרות {n}, ובחרו נר שידלוק עד צאת הכוכבים של {d}.", velaDepois: "🕯 היארצייט מתחיל במוצאי {n}, וב{n} לא מדליקים. הדליקו את הנר רק אחרי צאת {n}, בערב {v}, והשאירו אותו דולק עד צאת הכוכבים של {d}.", kadish: "את הקדיש אומרים במניין מערב {v} עד אחר הצהריים של {d}.", shabat: "שבת", yomtov: "יום טוב", ambos: "שבת ויום טוב" }
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
      // O primeiro ano (enterro ou falecimento?) so e duvida no Ashkenaz e no
      // Sefard. 29/10, o Erez com o rabino: "Sefaradi e Chabad e na data do
      // falecimento" — ali a duvida nao existe e o aviso nao aparece.
      if (primeiroAno && (nussach === 'ashkenaz' || nussach === 'sefard')) {
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

  // ---------- A VELA, O SHABAT E O YOM TOV (29/10) ----------
  // O rabino: o yahrzeit, a vela e o Kadish comecam na NOITE ANTERIOR; e
  // "quando cai sexta-feira, Yom Tov, ou Shabbat", acender antes (ou depois).
  // O Erez: "nao colocar o horario, apenas no por do sol e nao precisa colocar
  // o local"; "solicitar para nao acender no Shabat"; "sugerir acender antes
  // do Yom Tov como no Shabat".
  //
  // Yom Tov da diaspora (dois dias), que e onde o app e usado hoje. Yom Kippur
  // entra: tambem nao se acende nele.
  const YOM_TOV = { 7: [1, 2, 10, 15, 16, 22, 23], 1: [15, 16, 21, 22], 3: [6, 7] };
  const ehYomTov = h => (YOM_TOV[h.mes] || []).indexOf(h.dia) >= 0;
  const umDia = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  // De DIA, este dia civil e sagrado? (o Shabat e o sabado; o Yom Tov, o dia
  // hebraico que cai neste dia civil)
  const sagrado = d => d.getDay() === 6 || ehYomTov(H.deData(d));
  const LOCAIS = { pt: 'pt-BR', en: 'en-US', es: 'es-ES', fr: 'fr-FR', it: 'it-IT',
                   de: 'de-DE', ru: 'ru-RU', he: 'he-IL' };
  const curta = (d, lingua) => d.toLocaleDateString(LOCAIS[lingua] || 'pt-BR',
    { weekday: 'long', day: 'numeric', month: 'numeric' });
  const longa = (d, lingua, ano) => d.toLocaleDateString(LOCAIS[lingua] || 'pt-BR',
    ano ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
        : { weekday: 'long', day: 'numeric', month: 'long' });
  const compor = (txt, v) => txt.replace(/\{(\w)\}/g, (_, k) => v[k] !== undefined ? v[k] : '');

  /**
   * O que dizer sobre o yahrzeit `y` (de proximoYahrzeit): o periodo (da noite
   * da vespera ate o dia), a vela e o Kadish.
   *   - normal: acender ao por do sol da vespera;
   *   - o yahrzeit comeca DENTRO de Shabat/Yom Tov: acender antes do por do sol
   *     do dia anterior ao bloco sagrado (e com vela que dure ate o fim);
   *   - comeca na SAIDA de Shabat/Yom Tov: acender so depois que ele terminar.
   * @returns {{periodo:string, vela:string, kadish:string, caso:string}}
   */
  function instrucoes(y, lingua) {
    const T = textos(lingua);
    const dia = y.data, vespera = umDia(dia, -1);
    const nomeDe = (dias) => {
      const temYT = dias.some(d => ehYomTov(H.deData(d)));
      const temShabat = dias.some(d => d.getDay() === 6);
      return temYT && temShabat ? T.ambos : temYT ? T.yomtov : T.shabat;
    };
    const periodo = compor(T.periodo, { v: longa(vespera, lingua), d: longa(dia, lingua, true) });
    const kadish = compor(T.kadish, { v: curta(vespera, lingua), d: curta(dia, lingua) });
    let vela, caso;
    if (sagrado(dia)) {
      // a noite da vespera ja e sagrada: volta ate o comeco do bloco
      let ini = dia;
      const bloco = [dia];
      while (sagrado(umDia(ini, -1))) { ini = umDia(ini, -1); bloco.unshift(ini); }
      caso = 'antes';
      vela = compor(T.velaAntes, { n: nomeDe(bloco), v: curta(umDia(ini, -1), lingua), d: curta(dia, lingua) });
    } else if (sagrado(vespera)) {
      // o nome e o do dia que esta TERMINANDO: num Shabat logo depois do Yom
      // Tov, quem acaba naquela noite e o Shabat
      caso = 'depois';
      vela = compor(T.velaDepois, { n: nomeDe([vespera]), v: curta(vespera, lingua), d: curta(dia, lingua) });
    } else {
      caso = 'normal';
      vela = compor(T.velaNormal, { v: curta(vespera, lingua), d: curta(dia, lingua) });
    }
    return { periodo, vela, kadish, caso };
  }

  /** O aviso de incerteza da data hebraica, na lingua — o cartao o tira quando
   *  o cadastro ja responde (por do sol ou data hebraica). */
  const avisoIncerteza = lingua => textos(lingua).anoitecer;

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
   * Arquivo .ics com os proximos yahrzeits e os avisos PEDIDOS em cada um
   * (por padrao os quatro; ver `avisosPedidos`).
   *
   * Por que arquivo de calendario e nao aviso do navegador: aviso de navegador
   * no iPhone so funciona se a pessoa adicionar o app a tela de inicio, e para
   * de valer se ela limpar os dados. O calendario do telefone avisa sempre,
   * inclusive com o telefone no silencioso e sem internet.
   */
  function gerarICS(falecimento, nussach, nome, quantos, lingua, avisosPedidos) {
    const T = textos(lingua);
    // 11/09 — QUAIS avisos passou a ser escolha de quem cadastra. Ele: "no
    // adicionar ao calendario, perguntar quando quer ser lembrado". Sem lista
    // vale o que sempre valeu — os quatro —, para quem ja tinha cadastrado e
    // para quem nao mexer em nada nao mudar coisa nenhuma.
    // NAO PEDIR e diferente de PEDIR NENHUM, e confundir os dois seria devolver
    // quatro avisos a quem desmarcou as quatro caixinhas de proposito.
    //   null / undefined  -> os quatro (quem cadastrou antes de 11/09, e quem
    //                        nao mexeu em nada)
    //   []                -> nenhum (ele desmarcou tudo; o evento entra no
    //                        calendario sem despertador)
    const TODOS = ['semana', 'tres', 'vespera', 'dia'];
    const quais = Array.isArray(avisosPedidos)
      ? TODOS.filter(x => avisosPedidos.indexOf(x) >= 0)
      : TODOS;
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
      const ins = instrucoes(y, lingua);
      l.push(`DESCRIPTION:${y.rotulo}. ${ins.vela.replace('🕯 ', '')} ${ins.kadish}${y.avisos.length ? ' — ' + y.avisos.join(' ') : ''}`);
      // uma semana antes, tres dias antes, tarde da vespera, manha do dia —
      // agora so os que ele pediu (ver `quais`, acima).
      const ALARMES = { semana: ['-P7D', T.av7], tres: ['-P3D', T.av3],
                        vespera: ['-PT8H', T.avVespera], dia: ['PT8H', T.avHoje] };
      quais.forEach((k) => {
        const [quando, texto] = ALARMES[k];
        l.push('BEGIN:VALARM', 'ACTION:DISPLAY', `TRIGGER:${quando}`, `DESCRIPTION:${texto}`, 'END:VALARM');
      });
      l.push('END:VEVENT');
    });
    l.push('END:VCALENDAR');
    return l.join('\r\n') + '\r\n';
  }

  const api = { proximoYahrzeit, proximos, gerarICS, instrucoes, avisoIncerteza, ehYomTov, REGRA };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  raiz.Yahrzeit = api;
})(typeof window !== 'undefined' ? window : globalThis);
