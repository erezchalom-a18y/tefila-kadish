/**
 * hebraico.js — conversao entre o calendario gregoriano e o hebraico.
 *
 * Algoritmo classico de Dershowitz & Reingold (dias absolutos). Nao depende de
 * internet nem de biblioteca: o app precisa funcionar offline, na sinagoga.
 *
 * ATENCAO: converter data e conta. DECIDIR a data do yahrzeit nao e — depende do
 * nussach e, em alguns casos, do rabino. Ver calcularYahrzeit() em yahrzeit.js.
 */
(function (raiz) {
  const MESES = ['Nisan','Iyar','Sivan','Tamuz','Av','Elul','Tishrei','Cheshvan',
                 'Kislev','Tevet','Shvat','Adar','Adar I','Adar II'];

  const ehBissexto = a => ((7 * a + 1) % 19) < 7;
  const mesesNoAno = a => (ehBissexto(a) ? 13 : 12);

  function diasDecorridos(ano) {
    const mesesAte = Math.floor((235 * ano - 234) / 19);
    const partes = 12084 + 13753 * mesesAte;
    let dia = mesesAte * 29 + Math.floor(partes / 25920);
    if (((3 * (dia + 1)) % 7) < 3) dia++;             // adia por causa do dia da semana
    return dia;
  }
  function adiamento(ano) {
    const ultimo = diasDecorridos(ano - 1);
    const atual = diasDecorridos(ano);
    const proximo = diasDecorridos(ano + 1);
    if (proximo - atual === 356) return 2;
    if (atual - ultimo === 382) return 1;
    return 0;
  }
  const diasAteAno = a => diasDecorridos(a) + adiamento(a);
  const diasNoAno = a => diasAteAno(a + 1) - diasAteAno(a);

  /** Quantos dias tem o mes. Cheshvan e Kislev variam com o tamanho do ano. */
  function diasNoMes(ano, mes) {
    if ([2, 4, 6, 10, 13].includes(mes)) return 29;            // Iyar, Tamuz, Elul, Tevet, Adar II
    if (mes === 12 && !ehBissexto(ano)) return 29;             // Adar de ano comum
    if (mes === 8 && diasNoAno(ano) % 10 !== 5) return 29;     // Cheshvan
    if (mes === 9 && diasNoAno(ano) % 10 === 3) return 29;     // Kislev
    return 30;
  }

  // Dia absoluto de 1 Tishrei do ano hebraico 1. O lado gregoriano foi conferido
  // sozinho (1/1/0001 = dia 1, 1/1/2000 = dia 730120, ambos certos), entao o
  // deslocamento de um dia que aparecia nas cinco datas conhecidas estava aqui.
  const EPOCA = -1373428;

  function absolutoDeHebraico(ano, mes, dia) {
    let n = dia;
    if (mes < 7) {                          // Nisan..Elul: soma o resto do ano
      for (let m = 7; m <= mesesNoAno(ano); m++) n += diasNoMes(ano, m);
      for (let m = 1; m < mes; m++) n += diasNoMes(ano, m);
    } else {
      for (let m = 7; m < mes; m++) n += diasNoMes(ano, m);
    }
    return n + diasAteAno(ano) + EPOCA;
  }

  function hebraicoDeAbsoluto(abs) {
    let ano = Math.floor((abs - EPOCA) / 366);
    while (abs >= absolutoDeHebraico(ano + 1, 7, 1)) ano++;
    let mes = abs < absolutoDeHebraico(ano, 1, 1) ? 7 : 1;
    while (abs > absolutoDeHebraico(ano, mes, diasNoMes(ano, mes))) mes++;
    const dia = abs - absolutoDeHebraico(ano, mes, 1) + 1;
    return { ano, mes, dia };
  }

  // ---- gregoriano <-> absoluto ----
  const bissextoGreg = a => (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;
  const DIAS_MES = [31,28,31,30,31,30,31,31,30,31,30,31];
  function absolutoDeGregoriano(a, m, d) {
    let n = d;
    for (let i = 0; i < m - 1; i++) n += DIAS_MES[i] + (i === 1 && bissextoGreg(a) ? 1 : 0);
    return n + 365 * (a - 1) + Math.floor((a - 1) / 4) - Math.floor((a - 1) / 100) + Math.floor((a - 1) / 400);
  }
  function gregorianoDeAbsoluto(abs) {
    let a = Math.floor(abs / 366);
    while (abs >= absolutoDeGregoriano(a + 1, 1, 1)) a++;
    let m = 1;
    while (abs > absolutoDeGregoriano(a, m, DIAS_MES[m-1] + (m === 2 && bissextoGreg(a) ? 1 : 0))) m++;
    return { ano: a, mes: m, dia: abs - absolutoDeGregoriano(a, m, 1) + 1 };
  }

  /** Nome do mes hebraico, ciente de ano bissexto. */
  function nomeMes(ano, mes) {
    if (!ehBissexto(ano) && mes === 12) return 'Adar';
    if (mes === 12) return 'Adar I';
    if (mes === 13) return 'Adar II';
    return MESES[mes - 1];
  }

  const api = {
    ehBissexto, mesesNoAno, diasNoMes, nomeMes, MESES,
    absolutoDeHebraico, hebraicoDeAbsoluto, absolutoDeGregoriano, gregorianoDeAbsoluto,
    /** Date do navegador -> {ano, mes, dia} hebraico */
    deData: dt => hebraicoDeAbsoluto(absolutoDeGregoriano(dt.getFullYear(), dt.getMonth() + 1, dt.getDate())),
    /** {ano, mes, dia} hebraico -> Date do navegador */
    paraData: h => { const g = gregorianoDeAbsoluto(absolutoDeHebraico(h.ano, h.mes, h.dia));
                     return new Date(g.ano, g.mes - 1, g.dia); },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  raiz.Hebraico = api;
})(typeof window !== 'undefined' ? window : globalThis);
