// Sincronia por pausas reais + proporcao do texto.
// A janela vai do INICIO DA FALA ao FIM DA FALA, nao do inicio ao fim do arquivo.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const NOMES = ['ashkenaz_yatom','ashkenaz_derabanan','chabad_yatom','chabad_derabanan'];
const MARGEM = 0.12;   // folga antes/depois da fala, em segundos

const dur = f => Number(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${f}"`).toString().trim());

function pausas(f, dB, d) {
  const s = execSync(`ffmpeg -hide_banner -nostats -i "${f}" -af "silencedetect=noise=${dB}dB:d=${d}" -f null - 2>&1 || true`,
                     { shell: '/bin/bash', maxBuffer: 1e8 }).toString();
  const out = []; let ini = null;
  for (const l of s.split('\n')) {
    let m = l.match(/silence_start:\s*([\d.]+)/); if (m) { ini = +m[1]; continue; }
    m = l.match(/silence_end:\s*([\d.]+)/);       if (m && ini !== null) { out.push({ ini, fim: +m[1] }); ini = null; }
  }
  const fund = [];
  for (const p of out) { const u = fund.at(-1);
    if (u && p.ini - u.fim < 0.06) u.fim = p.fim; else fund.push({ ...p }); }
  return fund.map(p => ({ ...p, dur: p.fim - p.ini }));
}

const peso = h => (String(h).match(/[א-ת]/g) || []).length;

function alinhar(pesos, cortes, t0, t1) {
  const N = pesos.length, T = t1 - t0;
  const total = pesos.reduce((a,b)=>a+b,0);
  const alvo = [t0]; let acc = 0;
  for (const p of pesos) { acc += p; alvo.push(t0 + acc/total*T); }
  const C = [t0, ...cortes.filter(p => p.fim > t0 && p.ini < t1).map(p => (p.ini+p.fim)/2), t1];
  const M = C.length, INF = Infinity;
  const dp = Array.from({length:M}, () => new Float64Array(N+1).fill(INF));
  const de = Array.from({length:M}, () => new Int32Array(N+1).fill(-1));
  dp[0][0] = 0;
  for (let v = 1; v <= N; v++) for (let i = 1; i < M; i++) {
    const cFim = ((C[i]-alvo[v])/T)**2;
    for (let k = 0; k < i; k++) {
      if (dp[k][v-1] === INF) continue;
      const d = C[i]-C[k]; if (d <= 0.3) continue;
      const c = dp[k][v-1] + cFim + ((d - pesos[v-1]/total*T)/T)**2;
      if (c < dp[i][v]) { dp[i][v] = c; de[i][v] = k; }
    }
  }
  let i = M-1; if (dp[i][N] === INF) return null;
  const fins = []; for (let v = N; v >= 1; v--) { fins.unshift(C[i]); i = de[i][v]; }
  return fins;
}

const rel = [];
for (const nome of NOMES) {
  const f = `cortado/${nome}.ogg`, T = dur(f);
  // janela de fala: primeira pausa que comeca no inicio e ultima que termina no fim
  const bordas = pausas(f, -40, 0.20);
  const cab = bordas.find(p => p.ini < 0.35);
  const rab = [...bordas].reverse().find(p => p.fim > T - 0.35);
  const t0 = Math.max(0, (cab ? cab.fim : 0) - MARGEM);
  const t1 = Math.min(T, (rab ? rab.ini : T) + MARGEM);

  const j = JSON.parse(readFileSync(`sync/${nome}_sync.json`, 'utf8'));
  const pesos = j.versos.map(v => peso(v.hebrew));
  const ps = pausas(f, -32, 0.22);
  const fins = alinhar(pesos, ps, t0, t1);
  if (!fins) { console.log(`${nome}: NAO ALINHOU`); continue; }

  let ini = t0; const segs = [];
  for (const fim of fins) { segs.push({ start: +ini.toFixed(2), end: +fim.toFixed(2) }); ini = fim; }

  const tx = segs.map((s,k) => (s.end - s.start) / Math.max(1, pesos[k]));
  const med = [...tx].sort((a,b)=>a-b)[Math.floor(tx.length/2)];
  const susp = tx.filter(x => x/med < 0.75 || x/med > 1.35).length;
  rel.push({ nome, arquivo: +T.toFixed(2), fala: `${t0.toFixed(2)} - ${t1.toFixed(2)}`,
             silencio_cortado: +((T - (t1-t0))).toFixed(2), versos: pesos.length, suspeitos: susp });

  j.audio_duration = +T.toFixed(2);
  j.fala_inicio = +t0.toFixed(2);
  j.fala_fim = +t1.toFixed(2);
  delete j.verso_duration;
  j.sync_status = 'pausas do audio + proporcao do texto, janela = so a fala - A CONFERIR DE OUVIDO';
  j.versos = j.versos.map((v,k) => ({ ...v, start: segs[k].start, end: segs[k].end }));
  writeFileSync(`sync/${nome}_sync.json`, JSON.stringify(j, null, 2) + '\n', 'utf8');
}
console.table(rel);
