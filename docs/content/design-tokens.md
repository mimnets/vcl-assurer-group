# Design tokens and brand swap guide

| | |
|---|---|
| **Task** | m1-020 (CA-4 scaffolding) |
| **Date** | 2026-10-31 |
| **Status** | **Placeholder values.** The token slots are in place; every value is a neutral stand-in until the owner supplies the brand assets (D-CONTENT-12). Nothing here is the Assurer brand. |
| **Source** | `modules/asset/ui/src/scss/_tokens.scss` |
| **Related** | [Editorial and design requirements](./editorial-and-design-requirements.md) §4–§7 · [Implementation plan](./implementation-plan-and-risks.md) (CA-4) |

## 1. How the theme is set up

- All colour, type, spacing and shape values live in `_tokens.scss` as CSS custom properties on
  `:root`. Project styles (`_assurer.scss`, `_corporate.scss`, `_sections.scss`, `_type.scss`,
  `_layout.scss`) use only these properties. Two exceptions stay literal on purpose: the gallery
  lightbox (a dark media viewer) and the slideshow caption gradient (text over photographs).
- Breakpoints are Sass variables (`$bp-tablet: 768px`, `$bp-desktop: 1024px`), because media
  queries cannot read custom properties.
- The site name or logo is drawn in one place: `BrandMark` in `views/layout.jsx`.
- Starter-kit leftovers not routed through tokens: `$color-*` in `_settings.scss`, used only by
  the unused `.bp-button` class in `_type.scss`.

## 2. Swapping in the brand (when D-CONTENT-12 is supplied)

| Supplied asset | Change | Token or file |
|---|---|---|
| Primary colour | Header text, hero background, stats values, skip link | `--assurer-color-primary`, `--assurer-color-on-primary`, `--assurer-overlay-dark` and `--assurer-shadow-raised` (both use the primary's RGB) |
| Accent colour | Buttons, card links, badges, focus ring | `--assurer-color-accent`, `--assurer-color-on-accent`, `--assurer-color-focus` |
| Neutrals | Text, muted text, surfaces, borders | `--assurer-color-text`, `-text-muted`, `-surface`, `-surface-alt`, `-border`, `-border-subtle`, `-border-strong` |
| Link colours | Links in content | `--assurer-color-link`, `--assurer-color-link-visited` |
| Body font (self-hosted files) | Add `@font-face` with files under the asset module, set the stack | `--assurer-font-body`. **Global Styles also sets the body font** (D-M0-11), and its saved value wins over the token; set it to the brand stack there or remove that control |
| Heading font | Define the token (headings inherit the body font until then) | `--assurer-font-heading` |
| Vector logo | Replace the text in `BrandMark` with the SVG; keep the link to `/` and an accessible name | `views/layout.jsx` |
| Favicon | Not yet scaffolded | Later CA-4 step |

After any swap, re-check every pair in §3 and update the table.

## 3. Contrast of the placeholder palette (WCAG 2.2 AA)

Computed by the agent on 2026-10-31 (relative luminance formula). Text needs 4.5:1; large text
and UI components need 3:1.

| Pair | Ratio | Result |
|---|---|---|
| Text `#1d2733` on surface `#fff` | 15.11 | PASS |
| Text on surface-alt `#eef4ed` | 13.52 | PASS |
| Primary `#0b2545` on surface | 15.39 | PASS |
| White on primary (hero, skip link) | 15.39 | PASS |
| Accent `#1c7080` on surface (card links, outline button) | 5.71 | PASS |
| White on accent (primary button, submit) | 5.71 | PASS |
| Accent on surface-alt (card badge) | 5.11 | PASS |
| Muted text `#4a525c` on surface (footer, breadcrumbs) | 7.92 | PASS |
| Link `#6236ff` on surface | 6.02 | PASS |
| Visited link `#6a3fd8` on surface | 6.33 | PASS |
| Danger `#b02a37` on surface (form errors) | 6.50 | PASS |
| Notice text `#664d03` on notice `#fff3cd` | 7.21 | PASS |
| Focus ring (accent) on surface | 5.71 | PASS (3:1) |
| Strong border `#6b7785` on surface (form fields, Menu button, slideshow dots) | 4.56 | PASS (3:1) |

Values changed in m1-020 to pass: accent `#1f7a8c` → `#1c7080` (the badge was 4.45:1), visited
link `#8264f1` → `#6a3fd8` (4.16:1), form-field border `#b8c2cc` → `#6b7785` (1.81:1), Menu
button and slideshow dot `#c3cdd6` → `#6b7785` (1.61:1). The footer uses the muted text colour
instead of `opacity: 0.8`. These are placeholder values, so the contrast must be checked again
with the brand palette.

## 4. Type and spacing scale

- Headings: modular scale 1.25 in `em`, so they follow the body size that Global Styles sets
  per breakpoint. H1 2.441, H2 1.953, H3 1.563, H4 1.25, small 0.875.
- Spacing: 4 px base, `--assurer-space-1` … `-8` = 4, 8, 12, 16, 24, 32, 48, 64 px. The gap
  between sections is `--assurer-space-section` (48 px). Other paddings are still literal
  pixel values; move them onto the scale when the brand layout is set.
