// Sincronia por pausas + proporcao de texto.
// 1) acha todas as pausas reais no audio (ffmpeg silencedetect)
// 2) cada pausa e um corte candidato
// 3) escolhe os N-1 cortes que melhor batem com o tamanho de cada verso
//    (programacao dinamica, minimiza desvio proporcional)
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const NOMES = ['ashkenaz_yatom','ashkenaz_derabanan','chabad_yatom','chabad_derabanan'];

function duracao(f){
  return Number(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${f}"`).toString().trim());
}

function pausas(f, dB=-32, dur=0.22){
  const saida = execSync(
    `ffmpeg -hide_banner -nostats -i "${f}" -af "silencedetect=noise=${dB}dB:d=${dur}" -f null - 2>&1 || true`,
    { shell: '/bin/bash', maxBuffer: 64*1024*1024 }).toString();
  const out = [];
  let ini = null;
  for (const l of saida.split('\n')) {
    let m = l.match(/silence_start:\s*([\d.]+)/);
    if (m) { ini = Number(m[1]); continue; }
    m = l.match(/silence_end:\s*([\d.]+)/);
    if (m && ini !== null) { out.push({ ini, fim: Number(m[1]), dur: Number(m[1]) - ini }); ini = null; }
  }
  // funde pausas coladas
  const fund = [];
  for (const p of out) {
    const u = fund.at(-1);
    if (u && p.ini - u.fim < 0.06) { u.fim = p.fim; u.dur = u.fim - u.ini; }
    else fund.push({ ...p });
  }
  return fund;
}

// "peso" de um verso = consoantes hebraicas (proxy de silabas)
const peso = h => (h.match(/[א-ת]/g) || []).length;

function alinhar(pesos, cortes, T) {
  const N = pesos.length;
  const total = pesos.reduce((a,b)=>a+b,0);
  const alvo = [0];
  let acc = 0;
  for (const p of pesos) { acc += p; alvo.push(acc / total * T); }   // fim esperado de cada verso

  // candidatos: 0, midpoints das pausas, T
  const C = [0, ...cortes.map(p => (p.ini + p.fim) / 2), T];
  const M = C.length;

  // dp[i][j] = melhor custo usando j cortes ate o candidato i, tendo fechado j versos
  const INF = Infinity;
  const dp = Array.from({length: M}, () => new Float64Array(N+1).fill(INF));
  const de = Array.from({length: M}, () => new Int32Array(N+1).fill(-1));
  dp[0][0] = 0;
  for (let v = 1; v <= N; v++) {
    for (let i = 1; i < M; i++) {
      const custoFim = ((C[i] - alvo[v]) / T) ** 2;
      for (let k = 0; k < i; k++) {
        if (dp[k][v-1] === INF) continue;
        const durV = C[i] - C[k];
        if (durV <= 0.3) continue;                     // verso nao pode ser microscopico
        const durEsp = pesos[v-1] / total * T;
        const custoDur = ((durV - durEsp) / T) ** 2;
        const c = dp[k][v-1] + custoFim + custoDur;
        if (c < dp[i][v]) { dp[i][v] = c; de[i][v] = k; }
      }
    }
  }
  // tem que terminar no ultimo candidato
  let i = M - 1;
  if (dp[i][N] === INF) return null;
  const fins = [];
  for (let v = N; v >= 1; v--) { fins.unshift(C[i]); i = de[i][v]; }
  return fins;
}

const relatorio = [];
for (const nome of NOMES) {
  const wav = `audio/${nome}.ogg`;
  const T = duracao(wav);
  const j = JSON.parse(readFileSync(`sync/${nome}_sync.json`, 'utf8'));
  const pesos = j.versos.map(v => peso(v.hebrew));
  const ps = pausas(wav);
  const fins = alinhar(pesos, ps, T);
  if (!fins) { console.log(`${nome}: NAO ALINHOU`); continue; }

  let ini = 0;
  const segs = [];
  for (let k = 0; k < fins.length; k++) { segs.push({ start: +ini.toFixed(2), end: +fins[k].toFixed(2) }); ini = fins[k]; }

  // qualidade: segundos por consoante em cada verso
  const taxa = segs.map((s,k) => (s.end - s.start) / Math.max(1, pesos[k]));
  const min = Math.min(...taxa), max = Math.max(...taxa);
  relatorio.push({ nome, T:+T.toFixed(2), versos: pesos.length, pausas: ps.length,
                   variacao: +(max/min).toFixed(2) });

  j.audio_duration = +T.toFixed(2);
  delete j.verso_duration;
  j.sync_status = 'pausas do audio + proporcao do texto - A CONFERIR DE OUVIDO';
  j.versos = j.versos.map((v,k) => ({ ...v, start: segs[k].start, end: segs[k].end }));
  writeFileSync(`sync/${nome}_sync.json`, JSON.stringify(j, null, 2) + '\n', 'utf8');
}
console.table(relatorio);
