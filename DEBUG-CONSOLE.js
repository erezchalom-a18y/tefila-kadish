// Cole isto no Console do navegador (F12)
// para diagnosticar o problema

console.log('=== DIAGNOSTICO TEFILA SYNC ===');

// 1. Verificar elemento
const elem = document.getElementById('verso-sync-display');
console.log('1. verso-sync-display existe?', !!elem);
if (elem) {
  console.log('   Display:', elem.style.display);
  console.log('   Visibility:', window.getComputedStyle(elem).visibility);
  console.log('   Height:', elem.offsetHeight);
  console.log('   Classes:', elem.className);
}

// 2. Verificar SyncPlayer
console.log('2. SyncPlayer existe?', typeof SyncPlayer !== 'undefined');

// 3. Verificar JSON
fetch('./sync/chabad_yatom_sync.json')
  .then(r => r.json())
  .then(d => {
    console.log('3. JSON carregado:');
    console.log('   Versos:', d.total_versos);
    console.log('   Primeiro verso:', d.versos[0]);
  })
  .catch(e => console.error('3. Erro ao carregar JSON:', e));

// 4. Verificar áudio
const audio = document.querySelector('audio');
console.log('4. Áudio encontrado?', !!audio);
if (audio) {
  console.log('   Duração:', audio.duration);
  console.log('   Playing:', audio.playing);
}

console.log('=== FIM DIAGNOSTICO ===');
