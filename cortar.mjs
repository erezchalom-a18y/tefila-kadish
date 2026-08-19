// Acha onde o anuncio do chazan termina e a reza comeca, e corta ali.
import { execSync } from 'node:child_process';
import { readdirSync, mkdirSync, readFileSync } from 'node:fs';
const MANUAL = JSON.parse(readFileSync('cortes.json', 'utf8'));

const FOLGA = 0.15;
const dur = f => Number(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${f}"`).toString().trim());

function pausas(f, dB = -38, d = 0.30) {
  const s = execSync(`ffmpeg -hide_banner -nostats -i "${f}" -af "silencedetect=noise=${dB}dB:d=${d}" -f null - 2>&1 || true`,
                     { shell: '/bin/bash', maxBuffer: 1e8 }).toString();
  const o = []; let i = null;
  for (const l of s.split('\n')) {
    let m = l.match(/silence_start:\s*([\d.]+)/); if (m) { i = +m[1]; continue; }
    m = l.match(/silence_end:\s*([\d.]+)/);       if (m && i !== null) { o.push({ ini: i, fim: +m[1], dur: +m[1] - i }); i = null; }
  }
  return o;
}

mkdirSync('cortado', { recursive: true });
const rel = [];
for (const f of readdirSync('completo').filter(x => x.endsWith('.ogg')).sort()) {
  const n = f.replace('.ogg', ''), src = `completo/${f}`, T = dur(src);
  const ps = pausas(src);
  // silencio inicial do arquivo (pausa que comeca em ~0) nao conta como fim de anuncio
  const cand = ps.filter(p => p.ini > 0.5 && p.ini < 9);
  if (!cand.length) { rel.push({ n, erro: 'nenhuma pausa candidata' }); continue; }
  const alvo = cand.reduce((a, b) => (b.dur > a.dur ? b : a));
  const m = MANUAL[n];
  const rezaEm = (typeof m === 'number') ? m : alvo.fim;
  const inicio = Math.max(0, rezaEm - FOLGA);

  // fim da fala
  const fimP = ps.filter(p => p.fim > T - 0.4).pop();
  const fim = Math.min(T, (fimP ? fimP.ini : T) + FOLGA);

  execSync(`ffmpeg -v error -y -ss ${inicio.toFixed(3)} -to ${fim.toFixed(3)} -i "${src}" -c:a libvorbis -b:a 160k "cortado/${n}.ogg"`);
  rel.push({ n, fonte: (typeof m === 'number') ? 'de ouvido' : 'automatico', corte: +inicio.toFixed(2),
             reza: +(fim - inicio).toFixed(2), antes: +T.toFixed(2) });
}
console.table(rel);
