/**
 * Tefilá Sync Player v4
 * Com DEBUG visual para verificar sincronização
 */

class SyncPlayer {
  constructor(audioElement, nusach, tipo) {
    this.audio = audioElement;
    this.nusach = nusach;
    this.tipo = tipo;
    this.syncData = null;
    this.currentVersoIndex = -1;
    this.isPlaying = false;
    
    console.log('🔧 Iniciando SyncPlayer:', nusach, tipo);
    this.init();
  }

  async init() {
    try {
      const response = await fetch(`./sync/${this.nusach}_${this.tipo}_sync.json`);
      this.syncData = await response.json();
      console.log(`✅ JSON carregado:`, this.syncData.total_versos, 'versos');
    } catch (e) {
      console.error('❌ Erro ao carregar JSON:', e);
      return;
    }

    // Verificar se elemento existe
    const display = document.getElementById('verso-sync-display');
    if (!display) {
      console.error('❌ verso-sync-display NÃO ENCONTRADO!');
      return;
    }
    console.log('✅ verso-sync-display encontrado');

    // Listeners
    this.audio.addEventListener('play', () => this.onPlay());
    this.audio.addEventListener('pause', () => this.onPause());
    this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
    
    console.log('✅ Listeners adicionados');
  }

  onPlay() {
    this.isPlaying = true;
    console.log('▶️ PLAY');
  }

  onPause() {
    this.isPlaying = false;
    console.log('⏸️ PAUSE');
  }

  onTimeUpdate() {
    if (!this.isPlaying || !this.syncData) return;

    const currentTime = this.audio.currentTime;
    const verso = this.syncData.versos.find(
      v => currentTime >= v.start && currentTime < v.end
    );

    if (verso && verso.n !== this.currentVersoIndex) {
      console.log(`📍 Verso ${verso.n} [${currentTime.toFixed(1)}s]`);
      this.updateVersoDisplay(verso);
    } else if (!verso && this.currentVersoIndex !== -1) {
      this.clearCurrentVerso();
    }
  }

  updateVersoDisplay(verso) {
    this.currentVersoIndex = verso.n;

    const display = document.getElementById('verso-sync-display');
    if (!display) {
      console.error('❌ verso-sync-display desapareceu!');
      return;
    }

    // Montar HTML
    let html = `
      <div class="sync-verso-n">Verso ${verso.n} de ${this.syncData.total_versos}</div>
      <div class="sync-hebrew">${verso.hebrew || '[sem hebraico]'}</div>
      <div class="sync-translit">${verso.transliteration_pt || '[sem translit]'}</div>
      <div class="sync-translation">${verso.translation_pt || '[sem tradução]'}</div>
      <div class="sync-time">${verso.start.toFixed(2)}s → ${verso.end.toFixed(2)}s</div>
    `;

    display.innerHTML = html;
    display.classList.add('active');
    display.style.display = 'block'; // Força visibilidade
  }

  clearCurrentVerso() {
    this.currentVersoIndex = -1;
    const display = document.getElementById('verso-sync-display');
    if (display) {
      display.classList.remove('active');
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SyncPlayer;
}
