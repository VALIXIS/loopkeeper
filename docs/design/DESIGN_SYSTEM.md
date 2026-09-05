# LoopKeeper Design System & Token Architecture

## Executive Overview
The **LoopKeeper Design System** provides a unified design language, semantic token specification, and reusable component guide for both the React (Web) and Flutter (Mobile) client applications.

LoopKeeper is designed to feel like a serious, enterprise-grade AI productivity platform. Its aesthetic draws inspiration from high-precision tools such as **Linear**, **Stripe Dashboard**, and **Vercel**, prioritizing data clarity, structural hierarchy, subtle AI affordances, and zero visual clutter.

---

## 1. Visual Direction & Aesthetic Principles

### Core Aesthetic Pillars
1. **High Signal-to-Noise Ratio**: Dense, highly legible interfaces with explicit visual hierarchy. Content and data take precedence over decorative containers.
2. **Subtle AI Language**: Avoid glowing rainbow gradients or distracting animated sparkle effects. AI features are signified using a refined indigo/violet accent (`#6366F1`), crisp micro-badges, and explicit confidence percentages.
3. **Enterprise Precision**: Deep slate backgrounds, subtle 1px border dividers (`#1E293B`), monospace numbers for dates/percentages, and high contrast status indicators.
4. **Purposeful Motion**: Functional micro-interactions only (150ms - 200ms ease-out transitions). No heavy scroll-driven animations or gimmicky loading effects.

### Explicit Design Anti-Patterns (Strictly Prohibited)
- ❌ **NO Generic Bootstrap Appearance**: Avoid default blue primary buttons, bulky rounded corners, and basic card shadows.
- ❌ **NO Excessive Gradients**: No full-page gradient fills or multi-color glowing borders.
- ❌ **NO Heavy Glassmorphism**: Avoid blurry backdrop filters that compromise contrast or performance.
- ❌ **NO Childish Visuals**: No cartoon avatars, playful illustrations, or informal iconography.
- ❌ **NO Clutter**: No duplicate navigation bars or redundant metric cards.

---

## 2. Design Tokens Specification

### 2.1 Color Palette & Semantic Tokens

LoopKeeper features a dark-first color system optimized for high contrast, extended screen usage, and status clarity.

#### Dark Mode Palette (Default)
```json
{
  "bg": {
    "app": "#090D16",
    "surface": "#0F172A",
    "surface-hover": "#1E293B",
    "surface-active": "#334155",
    "overlay": "rgba(15, 23, 42, 0.85)"
  },
  "border": {
    "subtle": "#1E293B",
    "default": "#334155",
    "focus": "#6366F1",
    "error": "#EF4444"
  },
  "text": {
    "primary": "#F8FAFC",
    "secondary": "#94A3B8",
    "tertiary": "#64748B",
    "disabled": "#475569",
    "inverse": "#0F172A"
  },
  "brand": {
    "primary": "#6366F1",
    "primary-hover": "#4F46E5",
    "accent": "#818CF8",
    "subtle": "rgba(99, 102, 241, 0.12)"
  },
  "status": {
    "pending": {
      "text": "#FBBF24",
      "bg": "rgba(245, 158, 11, 0.12)",
      "border": "rgba(245, 158, 11, 0.3)"
    },
    "done": {
      "text": "#34D399",
      "bg": "rgba(16, 185, 129, 0.12)",
      "border": "rgba(16, 185, 129, 0.3)"
    },
    "overdue": {
      "text": "#F87171",
      "bg": "rgba(239, 68, 68, 0.12)",
      "border": "rgba(239, 68, 68, 0.3)"
    },
    "cancelled": {
      "text": "#94A3B8",
      "bg": "rgba(100, 116, 139, 0.12)",
      "border": "rgba(100, 116, 139, 0.3)"
    }
  },
  "ai": {
    "badge-bg": "rgba(99, 102, 241, 0.15)",
    "badge-text": "#A5B4FC",
    "glow": "0 0 16px rgba(99, 102, 241, 0.25)"
  }
}
```

#### Light Mode Palette (Secondary Fallback)
```json
{
  "bg": {
    "app": "#F8FAFC",
    "surface": "#FFFFFF",
    "surface-hover": "#F1F5F9",
    "surface-active": "#E2E8F0",
    "overlay": "rgba(255, 255, 255, 0.85)"
  },
  "border": {
    "subtle": "#E2E8F0",
    "default": "#CBD5E1",
    "focus": "#4F46E5",
    "error": "#DC2626"
  },
  "text": {
    "primary": "#0F172A",
    "secondary": "#475569",
    "tertiary": "#64748B",
    "disabled": "#94A3B8",
    "inverse": "#FFFFFF"
  }
}
```

---

### 2.2 Typography Scale

LoopKeeper utilizes **Inter** (or SF Pro / System Sans-Serif) for UI elements and **JetBrains Mono** (or Fira Code) for IDs, timestamps, and confidence telemetry.

| Scale Token | Font Size | Line Height | Weight | Letter Spacing | Target Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-1` | 32px (`2rem`) | 40px | 700 (Bold) | `-0.02em` | Main Screen Page Titles |
| `heading-1` | 24px (`1.5rem`) | 32px | 600 (SemiBold)| `-0.01em` | Section Headers, Modal Titles |
| `heading-2` | 20px (`1.25rem`)| 28px | 600 (SemiBold)| `0` | Card Titles, Sub-sections |
| `body-large` | 16px (`1rem`) | 24px | 400 (Regular) | `0` | Primary Body Text, Transcripts |
| `body-default`| 14px (`0.875rem`)| 20px | 400 / 500 | `0` | Table Cells, Inputs, Buttons |
| `body-small` | 12px (`0.75rem`)| 16px | 400 / 500 | `+0.01em` | Tooltips, Secondary Metadata |
| `mono-code` | 13px (`0.8125rem`)| 18px | 400 (Mono) | `0` | UUIDs, Similarity Scores, Log lines |

---

### 2.3 Spacing Scale & Grid Layout

Spacing follows a strict 4px / 8px scale:

```css
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
--space-5: 20px;  --space-6: 24px;  --space-8: 32px;  --space-10: 40px;
--space-12: 48px; --space-16: 64px;
```

#### Layout Container Max-Widths
- Web Dashboard: `max-w-7xl` (1280px) centered.
- Split-Pane Reader: `380px` left panel + fluid right panel.
- Modal Dialogs: `540px` max-width.
- Mobile Viewport: 100% fluid with `16px` padding bounds.

---

## 3. Reusable Component System Specifications

---

### 3.1 Cards
- **Standard Card**:
  - Background: `var(--bg-surface)` (`#0F172A`).
  - Border: 1px solid `var(--border-subtle)` (`#1E293B`).
  - Border Radius: `8px` (`rounded-lg`).
  - Padding: `20px`.
  - Hover: Border transitions to `#334155` over 150ms.
- **AI Metric Counter Card**:
  - Contains large numeric readout (32px bold mono), subtle trend percentage chip (+4% this week), and upper label in secondary gray (`#94A3B8`).

---

### 3.2 Buttons

| Variant | Background | Text Color | Border | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | `#6366F1` | `#FFFFFF` | None | Primary screen action (e.g. Upload Transcript) |
| **Secondary** | `#1E293B` | `#F8FAFC` | 1px solid `#334155` | Secondary actions (e.g. Cancel, Filter) |
| **Ghost** | Transparent | `#94A3B8` | None | Header icons, table row actions |
| **Destructive** | `#EF4444` | `#FFFFFF` | None | Delete, Cancel meeting |
| **AI Action** | `#4F46E5` | `#FFFFFF` | 1px solid `#818CF8` | Triggers AI pipeline (features sparkle icon) |

- **Button Heights**: Large (44px), Medium (36px), Small (28px).
- **Focus Ring**: `2px solid #6366F1`, `2px offset #090D16`.

---

### 3.3 Inputs & Controls
- **Text & Select Inputs**:
  - Height: `40px`.
  - Background: `#090D16`.
  - Border: `1px solid #334155`.
  - Border Radius: `6px`.
  - Focus State: Border shifts to `#6366F1` with an inner glow `0 0 0 1px #6366F1`.
- **Search Bar**:
  - Includes prefix magnifier icon (`#64748B`) and keyboard shortcut badge (`Cmd+K`).

---

### 3.4 Data Tables
- **Header**:
  - Background: `#0F172A`.
  - Text: 12px uppercase semi-bold (`#64748B`), letter-spacing `+0.05em`.
  - Border Bottom: `1px solid #1E293B`.
- **Rows**:
  - Height: `52px` minimum.
  - Border Bottom: `1px solid #1E293B`.
  - Hover State: Background transitions to `#1E293B`.
- **Cell Alignment**: Text left-aligned; status pills left-aligned; numbers & actions right-aligned.

---

### 3.5 Status Pills & Badges

```html
<!-- Pending Status Pill -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
  <span class="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-400"></span>
  Pending
</span>

<!-- Overdue Status Pill -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
  <span class="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-400"></span>
  Overdue
</span>

<!-- Postponed Counter Badge -->
<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-rose-950 text-rose-300 border border-rose-800">
  2x Postponed
</span>
```

---

### 3.6 Charts & Data Visualizations
- **Color Palette for Charts**:
  - Primary Series: `#6366F1` (Indigo).
  - Secondary Series: `#38BDF8` (Sky Blue).
  - Alert Series: `#F87171` (Rose).
  - Success Series: `#34D399` (Emerald).
- **Grid Lines**: Soft gray dashed lines (`#1E293B`).
- **Tooltips**: Dark floating container (`#0F172A`) with 1px border (`#334155`) and crisp mono text values.

---

### 3.7 Navigation Components
- **Web Navigation Sidebar**:
  - Active Item: Background `#1E293B`, Left indicator bar `3px solid #6366F1`, Icon/Text color `#F8FAFC`.
  - Inactive Item: Text color `#94A3B8`, Hover background `#0F172A`.
- **Mobile Bottom Bar**:
  - Height: `64px`.
  - Active Tab: Icon & text tinted `#6366F1`.
  - Inactive Tab: Icon & text tinted `#64748B`.

---

### 3.8 Modals & Slide-Over Drawers
- **Modal Dialog**:
  - Centered backdrop overlay `rgba(15, 23, 42, 0.80)` with subtle `blur(4px)`.
  - Modal Box: `#0F172A`, 1px border `#334155`, rounded `12px`, shadow `0 20px 25px -5px rgba(0, 0, 0, 0.5)`.
- **Slide-Over Drawer**:
  - Slides in from right screen border (480px width) for inspect action item details.

---

### 3.9 Alerts & Notification Banners
- **Banner System**:
  - **Info**: Background `rgba(99, 102, 241, 0.1)`, Border `#6366F1`, Icon Blue.
  - **Warning / Postponement**: Background `rgba(245, 158, 11, 0.1)`, Border `#F59E0B`, Icon Amber.
  - **Error / Overdue**: Background `rgba(239, 68, 68, 0.1)`, Border `#EF4444`, Icon Red.

---

### 3.10 Loading & Empty States
- **Skeleton Loaders**:
  - Pulsing background shimmer shifting between `#0F172A` and `#1E293B` (animation duration 1.5s).
- **Empty States**:
  - Centered icon container with subtle indigo ring background (`rgba(99, 102, 241, 0.1)`).
  - Headline: 16px semi-bold (`#F8FAFC`).
  - Description: 14px regular (`#94A3B8`).
  - Call-to-Action button.

---

## 4. Responsive Breakpoints

| Breakpoint Token | Min Width | Target Viewport | Key Layout Behavior |
| :--- | :--- | :--- | :--- |
| `sm` | 640px | Mobile Phones (Landscape) | Single column layout, full-width buttons. |
| `md` | 768px | Tablets (Portrait) | Sidebar collapses to icon rail, 2-column grids. |
| `lg` | 1024px | Tablets (Landscape) / Laptops | Full navigation sidebar, 3-column metric grid. |
| `xl` | 1280px | Desktops | Max container width constraint, split-pane active. |
| `2xl` | 1536px | Large Monitors | Expanded data table views. |

---

## 5. Developer Token Export Formats

### Tailwind CSS Configuration (`tailwind.config.js` snippet)
```javascript
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          app: '#090D16',
          surface: '#0F172A',
          hover: '#1E293B',
        },
        border: {
          subtle: '#1E293B',
          default: '#334155',
        },
        brand: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
        }
      }
    }
  }
}
```

### Flutter Theme Token Extension (`app_theme.dart` snippet)
```dart
import 'package:flutter/material.dart';

class LoopKeeperColors {
  static const bgApp = Color(0xFF090D16);
  static const bgSurface = Color(0xFF0F172A);
  static const bgHover = Color(0xFF1E293B);
  static const borderSubtle = Color(0xFF1E293B);
  static const brandPrimary = Color(0xFF6366F1);
  static const statusOverdue = Color(0xFFF87171);
  static const statusDone = Color(0xFF34D399);
  static const statusPending = Color(0xFFFBBF24);
}
```
