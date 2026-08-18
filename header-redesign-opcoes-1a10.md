# Tefilá — 10 Variantes de Header (Mobile)

**Problema:** Seção superior ocupa ~35% da viewport em iPhone. Badges + contexto comprimem a oração.

**Critérios:**
- Título legível (não deletar)
- Metadata (Yatom/DeRabanan/nusach) presente mas menor
- Contexto "Por que dizemos" não é crítico — pode migrar
- Badges devem retrair

---

## OPÇÃO 1: Minimal Stack — apenas título + 1 linha

```
┌─ HEADER ────────────────────────────────┐
│ Kadish do Enlutado                       │
│ Yatom · em pé · minyan(10) · áudio       │  ← tudo em 1 linha, 12px
│                                          │
│ [Contexto] ✓                             │  ← toggle expandir
└──────────────────────────────────────────┘

Altura: ~60px (vs ~180px atual)
```

**Vantagem:** Máximo espaço para oração; metadata legível  
**Desvantagem:** "Por que" escondido; precisa de toggle

---

## OPÇÃO 2: Título em H2 + Chips horizontais pequenos

```
┌─ HEADER ────────────────────────────────┐
│ Kadish do Enlutado                       │
│ Yatom                                    │  ← nusach/tipo separado
│                                          │
│ [Em pé] [Minyan 10] [Áudio]              │  ← chips menores, icone only
└──────────────────────────────────────────┘

Altura: ~70px
Chips: 24×24px com ícone (sem texto)
```

**Vantagem:** Ainda compacto; informação visual rápida  
**Desvantagem:** Ícones pequenos em tela <320px

---

## OPÇÃO 3: "Por que" como collapse card (estado inicial fechado)

```
┌─ HEADER ────────────────────────────────┐
│ Kadish do Enlutado                       │
│ Yatom · em pé                            │  ← o mínimo
│ ╰─ ? [Ver contexto]                      │  ← link acionável
└──────────────────────────────────────────┘

Se clicado → expande inline:
│ Por que dizemos o Kadish?                │
│ O significado, a história e quem...      │ ← até 4 linhas max
└──────────────────────────────────────────┘

Altura fechado: ~50px | aberto: ~110px
```

**Vantagem:** Infocard não pesa na carga  
**Desvantagem:** Requer 2 toques; aumenta layout shift

---

## OPÇÃO 4: Horizontal layout — título à esquerda, badges à direita

```
┌─ HEADER ────────────────────────────────┐
│ Kadish do Enlutado    [Em pé] [Minyan]  │  ← título esq, badges dir
│ Yatom                                    │  ← meta em linha 2
└──────────────────────────────────────────┘

Altura: ~50px
Flexbox row-wrap
```

**Vantagem:** Compacto horizontal, bom em landscape  
**Desvantagem:** "Por que" desaparece completamente

---

## OPÇÃO 5: Meta como small subtitle + badges em vertical strip

```
┌─ HEADER ────────────────────────────────┐
│ Kadish do Enlutado                       │
│ Kadish Yatom · pequeno · recitado em pé  │ ← tudo em 1 linha de 11px
│ [Em pé] [Minyan 10] [Áudio]              │ ← badges em linha própria
│                                          │
│ ℹ︎ Por que dizemos...  [→]                │ ← info icon + link
└──────────────────────────────────────────┘

Altura: ~65px
Info icon leva a modal/página dedica
```

**Vantagem:** Sem perda de info; "por que" sempre acessível  
**Desvantagem:** Mais linhas

---

## OPÇÃO 6: Card compacto com abas (Tefilá v2 style)

```
┌─ HEADER ────────────────────────────────┐
│ Kadish do Enlutado   [?]                 │  ← title + info icon
├─ Yatom ├─ em pé ├─ minyan(10) ├─ áudio  │  ← inline pill tabs
│                                          │
│ [Clique no ℹ︎ para ver contexto]         │  ← status bar
└──────────────────────────────────────────┘

Altura: ~55px
Pills: 14px text, flex-wrap
```

**Vantagem:** Moderno, escalável para 4 nusachim + filters  
**Desvantagem:** Requer info icon; pode confundir UX

---

## OPÇÃO 7: Título grande (H1) + metadata como subtitle typography

```
┌─ HEADER ────────────────────────────────┐
│                                          │
│  Kadish do Enlutado                      │  ← 24px, negrito
│  Yatom · Em pé · Minyan · Áudio          │  ← 13px, cinza #666
│                                          │
└──────────────────────────────────────────┘

Altura: ~65px
Sem badges; sem contexto visível
```

**Vantagem:** Respiração visual; minimalista  
**Desvantagem:** Metadata lê como decoração

---

## OPÇÃO 8: Dropdown/select no header (Tefilá responsivo)

```
┌─ HEADER ────────────────────────────────┐
│ Kadish [Yatom ▼]   [ℹ︎]                  │  ← select dinâmico
│                                          │
│ Recitado em pé · Minyan 10 · Áudio       │  ← metadata mínima
└──────────────────────────────────────────┘

Altura: ~50px
Select expande 8 opções em modal (não inline)
```

**Vantagem:** Suporta 4 nusachim + 2 tipos sem reflow  
**Desvantagem:** Select em mobile requer cuidado

---

## OPÇÃO 9: Stripped cards — Yatom como badge de contexto

```
┌─ HEADER ────────────────────────────────┐
│ Kadish do Enlutado                       │
│ ┌──────────────────────────────────────┐ │
│ │ Yatom · Em pé · Minyan 10           │ │  ← info card
│ │ [▶︎ Áudio] [?Contexto]              │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘

Altura: ~70px
Card com padding; separa metadata do título
```

**Vantagem:** Visual hierarquizado; fácil de expandir para 4 nusachim  
**Desvantagem:** Mais elementos

---

## OPÇÃO 10: Hero mínimo — Título único + contexto em sheet

```
┌─ HEADER ────────────────────────────────┐
│ Kadish do Enlutado                       │
│ Yatom                                    │  ← apenas nusach/tipo
│                                          │
│ [? Detalhes]                             │  ← tudo sobre é um botão
└──────────────────────────────────────────┘

Altura: ~48px (mínima)

Clique em "Detalhes" → bottom sheet:
  • Por que dizemos
  • Estrutura (verso 1 de 14...)
  • Contexto litúrgico
  • Em pé? Minyan? Áudio?
```

**Vantagem:** Espaço máximo para oração; UI profissional  
**Desvantagem:** Contexto crítico fica oculto; requer 1 clique

---

## Matriz de Comparação

| Opção | Altura | "Por que" | Badges | Mobile | RTL-ready | Escalável |
|-------|--------|----------|--------|--------|-----------|-----------|
| 1     | 60px   | toggle   | 1 linha| ⭐⭐⭐ | ⭐⭐     | ⭐        |
| 2     | 70px   | não      | icons  | ⭐⭐   | ⭐⭐⭐   | ⭐⭐      |
| 3     | 50px   | collapse | 1 linha| ⭐⭐⭐ | ⭐⭐     | ⭐⭐      |
| 4     | 50px   | não      | inline | ⭐⭐   | ⭐        | ⭐⭐⭐   |
| 5     | 65px   | link     | 1 linha| ⭐⭐   | ⭐⭐⭐   | ⭐⭐      |
| 6     | 55px   | icon     | pills  | ⭐⭐⭐ | ⭐⭐     | ⭐⭐⭐   |
| 7     | 65px   | não      | não    | ⭐⭐⭐ | ⭐⭐⭐   | ⭐⭐      |
| 8     | 50px   | icon     | select | ⭐⭐⭐ | ⭐        | ⭐⭐⭐   |
| 9     | 70px   | card     | card   | ⭐⭐   | ⭐⭐⭐   | ⭐⭐⭐   |
| 10    | 48px   | sheet    | sheet  | ⭐⭐⭐ | ⭐⭐     | ⭐⭐      |

---

## Recomendação de caminhos

**Se contexto "por que" é crítico na primeira tela:**
- **→ Opção 5** (info icon + link sempre visível) ou **Opção 9** (card)

**Se o foco é máxima compactação:**
- **→ Opção 10** (hero mínimo + sheet) ou **Opção 3** (collapse)

**Se escalabilidade para 4 nusachim importa:**
- **→ Opção 8** (select no header) ou **Opção 6** (pills)

**Se é puramente estética/minimalista:**
- **→ Opção 7** (typography-only)

**Híbrida robusta (meu voto):**
- **→ Opção 1** (minimal stack) + Opção 10 (sheet) = 60px + bottom sheet oculta → máximo espaço, zero perda de contexto
