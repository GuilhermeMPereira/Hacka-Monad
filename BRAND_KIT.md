# MeritCoin — Brand Kit

> **Encontros Crypto, Contas Divididas**

---

## Paleta de Cores

### Primary — Gold/Amber (valor, mérito, calor)

| Token          | Hex       | Uso                                |
| -------------- | --------- | ---------------------------------- |
| Primary        | `#E8A317` | CTAs, badges, destaques principais |
| Primary Hover  | `#C4880D` | Estado hover de botões primários   |
| Primary Light  | `#F5C563` | Texto em badges, acentos leves     |

### Secondary — Violet (blockchain, tech, confiança)

| Token           | Hex       | Uso                              |
| --------------- | --------- | -------------------------------- |
| Secondary       | `#6C5CE7` | Botões secundários, acentos tech |
| Secondary Hover | `#5A4BD1` | Estado hover                     |
| Secondary Light | `#8B7EF0` | Acentos leves                    |

### Backgrounds

| Token       | Hex       | Uso                   |
| ----------- | --------- | --------------------- |
| BG Base     | `#121214` | Fundo da aplicação    |
| BG Surface  | `#1C1C22` | Cards e superfícies   |
| BG Elevated | `#26262E` | Elementos elevados    |

### Borders

| Token        | Hex       | Uso           |
| ------------ | --------- | ------------- |
| Border       | `#2E2E38` | Bordas padrão |
| Border Light | `#3A3A46` | Bordas hover  |

### Text

| Token          | Hex       | Uso                      |
| -------------- | --------- | ------------------------ |
| Text Primary   | `#F0EDE8` | Texto principal          |
| Text Secondary | `#9B9590` | Texto de apoio           |
| Text Muted     | `#5C5A65` | Texto discreto/disabled  |

### Semantic

| Token   | Hex       | Uso          |
| ------- | --------- | ------------ |
| Success | `#36D399` | Confirmações |
| Error   | `#F87272` | Erros        |
| Warning | `#FBBD23` | Alertas      |

---

## Gradiente Especial

**gradient-merit** — usado em elementos premium e destaques visuais.

```css
background: linear-gradient(135deg, #E8A317 0%, #6C5CE7 100%);
```

---

## Tipografia

| Tipo | Fonte              | Uso                                          |
| ---- | ------------------ | -------------------------------------------- |
| Sans | **Inter**          | Texto geral, headings, UI                    |
| Mono | **JetBrains Mono** | Valores numéricos, endereços, dados on-chain |

### Regras tipográficas

- Headings: `font-weight: 700`, `letter-spacing: -0.02em`
- Números/valores: `font-variant-numeric: tabular-nums`, `font-weight: 600`
- Font features: `"cv02", "cv03", "cv04", "cv11"`
- Font smoothing: antialiased

---

## Componentes

### Cards

- `border-radius: 12px`
- Borda: `#2E2E38`
- Fundo: `#1C1C22`
- Hover: borda `#3A3A46` + glow dourado `box-shadow: 0 0 20px rgba(232, 163, 23, 0.06)`

### Botões Primários

- Fundo: `#E8A317` → texto escuro `#121214`
- `border-radius: 8px`
- `padding: 0.625rem 1.25rem`
- Hover: `#C4880D`
- Active: `transform: scale(0.98)`

### Botões Secundários

- Fundo: transparente → borda e texto `#6C5CE7`
- Hover: `background: rgba(108, 92, 231, 0.08)`
- Active: `transform: scale(0.98)`

### Badge MeritCoin

- Pill shape: `border-radius: 9999px`
- Fundo: `rgba(232, 163, 23, 0.10)`
- Texto: `#F5C563`
- `font-weight: 600`, tabular-nums

---

## Efeitos Visuais

### Glow

| Nome        | Valor                                |
| ----------- | ------------------------------------ |
| Glow Gold   | `0 0 20px rgba(232, 163, 23, 0.10)` |
| Glow Violet | `0 0 20px rgba(108, 92, 231, 0.10)` |

### Noise Texture

Overlay SVG no `body::before` com `opacity: 0.025` — adiciona textura sutil que quebra o aspecto flat.

### Text Selection

```css
::selection {
  background: rgba(232, 163, 23, 0.25);
  color: #F0EDE8;
}
```

### Scrollbar

- Largura: `6px`
- Track: `#121214`
- Thumb: `#2E2E38`, hover `#3A3A46`
- `border-radius: 3px`

---

## Identidade

- **Tema**: Dark-only
- **Atmosfera**: Tons quentes (off-white, gold) sobre base escura fria
- **Idioma da UI**: Português (Brasil)
- **Conceito visual**: Minimalista, tipográfico, sem ícones pesados — foco em legibilidade e contraste sutil
