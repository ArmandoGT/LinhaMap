---
name: LinhaMap Agritech
colors:
  surface: '#fbf8ff'
  surface-dim: '#dad9e3'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fd'
  surface-container: '#eeedf7'
  surface-container-high: '#e8e7f1'
  surface-container-highest: '#e3e1ec'
  on-surface: '#1a1b22'
  on-surface-variant: '#3f4944'
  inverse-surface: '#2f3038'
  inverse-on-surface: '#f1effa'
  outline: '#6f7973'
  outline-variant: '#bec9c2'
  surface-tint: '#1b6b51'
  primary: '#004532'
  on-primary: '#ffffff'
  primary-container: '#065f46'
  on-primary-container: '#8bd6b7'
  inverse-primary: '#8bd6b6'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#652925'
  on-tertiary: '#ffffff'
  tertiary-container: '#823f3a'
  on-tertiary-container: '#ffb4ad'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a6f2d1'
  primary-fixed-dim: '#8bd6b6'
  on-primary-fixed: '#002116'
  on-primary-fixed-variant: '#00513b'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb3ac'
  on-tertiary-fixed: '#3b0908'
  on-tertiary-fixed-variant: '#73332f'
  background: '#fbf8ff'
  on-background: '#1a1b22'
  surface-variant: '#e3e1ec'
  risk-low: '#10b981'
  risk-medium: '#f59e0b'
  risk-high: '#f97316'
  risk-critical: '#ef4444'
  surface-muted: '#f4f4f5'
  border-refined: '#e4e4e7'
typography:
  headline-lg:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  column-gap: 20px
  section-padding: 40px
---

## Brand & Style

The design system is engineered for the high-stakes world of enterprise agriculture, where precision and reliability are paramount. The brand personality is **intelligent, predictive, and authoritative**, positioning the platform as a trusted advisor to farm managers and agronomists. 

The visual style is **Corporate / Modern**, emphasizing clarity, data density, and professional utility. It avoids unnecessary decoration in favor of structural integrity and functional elegance. The interface utilizes generous white space to allow complex datasets to breathe, while sharp, refined borders and a strict grid system reflect the precision of mapping and geolocation technologies. The goal is to evoke a sense of "technological stewardship"—bridging the gap between raw nature and data-driven optimization.

## Colors

The color palette is anchored by a **Deep Corporate Green**, symbolizing both the agricultural sector and a sense of established stability. This primary color is used for key actions, navigation states, and primary branding elements.

A specialized **Risk Palette** is central to the design system, used to categorize environmental data and operational threats. These colors must be used sparingly but consistently across KPI cards, status badges, and progress bars. 

The neutral palette utilizes a clean "Zinc" scale to maintain a professional, low-fatigue environment for long-term data analysis. The background is predominantly white, with subtle shifts to muted grays for card containers and secondary surfaces to establish visual hierarchy without heavy shadows.

## Typography

The design system exclusively utilizes **Geist**, a typeface designed for precision and technical clarity. Its geometric construction and clean terminals ensure maximum legibility when viewing dense tables or multi-digit KPI metrics.

Headlines use a tighter letter-spacing and heavier weights to command authority. Labels are frequently used in uppercase for metadata and status indicators, providing a clear distinction between interactive labels and static body text. Tabular figures (monospaced numbers) should be enabled within data tables to ensure columns of figures align vertically for quick scanning.

## Layout & Spacing

The layout follows a **12-column fixed-grid** model for desktop, optimizing for wide-screen data dashboards. A rigid 4px baseline grid governs all internal spacing to ensure mathematical consistency.

- **Desktop (1280px+):** 12 columns, 24px gutters, 32px side margins.
- **Tablet (768px - 1279px):** 8 columns, 20px gutters, 24px side margins.
- **Mobile (< 767px):** 4 columns, 16px gutters, 16px side margins.

Data tables and KPI grids use "tight" spacing presets to maximize information density while maintaining horizontal alignment. Cards are separated by standard gutters to create a clear modular feel, allowing for a "plug-and-play" dashboard architecture.

## Elevation & Depth

This design system uses a **Low-Contrast Outline** strategy combined with **Ambient Shadows** to define hierarchy. Depth is handled through three primary tiers:

1.  **Base Layer:** The application background (#FFFFFF), used for the canvas.
2.  **Surface Tier:** Cards and interactive containers use a subtle 1px border (#E4E4E7) and a low-opacity, wide-dispersion shadow (4% opacity black) to create a "lifted" effect without heavy visual weight.
3.  **Overlay Tier:** Modals and dropdown menus use a slightly more pronounced shadow and a backdrop blur to focus the user's attention on the active task.

Depth should never feel decorative; it is a tool used strictly to distinguish content containers from the primary canvas.

## Shapes

The shape language is **Soft (Level 1)**, featuring 4px (0.25rem) corner radii for standard elements like buttons and input fields. This slight rounding softens the technical nature of the data without sacrificing the professional "sharpness" required by the brand personality.

- **KPI Cards:** Use 8px (0.5rem) roundedness to subtly distinguish them as primary data modules.
- **Status Badges:** Use a full pill-shape (999px) to contrast against the rectangular grid of the tables and cards.
- **Interactive Elements:** Buttons and form inputs maintain the strict 4px radius for a disciplined, industrial look.

## Components

### Fixed Navbar
The primary navigation is fixed to the top of the viewport, featuring a white surface with a bottom border refined by a 1px stroke. It contains the brand mark, global search, and system-level alerts.

### KPI Cards
Standardized modules for high-level metrics. They include a `label-sm` title, a `headline-md` value, and a small sparkline or status badge indicating the risk level (Low to Critical).

### Interactive Data Tables
The core of the system. Tables feature sticky headers, row hover states in `surface-muted`, and risk-colored indicators in the left-most column margin. Cell padding is kept compact.

### Progress Bars
Used for soil moisture, crop health, or task completion. They use a light gray track and a solid fill using the Risk Palette colors to indicate health at a glance.

### Status Badges
Small, high-contrast indicators. They use semi-transparent backgrounds of the Risk Palette colors with solid text of the same hue to ensure legibility while remaining unobtrusive within tables.

### Input Fields
Strictly rectangular with a 4px radius. They use the `border-refined` color for the default state and the `primary-color` (Deep Green) for the active focus state, accompanied by a subtle glow.