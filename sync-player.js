/**
 * Tefilá Sync Player v5
 * - destaque PALAVRA POR PALAVRA (hebraico + transliteração + glosa), como o conferidor
 * - pronto para várias línguas: ?lang=pt (padrão) | en | ...
 *   usa verso.translations[lang] e palavra.glosas[lang] quando existirem,
 *   senão cai para translation_pt / glosa_pt.
 */

class SyncPlayer {
  constructor(audioElement, nusach, tipo) {
    this.audio = audioElement;
    this.nusach = nusach;
    this.tipo = tipo;
    this.lang = new URLSearchParams(window.location.search).get('lang') || 'pt';
    this.syncData = null;
    this.versoAtual = -1;
    this.palavraAtual = -1;
    this.isPlaying = false;
    this.init();
  }

  async init() {
    try {
      const r = await fetch(`./sync/${this.nusach}_${this.tipo}_sync.json`);
      this.syncData = await r.json();
    } catch (e) {
      console.error('Erro ao carregar JSON de sincronia:', e);
      return;
    }
    const display = document.getElementById('verso-sync-display');
    if (!display) { console.error('verso-sync-display não encontrado'); return; }
    this._injetarCss();
    this.audio.addEventListener('play',  () => { this.isPlaying = true; });
    this.audio.addEventListener('pause', () => { this.isPlaying = false; });
    this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
  }

  _injetarCss() {
    if (document.getElementById('sync-w-css')) return;
    const s = document.createElement('style');
    s.id = 'sync-w-css';
    s.textContent =
      '.sync-w{padding:0 2px;border-radius:4px;transition:background .08s,color .08s}' +
      '.sync-w.agora{background:#fde047;color:#111;font-weight:600}' +
      '.sync-glosa{font-size:14px;opacity:.85;margin-top:4px}';
    document.head.appendChild(s);
  }

  _texto(v) {
    return (v.translations && v.translations[this.lang]) || v.translation_pt || '';
  }
  _glosa(p) {
    return (p.glosas && p.glosas[this.lang]) || p.glosa_pt || '';
  }

  onTimeUpdate() {
    if (!this.isPlaying || !this.syncData) return;
    const t = this.audio.currentTime;
    const versos = this.syncData.versos;
    const vi = versos.findIndex(v => t >= v.start && t < v.end);
    if (vi === -1) return;
    const v = versos[vi];
    const pi = v.palavras ? v.palavras.findIndex(p => t >= p.start && t < p.end) : -1;
    if (vi !== this.versoAtual) {
      this.versoAtual = vi;
      this.palavraAtual = pi;
      this.desenharVerso(v);
    } else if (pi !== this.palavraAtual) {
      this.palavraAtual = pi;
      this.destacarPalavra();
    }
  }

  desenharVerso(v) {
    const display = document.getElementById('verso-sync-display');
    if (!display) return;
    const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    const ps = v.palavras;
    const heb = ps
      ? ps.map((p,k) => `<span class="sync-w" data-p="${k}">${esc(p.hebrew)}</span>`).join(' ')
      : esc(v.hebrew || '');
    const tl = ps && ps.some(p => p.transliteration_pt)
      ? ps.map((p,k) => `<span class="sync-w" data-p="${k}">${esc(p.transliteration_pt)}</span>`).join(' ')
      : esc(v.transliteration_pt || '');
    const temGlosa = ps && ps.some(p => this._glosa(p));
    const gl = temGlosa
      ? ps.map((p,k) => `<span class="sync-w" data-p="${k}">${esc(this._glosa(p) || '·')}</span>`).join(' ')
      : esc(this._texto(v));
    display.innerHTML =
      `<div class="sync-verso-n">Verso ${v.n} de ${this.syncData.total_versos}</div>` +
      `<div class="sync-hebrew" dir="rtl">${heb}</div>` +
      `<div class="sync-translit">${tl}</div>` +
      `<div class="sync-translation sync-glosa">${gl}</div>`;
    display.classList.add('active');
    display.style.display = 'block';
    this.destacarPalavra();
  }

  destacarPalavra() {
    const display = document.getElementById('verso-sync-display');
    if (!display) return;
    display.querySelectorAll('.sync-w.agora').forEach(el => el.classList.remove('agora'));
    if (this.palavraAtual >= 0)
      display.querySelectorAll(`.sync-w[data-p="${this.palavraAtual}"]`).forEach(el => el.classList.add('agora'));
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SyncPlayer;
}
