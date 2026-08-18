#!/usr/bin/env python3
# Script para modificar engine.html automaticamente

import os
import sys

# Caminho do arquivo
engine_path = r"C:\Users\erez\downloads\files1\tefila-motor-final\engine.html"

print("🔧 Modificando engine.html...")

if not os.path.exists(engine_path):
    print(f"❌ Arquivo não encontrado: {engine_path}")
    sys.exit(1)

# Ler o arquivo
with open(engine_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Adicionar script no head
if '<script src="./sync-player.js"></script>' not in content:
    content = content.replace(
        '<title>Tefilá · Kadish do Enlutado · v3</title>',
        '<title>Tefilá · Kadish do Enlutado · v3</title>\n<script src="./sync-player.js"></script>'
    )
    print("✓ Adicionado sync-player.js no head")

# 2. Adicionar div após audio
if '<div id="verso-sync-display"' not in content:
    content = content.replace(
        '</audio>',
        '</audio>\n<div id="verso-sync-display" class="verso-sync-display"></div>'
    )
    print("✓ Adicionado verso-sync-display div")

# 3. Adicionar CSS
css_code = '''
  /* Sincronizacao verso-a-verso */
  .verso-sync-display {
    display: none;
    padding: 1rem;
    margin: 1rem 0;
    border-left: 4px solid #8b6a3e;
    background: var(--bg-elevated);
    border-radius: 4px;
  }
  .verso-sync-display.active {
    display: block;
    animation: slideIn 0.3s ease-in-out;
  }
  .sync-verso-n {
    font-size: 0.9rem;
    color: var(--text-faint);
    margin-bottom: 0.5rem;
  }
  .sync-hebrew {
    font-size: 1.4rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    direction: rtl;
    text-align: right;
    color: var(--text);
  }
  .sync-translit {
    font-size: 1rem;
    color: var(--text-soft);
    margin-bottom: 0.5rem;
    font-style: italic;
  }
  .sync-translation {
    font-size: 1rem;
    color: var(--text-soft);
    margin-bottom: 0.5rem;
  }
  .sync-time {
    font-size: 0.8rem;
    color: var(--text-faint);
  }
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
'''

if '.verso-sync-display' not in content:
    content = content.replace(
        '</style>',
        css_code + '\n</style>'
    )
    print("✓ Adicionado CSS para sincronizacao")

# 4. Adicionar JavaScript antes do </body>
js_code = '''
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const audio = document.querySelector('audio');
      if (audio && typeof SyncPlayer !== 'undefined') {
        const nusach = 'chabad';
        const tipo = 'yatom';
        new SyncPlayer(audio, nusach, tipo);
        console.log('✓ Sincronizacao ativada:', nusach, tipo);
      }
    });
  </script>
'''

if 'new SyncPlayer' not in content:
    content = content.replace(
        '</body>',
        js_code + '\n</body>'
    )
    print("✓ Adicionado JavaScript de inicializacao")

# Salvar
with open(engine_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ engine.html modificado com sucesso!")
print(f"   Arquivo: {engine_path}")
print("\nProximos passos:")
print("1. Teste localmente: abra engine.html no navegador")
print("2. git commit + git push")
print("3. Aguarde 3-5 min para redeploy")
print("4. Teste em: https://lovely-pastelito-74ce5c.netlify.app/")

