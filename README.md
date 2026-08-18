# Tefilá · Kadish do Enlutado

PWA gratuita multilíngue para dizer Kadish. Suporta 4 nusachim (Ashkenaz, Sefard, Chabad, Sefaradi) × 2 kadishim (Yatom, DeRabanan) em 6 idiomas (português, hebraico, inglês, russo, espanhol, francês).

## 📁 Estrutura

```
tefila-motor-final/
├── engine.html           ← App completo
├── index.html            ← Redirecionador (default: Chabad)
├── audio/
│   ├── manifest.json     ← Referências aos 8 áudios
│   ├── ashkenaz/
│   │   ├── yatom.ogg
│   │   └── derabanan.ogg
│   ├── chabad/
│   │   ├── yatom.ogg
│   │   └── derabanan.ogg
│   ├── sefard/
│   │   ├── yatom.ogg
│   │   └── derabanan.ogg
│   └── sefaradi/
│       ├── yatom.ogg
│       └── derabanan.ogg
└── README.md            ← Este arquivo
```

## 🚀 Deploy

### Netlify Drop (recomendado)

1. Acesse [app.netlify.com/drop](https://app.netlify.com/drop)
2. Arraste a pasta `tefila-motor-final` inteira
3. 2 minutos: seu app estará no ar com os áudios novos

### GitHub + Netlify Auto-Deploy

```bash
git clone https://github.com/erezchalom-a18y/tefila-motor.git
cd tefila-motor
cp -r ../tefila-motor-final/* .
git add -A
git commit -m "Update: áudios novos (OGG) + manifest"
git push
```

Netlify detecta o push e redeploy automático.

## 🎵 Áudios inclusos

✓ Chabad Yatom (1.7 MB) + DeRabanan (2.1 MB)  
✓ Ashkenaz Yatom (1.6 MB) + DeRabanan (2.5 MB)  
✓ Sefard Yatom (1.8 MB) + DeRabanan (2.4 MB)  
✓ Sefaradi Yatom (1.8 MB) + DeRabanan (2.6 MB)

**Formato:** OGG Vorbis (otimizado para web)

## 🔗 URLs

- `https://seu-site.netlify.app/` → Chabad (default)
- `https://seu-site.netlify.app/?n=ashkenaz` → Ashkenaz
- `https://seu-site.netlify.app/?n=sefard` → Sefard
- `https://seu-site.netlify.app/?n=sefaradi` → Sefaradi

## 📱 Funcionalidades

- ✓ Hebraico + transliteração + tradução sincronizadas
- ✓ 6 idiomas (PT, HE, EN, RU, ES, FR) — italiano e árabe em breve
- ✓ Áudio completo por reza (sem sincronização verso-a-verso)
- ✓ Temas: claro, escuro, alto contraste
- ✓ Tamanho de fonte ajustável
- ✓ Instalável como PWA (adicionar à tela inicial)
- ✓ Funciona offline (assets em cache)

---

**Versão:** 2026.08.02  
**Contato:** erez@...
